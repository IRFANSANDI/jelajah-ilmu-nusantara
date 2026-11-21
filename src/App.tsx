/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import {
  DEFAULT_PROGRESS,
  getGradeCompletedCount,
  isBabUnlocked,
  loadPlayerProgress,
  PlayerProgress3D,
  savePlayerProgress,
  WORLD_THEMES,
} from './game3d/curriculumData';
import {
  getChapterById,
  getSubjectChapters,
  isSubjectChapterUnlocked,
  SubjectChapter,
} from './game3d/curriculum';
import {
  ACHIEVEMENTS,
  Accessory3DId,
  computeLevelStatus,
  GradeNumber,
  HeroStyleId,
  LocalRegionId,
  ReligionId,
  SUBJECTS,
  SubjectId,
} from './game3d/inventoryData';
import type { SavedArtwork } from './game3d/curriculum/types';
import { sound3d } from './game3d/sound3d';
import { MenuNav, MenuTabId } from './components/MenuNav';
import { MenuHomeView } from './components/MenuHomeView';
import { GradeSelect3DView } from './components/GradeSelect3DView';
import { AdventureMap3DView } from './components/AdventureMap3DView';
import { SubjectsMateriView } from './components/SubjectsMateriView';
import { Inventory3DView } from './components/Inventory3DView';
import { Achievements3DView } from './components/Achievements3DView';
import { PlayerProfile3DView } from './components/PlayerProfile3DView';
import { Grade1RegionId } from './game3d/grade1SubjectWorlds';
import { PlayWorld3D } from './components/PlayWorld3D';
import { GradeUpTransitionModal } from './components/GradeUpTransitionModal';
import { BeginnerTutorialModal } from './components/BeginnerTutorialModal';
import type { AdaptiveQuizResult } from './components/AdaptiveQuizRunner';
import { OfflineIndicator } from './components/OfflineIndicator';

