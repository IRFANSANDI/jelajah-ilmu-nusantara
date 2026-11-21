import React, { useState } from 'react';
import { Gamepad2, Music, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundEngine } from '../utils/sound';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleSound = () => {
    const next = { ...settings, soundEnabled: !settings.soundEnabled };
    onUpdateSettings(next);
    if (next.soundEnabled) soundEngine.playClick();
  };

  const toggleMusic = () => {
    soundEngine.playClick();
    onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-pop-in">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 id="settings-title" className="font-display text-xl font-extrabold text-slate-900">
            Pengaturan Game
          </h2>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Tutup pengaturan"
            className="w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sound FX */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Efek Suara</p>
                <p className="text-xs text-slate-500">Suara langkah, koin, dan jawaban</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-4 py-2 rounded-lg text-xs font-bold min-w-[76px] cursor-pointer min-h-[40px] ${
                settings.soundEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {settings.soundEnabled ? 'Aktif' : 'Mati'}
            </button>
          </div>

          {/* Ambient Chime */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Alunan Musik Latar</p>
                <p className="text-xs text-slate-500">Melodi pentatonik Nusantara lembut</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMusic}
              className={`px-4 py-2 rounded-lg text-xs font-bold min-w-[76px] cursor-pointer min-h-[40px] ${
                settings.musicEnabled ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {settings.musicEnabled ? 'Aktif' : 'Mati'}
            </button>
          </div>

          {/* Movement Speed */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700">Kecepatan Karakter</p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              {(['normal', 'fast'] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSettings({ ...settings, moveSpeed: spd });
                  }}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer min-h-[38px] ${
                    settings.moveSpeed === spd
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  {spd === 'normal' ? 'Normal' : 'Cepat'}
                </button>
              ))}
            </div>
          </div>

          {/* Touch D-Pad Setting */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Tombol Arah Layar (D-Pad)</span>
            </p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              {(['auto', 'always'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSettings({ ...settings, showTouchPad: mode });
                  }}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer min-h-[38px] ${
                    settings.showTouchPad === mode
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  {mode === 'auto' ? 'Otomatis (HP/Tablet)' : 'Selalu Tampil'}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Progress */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setConfirmReset(true);
                }}
                className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Semua Progres Belajar</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="text-xs font-semibold text-rose-900 text-center">
                  Yakin ingin menghapus koin, skor, dan seluruh progres pos?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="py-2 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Ya, Reset Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
