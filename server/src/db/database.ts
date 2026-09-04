import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { User, PracticeSession, Mistake, ProgressSummary } from '../services/types.js';

const { Pool } = pg;

export class DatabaseService {
  private pgPool: pg.Pool | null = null;
  private isPostgres = false;
  private localDbPath: string;
  private localData: {
    users: User[];
    practice_sessions: PracticeSession[];
    mistakes: Mistake[];
  } = { users: [], practice_sessions: [], mistakes: [] };

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localDbPath = path.join(dataDir, 'linguavoice_db.json');
  }

  async init(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL?.trim();

    if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
      try {
        this.pgPool = new Pool({
          connectionString: dbUrl,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });

        // Test connection
        const client = await this.pgPool.connect();
        console.log(' Successfully connected to PostgreSQL database.');
        
        // Execute schema
        const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          await client.query(schemaSql);
          console.log(' PostgreSQL schema verified/initialized.');
        }
        client.release();
        this.isPostgres = true;
        return;
      } catch (err) {
        console.warn('⚠️ Could not connect to PostgreSQL. Falling back to persistent local storage.', err);
        this.pgPool = null;
        this.isPostgres = false;
      }
    }

    // Local fallback
    this.isPostgres = false;
    if (fs.existsSync(this.localDbPath)) {
      try {
        const raw = fs.readFileSync(this.localDbPath, 'utf8');
        this.localData = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to read local DB, initializing clean storage.', e);
        this.saveLocal();
      }
    } else {
      this.saveLocal();
    }
    console.log(` Persistent local storage ready at: ${this.localDbPath}`);
  }

  private saveLocal(): void {
    fs.writeFileSync(this.localDbPath, JSON.stringify(this.localData, null, 2), 'utf8');
  }

  // --- Users ---
  async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.isPostgres && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail]);
      return res.rows[0] || null;
    }
    const user = this.localData.users.find(u => u.email.toLowerCase() === normalizedEmail);
    return user || null;
  }

  async findUserById(id: string): Promise<User | null> {
    if (this.isPostgres && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      return res.rows[0] || null;
    }
    const user = this.localData.users.find(u => u.id === id);
    return user || null;
  }

  async createUser(user: User): Promise<User> {
    if (this.isPostgres && this.pgPool) {
      const query = `
        INSERT INTO users (id, name, email, password_hash, target_language, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [user.id, user.name, user.email.toLowerCase().trim(), user.password_hash, user.target_language || 'Spanish', user.created_at];
      const res = await this.pgPool.query(query, values);
      return res.rows[0];
    }
    this.localData.users.push(user);
    this.saveLocal();
    return user;
  }

  async updateUserLanguage(userId: string, targetLanguage: string): Promise<void> {
    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query('UPDATE users SET target_language = $1 WHERE id = $2', [targetLanguage, userId]);
      return;
    }
    const user = this.localData.users.find(u => u.id === userId);
    if (user) {
      user.target_language = targetLanguage;
      this.saveLocal();
    }
  }

  // --- Practice Sessions ---
  async createPracticeSession(session: PracticeSession, mistakes: Mistake[]): Promise<PracticeSession> {
    if (this.isPostgres && this.pgPool) {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');
        const sessionQuery = `
          INSERT INTO practice_sessions (
            id, user_id, target_language, audio_url, transcription,
            corrected_sentence, natural_sentence, grammar_score,
            vocabulary_score, naturalness_score, feedback, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *;
        `;
        const sessionValues = [
          session.id,
          session.user_id,
          session.target_language,
          session.audio_url || null,
          session.transcription,
          session.corrected_sentence,
          session.natural_sentence,
          session.grammar_score,
          session.vocabulary_score,
          session.naturalness_score,
          session.feedback,
          session.created_at
        ];
        const sessionRes = await client.query(sessionQuery, sessionValues);

        for (const m of mistakes) {
          const mistakeQuery = `
            INSERT INTO mistakes (id, session_id, mistake_type, original_text, corrected_text, explanation)
            VALUES ($1, $2, $3, $4, $5, $6);
          `;
          await client.query(mistakeQuery, [m.id, session.id, m.mistake_type, m.original_text, m.corrected_text, m.explanation]);
        }

        await client.query('COMMIT');
        const savedSession = sessionRes.rows[0];
        savedSession.mistakes = mistakes;
        return savedSession;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    session.mistakes = mistakes;
    this.localData.practice_sessions.unshift(session);
    for (const m of mistakes) {
      this.localData.mistakes.push({ ...m, session_id: session.id });
    }
    this.saveLocal();
    return session;
  }

  async getSessionsByUserId(userId: string): Promise<PracticeSession[]> {
    if (this.isPostgres && this.pgPool) {
      const sessionsRes = await this.pgPool.query(
        'SELECT * FROM practice_sessions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      const sessions: PracticeSession[] = sessionsRes.rows;

      for (const s of sessions) {
        const mistakesRes = await this.pgPool.query(
          'SELECT * FROM mistakes WHERE session_id = $1',
          [s.id]
        );
        s.mistakes = mistakesRes.rows;
      }
      return sessions;
    }

    const userSessions = this.localData.practice_sessions
      .filter(s => s.user_id === userId)
      .map(s => ({
        ...s,
        mistakes: this.localData.mistakes.filter(m => m.session_id === s.id)
      }));

    return userSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Progress Aggregates ---
  async getProgressByUserId(userId: string): Promise<ProgressSummary> {
    const sessions = await this.getSessionsByUserId(userId);

    if (sessions.length === 0) {
      return {
        total_sessions: 0,
        sentences_practiced: 0,
        average_grammar_score: 0,
        average_vocabulary_score: 0,
        average_naturalness_score: 0,
        streak_days: 0,
        common_mistakes: [],
        score_trends: [],
        sessions_per_week: []
      };
    }

    const totalSessions = sessions.length;
    const totalGrammar = sessions.reduce((acc, s) => acc + (s.grammar_score || 0), 0);
    const totalVocab = sessions.reduce((acc, s) => acc + (s.vocabulary_score || 0), 0);
    const totalNaturalness = sessions.reduce((acc, s) => acc + (s.naturalness_score || 0), 0);

    // Mistake count map
    const mistakeMap: { [key: string]: number } = {};
    for (const s of sessions) {
      if (s.mistakes) {
        for (const m of s.mistakes) {
          const type = m.mistake_type || 'General';
          mistakeMap[type] = (mistakeMap[type] || 0) + 1;
        }
      }
    }

    const commonMistakes = Object.entries(mistakeMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate learning streak
    const sessionDates = Array.from(new Set(
      sessions.map(s => new Date(s.created_at).toISOString().split('T')[0])
    )).sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sessionDates.length > 0 && (sessionDates[0] === today || sessionDates[0] === yesterday)) {
      streak = 1;
      let checkDate = new Date(sessionDates[0]);
      for (let i = 1; i < sessionDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expected = checkDate.toISOString().split('T')[0];
        if (sessionDates[i] === expected) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Score trends (chronological)
    const sortedChronological = [...sessions].reverse();
    const scoreTrends = sortedChronological.slice(-10).map(s => ({
      date: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      grammar_score: s.grammar_score,
      vocabulary_score: s.vocabulary_score,
      naturalness_score: s.naturalness_score
    }));

    // Weekly session grouping
    const weeklyMap: { [key: string]: number } = {};
    for (const s of sortedChronological) {
      const d = new Date(s.created_at);
      const weekLabel = `Wk ${Math.ceil(d.getDate() / 7)} (${d.toLocaleDateString(undefined, { month: 'short' })})`;
      weeklyMap[weekLabel] = (weeklyMap[weekLabel] || 0) + 1;
    }

    const sessionsPerWeek = Object.entries(weeklyMap).map(([week, count]) => ({
      week,
      count
    }));

    return {
      total_sessions: totalSessions,
      sentences_practiced: totalSessions,
      average_grammar_score: Math.round(totalGrammar / totalSessions),
      average_vocabulary_score: Math.round(totalVocab / totalSessions),
      average_naturalness_score: Math.round(totalNaturalness / totalSessions),
      streak_days: streak || 1,
      common_mistakes: commonMistakes,
      score_trends: scoreTrends,
      sessions_per_week: sessionsPerWeek
    };
  }

  isUsingPostgres(): boolean {
    return this.isPostgres;
  }
}

export const db = new DatabaseService();
