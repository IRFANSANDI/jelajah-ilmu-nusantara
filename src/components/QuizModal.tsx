import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Coins,
  Heart,
  HelpCircle,
  RotateCcw,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { CheckpointMission, WorldCurriculum, WorldThemeConfig } from '../types/game';
import { soundEngine } from '../utils/sound';

interface QuizModalProps {
  world: WorldThemeConfig;
  curriculum: WorldCurriculum;
  mission: CheckpointMission;
  alreadyCompleted: boolean;
  onClose: () => void;
  onCompleteMission: (result: {
    missionOrder: 1 | 2 | 3;
    stars: number;
    scoreEarned: number;
    coinsEarned: number;
    xpEarned: number;
    bestStreakInRun: number;
    passed: boolean;
  }) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  world,
  curriculum,
  mission,
  alreadyCompleted,
  onClose,
  onCompleteMission,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showMateriHint, setShowMateriHint] = useState(false);
  const [phase, setPhase] = useState<'quiz' | 'summary'>('quiz');
  const [finalOutcome, setFinalOutcome] = useState<{
    passed: boolean;
    stars: number;
    scoreEarned: number;
    coinsEarned: number;
    xpEarned: number;
  } | null>(null);

  const currentQuestion = mission.questions[questionIndex];
  const isAnswered = selectedOption !== null;
  const isCurrentCorrect = selectedOption === currentQuestion?.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (isAnswered || phase !== 'quiz') return;
    setSelectedOption(idx);

    if (idx === currentQuestion.correctIndex) {
      soundEngine.playCorrect();
      const nextStreak = currentStreak + 1;
      setCorrectCount((c) => c + 1);
      setCurrentStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
    } else {
      soundEngine.playWrong();
      setMistakes((m) => m + 1);
      setCurrentStreak(0);
      setLives((l) => Math.max(0, l - 1));
    }
  };

  const finishMission = (passed: boolean, totalCorrect: number, totalMistakes: number) => {
    const stars = !passed ? 0 : totalMistakes === 0 ? 3 : totalMistakes === 1 ? 2 : 1;
    const baseScore = totalCorrect * 100 + (passed ? 50 : 0);
    const coinsEarned = passed
      ? alreadyCompleted
        ? Math.max(5, Math.round(mission.rewardCoins * 0.4))
        : mission.rewardCoins + (stars === 3 ? 10 : 0)
      : 0;
    const xpEarned = passed
      ? alreadyCompleted
        ? Math.max(10, Math.round(mission.rewardXp * 0.4))
        : mission.rewardXp
      : 10;

    if (passed) {
      soundEngine.playLevelUp();
    }

    setFinalOutcome({
      passed,
      stars,
      scoreEarned: baseScore,
      coinsEarned,
      xpEarned,
    });
    setPhase('summary');

    onCompleteMission({
      missionOrder: mission.order,
      stars,
      scoreEarned: baseScore,
      coinsEarned,
      xpEarned,
      bestStreakInRun: bestStreak,
      passed,
    });
  };

  const handleNext = () => {
    if (!isAnswered) return;
    soundEngine.playClick();

    // Check if out of lives
    if (lives <= 0) {
      finishMission(false, correctCount, mistakes);
      return;
    }

    if (questionIndex + 1 < mission.questions.length) {
      setQuestionIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      finishMission(true, correctCount, mistakes);
    }
  };

  const handleRetry = () => {
    soundEngine.playClick();
    setQuestionIndex(0);
    setLives(3);
    setSelectedOption(null);
    setCorrectCount(0);
    setMistakes(0);
    setCurrentStreak(0);
    setPhase('quiz');
    setFinalOutcome(null);
  };

  // Keyboard shortcuts (1-4 to pick option, Enter to continue)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (phase === 'quiz') {
        if (!isAnswered && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          if (idx >= 0 && idx < currentQuestion.options.length) {
            handleSelectOption(idx);
          }
        } else if (isAnswered && e.key === 'Enter') {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-pop-in my-auto">
        {/* Top Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">
              {world.name} · {curriculum.faseLabel}
            </p>
            <h2
              id="quiz-modal-title"
              className="font-display text-lg sm:text-xl font-extrabold text-slate-900 truncate"
            >
              {mission.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Hearts */}
            <div className="flex items-center gap-1" aria-label={`Nyawa tersisa ${lives}`}>
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-5 h-5 transition-colors ${
                    heart <= lives
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-slate-300 fill-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              aria-label="Tutup kuis"
              className="w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {phase === 'quiz' && currentQuestion ? (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Progress & Materi Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">
                  Soal {questionIndex + 1} / {mission.questions.length}
                </span>
                <span className="text-xs text-slate-500">· {currentQuestion.materiTag}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowMateriHint((v) => !v);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showMateriHint ? 'Tutup Materi' : 'Lihat Petunjuk Materi'}</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${((questionIndex + (isAnswered ? 1 : 0)) / mission.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Collapsible Kurikulum Hint */}
            {showMateriHint && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-sm">
                <p className="font-bold text-amber-950 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Ringkasan Materi: {curriculum.materiTitle}</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-amber-900 text-xs sm:text-sm">
                  {curriculum.materiPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Question Prompt */}
            <div className="space-y-4">
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQuestion.prompt}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrectOpt = idx === currentQuestion.correctIndex;

                  let styleClass =
                    'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40';
                  if (isAnswered) {
                    if (isCorrectOpt) {
                      styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-950';
                    } else if (isChosen) {
                      styleClass = 'bg-rose-50 border-rose-500 text-rose-950';
                    } else {
                      styleClass = 'bg-slate-50 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 min-h-[50px] ${
                        isAnswered ? 'cursor-default' : 'cursor-pointer'
                      } ${styleClass}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            isAnswered && isCorrectOpt
                              ? 'bg-emerald-600 text-white'
                              : isAnswered && isChosen
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {optionLetters[idx]}
                        </span>
                        <span className="text-sm sm:text-base font-medium leading-snug">
                          {opt}
                        </span>
                      </div>

                      {isAnswered && isCorrectOpt && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isChosen && !isCorrectOpt && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pembahasan Box after answering */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-pop-in ${
                  isCurrentCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCurrentCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hebat! Jawabanmu Benar!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        Belum Tepat — Jawaban benar adalah{' '}
                        {optionLetters[currentQuestion.correctIndex]}.
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-800">
                  <span className="font-bold">Pembahasan: </span>
                  {currentQuestion.pembahasan}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold cursor-pointer min-h-[44px]"
                  >
                    <span>
                      {lives <= 0
                        ? 'Lihat Hasil'
                        : questionIndex + 1 < mission.questions.length
                        ? 'Soal Berikutnya'
                        : 'Selesaikan Pos'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Summary Phase */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-10 h-10 ${
                    finalOutcome && s <= finalOutcome.stars
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-extrabold text-slate-900">
                {finalOutcome?.passed ? 'Misi Pos Berhasil!' : 'Nyawa Habis — Ayo Coba Lagi!'}
              </h3>
              <p className="text-sm text-slate-600">
                {finalOutcome?.passed
                  ? `Kamu menjawab benar ${correctCount} dari ${mission.questions.length} soal di ${mission.title}.`
                  : 'Jangan menyerah! Baca kembali ringkasan materi lalu ulangi tantangannya.'}
              </p>
            </div>

            {finalOutcome && (
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-800 font-medium">Koin Didapat</p>
                  <p className="font-mono text-lg font-bold text-amber-900 tabular-nums mt-0.5 flex items-center justify-center gap-1">
                    <Coins className="w-4 h-4 text-amber-600" />
                    +{finalOutcome.coinsEarned}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <p className="text-xs text-sky-800 font-medium">Skor Misi</p>
                  <p className="font-mono text-lg font-bold text-sky-900 tabular-nums mt-0.5">
                    +{finalOutcome.scoreEarned}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs text-emerald-800 font-medium">XP Naik</p>
                  <p className="font-mono text-lg font-bold text-emerald-900 tabular-nums mt-0.5">
                    +{finalOutcome.xpEarned}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold cursor-pointer min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Main Ulang Pos</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer min-h-[44px]"
              >
                <span>Kembali ke Peta Dunia</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
