import { GradeNumber, ReligionId, SubjectId } from '../inventoryData';
import { getAgamaChaptersForGrade } from './agama';
import { GRADE_1_CHAPTERS } from './grade1';
import { GRADE_2_CHAPTERS } from './grade2';
import { GRADE_3_CHAPTERS } from './grade3';
import { GRADE_4_CHAPTERS } from './grade4';
import { GRADE_5_CHAPTERS } from './grade5';
import { GRADE_6_CHAPTERS } from './grade6';
import { QuestionItem, SubjectChapter } from './types';
import { enrichGrade1Chapter } from './grade1Variations';

export * from './types';
export { ALL_AGAMA_TEMPLATES, getAgamaChaptersForGrade } from './agama';

export const STATIC_CURRICULUM_CHAPTERS: SubjectChapter[] = [
  ...GRADE_1_CHAPTERS,
  ...GRADE_2_CHAPTERS,
  ...GRADE_3_CHAPTERS,
  ...GRADE_4_CHAPTERS,
  ...GRADE_5_CHAPTERS,
  ...GRADE_6_CHAPTERS,
];

export function getSubjectChapters(
  grade: GradeNumber,
  subjectId: SubjectId,
  religion: ReligionId = 'islam'
): SubjectChapter[] {
  if (subjectId === 'agama') {
    return getAgamaChaptersForGrade(grade, religion)
      .sort((a, b) => a.chapterNumber - b.chapterNumber)
      .map(enrichGrade1Chapter);
  }
  return STATIC_CURRICULUM_CHAPTERS.filter(
    (c) => c.grade === grade && c.subjectId === subjectId
  )
    .sort((a, b) => a.chapterNumber - b.chapterNumber)
    .map(enrichGrade1Chapter);
}

export function getChapterById(
  chapterId: string,
  religion: ReligionId = 'islam'
): SubjectChapter | undefined {
  const foundStatic = STATIC_CURRICULUM_CHAPTERS.find((c) => c.id === chapterId);
  if (foundStatic) return enrichGrade1Chapter(foundStatic);

  // Dynamic match for Agama ID pattern: g{grade}-agama-{rel}-{ch}
  const match = /^g([1-6])-agama-([a-z]+)-([1-9])$/.exec(chapterId);
  if (match) {
    const grade = Number(match[1]) as GradeNumber;
    const rel = match[2] as ReligionId;
    const foundAgama = getAgamaChaptersForGrade(grade, rel).find((c) => c.id === chapterId);
    return foundAgama ? enrichGrade1Chapter(foundAgama) : undefined;
  }

  for (const g of [1, 2, 3, 4, 5, 6] as GradeNumber[]) {
    const ag = getAgamaChaptersForGrade(g, religion).find((c) => c.id === chapterId);
    if (ag) return enrichGrade1Chapter(ag);
  }
  return undefined;
}

/**
 * Builds the Ujian Akhir Mata Pelajaran question set by sampling 1 question per chapter
 * (up to 8 questions, minimum 5 questions) from all chapters in that (grade, subjectId).
 */
export function getSubjectFinalExamQuestions(
  grade: GradeNumber,
  subjectId: SubjectId,
  religion: ReligionId = 'islam'
): QuestionItem[] {
  const chapters = getSubjectChapters(grade, subjectId, religion);
  if (chapters.length === 0) return [];

  if (chapters.length >= 5) {
    return chapters.slice(0, 8).map((ch, idx) => {
      const q = ch.questions[idx % ch.questions.length];
      return {
        ...q,
        id: `exam-${ch.id}-${q.id}`,
      };
    });
  }

  // For subjects with 1-2 chapters (e.g., Agama, PJOK, Seni Budaya, B. Inggris),
  // gather up to 6 distinct questions evenly across their chapters.
  const collected: QuestionItem[] = [];
  const seenPrompts = new Set<string>();
  let round = 0;
  while (collected.length < 6 && round < 5) {
    for (const ch of chapters) {
      const q = ch.questions[round];
      if (q && !seenPrompts.has(q.prompt)) {
        seenPrompts.add(q.prompt);
        collected.push({
          ...q,
          id: `exam-${ch.id}-${q.id}`,
        });
        if (collected.length >= 6) break;
      }
    }
    round++;
  }
  return collected;
}

export interface CombinedExamQuestion extends QuestionItem {
  subjectId: SubjectId;
  subjectName: string;
}

/**
 * Builds a comprehensive multi-subject Ujian Akhir Kelas question set combining
 * higher-difficulty questions across ALL subjects of the active grade.
 */
export function getCombinedGradeExamQuestions(
  grade: GradeNumber,
  religion: ReligionId = 'islam',
  englishEnabled = true
): CombinedExamQuestion[] {
  const subjectList: Array<{ id: SubjectId; name: string }> = [
    { id: 'bahasa-indonesia', name: 'Bahasa Indonesia' },
    { id: 'matematika', name: 'Matematika' },
    { id: 'ipas', name: 'IPAS' },
    { id: 'pancasila', name: 'Pendidikan Pancasila' },
    { id: 'agama', name: 'Pendidikan Agama & Budi Pekerti' },
    { id: 'pjok', name: 'PJOK' },
    { id: 'seni-budaya', name: 'Seni Budaya' },
  ];
  if (englishEnabled) {
    subjectList.push({ id: 'bahasa-inggris', name: 'Bahasa Inggris' });
  }
  if (grade === 1) {
    subjectList.push({ id: 'muatan-lokal', name: 'Muatan Lokal & Budaya Daerah' });
  }

  const combined: CombinedExamQuestion[] = [];
  for (const subj of subjectList) {
    const chaps = getSubjectChapters(grade, subj.id, religion);
    if (chaps.length === 0) continue;
    // Prefer later, more challenging chapters & pick the last (harder) questions
    const hardCh = chaps[chaps.length - 1];
    const qA = hardCh.questions[hardCh.questions.length - 1] ?? hardCh.questions[0];
    if (qA) {
      combined.push({
        ...qA,
        id: `grade-exam-${grade}-${subj.id}-${qA.id}`,
        subjectId: subj.id,
        subjectName: subj.name,
      });
    }
    // For core subjects (BI, Mat, IPAS), also sample a second question from an earlier chapter
    if (
      (subj.id === 'bahasa-indonesia' ||
        subj.id === 'matematika' ||
        subj.id === 'ipas') &&
      chaps.length >= 4
    ) {
      const midCh = chaps[Math.floor(chaps.length / 2)];
      const qB = midCh.questions[midCh.questions.length - 1] ?? midCh.questions[0];
      if (qB && qB.prompt !== qA?.prompt) {
        combined.push({
          ...qB,
          id: `grade-exam-${grade}-${subj.id}-mid-${qB.id}`,
          subjectId: subj.id,
          subjectName: subj.name,
        });
      }
    }
  }
  return combined;
}

