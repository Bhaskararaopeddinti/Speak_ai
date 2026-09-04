import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Volume2,
  Calendar,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import {
  PracticeSessionRecord,
  SessionMistake,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  User,
} from '../types';
import { AudioPlayer } from '../components/AudioPlayer';

export interface HistoryViewProps {
  user: User | null;
  onRequireAuth: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  user,
  onRequireAuth,
  onShowToast,
}) => {
  const [sessions, setSessions] = useState<PracticeSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLang, setFilterLang] = useState<string>('All');
  const [activeAudioSessionId, setActiveAudioSessionId] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});

  const fetchSessions = async (): Promise<void> => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data: PracticeSessionRecord[] = await api.getSessions();
      setSessions(data);
    } catch (err: unknown) {
      console.error('Failed to load history:', err);
      onShowToast('Could not load practice history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const handlePlaySessionTTS = async (session: PracticeSessionRecord): Promise<void> => {
    if (audioUrls[session.id]) {
      setActiveAudioSessionId(session.id);
      return;
    }

    try {
      const url: string = await api.textToSpeech(session.corrected_sentence, session.target_language);
      if (url) {
        setAudioUrls((prev: Record<string, string>) => ({ ...prev, [session.id]: url }));
        setActiveAudioSessionId(session.id);
      }
    } catch (e: unknown) {
      console.error('Failed to play history TTS:', e);
      onShowToast('Could not synthesize speech', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your Practice History</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Sign in or launch the instant demo to review your previously recorded sentences, AI grammar breakdowns, and audio playback.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
        >
          Sign In to View History
        </button>
      </div>
    );
  }

  const filteredSessions: PracticeSessionRecord[] = sessions.filter((s: PracticeSessionRecord) => {
    const matchesSearch: boolean =
      s.transcription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.corrected_sentence.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang: boolean =
      filterLang === 'All' || s.target_language.toLowerCase() === filterLang.toLowerCase();
    return matchesSearch && matchesLang;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Practice History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review past transcriptions, linguistic corrections, and audio recordings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSessions}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 self-start sm:self-auto"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search sentence or correction..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterLang}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterLang(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="All">All Languages</option>
            {SUPPORTED_LANGUAGES.map((l: SupportedLanguage) => (
              <option key={l.code} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Session List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs text-slate-500">Loading your history records...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-700">No practice sessions found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || filterLang !== 'All'
              ? 'Try modifying your search keywords or filter criteria.'
              : 'Record and save your first spoken sentence in the Practice tab!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session: PracticeSessionRecord) => {
            const dateStr = new Date(session.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {session.target_language}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Score pills */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Grammar {session.grammar_score}%
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      Vocab {session.vocabulary_score}%
                    </span>
                  </div>
                </div>

                {/* Sentences */}
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Spoken sentence
                    </span>
                    <p className="text-slate-800 font-semibold text-base mt-0.5">
                      &ldquo;{session.transcription}&rdquo;
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                      Correction
                    </span>
                    <p className="text-emerald-900 font-medium text-sm mt-0.5">
                      {session.corrected_sentence}
                    </p>
                  </div>
                </div>

                {/* Mistakes Tags */}
                {session.mistakes && session.mistakes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                      Mistakes analyzed ({session.mistakes.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {session.mistakes.map((m: SessionMistake) => (
                        <div
                          key={m.id}
                          className="px-2.5 py-1 bg-purple-50 border border-purple-200/80 rounded-xl text-xs text-purple-900 flex items-center gap-1.5"
                          title={m.explanation}
                        >
                          <span className="font-bold">{m.mistake_type}:</span>
                          <span className="line-through text-rose-500 font-mono text-[11px]">{m.original_text}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-emerald-600 font-mono text-[11px]">{m.corrected_text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Player / Listen CTA */}
                <div className="pt-2">
                  {activeAudioSessionId === session.id && audioUrls[session.id] ? (
                    <AudioPlayer
                      audioSrc={audioUrls[session.id]}
                      autoPlay={true}
                      label={`Corrected: ${session.target_language}`}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePlaySessionTTS(session)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Listen to corrected sentence</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
