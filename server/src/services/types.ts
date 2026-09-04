export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  target_language?: string;
  created_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  target_language: string;
  audio_url?: string;
  transcription: string;
  corrected_sentence: string;
  natural_sentence: string;
  grammar_score: number;
  vocabulary_score: number;
  naturalness_score: number;
  feedback: string;
  created_at: string;
  mistakes?: Mistake[];
}

export interface Mistake {
  id: string;
  session_id?: string;
  mistake_type: string;
  original_text: string;
  corrected_text: string;
  explanation: string;
}

export interface LLMAnalysisResult {
  grammar_score: number;
  vocabulary_score: number;
  naturalness_score: number;
  mistakes: Array<{
    type: string;
    original: string;
    correction: string;
    explanation: string;
  }>;
  feedback: string;
  corrected_sentence: string;
  natural_sentence: string;
}

export interface ProgressSummary {
  total_sessions: number;
  sentences_practiced: number;
  average_grammar_score: number;
  average_vocabulary_score: number;
  average_naturalness_score: number;
  streak_days: number;
  common_mistakes: Array<{
    type: string;
    count: number;
  }>;
  score_trends: Array<{
    date: string;
    grammar_score: number;
    vocabulary_score: number;
    naturalness_score: number;
  }>;
  sessions_per_week: Array<{
    week: string;
    count: number;
  }>;
}

export interface STTProvider {
  transcribe(audioFilePath: string, language?: string): Promise<string>;
}

export interface LLMProvider {
  analyze(transcription: string, targetLanguage: string): Promise<LLMAnalysisResult>;
}

export interface TTSProvider {
  synthesize(text: string, voice?: string, language?: string): Promise<Buffer>;
}
