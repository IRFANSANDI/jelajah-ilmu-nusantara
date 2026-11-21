import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Coins,
  Compass,
  Flag,
  Gift,
  Home,
  Lock,
  MapPin,
  Settings,
  Star,
  X,
} from 'lucide-react';
import { CheckpointMission, PlayerState, WorldId } from '../types/game';
import { getWorldById, GRADE_META } from '../data/worlds';
import { getWorldCurriculum } from '../data/curriculum';
import { getLevelInfo } from '../data/rewards';
import { ExplorerSprite } from './ExplorerSprite';
import { QuizModal } from './QuizModal';
import { ResilientImage } from './ResilientImage';
import { soundEngine } from '../utils/sound';

interface AdventureStageProps {
  player: PlayerState;
  worldId: WorldId;
  onCollectStageCoin: (amount: number) => void;
  onCompleteMission: (result: {
    worldId: WorldId;
    missionOrder: 1 | 2 | 3;
    stars: number;
    scoreEarned: number;
    coinsEarned: number;
    xpEarned: number;
    bestStreakInRun: number;
    passed: boolean;
  }) => void;
  onClaimTreasure: (worldId: WorldId) => void;
  onBackHome: () => void;
  onBackWorlds: () => void;
  onOpenSettings: () => void;
}

interface StageCoin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

interface FloatingNotice {
  id: number;
  text: string;
  x: number;
  y: number;
}

const NODE_POSITIONS = {
  materi: { x: 16, y: 27 },
  pos1: { x: 26, y: 69 },
  pos2: { x: 52, y: 37 },
  pos3: { x: 76, y: 66 },
  treasure: { x: 86, y: 25 },
};

const INITIAL_COINS: Omit<StageCoin, 'collected'>[] = [
  { id: 'c1', x: 21, y: 49 },
  { id: 'c2', x: 39, y: 54 },
  { id: 'c3', x: 46, y: 24 },
  { id: 'c4', x: 64, y: 52 },
  { id: 'c5', x: 79, y: 42 },
];

