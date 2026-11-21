import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  Lock,
  Play,
  Trophy,
} from 'lucide-react';
import {
  getChapterById,
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
  LOCAL_REGIONS,
  LocalRegionId,
  RELIGIONS,
  ReligionId,
  SUBJECTS,
  SubjectId,
} from '../game3d/inventoryData';
import { AdaptiveQuizResult, AdaptiveQuizRunner } from './AdaptiveQuizRunner';
import { ChapterVisualIllustration } from './ChapterVisualIllustration';

interface SubjectsMateriViewProps {
  progress: PlayerProgress3D;
  onSelectReligion: (religion: ReligionId) => void;
  onSelectLocalRegion?: (region: LocalRegionId) => void;
  onToggleEnglish: (enabled: boolean) => void;
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
  onLaunchWorld: (
    grade: GradeNumber,
    babOrder: 1 | 2 | 3 | 4,
    subjectId?: SubjectId,
    chapterId?: string
  ) => void;
  onTriggerGradeUp?: (fromGrade: GradeNumber, scorePct?: number) => void;
}

type LearningPanelMode = 'materi' | 'latihan' | 'ujian';

export function SubjectsMateriView({
  progress,
  onSelectReligion,
  onSelectLocalRegion,
  onToggleEnglish,
  onMarkChapterStudied,
  onCompleteChapterQuiz,
  onCompleteSubjectExam,
  onLaunchWorld,
  onTriggerGradeUp,
}: SubjectsMateriViewProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeNumber>(progress.activeGrade);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(progress.activeSubject);
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(1);
  const [panelMode, setPanelMode] = useState<LearningPanelMode>('materi');
  const [quizSessionKey, setQuizSessionKey] = useState(0);

  const gradeSubjects = useMemo(
    () => getSubjectsForGrade(selectedGrade, progress.englishEnabled),
    [selectedGrade, progress.englishEnabled]
  );

  // Keep selectedSubject valid for selectedGrade + englishEnabled
  useEffect(() => {
    if (!gradeSubjects.some((s) => s.id === selectedSubject)) {
      setSelectedSubject(gradeSubjects[0]?.id ?? 'bahasa-indonesia');
    }
  }, [gradeSubjects, selectedSubject]);

  const chapters = useMemo(
    () => getSubjectChapters(selectedGrade, selectedSubject, progress.religion),
    [selectedGrade, selectedSubject, progress.religion]
  );

  const activeChapter = useMemo(() => {
    return (
      chapters.find((c) => c.chapterNumber === selectedChapterNum) ?? chapters[0]
    );
  }, [chapters, selectedChapterNum]);

  // Reset quiz view when changing grade, subject, or chapter
  useEffect(() => {
    setPanelMode('materi');
  }, [selectedGrade, selectedSubject, selectedChapterNum]);

  const subjectMeta =
    SUBJECTS.find((s) => s.id === selectedSubject) ?? SUBJECTS[0];
  const examId = getSubjectExamId(selectedGrade, selectedSubject, progress.religion);
  const examUnlocked = isSubjectFinalExamUnlocked(progress, chapters);
  const examPassed = progress.completedSubjectExams.includes(examId);
  const examBestScore = progress.subjectExamScores[examId] ?? 0;
  const examQuestions = useMemo(
    () => getSubjectFinalExamQuestions(selectedGrade, selectedSubject, progress.religion),
    [selectedGrade, selectedSubject, progress.religion]
  );

  const activeQuestions: QuestionItem[] =
    panelMode === 'ujian'
      ? examQuestions
      : activeChapter?.questions ?? [];

  const nextChapter =
    panelMode === 'latihan' && activeChapter
      ? chapters.find((c) => c.chapterNumber === activeChapter.chapterNumber + 1)
      : undefined;

  const activeReligionLabel =
    RELIGIONS.find((r) => r.id === progress.religion)?.label ?? 'Islam';

  const startQuizSession = (mode: 'latihan' | 'ujian') => {
    if (mode === 'latihan' && activeChapter) {
      onMarkChapterStudied(activeChapter.id);
    }
    setPanelMode(mode);
    setQuizSessionKey((k) => k + 1);
  };

  const handleCompleteAdaptive = (result: AdaptiveQuizResult) => {
    if (panelMode === 'latihan' && activeChapter) {
      const earnedCoins = result.firstTryCorrect * 5;
      const earnedXp = result.firstTryCorrect * 15;
      onCompleteChapterQuiz(
        activeChapter,
        result.scorePct,
        earnedCoins,
        earnedXp,
        result
      );
    } else if (panelMode === 'ujian') {
      onCompleteSubjectExam(examId, result.scorePct, selectedGrade, selectedSubject);
    }
  };

  // Summary counts for selected grade
  const totalChaptersInGrade = gradeSubjects.reduce(
    (acc, s) => acc + getSubjectChapters(selectedGrade, s.id, progress.religion).length,
    0
  );
  const completedChaptersInGrade = gradeSubjects.reduce((acc, s) => {
    const chs = getSubjectChapters(selectedGrade, s.id, progress.religion);
    return acc + chs.filter((c) => progress.completedChapters.includes(c.id)).length;
  }, 0);

  const hasPassedExamInGrade = gradeSubjects.some((s) =>
    progress.completedSubjectExams.includes(
      getSubjectExamId(selectedGrade, s.id, progress.religion)
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header + Grade Picker */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-emerald-600 shrink-0" />
            <span>Kurikulum Merdeka SD · Kelas {selectedGrade}</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Pelajari materi lengkap beserta ilustrasi dan aktivitas praktik (4–8 bab per mata pelajaran), selesaikan 5 soal latihan berpenjelasan, hingga Ujian Akhir Mata Pelajaran.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {([1, 2, 3, 4, 5, 6] as GradeNumber[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                setSelectedGrade(g);
                setSelectedChapterNum(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                selectedGrade === g
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Kelas {g}
            </button>
          ))}
        </div>
      </div>

      {/* School Customization Bar: Agama Selector + Optional Bahasa Inggris + Grade Mastery */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="agama-select-materi"
              className="text-xs font-extrabold text-slate-700"
            >
              Agama:
            </label>
            <select
              id="agama-select-materi"
              value={progress.religion}
              onChange={(e) => onSelectReligion(e.target.value as ReligionId)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 cursor-pointer"
            >
              {RELIGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {selectedGrade === 1 && onSelectLocalRegion && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="mulok-select-materi"
                className="text-xs font-extrabold text-slate-700"
              >
                Daerah Mulok:
              </label>
              <select
                id="mulok-select-materi"
                value={progress.localRegion}
                onChange={(e) => onSelectLocalRegion(e.target.value as LocalRegionId)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-slate-900 cursor-pointer"
              >
                {LOCAL_REGIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => onToggleEnglish(!progress.englishEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
              progress.englishEnabled
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            Bahasa Inggris Sekolah: {progress.englishEnabled ? 'Diselenggarakan ✓' : 'Tidak Aktif'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
          <GraduationCap className="w-4 h-4" />
          <span>
            Progres Kelas {selectedGrade}: {completedChaptersInGrade}/{totalChaptersInGrade} Bab Selesai
          </span>
        </div>
      </div>

      {/* Unlocked Grade Promotion Banner */}
      {hasPassedExamInGrade && onTriggerGradeUp && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-sm sm:text-base font-extrabold">
                {selectedGrade < 6
                  ? `Gerbang Naik Kelas ${selectedGrade + 1} Sudah Terbuka!`
                  : 'Wisuda Agung Kelas 6 SD Sudah Terbuka!'}
              </p>
              <p className="text-xs font-semibold text-slate-900/90">
                {selectedGrade < 6
                  ? `Kamu sudah menaklukkan Ujian Akhir di Kelas ${selectedGrade}. Rayakan kelulusan dan ubah karakter serta dunia 3D ke Kelas ${selectedGrade + 1}!`
                  : 'Kamu telah menaklukkan Ujian Akhir Kelas 6 SD! Buka upacara wisuda pahlawan ilmu.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTriggerGradeUp(selectedGrade)}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 text-xs font-extrabold cursor-pointer shadow"
          >
            {selectedGrade < 6
              ? `Naik Kelas ${selectedGrade + 1} Sekarang →`
              : 'Rayakan Wisuda SD →'}
          </button>
        </div>
      )}

      {/* Subject Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {gradeSubjects.map((subj) => {
          const chs = getSubjectChapters(selectedGrade, subj.id, progress.religion);
          const doneChs = chs.filter((c) => progress.completedChapters.includes(c.id)).length;
          const isSelected = selectedSubject === subj.id;
          const sExamId = getSubjectExamId(selectedGrade, subj.id, progress.religion);
          const passedExam = progress.completedSubjectExams.includes(sExamId);

          return (
            <button
              key={subj.id}
              type="button"
              onClick={() => {
                setSelectedSubject(subj.id);
                setSelectedChapterNum(1);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white border-slate-200 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: subj.accentHex }}
                >
                  {subj.id === 'agama' ? `Agama (${activeReligionLabel})` : subj.shortName}
                </span>
                <span
                  className={`font-mono text-[11px] font-extrabold ${
                    isSelected ? 'text-amber-300' : 'text-emerald-700'
                  }`}
                >
                  {doneChs}/{chs.length} Bab
                </span>
              </div>
              <p
                className={`font-display text-sm font-extrabold mt-2 leading-snug ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}
              >
                {subj.name}
              </p>
              {passedExam && (
                <p className="text-[10px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Ujian Akhir Lulus
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content: Left Chapter Roadmap + Right Active Chapter Learning / Practice / Final Exam */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sequential Chapters Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Daftar Bab Berurutan
                </p>
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  {subjectMeta.shortName} Kelas {selectedGrade}
                </h3>
              </div>
              <span
                className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-white"
                style={{ backgroundColor: subjectMeta.accentHex }}
              >
                {chapters.length} Bab
              </span>
            </div>

            <div className="space-y-2">
              {chapters.map((ch) => {
                const unlocked = isSubjectChapterUnlocked(progress, chapters, ch.chapterNumber);
                const studied = progress.studiedChapters.includes(ch.id);
                const completed = progress.completedChapters.includes(ch.id);
                const scorePct = progress.chapterScores[ch.id];
                const isSelected = activeChapter?.id === ch.id && panelMode !== 'ujian';

                return (
                  <button
                    key={ch.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      setSelectedChapterNum(ch.chapterNumber);
                      setPanelMode('materi');
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      !unlocked
                        ? 'bg-slate-100 border-slate-200 opacity-70 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm cursor-pointer'
                        : 'bg-white border-slate-200 hover:border-sky-400 cursor-pointer'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-xs font-extrabold ${
                        completed
                          ? 'bg-emerald-600 text-white'
                          : unlocked
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : unlocked ? (
                        ch.chapterNumber
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 leading-snug">
                        {ch.title}
                      </p>
                      <p className="text-[11px] font-semibold mt-0.5 text-slate-500">
                        {!unlocked
                          ? `Selesaikan Bab ${ch.chapterNumber - 1} dulu`
                          : completed
                          ? `Lulus · Nilai Terbaik ${scorePct ?? 100}%`
                          : studied
                          ? 'Materi dibaca · Siap Latihan'
                          : 'Terbuka · Pelajari materi dulu'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Ujian Akhir Mata Pelajaran Box */}
            <div
              className={`mt-3 p-4 rounded-2xl border space-y-2.5 ${
                examUnlocked
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-slate-100 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Ujian Akhir Mata Pelajaran</span>
                </span>
                {examPassed && (
                  <span className="text-[11px] font-extrabold text-emerald-700">
                    {examBestScore}% ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                {examUnlocked
                  ? `Semua bab ${subjectMeta.shortName} Kelas ${selectedGrade} selesai! Kerjakan ${examQuestions.length} soal Ujian Akhir untuk meraih Trofi Mapel (+100 Koin & +200 XP).`
                  : `Selesaikan seluruh ${chapters.length} bab ${subjectMeta.shortName} di atas untuk membuka Ujian Akhir.`}
              </p>
              <button
                type="button"
                disabled={!examUnlocked}
                onClick={() => startQuizSession('ujian')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold cursor-pointer ${
                  examUnlocked
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {examUnlocked
                  ? examPassed
                    ? 'Ulangi Ujian Akhir'
                    : 'Mulai Ujian Akhir Mata Pelajaran'
                  : 'Ujian Akhir Terkunci'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Detail Panel: Materi Belajar / Latihan 5 Soal / Ujian Akhir */}
        <div className="lg:col-span-8">
          {panelMode === 'materi' && activeChapter ? (
            <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-sm space-y-6">
              {/* Chapter Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-white text-[11px] font-extrabold"
                      style={{ backgroundColor: subjectMeta.accentHex }}
                    >
                      {subjectMeta.shortName} · Kelas {selectedGrade}
                    </span>
                    {progress.completedChapters.includes(activeChapter.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Lulus ({progress.chapterScores[activeChapter.id] ?? 100}%)
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                    {activeChapter.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-700">
                    Hadiah Kelulusan Bab: +{activeChapter.rewardCoins} Koin · +{activeChapter.rewardXp} XP · Lencana "{activeChapter.rewardBadge}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onLaunchWorld(selectedGrade, 1, selectedSubject, activeChapter.id)
                  }
                  className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Mainkan Misi 3D Bab {activeChapter.chapterNumber}</span>
                </button>
              </div>

              {/* Tujuan Pembelajaran */}
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                  1. Tujuan Pembelajaran
                </p>
                <ul className="space-y-1.5">
                  {activeChapter.tujuanPembelajaran.map((t, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                      <span className="text-sky-600 font-extrabold">✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Materi Lengkap */}
              <div className="space-y-2.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  2. Penjelasan Materi Lengkap
                </p>
                <div className="space-y-3 rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
                  {activeChapter.materiLengkap.map((paragraf, i) => (
                    <p key={i} className="text-sm text-slate-800 leading-relaxed">
                      {paragraf}
                    </p>
                  ))}
                </div>
              </div>

              {/* Visual Diagram Illustration */}
              <ChapterVisualIllustration
                visualType={activeChapter.visualType}
                caption={activeChapter.visualCaption}
                accentHex={subjectMeta.accentHex}
              />

              {/* Contoh Sehari-hari + Misi Dunia 3D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                    3. Contoh Sehari-hari di Indonesia
                  </p>
                  <ul className="space-y-1.5">
                    {activeChapter.contohSehariHari.map((c, i) => (
                      <li key={i} className="text-xs text-slate-800 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    4. Tantangan Petualangan 3D
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {activeChapter.tantanganPetualangan.title}
                  </p>
                  <p className="text-xs text-slate-700">
                    {activeChapter.tantanganPetualangan.instruction}
                  </p>
                  <p className="text-[11px] font-bold text-amber-800">
                    Objek 3D Terkait: {activeChapter.tantanganPetualangan.target3dObject}
                  </p>
                </div>
              </div>

              {/* Aktivitas Praktik Mandiri & 3D */}
              {activeChapter.aktivitas && activeChapter.aktivitas.length > 0 && (
                <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                    5. Aktivitas Praktik di Dunia 3D & Sekolah
                  </p>
                  <ul className="space-y-1.5">
                    {activeChapter.aktivitas.map((act, i) => (
                      <li key={i} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                        <span className="font-mono text-indigo-700 font-extrabold">{i + 1}.</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Study Gate -> Open 5-Question Practice */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Minimal <strong>60% benar (3 dari 5 soal)</strong> untuk lulus & membuka Bab berikutnya.
                </p>
                <button
                  type="button"
                  onClick={() => startQuizSession('latihan')}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center gap-2 shadow cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {progress.studiedChapters.includes(activeChapter.id)
                      ? `Mulai Latihan ${activeChapter.questions.length} Soal`
                      : 'Tandai Materi Dipelajari & Mulai Latihan'}
                  </span>
                </button>
              </div>
            </div>
          ) : activeChapter ? (
            /* Interactive Practice / Final Exam Panel with 2-Step Progressive Hints */
            <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-md text-white text-[11px] font-extrabold mb-1"
                    style={{ backgroundColor: subjectMeta.accentHex }}
                  >
                    {panelMode === 'ujian'
                      ? `UJIAN AKHIR ${subjectMeta.shortName.toUpperCase()} · KELAS ${selectedGrade}`
                      : `LATIHAN ${activeChapter.title}`}
                  </span>
                  <h3 className="font-display text-xl font-extrabold text-slate-900">
                    {panelMode === 'ujian'
                      ? `Ujian Akhir ${subjectMeta.shortName}`
                      : activeChapter.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setPanelMode('materi')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer min-h-[40px]"
                >
                  Kembali ke Materi
                </button>
              </div>

              <AdaptiveQuizRunner
                key={`${activeChapter.id}-${panelMode}-${quizSessionKey}`}
                badgeLabel={
                  panelMode === 'ujian'
                    ? `Ujian Akhir Kelas ${selectedGrade}`
                    : `${subjectMeta.shortName} · Bab ${activeChapter.chapterNumber}`
                }
                accentHex={subjectMeta.accentHex}
                questions={activeQuestions}
                variationQuestions={
                  panelMode === 'latihan' ? activeChapter.variationQuestions : undefined
                }
                subjectId={selectedSubject}
                chapterTitle={activeChapter.title}
                rewardCoins={activeChapter.rewardCoins}
                rewardXp={activeChapter.rewardXp}
                rewardBadge={
                  panelMode === 'ujian'
                    ? `Trofi ${subjectMeta.shortName} Kelas ${selectedGrade}`
                    : activeChapter.rewardBadge
                }
                playerName={progress.playerName}
                isExam={panelMode === 'ujian'}
                grade={selectedGrade}
                nextChapterLabel={
                  nextChapter
                    ? `Buka & Pelajari Bab ${nextChapter.chapterNumber} →`
                    : undefined
                }
                onReadMateri={() => setPanelMode('materi')}
                onGoNextChapter={
                  nextChapter
                    ? () => {
                        setSelectedChapterNum(nextChapter.chapterNumber);
                        setPanelMode('materi');
                      }
                    : undefined
                }
                onTriggerGradeUp={
                  onTriggerGradeUp
                    ? () => onTriggerGradeUp(selectedGrade, 80)
                    : undefined
                }
                onComplete={handleCompleteAdaptive}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Keep unused import check happy if getChapterById is exported/imported later
void getChapterById;
