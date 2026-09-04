import React, { useState, useEffect } from 'react';
import {
  Key,
  Database,
  Volume2,
  Globe,
  CheckCircle,
  AlertTriangle,
  Play,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import {
  SUPPORTED_LANGUAGES,
  TTS_VOICES,
  SystemStatus,
  SettingsViewProps,
  SupportedLanguage,
  TTSVoiceOption,
} from '../types';

export const SettingsView: React.FC<SettingsViewProps> = ({
  targetLanguage,
  onLanguageChange,
  onShowToast,
  selectedVoice,
  onVoiceChange,
}) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  useEffect(() => {
    api.getStatus().then((s: SystemStatus) => setStatus(s)).catch(() => {});
  }, []);

  const handleTestVoice = async (voiceId: string): Promise<void> => {
    try {
      setIsPlayingPreview(true);
      await api.textToSpeech('Hello! Welcome to LinguaVoice AI tutor.', targetLanguage, voiceId);
      onShowToast(`Sample preview played for voice "${voiceId}"`, 'info');
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setIsPlayingPreview(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure language preferences, speech synthesizers, and view provider status.
        </p>
      </div>

      {/* 1. Language Learning Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Globe className="w-5 h-5 text-brand-600" />
          <span>Default Target Language</span>
        </div>
        <p className="text-xs text-slate-500">
          This language will be pre-selected every time you open the speaking practice dashboard.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {SUPPORTED_LANGUAGES.map((lang: SupportedLanguage) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onLanguageChange(lang.name);
                onShowToast(`Default language changed to ${lang.name}`, 'success');
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                targetLanguage.toLowerCase() === lang.name.toLowerCase()
                  ? 'border-brand-500 bg-brand-50/70 text-brand-900 font-bold shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <div className="text-xl mb-1">{lang.flag}</div>
              <div className="text-xs font-semibold">{lang.name}</div>
              <div className="text-[10px] text-slate-400">{lang.native}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Text-to-Speech Voice Selection */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Volume2 className="w-5 h-5 text-brand-600" />
          <span>OpenAI TTS Voice Persona</span>
        </div>
        <p className="text-xs text-slate-500">
          Choose the voice persona used when reading corrected sentences aloud.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {TTS_VOICES.map((v: TTSVoiceOption) => (
            <div
              key={v.id}
              onClick={() => onVoiceChange(v.id)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedVoice === v.id
                  ? 'border-purple-500 bg-purple-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-800">{v.name}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{v.desc}</p>
              </div>
              <button
                type="button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleTestVoice(v.id);
                }}
                disabled={isPlayingPreview}
                className="p-2 text-purple-600 hover:bg-purple-100 rounded-xl transition-colors"
                title="Preview voice"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI Providers & System Health */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Key className="w-5 h-5 text-brand-600" />
          <span>AI Service Status</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600">OpenAI API Connection:</span>
            {status?.openai_configured ? (
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Live Keys Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Demo / Smart Simulation Mode
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600">Speech-to-Text Engine:</span>
            <span className="font-semibold text-slate-800">
              {status?.openai_configured ? 'OpenAI Whisper-1' : 'Intelligent Speech Engine (Demo)'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600">Linguistic Analysis LLM:</span>
            <span className="font-semibold text-slate-800">
              {status?.openai_configured ? 'OpenAI GPT-4o-mini' : 'Context-Aware Linguistic Analyzer'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600">Speech Synthesis (TTS):</span>
            <span className="font-semibold text-slate-800">
              {status?.openai_configured ? 'OpenAI TTS-1' : 'Browser WebSpeech / Audio Buffer'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-brand-50/70 border border-brand-100 rounded-2xl text-[11px] text-brand-900 leading-relaxed">
          <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            To connect live OpenAI services, set <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-200">OPENAI_API_KEY=sk-...</code> in your backend <code className="font-mono bg-white px-1 py-0.5 rounded border border-brand-200">server/.env</code> file. Without a key, LinguaVoice AI functions smoothly with full realistic linguistic feedback.
          </div>
        </div>
      </div>

      {/* 4. Database Storage Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Database className="w-5 h-5 text-brand-600" />
          <span>Database Architecture</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          LinguaVoice AI features a unified database layer supporting <strong>PostgreSQL</strong> via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">DATABASE_URL</code>, with automatic local persistent storage fallback when running without a remote server.
        </p>
      </div>
    </div>
  );
};
