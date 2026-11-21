import { CheckCircle2, GraduationCap, Lock, Play } from 'lucide-react';
import { getSubjectChapters, getSubjectExamId } from '../game3d/curriculum';
import {
  getBabsByGrade,
  getGradeCompletedCount,
  isBabUnlocked,
  PlayerProgress3D,
  WORLD_THEMES,
} from '../game3d/curriculumData';
import { getSubjectsForGrade, GradeNumber, RELIGIONS } from '../game3d/inventoryData';

interface GradeSelect3DViewProps {
  progress: PlayerProgress3D;
  onSelectGradeAndBab: (grade: GradeNumber, babOrder: 1 | 2 | 3 | 4) => void;
  onLaunchWorld: (grade: GradeNumber, babOrder: 1 | 2 | 3 | 4) => void;
  onTriggerGradeUp?: (fromGrade: GradeNumber) => void;
}

export function GradeSelect3DView({
  progress,
  onSelectGradeAndBab,
  onLaunchWorld,
  onTriggerGradeUp,
}: GradeSelect3DViewProps) {
  const selectedWorld = WORLD_THEMES[progress.activeGrade];
  const babs = getBabsByGrade(progress.activeGrade);
  const subjects = getSubjectsForGrade(progress.activeGrade, progress.englishEnabled);
  const religionLabel =
    RELIGIONS.find((r) => r.id === progress.religion)?.label ?? 'Islam';
  const hasPassedExamInGrade = subjects.some((s) =>
    progress.completedSubjectExams.includes(
      getSubjectExamId(progress.activeGrade, s.id, progress.religion)
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Pilih Kelas & Sistem Bab Berurutan
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Pilih jenjang Kelas 1 hingga Kelas 6 SD. Pada setiap kelas, Bab 1 terbuka terlebih dahulu dan Bab berikutnya terbuka setelah Bab sebelumnya selesai.
        </p>
      </div>

      {/* Grade 1..6 Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {([1, 2, 3, 4, 5, 6] as GradeNumber[]).map((grade) => {
          const w = WORLD_THEMES[grade];
          const done = getGradeCompletedCount(progress, grade);
          const active = progress.activeGrade === grade;
          return (
            <button
              key={grade}
              type="button"
              onClick={() => onSelectGradeAndBab(grade, 1)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-extrabold text-white"
                  style={{ backgroundColor: w.badgeColor }}
                >
                  Kelas {grade}
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    active ? 'text-amber-300' : 'text-slate-500'
                  }`}
                >
                  {done}/4
                </span>
              </div>
              <p className="font-display text-sm font-extrabold mt-2 leading-snug">
                {w.worldName}
              </p>
              <p
                className={`text-[10px] mt-1 line-clamp-1 ${
                  active ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {w.heroRoleName}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Grade World & Sequential Babs */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <span
              className="inline-block px-3 py-1 rounded-lg text-white text-xs font-extrabold"
              style={{ backgroundColor: selectedWorld.badgeColor }}
            >
              {selectedWorld.tagline}
            </span>
            <h3 className="font-display text-2xl font-extrabold text-slate-900">
              {selectedWorld.worldName}
            </h3>
            <p className="text-sm text-slate-600">{selectedWorld.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200">
                <p className="text-[10px] font-extrabold uppercase text-sky-900">Karakter Utama</p>
                <p className="text-xs font-bold text-slate-800">{selectedWorld.heroRoleName}</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] font-extrabold uppercase text-emerald-900">Arsitektur & Alam</p>
                <p className="text-xs font-bold text-slate-800">{selectedWorld.architectureTitle}</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-extrabold uppercase text-amber-900">Makhluk Hidup</p>
                <p className="text-xs font-bold text-slate-800">{selectedWorld.creatureNames}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {subjects.map((subj) => {
                const chs = getSubjectChapters(
                  progress.activeGrade,
                  subj.id,
                  progress.religion
                );
                const doneChs = chs.filter((c) =>
                  progress.completedChapters.includes(c.id)
                ).length;
                return (
                  <span
                    key={subj.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold"
                  >
                    {subj.id === 'agama' ? `Agama (${religionLabel})` : subj.shortName}{' '}
                    <span className="text-emerald-700 font-mono">
                      ({doneChs}/{chs.length})
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onLaunchWorld(progress.activeGrade, progress.activeBab)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Masuk Dunia Kelas {progress.activeGrade} (Bab {progress.activeBab})</span>
            </button>

            {hasPassedExamInGrade && onTriggerGradeUp && (
              <button
                type="button"
                onClick={() => onTriggerGradeUp(progress.activeGrade)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>
                  {progress.activeGrade < 6
                    ? `Naik ke Kelas ${progress.activeGrade + 1}!`
                    : 'Rayakan Wisuda SD!'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Sequential Chapters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {babs.map((bab) => {
            const unlocked = isBabUnlocked(progress, bab.grade, bab.babOrder);
            const completed = progress.completedBabs.includes(bab.id);
            const bestScore = progress.babScores[bab.id] ?? 0;
            const isSelected = progress.activeBab === bab.babOrder;

            return (
              <div
                key={bab.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 ${
                  !unlocked
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : isSelected
                    ? 'bg-emerald-50/70 border-emerald-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-slate-500">
                      BAB {bab.babOrder}
                    </span>
                    {completed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selesai · Skor {bestScore}
                      </span>
                    ) : unlocked ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold">
                        Terbuka
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-600 text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        Terkunci
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-lg font-extrabold text-slate-900">
                    {bab.title}
                  </h4>
                  <p className="text-xs text-slate-600">{bab.subtitle}</p>
                  <p className="text-xs font-semibold text-amber-700">
                    Hadiah: +{bab.rewardCoins} Koin · +{bab.rewardXp} XP · {bab.rewardItemName}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/70">
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => onLaunchWorld(bab.grade, bab.babOrder)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Mainkan Misi Bab {bab.babOrder} di Dunia 3D</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold text-center">
                      Selesaikan Bab {bab.babOrder - 1} terlebih dahulu untuk membuka
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
