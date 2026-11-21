import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Lock, Sparkles } from 'lucide-react';
import { GradeLevel, PlayerState, WorldId } from '../types/game';
import { GRADE_META, WORLDS } from '../data/worlds';
import { getWorldCurriculum } from '../data/curriculum';
import { ResilientImage } from './ResilientImage';
import { soundEngine } from '../utils/sound';

interface WorldMapViewProps {
  player: PlayerState;
  onSelectGrade: (grade: GradeLevel) => void;
  onStartWorld: (worldId: WorldId) => void;
  onBackHome: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  player,
  onSelectGrade,
  onStartWorld,
  onBackHome,
}) => {
  const grades: GradeLevel[] = [1, 2, 3, 4, 5, 6];
  const gradeMeta = GRADE_META[player.selectedGrade];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <Compass className="w-4 h-4" />
            <span>Peta Petualangan Nusantara</span>
            <span aria-hidden="true">·</span>
            <span>{gradeMeta.fase}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Pilih Dunia Belajar — {gradeMeta.label}
          </h1>
          <p className="text-sm text-slate-600">{gradeMeta.summary}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBackHome();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Home</span>
        </button>
      </div>

      {/* Segmented Grade Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit">
        {grades.map((g) => {
          const active = player.selectedGrade === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onSelectGrade(g);
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${
                active
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelas {g}
            </button>
          );
        })}
      </div>

      {/* 6 Worlds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {WORLDS.map((world, idx) => {
          const curriculum = getWorldCurriculum(player.selectedGrade, world.id);
          const pos1Done = Boolean(
            player.missionProgress[`${player.selectedGrade}_${world.id}_1`]?.completed
          );
          const pos2Done = Boolean(
            player.missionProgress[`${player.selectedGrade}_${world.id}_2`]?.completed
          );
          const pos3Done = Boolean(
            player.missionProgress[`${player.selectedGrade}_${world.id}_3`]?.completed
          );
          const completedCount = [pos1Done, pos2Done, pos3Done].filter(Boolean).length;
          const totalStars = [1, 2, 3].reduce(
            (sum, o) =>
              sum +
              (player.missionProgress[`${player.selectedGrade}_${world.id}_${o}`]?.stars || 0),
            0
          );
          const treasureClaimed = Boolean(
            player.worldTreasureClaimed[`${player.selectedGrade}_${world.id}`]
          );

          return (
            <article
              key={world.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-800">
                <ResilientImage
                  src={world.backdropImage}
                  alt={`Dunia ${world.name}`}
                  className="w-full h-full object-cover"
                  fallbackLabel={world.name}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${world.skyGradient}`} />
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="text-xs font-bold bg-slate-950/75 px-2.5 py-1 rounded-md">
                    Dunia 0{idx + 1} · {world.subject}
                  </span>
                  <span className="font-mono text-xs font-bold bg-slate-950/75 px-2.5 py-1 rounded-md tabular-nums">
                    {totalStars}/9 ★
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h2 className="font-display text-2xl font-extrabold">{world.name}</h2>
                  <p className="text-xs text-white/90">{world.tagline}</p>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Materi Kurikulum Kelas {player.selectedGrade}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {curriculum.materiTitle}
                    </p>
                  </div>

                  {/* Mission Steps Preview */}
                  <ul className="space-y-2 pt-1">
                    {curriculum.missions.map((m) => {
                      const mp =
                        player.missionProgress[`${player.selectedGrade}_${world.id}_${m.order}`];
                      const prevDone =
                        m.order === 1 ||
                        Boolean(
                          player.missionProgress[
                            `${player.selectedGrade}_${world.id}_${m.order - 1}`
                          ]?.completed
                        );

                      return (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {mp?.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : prevDone ? (
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span
                              className={`truncate ${
                                mp?.completed
                                  ? 'font-semibold text-slate-900'
                                  : prevDone
                                  ? 'font-medium text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {m.title}
                            </span>
                          </div>
                          <span className="font-mono text-slate-500 tabular-nums shrink-0">
                            {mp?.completed ? `${mp.stars}★` : `+${m.rewardCoins} Koin`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {completedCount}/3
                    </span>{' '}
                    Pos ·{' '}
                    <span className="font-semibold text-amber-700">
                      {treasureClaimed ? 'Harta Terbuka' : 'Harta Menanti'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onStartWorld(world.id);
                    }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] ${world.buttonClass}`}
                  >
                    <span>Petualang di Sini</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
};
