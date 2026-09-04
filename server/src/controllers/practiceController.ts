import { Request, Response } from 'express';
import { sttService } from '../services/sttService.js';
import { llmService } from '../services/llmService.js';
import { ttsService } from '../services/ttsService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const speechToText = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file uploaded' });
      return;
    }

    const language = req.body.language || req.body.target_language || 'Spanish';
    console.log(`🎙️ Received audio upload: ${req.file.path} (${req.file.size} bytes) for language: ${language}`);

    const transcription = await sttService.transcribe(req.file.path, language);
    const audioUrl = `/uploads/audio/${req.file.filename}`;

    res.json({
      transcription,
      audio_url: audioUrl,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
    });
  } catch (error: any) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Failed to process speech-to-text' });
  }
};

export const analyzeSentence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcription, target_language } = req.body;

    if (!transcription || typeof transcription !== 'string' || transcription.trim().length === 0) {
      res.status(400).json({ error: 'Transcription text is required for analysis' });
      return;
    }

    const language = target_language || 'Spanish';
    console.log(`🔍 Linguistic analysis requested for language "${language}": "${transcription}"`);

    const analysis = await llmService.analyze(transcription.trim(), language);
    res.json(analysis);
  } catch (error: any) {
    console.error('Linguistic analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze sentence' });
  }
};

export const textToSpeech = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, target_language, voice } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required for speech synthesis' });
      return;
    }

    console.log(`🔊 Synthesizing speech for: "${text.slice(0, 60)}" (voice: ${voice || 'alloy'})`);

    const audioBuffer = await ttsService.synthesize(text.trim(), voice || 'alloy', target_language);

    // If buffer starts with 'RIFF' it's a WAV, otherwise default to MP3
    const isWav = audioBuffer.slice(0, 4).toString() === 'RIFF';
    res.setHeader('Content-Type', isWav ? 'audio/wav' : 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(audioBuffer);
  } catch (error: any) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
};

export const getSystemStatus = async (_req: Request, res: Response): Promise<void> => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 5);
  res.json({
    status: 'online',
    openai_configured: hasOpenAI,
    mode: hasOpenAI ? 'live' : 'demo_simulation',
    server_time: new Date().toISOString(),
  });
};
