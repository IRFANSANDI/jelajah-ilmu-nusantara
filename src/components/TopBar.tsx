import React from 'react';
import { Settings } from 'lucide-react';
import { ScreenMode } from '../types/game';
import { soundEngine } from '../utils/sound';

interface TopBarProps {
  currentScreen: ScreenMode;
  onNavigate: (screen: ScreenMode) => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScreen,
  onNavigate,
  onOpenSettings,
}) => {
  const navItems: { id: ScreenMode; label: string }[] = [
    { id: 'home', label: 'Beranda' },
    { id: 'worlds', label: 'Peta Dunia' },
    { id: 'profile', label: 'Profil' },
    { id: 'rewards', label: 'Hadiah' },
  ];

  const handleNav = (id: ScreenMode) => {
    soundEngine.playClick();
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          Jelajah Ilmu Nusantara
        </button>

        {/* Zone 2: 4 Single-Line Text Nav Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi Utama">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 border-emerald-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenSettings();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[40px]"
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Mobile secondary nav strip (kept compact within 15% mobile sticky cap) */}
      <nav
        className="flex md:hidden items-center justify-around border-t border-slate-100 bg-white px-2 py-1.5"
        aria-label="Navigasi Ponsel"
      >
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
