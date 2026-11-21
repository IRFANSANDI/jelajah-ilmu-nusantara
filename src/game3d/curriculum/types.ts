import {
  Accessory3DId,
  GradeNumber,
  HeroStyleId,
  LocalRegionId,
  ReligionId,
  SubjectId,
} from '../inventoryData';

export type VisualTypeId =
  | 'alphabet'
  | 'syllables'
  | 'numbers'
  | 'addition'
  | 'geometry'
  | 'clock-money'
  | 'pancasila-symbol'
  | 'fraction'
  | 'plant-parts'
  | 'food-chain'
  | 'water-cycle'
  | 'circuit'
  | 'solar-system'
  | 'volume-cube'
  | 'bar-chart'
  | 'magnet'
  | 'indonesia-map'
  | 'sport-pose'
  | 'art-palette'
  | 'english-cards'
  | 'agama-values'
  | 'writing-steps'
  | 'muatan-lokal-culture';

export interface SavedArtwork {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: number;
}

export interface QuestionItem {
  id: string;
  prompt: string;
  options: [string, string, string];
  correctIndex: number;
  penjelasan: string;
  hints?: string[];
  skillTag?: string;
}

export interface ChapterScoreHistoryEntry {
  scorePct: number;
  correct: number;
  total: number;
  firstTryCorrect: number;
  wrongAttempts: number;
  usedVariation?: boolean;
  timestamp: number;
}

export interface SubjectChapter {
  id: string;
  grade: GradeNumber;
  subjectId: SubjectId;
  chapterNumber: number;
  title: string;
  tujuanPembelajaran: string[];
  materiLengkap: string[];
  contohSehariHari: string[];
  aktivitas?: string[];
  visualType: VisualTypeId;
  visualCaption: string;
  tantanganPetualangan: {
    title: string;
    instruction: string;
    target3dObject: string;
  };
  questions: QuestionItem[];
  variationQuestions?: QuestionItem[];
  rewardCoins: number;
  rewardXp: number;
  rewardBadge: string;
}

export interface PlayerProgress3D {
  playerName: string;
  heroStyle: HeroStyleId;
  religion: ReligionId;
  localRegion: LocalRegionId;
  englishEnabled: boolean;
  activeGrade: GradeNumber;
  activeBab: 1 | 2 | 3 | 4;
  activeSubject: SubjectId;
  activeChapterId: string;
  coins: number;
  score: number;
  xp: number;
  soundEnabled: boolean;
  // Granular Kurikulum Merdeka per-subject chapter progress
  studiedChapters: string[];
  completedChapters: string[];
  chapterScores: Record<string, number>;
  chapterStars: Record<string, number>;
  chapterScoreHistory: Record<string, ChapterScoreHistoryEntry[]>;
  masteredSkills: string[];
  needsPracticeSkills: string[];
  completedSubjectExams: string[];
  subjectExamScores: Record<string, number>;
  savedArtworks: SavedArtwork[];
  // World-level Bab progression & 3D inventory
  completedBabs: string[];
  babScores: Record<string, number>;
  collectedTreasures: string[];
  ownedAccessories: Accessory3DId[];
  equippedAccessory: Accessory3DId;
  unlockedAchievements: string[];
  npcsTalkedTotal: string[];
  // Grade 1 Open-World exploration & activity progress
  discoveredRegions: string[];
  visitedInteriors: string[];
  completedMissions: string[];
  marketPurchases: number;
  seenTutorial?: boolean;
}

export const STORAGE_KEY = 'jelajah_ilmu_nusantara_3d_v2';

export const DEFAULT_PROGRESS: PlayerProgress3D = {
  playerName: 'Petualang Cilik',
  heroStyle: 'bima',
  religion: 'islam',
  localRegion: 'jawa',
  englishEnabled: true,
  activeGrade: 1,
  activeBab: 1,
  activeSubject: 'bahasa-indonesia',
  activeChapterId: 'g1-bi-1',
  coins: 30,
  score: 0,
  xp: 0,
  soundEnabled: true,
  studiedChapters: [],
  completedChapters: [],
  chapterScores: {},
  chapterStars: {},
  chapterScoreHistory: {},
  masteredSkills: [],
  needsPracticeSkills: [],
  completedSubjectExams: [],
  subjectExamScores: {},
  savedArtworks: [],
  completedBabs: [],
  babScores: {},
  collectedTreasures: [],
  ownedAccessories: ['none'],
  equippedAccessory: 'none',
  unlockedAchievements: [],
  npcsTalkedTotal: [],
  discoveredRegions: ['desa-ceria'],
  visitedInteriors: [],
  completedMissions: [],
  marketPurchases: 0,
  seenTutorial: false,
};

