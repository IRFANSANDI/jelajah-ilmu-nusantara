import { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Gift,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  getQuestionHints,
  getQuestionSkillTag,
  QuestionItem,
} from '../game3d/curriculum/types';
import type { GradeNumber, SubjectId } from '../game3d/inventoryData';
import { sound3d } from '../game3d/sound3d';

export interface AdaptiveQuizResult {
  scorePct: number;
  correctCount: number;
  totalQuestions: number;
  firstTryCorrect: number;
  wrongAttempts: number;
  starsEarned: number;
  masteredSkills: string[];
  needsPracticeSkills: string[];
  usedVariation: boolean;
}

interface AdaptiveQuizRunnerProps {
  badgeLabel: string;
  accentHex: string;
  questions: QuestionItem[];
  variationQuestions?: QuestionItem[];
  subjectId?: SubjectId;
  chapterTitle: string;
  rewardCoins: number;
  rewardXp: number;
  rewardBadge: string;
  playerName: string;
  isExam?: boolean;
  grade?: GradeNumber;
  nextChapterLabel?: string;
  onAnswerCorrect?: () => void;
  onReadMateri?: () => void;
  onGoNextChapter?: () => void;
  onTriggerGradeUp?: () => void;
  onClose?: () => void;
  onExitToMenu?: () => void;
  onComplete: (result: AdaptiveQuizResult) => void;
}

