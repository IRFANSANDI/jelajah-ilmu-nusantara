import { CheckCircle2, Compass, Lock, TrendingUp, Trophy } from 'lucide-react';
import { PlayerProgress3D } from '../game3d/curriculumData';
import { GRADE1_OPEN_WORLD_REGIONS } from '../game3d/grade1SubjectWorlds';
import { ACHIEVEMENTS } from '../game3d/inventoryData';

interface Achievements3DViewProps {
  progress: PlayerProgress3D;
}

export function Achievements3DView({ progress }: Achievements3DViewProps) {
  const unlockedCount = progress.unlockedAchievements.length;
  const discoveredCount = (progress.discoveredRegions ?? ['desa-ceria']).length;
  const interiorsCount = (progress.visitedInteriors ?? []).length;
  const masteredCount = (progress.masteredSkills ?? []).length;
  const practiceCount = (progress.needsPracticeSkills ?? []).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Prestasi Petualang Nusantara</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Setiap pencapaian yang terbuka memberikan bonus Koin Ilmu dan tercatat permanen di profilmu.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-sm font-extrabold">
          {unlockedCount} / {ACHIEVEMENTS.length} Terbuka
        </div>
      </div>

      {/* Exploration & Skill Mastery Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">
                Eksplorasi Dunia Terbuka Kelas 1
              </p>
              <p className="text-[11px] text-slate-600">
                {discoveredCount}/{GRADE1_OPEN_WORLD_REGIONS.length} Kawasan dijelajahi ·{' '}
                {interiorsCount}/{GRADE1_OPEN_WORLD_REGIONS.length} Ruangan dimasuki
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-extrabold text-sky-700 shrink-0">
            {discoveredCount}/{GRADE1_OPEN_WORLD_REGIONS.length}
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">
                Catatan Penguasaan Keterampilan
              </p>
              <p className="text-[11px] text-slate-600">
                {masteredCount} dikuasai · {practiceCount} perlu latihan tambahan
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-extrabold text-emerald-700 shrink-0">
            {masteredCount} ✓
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = progress.unlockedAchievements.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between gap-4 ${
                unlocked
                  ? 'bg-white border-emerald-400 ring-2 ring-emerald-400/20'
                  : 'bg-slate-50 border-slate-200 opacity-85'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-white text-[11px] font-extrabold"
                    style={{ backgroundColor: ach.accentHex }}
                  >
                    +{ach.rewardCoins} Koin Bonus
                  </span>
                  {unlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Tercapai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      Belum
                    </span>
                  )}
                </div>

                <h3 className="font-display text-lg font-extrabold text-slate-900">
                  {ach.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 text-[11px] font-bold text-slate-500">
                Syarat: {ach.requirementLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