export const AdventureStage: React.FC<AdventureStageProps> = ({
  player,
  worldId,
  onCollectStageCoin,
  onCompleteMission,
  onClaimTreasure,
  onBackHome,
  onBackWorlds,
  onOpenSettings,
}) => {
  const world = getWorldById(worldId);
  const curriculum = getWorldCurriculum(player.selectedGrade, worldId);
  const gradeMeta = GRADE_META[player.selectedGrade];
  const levelInfo = getLevelInfo(player.xp);

  // Character position in % of arena (8..92 x, 16..85 y)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 14, y: 66 });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [clickTarget, setClickTarget] = useState<{ x: number; y: number } | null>(null);

  const [stageCoins, setStageCoins] = useState<StageCoin[]>(() =>
    INITIAL_COINS.map((c) => ({ ...c, collected: false }))
  );
  const [floatingNotices, setFloatingNotices] = useState<FloatingNotice[]>([]);

  const [showMateriModal, setShowMateriModal] = useState(false);
  const [activeMission, setActiveMission] = useState<CheckpointMission | null>(null);
  const [treasurePopup, setTreasurePopup] = useState(false);

  // Keyboard & D-Pad direction state
  const keysPressed = useRef<Record<string, boolean>>({});
  const dpadDir = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stepSoundThrottle = useRef<number>(0);

  // Reset stage coins and character start position when switching world or grade
  useEffect(() => {
    setPos({ x: 14, y: 66 });
    setClickTarget(null);
    setStageCoins(INITIAL_COINS.map((c) => ({ ...c, collected: false })));
    setActiveMission(null);
    setShowMateriModal(false);
  }, [worldId, player.selectedGrade]);

  const pos1Done = Boolean(
    player.missionProgress[`${player.selectedGrade}_${worldId}_1`]?.completed
  );
  const pos2Done = Boolean(
    player.missionProgress[`${player.selectedGrade}_${worldId}_2`]?.completed
  );
  const pos3Done = Boolean(
    player.missionProgress[`${player.selectedGrade}_${worldId}_3`]?.completed
  );
  const allPosDone = pos1Done && pos2Done && pos3Done;
  const treasureClaimed = Boolean(
    player.worldTreasureClaimed[`${player.selectedGrade}_${worldId}`]
  );

  const spawnNotice = useCallback((text: string, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setFloatingNotices((prev) => [...prev, { id, text, x, y }]);
    window.setTimeout(() => {
      setFloatingNotices((prev) => prev.filter((n) => n.id !== id));
    }, 1100);
  }, []);

  // Main 60fps movement loop
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const speedPerSec = player.settings.moveSpeed === 'fast' ? 36 : 24;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Pause movement while modal is open
      if (!activeMission && !showMateriModal && !treasurePopup) {
        let dx = dpadDir.current.dx;
        let dy = dpadDir.current.dy;

        const k = keysPressed.current;
        if (k['ArrowLeft'] || k['a'] || k['A']) dx -= 1;
        if (k['ArrowRight'] || k['d'] || k['D']) dx += 1;
        if (k['ArrowUp'] || k['w'] || k['W']) dy -= 1;
        if (k['ArrowDown'] || k['s'] || k['S']) dy += 1;

        if (dx !== 0 || dy !== 0) {
          // Manual input cancels click-to-move target
          setClickTarget(null);
          const mag = Math.hypot(dx, dy) || 1;
          const vx = (dx / mag) * speedPerSec * dt;
          const vy = (dy / mag) * speedPerSec * dt;

          if (dx < 0) setFacing('left');
          if (dx > 0) setFacing('right');
          setIsMoving(true);

          if (now - stepSoundThrottle.current > 240) {
            soundEngine.playStep();
            stepSoundThrottle.current = now;
          }

          setPos((prev) => ({
            x: Math.max(7, Math.min(93, prev.x + vx)),
            y: Math.max(15, Math.min(86, prev.y + vy)),
          }));
        } else if (clickTarget) {
          setPos((prev) => {
            const distX = clickTarget.x - prev.x;
            const distY = clickTarget.y - prev.y;
            const dist = Math.hypot(distX, distY);
            if (dist < 1.2) {
              setClickTarget(null);
              setIsMoving(false);
              return prev;
            }
            if (distX < -0.3) setFacing('left');
            if (distX > 0.3) setFacing('right');
            setIsMoving(true);
            if (now - stepSoundThrottle.current > 240) {
              soundEngine.playStep();
              stepSoundThrottle.current = now;
            }
            const step = Math.min(dist, speedPerSec * dt);
            return {
              x: Math.max(7, Math.min(93, prev.x + (distX / dist) * step)),
              y: Math.max(15, Math.min(86, prev.y + (distY / dist) * step)),
            };
          });
        } else {
          setIsMoving(false);
        }
      } else {
        setIsMoving(false);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeMission, showMateriModal, treasurePopup, clickTarget, player.settings.moveSpeed]);

  const triggerRef = useRef<() => void>(() => {});
  const modalOpenRef = useRef<boolean>(false);

  useEffect(() => {
    modalOpenRef.current = Boolean(activeMission || showMateriModal || treasurePopup);
  }, [activeMission, showMateriModal, treasurePopup]);

  // Keyboard listeners registered once
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        !modalOpenRef.current
      ) {
        e.preventDefault();
      }
      if (e.key === ' ' && !modalOpenRef.current) {
        e.preventDefault();
        triggerRef.current();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    const onBlur = () => {
      keysPressed.current = {};
      dpadDir.current = { dx: 0, dy: 0 };
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Coin collision check
  useEffect(() => {
    setStageCoins((prev) => {
      let changed = false;
      const updated = prev.map((coin) => {
        if (!coin.collected && Math.hypot(coin.x - pos.x, coin.y - pos.y) < 7.5) {
          changed = true;
          soundEngine.playCoin();
          onCollectStageCoin(5);
          spawnNotice('+5 Koin', coin.x, coin.y);
          return { ...coin, collected: true };
        }
        return coin;
      });
      return changed ? updated : prev;
    });
  }, [pos, onCollectStageCoin, spawnNotice]);

  // Determine nearest interactive node
  const getNearbyNode = ():
    | { type: 'materi'; label: string }
    | { type: 'mission'; mission: CheckpointMission; unlocked: boolean; label: string }
    | { type: 'treasure'; unlocked: boolean; claimed: boolean; label: string }
    | null => {
    const distMateri = Math.hypot(
      pos.x - NODE_POSITIONS.materi.x,
      pos.y - NODE_POSITIONS.materi.y
    );
    if (distMateri < 11) {
      return { type: 'materi', label: `Baca Materi bersama ${world.npcName}` };
    }

    const missionNodes = [
      { mission: curriculum.missions[0], coord: NODE_POSITIONS.pos1, unlocked: true },
      { mission: curriculum.missions[1], coord: NODE_POSITIONS.pos2, unlocked: pos1Done },
      { mission: curriculum.missions[2], coord: NODE_POSITIONS.pos3, unlocked: pos2Done },
    ];

    for (const mn of missionNodes) {
      if (Math.hypot(pos.x - mn.coord.x, pos.y - mn.coord.y) < 11) {
        return {
          type: 'mission',
          mission: mn.mission,
          unlocked: mn.unlocked,
          label: mn.unlocked
            ? `Buka ${mn.mission.title}`
            : `Selesaikan Pos ${mn.mission.order - 1} terlebih dahulu`,
        };
      }
    }

    const distTreasure = Math.hypot(
      pos.x - NODE_POSITIONS.treasure.x,
      pos.y - NODE_POSITIONS.treasure.y
    );
    if (distTreasure < 11) {
      return {
        type: 'treasure',
        unlocked: allPosDone,
        claimed: treasureClaimed,
        label: treasureClaimed
          ? 'Peti Harta Dunia Sudah Diklaim'
          : allPosDone
          ? 'Buka Peti Harta Dunia (+50 Koin!)'
          : 'Selesaikan Pos 1, 2, dan 3 untuk Membuka Peti Harta',
      };
    }

    return null;
  };

  const nearbyNode = getNearbyNode();

  const handleOpenMission = (mission: CheckpointMission, unlocked: boolean) => {
    if (!unlocked) {
      soundEngine.playWrong();
      spawnNotice('Pos Terkunci!', pos.x, pos.y - 6);
      return;
    }
    soundEngine.playClick();
    setActiveMission(mission);
  };

  const handleOpenTreasure = () => {
    if (!allPosDone) {
      soundEngine.playWrong();
      spawnNotice('Selesaikan 3 Pos Dulu!', NODE_POSITIONS.treasure.x, NODE_POSITIONS.treasure.y);
      return;
    }
    if (!treasureClaimed) {
      soundEngine.playUnlock();
      onClaimTreasure(worldId);
      setTreasurePopup(true);
    }
  };

  const triggerNearbyInteraction = () => {
    const near = getNearbyNode();
    if (!near) return;
    if (near.type === 'materi') {
      soundEngine.playClick();
      setShowMateriModal(true);
    } else if (near.type === 'mission') {
      handleOpenMission(near.mission, near.unlocked);
    } else if (near.type === 'treasure') {
      handleOpenTreasure();
    }
  };
  triggerRef.current = triggerNearbyInteraction;

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setClickTarget({
      x: Math.max(7, Math.min(93, xPct)),
      y: Math.max(15, Math.min(86, yPct)),
    });
  };

  const setDpad = (dx: number, dy: number) => {
    dpadDir.current = { dx, dy };
  };

  const collectedStageCoins = stageCoins.filter((c) => c.collected).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Compact Game HUD Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onBackHome();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onBackWorlds();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Peta Dunia</span>
            </button>

            <div className="hidden md:block pl-2 border-l border-slate-700">
              <p className="text-xs font-bold text-white leading-tight">{world.name}</p>
              <p className="text-[11px] text-slate-300 leading-tight">
                {gradeMeta.label} · {world.subject}
              </p>
            </div>
          </div>

          {/* Live HUD Metrics + Settings */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 font-mono text-xs font-bold tabular-nums">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{player.coins}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 font-mono text-xs font-bold tabular-nums">
              <span className="text-slate-400">Skor</span>
              <span>{player.totalScore}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700/80 font-mono text-xs font-bold tabular-nums">
              <span>Lv.{levelInfo.level}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenSettings();
              }}
              aria-label="Pengaturan Game"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Zone Adventure Layout */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone (8 cols): Interactive 2D World Stage */}
        <section className="lg:col-span-8 space-y-3">
          {/* Interactive Map Canvas */}
          <div
            ref={stageRef}
            onClick={handleStageClick}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md select-none cursor-crosshair bg-emerald-900"
            aria-label={`Area Petualangan ${world.name}`}
          >
            {/* Backdrop Artwork */}
            <ResilientImage
              src={world.backdropImage}
              alt={`Peta interaktif ${world.name}`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              fallbackLabel={world.name}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundColor: world.groundTint }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/35 pointer-events-none" />

            {/* Winding Adventure Trail SVG */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <path
                d={`M ${NODE_POSITIONS.materi.x} ${NODE_POSITIONS.materi.y} Q 18 52 ${NODE_POSITIONS.pos1.x} ${NODE_POSITIONS.pos1.y} T ${NODE_POSITIONS.pos2.x} ${NODE_POSITIONS.pos2.y} T ${NODE_POSITIONS.pos3.x} ${NODE_POSITIONS.pos3.y} T ${NODE_POSITIONS.treasure.x} ${NODE_POSITIONS.treasure.y}`}
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.4"
                strokeDasharray="2.5 2"
              />
            </svg>

            {/* Click-to-Move Marker */}
            {clickTarget && (
              <div
                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-amber-300 bg-amber-300/25 pointer-events-none animate-ping"
                style={{ left: `${clickTarget.x}%`, top: `${clickTarget.y}%` }}
              />
            )}

            {/* Collectible Map Coins */}
            {stageCoins.map(
              (coin) =>
                !coin.collected && (
                  <div
                    key={coin.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-coin-spin"
                    style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 border-2 border-amber-100 shadow-md flex items-center justify-center">
                      <span className="font-mono text-[11px] font-extrabold text-amber-950">
                        Rp
                      </span>
                    </div>
                  </div>
                )
            )}

            {/* Node: Gulungan Materi (NPC Pemandu) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                setShowMateriModal(true);
              }}
              style={{
                left: `${NODE_POSITIONS.materi.x}%`,
                top: `${NODE_POSITIONS.materi.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus-visible:outline-none"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-sky-600 hover:bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold whitespace-nowrap shadow">
                Materi ({world.npcName})
              </span>
            </button>

            {/* Nodes: Pos Tantangan 1, 2, 3 */}
            {[
              {
                mission: curriculum.missions[0],
                coord: NODE_POSITIONS.pos1,
                done: pos1Done,
                unlocked: true,
              },
              {
                mission: curriculum.missions[1],
                coord: NODE_POSITIONS.pos2,
                done: pos2Done,
                unlocked: pos1Done,
              },
              {
                mission: curriculum.missions[2],
                coord: NODE_POSITIONS.pos3,
                done: pos3Done,
                unlocked: pos2Done,
              },
            ].map(({ mission, coord, done, unlocked }) => {
              const stars =
                player.missionProgress[`${player.selectedGrade}_${worldId}_${mission.order}`]
                  ?.stars || 0;
              return (
                <button
                  key={mission.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMission(mission, unlocked);
                  }}
                  style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-white shadow-lg flex flex-col items-center justify-center transition-transform group-hover:scale-105 ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : unlocked
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : unlocked ? (
                      <Flag className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                    <span className="font-mono text-[10px] font-extrabold leading-none mt-0.5">
                      POS {mission.order}
                    </span>
                  </div>

                  <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold whitespace-nowrap shadow">
                    {done ? `${stars}★ Selesai` : unlocked ? `Pos ${mission.order}` : 'Terkunci'}
                  </span>
                </button>
              );
            })}

            {/* Node: Peti Harta Dunia */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTreasure();
              }}
              style={{
                left: `${NODE_POSITIONS.treasure.x}%`,
                top: `${NODE_POSITIONS.treasure.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer"
            >
              <div
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                  treasureClaimed
                    ? 'bg-slate-600 text-slate-200'
                    : allPosDone
                    ? 'bg-rose-600 text-white animate-float-slow'
                    : 'bg-slate-800/90 text-slate-400'
                }`}
              >
                <Gift className="w-6 h-6" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold whitespace-nowrap shadow">
                {treasureClaimed ? 'Harta Terbuka' : 'Peti Harta'}
              </span>
            </button>

            {/* Movable Main Character */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <ExplorerSprite
                avatar={player.avatar}
                accessory={player.equippedAccessory}
                isMoving={isMoving}
                facing={facing}
                size="md"
                playerName={player.name}
              />
            </div>

            {/* Floating Reward Popups */}
            {floatingNotices.map((n) => (
              <div
                key={n.id}
                style={{ left: `${n.x}%`, top: `${n.y - 6}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono text-xs font-extrabold shadow-md pointer-events-none animate-pop-in"
              >
                {n.text}
              </div>
            ))}

            {/* Proximity Action Bar */}
            {nearbyNode && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerNearbyInteraction();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-white border border-amber-400/70 text-xs sm:text-sm font-bold shadow-xl whitespace-nowrap cursor-pointer min-h-[44px]"
                >
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{nearbyNode.label}</span>
                  <span className="hidden sm:inline text-[11px] text-amber-300 font-mono">
                    [Spasi]
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Controls Help + Mobile D-Pad */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Kendali Karakter · Koin Peta: {collectedStageCoins}/5
              </p>
              <p className="text-xs text-slate-600">
                Gunakan tombol panah / WASD di laptop, klik langsung di peta, atau pakai tombol arah di samping.
              </p>
            </div>

            {/* On-screen Touch D-Pad (Visible on mobile or when enabled in settings) */}
            <div
              className={`items-center gap-2 ${
                player.settings.showTouchPad === 'always' ? 'flex' : 'flex lg:hidden'
              }`}
            >
              <div className="grid grid-cols-3 gap-1.5 touch-none">
                <div />
                <button
                  type="button"
                  aria-label="Gerak ke Atas"
                  onPointerDown={() => setDpad(0, -1)}
                  onPointerUp={() => setDpad(0, 0)}
                  onPointerCancel={() => setDpad(0, 0)}
                  onPointerLeave={() => setDpad(0, 0)}
                  className="w-11 h-11 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer select-none touch-none"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div />
                <button
                  type="button"
                  aria-label="Gerak ke Kiri"
                  onPointerDown={() => setDpad(-1, 0)}
                  onPointerUp={() => setDpad(0, 0)}
                  onPointerCancel={() => setDpad(0, 0)}
                  onPointerLeave={() => setDpad(0, 0)}
                  className="w-11 h-11 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer select-none touch-none"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Gerak ke Bawah"
                  onPointerDown={() => setDpad(0, 1)}
                  onPointerUp={() => setDpad(0, 0)}
                  onPointerCancel={() => setDpad(0, 0)}
                  onPointerLeave={() => setDpad(0, 0)}
                  className="w-11 h-11 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer select-none touch-none"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Gerak ke Kanan"
                  onPointerDown={() => setDpad(1, 0)}
                  onPointerUp={() => setDpad(0, 0)}
                  onPointerCancel={() => setDpad(0, 0)}
                  onPointerLeave={() => setDpad(0, 0)}
                  className="w-11 h-11 rounded-lg bg-slate-100 active:bg-emerald-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer select-none touch-none"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Zone (4 cols): Mission Deck & Kurikulum Merdeka Guide */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Curriculum Materi Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-700">
                {curriculum.faseLabel} · {world.subject}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowMateriModal(true);
                }}
                className="text-xs font-bold text-sky-700 hover:underline cursor-pointer whitespace-nowrap"
              >
                Perbesar Materi
              </button>
            </div>
            <h2 className="font-display text-lg font-extrabold text-slate-900">
              {curriculum.materiTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {curriculum.materiSummary}
            </p>
            <ul className="space-y-1.5 pt-1 border-t border-slate-100">
              {curriculum.materiPoints.map((pt, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-mono font-bold text-emerald-600 mt-0.5">0{i + 1}.</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missions Checklist */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="font-display text-lg font-extrabold text-slate-900">
              Misi & Tantangan Level
            </h3>

            <div className="space-y-2.5">
              {curriculum.missions.map((m) => {
                const progress =
                  player.missionProgress[`${player.selectedGrade}_${worldId}_${m.order}`];
                const unlocked =
                  m.order === 1 ||
                  Boolean(
                    player.missionProgress[
                      `${player.selectedGrade}_${worldId}_${m.order - 1}`
                    ]?.completed
                  );

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      progress?.completed
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : unlocked
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{m.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{m.objective}</p>
                      </div>
                      {progress?.completed && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= progress.stars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-semibold text-slate-500 tabular-nums">
                        +{m.rewardCoins} Koin · +{m.rewardXp} XP
                      </span>
                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => handleOpenMission(m, unlocked)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 min-h-[36px] ${
                          !unlocked
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : progress?.completed
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                            : `${world.buttonClass} cursor-pointer`
                        }`}
                      >
                        {!unlocked ? 'Terkunci' : progress?.completed ? 'Ulangi' : 'Mulai Misi'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Treasure Box Action */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-amber-950">Peti Harta Dunia</p>
                  <p className="text-xs text-amber-800">
                    {treasureClaimed
                      ? 'Hadiah bonus dunia ini telah diklaim!'
                      : allPosDone
                      ? 'Semua pos selesai! Klaim +50 Koin & +100 XP.'
                      : 'Selesaikan Pos 1–3 untuk membuka peti.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!allPosDone || treasureClaimed}
                  onClick={handleOpenTreasure}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 min-h-[38px] ${
                    treasureClaimed
                      ? 'bg-amber-200 text-amber-800 cursor-default'
                      : allPosDone
                      ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                      : 'bg-amber-200/70 text-amber-700 cursor-not-allowed'
                  }`}
                >
                  {treasureClaimed ? 'Diklaim' : 'Klaim'}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* NPC Materi Modal */}
      {showMateriModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-pop-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-sky-700">
                  {world.npcName} · {world.npcRole}
                </p>
                <h2 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">
                  {curriculum.materiTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowMateriModal(false);
                }}
                className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                aria-label="Tutup materi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{curriculum.materiSummary}</p>

            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
              <p className="text-xs font-bold text-sky-900">Poin Penting Kurikulum Merdeka:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-sky-950">
                {curriculum.materiPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowMateriModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold cursor-pointer min-h-[44px]"
              >
                Siap Berpetualang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Treasure Claimed Modal */}
      {treasurePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-pop-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-600">
              <Gift className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">
              Harta Dunia Terbuka!
            </h2>
            <p className="text-sm text-slate-600">
              Selamat! Kamu menaklukkan seluruh pos tantangan di {world.name} ({gradeMeta.label}).
            </p>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 font-mono text-sm font-bold text-amber-900">
              Bonus: +50 Koin Ilmu · +100 XP
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setTreasurePopup(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer min-h-[44px]"
            >
              Mantap! Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* Interactive Quiz Modal */}
      {activeMission && (
        <QuizModal
          world={world}
          curriculum={curriculum}
          mission={activeMission}
          alreadyCompleted={Boolean(
            player.missionProgress[
              `${player.selectedGrade}_${worldId}_${activeMission.order}`
            ]?.completed
          )}
          onClose={() => setActiveMission(null)}
          onCompleteMission={(res) => {
            onCompleteMission({
              worldId,
              ...res,
            });
          }}
        />
      )}
    </div>
  );
};
