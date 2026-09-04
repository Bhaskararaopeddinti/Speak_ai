import { LLMAnalysisResult, PracticeSessionRecord, ProgressData, SystemStatus, User } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('linguavoice_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // --- Auth ---
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    const data = await res.json();
    localStorage.setItem('linguavoice_token', data.token);
    return data;
  },

  async register(name: string, email: string, password: string, target_language: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, target_language }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    const data = await res.json();
    localStorage.setItem('linguavoice_token', data.token);
    return data;
  },

  async demoLogin(): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to start demo session');
    }
    const data = await res.json();
    localStorage.setItem('linguavoice_token', data.token);
    return data;
  },

  async getProfile(): Promise<User | null> {
    const token = localStorage.getItem('linguavoice_token');
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) {
        localStorage.removeItem('linguavoice_token');
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  async updateLanguage(target_language: string): Promise<void> {
    await fetch(`${API_BASE}/auth/language`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ target_language }),
    });
  },

  logout(): void {
    localStorage.removeItem('linguavoice_token');
  },

  // --- AI & Practice ---
  async speechToText(audioBlob: Blob, language: string): Promise<{ transcription: string; audio_url?: string }> {
    const formData = new FormData();
    // Use .webm or .wav
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', language);

    const res = await fetch(`${API_BASE}/speech-to-text`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Speech-to-text conversion failed');
    }
    return res.json();
  },

  async analyze(transcription: string, target_language: string): Promise<LLMAnalysisResult> {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ transcription, target_language }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Linguistic analysis failed');
    }
    return res.json();
  },

  async textToSpeech(text: string, target_language: string, voice: string = 'alloy'): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ text, target_language, voice }),
      });

      if (!res.ok) {
        throw new Error('TTS server returned non-200');
      }

      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.warn('Backend TTS call failed, falling back to browser speech synthesis:', err);
      // Fallback to browser Web Speech API
      return new Promise((resolve) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        }
        resolve('');
      });
    }
  },

  async getStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch(`${API_BASE}/status`);
      return res.json();
    } catch {
      return {
        status: 'online',
        openai_configured: false,
        mode: 'demo_simulation',
        server_time: new Date().toISOString(),
      };
    }
  },

  // --- Sessions & Progress ---
  async saveSession(sessionData: {
    target_language: string;
    audio_url?: string;
    transcription: string;
    corrected_sentence: string;
    natural_sentence: string;
    grammar_score: number;
    vocabulary_score: number;
    naturalness_score: number;
    feedback: string;
    mistakes: any[];
  }): Promise<PracticeSessionRecord> {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(sessionData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save practice session');
    }
    const data = await res.json();
    return data.session;
  },

  async getSessions(): Promise<PracticeSessionRecord[]> {
    const res = await fetch(`${API_BASE}/sessions`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch practice history');
    }
    const data = await res.json();
    return data.sessions || [];
  },

  async getProgress(): Promise<ProgressData> {
    const res = await fetch(`${API_BASE}/progress`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch progress metrics');
    }
    const data = await res.json();
    return data.progress;
  },
};
