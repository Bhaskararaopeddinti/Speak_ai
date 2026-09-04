import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Volume2,
  Bookmark,
  RotateCcw,
  Check,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Award,
  Loader2,
} from 'lucide-react';
import { LLMAnalysisResult } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface FeedbackDisplayProps {
  transcription: string;
  analysis: LLMAnalysisResult;
  onTryAgain: () => void;
  onPracticeCorrection: (correctedText: string) => void;
  onSavePractice: () => Promise<void>;
  onPlayTTS: (text: string) => Promise<string>;
  isSaving: boolean;
  isSaved: boolean;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  transcription,
  analysis,
  onTryAgain,
  onPracticeCorrection,
  onSavePractice,
  onPlayTTS,
  isSaving,
  isSaved,
}) => {
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isLoadingTts, setIsLoadingTts] = useState(false);

  const handleListenCorrected = async () => {
    if (ttsAudioUrl) return; // already loaded
    try {
      setIsLoadingTts(true);
      const url = await onPlayTTS(analysis.corrected_sentence || analysis.natural_sentence);
      if (url) {
        setTtsAudioUrl(url);
      }
    } catch (e) {
      console.error('Failed to play TTS:', e);
    } finally {
      setIsLoadingTts(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Excellent',
        dot: 'bg-emerald-500',
      };
    }
    if (score >= 70) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Good / Needs Polish',
        dot: 'bg-amber-500',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Needs Improvement',
      dot: 'bg-rose-500',
    };
  };

  const grammarBadge = getScoreBadge(analysis.grammar_score);
  const vocabBadge = getScoreBadge(analysis.vocabulary_score);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. Transcribed sentence card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
            Your sentence
          </span>
          <span className="text-xs text-slate-600 font-medium">As recognized by Whisper</span>
        </div>
        <p className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed">
          &ldquo;{transcription}&rdquo;
        </p>
      </div>

      {/* 2. Score Summary Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Grammar Score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Grammar</span>
            <span className="font-bold text-slate-700">{analysis.grammar_score}/100</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                analysis.grammar_score >= 80 ? 'bg-emerald-500' : analysis.grammar_score >= 65 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${analysis.grammar_score}%` }}
            />
          </div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${grammarBadge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${grammarBadge.dot}`} />
            {grammarBadge.label}
          </div>
        </div>

        {/* Vocabulary Score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Vocabulary</span>
            <span className="font-bold text-slate-700">{analysis.vocabulary_score}/100</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                analysis.vocabulary_score >= 80 ? 'bg-emerald-500' : analysis.vocabulary_score >= 65 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${analysis.vocabulary_score}%` }}
            />
          </div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${vocabBadge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${vocabBadge.dot}`} />
            {vocabBadge.label}
          </div>
        </div>

        {/* Naturalness Score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Naturalness</span>
            <span className="font-bold text-slate-700">{analysis.naturalness_score}/100</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2 overflow-hidden">
            <div
              className="bg-accent-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.naturalness_score}%` }}
            />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-accent-50 text-accent-700 border-accent-200">
            <Sparkles className="w-3 h-3 text-accent-600" />
            Native Flow
          </div>
        </div>
      </div>

      {/* 3. AI Feedback Card */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white rounded-3xl p-6 border border-purple-200/70 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-purple-900 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-accent-600" />
          <span>AI Feedback</span>
        </div>

        {/* General Tutor summary */}
        {analysis.feedback && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 text-slate-700 text-sm leading-relaxed">
            {analysis.feedback}
          </div>
        )}

        {/* Specific Mistakes highlighted */}
        {analysis.mistakes && analysis.mistakes.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Identified Corrections ({analysis.mistakes.length})
            </h4>
            <div className="space-y-2.5">
              {analysis.mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 uppercase tracking-wide">
                      {m.type || 'Grammar'}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-sm">
                      <span className="line-through text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        &ldquo;{m.original}&rdquo;
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        &ldquo;{m.correction}&rdquo;
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{m.explanation}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Flawless grammar!</p>
              <p className="text-xs text-emerald-700">
                No mistakes detected. Your sentence is grammatically sound.
              </p>
            </div>
          </div>
        )}

        {/* Corrected Sentence Card */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Corrected sentence
          </div>
          <p className="text-base md:text-lg font-medium text-slate-800">
            {analysis.corrected_sentence}
          </p>
        </div>

        {/* Natural Version Card */}
        {analysis.natural_sentence && (
          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-accent-600 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Natural phrasing
            </div>
            <p className="text-base md:text-lg font-medium text-slate-800">
              {analysis.natural_sentence}
            </p>
          </div>
        )}

        {/* Listen to corrected sentence button & TTS audio player */}
        <div className="pt-2">
          {!ttsAudioUrl ? (
            <button
              onClick={handleListenCorrected}
              disabled={isLoadingTts}
              type="button"
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-2xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoadingTts ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating native voice audio...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>🔊 Listen to corrected sentence</span>
                </>
              )}
            </button>
          ) : (
            <AudioPlayer
              audioSrc={ttsAudioUrl}
              autoPlay={true}
              label="Corrected Sentence Audio"
            />
          )}
        </div>
      </div>

      {/* 4. Bottom Action Bar: Try Again, Practice Correction, Save Practice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onTryAgain}
          type="button"
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPracticeCorrection(analysis.corrected_sentence)}
            type="button"
            className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-semibold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Practice This Correction</span>
          </button>

          <button
            onClick={onSavePractice}
            disabled={isSaving || isSaved}
            type="button"
            className={`px-5 py-2.5 font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isSaved
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-slate-900 hover:bg-black text-white'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to History</span>
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Save Practice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
