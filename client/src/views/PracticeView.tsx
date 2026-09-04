import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Loader2,
  ChevronRight,
  Globe,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { AudioRecorder } from '../components/AudioRecorder';
import { FeedbackDisplay } from '../components/FeedbackDisplay';
import { api } from '../services/api';
import { LLMAnalysisResult, SUPPORTED_LANGUAGES, User } from '../types';

interface PracticeViewProps {
  targetLanguage: string;
  onLanguageChange: (lang: string) => void;
  user: User | null;
  onRequireAuth: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  targetLanguage,
  onLanguageChange,
  user,
  onRequireAuth,
  onShowToast,
}) => {
  // Practice states
  const [transcription, setTranscription] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LLMAnalysisResult | null>(null);

  // Loading indicators
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sample prompt ideas for inspiration
  const samplePrompts: { [key: string]: string[] } = {
    Spanish: [
      'Ayer yo he fue a la tienda comprar manzanas.',
      'Yo querer ir al supermercado ayer pero no tuve tiempo.',
      'Me gusta mucho los libros de historia.',
      '¿Dónde está la estación de tren más cercana?'
    ],
    French: [
      'Hier je suis allé au magasin pour acheter du pain.',
      'Moi aimer beaucoup visiter Paris en automne.',
      'Je voudrais parler avec le professeur demain matin.',
      'Est-ce que vous pouvez m\'aider s\'il vous plaît?'
    ],
    German: [
      'Gestern ich habe gegangen zu dem Supermarkt.',
      'Ich möchte ein kaltes Wasser bestellen, bitte.',
      'Weil das Wetter schön ist, ich gehe spazieren.',
      'Können Sie mir bitte den Weg zum Bahnhof erklären?'
    ],
    Italian: [
      'Ieri ho andato al mercato con i miei amici.',
      'Vorrei ordinare una pizza e un caffè espresso.',
      'Questa città è molto bella specialmente di notte.'
    ],
    Japanese: [
      '昨日、私はスーパーに行きました。',
      '日本語を勉強するのがとても楽しいです。',
      '明日の天気はどうですか。'
    ],
    English: [
      'I have went to the store yesterday.',
      'She don\'t know the answer to this question.',
      'I am looking forward to meet you next week.'
    ]
  };

  const prompts = samplePrompts[targetLanguage] || samplePrompts['Spanish'];

  // Handle recorded audio blob
  const handleRecordingComplete = async (audioBlob: Blob, _duration: number) => {
    setIsSaved(false);
    setAnalysis(null);

    try {
      // Step 1: Speech-to-Text
      setIsTranscribing(true);
      const sttResult = await api.speechToText(audioBlob, targetLanguage);
      setTranscription(sttResult.transcription);
      if (sttResult.audio_url) {
        setRecordedAudioUrl(sttResult.audio_url);
      }
      setIsTranscribing(false);

      // Step 2: LLM Linguistic Analysis
      setIsAnalyzing(true);
      const analysisResult = await api.analyze(sttResult.transcription, targetLanguage);
      setAnalysis(analysisResult);
      setIsAnalyzing(false);

      onShowToast('Sentence transcribed & analyzed!', 'success');
    } catch (err: any) {
      setIsTranscribing(false);
      setIsAnalyzing(false);
      console.error('Practice pipeline error:', err);
      onShowToast(err.message || 'Failed to analyze recording', 'error');
    }
  };

  const handleTryAgain = () => {
    setTranscription(null);
    setAnalysis(null);
    setRecordedAudioUrl(null);
    setIsSaved(false);
  };

  const handlePracticeCorrection = (correctedText: string) => {
    onShowToast(`Try speaking this corrected sentence: "${correctedText}"`, 'info');
    handleTryAgain();
  };

  const handleSavePractice = async () => {
    if (!transcription || !analysis) return;
    if (!user) {
      onRequireAuth();
      return;
    }

    setIsSaving(true);
    try {
      await api.saveSession({
        target_language: targetLanguage,
        audio_url: recordedAudioUrl || undefined,
        transcription,
        corrected_sentence: analysis.corrected_sentence,
        natural_sentence: analysis.natural_sentence,
        grammar_score: analysis.grammar_score,
        vocabulary_score: analysis.vocabulary_score,
        naturalness_score: analysis.naturalness_score,
        feedback: analysis.feedback,
        mistakes: analysis.mistakes,
      });
      setIsSaved(true);
      onShowToast('Practice session saved to your learning progress!', 'success');
    } catch (err: any) {
      console.error('Failed to save session:', err);
      onShowToast(err.message || 'Could not save session', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayTTS = async (text: string): Promise<string> => {
    return api.textToSpeech(text, targetLanguage);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Main Practice Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-100/50 via-purple-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200/80 rounded-full text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            AI Voice Language Tutor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Practice speaking
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Speak a sentence in your target language and get instant AI feedback on grammar, vocabulary, and naturalness.
          </p>

          {/* Language selector chip in practice card */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>Practicing:</span>
            <select
              value={targetLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent font-bold text-brand-700 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.name}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audio Recording Interface or Feedback Section */}
        {!analysis && !isTranscribing && !isAnalyzing && (
          <div>
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isTranscribing || isAnalyzing}
            />

            {/* Inspiration Prompt Ideas */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Need ideas? Try speaking one of these in {targetLanguage}:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prompts.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 hover:bg-brand-50/50 rounded-xl border border-slate-200/70 text-xs font-medium text-slate-700 flex items-center justify-between transition-colors group cursor-default"
                  >
                    <span>&ldquo;{p}&rdquo;</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Processing / Loading states */}
        {(isTranscribing || isAnalyzing) && (
          <div className="py-16 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-brand-600">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {isTranscribing
                  ? 'Transcribing your speech with Whisper...'
                  : 'AI Tutor is analyzing your sentence...'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {isTranscribing
                  ? 'Converting voice audio waves into high-accuracy phonetics'
                  : 'Evaluating grammar, word choice, context, and natural native cadence'}
              </p>
            </div>
          </div>
        )}

        {/* Feedback Display */}
        {analysis && transcription && (
          <FeedbackDisplay
            transcription={transcription}
            analysis={analysis}
            onTryAgain={handleTryAgain}
            onPracticeCorrection={handlePracticeCorrection}
            onSavePractice={handleSavePractice}
            onPlayTTS={handlePlayTTS}
            isSaving={isSaving}
            isSaved={isSaved}
          />
        )}
      </div>
    </div>
  );
};
