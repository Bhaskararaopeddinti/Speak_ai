import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './db/database.js';
import { audioUpload } from './middleware/uploadMiddleware.js';
import { authenticateToken, optionalAuthenticateToken } from './middleware/authMiddleware.js';
import * as authController from './controllers/authController.js';
import * as practiceController from './controllers/practiceController.js';
import * as sessionController from './controllers/sessionController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static route for uploaded audio files
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// --- Auth Routes ---
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/demo', authController.demoLogin);
app.get('/api/auth/me', authenticateToken, authController.getCurrentUser);
app.put('/api/auth/language', authenticateToken, authController.updateLanguage);

// --- Practice & AI Routes ---
// POST /api/speech-to-text - Accepts recorded audio, sends to Whisper (or fallback), returns transcription
app.post('/api/speech-to-text', optionalAuthenticateToken, audioUpload.single('audio'), practiceController.speechToText);

// POST /api/analyze - Accepts transcription + target language, sends to LLM, returns structured JSON
app.post('/api/analyze', practiceController.analyzeSentence);

// POST /api/text-to-speech - Accepts text + target language, generates speech, returns audio
app.post('/api/text-to-speech', practiceController.textToSpeech);

// GET /api/status - System status & provider mode
app.get('/api/status', practiceController.getSystemStatus);

// --- Practice Sessions & Analytics Routes ---
// POST /api/sessions - Save a completed practice session
app.post('/api/sessions', authenticateToken, sessionController.saveSession);

// GET /api/sessions - Return user's previous sessions
app.get('/api/sessions', authenticateToken, sessionController.getSessions);

// GET /api/progress - Return statistics and progress data
app.get('/api/progress', authenticateToken, sessionController.getProgress);

// Serve client build if available (for production deployments like Render)
import fs from 'fs';

const clientDistPossiblePaths = [
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'dist/client'),
];

const clientDistDir = clientDistPossiblePaths.find((p) => fs.existsSync(p));
if (clientDistDir) {
  console.log(` Serving frontend static build from: ${clientDistDir}`);
  app.use(express.static(clientDistDir));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An internal server error occurred',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` LinguaVoice AI Backend Server running on port ${PORT}`);
      console.log(` Mode: ${process.env.OPENAI_API_KEY ? 'Live OpenAI API' : 'Demo / Smart Linguistic Simulation'}`);
      console.log(` Database: ${db.isUsingPostgres() ? 'PostgreSQL' : 'Persistent Local Storage'}`);
      console.log(` Audio Uploads: ${uploadsDir}`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
