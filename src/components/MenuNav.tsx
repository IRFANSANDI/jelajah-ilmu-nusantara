import {
  Award,
  Backpack,
  BookOpen,
  Coins,
  Compass,
  GraduationCap,
  HelpCircle,
  Home,
  Map,
  Play,
  Sparkles,
  Trophy,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PlayerProgress3D } from '../game3d/curriculumData';
import { computeLevelStatus } from '../game3d/inventoryData';
import { PWAInstallButton } from './PWAInstallButton';

export type MenuTabId =
  | 'home'
  | 'kelas'
  | 'peta'
  | 'materi'
  | 'inventaris'
  | 'prestasi'
  | 'profil';

interface MenuNavProps {
  activeTab: MenuTabId;
  onSelectTab: (tab: MenuTabId) => void;
  onLaunchActiveWorld: () => void;
  progress: PlayerProgress3D;
  onToggleSound: () => void;
  onOpenTutorial?: () => void;
}

const NAV_ITEMS: Array<{ id: MenuTabId; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'kelas', label: 'Pilih Kelas', icon: GraduationCap },
  { id: 'peta', label: 'Peta Petualangan', icon: Map },
  { id: 'materi', label: 'Materi Pelajaran', icon: BookOpen },
  { id: 'inventaris', label: 'Inventaris', icon: Backpack },
  { id: 'prestasi', label: 'Prestasi', icon: Trophy },
  { id: 'profil', label: 'Profil Pemain', icon: User },
];

export function MenuNav({
  activeTab,
  onSelectTab,
  onLaunchActiveWorld,
  progress,
  onToggleSound,
  onOpenTutorial,
}: MenuNavProps) {
  const levelInfo = computeLevelStatus(progress.xp);

  return (
    <header className="sticky top-0 z-30 bg-white/95 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Title */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-none">
              JELAJAH ILMU NUSANTARA
            </h1>
            <p className="text-[11px] font-semibold text-emerald-700 mt-1">
              Kelas {progress.activeGrade} · Bab {progress.activeBab} · {progress.playerName}
            </p>
          </div>
        </button>

        {/* Stats + Quick Play + Sound */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <span className="flex items-center gap-1 text-amber-700 font-mono tabular-nums">
              <Coins className="w-4 h-4 text-amber-500" />
              {progress.coins}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-sky-700 font-mono tabular-nums">
              <Award className="w-4 h-4 text-sky-600" />
              {progress.score}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-emerald-700 font-mono tabular-nums">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Lv.{levelInfo.level}
            </span>
          </div>

          <PWAInstallButton />

          {onOpenTutorial && (
            <button
              type="button"
              onClick={onOpenTutorial}
              title="Panduan Pemula"
              aria-label="Panduan Pemula"
              className="h-10 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="hidden md:inline">Panduan</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            title={progress.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            aria-label={progress.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onLaunchActiveWorld}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Mainkan Dunia 3D</span>
          </button>
        </div>
      </div>

      {/* 7-Item Main Menu Bar */}
      <nav
        aria-label="Menu Utama"
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-2.5 flex items-center gap-1.5 overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer min-h-[38px] ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
