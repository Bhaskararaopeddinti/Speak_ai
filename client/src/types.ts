export interface User {
  id: string;
  name: string;
  email: string;
  target_language: string;
}

export interface Mistake {
  type: string;
  original: string;
  correction: string;
  explanation: string;
}

export interface LLMAnalysisResult {
  grammar_score: number;
  vocabulary_score: number;
  naturalness_score: number;
  mistakes: Mistake[];
  feedback: string;
  corrected_sentence: string;
  natural_sentence: string;
}

export interface SessionMistake {
  id: string;
  session_id?: string;
  mistake_type: string;
  original_text: string;
  corrected_text: string;
  explanation: string;
}

export interface PracticeSessionRecord {
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
  mistakes?: SessionMistake[];
}

export interface CommonMistake {
  type: string;
  count: number;
}

export interface ScoreTrend {
  date: string;
  grammar_score: number;
  vocabulary_score: number;
  naturalness_score: number;
}

export interface WeeklySession {
  week: string;
  count: number;
}

export interface ProgressData {
  total_sessions: number;
  sentences_practiced: number;
  average_grammar_score: number;
  average_vocabulary_score: number;
  average_naturalness_score: number;
  streak_days: number;
  common_mistakes: CommonMistake[];
  score_trends: ScoreTrend[];
  sessions_per_week: WeeklySession[];
}

export interface SystemStatus {
  status: string;
  openai_configured: boolean;
  mode: 'live' | 'demo_simulation';
  server_time: string;
}

export type ViewType = 'practice' | 'progress' | 'history' | 'settings';

export interface SettingsViewProps {
  user: User | null;
  targetLanguage: string;
  onLanguageChange: (language: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳', native: '中文' },
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
];

export interface TTSVoiceOption {
  id: string;
  name: string;
  desc: string;
}

export const TTS_VOICES: TTSVoiceOption[] = [
  { id: 'alloy', name: 'Alloy', desc: 'Neutral, balanced & clear' },
  { id: 'nova', name: 'Nova', desc: 'Warm, engaging & friendly' },
  { id: 'echo', name: 'Echo', desc: 'Smooth, natural baritone' },
  { id: 'fable', name: 'Fable', desc: 'Expressive & dynamic' },
  { id: 'onyx', name: 'Onyx', desc: 'Deep, authoritative tone' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Bright, crisp & upbeat' },
];
