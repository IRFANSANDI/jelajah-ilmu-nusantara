import {
  ArrowRight,
  Award,
  Backpack,
  BookOpen,
  CheckCircle2,
  Coins,
  Compass,
  GraduationCap,
  HelpCircle,
  Map,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  getChapterById,
  getSubjectChapters,
} from '../game3d/curriculum';
import {
  getGradeCompletedCount,
  PlayerProgress3D,
  WORLD_THEMES,
} from '../game3d/curriculumData';
import { computeLevelStatus, GradeNumber, SUBJECTS } from '../game3d/inventoryData';
import { MenuTabId } from './MenuNav';

interface MenuHomeViewProps {
  progress: PlayerProgress3D;
  onStartPlay: (grade: GradeNumber, babOrder: 1 | 2 | 3 | 4) => void;
  onNavigateTab: (tab: MenuTabId) => void;
  onOpenTutorial?: () => void;
}

export function MenuHomeView({
  progress,
  onStartPlay,
  onNavigateTab,
  onOpenTutorial,
}: MenuHomeViewProps) {
  const activeWorld = WORLD_THEMES[progress.activeGrade];
  const activeChapter =
    getChapterById(progress.activeChapterId, progress.religion) ??
    getSubjectChapters(progress.activeGrade, progress.activeSubject, progress.religion)[0] ??
    getSubjectChapters(progress.activeGrade, 'bahasa-indonesia', progress.religion)[0];
  const activeSubjectMeta =
    SUBJECTS.find((s) => s.id === (activeChapter?.subjectId ?? progress.activeSubject)) ??
    SUBJECTS[0];
  const levelInfo = computeLevelStatus(progress.xp);
  const completedCount = progress.completedChapters.length;
  const xpIntoLevel = progress.xp - levelInfo.minXp;
  const xpSpan = Math.max(1, levelInfo.nextXp - levelInfo.minXp);
  const xpPct = Math.min(100, Math.round((xpIntoLevel / xpSpan) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-sky-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/15 text-amber-200 text-xs font-bold">
              <Compass className="w-4 h-4" />
              <span>Petualangan 3D Kurikulum SD Kelas 1 – 6</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Jelajahi 6 Dunia 3D Nusantara Bersama {progress.playerName}!
            </h2>

            <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed max-w-2xl">
              Setiap bab pembelajaran menghadirkan misi 3D khusus: kumpulkan balok huruf, hitung keranjang buah, dorong peti gaya, nyalakan saklar listrik, hingga jelajahi tata surya!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onStartPlay(progress.activeGrade, progress.activeBab)}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg cursor-pointer min-h-[48px]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  Lanjutkan: Kelas {progress.activeGrade} · {activeSubjectMeta.shortName}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('kelas')}
                className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm flex items-center gap-2 border border-white/20 cursor-pointer min-h-[48px]"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Pilih Kelas 1–6</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('materi')}
                className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm flex items-center gap-2 border border-white/20 cursor-pointer min-h-[48px]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Pilih Mapel & Bab</span>
              </button>

              {onOpenTutorial && (
                <button
                  type="button"
                  onClick={onOpenTutorial}
                  className="px-5 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-bold text-sm flex items-center gap-2 border border-amber-300/35 cursor-pointer min-h-[48px]"
                >
                  <HelpCircle className="w-4 h-4 text-amber-300" />
                  <span>Panduan Pemula</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Mission & Level Summary Card */}
          <div className="lg:col-span-5 bg-slate-950/55 border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Misi Aktif Saat Ini · {activeSubjectMeta.shortName}
                </p>
                <h3 className="font-display text-xl font-extrabold text-white mt-0.5">
                  {activeWorld.worldName}
                </h3>
                <p className="text-xs text-slate-200 mt-1">
                  {activeChapter ? activeChapter.title : ''}
                </p>
                <p className="text-[11px] font-semibold text-emerald-200 mt-1">
                  Karakter: {activeWorld.heroRoleName}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold shrink-0">
                Kelas {progress.activeGrade}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-200">
                  Level {levelInfo.level} · {levelInfo.title}
                </span>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  {progress.xp} XP
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-[11px] text-slate-300 flex items-center justify-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                  Koin
                </p>
                <p className="font-mono text-base font-extrabold text-white mt-0.5 tabular-nums">
                  {progress.coins}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-[11px] text-slate-300 flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sky-300" />
                  Skor
                </p>
                <p className="font-mono text-base font-extrabold text-white mt-0.5 tabular-nums">
                  {progress.score}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-[11px] text-slate-300 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Bab Lulus
                </p>
                <p className="font-mono text-base font-extrabold text-white mt-0.5 tabular-nums">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Menu Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab('peta')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
            <Map className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center justify-between">
            <span>Peta Petualangan</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Lihat 6 pulau 3D dan buka Bab 1–4 secara berurutan.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('materi')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center justify-between">
            <span>{SUBJECTS.length} Mata Pelajaran</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Bahasa Indonesia, Matematika, Pancasila, Agama, PJOK, Seni, IPAS (Kelas 1–6), Mulok & Inggris.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('inventaris')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Backpack className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center justify-between">
            <span>Inventaris 3D</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Tukar koin dengan topi, kacamata, mahkota & sayap 3D serta koleksi hadiah bab.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('prestasi')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center justify-between">
            <span>Prestasi & Profil</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {progress.unlockedAchievements.length} prestasi terbuka · Progres tersimpan otomatis.
          </p>
        </button>
      </section>

      {/* 6 Dunia Petualangan Preview */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Enam Dunia Petualangan 3D</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Setiap kelas memiliki lingkungan 3D, bangunan khas, NPC pemandu, dan misi bab berbeda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('kelas')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Kelola Kelas & Bab →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([1, 2, 3, 4, 5, 6] as GradeNumber[]).map((grade) => {
            const world = WORLD_THEMES[grade];
            const done = getGradeCompletedCount(progress, grade);
            const isCurrent = progress.activeGrade === grade;
            return (
              <div
                key={grade}
                className={`rounded-2xl bg-white border p-5 shadow-sm flex flex-col justify-between gap-4 ${
                  isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-1 rounded-lg text-white text-xs font-extrabold"
                      style={{ backgroundColor: world.badgeColor }}
                    >
                      Kelas {grade} SD
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-600">
                      {done}/4 Bab
                    </span>
                  </div>
                  <h4 className="font-display text-lg font-extrabold text-slate-900">
                    {world.worldName}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {world.description}
                  </p>
                  <div className="pt-1 space-y-0.5 text-[11px] font-semibold text-slate-600">
                    <p>
                      <span className="text-slate-900 font-bold">Karakter:</span> {world.heroRoleName}
                    </p>
                    <p>
                      <span className="text-slate-900 font-bold">Arsitektur:</span> {world.architectureTitle}
                    </p>
                    <p>
                      <span className="text-slate-900 font-bold">Alam & Hewan:</span> {world.creatureNames}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onStartPlay(grade, isCurrent ? progress.activeBab : 1)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Masuk Dunia 3D</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
