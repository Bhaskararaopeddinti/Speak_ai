import React from 'react';
import {
  Flame,
  User as UserIcon,
  Globe,
  Mic,
  BarChart3,
  History,
  Settings,
  LogIn,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, User, ViewType } from '../types';

interface NavbarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  targetLanguage: string;
  onLanguageChange: (lang: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  streakDays?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  targetLanguage,
  onLanguageChange,
  user,
  onOpenAuth,
  onLogout,
  streakDays = 1,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find(
    (l) => l.name.toLowerCase() === targetLanguage.toLowerCase()
  ) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectView('practice')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 bg-clip-text text-transparent">
                LinguaVoice
              </span>
              <span className="text-xs font-bold text-accent-600 ml-1 px-1.5 py-0.5 bg-accent-50 rounded-md border border-accent-200">
                AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectView('practice')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'practice'
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Practice</span>
            </button>

            <button
              onClick={() => onSelectView('progress')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'progress'
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Progress</span>
            </button>

            <button
              onClick={() => onSelectView('history')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'history'
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              onClick={() => onSelectView('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'settings'
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Right Actions: Language Selector, Streak, Auth */}
        <div className="flex items-center gap-3">
          {/* Target Language Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors cursor-pointer text-sm font-semibold text-slate-700">
              <span className="text-base">{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Target Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.name)}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-brand-50 hover:text-brand-700 transition-colors ${
                    lang.name.toLowerCase() === targetLanguage.toLowerCase()
                      ? 'bg-brand-50/70 text-brand-700 font-bold'
                      : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-600">{lang.native}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Learning Streak Badge */}
          <div
            title={`Current Streak: ${streakDays} day(s)`}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold shadow-sm"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span>{streakDays}d</span>
          </div>

          {/* User Profile / Login */}
          {user ? (
            <div className="relative group">
              <div className="flex items-center gap-2 p-1.5 pr-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[90px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
              </div>

              {/* User Dropdown */}
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2">
        <button
          onClick={() => onSelectView('practice')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            currentView === 'practice' ? 'text-brand-600 bg-brand-50' : 'text-slate-500'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Practice</span>
        </button>
        <button
          onClick={() => onSelectView('progress')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            currentView === 'progress' ? 'text-brand-600 bg-brand-50' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Progress</span>
        </button>
        <button
          onClick={() => onSelectView('history')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            currentView === 'history' ? 'text-brand-600 bg-brand-50' : 'text-slate-500'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
        <button
          onClick={() => onSelectView('settings')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            currentView === 'settings' ? 'text-brand-600 bg-brand-50' : 'text-slate-500'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};
