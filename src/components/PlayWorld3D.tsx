import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Armchair,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Coins,
  Compass,
  Eye,
  EyeOff,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Hand,
  Lightbulb,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  PenTool,
  Play,
  Puzzle,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  buildChapter3DMission,
  Chapter3DStation,
} from '../game3d/chapterWorldAdapter';
import {
  CombinedExamQuestion,
  getChapterById,
  getCombinedGradeExamQuestions,
  getSubjectChapters,
  getSubjectExamId,
  getSubjectFinalExamQuestions,
  isSubjectChapterUnlocked,
  isSubjectFinalExamUnlocked,
  PlayerProgress3D,
  SavedArtwork,
  SubjectChapter,
} from '../game3d/curriculum';
import { WORLD_THEMES } from '../game3d/curriculumData';
import {
  computeLevelStatus,
  getSubjectsForGrade,
  GradeNumber,
  LOCAL_REGIONS,
  LocalRegionId,
  RELIGIONS,
  ReligionId,
  SUBJECTS,
  SubjectId,
} from '../game3d/inventoryData';
import { sound3d } from '../game3d/sound3d';
import {
  Grade1HudCarried,
  Grade1NearbyAction,
  Grade2NearbyAction,
  Grade3NearbyAction,
  Grade4NearbyAction,
  WorldEngine,
} from '../game3d/WorldEngine';
import {
  createInitialGrade1Bag,
  GRADE1_OPEN_WORLD_REGIONS,
  getGrade1ChapterActivityMeta,
  getGrade1SubjectFlowMeta,
  getGrade1WorldTheme,
  Grade1BagState,
  Grade1LabKind,
  Grade1RegionId,
} from '../game3d/grade1SubjectWorlds';
import type { CharacterAnimState, Grade1SeatSpot } from '../game3d/characterAnimation';
import type { Grade1InteriorId } from '../game3d/grade1Interiors';
import { GRADE1_PICKUP_ITEMS } from '../game3d/grade1World';
import {
  CropType,
  GRADE2_LOCATIONS,
  Grade2SimState,
  loadGrade2SimState,
} from '../game3d/grade2World';
import {
  GRADE3_CHALLENGES,
  GRADE3_LOCATIONS,
  Grade3ExpState,
  loadGrade3ExpState,
} from '../game3d/grade3World';
import {
  GRADE4_LOCATIONS,
  GRADE4_PUZZLES,
  Grade4PuzzleState,
  loadGrade4PuzzleState,
} from '../game3d/grade4World';
import { NpcDefinition } from '../game3d/worldData';
import { AdaptiveQuizResult, AdaptiveQuizRunner } from './AdaptiveQuizRunner';
import { ChapterVisualIllustration } from './ChapterVisualIllustration';
import { Grade1InteractiveLabModal } from './Grade1InteractiveTools';
import { Grade3ExplorationModal, Grade4PuzzleModal } from './Grade34PuzzleModal';
import { InWorldCurriculumModal } from './InWorldCurriculumModal';
import { TouchJoystick } from './TouchJoystick';

interface PlayWorld3DProps {
  grade: GradeNumber;
  progress: PlayerProgress3D;
  initialRegionId?: Grade1RegionId | null;
  onExitToMenu: () => void;
  onToggleSound: () => void;
  onCollectRewards: (coins: number, score: number, xp: number) => void;
  onNpcTalked: (npcId: string) => void;
  onDiscoverRegion?: (regionId: string) => void;
  onVisitInterior?: (interiorId: string) => void;
  onRecordMission?: (missionId: string) => void;
  onMarketBalanceChange?: (deltaCoins: number, deltaXp: number) => void;
  onSelectActiveSubject: (subjectId: SubjectId) => void;
  onSelectActiveChapter: (chapterId: string, subjectId: SubjectId) => void;
  onSelectReligion?: (religion: ReligionId) => void;
  onSelectLocalRegion?: (region: LocalRegionId) => void;
  onSaveArtwork?: (artwork: SavedArtwork) => void;
  onMarkChapterStudied: (chapterId: string) => void;
  onCompleteChapterQuiz: (
    chapter: SubjectChapter,
    scorePct: number,
    earnedCoins: number,
    earnedXp: number,
    diagnostics?: AdaptiveQuizResult
  ) => void;
  onCompleteSubjectExam: (
    examId: string,
    scorePct: number,
    grade: GradeNumber,
    subjectId: SubjectId
  ) => void;
  onTriggerGradeUp?: (fromGrade: GradeNumber) => void;
}

