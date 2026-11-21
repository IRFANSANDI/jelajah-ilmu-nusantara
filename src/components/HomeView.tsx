import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Coins,
  Compass,
  Play,
  Star,
  Trophy,
  User,
} from 'lucide-react';
import { GradeLevel, PlayerState, ScreenMode, WorldId } from '../types/game';
import { ASSETS, GRADE_META, WORLDS } from '../data/worlds';
import { getLevelInfo } from '../data/rewards';
import { getWorldCurriculum } from '../data/curriculum';
import { ResilientImage } from './ResilientImage';
import { ExplorerSprite } from './ExplorerSprite';
import { soundEngine } from '../utils/sound';

interface HomeViewProps {
  player: PlayerState;
  onSelectGrade: (grade: GradeLevel) => void;
  onStartWorld: (worldId: WorldId) => void;
  onNavigate: (screen: ScreenMode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  player,
  onSelectGrade,
  onStartWorld,
  onNavigate,
}) => {
  const levelInfo = getLevelInfo(player.xp);
  const gradeInfo = GRADE_META[player.selectedGrade];
  const grades: GradeLevel[] = [1, 2, 3, 4, 5, 6];

  // Calculate stats for selected grade
  const completedInGrade = WORLDS.reduce((acc, w) => {
    const count = [1, 2, 3].filter(
      (order) => player.missionProgress[`${player.selectedGrade}_${w.id}_${order}`]?.completed
    ).length;
    return acc + count;
  }, 0);

  const totalCompletedAll = Object.values(player.missionProgress).filter(
    (m) => m.completed
  ).length;

  const totalStarsAll = Object.values(player.missionProgress).reduce(
    (acc, m) => acc + (m.stars || 0),
    0
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span>Kurikulum Merdeka Indonesia</span>
              <span aria-hidden="true">·</span>
              <span>SD Kelas 1–6</span>
              <span aria-hidden="true">·</span>
              <span>{gradeInfo.fase}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 leading-[1.15] text-balance">
              Petualangan Belajar Seru Menjelajahi Nusantara
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">
              Gerakkan karakter penjelajahmu melintasi enam dunia ilmu, kumpulkan koin,
              pecahkan misi setiap level, dan pelajari kuis lengkap dengan pembahasannya.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <ExplorerSprite
                avatar={player.avatar}
                accessory={player.equippedAccessory}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  Halo, {player.name}!
                </p>
                <p className="text-xs text-slate-600">
                  Level {levelInfo.level} · {levelInfo.title} · Aktif di{' '}
                  <span className="font-semibold text-slate-800">{gradeInfo.label}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('profile');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profil</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('worlds');
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Petualangan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('rewards');
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Toko & Hadiah</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Visual Banner */}
        <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[260px] lg:min-h-[380px] bg-slate-900">
          <ResilientImage
            src={ASSETS.heroBanner}
            alt="Ilustrasi kepulauan petualangan Nusantara"
            className="w-full h-full object-cover lg:absolute lg:inset-0"
            fallbackLabel="Peta Petualangan Nusantara"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-semibold text-amber-300">
              {gradeInfo.label} · {gradeInfo.fase} ({gradeInfo.ageHint})
            </p>
            <p className="mt-1 text-sm sm:text-base font-medium text-white/95 max-w-lg">
              {gradeInfo.summary}
            </p>
          </div>
        </div>
      </section>

      {/* 4-Column Player Summary Strip */}
      <section aria-label="Ringkasan Kemajuan Pemain" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Koin Ilmu</p>
            <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {player.coins}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Level Pemain</p>
            <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              Lv. {levelInfo.level}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Skor Total</p>
            <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {player.totalScore}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pos & Bintang</p>
            <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {totalCompletedAll} · {totalStarsAll}★
            </p>
          </div>
        </div>
      </section>

      {/* Grade 1-6 Selector */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Pilih Kelas Petualangan (1–6 SD)
            </h2>
            <p className="text-sm text-slate-600">
              Materi, misi, dan soal kuis otomatis menyesuaikan jenjang Kurikulum Merdeka yang dipilih.
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
            Kelas {player.selectedGrade}: {completedInGrade}/18 Pos Selesai
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {grades.map((g) => {
            const meta = GRADE_META[g];
            const isSelected = player.selectedGrade === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectGrade(g);
                }}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer min-h-[92px] ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-extrabold whitespace-nowrap">
                    Kelas {g}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isSelected ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {meta.fase}
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs ${
                    isSelected ? 'text-emerald-50' : 'text-slate-500'
                  }`}
                >
                  {meta.ageHint}
                </p>
                <p
                  className={`mt-2 text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-emerald-700'
                  }`}
                >
                  {isSelected ? 'Kelas Aktif' : 'Pilih Kelas'}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6 Adventure Worlds Quick Access */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Enam Dunia Petualangan — Kelas {player.selectedGrade}
            </h2>
            <p className="text-sm text-slate-600">
              Pilih dunia mata pelajaran untuk langsung menggerakkan karakter dan menaklukkan tantangan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('worlds');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Lihat Peta Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WORLDS.map((world) => {
            const curr = getWorldCurriculum(player.selectedGrade, world.id);
            const doneCount = [1, 2, 3].filter(
              (o) => player.missionProgress[`${player.selectedGrade}_${world.id}_${o}`]?.completed
            ).length;
            const stars = [1, 2, 3].reduce(
              (sum, o) =>
                sum +
                (player.missionProgress[`${player.selectedGrade}_${world.id}_${o}`]?.stars || 0),
              0
            );

            return (
              <div
                key={world.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm"
              >
                <div className="relative h-36 bg-slate-800 overflow-hidden">
                  <ResilientImage
                    src={world.backdropImage}
                    alt={`Latar dunia ${world.name}`}
                    className="w-full h-full object-cover"
                    fallbackLabel={world.name}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${world.skyGradient}`} />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
                    <div>
                      <p className="text-xs font-semibold text-white/90">{world.subject}</p>
                      <h3 className="font-display text-xl font-extrabold leading-tight">
                        {world.name}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold bg-slate-950/75 px-2.5 py-1 rounded-md tabular-nums whitespace-nowrap">
                      {stars}/9 ★
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{curr.materiTitle}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{world.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-600 font-mono tabular-nums">
                      {doneCount}/3 Pos Selesai
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onStartWorld(world.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${world.buttonClass}`}
                    >
                      <span>Masuk Dunia</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
