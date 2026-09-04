import { Response } from 'express';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { PracticeSession, Mistake } from '../services/types.js';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export const saveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required to save session' });
      return;
    }

    const {
      target_language,
      audio_url,
      transcription,
      corrected_sentence,
      natural_sentence,
      grammar_score,
      vocabulary_score,
      naturalness_score,
      feedback,
      mistakes,
    } = req.body;

    if (!transcription || !corrected_sentence) {
      res.status(400).json({ error: 'Missing required session parameters' });
      return;
    }

    const sessionId = generateId();
    const sessionRecord: PracticeSession = {
      id: sessionId,
      user_id: req.user.id,
      target_language: target_language || 'Spanish',
      audio_url: audio_url || undefined,
      transcription,
      corrected_sentence,
      natural_sentence: natural_sentence || corrected_sentence,
      grammar_score: Number(grammar_score) || 80,
      vocabulary_score: Number(vocabulary_score) || 80,
      naturalness_score: Number(naturalness_score) || 80,
      feedback: feedback || '',
      created_at: new Date().toISOString(),
    };

    const mistakeRecords: Mistake[] = Array.isArray(mistakes)
      ? mistakes.map((m: any) => ({
          id: generateId(),
          session_id: sessionId,
          mistake_type: m.type || m.mistake_type || 'General',
          original_text: m.original || m.original_text || '',
          corrected_text: m.correction || m.corrected_text || '',
          explanation: m.explanation || '',
        }))
      : [];

    const saved = await db.createPracticeSession(sessionRecord, mistakeRecords);
    res.status(201).json({
      message: 'Practice session saved successfully',
      session: saved,
    });
  } catch (error: any) {
    console.error('Save session error:', error);
    res.status(500).json({ error: 'Failed to save practice session' });
  }
};

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const sessions = await db.getSessionsByUserId(req.user.id);
    res.json({ sessions });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve practice sessions' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const progress = await db.getProgressByUserId(req.user.id);
    res.json({ progress });
  } catch (error: any) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to retrieve learning progress' });
  }
};