export function PlayWorld3D({
  grade,
  progress,
  initialRegionId,
  onExitToMenu,
  onToggleSound,
  onCollectRewards,
  onNpcTalked,
  onDiscoverRegion,
  onVisitInterior,
  onRecordMission,
  onMarketBalanceChange,
  onSelectActiveSubject,
  onSelectActiveChapter,
  onSelectReligion,
  onSelectLocalRegion,
  onSaveArtwork,
  onMarkChapterStudied,
  onCompleteChapterQuiz,
  onCompleteSubjectExam,
  onTriggerGradeUp,
}: PlayWorld3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<WorldEngine | null>(null);

  const levelInfo = computeLevelStatus(progress.xp);

  // Resolve the active single-subject SubjectChapter strictly for this run
  const activeChapter = useMemo<SubjectChapter>(() => {
    const found = getChapterById(progress.activeChapterId, progress.religion);
    if (found && found.grade === grade) {
      return found;
    }
    const subjChapters = getSubjectChapters(
      grade,
      progress.activeSubject,
      progress.religion
    );
    if (subjChapters.length > 0) return subjChapters[0];
    return getSubjectChapters(grade, 'bahasa-indonesia', progress.religion)[0];
  }, [grade, progress.activeChapterId, progress.activeSubject, progress.religion]);

  const worldTheme = useMemo(
    () =>
      grade === 1
        ? getGrade1WorldTheme(
            activeChapter.subjectId,
            progress.religion,
            progress.localRegion ?? 'jawa'
          )
        : WORLD_THEMES[grade],
    [grade, activeChapter.subjectId, progress.religion, progress.localRegion]
  );

  const g1FlowMeta = useMemo(
    () =>
      grade === 1
        ? getGrade1SubjectFlowMeta(
            activeChapter.subjectId,
            progress.religion,
            progress.localRegion ?? 'jawa'
          )
        : null,
    [grade, activeChapter.subjectId, progress.religion, progress.localRegion]
  );

  const g1ChapterActivity = useMemo(
    () =>
      grade === 1
        ? getGrade1ChapterActivityMeta(
            activeChapter,
            progress.religion,
            progress.localRegion ?? 'jawa'
          )
        : null,
    [grade, activeChapter, progress.religion, progress.localRegion]
  );

  const grade1Subjects = useMemo(
    () => (grade === 1 ? getSubjectsForGrade(1, progress.englishEnabled) : []),
    [grade, progress.englishEnabled]
  );

  const subjectMeta = useMemo(
    () => SUBJECTS.find((s) => s.id === activeChapter.subjectId) ?? SUBJECTS[0],
    [activeChapter.subjectId]
  );

  const subjectChapters = useMemo(
    () => getSubjectChapters(grade, activeChapter.subjectId, progress.religion),
    [grade, activeChapter.subjectId, progress.religion]
  );

  const nextChapter = useMemo(
    () =>
      subjectChapters.find(
        (c) => c.chapterNumber === activeChapter.chapterNumber + 1
      ),
    [subjectChapters, activeChapter.chapterNumber]
  );

  const chapterMission = useMemo(
    () => buildChapter3DMission(activeChapter, worldTheme),
    [activeChapter, worldTheme]
  );

  const hasPassedExamInGrade = useMemo(() => {
    const subjs = getSubjectsForGrade(grade, progress.englishEnabled);
    return subjs.some((s) =>
      progress.completedSubjectExams.includes(
        getSubjectExamId(grade, s.id, progress.religion)
      )
    );
  }, [grade, progress.englishEnabled, progress.completedSubjectExams, progress.religion]);

  const [nearbyNpc, setNearbyNpc] = useState<NpcDefinition | null>(null);
  const [nearbyStation, setNearbyStation] = useState<Chapter3DStation | null>(null);
  const [carriedItem, setCarriedItem] = useState<Grade1HudCarried | null>(null);
  const [nearbyG1Action, setNearbyG1Action] = useState<Grade1NearbyAction | null>(null);
  const [g1Bag, setG1Bag] = useState<Grade1BagState>(() =>
    createInitialGrade1Bag(activeChapter.subjectId)
  );
  const [activeGrade1Lab, setActiveGrade1Lab] = useState<Grade1LabKind | null>(null);
  const [nearbyG2Node, setNearbyG2Node] = useState<Grade2NearbyAction | null>(null);
  const [g2Sim, setG2Sim] = useState<Grade2SimState | null>(() =>
    grade === 2 ? loadGrade2SimState() : null
  );
  const [nearbyG3Node, setNearbyG3Node] = useState<Grade3NearbyAction | null>(null);
  const [g3Exp, setG3Exp] = useState<Grade3ExpState | null>(() =>
    grade === 3 ? loadGrade3ExpState() : null
  );
  const [activeG3ChallengeBab, setActiveG3ChallengeBab] = useState<number | null>(null);
  const [nearbyG4Node, setNearbyG4Node] = useState<Grade4NearbyAction | null>(null);
  const [g4Puzzle, setG4Puzzle] = useState<Grade4PuzzleState | null>(() =>
    grade === 4 ? loadGrade4PuzzleState() : null
  );
  const [carriedCrystalLabel, setCarriedCrystalLabel] = useState<string | null>(null);
  const [activeG4PuzzleBab, setActiveG4PuzzleBab] = useState<number | null>(null);
  const [marketOpen, setMarketOpen] = useState(false);
  const [g1CompletedPickups, setG1CompletedPickups] = useState<string[]>([]);
  const [g1NumberPadsLit, setG1NumberPadsLit] = useState(0);
  const [currentRegion, setCurrentRegion] = useState<{
    id: Grade1RegionId;
    name: string;
  }>(() => {
    const found =
      GRADE1_OPEN_WORLD_REGIONS.find((r) => r.id === initialRegionId) ??
      GRADE1_OPEN_WORLD_REGIONS[0];
    return { id: found.id, name: found.name };
  });
  const [activeInterior, setActiveInterior] = useState<{
    id: Grade1InteriorId;
    name: string;
  } | null>(null);
  const [activeNpc, setActiveNpc] = useState<NpcDefinition | null>(null);
  const [npcTriviaSolved, setNpcTriviaSolved] = useState<Record<string, boolean>>({});
  const [npcWrongOptions, setNpcWrongOptions] = useState<number[]>([]);
  const [npcHintStep, setNpcHintStep] = useState<0 | 1 | 2>(0);
  const [triviaFeedback, setTriviaFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  // Character sitting & animation pose state
  const [isSeated, setIsSeated] = useState(false);
  const [activeSeatLabel, setActiveSeatLabel] = useState<string | null>(null);
  const [activeSeatContext, setActiveSeatContext] = useState<
    Grade1SeatSpot['locationContext'] | null
  >(null);
  const [activePoseState, setActivePoseState] = useState<CharacterAnimState>('idle');

  // Per-chapter 3D mission tracking
  const [completedStationIds, setCompletedStationIds] = useState<string[]>([]);
  const [npcsTalkedLocal, setNpcsTalkedLocal] = useState<string[]>([]);

  // Mandatory Pre-Challenge Materi Explanation Gate + Quiz / Final Exam Modals
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizMode, setQuizMode] = useState<'chapter' | 'exam'>('chapter');

  const g2MathChapters = useMemo(
    () => (grade === 2 ? getSubjectChapters(2, 'matematika', progress.religion) : []),
    [grade, progress.religion]
  );
  const g2ExamUnlocked = useMemo(
    () => (grade === 2 ? isSubjectFinalExamUnlocked(progress, g2MathChapters) : false),
    [grade, progress, g2MathChapters]
  );
  const g2ExamQuestions = useMemo(
    () => (grade === 2 ? getSubjectFinalExamQuestions(2, 'matematika', progress.religion) : []),
    [grade, progress.religion]
  );

  const combinedExamQuestions = useMemo<CombinedExamQuestion[]>(
    () =>
      grade === 1 || grade === 3 || grade === 4
        ? getCombinedGradeExamQuestions(grade, progress.religion, progress.englishEnabled)
        : [],
    [grade, progress.religion, progress.englishEnabled]
  );
  const g3ExamUnlocked = useMemo(() => {
    if (grade !== 3) return false;
    const solvedAllChallenges = (g3Exp?.challengesSolved.length ?? 0) >= 8;
    const completedG3Chapters = progress.completedChapters.filter((id) =>
      id.startsWith('g3-')
    ).length;
    return solvedAllChallenges || completedG3Chapters >= 8;
  }, [grade, g3Exp, progress.completedChapters]);
  const g4ExamUnlocked = useMemo(() => {
    if (grade !== 4) return false;
    const solvedAllPuzzles = (g4Puzzle?.puzzlesSolved.length ?? 0) >= 8;
    const completedG4Chapters = progress.completedChapters.filter((id) =>
      id.startsWith('g4-')
    ).length;
    return solvedAllPuzzles || completedG4Chapters >= 8;
  }, [grade, g4Puzzle, progress.completedChapters]);

  // Clean HUD panels (mutually exclusive & collapsible) + Mode Layar Bersih (hideUi)
  const [hideUi, setHideUi] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMissionBox, setShowMissionBox] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUa = /android|iphone|ipad|ipod|mobile|tablet|silk|kindle/.test(ua);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const narrow = window.innerWidth <= 1024;
    return hasTouch || coarse || isMobileUa || narrow;
  });
  const touchManualOffRef = useRef(false);
  const [sprintLocked, setSprintLocked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const callbacksRef = useRef({
    onCollectRewards,
    onNpcTalked,
    onDiscoverRegion,
    onVisitInterior,
    onRecordMission,
    onMarketBalanceChange,
  });
  callbacksRef.current = {
    onCollectRewards,
    onNpcTalked,
    onDiscoverRegion,
    onVisitInterior,
    onRecordMission,
    onMarketBalanceChange,
  };
  const startExamRef = useRef<() => void>(() => {});
  const savedArtworksRef = useRef(progress.savedArtworks ?? []);
  savedArtworksRef.current = progress.savedArtworks ?? [];

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    window.setTimeout(() => {
      setNotice((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  useEffect(() => {
    sound3d.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Auto-activate touch controls immediately on any Android/touch input unless manually turned off
  useEffect(() => {
    const activateIfTouch = () => {
      if (!touchManualOffRef.current) {
        setShowTouchControls(true);
      }
    };
    const onPointerDownTouch = (e: PointerEvent) => {
      if (e.pointerType === 'touch') activateIfTouch();
    };
    window.addEventListener('touchstart', activateIfTouch, { passive: true });
    window.addEventListener('pointerdown', onPointerDownTouch, { passive: true });
    return () => {
      window.removeEventListener('touchstart', activateIfTouch);
      window.removeEventListener('pointerdown', onPointerDownTouch);
    };
  }, []);

  // Reset mission tracking & ALWAYS show pre-challenge Materi explanation whenever active chapter changes
  useEffect(() => {
    setCompletedStationIds([]);
    setNpcsTalkedLocal([]);
    setNpcTriviaSolved({});
    setCarriedItem(null);
    setNearbyG1Action(null);
    setG1Bag(createInitialGrade1Bag(activeChapter.subjectId));
    setActiveGrade1Lab(null);
    setNearbyG2Node(null);
    setNearbyG3Node(null);
    setNearbyG4Node(null);
    setCarriedCrystalLabel(null);
    setActiveG3ChallengeBab(null);
    setActiveG4PuzzleBab(null);
    setMarketOpen(false);
    setG1CompletedPickups([]);
    setG1NumberPadsLit(0);
    setActiveInterior(null);
    setActiveNpc(null);
    setNpcWrongOptions([]);
    setNpcHintStep(0);
    setNearbyNpc(null);
    setNearbyStation(null);
    setIsSeated(false);
    setActiveSeatLabel(null);
    setActiveSeatContext(null);
    setActivePoseState('idle');
    setBriefingOpen(true);
    setShowCurriculumModal(false);
    setMenuOpen(false);
    setShowMissionBox(false);
    setQuizOpen(false);
    setQuizMode('chapter');
  }, [activeChapter.id, activeChapter.subjectId]);

  // Mount Three.js WorldEngine tailored to activeChapter & chapterMission
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const engine = new WorldEngine(
      container,
      {
        theme: worldTheme,
        heroStyle: progress.heroStyle,
        equippedAccessory: progress.equippedAccessory,
        chapterMission,
        grade1Context:
          grade === 1
            ? {
                subjectId: activeChapter.subjectId,
                chapterId: activeChapter.id,
                religion: progress.religion,
                localRegion: progress.localRegion ?? 'jawa',
                savedArtworks: savedArtworksRef.current,
              }
            : undefined,
      },
      {
        onHudTick: (data) => {
          setNearbyNpc(data.nearbyNpc);
          setNearbyStation(data.nearbyStation);
          setCarriedItem(data.carriedItem ?? null);
          setNearbyG1Action(data.nearbyGrade1Action ?? null);
          if (data.grade1Bag) {
            setG1Bag(data.grade1Bag);
          }
          if (data.currentRegionId && data.currentRegionName) {
            setCurrentRegion((prev) =>
              prev.id === data.currentRegionId ? prev : { id: data.currentRegionId!, name: data.currentRegionName! }
            );
          }
          if (data.activeInteriorId && data.activeInteriorName) {
            setActiveInterior((prev) =>
              prev && prev.id === data.activeInteriorId
                ? prev
                : { id: data.activeInteriorId!, name: data.activeInteriorName! }
            );
          } else {
            setActiveInterior((prev) => (prev === null ? null : null));
          }
          setNearbyG2Node(data.nearbyGrade2Node ?? null);
          setNearbyG3Node(data.nearbyGrade3Node ?? null);
          setNearbyG4Node(data.nearbyGrade4Node ?? null);
          setCarriedCrystalLabel(data.carriedCrystalLabel ?? null);
          setIsSeated(Boolean(data.isSeated));
          setActiveSeatLabel(data.activeSeatLabel ?? null);
          setActiveSeatContext(data.activeSeatContext ?? null);
          if (data.activePoseState) {
            setActivePoseState(data.activePoseState);
          }
        },
        onCollectItem: (item) => {
          const xpGain = item.kind === 'crystal' ? 12 : 6;
          callbacksRef.current.onCollectRewards(item.valueCoins, item.valueScore, xpGain);
          showNotice(
            item.kind === 'crystal'
              ? `Permata Alam ditemukan! (+${item.valueCoins} Koin)`
              : `+${item.valueCoins} Koin Ilmu · +${xpGain} XP`
          );
        },
        onStationCompleted: (station) => {
          callbacksRef.current.onCollectRewards(10, 60, 20);
          setCompletedStationIds((prev) =>
            prev.includes(station.id) ? prev : [...prev, station.id]
          );
          showNotice(station.completionMessage);
        },
        onGrade1Event: (ev) => {
          if (ev.rewardCoins > 0 || ev.rewardScore > 0 || ev.rewardXp > 0) {
            callbacksRef.current.onCollectRewards(
              ev.rewardCoins,
              ev.rewardScore,
              ev.rewardXp
            );
          }
          if (ev.bagState) {
            setG1Bag(ev.bagState);
          }
          if (ev.type === 'enter-interior' && ev.interiorId) {
            setActiveInterior({ id: ev.interiorId, name: ev.message });
            callbacksRef.current.onVisitInterior?.(ev.interiorId);
          } else if (ev.type === 'exit-interior') {
            setActiveInterior(null);
          } else if (ev.type === 'discover-region' && ev.regionId) {
            const regMeta = GRADE1_OPEN_WORLD_REGIONS.find((r) => r.id === ev.regionId);
            if (regMeta) {
              setCurrentRegion({ id: regMeta.id, name: regMeta.name });
            }
            callbacksRef.current.onDiscoverRegion?.(ev.regionId);
          } else if (ev.type === 'custom-interact') {
            callbacksRef.current.onRecordMission?.(ev.message);
          }
          if (ev.type === 'open-lab' && ev.openLabKind) {
            setActiveGrade1Lab(ev.openLabKind);
          }
          if (ev.completedPickupId) {
            setG1CompletedPickups((prev) =>
              prev.includes(ev.completedPickupId!) ? prev : [...prev, ev.completedPickupId!]
            );
          }
          if (typeof ev.numberPadCount === 'number') {
            setG1NumberPadsLit(ev.numberPadCount);
          }
          showNotice(ev.message);
        },
        onGrade2Event: (ev) => {
          setG2Sim(ev.simState);
          if (ev.rewardCoins !== 0 || ev.rewardScore !== 0 || ev.rewardXp !== 0) {
            callbacksRef.current.onCollectRewards(
              ev.rewardCoins,
              ev.rewardScore,
              ev.rewardXp
            );
          }
          if (ev.type === 'open-market') {
            setMarketOpen(true);
          }
          showNotice(ev.message);
        },
        onGrade3Event: (ev) => {
          setG3Exp(ev.expState);
          if (ev.rewardCoins !== 0 || ev.rewardScore !== 0 || ev.rewardXp !== 0) {
            callbacksRef.current.onCollectRewards(
              ev.rewardCoins,
              ev.rewardScore,
              ev.rewardXp
            );
          }
          if (ev.type === 'open-challenge') {
            setActiveG3ChallengeBab(ev.bab);
          } else if (ev.type === 'open-kuil-exam') {
            startExamRef.current();
          }
          showNotice(ev.message);
        },
        onGrade4Event: (ev) => {
          setG4Puzzle(ev.puzzleState);
          setCarriedCrystalLabel(ev.carriedCrystalLabel ?? null);
          if (ev.rewardCoins !== 0 || ev.rewardScore !== 0 || ev.rewardXp !== 0) {
            callbacksRef.current.onCollectRewards(
              ev.rewardCoins,
              ev.rewardScore,
              ev.rewardXp
            );
          }
          if (ev.type === 'open-puzzle') {
            setActiveG4PuzzleBab(ev.bab);
          } else if (ev.type === 'open-istana-exam') {
            startExamRef.current();
          }
          showNotice(ev.message);
        },
        onOpenNpc: (npc) => {
          setActiveNpc(npc);
          setNpcWrongOptions([]);
          setNpcHintStep(0);
          setTriviaFeedback(null);
          callbacksRef.current.onNpcTalked(npc.id);
          setNpcsTalkedLocal((prev) =>
            prev.includes(npc.id) ? prev : [...prev, npc.id]
          );
        },
        onContextLost: (lost) => {
          setContextLost(lost);
        },
      }
    );

    engineRef.current = engine;
    if (grade === 1) {
      setG1Bag(
        engine.getGrade1BagState() ?? createInitialGrade1Bag(activeChapter.subjectId)
      );
      if (initialRegionId) {
        engine.teleportToRegion(initialRegionId);
        const regMeta = GRADE1_OPEN_WORLD_REGIONS.find((r) => r.id === initialRegionId);
        if (regMeta) {
          setCurrentRegion({ id: regMeta.id, name: regMeta.name });
        }
        callbacksRef.current.onDiscoverRegion?.(initialRegionId);
      }
    } else if (grade === 2) {
      setG2Sim(engine.getGrade2SimState());
    } else if (grade === 3) {
      setG3Exp(engine.getGrade3ExpState());
    } else if (grade === 4) {
      setG4Puzzle(engine.getGrade4PuzzleState());
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [
    grade,
    worldTheme,
    chapterMission,
    activeChapter.id,
    activeChapter.subjectId,
    progress.religion,
    progress.localRegion,
    progress.heroStyle,
    progress.equippedAccessory,
    initialRegionId,
    showNotice,
  ]);

  // Update 3D Gallery Easels live without resetting WebGL scene when saving artworks
  useEffect(() => {
    if (grade === 1) {
      engineRef.current?.updateGrade1Easels(progress.savedArtworks ?? []);
    }
  }, [grade, progress.savedArtworks]);

  const anyOverlayOpen =
    Boolean(activeNpc) ||
    briefingOpen ||
    showCurriculumModal ||
    quizOpen ||
    marketOpen ||
    activeGrade1Lab !== null ||
    activeG3ChallengeBab !== null ||
    activeG4PuzzleBab !== null;

  useEffect(() => {
    engineRef.current?.setPaused(anyOverlayOpen);
  }, [anyOverlayOpen]);

  // Keyboard shortcuts H (toggle Hide UI) and Escape (close modals/panels)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyH' && !anyOverlayOpen) {
        setHideUi((v) => !v);
      } else if (e.code === 'Escape') {
        if (activeGrade1Lab !== null) setActiveGrade1Lab(null);
        else if (activeG3ChallengeBab !== null) setActiveG3ChallengeBab(null);
        else if (activeG4PuzzleBab !== null) setActiveG4PuzzleBab(null);
        else if (marketOpen) setMarketOpen(false);
        else if (quizOpen) setQuizOpen(false);
        else if (showCurriculumModal) setShowCurriculumModal(false);
        else if (briefingOpen) {
          onMarkChapterStudied(activeChapter.id);
          setBriefingOpen(false);
        } else if (activeNpc) {
          engineRef.current?.triggerNpcTalk(null);
          setActiveNpc(null);
        }
        else if (menuOpen) setMenuOpen(false);
        else if (showMissionBox) setShowMissionBox(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    anyOverlayOpen,
    activeNpc,
    briefingOpen,
    showCurriculumModal,
    quizOpen,
    marketOpen,
    activeGrade1Lab,
    activeG3ChallengeBab,
    activeG4PuzzleBab,
    menuOpen,
    showMissionBox,
    activeChapter.id,
    onMarkChapterStudied,
  ]);

  const handleConfirmBriefing = () => {
    onMarkChapterStudied(activeChapter.id);
    setBriefingOpen(false);
  };

  const closeNpcModal = () => {
    engineRef.current?.triggerNpcTalk(null);
    setActiveNpc(null);
  };

  const handleAnswerNpcTrivia = (npc: NpcDefinition, optionIdx: number) => {
    if (npcTriviaSolved[npc.id] || npcWrongOptions.includes(optionIdx)) return;
    const isCorrect = optionIdx === npc.trivia.correctIndex;

    if (isCorrect) {
      sound3d.playMissionComplete();
      engineRef.current?.triggerNpcCelebrate(npc.id);
      setNpcTriviaSolved((prev) => ({ ...prev, [npc.id]: true }));
      onCollectRewards(npc.trivia.rewardCoins, npc.trivia.rewardScore, 25);
      setTriviaFeedback({
        correct: true,
        message: `Benar! +${npc.trivia.rewardCoins} Koin, +${npc.trivia.rewardScore} Skor & +25 XP. ${npc.trivia.explanation}`,
      });
    } else {
      sound3d.playAlertCue();
      const nextWrong = [...npcWrongOptions, optionIdx];
      setNpcWrongOptions(nextWrong);
      const nextHint: 0 | 1 | 2 = nextWrong.length === 1 ? 1 : 2;
      setNpcHintStep(nextHint);
      const hintText =
        npc.trivia.hints?.[nextHint - 1] ??
        (nextHint === 1
          ? 'Baca ulang pertanyaannya pelan-pelan dan coba pilihan lainnya!'
          : npc.trivia.explanation);
      setTriviaFeedback({
        correct: false,
        message: `Belum tepat — yuk coba lagi! Petunjuk ${nextHint}: ${hintText}`,
      });
    }
  };

  const startChapterQuiz = useCallback(
    (mode: 'chapter' | 'exam' = 'chapter') => {
      onMarkChapterStudied(activeChapter.id);
      engineRef.current?.triggerNpcTalk(null);
      setActiveNpc(null);
      setBriefingOpen(false);
      setMarketOpen(false);
      setActiveG3ChallengeBab(null);
      setActiveG4PuzzleBab(null);
      setQuizMode(mode);
      setQuizOpen(true);
    },
    [activeChapter.id, onMarkChapterStudied]
  );

  startExamRef.current = () => startChapterQuiz('exam');

  const activeQuizQuestions =
    quizMode === 'exam' && grade === 2 && g2ExamQuestions.length > 0
      ? g2ExamQuestions
      : quizMode === 'exam' && (grade === 1 || grade === 3 || grade === 4) && combinedExamQuestions.length > 0
      ? combinedExamQuestions
      : activeChapter.questions;

  const handleCompleteAdaptiveQuiz = (res: AdaptiveQuizResult) => {
    const pct = res.scorePct;
    if (quizMode === 'exam' && grade === 1) {
      if (pct >= 60) {
        onRecordMission?.('g1-combined-exam');
      }
      onCompleteSubjectExam(
        getSubjectExamId(1, activeChapter.subjectId, progress.religion),
        pct,
        1,
        activeChapter.subjectId
      );
    } else if (quizMode === 'exam' && grade === 2) {
      onCompleteSubjectExam(
        getSubjectExamId(2, 'matematika', progress.religion),
        pct,
        2,
        'matematika'
      );
    } else if (quizMode === 'exam' && grade === 3) {
      if (pct >= 60) {
        setG3Exp(engineRef.current?.markGrade3KuilCompleted() ?? g3Exp);
      }
      onCompleteSubjectExam(
        getSubjectExamId(3, activeChapter.subjectId, progress.religion),
        pct,
        3,
        activeChapter.subjectId
      );
    } else if (quizMode === 'exam' && grade === 4) {
      if (pct >= 60) {
        setG4Puzzle(engineRef.current?.markGrade4IstanaCompleted() ?? g4Puzzle);
      }
      onCompleteSubjectExam(
        getSubjectExamId(4, activeChapter.subjectId, progress.religion),
        pct,
        4,
        activeChapter.subjectId
      );
    } else {
      onCompleteChapterQuiz(
        activeChapter,
        pct,
        res.firstTryCorrect * 5,
        res.firstTryCorrect * 15,
        res
      );
    }
  };

  const stationsDoneCount = completedStationIds.length;
  const stationsTotal = chapterMission.stations.length;
  const allStationsDone = stationsTotal > 0 && stationsDoneCount >= stationsTotal;
  const alreadyCompletedChapter = progress.completedChapters.includes(activeChapter.id);
  const mentorNpc = chapterMission.chapterNpcsOverrides[0];
  const g2BagCropsCount = g2Sim
    ? g2Sim.cropsInBag.wortel +
      g2Sim.cropsInBag.jagung +
      g2Sim.cropsInBag.kubis +
      g2Sim.cropsInBag.tomat
    : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-200 select-none">
      {/* Three.js WebGL Mount Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        aria-label={`Dunia 3D ${worldTheme.worldName} - ${activeChapter.title}`}
      />

      {/* WebGL Context Lost Safe Fallback */}
      {contextLost && (
        <div className="absolute inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
          <h2 className="font-display text-2xl font-bold">
            Konteks Grafis 3D Sedang Dipulihkan
          </h2>
          <p className="text-sm text-slate-300 max-w-md">
            Peramban sempat menjeda tampilan WebGL. Muat ulang halaman jika tampilan tidak otomatis kembali.
          </p>
        </div>
      )}

      {/* TOP SLIM TRANSLUCENT HUD: Kelas, Mapel, Koin, XP, Level + Collapsible Menu & Hide UI */}
      {!anyOverlayOpen && (
        <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 z-20 flex items-start justify-between gap-2 pointer-events-none">
          {!hideUi ? (
            <div className="flex flex-col items-start gap-1.5 min-w-0 max-w-[calc(100vw-110px)]">
              <div className="pointer-events-auto bg-slate-950/45 border border-white/15 text-white rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs min-w-0 max-w-full">
                <span className="font-extrabold text-amber-300 whitespace-nowrap shrink-0">
                  Kelas {grade}
                </span>
                <span aria-hidden="true" className="text-white/35 hidden sm:inline">
                  ·
                </span>
                <span className="hidden sm:inline text-slate-100 font-semibold truncate max-w-[180px] md:max-w-[260px]">
                  {subjectMeta.shortName} Bab {activeChapter.chapterNumber}
                </span>
                <span aria-hidden="true" className="text-white/35">
                  ·
                </span>
                <span className="font-mono font-bold tabular-nums text-amber-300 flex items-center gap-1 whitespace-nowrap shrink-0">
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  {progress.coins}
                </span>
                <span aria-hidden="true" className="text-white/35">
                  ·
                </span>
                <span className="font-mono font-bold tabular-nums text-emerald-300 whitespace-nowrap shrink-0">
                  {progress.xp} XP
                </span>
                <span aria-hidden="true" className="text-white/35 hidden xs:inline sm:inline">
                  ·
                </span>
                <span className="font-mono font-bold tabular-nums text-sky-300 whitespace-nowrap shrink-0">
                  Lv.{levelInfo.level}
                </span>
              </div>

              {/* Compact Grade 1 Subject World HUD Strip, Interactive Lab & Live Switchers */}
              {grade === 1 && g1FlowMeta && (
                <>
                  <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 max-w-full">
                    <div className="bg-slate-950/60 border border-white/15 text-white rounded-lg px-2.5 py-1 shadow-sm text-[11px] font-bold flex items-center gap-2 max-w-full truncate">
                      <span className="text-sky-300 font-extrabold truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0 text-amber-300" />
                        {activeInterior ? activeInterior.name : currentRegion.name}
                      </span>
                      <span aria-hidden="true" className="text-white/35">
                        ·
                      </span>
                      <span className="font-mono text-emerald-200 truncate">
                        {activeChapter.subjectId === 'matematika'
                          ? `Bagus:${g1Bag.goodFruits} Busuk:${g1Bag.rottenFruits}${g1Bag.cubeNetInspected ? ' Kubus✓' : ''}`
                          : activeChapter.subjectId === 'pancasila'
                          ? `Sampah:${g1Bag.trashCollected} Pilah:${g1Bag.trashSorted}/6`
                          : activeChapter.subjectId === 'ipas'
                          ? `Mekar:${g1Bag.plantsBloomed}/3${g1Bag.hasWaterBucket ? ' Air✓' : ''}`
                          : activeChapter.subjectId === 'pjok'
                          ? `Lompat:${g1Bag.hurdlesJumped}/3 Titian:${g1Bag.balanceSuccess ? '✓' : '0/1'} Cuci:${g1Bag.handWashed ? '✓' : '0/1'}`
                          : activeChapter.subjectId === 'seni-budaya'
                          ? `Warna:${g1Bag.colorsMixed} Nada:${g1Bag.musicNotesPlayed}`
                          : activeChapter.subjectId === 'bahasa-inggris'
                          ? `Kata:${g1Bag.englishWordsHeard}/6`
                          : activeChapter.subjectId === 'muatan-lokal'
                          ? `Pos:${g1Bag.stepsDiscovered.length}/3 Musik:${g1Bag.musicNotesPlayed}`
                          : activeChapter.subjectId === 'agama'
                          ? `Pos Akhlak:${g1Bag.stepsDiscovered.length}/3`
                          : `Kata:${g1Bag.wordsAssembled} Balok:${g1CompletedPickups.length}/${GRADE1_PICKUP_ITEMS.length} Ubin:${g1NumberPadsLit}/5`}
                      </span>
                    </div>

                    {activeInterior && (
                      <button
                        type="button"
                        onClick={() => engineRef.current?.exitInterior()}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>Keluar Ruangan</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveGrade1Lab(g1ChapterActivity?.labKind ?? g1FlowMeta.labKind)
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                      <span>{g1ChapterActivity?.activityTitle ?? g1FlowMeta.labTitle}</span>
                    </button>

                    {activeChapter.subjectId === 'agama' && onSelectReligion && (
                      <select
                        aria-label="Pilih Agama Dunia Kerohanian"
                        value={progress.religion}
                        onChange={(e) => onSelectReligion(e.target.value as ReligionId)}
                        className="px-2 py-1 rounded-lg bg-slate-950/70 border border-white/20 text-white text-[11px] font-bold cursor-pointer"
                      >
                        {RELIGIONS.map((r) => (
                          <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                            {r.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {activeChapter.subjectId === 'muatan-lokal' && onSelectLocalRegion && (
                      <select
                        aria-label="Pilih Daerah Kampung Budaya"
                        value={progress.localRegion ?? 'jawa'}
                        onChange={(e) => onSelectLocalRegion(e.target.value as LocalRegionId)}
                        className="px-2 py-1 rounded-lg bg-slate-950/70 border border-white/20 text-white text-[11px] font-bold cursor-pointer"
                      >
                        {LOCAL_REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.id} className="bg-slate-900 text-white">
                            {reg.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {activeChapter.subjectId === 'ipas' && g1Bag.chasedByPredator && !g1Bag.inSafeZone && (
                    <div
                      role="alert"
                      className="pointer-events-none bg-rose-600/95 text-white rounded-lg px-2.5 py-1 shadow-md border border-rose-200 text-[11px] font-extrabold flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Awas Serigala Hutan! Lari ke Zona Aman Hijau!</span>
                    </div>
                  )}

                  {activeChapter.subjectId === 'ipas' && g1Bag.inSafeZone && (
                    <div className="pointer-events-none bg-emerald-700/85 text-emerald-50 rounded-lg px-2.5 py-1 shadow-sm border border-emerald-300/40 text-[11px] font-extrabold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Zona Aman Hijau ✓</span>
                    </div>
                  )}

                  {carriedItem && (
                    <div className="pointer-events-none bg-amber-400/90 text-slate-950 rounded-lg px-2.5 py-1 shadow-sm border border-amber-200 text-[11px] font-extrabold flex items-center gap-1.5 max-w-full truncate">
                      <Hand className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        Bawa {carriedItem.shortLabel} → Antar ke {carriedItem.targetLabel}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Compact Desa Ceria life-simulation bag strip strictly for Grade 2 */}
              {grade === 2 && g2Sim && (
                <div className="pointer-events-none bg-emerald-950/65 text-emerald-100 rounded-lg px-2.5 py-1 shadow-sm border border-emerald-400/30 text-[11px] font-bold flex items-center gap-2 max-w-full truncate">
                  <Sprout className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="truncate font-mono">
                    Sayur: {g2BagCropsCount} · Pakan: {g2Sim.feedBag} · Susu/Telur: {g2Sim.eggsAndMilk}
                  </span>
                </div>
              )}

              {/* Compact Hutan Misteri Exploration HUD strip strictly for Grade 3 */}
              {grade === 3 && g3Exp && (
                <div className="pointer-events-none bg-emerald-950/65 text-emerald-100 rounded-lg px-2.5 py-1 shadow-sm border border-emerald-400/30 text-[11px] font-bold flex items-center gap-2 max-w-full truncate">
                  <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate font-mono">
                    Petunjuk: {g3Exp.cluesFound.length}/2 · Spesimen: {g3Exp.specimensObserved.length}/3 · Misi: {g3Exp.challengesSolved.length}/8
                  </span>
                </div>
              )}

              {/* Compact Pulau Teka-Teki Puzzle Adventure strip strictly for Grade 4 */}
              {grade === 4 && g4Puzzle && (
                <>
                  <div className="pointer-events-none bg-slate-900/70 text-cyan-100 rounded-lg px-2.5 py-1 shadow-sm border border-cyan-400/30 text-[11px] font-bold flex items-center gap-2 max-w-full truncate">
                    <Puzzle className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span className="truncate font-mono">
                      Jembatan: {g4Puzzle.bridgeExtended ? 'Terbuka' : 'Terkunci'} · Pintu: {g4Puzzle.doorsUnlocked.length}/2 · Kristal: {g4Puzzle.placedCrystals.length}/3
                    </span>
                  </div>
                  {carriedCrystalLabel && (
                    <div className="pointer-events-none bg-amber-400/90 text-slate-950 rounded-lg px-2.5 py-1 shadow-sm border border-amber-200 text-[11px] font-extrabold flex items-center gap-1.5 max-w-full truncate">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        Bawa {carriedCrystalLabel} → Pasang di alas warna Gua Kristal
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Top-Right Compact Action Icons: Collapsible Menu & Hide UI Toggle */}
          <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
            {!hideUi && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setShowMissionBox(false);
                }}
                title="Menu, Pengaturan, Suara & Pilih Bab"
                aria-label="Buka Menu Permainan"
                aria-expanded={menuOpen}
                className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors ${
                  menuOpen
                    ? 'bg-slate-900 border-amber-300/60 text-amber-300'
                    : 'bg-slate-950/50 hover:bg-slate-950/75 border-white/20 text-white'
                }`}
              >
                <Menu className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setHideUi((v) => !v);
                setMenuOpen(false);
                setShowMissionBox(false);
              }}
              title={hideUi ? 'Tampilkan Antarmuka [H]' : 'Mode Layar Bersih / Sembunyikan UI [H]'}
              aria-label={hideUi ? 'Tampilkan Antarmuka' : 'Sembunyikan Antarmuka'}
              className={`h-9 ${
                hideUi ? 'px-2.5' : 'w-9'
              } rounded-xl bg-slate-950/45 hover:bg-slate-950/75 border border-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors`}
            >
              {hideUi ? (
                <>
                  <Eye className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Tampilkan UI</span>
                </>
              ) : (
                <EyeOff className="w-4 h-4 shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE MENU PANEL (Menu Utama, Suara, Pengaturan, Pilih Bab) */}
      {!hideUi && !anyOverlayOpen && menuOpen && (
        <div
          className="absolute top-13 right-2.5 sm:top-14 sm:right-3 z-30 w-60 bg-slate-950/90 border border-white/20 text-white rounded-2xl p-2.5 shadow-2xl space-y-1 text-xs"
          role="menu"
        >
          <div className="px-2 py-1 flex items-center justify-between border-b border-white/10 mb-1">
            <span className="font-extrabold text-amber-300 text-[11px]">
              Menu & Pengaturan
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup Menu"
              className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setShowCurriculumModal(true);
            }}
            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 font-bold text-left cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pilih Mapel & Bab</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setBriefingOpen(true);
            }}
            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 font-bold text-left cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Baca Materi Bab {activeChapter.chapterNumber}</span>
          </button>

          {hasPassedExamInGrade && onTriggerGradeUp && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onTriggerGradeUp(grade);
              }}
              className="w-full px-2.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 flex items-center gap-2 font-extrabold text-left cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{grade < 6 ? `Naik Kelas ${grade + 1}!` : 'Wisuda SD!'}</span>
            </button>
          )}

          <div className="border-t border-white/10 my-1" />

          <button
            type="button"
            onClick={onToggleSound}
            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 flex items-center justify-between font-semibold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {progress.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>Suara & Musik</span>
            </span>
            <span className="text-[11px] font-mono text-amber-300">
              {progress.soundEnabled ? 'Aktif' : 'Mati'}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setShowTouchControls((v) => {
                const next = !v;
                touchManualOffRef.current = !next;
                return next;
              })
            }
            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 flex items-center justify-between font-semibold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Joystick Sentuh</span>
            </span>
            <span className="text-[11px] font-mono text-amber-300">
              {showTouchControls ? 'Aktif' : 'Mati'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              engineRef.current?.resetCameraBehindPlayer();
              setMenuOpen(false);
            }}
            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 font-semibold text-left cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-300 shrink-0" />
            <span>Pusatkan Kamera</span>
          </button>

          <button
            type="button"
            onClick={() => {
              engineRef.current?.respawnToVillage();
              setMenuOpen(false);
            }}
            className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 font-semibold text-left cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-300 shrink-0" />
            <span>Kembali ke Awal Pulau</span>
          </button>

          <div className="border-t border-white/10 my-1" />

          <button
            type="button"
            onClick={onExitToMenu}
            className="w-full px-2.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 flex items-center gap-2 font-bold text-left cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Kembali ke Menu Utama</span>
          </button>

          <p className="px-2 pt-1 text-[10px] text-slate-400 leading-snug">
            Keyboard: WASD/Panah gerak · Shift lari · Spasi lompat · E aksi · H layar bersih
          </p>
        </div>
      )}

      {/* RIGHT-SIDE COLLAPSIBLE MATERI & MISI PANEL (Icon Only When Closed) */}
      {!hideUi && !anyOverlayOpen && !menuOpen && (
        <div className="absolute top-13 right-2.5 sm:top-14 sm:right-3 z-10 flex flex-col items-end">
          {!showMissionBox ? (
            <button
              type="button"
              onClick={() => setShowMissionBox(true)}
              title={`Buka Panel Materi & Misi (${stationsDoneCount}/${stationsTotal})`}
              aria-label="Buka Panel Materi dan Misi"
              className="w-10 h-10 rounded-xl bg-slate-950/50 hover:bg-slate-950/80 border border-white/20 text-amber-300 flex items-center justify-center shadow-md cursor-pointer relative transition-colors"
            >
              <Target className="w-5 h-5" />
              <span className="sr-only">Panel Materi dan Misi</span>
            </button>
          ) : (
            <div className="w-60 sm:w-64 bg-slate-950/80 border border-white/15 text-white rounded-2xl p-3 shadow-xl space-y-2.5 text-xs max-h-[58vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold text-amber-300 truncate">
                    {subjectMeta.shortName} · Bab {activeChapter.chapterNumber}
                  </p>
                  <p className="text-[10px] text-slate-300 truncate">
                    {chapterMission.zoneTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMissionBox(false)}
                  aria-label="Tutup Panel Materi dan Misi"
                  className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-200 leading-snug">
                {chapterMission.objectiveBanner}
              </p>

              {/* Compact Checklist */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-200 truncate">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        npcsTalkedLocal.includes(mentorNpc.id)
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">Mentor {mentorNpc.name}</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-300 shrink-0">
                    {npcsTalkedLocal.includes(mentorNpc.id) ? 'Sudah' : 'Belum'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-200 truncate">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        allStationsDone ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{chapterMission.missionVerb}</span>
                  </span>
                  <span className="font-mono font-bold tabular-nums text-sky-300 shrink-0">
                    {stationsDoneCount}/{stationsTotal}
                  </span>
                </div>
              </div>

              {/* Station Chips */}
              <div className="grid grid-cols-2 gap-1">
                {chapterMission.stations.map((st) => {
                  const done = completedStationIds.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 truncate ${
                        done
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3 h-3 shrink-0 ${
                          done ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate">{st.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Grade 1 9 Subject Worlds Checklist & World Switcher */}
              {grade === 1 && g1FlowMeta && (
                <div className="pt-1.5 border-t border-white/10 space-y-1.5 text-[10px]">
                  <p className="font-bold text-amber-300 flex items-center justify-between gap-1">
                    <span className="truncate">{g1FlowMeta.worldName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMissionBox(false);
                        setActiveGrade1Lab(g1ChapterActivity?.labKind ?? g1FlowMeta.labKind);
                      }}
                      className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-[9px] shrink-0 cursor-pointer"
                    >
                      Buka Lab
                    </button>
                  </p>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    {g1FlowMeta.discoveryGoalText}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      engineRef.current?.resetGrade1Activities();
                      setCompletedStationIds([]);
                      setG1CompletedPickups([]);
                      setG1NumberPadsLit(0);
                      setShowMissionBox(false);
                      showNotice('Aktivitas 3D direset! Kamu bisa mengulangi semua pos belajar.');
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-sky-200 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 shrink-0" />
                    <span>Ulangi Aktivitas 3D</span>
                  </button>

                  {activeChapter.subjectId === 'bahasa-indonesia' && (
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center justify-between gap-2 text-slate-200">
                        <span className="truncate">Objek Rumah Huruf / Perpus</span>
                        <span className="font-mono font-bold text-sky-300 shrink-0">
                          {g1CompletedPickups.length}/{GRADE1_PICKUP_ITEMS.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-slate-200">
                        <span className="truncate">Taman Angka (Ubin 1–5)</span>
                        <span className="font-mono font-bold text-emerald-300 shrink-0">
                          {g1NumberPadsLit}/5
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="font-bold text-emerald-300 pt-1">
                    {GRADE1_OPEN_WORLD_REGIONS.length} Kawasan Open World Kelas 1
                  </p>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {GRADE1_OPEN_WORLD_REGIONS.map((reg) => {
                      const isHere = currentRegion.id === reg.id && !activeInterior;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            if (activeInterior) {
                              engineRef.current?.exitInterior();
                            }
                            engineRef.current?.teleportToRegion(reg.id);
                            setCurrentRegion({ id: reg.id, name: reg.name });
                            callbacksRef.current.onDiscoverRegion?.(reg.id);
                            setShowMissionBox(false);
                            showNotice(`Menuju kawasan ${reg.name}!`);
                          }}
                          className={`w-full px-2 py-1 rounded-lg border text-left flex items-center justify-between gap-1.5 cursor-pointer ${
                            isHere
                              ? 'bg-sky-500/25 border-sky-400/50 text-sky-200 font-bold'
                              : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
                          }`}
                        >
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                            <span className="truncate">{reg.name}</span>
                          </span>
                          <span className="text-[9px] text-amber-300 shrink-0">
                            {isHere ? 'Di Sini' : 'Teleport'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="font-bold text-sky-300 pt-1">
                    9 Dunia Mapel Kelas 1
                  </p>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {grade1Subjects.map((s) => {
                      const meta = getGrade1SubjectFlowMeta(
                        s.id,
                        progress.religion,
                        progress.localRegion ?? 'jawa'
                      );
                      const isCurrent = s.id === activeChapter.subjectId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const chs = getSubjectChapters(1, s.id, progress.religion);
                            const nextOpen =
                              chs.find(
                                (c) =>
                                  isSubjectChapterUnlocked(progress, chs, c.chapterNumber) &&
                                  !progress.completedChapters.includes(c.id)
                              ) ?? chs[0];
                            if (nextOpen) {
                              onSelectActiveChapter(nextOpen.id, s.id);
                            }
                            setShowMissionBox(false);
                          }}
                          className={`w-full px-2 py-1 rounded-lg border text-left flex items-center justify-between gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200 font-bold'
                              : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
                          }`}
                        >
                          <span className="flex items-center gap-1 truncate">
                            <Compass className="w-3 h-3 text-emerald-300 shrink-0" />
                            <span className="truncate">{meta.worldName}</span>
                          </span>
                          <span className="text-[9px] text-amber-300 shrink-0">
                            {isCurrent ? 'Aktif' : 'Kunjungi'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMissionBox(false);
                      startChapterQuiz('exam');
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>Ujian Akhir Kelas 1 · Kerajaan Ilmu</span>
                  </button>
                </div>
              )}

              {/* Grade 2 Desa Ceria Life-Simulation & 8 Lokasi Navigator */}
              {grade === 2 && g2Sim && (
                <div className="pt-1.5 border-t border-white/10 space-y-1.5 text-[10px]">
                  <p className="font-bold text-amber-300 flex items-center justify-between">
                    <span>Simulasi Desa Ceria</span>
                    <span className="font-mono text-emerald-300">
                      Gudang: {g2Sim.cropsStoredInGudang}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-slate-200">
                    <span>Rumah: {g2Sim.housesVisited.length}/4</span>
                    <span>Hewan: {g2Sim.animalsFedCount}x</span>
                    <span>Ukur: {g2Sim.measuredItems.length}/3</span>
                    <span>Bangun: {g2Sim.shapesInspected.length}/3</span>
                  </div>

                  <p className="font-bold text-sky-300 pt-1">
                    8 Lokasi Desa Ceria
                  </p>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {GRADE2_LOCATIONS.map((loc) => {
                      const unlocked = isSubjectChapterUnlocked(
                        progress,
                        g2MathChapters,
                        loc.bab
                      );
                      const isCurrent = activeChapter.id === loc.chapterId;
                      return (
                        <button
                          key={loc.chapterId}
                          type="button"
                          disabled={!unlocked}
                          onClick={() => {
                            if (isCurrent) {
                              engineRef.current?.teleportTo(loc.x, loc.z, loc.yaw);
                              setShowMissionBox(false);
                              showNotice(`Tiba di ${loc.name}!`);
                            } else {
                              onSelectActiveChapter(loc.chapterId, 'matematika');
                              setShowMissionBox(false);
                            }
                          }}
                          title={
                            unlocked
                              ? `Kunjungi ${loc.name}`
                              : `Selesaikan Bab ${loc.bab - 1} terlebih dahulu`
                          }
                          className={`w-full px-2 py-1 rounded-lg border text-left flex items-center justify-between gap-1.5 ${
                            !unlocked
                              ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                              : isCurrent
                              ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200 font-bold cursor-pointer'
                              : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100 cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-1 truncate">
                            {unlocked ? (
                              <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                            ) : (
                              <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                            )}
                            <span className="truncate">{loc.shortLabel}</span>
                          </span>
                          {unlocked && (
                            <span className="text-[9px] text-amber-300 shrink-0">
                              {isCurrent ? 'Ke Lokasi' : 'Buka'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={!g2ExamUnlocked}
                    onClick={() => {
                      setShowMissionBox(false);
                      startChapterQuiz('exam');
                    }}
                    className={`w-full py-1.5 px-2 rounded-lg font-extrabold flex items-center justify-center gap-1.5 ${
                      g2ExamUnlocked
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                        : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {g2ExamUnlocked
                        ? 'Ujian Akhir Kelas 2'
                        : 'Ujian Akhir (Buka Bab 1–8)'}
                    </span>
                  </button>
                </div>
              )}

              {/* Grade 3 Hutan Misteri Exploration & 8 Lokasi Navigator */}
              {grade === 3 && g3Exp && (
                <div className="pt-1.5 border-t border-white/10 space-y-1.5 text-[10px]">
                  <p className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>Eksplorasi Hutan Misteri</span>
                    <span className="font-mono text-amber-300">
                      {g3Exp.challengesSolved.length}/8 Misi
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-slate-200">
                    <span>Petunjuk: {g3Exp.cluesFound.length}/2</span>
                    <span>Spesimen: {g3Exp.specimensObserved.length}/3</span>
                    <span>Artefak Gua: {g3Exp.relicsFound.length}/1</span>
                    <span>Kuil: {g3Exp.kuilCompleted ? 'Lulus' : 'Menunggu'}</span>
                  </div>

                  <p className="font-bold text-sky-300 pt-1">
                    8 Lokasi Hutan Misteri
                  </p>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {GRADE3_LOCATIONS.map((loc) => {
                      const solved = g3Exp.challengesSolved.includes(loc.bab);
                      return (
                        <div
                          key={loc.chapterId}
                          className={`w-full px-2 py-1 rounded-lg border flex items-center justify-between gap-1.5 ${
                            solved
                              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                              : 'bg-white/10 border-white/15 text-slate-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              engineRef.current?.teleportTo(loc.x, loc.z, loc.yaw);
                              setShowMissionBox(false);
                              showNotice(`Menjelajah ${loc.name}!`);
                            }}
                            className="flex items-center gap-1 truncate text-left flex-1 cursor-pointer"
                          >
                            {solved ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                            )}
                            <span className="truncate font-semibold">{loc.shortLabel}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMissionBox(false);
                              setActiveG3ChallengeBab(loc.bab);
                            }}
                            className="px-1.5 py-0.5 rounded bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-extrabold text-[9px] shrink-0 cursor-pointer"
                          >
                            {solved ? 'Ulang' : 'Misi'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={!g3ExamUnlocked}
                    onClick={() => {
                      setShowMissionBox(false);
                      startChapterQuiz('exam');
                    }}
                    className={`w-full py-1.5 px-2 rounded-lg font-extrabold flex items-center justify-center gap-1.5 ${
                      g3ExamUnlocked
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                        : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {g3ExamUnlocked
                        ? 'Ujian Akhir Kelas 3 · Kuil Pengetahuan'
                        : `Kuil Pengetahuan (${g3Exp.challengesSolved.length}/8 Misi)`}
                    </span>
                  </button>
                </div>
              )}

              {/* Grade 4 Pulau Teka-Teki Puzzle Mechanics & 8 Lokasi Navigator */}
              {grade === 4 && g4Puzzle && (
                <div className="pt-1.5 border-t border-white/10 space-y-1.5 text-[10px]">
                  <p className="font-bold text-cyan-300 flex items-center justify-between">
                    <span>Mekanisme Pulau Teka-Teki</span>
                    <span className="font-mono text-amber-300">
                      {g4Puzzle.puzzlesSolved.length}/8 Selesai
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-slate-200">
                    <span>Labirin: {g4Puzzle.mazeSolved ? 'Terbuka' : `${g4Puzzle.mazeClues.length}/3`}</span>
                    <span>Jembatan: {g4Puzzle.bridgeExtended ? 'Aktif' : 'Terkunci'}</span>
                    <span>Pola Hutan: {g4Puzzle.patternStep}/4</span>
                    <span>Kristal: {g4Puzzle.placedCrystals.length}/3 · Pintu: {g4Puzzle.doorsUnlocked.length}/2</span>
                  </div>

                  <p className="font-bold text-sky-300 pt-1">
                    8 Lokasi Pulau Teka-Teki
                  </p>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-0.5">
                    {GRADE4_LOCATIONS.map((loc) => {
                      const solved = g4Puzzle.puzzlesSolved.includes(loc.bab);
                      const needsBridge = loc.bab >= 5 && !g4Puzzle.bridgeExtended;
                      return (
                        <div
                          key={loc.chapterId}
                          className={`w-full px-2 py-1 rounded-lg border flex items-center justify-between gap-1.5 ${
                            needsBridge
                              ? 'bg-white/5 border-white/5 text-slate-500'
                              : solved
                              ? 'bg-sky-500/20 border-sky-400/40 text-sky-200'
                              : 'bg-white/10 border-white/15 text-slate-100'
                          }`}
                        >
                          <button
                            type="button"
                            disabled={needsBridge}
                            onClick={() => {
                              engineRef.current?.teleportTo(loc.x, loc.z, loc.yaw);
                              setShowMissionBox(false);
                              showNotice(`Tiba di ${loc.name}!`);
                            }}
                            title={
                              needsBridge
                                ? 'Aktifkan Jembatan Mekanik (Bab 3) terlebih dahulu!'
                                : `Menuju ${loc.name}`
                            }
                            className={`flex items-center gap-1 truncate text-left flex-1 ${
                              needsBridge ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            {needsBridge ? (
                              <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                            ) : solved ? (
                              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                            ) : (
                              <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                            )}
                            <span className="truncate font-semibold">{loc.shortLabel}</span>
                          </button>
                          {!needsBridge && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowMissionBox(false);
                                setActiveG4PuzzleBab(loc.bab);
                              }}
                              className="px-1.5 py-0.5 rounded bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 font-extrabold text-[9px] shrink-0 cursor-pointer"
                            >
                              {solved ? 'Ulang' : 'Teka-Teki'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={!g4ExamUnlocked}
                    onClick={() => {
                      setShowMissionBox(false);
                      startChapterQuiz('exam');
                    }}
                    className={`w-full py-1.5 px-2 rounded-lg font-extrabold flex items-center justify-center gap-1.5 ${
                      g4ExamUnlocked
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                        : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {g4ExamUnlocked
                        ? 'Ujian Akhir Kelas 4 · Istana Pengetahuan'
                        : `Istana Pengetahuan (${g4Puzzle.puzzlesSolved.length}/8 Puzzle)`}
                    </span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowMissionBox(false);
                    setBriefingOpen(true);
                  }}
                  className="py-2 px-2 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Materi</span>
                </button>
                <button
                  type="button"
                  onClick={() => startChapterQuiz('chapter')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer ${
                    allStationsDone || alreadyCompletedChapter
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Kuis ({activeChapter.questions.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOP-CENTER COMPACT LEARNING FEEDBACK NOTICE */}
      {!hideUi && notice && (
        <div
          role="status"
          className="absolute top-13 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-xl bg-amber-400/95 text-slate-950 font-bold text-xs shadow-lg border border-amber-200 max-w-[80vw] text-center pointer-events-none"
        >
          {notice}
        </div>
      )}

      {/* GRADE 1 SEATED & CLASSROOM/PRAYER QUICK POSE BAR */}
      {grade === 1 &&
        !hideUi &&
        !anyOverlayOpen &&
        (isSeated ||
          activeInterior?.id === 'sekolah-nusantara' ||
          activeInterior?.id === 'perpustakaan-ceria' ||
          activeInterior?.id === 'masjid-cahaya' ||
          activeInterior?.id === 'gereja-damai' ||
          activeInterior?.id === 'laboratorium-ilmuwan') && (
          <div
            className={`absolute ${
              showTouchControls ? 'bottom-40 sm:bottom-5' : 'bottom-14 sm:bottom-4'
            } left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[95vw]`}
          >
            <div className="bg-slate-950/85 border border-white/20 text-white rounded-2xl px-2.5 py-2 shadow-xl flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
              <span className="px-2 py-1 rounded-lg bg-white/10 font-bold text-amber-300 flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[140px]">
                  {isSeated ? `Duduk: ${activeSeatLabel ?? 'Kursi'}` : activeInterior?.name}
                </span>
              </span>

              {!isSeated && (
                <button
                  type="button"
                  onClick={() => {
                    const ok = engineRef.current?.sitInNearestSeat();
                    if (!ok) {
                      showNotice('Dekati kursi, bangku, atau sajadah terdekat untuk duduk!');
                    }
                  }}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1 cursor-pointer touch-manipulation"
                >
                  <Armchair className="w-3.5 h-3.5 shrink-0" />
                  <span>Duduk</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => engineRef.current?.triggerPlayerPose('reading', 5.0)}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer touch-manipulation ${
                  activePoseState === 'reading'
                    ? 'bg-sky-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Baca Buku</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.triggerPlayerPose('writing', 5.0)}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer touch-manipulation ${
                  activePoseState === 'writing'
                    ? 'bg-sky-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-slate-100'
                }`}
              >
                <PenTool className="w-3.5 h-3.5 shrink-0" />
                <span>Menulis</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.triggerPlayerPose('raising-hand', 3.5)}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer touch-manipulation ${
                  activePoseState === 'raising-hand'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/10 hover:bg-white/20 text-slate-100'
                }`}
              >
                <Hand className="w-3.5 h-3.5 shrink-0" />
                <span>Angkat Tangan</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.triggerPlayerPose('clapping', 3.0)}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer touch-manipulation ${
                  activePoseState === 'clapping'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/10 hover:bg-white/20 text-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Tepuk Tangan</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.triggerPlayerPose('praying', 4.5)}
                className={`min-h-[44px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer touch-manipulation ${
                  activePoseState === 'praying'
                    ? 'bg-teal-500 text-white'
                    : activeSeatContext === 'prayer' ||
                      activeInterior?.id === 'masjid-cahaya' ||
                      activeInterior?.id === 'gereja-damai'
                    ? 'bg-teal-700/80 hover:bg-teal-600 text-amber-200 border border-teal-400/50'
                    : 'bg-white/10 hover:bg-white/20 text-slate-100'
                }`}
              >
                <span>Berdoa</span>
              </button>

              {isSeated && (
                <button
                  type="button"
                  onClick={() => engineRef.current?.standUpFromSeat()}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold cursor-pointer touch-manipulation"
                >
                  Berdiri
                </button>
              )}
            </div>
          </div>
        )}

      {/* BOTTOM-LEFT CORNER: TOUCH JOYSTICK */}
      {showTouchControls && !anyOverlayOpen && (
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-20 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] touch-none select-none"
        >
          <TouchJoystick
            onMove={(x, y) => {
              engineRef.current?.setTouchMove(x, y);
            }}
          />
        </div>
      )}

      {/* BOTTOM-RIGHT CORNER: ANDROID THUMB CLUSTER & CONTEXT INTERACT/ACTION CONTROLS */}
      {!anyOverlayOpen && (
        <div
          onContextMenu={(e) => e.preventDefault()}
          className={`absolute z-20 flex touch-none select-none ${
            showTouchControls
              ? 'bottom-4 right-4 sm:bottom-5 sm:right-5 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] flex-col items-end gap-2.5'
              : 'bottom-4 right-4 items-end gap-2'
          }`}
        >
          {(nearbyG1Action ||
            nearbyG2Node ||
            nearbyG3Node ||
            nearbyG4Node ||
            nearbyStation ||
            nearbyNpc ||
            showTouchControls) && (
            <button
              type="button"
              disabled={
                !nearbyG1Action &&
                !nearbyG2Node &&
                !nearbyG3Node &&
                !nearbyG4Node &&
                !nearbyStation &&
                !nearbyNpc
              }
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (
                  nearbyG1Action ||
                  nearbyG2Node ||
                  nearbyG3Node ||
                  nearbyG4Node ||
                  nearbyStation ||
                  nearbyNpc
                ) {
                  engineRef.current?.triggerInteract();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (
                    nearbyG1Action ||
                    nearbyG2Node ||
                    nearbyG3Node ||
                    nearbyG4Node ||
                    nearbyStation ||
                    nearbyNpc
                  ) {
                    engineRef.current?.triggerInteract();
                  }
                }
              }}
              className={`min-h-[48px] px-4 py-2 rounded-2xl font-extrabold text-xs sm:text-sm shadow-lg border-2 flex items-center gap-2 whitespace-nowrap touch-none select-none transition-transform active:scale-95 ${
                nearbyG1Action ||
                nearbyG2Node ||
                nearbyG3Node ||
                nearbyG4Node ||
                nearbyStation
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-white cursor-pointer'
                  : nearbyNpc
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-white cursor-pointer'
                  : 'bg-slate-950/55 border-white/20 text-white/60 cursor-default'
              }`}
            >
              {nearbyNpc &&
              !nearbyStation &&
              !nearbyG1Action &&
              !nearbyG2Node &&
              !nearbyG3Node &&
              !nearbyG4Node ? (
                <MessageCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Hand className="w-4 h-4 shrink-0" />
              )}
              <span className="max-w-[180px] truncate">
                {nearbyG1Action
                  ? nearbyG1Action.label
                  : nearbyG2Node
                  ? nearbyG2Node.label
                  : nearbyG3Node
                  ? nearbyG3Node.label
                  : nearbyG4Node
                  ? nearbyG4Node.label
                  : nearbyStation
                  ? nearbyStation.actionType === 'push'
                    ? `Dorong ${nearbyStation.label}`
                    : nearbyStation.actionType === 'activate'
                    ? `Aktifkan ${nearbyStation.label}`
                    : `Ambil ${nearbyStation.label}`
                  : nearbyNpc
                  ? `Bicara ${nearbyNpc.name}`
                  : 'Aksi'}
              </span>
              {(nearbyG1Action ||
                nearbyG2Node ||
                nearbyG3Node ||
                nearbyG4Node ||
                nearbyStation ||
                nearbyNpc) && (
                <span className="hidden sm:inline font-mono text-[10px] opacity-80">[E]</span>
              )}
            </button>
          )}

          {showTouchControls ? (
            <div className="flex items-end gap-3">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const next = !sprintLocked;
                  setSprintLocked(next);
                  engineRef.current?.setTouchSprint(next);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const next = !sprintLocked;
                    setSprintLocked(next);
                    engineRef.current?.setTouchSprint(next);
                  }
                }}
                aria-label="Mode Lari"
                aria-pressed={sprintLocked}
                className={`w-14 h-14 rounded-full font-extrabold text-[11px] shadow-lg border-2 flex flex-col items-center justify-center gap-0.5 cursor-pointer touch-none select-none active:scale-95 transition-transform ${
                  sprintLocked
                    ? 'bg-amber-400 border-white text-slate-950'
                    : 'bg-slate-900/75 border-white/35 text-white'
                }`}
              >
                <span className="leading-none">Lari</span>
                <span className="text-[9px] font-bold opacity-85 leading-none">
                  {sprintLocked ? 'AKTIF' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  engineRef.current?.triggerJump();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    engineRef.current?.triggerJump();
                  }
                }}
                aria-label="Lompat"
                className="w-16 h-16 rounded-full bg-sky-500/90 hover:bg-sky-400 active:bg-sky-400 active:scale-95 text-white font-extrabold text-[11px] shadow-xl border-2 border-white/85 flex flex-col items-center justify-center gap-0.5 cursor-pointer touch-none select-none transition-transform"
              >
                <ArrowUp className="w-5 h-5 shrink-0" />
                <span className="leading-none">Lompat</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                engineRef.current?.triggerJump();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  engineRef.current?.triggerJump();
                }
              }}
              aria-label="Lompat"
              className="min-h-[44px] px-3.5 rounded-xl bg-sky-600/85 hover:bg-sky-500 active:bg-sky-400 text-white font-extrabold text-xs shadow-md border border-white/40 flex items-center gap-1.5 cursor-pointer touch-none select-none"
            >
              <ArrowUp className="w-4 h-4 shrink-0" />
              <span>Lompat</span>
            </button>
          )}
        </div>
      )}

      {/* MANDATORY PRE-CHALLENGE MATERI BRIEFING GATE */}
      {briefingOpen && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="briefing-title"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: subjectMeta.accentHex }}
                  >
                    {subjectMeta.name} · Kelas {grade}
                  </span>
                  <span className="text-[11px] font-bold text-amber-300">
                    Materi Sebelum Tantangan
                  </span>
                </div>
                <h2 id="briefing-title" className="font-display text-lg sm:text-xl font-extrabold">
                  {activeChapter.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleConfirmBriefing}
                aria-label="Tutup dan mulai petualangan"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Grade Identity Strip */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
                <span>
                  <strong>Karaktermu:</strong> {worldTheme.heroRoleName}
                </span>
                <span>
                  <strong>Alam 3D:</strong> {worldTheme.architectureTitle} ({worldTheme.creatureNames})
                </span>
                {alreadyCompletedChapter && (
                  <span className="flex items-center gap-0.5 text-amber-600 font-extrabold">
                    {[1, 2, 3].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${
                          n <= (progress.chapterStars?.[activeChapter.id] ?? 1)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </span>
                )}
              </div>

              {/* Tujuan Belajar */}
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                <p className="text-xs font-extrabold uppercase text-sky-900">
                  1. Tujuan Pembelajaran
                </p>
                {activeChapter.tujuanPembelajaran.map((t, i) => (
                  <p key={i} className="text-xs sm:text-sm text-slate-800">
                    ✓ {t}
                  </p>
                ))}
              </div>

              {/* Penjelasan Materi Lengkap */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <p className="text-xs font-extrabold uppercase text-slate-600">
                  2. Penjelasan Materi Bab Ini
                </p>
                {activeChapter.materiLengkap.map((m, i) => (
                  <p key={i} className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {m}
                  </p>
                ))}
              </div>

              {/* Ilustrasi Visual Bab */}
              <ChapterVisualIllustration
                visualType={activeChapter.visualType}
                caption={activeChapter.visualCaption}
                accentHex={subjectMeta.accentHex}
              />

              {/* Contoh Nyata & Misi 3D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <p className="text-[11px] font-extrabold uppercase text-emerald-900">
                    Contoh Sehari-hari
                  </p>
                  {activeChapter.contohSehariHari.map((c, i) => (
                    <p key={i} className="text-xs text-slate-800">
                      • {c}
                    </p>
                  ))}
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <p className="text-[11px] font-extrabold uppercase text-amber-900">
                    Misi Dunia 3D: {chapterMission.zoneTitle}
                  </p>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {chapterMission.objectiveBanner}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBriefingOpen(false);
                    setShowCurriculumModal(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Ganti Mata Pelajaran / Bab Lain
                </button>
                {grade === 1 && g1FlowMeta && (
                  <button
                    type="button"
                    onClick={() => {
                      onMarkChapterStudied(activeChapter.id);
                      setBriefingOpen(false);
                      setActiveGrade1Lab(g1ChapterActivity?.labKind ?? g1FlowMeta.labKind);
                    }}
                    className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 text-amber-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Buka {g1ChapterActivity?.activityTitle ?? g1FlowMeta.labTitle}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleConfirmBriefing}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Saya Paham — Mulai Petualangan 3D!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER-ALIGNED NPC DIALOGUE & SINGLE-SUBJECT TRIVIA OVERLAY */}
      {activeNpc && (
        <div
          className="absolute inset-0 z-30 flex items-end sm:items-center justify-center p-4 bg-slate-950/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="npc-dialog-name"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-100">{activeNpc.role}</p>
                <h2 id="npc-dialog-name" className="font-display text-xl font-extrabold">
                  {activeNpc.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeNpcModal}
                aria-label="Tutup percakapan"
                className="w-9 h-9 rounded-lg bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                <p className="font-medium text-slate-900">"{activeNpc.greeting}"</p>
                <p>{activeNpc.story}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-800">
                  <span className="font-extrabold text-sky-900">{activeChapter.title}</span>
                  <p className="text-[11px] text-slate-600">
                    Progres Misi 3D: {stationsDoneCount}/{stationsTotal} pos selesai
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeNpcModal();
                      setBriefingOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-sky-300 text-sky-800 text-xs font-bold cursor-pointer"
                  >
                    Baca Materi
                  </button>
                  <button
                    type="button"
                    onClick={() => startChapterQuiz('chapter')}
                    className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Tantangan Bab
                  </button>
                </div>
              </div>

              {/* Chapter-Pure NPC Knowledge Check with 2-step Hints */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>Latihan Cepat {subjectMeta.shortName} · {activeNpc.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {!npcTriviaSolved[activeNpc.id] && (
                      <button
                        type="button"
                        onClick={() => setNpcHintStep((s) => (s === 0 ? 1 : 2))}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>{npcHintStep === 0 ? 'Petunjuk 1' : 'Petunjuk 2'}</span>
                      </button>
                    )}
                    <span className="font-mono text-xs font-bold text-amber-800">
                      +{activeNpc.trivia.rewardCoins} Koin · +25 XP
                    </span>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-900">
                  {activeNpc.trivia.question}
                </p>

                {!npcTriviaSolved[activeNpc.id] && npcHintStep >= 1 && (
                  <div className="p-2.5 rounded-lg bg-white border border-amber-300 text-xs text-slate-800 space-y-1">
                    <p className="font-bold text-amber-900">
                      Petunjuk 1:{' '}
                      <span className="font-medium text-slate-800">
                        {activeNpc.trivia.hints?.[0] ??
                          'Baca kembali pertanyaannya pelan-pelan dan bayangkan contoh nyata di dekatmu!'}
                      </span>
                    </p>
                    {npcHintStep >= 2 && (
                      <p className="font-bold text-amber-900 pt-1 border-t border-amber-100">
                        Petunjuk 2:{' '}
                        <span className="font-medium text-slate-800">
                          {activeNpc.trivia.hints?.[1] ?? activeNpc.trivia.explanation}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {activeNpc.trivia.options.map((opt, idx) => {
                    const solved = Boolean(npcTriviaSolved[activeNpc.id]);
                    const isRight = idx === activeNpc.trivia.correctIndex;
                    const isDisabledWrong = npcWrongOptions.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={solved || isDisabledWrong}
                        onClick={() => handleAnswerNpcTrivia(activeNpc, idx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors min-h-[44px] ${
                          solved && isRight
                            ? 'bg-emerald-600 border-emerald-700 text-white cursor-default'
                            : isDisabledWrong
                            ? 'bg-amber-100/70 border-amber-300 text-amber-700/70 line-through cursor-not-allowed'
                            : 'bg-white border-amber-200 hover:border-amber-400 text-slate-800 cursor-pointer'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {triviaFeedback && (
                  <p
                    className={`text-xs font-semibold p-2.5 rounded-lg ${
                      triviaFeedback.correct
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {triviaFeedback.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeNpcModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold cursor-pointer min-h-[44px]"
                >
                  Lanjut Berpetualang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURE SINGLE-SUBJECT CHAPTER INTERACTIVE QUIZ MODAL (WITH 2-STEP HINTS & VARIATIONS) */}
      {quizOpen && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/65"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
              <div>
                <p className="text-xs font-bold text-amber-300">
                  {quizMode === 'exam'
                    ? grade === 1
                      ? 'Ujian Akhir Kelas 1 · Kerajaan Ilmu'
                      : grade === 3
                      ? 'Ujian Akhir Kelas 3 · Kuil Pengetahuan'
                      : grade === 4
                      ? 'Ujian Akhir Kelas 4 · Istana Pengetahuan'
                      : 'Ujian Akhir Kelas 2 · Desa Ceria'
                    : `Tantangan ${subjectMeta.shortName} · ${activeChapter.title}`}
                </p>
                <h2 className="font-display text-lg font-extrabold">
                  {quizMode === 'exam'
                    ? `Ujian Akhir Kelas ${grade}`
                    : `Kuis Bab ${activeChapter.chapterNumber} · ${activeChapter.title}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setQuizOpen(false)}
                aria-label="Tutup kuis"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto">
              <AdaptiveQuizRunner
                badgeLabel={
                  quizMode === 'exam'
                    ? `Ujian Akhir Kelas ${grade}`
                    : `${subjectMeta.name} · Bab ${activeChapter.chapterNumber}`
                }
                accentHex={subjectMeta.accentHex}
                questions={activeQuizQuestions}
                variationQuestions={quizMode === 'chapter' ? activeChapter.variationQuestions : undefined}
                subjectId={activeChapter.subjectId}
                chapterTitle={activeChapter.title}
                rewardCoins={activeChapter.rewardCoins}
                rewardXp={activeChapter.rewardXp}
                rewardBadge={
                  quizMode === 'exam'
                    ? grade === 1
                      ? 'Juara Kerajaan Ilmu Kelas 1'
                      : grade === 3
                      ? 'Penjelajah Kuil'
                      : grade === 4
                      ? 'Master Istana Teka-Teki'
                      : 'Juara Desa Ceria'
                    : activeChapter.rewardBadge
                }
                playerName={progress.playerName}
                isExam={quizMode === 'exam'}
                grade={grade}
                nextChapterLabel={
                  quizMode === 'chapter' && nextChapter
                    ? `Buka & Mainkan Bab ${nextChapter.chapterNumber} →`
                    : undefined
                }
                onAnswerCorrect={() => onCollectRewards(5, 80, 15)}
                onReadMateri={() => {
                  setQuizOpen(false);
                  setBriefingOpen(true);
                }}
                onGoNextChapter={
                  nextChapter
                    ? () => {
                        setQuizOpen(false);
                        onSelectActiveChapter(nextChapter.id, nextChapter.subjectId);
                      }
                    : undefined
                }
                onTriggerGradeUp={
                  onTriggerGradeUp && grade < 6
                    ? () => {
                        setQuizOpen(false);
                        onTriggerGradeUp(grade);
                      }
                    : undefined
                }
                onClose={() => setQuizOpen(false)}
                onExitToMenu={onExitToMenu}
                onComplete={handleCompleteAdaptiveQuiz}
              />
            </div>
          </div>
        </div>
      )}

      {/* GRADE 2 PASAR TRADISIONAL DESA CERIA MODAL (REAL BUY & SELL) */}
      {grade === 2 && marketOpen && g2Sim && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pasar-desa-title"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-5 py-4 bg-amber-600 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-amber-100">
                    Pasar Penjumlahan · Desa Ceria
                  </p>
                  <h2 id="pasar-desa-title" className="font-display text-lg font-extrabold">
                    Jual Panen & Beli Perlengkapan
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-700 font-mono text-xs font-extrabold">
                  {progress.coins} Koin
                </span>
                <button
                  type="button"
                  onClick={() => setMarketOpen(false)}
                  aria-label="Tutup Pasar"
                  className="w-9 h-9 rounded-lg bg-amber-700 hover:bg-amber-800 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="space-y-2">
                <p className="text-xs font-extrabold uppercase text-emerald-800">
                  Jual Hasil Panen & Ternak
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      { crop: 'wortel' as CropType, label: 'Wortel', price: 6 },
                      { crop: 'jagung' as CropType, label: 'Jagung', price: 8 },
                      { crop: 'kubis' as CropType, label: 'Kubis', price: 9 },
                      { crop: 'tomat' as CropType, label: 'Tomat', price: 10 },
                    ]
                  ).map((item) => {
                    const qty = g2Sim.cropsInBag[item.crop] ?? 0;
                    return (
                      <button
                        key={item.crop}
                        type="button"
                        disabled={qty <= 0}
                        onClick={() => {
                          engineRef.current?.applyGrade2MarketAction(
                            { kind: 'sell-crop', crop: item.crop },
                            progress.coins
                          );
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 ${
                          qty > 0
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-slate-900 cursor-pointer'
                            : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <p className="font-extrabold">{item.label} ({qty})</p>
                          <p className="text-[11px]">{item.price} Koin / buah</p>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-emerald-700">
                          +{qty * item.price}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={g2Sim.eggsAndMilk <= 0}
                  onClick={() => {
                    engineRef.current?.applyGrade2MarketAction(
                      { kind: 'sell-farm' },
                      progress.coins
                    );
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 ${
                    g2Sim.eggsAndMilk > 0
                      ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-slate-900 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <p className="font-extrabold">Susu & Telur Ternak ({g2Sim.eggsAndMilk})</p>
                    <p className="text-[11px]">10 Koin / produk</p>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-emerald-700">
                    +{g2Sim.eggsAndMilk * 10} Koin
                  </span>
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs font-extrabold uppercase text-amber-800">
                  Beli Kebutuhan Kebun, Ternak & Dapur
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      kind: 'buy-feed' as const,
                      title: '+4 Pakan Ternak',
                      desc: `Stok saat ini: ${g2Sim.feedBag} pakan`,
                      cost: 10,
                    },
                    {
                      kind: 'buy-fertilizer' as const,
                      title: '+2 Pupuk Subur (Panen Instan)',
                      desc: `Stok saat ini: ${g2Sim.fertilizerBag} pupuk`,
                      cost: 12,
                    },
                    {
                      kind: 'buy-cake' as const,
                      title: '+3 Paket Kue Dapur Pembagian',
                      desc: `Stok saat ini: ${g2Sim.cakeBag} paket`,
                      cost: 15,
                    },
                  ].map((b) => {
                    const affordable = progress.coins >= b.cost;
                    return (
                      <button
                        key={b.kind}
                        type="button"
                        disabled={!affordable}
                        onClick={() => {
                          engineRef.current?.applyGrade2MarketAction(
                            { kind: b.kind },
                            progress.coins
                          );
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 ${
                          affordable
                            ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-slate-900 cursor-pointer'
                            : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <p className="font-extrabold">{b.title}</p>
                          <p className="text-[11px]">{b.desc}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-mono text-xs font-extrabold shrink-0">
                          {b.cost} Koin
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRADE 3 HUTAN MISTERI NON-MCQ EXPLORATION CHALLENGE MODAL */}
      {grade === 3 && activeG3ChallengeBab !== null && (() => {
        const ch = GRADE3_CHALLENGES.find((c) => c.bab === activeG3ChallengeBab);
        if (!ch) return null;
        return (
          <Grade3ExplorationModal
            challenge={ch}
            alreadySolved={Boolean(g3Exp?.challengesSolved.includes(ch.bab))}
            onSolved={(bab) => {
              const updated = engineRef.current?.markGrade3ChallengeSolved(bab);
              if (updated) setG3Exp(updated);
            }}
            onClose={() => setActiveG3ChallengeBab(null)}
            onReadMateri={() => {
              setActiveG3ChallengeBab(null);
              setBriefingOpen(true);
            }}
          />
        );
      })()}

      {/* GRADE 4 PULAU TEKA-TEKI NON-MCQ PUZZLE MECHANISM MODAL */}
      {grade === 4 && activeG4PuzzleBab !== null && (() => {
        const puz = GRADE4_PUZZLES.find((p) => p.bab === activeG4PuzzleBab);
        if (!puz) return null;
        return (
          <Grade4PuzzleModal
            puzzle={puz}
            alreadySolved={Boolean(g4Puzzle?.puzzlesSolved.includes(puz.bab))}
            onSolved={(bab) => {
              const updated = engineRef.current?.markGrade4PuzzleSolved(bab);
              if (updated) setG4Puzzle(updated);
            }}
            onClose={() => setActiveG4PuzzleBab(null)}
            onReadMateri={() => {
              setActiveG4PuzzleBab(null);
              setBriefingOpen(true);
            }}
          />
        );
      })()}

      {/* GRADE 1 INTERACTIVE SUBJECT LAB MODAL (Cube Net, Drawing Studio, Music, English TTS, Market, PJOK, etc.) */}
      {grade === 1 && activeGrade1Lab !== null && (
        <Grade1InteractiveLabModal
          labKind={activeGrade1Lab}
          subjectId={activeChapter.subjectId}
          chapterNumber={activeChapter.chapterNumber}
          chapterTitle={activeChapter.title}
          activityMode={g1ChapterActivity?.activityMode}
          religion={progress.religion}
          localRegion={progress.localRegion ?? 'jawa'}
          bag={g1Bag}
          playerCoins={progress.coins}
          onClose={() => setActiveGrade1Lab(null)}
          onSelectReligion={onSelectReligion}
          onSelectLocalRegion={onSelectLocalRegion}
          onSaveArtwork={(title, dataUrl) =>
            onSaveArtwork?.({
              id: `art-${Date.now()}`,
              title,
              dataUrl,
              createdAt: Date.now(),
            })
          }
          onReward={(coins, score, xp, noticeMsg) => {
            onCollectRewards(coins, score, xp);
            if (noticeMsg) showNotice(noticeMsg);
          }}
          onEarnOrSpendCoins={(deltaCoins, deltaXp, msg) => {
            onMarketBalanceChange?.(deltaCoins, deltaXp);
            if (msg) showNotice(msg);
          }}
          onTriggerHeroPose={(pose) => engineRef.current?.triggerHeroPose(pose)}
          onStartCombinedExam={() => {
            setActiveGrade1Lab(null);
            startChapterQuiz('exam');
          }}
          onMutateBag={(kind) => {
            const next = engineRef.current?.applyGrade1BagMutation({ kind });
            if (next) setG1Bag(next);
          }}
        />
      )}

      {/* KURIKULUM MERDEKA CHAPTER SWITCHER & FINAL EXAM MODAL */}
      {showCurriculumModal && (
        <InWorldCurriculumModal
          grade={grade}
          worldName={worldTheme.worldName}
          progress={progress}
          onClose={() => setShowCurriculumModal(false)}
          onSelectActiveSubject={onSelectActiveSubject}
          onLaunchChapterInWorld={(ch) => {
            setShowCurriculumModal(false);
            onSelectActiveChapter(ch.id, ch.subjectId);
          }}
          onMarkChapterStudied={onMarkChapterStudied}
          onCompleteChapterQuiz={onCompleteChapterQuiz}
          onCompleteSubjectExam={onCompleteSubjectExam}
        />
      )}
    </div>
  );
}
