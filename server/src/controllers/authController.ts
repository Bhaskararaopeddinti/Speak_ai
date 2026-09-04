import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'linguavoice_super_secret_jwt_key_2026';

function generateId(): string {
  return randomUUID();
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, target_language } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({
      id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      target_language: target_language || 'Spanish',
      created_at: new Date().toISOString(),
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        target_language: newUser.target_language,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        target_language: user.target_language || 'Spanish',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        target_language: user.target_language || 'Spanish',
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { target_language } = req.body;
    if (!target_language) {
      res.status(400).json({ error: 'Target language is required' });
      return;
    }

    await db.updateUserLanguage(req.user.id, target_language);
    res.json({ message: 'Language updated successfully', target_language });
  } catch (error: any) {
    console.error('Update language error:', error);
    res.status(500).json({ error: 'Failed to update target language' });
  }
};

export const demoLogin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const demoEmail = 'demo@linguavoice.ai';
    let user = await db.findUserByEmail(demoEmail);

    if (!user) {
      const password_hash = await bcrypt.hash('demo123456', 10);
      user = await db.createUser({
        id: 'demo-user-default',
        name: 'Alex Rivera',
        email: demoEmail,
        password_hash,
        target_language: 'Spanish',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      });

      // Seed realistic initial sessions so charts & common mistakes look vibrant immediately
      const sampleSessions = [
        {
          id: 'demo-session-1',
          user_id: user.id,
          target_language: 'Spanish',
          transcription: 'Ayer yo he fue a la tienda comprar manzanas.',
          corrected_sentence: 'Ayer fui a la tienda a comprar manzanas.',
          natural_sentence: 'Ayer fui a la tienda a comprar unas manzanas.',
          grammar_score: 72,
          vocabulary_score: 86,
          naturalness_score: 78,
          feedback: 'Gran trabajo comunicando la idea. En español, usa el pretérito indefinido "fui" cuando indiques "ayer".',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          mistakes: [
            {
              id: 'demo-m-1',
              mistake_type: 'Past Tense',
              original_text: 'he fue',
              corrected_text: 'fui',
              explanation: 'Usa el pretérito simple "fui" en lugar de mezclar haber y fue con "ayer".'
            },
            {
              id: 'demo-m-2',
              mistake_type: 'Prepositions',
              original_text: 'tienda comprar',
              corrected_text: 'tienda a comprar',
              explanation: 'Se requiere la preposición "a" antes del infinitivo que expresa propósito.'
            }
          ]
        },
        {
          id: 'demo-session-2',
          user_id: user.id,
          target_language: 'Spanish',
          transcription: 'Yo querer ir al supermercado ayer pero no tuve tiempo.',
          corrected_sentence: 'Yo quise ir al supermercado ayer pero no tuve tiempo.',
          natural_sentence: 'Ayer quise ir al supermercado, pero no tuve tiempo.',
          grammar_score: 78,
          vocabulary_score: 88,
          naturalness_score: 82,
          feedback: '¡Buen intento! Recuerda conjugar los verbos en pasado para que coincidan con "ayer".',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          mistakes: [
            {
              id: 'demo-m-3',
              mistake_type: 'Past Tense',
              original_text: 'yo querer',
              corrected_text: 'yo quise',
              explanation: 'El verbo querer debe conjugarse en pretérito perfecto simple.'
            }
          ]
        },
        {
          id: 'demo-session-3',
          user_id: user.id,
          target_language: 'Spanish',
          transcription: 'Me gusta mucho los libros de historia y yo leo cada noche.',
          corrected_sentence: 'Me gustan mucho los libros de historia y leo cada noche.',
          natural_sentence: 'Me encantan los libros de historia y suelo leerlos todas las noches.',
          grammar_score: 88,
          vocabulary_score: 92,
          naturalness_score: 89,
          feedback: 'Excelente fluidez. Solo un pequeño ajuste en la concordancia del verbo gustar con el sujeto plural.',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          mistakes: [
            {
              id: 'demo-m-4',
              mistake_type: 'Subject-Verb Agreement',
              original_text: 'Me gusta mucho los libros',
              corrected_text: 'Me gustan mucho los libros',
              explanation: 'Dado que "los libros" es plural, el verbo debe ser "gustan".'
            },
            {
              id: 'demo-m-5',
              mistake_type: 'Word Choice',
              original_text: 'cada noche',
              corrected_text: 'todas las noches',
              explanation: '"Todas las noches" es más idiomático y frecuente en español natural.'
            }
          ]
        }
      ];

      for (const s of sampleSessions) {
        await db.createPracticeSession(s as any, s.mistakes as any);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        target_language: user.target_language || 'Spanish',
      },
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Server error during demo login' });
  }
};
