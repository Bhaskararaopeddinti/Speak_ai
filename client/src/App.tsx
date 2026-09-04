import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Toast, ToastMessage } from './components/Toast';
import { PracticeView } from './views/PracticeView';
import { ProgressView } from './views/ProgressView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { api } from './services/api';
import { User, ViewType } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('practice');
  const [user, setUser] = useState<User | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
    return localStorage.getItem('linguavoice_target_lang') || 'Spanish';
  });
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem('linguavoice_tts_voice') || 'alloy';
  });
  const [streakDays, setStreakDays] = useState(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load user profile on mount
  useEffect(() => {
    api.getProfile().then((userData) => {
      if (userData) {
        setUser(userData);
        if (userData.target_language) {
          setTargetLanguage(userData.target_language);
        }
      }
    });

    // Attempt to load streak
    api.getProgress().then((p) => {
      if (p?.streak_days) {
        setStreakDays(p.streak_days);
      }
    }).catch(() => {});
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    localStorage.setItem('linguavoice_target_lang', lang);
    if (user) {
      api.updateLanguage(lang).catch(() => {});
    }
  };

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem('linguavoice_tts_voice', voice);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    if (authenticatedUser.target_language) {
      setTargetLanguage(authenticatedUser.target_language);
    }
    showToast(`Welcome, ${authenticatedUser.name}!`, 'success');
    // Refresh streak
    api.getProgress().then((p) => {
      if (p?.streak_days) setStreakDays(p.streak_days);
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        targetLanguage={targetLanguage}
        onLanguageChange={handleLanguageChange}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        streakDays={streakDays}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {currentView === 'practice' && (
          <PracticeView
            targetLanguage={targetLanguage}
            onLanguageChange={handleLanguageChange}
            user={user}
            onRequireAuth={() => setIsAuthModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView
            user={user}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            user={user}
            onRequireAuth={() => setIsAuthModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            user={user}
            targetLanguage={targetLanguage}
            onLanguageChange={handleLanguageChange}
            onShowToast={showToast}
            selectedVoice={selectedVoice}
            onVoiceChange={handleVoiceChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 LinguaVoice AI — Modern Voice Language Tutor with OpenAI Whisper &amp; GPT.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Modular STT / LLM / TTS Architecture</span>
            <span>•</span>
            <span>PostgreSQL &amp; SQLite Storage</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        targetLanguage={targetLanguage}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};
