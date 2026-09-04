import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BarChart2,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { ProgressData, User } from '../types';

interface ProgressViewProps {
  user: User | null;
  onRequireAuth: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user, onRequireAuth }) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProgress();
      setProgress(data);
    } catch (err: any) {
      console.error('Failed to load progress:', err);
      setError(err.message || 'Failed to fetch progress metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Track Your Learning Progress</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Sign in or try our 1-click Demo mode to view your learning streak, grammar improvements, vocabulary metrics, and common mistake trends.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
        >
          Sign In to View Progress
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-xs text-slate-500">Loading your learning analytics...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-sm text-slate-700">{error || 'Unable to load progress data'}</p>
        <button
          onClick={fetchProgress}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your speaking milestones, score trajectories, and grammatical patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchProgress}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 5 Stat Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Total Sessions
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            {progress.total_sessions}
          </div>
          <div className="text-[11px] text-brand-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active practice
          </div>
        </div>

        {/* Sentences Practiced */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Sentences
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            {progress.sentences_practiced}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Pronounced aloud
          </div>
        </div>

        {/* Average Grammar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Avg. Grammar
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-2">
            {progress.average_grammar_score}%
          </div>
          <div className="text-[11px] text-indigo-500 font-medium mt-1">
            Syntax accuracy
          </div>
        </div>

        {/* Average Vocabulary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Avg. Vocabulary
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-2">
            {progress.average_vocabulary_score}%
          </div>
          <div className="text-[11px] text-purple-500 font-medium mt-1">
            Lexical richness
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-2">
            {progress.streak_days} {progress.streak_days === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            🔥 Keep the habit alive!
          </div>
        </div>
      </div>

      {/* Main Analytics Row: Score Over Time & Common Mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scores Progression Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Score Trends Over Time
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracking Grammar and Vocabulary mastery across recent speaking sessions.
              </p>
            </div>
          </div>

          {progress.score_trends && progress.score_trends.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress.score_trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="grammar_score"
                    name="Grammar"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vocabulary_score"
                    name="Vocabulary"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#a855f7' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              Complete your first speaking session to see score trajectory charts!
            </div>
          )}
        </div>

        {/* Right Col: Common Mistakes Breakdown Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Common Mistakes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Areas to focus on during your upcoming practices:
            </p>
          </div>

          {progress.common_mistakes && progress.common_mistakes.length > 0 ? (
            <div className="space-y-3 pt-2">
              {progress.common_mistakes.map((m, idx) => {
                const maxCount = progress.common_mistakes[0].count || 1;
                const percent = Math.round((m.count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{m.type}</span>
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        {m.count} {m.count === 1 ? 'mistake' : 'mistakes'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-1">
              <Award className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-emerald-800">Clean Slate!</p>
              <p className="text-[11px] text-emerald-600">
                No repeated grammatical mistakes detected in your sessions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Practice Sessions Frequency Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              Practice Sessions Frequency
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly cadence of speaking sentences practiced.
            </p>
          </div>
        </div>

        {progress.sessions_per_week && progress.sessions_per_week.length > 0 ? (
          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progress.sessions_per_week} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Sessions" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-slate-400">
            No weekly data yet. Speak a sentence to log your first session!
          </div>
        )}
      </div>
    </div>
  );
};
