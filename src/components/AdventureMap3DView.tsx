import { CheckCircle2, Compass, DoorOpen, Lock, MapPin, Play, Users } from 'lucide-react';
import {
  getBabsByGrade,
  getGradeCompletedCount,
  isBabUnlocked,
  PlayerProgress3D,
  WORLD_THEMES,
} from '../game3d/curriculumData';
import { GRADE1_OPEN_WORLD_REGIONS, Grade1RegionId } from '../game3d/grade1SubjectWorlds';
import { GradeNumber, SubjectId } from '../game3d/inventoryData';

interface AdventureMap3DViewProps {
  progress: PlayerProgress3D;
  onLaunchWorld: (
    grade: GradeNumber,
    babOrder: 1 | 2 | 3 | 4,
    subjectId?: SubjectId,
    chapterId?: string,
    regionId?: Grade1RegionId | null
  ) => void;
}

export function AdventureMap3DView({
  progress,
  onLaunchWorld,
}: AdventureMap3DViewProps) {
  const discoveredRegions = progress.discoveredRegions ?? ['desa-ceria'];
  const visitedInteriors = progress.visitedInteriors ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <Compass className="w-7 h-7 text-emerald-600" />
          <span>Peta Petualangan Kepulauan Nusantara</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Pilih pulau 3D dari Kelas 1 hingga Kelas 6, jelajahi {GRADE1_OPEN_WORLD_REGIONS.length} kawasan Open World Kelas 1, atau pilih Bab untuk langsung berpetualang!
        </p>
      </div>

      {/* Archipelago Route Visual */}
      <div className="space-y-4">
        {([1, 2, 3, 4, 5, 6] as GradeNumber[]).map((grade) => {
          const world = WORLD_THEMES[grade];
          const babs = getBabsByGrade(grade);
          const doneCount = getGradeCompletedCount(progress, grade);

          return (
            <div
              key={grade}
              className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-lg text-white text-xs font-extrabold"
                      style={{ backgroundColor: world.badgeColor }}
                    >
                      Pulau Kelas {grade}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {world.landmarkLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      {world.npcs.map((n) => n.name).join(', ')}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-extrabold text-slate-900">
                    {world.worldName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    {world.description}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="block font-mono text-sm font-extrabold text-emerald-700">
                    {doneCount}/4 Bab Tuntas
                  </span>
                  {grade === 1 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-lg">
                      <DoorOpen className="w-3.5 h-3.5" />
                      {discoveredRegions.length}/{GRADE1_OPEN_WORLD_REGIONS.length} Kawasan · {visitedInteriors.length}/{GRADE1_OPEN_WORLD_REGIONS.length} Ruangan
                    </span>
                  )}
                </div>
              </div>

              {/* Connected Open-World Regions for Grade 1 */}
              {grade === 1 && (
                <div className="rounded-2xl bg-sky-50/70 border border-sky-200 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                        {GRADE1_OPEN_WORLD_REGIONS.length} Kawasan Open World 3D Kelas 1
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Semua kawasan terhubung dengan jalan, jembatan, dermaga pantai, serta {GRADE1_OPEN_WORLD_REGIONS.length} gedung yang bisa dimasuki!
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {GRADE1_OPEN_WORLD_REGIONS.map((reg) => {
                      const discovered = discoveredRegions.includes(reg.id);
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() =>
                            onLaunchWorld(
                              1,
                              1,
                              reg.relatedSubjects[0],
                              undefined,
                              reg.id
                            )
                          }
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                            discovered
                              ? 'bg-white border-sky-300 hover:border-sky-500 shadow-xs'
                              : 'bg-white/80 border-slate-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                                style={{ backgroundColor: reg.accentHex }}
                              >
                                {reg.name}
                              </span>
                              {discovered ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs font-extrabold text-slate-900">
                              {reg.subtitle}
                            </p>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                              {reg.description}
                            </p>
                          </div>
                          <span className="text-[11px] font-extrabold text-sky-700">
                            Kunjungi Kawasan →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4 Chapter Stepping Stones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {babs.map((bab) => {
                  const unlocked = isBabUnlocked(progress, grade, bab.babOrder);
                  const completed = progress.completedBabs.includes(bab.id);
                  return (
                    <button
                      key={bab.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => onLaunchWorld(grade, bab.babOrder)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        completed
                          ? 'bg-emerald-50 border-emerald-300 hover:border-emerald-500 cursor-pointer'
                          : unlocked
                          ? 'bg-sky-50 border-sky-300 hover:border-sky-500 cursor-pointer'
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-extrabold">
                            Bab {bab.babOrder}
                          </span>
                          {completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : unlocked ? (
                            <Play className="w-4 h-4 text-sky-600 fill-current" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <p className="font-display text-sm font-bold text-slate-900 line-clamp-2">
                          {bab.title.replace(/^Bab \d+: /, '')}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {completed
                          ? 'Mainkan Lagi'
                          : unlocked
                          ? 'Mulai Misi 3D →'
                          : `Buka setelah Bab ${bab.babOrder - 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