function evaluateAchievements(next: PlayerProgress3D): {
  updated: PlayerProgress3D;
  newlyUnlockedTitles: string[];
} {
  const unlocked = new Set(next.unlockedAchievements);
  const newlyUnlockedTitles: string[] = [];
  let bonusCoins = 0;

  const grant = (id: string) => {
    if (unlocked.has(id)) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;
    unlocked.add(id);
    bonusCoins += def.rewardCoins;
    newlyUnlockedTitles.push(`${def.title} (+${def.rewardCoins} Koin)`);
  };

  if (next.completedBabs.length >= 1 || next.completedChapters.length >= 1) {
    grant('bab-pertama');
  }
  if (next.coins >= 100) grant('kolektor-koin-100');
  if (next.completedBabs.length >= 3 || next.completedChapters.length >= 5) {
    grant('sahabat-npc');
  }
  if (
    ([1, 2, 3, 4, 5, 6] as GradeNumber[]).some(
      (g) => getGradeCompletedCount(next, g) >= 4
    ) ||
    next.completedSubjectExams.length >= 1
  ) {
    grant('penakluk-kelas');
  }
  if (next.ownedAccessories.some((a) => a !== 'none')) grant('kolektor-gaya');
  if (computeLevelStatus(next.xp).level >= 4) grant('cendekia-level-4');

  if (newlyUnlockedTitles.length === 0) {
    return { updated: next, newlyUnlockedTitles: [] };
  }

  return {
    updated: {
      ...next,
      coins: next.coins + bonusCoins,
      unlockedAchievements: Array.from(unlocked),
    },
    newlyUnlockedTitles,
  };
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress3D>(() =>
    loadPlayerProgress()
  );
  const [mode, setMode] = useState<'menu' | 'play3d'>('menu');
  const [activeTab, setActiveTab] = useState<MenuTabId>('home');
  const [targetRegionId, setTargetRegionId] = useState<Grade1RegionId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [gradeUpInfo, setGradeUpInfo] = useState<{
    fromGrade: GradeNumber;
    toGrade: GradeNumber;
    scorePct?: number;
  } | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  // Keep Web Audio sound enabled state synced & persist progress to localStorage
  useEffect(() => {
    sound3d.setEnabled(progress.soundEnabled);
    savePlayerProgress(progress);
  }, [progress]);

  // Show beginner tutorial once automatically for new Grade 1 adventurers in Menu
  useEffect(() => {
    if (mode === 'menu' && progress.activeGrade === 1 && !progress.seenTutorial) {
      setTutorialOpen(true);
    }
  }, [mode, progress.activeGrade, progress.seenTutorial]);

  const updateProgressWithAchievements = useCallback(
    (updater: (prev: PlayerProgress3D) => PlayerProgress3D) => {
      setProgress((prev) => {
        const draft = updater(prev);
        const { updated, newlyUnlockedTitles } = evaluateAchievements(draft);
        if (newlyUnlockedTitles.length > 0) {
          window.setTimeout(() => {
            showToast(`Prestasi Terbuka: ${newlyUnlockedTitles[0]}`);
          }, 120);
        }
        return updated;
      });
    },
    [showToast]
  );

  const handleLaunchWorld = useCallback(
    (
      grade: GradeNumber,
      babOrder: 1 | 2 | 3 | 4,
      subjectId?: SubjectId,
      chapterId?: string,
      regionId?: Grade1RegionId | null
    ) => {
      setTargetRegionId(grade === 1 && regionId ? regionId : null);
      setProgress((prev) => {
        const safeBab = isBabUnlocked(prev, grade, babOrder) ? babOrder : 1;

        let targetSubject: SubjectId = subjectId ?? prev.activeSubject;
        if (!prev.englishEnabled && targetSubject === 'bahasa-inggris') {
          targetSubject = 'bahasa-indonesia';
        }
        if (grade === 2 && targetSubject === 'ipas') {
          targetSubject = 'matematika';
        }
        if (grade !== 1 && targetSubject === 'muatan-lokal') {
          targetSubject = 'bahasa-indonesia';
        }

        let nextChapterId = chapterId;
        if (!nextChapterId) {
          const existing = getChapterById(prev.activeChapterId, prev.religion);
          if (
            existing &&
            existing.grade === grade &&
            (!subjectId || existing.subjectId === targetSubject)
          ) {
            nextChapterId = existing.id;
            targetSubject = existing.subjectId;
          } else {
            const list = getSubjectChapters(grade, targetSubject, prev.religion);
            const firstOpen =
              list.find(
                (c) =>
                  isSubjectChapterUnlocked(prev, list, c.chapterNumber) &&
                  !prev.completedChapters.includes(c.id)
              ) ??
              list[0] ??
              getSubjectChapters(grade, 'bahasa-indonesia', prev.religion)[0];
            nextChapterId = firstOpen?.id ?? `g${grade}-bi-1`;
            if (firstOpen) targetSubject = firstOpen.subjectId;
          }
        }

        return {
          ...prev,
          activeGrade: grade,
          activeBab: safeBab,
          activeSubject: targetSubject,
          activeChapterId: nextChapterId,
        };
      });
      setMode('play3d');
    },
    []
  );

  const handleToggleSound = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  const handleCollectRewards = useCallback(
    (coins: number, score: number, xp: number) => {
      updateProgressWithAchievements((prev) => ({
        ...prev,
        coins: prev.coins + coins,
        score: prev.score + score,
        xp: prev.xp + xp,
      }));
    },
    [updateProgressWithAchievements]
  );

  const handleNpcTalked = useCallback((npcId: string) => {
    setProgress((prev) =>
      prev.npcsTalkedTotal.includes(npcId)
        ? prev
        : {
            ...prev,
            npcsTalkedTotal: [...prev.npcsTalkedTotal, npcId],
          }
    );
  }, []);

  const handleGrade1DiscoverRegion = useCallback((regionId: string) => {
    setProgress((prev) => {
      const existing = prev.discoveredRegions ?? ['desa-ceria'];
      if (existing.includes(regionId)) return prev;
      return {
        ...prev,
        discoveredRegions: [...existing, regionId],
      };
    });
  }, []);

  const handleGrade1VisitInterior = useCallback((interiorId: string) => {
    setProgress((prev) => {
      const existing = prev.visitedInteriors ?? [];
      if (existing.includes(interiorId)) return prev;
      return {
        ...prev,
        visitedInteriors: [...existing, interiorId],
      };
    });
  }, []);

  const handleGrade1RecordMission = useCallback((missionId: string) => {
    setProgress((prev) => {
      const existing = prev.completedMissions ?? [];
      if (existing.includes(missionId)) return prev;
      return {
        ...prev,
        completedMissions: [...existing, missionId],
      };
    });
  }, []);

  const handleGrade1MarketBalanceChange = useCallback(
    (deltaCoins: number, deltaXp: number) => {
      updateProgressWithAchievements((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins + deltaCoins),
        xp: Math.max(0, prev.xp + deltaXp),
        score: prev.score + (deltaXp > 0 ? deltaXp * 2 : 0),
        marketPurchases: (prev.marketPurchases ?? 0) + (deltaCoins < 0 ? 1 : 0),
      }));
    },
    [updateProgressWithAchievements]
  );

  const handleSelectActiveChapter = useCallback(
    (chapterId: string, subjectId: SubjectId) => {
      setProgress((prev) => ({
        ...prev,
        activeSubject: subjectId,
        activeChapterId: chapterId,
      }));
    },
    []
  );

  const handleBuyAccessory = useCallback(
    (id: Accessory3DId, price: number) => {
      updateProgressWithAchievements((prev) => {
        if (prev.ownedAccessories.includes(id) || prev.coins < price) return prev;
        sound3d.playMissionComplete();
        return {
          ...prev,
          coins: prev.coins - price,
          ownedAccessories: [...prev.ownedAccessories, id],
          equippedAccessory: id,
        };
      });
    },
    [updateProgressWithAchievements]
  );

  const handleEquipAccessory = useCallback((id: Accessory3DId) => {
    sound3d.playCoin();
    setProgress((prev) => ({
      ...prev,
      equippedAccessory: id,
    }));
  }, []);

  const handleSelectReligion = useCallback((religion: ReligionId) => {
    setProgress((prev) => ({ ...prev, religion }));
  }, []);

  const handleSelectLocalRegion = useCallback((localRegion: LocalRegionId) => {
    setProgress((prev) => ({ ...prev, localRegion }));
  }, []);

  const handleSaveArtwork = useCallback(
    (artwork: SavedArtwork) => {
      updateProgressWithAchievements((prev) => ({
        ...prev,
        savedArtworks: [artwork, ...prev.savedArtworks].slice(0, 8),
        coins: prev.coins + 10,
        xp: prev.xp + 20,
      }));
      showToast(`Karya "${artwork.title}" disimpan ke Galeri Seni 3D! (+10 Koin, +20 XP)`);
    },
    [showToast, updateProgressWithAchievements]
  );

  const handleToggleEnglish = useCallback((enabled: boolean) => {
    setProgress((prev) => ({
      ...prev,
      englishEnabled: enabled,
      activeSubject:
        !enabled && prev.activeSubject === 'bahasa-inggris'
          ? 'bahasa-indonesia'
          : prev.activeSubject,
    }));
  }, []);

  const handleSelectActiveSubject = useCallback((subjectId: SubjectId) => {
    setProgress((prev) => ({ ...prev, activeSubject: subjectId }));
  }, []);

  const handleMarkChapterStudied = useCallback((chapterId: string) => {
    setProgress((prev) =>
      prev.studiedChapters.includes(chapterId)
        ? prev
        : {
            ...prev,
            studiedChapters: [...prev.studiedChapters, chapterId],
          }
    );
  }, []);

  const handleCompleteChapterQuiz = useCallback(
    (
      chapter: SubjectChapter,
      scorePct: number,
      earnedCoins: number,
      earnedXp: number,
      diagnostics?: AdaptiveQuizResult
    ) => {
      updateProgressWithAchievements((prev) => {
        const prevBest = prev.chapterScores[chapter.id] ?? 0;
        const chapterScores = {
          ...prev.chapterScores,
          [chapter.id]: Math.max(prevBest, scorePct),
        };
        const earnedStars = scorePct >= 90 ? 3 : scorePct >= 75 ? 2 : scorePct >= 60 ? 1 : 0;
        const prevStars = prev.chapterStars?.[chapter.id] ?? 0;
        const chapterStars = {
          ...(prev.chapterStars ?? {}),
          [chapter.id]: Math.max(prevStars, earnedStars),
        };

        const prevHistory = prev.chapterScoreHistory?.[chapter.id] ?? [];
        const historyEntry = {
          scorePct,
          correct: diagnostics?.correctCount ?? chapter.questions.length,
          total: diagnostics?.totalQuestions ?? chapter.questions.length,
          firstTryCorrect: diagnostics?.firstTryCorrect ?? diagnostics?.correctCount ?? chapter.questions.length,
          wrongAttempts: diagnostics?.wrongAttempts ?? 0,
          usedVariation: diagnostics?.usedVariation ?? false,
          timestamp: Date.now(),
        };
        const chapterScoreHistory = {
          ...(prev.chapterScoreHistory ?? {}),
          [chapter.id]: [historyEntry, ...prevHistory].slice(0, 10),
        };

        let masteredSkills = prev.masteredSkills ?? [];
        let needsPracticeSkills = prev.needsPracticeSkills ?? [];
        if (diagnostics) {
          const masteredSet = new Set([...masteredSkills, ...diagnostics.masteredSkills]);
          masteredSkills = Array.from(masteredSet);
          const practiceSet = new Set(
            needsPracticeSkills.filter((sk) => !masteredSet.has(sk))
          );
          for (const sk of diagnostics.needsPracticeSkills) {
            if (!masteredSet.has(sk)) practiceSet.add(sk);
          }
          needsPracticeSkills = Array.from(practiceSet);
        }

        const passed = scorePct >= 60;
        if (!passed) {
          return {
            ...prev,
            chapterScores,
            chapterStars,
            chapterScoreHistory,
            masteredSkills,
            needsPracticeSkills,
            coins: prev.coins + Math.max(2, Math.round(earnedCoins * 0.5)),
            xp: prev.xp + Math.max(10, Math.round(earnedXp * 0.5)),
          };
        }

        const firstPass = !prev.completedChapters.includes(chapter.id);
        const completedChapters = firstPass
          ? [...prev.completedChapters, chapter.id]
          : prev.completedChapters;
        const collectedTreasures = prev.collectedTreasures.includes(chapter.rewardBadge)
          ? prev.collectedTreasures
          : [...prev.collectedTreasures, chapter.rewardBadge];

        const chapterCoins = firstPass
          ? chapter.rewardCoins + earnedCoins
          : Math.round(chapter.rewardCoins * 0.3) + earnedCoins;
        const chapterXp = firstPass
          ? chapter.rewardXp + earnedXp
          : Math.round(chapter.rewardXp * 0.3) + earnedXp;

        return {
          ...prev,
          coins: prev.coins + chapterCoins,
          xp: prev.xp + chapterXp,
          score: prev.score + scorePct * 3,
          completedChapters,
          chapterScores,
          chapterStars,
          chapterScoreHistory,
          masteredSkills,
          needsPracticeSkills,
          collectedTreasures,
        };
      });
    },
    [updateProgressWithAchievements]
  );

  const handleCompleteSubjectExam = useCallback(
    (
      examId: string,
      scorePct: number,
      grade: GradeNumber,
      subjectId: SubjectId
    ) => {
      const subjName =
        SUBJECTS.find((s) => s.id === subjectId)?.shortName ?? subjectId;
      const trophyName = `Trofi ${subjName} Kelas ${grade}`;
      updateProgressWithAchievements((prev) => {
        const prevBest = prev.subjectExamScores[examId] ?? 0;
        const subjectExamScores = {
          ...prev.subjectExamScores,
          [examId]: Math.max(prevBest, scorePct),
        };

        if (scorePct < 60) {
          return {
            ...prev,
            subjectExamScores,
            xp: prev.xp + 25,
          };
        }

        const firstClear = !prev.completedSubjectExams.includes(examId);
        const completedSubjectExams = firstClear
          ? [...prev.completedSubjectExams, examId]
          : prev.completedSubjectExams;
        const collectedTreasures = prev.collectedTreasures.includes(trophyName)
          ? prev.collectedTreasures
          : [...prev.collectedTreasures, trophyName];

        return {
          ...prev,
          coins: prev.coins + (firstClear ? 100 : 35),
          xp: prev.xp + (firstClear ? 200 : 60),
          score: prev.score + scorePct * 5,
          completedSubjectExams,
          subjectExamScores,
          collectedTreasures,
        };
      });

      if (scorePct >= 60) {
        sound3d.playGradeUpFanfare();
        const nextGrade: GradeNumber = grade < 6 ? ((grade + 1) as GradeNumber) : 6;
        window.setTimeout(() => {
          setGradeUpInfo({
            fromGrade: grade,
            toGrade: nextGrade,
            scorePct,
          });
        }, 320);
      }
    },
    [updateProgressWithAchievements]
  );

  const handleOpenGradeUp = useCallback(
    (fromGrade: GradeNumber, scorePct?: number) => {
      sound3d.playGradeUpFanfare();
      const toGrade: GradeNumber =
        fromGrade < 6 ? ((fromGrade + 1) as GradeNumber) : 6;
      setGradeUpInfo({ fromGrade, toGrade, scorePct });
    },
    []
  );

  const handleConfirmEnterNewWorld = useCallback(
    (toGrade: GradeNumber) => {
      const targetSubject: SubjectId = 'bahasa-indonesia';
      const firstChapter = getSubjectChapters(
        toGrade,
        targetSubject,
        progress.religion
      )[0];
      const nextChapterId = firstChapter?.id ?? `g${toGrade}-bi-1`;

      setProgress((prev) => ({
        ...prev,
        activeGrade: toGrade,
        activeBab: 1,
        activeSubject: targetSubject,
        activeChapterId: nextChapterId,
      }));
      setGradeUpInfo(null);
      setTargetRegionId(null);
      setMode('play3d');
      showToast(
        `Selamat datang di Kelas ${toGrade}: ${WORLD_THEMES[toGrade].worldName}!`
      );
    },
    [progress.religion, showToast]
  );

  const handleResetProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS });
    showToast('Progres berhasil diatur ulang ke awal.');
  }, [showToast]);

  return (
    <div className="w-full h-full relative">
      <OfflineIndicator />
      {/* Global Achievement / System Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-amber-300 border border-amber-400/50 shadow-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 pointer-events-none"
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {mode === 'play3d' ? (
        <PlayWorld3D
          grade={progress.activeGrade}
          progress={progress}
          initialRegionId={targetRegionId}
          onExitToMenu={() => {
            setTargetRegionId(null);
            setMode('menu');
          }}
          onToggleSound={handleToggleSound}
          onCollectRewards={handleCollectRewards}
          onNpcTalked={handleNpcTalked}
          onDiscoverRegion={handleGrade1DiscoverRegion}
          onVisitInterior={handleGrade1VisitInterior}
          onRecordMission={handleGrade1RecordMission}
          onMarketBalanceChange={handleGrade1MarketBalanceChange}
          onSelectActiveSubject={handleSelectActiveSubject}
          onSelectActiveChapter={handleSelectActiveChapter}
          onSelectReligion={handleSelectReligion}
          onSelectLocalRegion={handleSelectLocalRegion}
          onSaveArtwork={handleSaveArtwork}
          onMarkChapterStudied={handleMarkChapterStudied}
          onCompleteChapterQuiz={handleCompleteChapterQuiz}
          onCompleteSubjectExam={handleCompleteSubjectExam}
          onTriggerGradeUp={handleOpenGradeUp}
        />
      ) : (
        <div className="w-full h-screen overflow-y-auto bg-gradient-to-b from-amber-50/70 via-sky-50/50 to-emerald-50/60 select-text">
          <MenuNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onLaunchActiveWorld={() =>
              handleLaunchWorld(progress.activeGrade, progress.activeBab)
            }
            progress={progress}
            onToggleSound={handleToggleSound}
            onOpenTutorial={() => setTutorialOpen(true)}
          />

          <main className="pb-12">
            {activeTab === 'home' && (
              <MenuHomeView
                progress={progress}
                onStartPlay={handleLaunchWorld}
                onNavigateTab={setActiveTab}
                onOpenTutorial={() => setTutorialOpen(true)}
              />
            )}

            {activeTab === 'kelas' && (
              <GradeSelect3DView
                progress={progress}
                onSelectGradeAndBab={(grade, babOrder) =>
                  setProgress((prev) => ({
                    ...prev,
                    activeGrade: grade,
                    activeBab: isBabUnlocked(prev, grade, babOrder) ? babOrder : 1,
                  }))
                }
                onLaunchWorld={handleLaunchWorld}
                onTriggerGradeUp={handleOpenGradeUp}
              />
            )}

            {activeTab === 'peta' && (
              <AdventureMap3DView
                progress={progress}
                onLaunchWorld={handleLaunchWorld}
              />
            )}

            {activeTab === 'materi' && (
              <SubjectsMateriView
                progress={progress}
                onSelectReligion={handleSelectReligion}
                onSelectLocalRegion={handleSelectLocalRegion}
                onToggleEnglish={handleToggleEnglish}
                onMarkChapterStudied={handleMarkChapterStudied}
                onCompleteChapterQuiz={handleCompleteChapterQuiz}
                onCompleteSubjectExam={handleCompleteSubjectExam}
                onLaunchWorld={handleLaunchWorld}
                onTriggerGradeUp={handleOpenGradeUp}
              />
            )}

            {activeTab === 'inventaris' && (
              <Inventory3DView
                progress={progress}
                onBuyAccessory={handleBuyAccessory}
                onEquipAccessory={handleEquipAccessory}
              />
            )}

            {activeTab === 'prestasi' && (
              <Achievements3DView progress={progress} />
            )}

            {activeTab === 'profil' && (
              <PlayerProfile3DView
                progress={progress}
                onUpdateName={(name) =>
                  setProgress((prev) => ({ ...prev, playerName: name }))
                }
                onSelectHeroStyle={(heroStyle: HeroStyleId) =>
                  setProgress((prev) => ({ ...prev, heroStyle }))
                }
                onSelectReligion={handleSelectReligion}
                onSelectLocalRegion={handleSelectLocalRegion}
                onToggleEnglish={handleToggleEnglish}
                onToggleSound={handleToggleSound}
                onResetProgress={handleResetProgress}
              />
            )}
          </main>
        </div>
      )}

      {gradeUpInfo && (
        <GradeUpTransitionModal
          fromGrade={gradeUpInfo.fromGrade}
          toGrade={gradeUpInfo.toGrade}
          scorePct={gradeUpInfo.scorePct}
          progress={progress}
          onCancel={() => setGradeUpInfo(null)}
          onConfirmEnterNewWorld={handleConfirmEnterNewWorld}
        />
      )}

      {tutorialOpen && (
        <BeginnerTutorialModal
          playerName={progress.playerName}
          onClose={() => {
            setTutorialOpen(false);
            setProgress((prev) =>
              prev.seenTutorial ? prev : { ...prev, seenTutorial: true }
            );
          }}
        />
      )}
    </div>
  );
}