export function loadPlayerProgress(): PlayerProgress3D {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<PlayerProgress3D>;
    const safeGrade =
      parsed.activeGrade && parsed.activeGrade >= 1 && parsed.activeGrade <= 6
        ? parsed.activeGrade
        : DEFAULT_PROGRESS.activeGrade;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      localRegion: parsed.localRegion ?? DEFAULT_PROGRESS.localRegion,
      activeGrade: safeGrade,
      activeChapterId:
        typeof parsed.activeChapterId === 'string' && parsed.activeChapterId.length > 0
          ? parsed.activeChapterId
          : `g${safeGrade}-bi-1`,
      studiedChapters: Array.isArray(parsed.studiedChapters) ? parsed.studiedChapters : [],
      completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
      chapterScores:
        parsed.chapterScores && typeof parsed.chapterScores === 'object'
          ? parsed.chapterScores
          : {},
      chapterStars:
        parsed.chapterStars && typeof parsed.chapterStars === 'object'
          ? parsed.chapterStars
          : {},
      chapterScoreHistory:
        parsed.chapterScoreHistory && typeof parsed.chapterScoreHistory === 'object'
          ? parsed.chapterScoreHistory
          : {},
      masteredSkills: Array.isArray(parsed.masteredSkills) ? parsed.masteredSkills : [],
      needsPracticeSkills: Array.isArray(parsed.needsPracticeSkills) ? parsed.needsPracticeSkills : [],
      completedSubjectExams: Array.isArray(parsed.completedSubjectExams)
        ? parsed.completedSubjectExams
        : [],
      subjectExamScores:
        parsed.subjectExamScores && typeof parsed.subjectExamScores === 'object'
          ? parsed.subjectExamScores
          : {},
      savedArtworks: Array.isArray(parsed.savedArtworks) ? parsed.savedArtworks : [],
      completedBabs: Array.isArray(parsed.completedBabs) ? parsed.completedBabs : [],
      babScores:
        parsed.babScores && typeof parsed.babScores === 'object' ? parsed.babScores : {},
      collectedTreasures: Array.isArray(parsed.collectedTreasures)
        ? parsed.collectedTreasures
        : [],
      ownedAccessories:
        Array.isArray(parsed.ownedAccessories) && parsed.ownedAccessories.length > 0
          ? parsed.ownedAccessories
          : ['none'],
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
      npcsTalkedTotal: Array.isArray(parsed.npcsTalkedTotal)
        ? parsed.npcsTalkedTotal
        : [],
      discoveredRegions:
        Array.isArray(parsed.discoveredRegions) && parsed.discoveredRegions.length > 0
          ? parsed.discoveredRegions
          : ['desa-ceria'],
      visitedInteriors: Array.isArray(parsed.visitedInteriors) ? parsed.visitedInteriors : [],
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
      marketPurchases: typeof parsed.marketPurchases === 'number' ? parsed.marketPurchases : 0,
      seenTutorial: typeof parsed.seenTutorial === 'boolean' ? parsed.seenTutorial : false,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function savePlayerProgress(progress: PlayerProgress3D): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function isSubjectChapterUnlocked(
  progress: PlayerProgress3D,
  chapters: SubjectChapter[],
  chapterNumber: number
): boolean {
  if (chapterNumber <= 1) return true;
  const prevChapter = chapters.find((c) => c.chapterNumber === chapterNumber - 1);
  if (!prevChapter) return true;
  return progress.completedChapters.includes(prevChapter.id);
}

export function isSubjectFinalExamUnlocked(
  progress: PlayerProgress3D,
  chapters: SubjectChapter[]
): boolean {
  if (chapters.length === 0) return false;
  return chapters.every((c) => progress.completedChapters.includes(c.id));
}

export function getSubjectExamId(
  grade: GradeNumber,
  subjectId: SubjectId,
  religion: ReligionId
): string {
  return subjectId === 'agama'
    ? `exam-g${grade}-agama-${religion}`
    : `exam-g${grade}-${subjectId}`;
}

export function getQuestionHints(q: QuestionItem, subjectId?: SubjectId): [string, string] {
  if (q.hints && q.hints.length >= 2) return [q.hints[0], q.hints[1]];
  const promptLower = q.prompt.toLowerCase();
  const ans = q.options[q.correctIndex] ?? '';
  const firstWord = ans.split(/\s+/)[0] ?? ans;

  let step1 =
    q.hints && q.hints.length === 1 && q.hints[0].trim().length > 0
      ? q.hints[0]
      : 'Baca kembali pertanyaannya pelan-pelan dan bayangkan contoh nyata di sekitarmu!';
  if (!q.hints || q.hints.length === 0) {
    if (subjectId === 'matematika' || /\d/.test(q.prompt)) {
      step1 = 'Coba hitung pelan-pelan dengan jarimu atau bayangkan benda nyata (apel/balok)!';
    } else if (subjectId === 'bahasa-indonesia' || promptLower.includes('huruf') || promptLower.includes('kata')) {
      step1 = 'Ucapkan kata atau hurufnya keras-keras agar bunyinya terdengar jelas!';
    } else if (subjectId === 'bahasa-inggris') {
      step1 = 'Ingat arti kata Bahasa Inggris yang sering kita ucapkan di sekolah atau rumah!';
    } else if (subjectId === 'ipas') {
      step1 = 'Amati ciri bagian tubuh, tanaman, hewan, atau benda nyata di lingkungan sekitarmu!';
    } else if (subjectId === 'pancasila' || subjectId === 'agama') {
      step1 = 'Pikirkan sikap mana yang paling ramah, jujur, bersih, dan membuat orang lain senang!';
    } else if (subjectId === 'pjok') {
      step1 = 'Bayangkan gerakan tubuh yang aman dan membuat badan kita tetap sehat!';
    } else if (subjectId === 'seni-budaya') {
      step1 = 'Ingat warna, bentuk garis, atau bunyi alat musik yang pernah kamu coba!';
    } else if (subjectId === 'muatan-lokal') {
      step1 = 'Ingat nama rumah adat, makanan khas, atau sapaan sopan dari daerah Nusantara!';
    }
  }

  const clueCore =
    q.penjelasan.length > 10
      ? q.penjelasan
      : `Pilih jawaban yang paling masuk akal dimulai dengan "${firstWord}".`;
  const step2 = `Petunjuk Guru: ${clueCore}`;
  return [step1, step2];
}

export function getQuestionSkillTag(
  q: QuestionItem,
  chapterTitle: string,
  subjectId?: SubjectId
): string {
  if (q.skillTag && q.skillTag.trim().length > 0) return q.skillTag;
  const cleanTitle = chapterTitle.replace(/^Bab \d+:\s*/, '').trim();
  const p = q.prompt.toLowerCase();
  if (p.includes('vokal') || p.includes('konsonan') || p.includes('huruf')) return 'Mengenal Huruf & Bunyi';
  if (p.includes('suku kata') || p.includes('kalimat') || p.includes('baca')) return 'Membaca Kata & Kalimat';
  if (p.includes('jumlah') || p.includes('ditambah') || p.includes('+')) return 'Penjumlahan Bilangan';
  if (p.includes('sisa') || p.includes('dikurang') || p.includes('-')) return 'Pengurangan Bilangan';
  if (p.includes('kubus') || p.includes('bola') || p.includes('lingkaran') || p.includes('segitiga') || p.includes('bangun')) return 'Bentuk Bangun Datar & Ruang';
  if (p.includes('jam') || p.includes('uang') || p.includes('rupiah') || p.includes('berat') || p.includes('panjang')) return 'Pengukuran, Waktu & Uang';
  if (p.includes('indera') || p.includes('mata') || p.includes('telinga')) return 'Panca Indera Tubuh';
  if (p.includes('tanaman') || p.includes('tumbuhan') || p.includes('hewan')) return 'Tumbuhan & Hewan Sekitar';
  if (p.includes('pancasila') || p.includes('sila') || p.includes('garuda')) return 'Simbol & Nilai Pancasila';
  if (p.includes('aturan') || p.includes('rukun') || p.includes('maaf')) return 'Aturan & Hidup Rukun';
  if (subjectId === 'agama') return `Budi Pekerti (${cleanTitle.slice(0, 26)})`;
  return cleanTitle.slice(0, 32) || 'Pemahaman Materi';
}

