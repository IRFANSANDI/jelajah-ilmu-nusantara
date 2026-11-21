import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Lock,
  Play,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import {
  getSubjectChapters,
  getSubjectExamId,
  getSubjectFinalExamQuestions,
  isSubjectChapterUnlocked,
  isSubjectFinalExamUnlocked,
  PlayerProgress3D,
  QuestionItem,
  SubjectChapter,
} from '../game3d/curriculum';
import {
  getSubjectsForGrade,
  GradeNumber,
  RELIGIONS,
  SUBJECTS,
  SubjectId,
} from '../game3d/inventoryData';
import { AdaptiveQuizResult, AdaptiveQuizRunner } from './AdaptiveQuizRunner';
import { ChapterVisualIllustration } from './ChapterVisualIllustration';

interface InWorldCurriculumModalProps {
  grade: GradeNumber;
  worldName: string;
  progress: PlayerProgress3D;
  onClose: () => void;
  onSelectActiveSubject: (subjectId: SubjectId) => void;
  onLaunchChapterInWorld?: (chapter: SubjectChapter) => void;
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
}

export function InWorldCurriculumModal({
  grade,
  worldName,
  progress,
  onClose,
  onSelectActiveSubject,
  onLaunchChapterInWorld,
  onMarkChapterStudied,
  onCompleteChapterQuiz,
  onCompleteSubjectExam,
}: InWorldCurriculumModalProps) {
  const gradeSubjects = useMemo(
    () => getSubjectsForGrade(grade, progress.englishEnabled),
    [grade, progress.englishEnabled]
  );

  const [subjectId, setSubjectId] = useState<SubjectId>(() =>
    gradeSubjects.some((s) => s.id === progress.activeSubject)
      ? progress.activeSubject
      : gradeSubjects[0]?.id ?? 'bahasa-indonesia'
  );
  const [chapterNum, setChapterNum] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'materi' | 'latihan' | 'ujian'>('materi');
  const [sessionKey, setSessionKey] = useState(0);

  const chapters = useMemo(
    () => getSubjectChapters(grade, subjectId, progress.religion),
    [grade, subjectId, progress.religion]
  );

  useEffect(() => {
    // Auto-focus the earliest uncompleted unlocked chapter for convenience
    const nextOpen = chapters.find(
      (c) =>
        isSubjectChapterUnlocked(progress, chapters, c.chapterNumber) &&
        !progress.completedChapters.includes(c.id)
    );
    setChapterNum(nextOpen?.chapterNumber ?? 1);
    setViewMode('materi');
  }, [subjectId, grade]);

  const activeChapter =
    chapters.find((c) => c.chapterNumber === chapterNum) ?? chapters[0];
  const subjectMeta = SUBJECTS.find((s) => s.id === subjectId) ?? SUBJECTS[0];
  const religionLabel =
    RELIGIONS.find((r) => r.id === progress.religion)?.label ?? 'Islam';

  const examId = getSubjectExamId(grade, subjectId, progress.religion);
  const examUnlocked = isSubjectFinalExamUnlocked(progress, chapters);
  const examQuestions = useMemo(
    () => getSubjectFinalExamQuestions(grade, subjectId, progress.religion),
    [grade, subjectId, progress.religion]
  );

  const activeQuestions: QuestionItem[] =
    viewMode === 'ujian' ? examQuestions : activeChapter?.questions ?? [];

  const nextChapter =
    viewMode === 'latihan' && activeChapter
      ? chapters.find((c) => c.chapterNumber === activeChapter.chapterNumber + 1)
      : undefined;

  const startSession = (mode: 'latihan' | 'ujian') => {
    if (mode === 'latihan' && activeChapter) {
      onMarkChapterStudied(activeChapter.id);
    }
    setViewMode(mode);
    setSessionKey((k) => k + 1);
  };

  const handleCompleteAdaptive = (result: AdaptiveQuizResult) => {
    if (viewMode === 'latihan' && activeChapter) {
      onCompleteChapterQuiz(
        activeChapter,
        result.scorePct,
        result.firstTryCorrect * 5,
        result.firstTryCorrect * 15,
        result
      );
    } else if (viewMode === 'ujian') {
      onCompleteSubjectExam(examId, result.scorePct, grade, subjectId);
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-amber-300 uppercase">
                Kelas {grade} · {worldName}
              </p>
              <h2 className="font-display text-base sm:text-lg font-extrabold">
                Kurikulum Merdeka Per-Mapel & Bab Berurutan
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup kurikulum"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subject Tabs */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {gradeSubjects.map((s) => {
            const chs = getSubjectChapters(grade, s.id, progress.religion);
            const done = chs.filter((c) => progress.completedChapters.includes(c.id)).length;
            const active = s.id === subjectId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSubjectId(s.id);
                  onSelectActiveSubject(s.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400'
                }`}
              >
                {s.id === 'agama' ? `Agama (${religionLabel})` : s.shortName}{' '}
                <span className={active ? 'text-amber-300' : 'text-emerald-700'}>
                  {done}/{chs.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Chapter List Left */}
          <div className="md:col-span-4 space-y-2">
            {chapters.map((ch) => {
              const unlocked = isSubjectChapterUnlocked(progress, chapters, ch.chapterNumber);
              const done = progress.completedChapters.includes(ch.id);
              const stars = progress.chapterStars?.[ch.id] ?? (done ? 1 : 0);
              const active = activeChapter?.id === ch.id && viewMode !== 'ujian';
              return (
                <button
                  key={ch.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    setChapterNum(ch.chapterNumber);
                    setViewMode('materi');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 text-xs ${
                    !unlocked
                      ? 'bg-slate-100 border-slate-200 opacity-65 cursor-not-allowed'
                      : active
                      ? 'bg-emerald-50 border-emerald-500 font-bold cursor-pointer'
                      : 'bg-white border-slate-200 hover:border-sky-400 cursor-pointer'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center font-mono text-[11px] font-extrabold ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : unlocked
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : unlocked ? (
                      ch.chapterNumber
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </span>
                  <span className="truncate text-slate-900 flex-1">{ch.title}</span>
                  {done && stars > 0 && (
                    <span
                      className="flex items-center gap-0.5 text-amber-500 shrink-0"
                      aria-label={`${stars} bintang`}
                    >
                      {[1, 2, 3].map((n) => (
                        <Star
                          key={n}
                          className={`w-3 h-3 ${
                            n <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              disabled={!examUnlocked}
              onClick={() => startSession('ujian')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-extrabold flex items-center gap-2 ${
                examUnlocked
                  ? 'bg-amber-100 border-amber-400 text-amber-950 hover:bg-amber-200 cursor-pointer'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {examUnlocked
                  ? 'Ujian Akhir Mata Pelajaran'
                  : `Ujian Akhir (Buka setelah ${chapters.length} Bab)`}
              </span>
            </button>
          </div>

          {/* Right Learning / Quiz */}
          <div className="md:col-span-8">
            {viewMode === 'materi' && activeChapter ? (
              <div className="space-y-3.5">
                <div>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-white text-[10px] font-extrabold"
                    style={{ backgroundColor: subjectMeta.accentHex }}
                  >
                    {subjectMeta.shortName} · Bab {activeChapter.chapterNumber}
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-slate-900 mt-1">
                    {activeChapter.title}
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                  <p className="text-[11px] font-extrabold text-sky-900 uppercase">
                    Tujuan Pembelajaran
                  </p>
                  {activeChapter.tujuanPembelajaran.map((t, i) => (
                    <p key={i} className="text-xs text-slate-800">
                      ✓ {t}
                    </p>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  {activeChapter.materiLengkap.map((m, i) => (
                    <p key={i} className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {m}
                    </p>
                  ))}
                </div>

                <ChapterVisualIllustration
                  visualType={activeChapter.visualType}
                  caption={activeChapter.visualCaption}
                  accentHex={subjectMeta.accentHex}
                />

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <p className="text-[11px] font-extrabold text-emerald-900 uppercase">
                    Contoh Sehari-hari
                  </p>
                  {activeChapter.contohSehariHari.map((c, i) => (
                    <p key={i} className="text-xs text-slate-700">
                      • {c}
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  {onLaunchChapterInWorld && (
                    <button
                      type="button"
                      onClick={() => onLaunchChapterInWorld(activeChapter)}
                      className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Mainkan Misi 3D Bab Ini</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startSession('latihan')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Mulai Tantangan {activeChapter.questions.length} Soal Bab Ini</span>
                  </button>
                </div>
              </div>
            ) : activeChapter ? (
              <AdaptiveQuizRunner
                key={`${activeChapter.id}-${viewMode}-${sessionKey}`}
                badgeLabel={
                  viewMode === 'ujian'
                    ? `Ujian Akhir ${subjectMeta.shortName}`
                    : `${subjectMeta.shortName} · Bab ${activeChapter.chapterNumber}`
                }
                accentHex={subjectMeta.accentHex}
                questions={activeQuestions}
                variationQuestions={
                  viewMode === 'latihan' ? activeChapter.variationQuestions : undefined
                }
                subjectId={subjectId}
                chapterTitle={activeChapter.title}
                rewardCoins={activeChapter.rewardCoins}
                rewardXp={activeChapter.rewardXp}
                rewardBadge={
                  viewMode === 'ujian'
                    ? `Trofi ${subjectMeta.shortName} Kelas ${grade}`
                    : activeChapter.rewardBadge
                }
                playerName={progress.playerName}
                isExam={viewMode === 'ujian'}
                grade={grade}
                nextChapterLabel={
                  nextChapter ? `Buka Bab ${nextChapter.chapterNumber} →` : undefined
                }
                onReadMateri={() => setViewMode('materi')}
                onGoNextChapter={
                  nextChapter
                    ? () => {
                        setChapterNum(nextChapter.chapterNumber);
                        setViewMode('materi');
                      }
                    : undefined
                }
                onClose={onClose}
                onComplete={handleCompleteAdaptive}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