export function AdaptiveQuizRunner({
  badgeLabel,
  accentHex,
  questions,
  variationQuestions,
  subjectId,
  chapterTitle,
  rewardCoins,
  rewardXp,
  rewardBadge,
  playerName,
  isExam = false,
  grade = 1,
  nextChapterLabel,
  onAnswerCorrect,
  onReadMateri,
  onGoNextChapter,
  onTriggerGradeUp,
  onClose,
  onExitToMenu,
  onComplete,
}: AdaptiveQuizRunnerProps) {
  const [useVariation, setUseVariation] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(0);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [solvedCurrent, setSolvedCurrent] = useState(false);

  const [earnedCredits, setEarnedCredits] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [totalWrongAttempts, setTotalWrongAttempts] = useState(0);
  const [masteredSkills, setMasteredSkills] = useState<string[]>([]);
  const [needsPracticeSkills, setNeedsPracticeSkills] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<AdaptiveQuizResult | null>(null);

  const activeQuestions = useMemo(() => {
    if (useVariation && variationQuestions && variationQuestions.length > 0) {
      return variationQuestions;
    }
    return questions;
  }, [useVariation, variationQuestions, questions]);

  const currentQ = activeQuestions[qIdx];
  const hasVariationSet = Boolean(variationQuestions && variationQuestions.length > 0);

  const hints = useMemo(
    () => (currentQ ? getQuestionHints(currentQ, subjectId) : (['', ''] as [string, string])),
    [currentQ, subjectId]
  );

  const resetSession = (variation: boolean) => {
    setUseVariation(variation);
    setQIdx(0);
    setDisabledOptions([]);
    setWrongOnCurrent(0);
    setHintLevel(0);
    setSolvedCurrent(false);
    setEarnedCredits(0);
    setFirstTryCount(0);
    setTotalWrongAttempts(0);
    setMasteredSkills([]);
    setNeedsPracticeSkills([]);
    setFinished(false);
    setFinalResult(null);
  };

  const handleRequestHint = () => {
    setHintLevel((prev) => (prev === 0 ? 1 : 2));
  };

  const handlePickOption = (optIdx: number) => {
    if (!currentQ || solvedCurrent || disabledOptions.includes(optIdx)) return;

    if (optIdx === currentQ.correctIndex) {
      sound3d.playCoin();
      setSolvedCurrent(true);
      onAnswerCorrect?.();

      const skill = getQuestionSkillTag(currentQ, chapterTitle, subjectId);
      const credit = wrongOnCurrent === 0 ? 1 : wrongOnCurrent === 1 ? 0.7 : 0.4;
      setEarnedCredits((c) => c + credit);

      if (wrongOnCurrent === 0) {
        setFirstTryCount((c) => c + 1);
        setMasteredSkills((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
      } else {
        setNeedsPracticeSkills((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
      }
    } else {
      sound3d.playAlertCue();
      const nextWrong = wrongOnCurrent + 1;
      setDisabledOptions((prev) => (prev.includes(optIdx) ? prev : [...prev, optIdx]));
      setWrongOnCurrent(nextWrong);
      setTotalWrongAttempts((t) => t + 1);
      setHintLevel((prev) => (nextWrong === 1 ? Math.max(prev, 1) as 0 | 1 | 2 : 2));
    }
  };

  const handleNext = () => {
    if (qIdx + 1 < activeQuestions.length) {
      setQIdx((i) => i + 1);
      setDisabledOptions([]);
      setWrongOnCurrent(0);
      setHintLevel(0);
      setSolvedCurrent(false);
      return;
    }

    const total = Math.max(1, activeQuestions.length);
    const scorePct = Math.min(100, Math.round((earnedCredits / total) * 100));
    const starsEarned = scorePct >= 90 ? 3 : scorePct >= 75 ? 2 : scorePct >= 60 ? 1 : 0;

    if (scorePct >= 60) {
      sound3d.playMissionComplete();
    }

    const result: AdaptiveQuizResult = {
      scorePct,
      correctCount: activeQuestions.length,
      totalQuestions: total,
      firstTryCorrect: firstTryCount,
      wrongAttempts: totalWrongAttempts,
      starsEarned,
      masteredSkills,
      needsPracticeSkills,
      usedVariation: useVariation,
    };
    setFinalResult(result);
    setFinished(true);
    onComplete(result);
  };

  if (!finished && currentQ) {
    const subjectTag =
      isExam && 'subjectName' in currentQ
        ? `Ujian Gabungan · ${(currentQ as QuestionItem & { subjectName?: string }).subjectName ?? ''}`
        : badgeLabel;

    return (
      <div className="space-y-4">
        {/* Progress & Mode Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-block px-2.5 py-1 rounded-md text-white text-[11px] font-extrabold"
              style={{ backgroundColor: accentHex }}
            >
              {subjectTag}
            </span>
            {useVariation && (
              <span className="px-2 py-0.5 rounded-md bg-violet-100 border border-violet-300 text-violet-900 text-[11px] font-extrabold">
                Mode Variasi Baru
              </span>
            )}
            <span className="font-mono text-xs font-extrabold text-slate-600">
              Soal {qIdx + 1}/{activeQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!solvedCurrent && (
              <button
                type="button"
                onClick={handleRequestHint}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{hintLevel === 0 ? 'Petunjuk 1' : hintLevel === 1 ? 'Petunjuk 2' : 'Petunjuk Aktif'}</span>
              </button>
            )}
            {onReadMateri && (
              <button
                type="button"
                onClick={onReadMateri}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sky-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Baca Materi</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{
              width: `${((qIdx + (solvedCurrent ? 1 : 0)) / Math.max(1, activeQuestions.length)) * 100}%`,
            }}
          />
        </div>

        {/* Question Prompt */}
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {currentQ.prompt}
        </p>

        {/* Progressive Hint Boxes (before solving or after a wrong try) */}
        {!solvedCurrent && hintLevel >= 1 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-1.5">
            <p className="font-extrabold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {wrongOnCurrent > 0
                  ? 'Belum tepat, yuk coba pilih lagi! Ini petunjuk pertamamu:'
                  : 'Petunjuk 1:'}
              </span>
            </p>
            <p className="text-slate-800">{hints[0]}</p>
            {hintLevel >= 2 && (
              <div className="pt-1.5 border-t border-amber-200">
                <p className="font-extrabold text-amber-900">Petunjuk 2:</p>
                <p className="text-slate-800">{hints[1]}</p>
              </div>
            )}
          </div>
        )}

        {/* Answer Options — Wrong options are soft-disabled without locking the whole question! */}
        <div className="space-y-2">
          {currentQ.options.map((opt, oIdx) => {
            const isDisabledWrong = disabledOptions.includes(oIdx);
            const isRight = oIdx === currentQ.correctIndex;

            let btnClass =
              'bg-white border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 text-slate-900 cursor-pointer';
            if (solvedCurrent) {
              if (isRight) {
                btnClass = 'bg-emerald-600 border-emerald-700 text-white cursor-default';
              } else if (isDisabledWrong) {
                btnClass = 'bg-rose-50 border-rose-200 text-rose-400 line-through cursor-not-allowed';
              } else {
                btnClass = 'bg-slate-50 border-slate-200 text-slate-400 cursor-default';
              }
            } else if (isDisabledWrong) {
              btnClass = 'bg-amber-50 border-amber-300 text-amber-700/70 line-through cursor-not-allowed';
            }

            return (
              <button
                key={oIdx}
                type="button"
                disabled={solvedCurrent || isDisabledWrong}
                onClick={() => handlePickOption(oIdx)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-between gap-3 ${btnClass}`}
              >
                <span>{opt}</span>
                {solvedCurrent && isRight && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                )}
                {!solvedCurrent && isDisabledWrong && (
                  <span className="text-[11px] font-bold text-amber-700 no-underline shrink-0">
                    Coba pilihan lain
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Solved Explanation & Next Button */}
        {solvedCurrent && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-2">
            <p className="font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {wrongOnCurrent === 0
                  ? 'Tepat Sekali pada Percobaan Pertama! (+5 Koin, +15 XP)'
                  : 'Berhasil Memperbaiki Jawaban! (+5 Koin, +15 XP)'}
              </span>
            </p>
            <p className="text-slate-800 leading-relaxed">{currentQ.penjelasan}</p>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold cursor-pointer"
              >
                {qIdx + 1 < activeQuestions.length
                  ? 'Pertanyaan Berikutnya →'
                  : isExam
                  ? 'Selesaikan Ujian Akhir'
                  : 'Lihat Hasil & Penghargaan'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Summary Screen
  const scorePct = finalResult?.scorePct ?? 0;
  const passed = scorePct >= 60;
  const earnedStars = finalResult?.starsEarned ?? 0;

  return (
    <div className="py-3 space-y-5 text-center">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
          passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}
      >
        {passed ? (isExam ? <Award className="w-8 h-8" /> : <Gift className="w-8 h-8" />) : <RotateCcw className="w-8 h-8" />}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display text-2xl font-extrabold text-slate-900">
          {passed
            ? `Hebat, ${playerName}!`
            : 'Ayo Ulas Materi & Coba Lagi!'}
        </h3>

        {passed && (
          <div className="flex items-center justify-center gap-1 pt-0.5" aria-label={`${earnedStars} bintang`}>
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`w-6 h-6 ${
                  n <= earnedStars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        <p className="text-sm text-slate-600">
          Skor Penguasaan: <strong className="text-slate-900">{scorePct}%</strong> · Benar Langsung:{' '}
          <strong className="text-emerald-700">
            {finalResult?.firstTryCorrect ?? 0}/{finalResult?.totalQuestions ?? activeQuestions.length}
          </strong>{' '}
          soal
        </p>
      </div>

      {passed && (
        <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div>
            <p className="text-[11px] font-bold text-slate-500">Hadiah Koin</p>
            <p className="font-mono text-base font-extrabold text-amber-600">
              +{(isExam ? 80 : rewardCoins) + (finalResult?.firstTryCorrect ?? 0) * 5}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">Bonus XP</p>
            <p className="font-mono text-base font-extrabold text-emerald-600">
              +{(isExam ? 120 : rewardXp) + (finalResult?.firstTryCorrect ?? 0) * 15}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">Lencana</p>
            <p className="text-xs font-extrabold text-sky-700">{rewardBadge}</p>
          </div>
        </div>
      )}

      {/* Skill Mastery Diagnostics */}
      {(masteredSkills.length > 0 || needsPracticeSkills.length > 0) && (
        <div className="text-left rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2.5 text-xs">
          <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <span>Catatan Kemampuan Belajar</span>
          </p>
          {masteredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {masteredSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold"
                >
                  ✓ {sk}
                </span>
              ))}
            </div>
          )}
          {needsPracticeSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {needsPracticeSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-bold"
                >
                  ↻ Perlu Latihan: {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2.5 pt-1">
        {passed && nextChapterLabel && onGoNextChapter && (
          <button
            type="button"
            onClick={onGoNextChapter}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold cursor-pointer"
          >
            {nextChapterLabel}
          </button>
        )}

        {passed && isExam && onTriggerGradeUp && grade < 6 && (
          <button
            type="button"
            onClick={onTriggerGradeUp}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold cursor-pointer"
          >
            Naik ke Kelas {grade + 1} →
          </button>
        )}

        {hasVariationSet && (
          <button
            type="button"
            onClick={() => resetSession(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mainkan Soal Variasi Baru</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => resetSession(false)}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 text-sm font-bold cursor-pointer"
        >
          Ulangi Soal
        </button>

        {!passed && onReadMateri && (
          <button
            type="button"
            onClick={onReadMateri}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-bold cursor-pointer"
          >
            Pelajari Materi Lagi
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold cursor-pointer"
          >
            Jelajahi Dunia 3D
          </button>
        )}

        {onExitToMenu && (
          <button
            type="button"
            onClick={onExitToMenu}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold cursor-pointer"
          >
            Ke Menu Utama
          </button>
        )}
      </div>
    </div>
  );
}
