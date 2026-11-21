import { SubjectChapter } from './curriculum/types';
import { WorldTheme3D } from './curriculumData';
import {
  LocalRegionId,
  ReligionId,
  SubjectId,
} from './inventoryData';
import { CollectibleSpawn, NpcDefinition, NpcRoleStyle } from './worldData';

export type Grade1LabKind =
  | 'agama-practice'
  | 'pancasila-sort'
  | 'word-builder'
  | 'math-orchard-cube'
  | 'ipas-nature-lab'
  | 'pjok-health-lab'
  | 'seni-studio-music'
  | 'english-voice-cards'
  | 'mulok-culture-cards'
  | 'shape-color-sort'
  | 'sentence-builder'
  | 'market-money-shop'
  | 'pjok-motion-coach'
  | 'combined-exam';

export type Grade1RegionId =
  | 'desa-ceria'
  | 'kebun-pengetahuan'
  | 'kota-sekolah'
  | 'hutan-misteri'
  | 'pantai-dan-laut'
  | 'pasar-sahabat'
  | 'kerajaan-ilmu'
  | 'laboratorium-ilmuwan';

export interface Grade1OpenWorldRegionMeta {
  id: Grade1RegionId;
  name: string;
  subtitle: string;
  accentHex: string;
  spawnX: number;
  spawnZ: number;
  yaw: number;
  radius: number;
  description: string;
  relatedSubjects: SubjectId[];
}

export const GRADE1_OPEN_WORLD_REGIONS: Grade1OpenWorldRegionMeta[] = [
  {
    id: 'desa-ceria',
    name: 'Desa Ceria',
    subtitle: 'Rumah Hangat & Taman Bermain',
    accentHex: '#0284C7',
    spawnX: -12,
    spawnZ: 8,
    yaw: 0.35,
    radius: 26,
    description: 'Pusat awal petualangan berisi Rumah Ceria (interior 3D lengkap), Taman Bermain pelangi, Taman Angka, dan Rumah Huruf.',
    relatedSubjects: ['bahasa-indonesia', 'pjok', 'seni-budaya'],
  },
  {
    id: 'kebun-pengetahuan',
    name: 'Kebun Pengetahuan',
    subtitle: 'Tanaman, Hewan & Sumur Air',
    accentHex: '#16A34A',
    spawnX: -48,
    spawnZ: -20,
    yaw: 0.4,
    radius: 22,
    description: 'Kebun apel dan jeruk segar, petak tanaman 3 tahap pertumbuhan, sumur air timba, serta kandang kelinci dan domba jinak.',
    relatedSubjects: ['ipas', 'matematika'],
  },
  {
    id: 'kota-sekolah',
    name: 'Kota Sekolah',
    subtitle: 'Sekolah, Perpustakaan & Rumah Ibadah',
    accentHex: '#4F46E5',
    spawnX: -18,
    spawnZ: -38,
    yaw: 0.1,
    radius: 26,
    description: 'Kawasan kota pendidikan dengan Sekolah Nusantara, Perpustakaan Ceria, serta tempat ibadah sesuai agama siswa.',
    relatedSubjects: ['bahasa-indonesia', 'agama', 'pancasila', 'bahasa-inggris'],
  },
  {
    id: 'hutan-misteri',
    name: 'Hutan Misteri',
    subtitle: 'Ekosistem Hutan & Zona Aman',
    accentHex: '#059669',
    spawnX: 38,
    spawnZ: -34,
    yaw: -0.4,
    radius: 24,
    description: 'Hutan tropis rimbun penuh pohon buah liar, flora hutan, dan hewan liar yang harus dihindari menuju Zona Aman.',
    relatedSubjects: ['ipas', 'pjok', 'bahasa-indonesia'],
  },
  {
    id: 'pantai-dan-laut',
    name: 'Pantai dan Laut',
    subtitle: 'Dermaga Kayu, Warna & Bentuk',
    accentHex: '#0891B2',
    spawnX: 40,
    spawnZ: 36,
    yaw: -0.5,
    radius: 26,
    description: 'Pantai berpasir hangat, dermaga kayu yang bisa dijelajahi di atas laut jernih, perahu, serta Plaza Bentuk & Warna.',
    relatedSubjects: ['matematika', 'seni-budaya', 'muatan-lokal'],
  },
  {
    id: 'pasar-sahabat',
    name: 'Pasar Sahabat',
    subtitle: 'Jual Beli Buah & Koin Rupiah',
    accentHex: '#D97706',
    spawnX: -42,
    spawnZ: 34,
    yaw: 0.5,
    radius: 22,
    description: 'Pasar rakyat ramah anak untuk menjual buah hasil panen, berbelanja perlengkapan sekolah, dan berlatih hitung uang Rupiah.',
    relatedSubjects: ['matematika', 'pancasila', 'muatan-lokal'],
  },
  {
    id: 'kerajaan-ilmu',
    name: 'Kerajaan Ilmu',
    subtitle: 'Istana Pengetahuan & Ujian Akhir',
    accentHex: '#7C3AED',
    spawnX: 40,
    spawnZ: 2,
    yaw: -1.57,
    radius: 24,
    description: 'Istana megah di timur jembatan tempat memajang karya seni dan menghadapi Ujian Akhir Gabungan Kelas 1.',
    relatedSubjects: ['pancasila', 'bahasa-indonesia', 'matematika', 'seni-budaya'],
  },
  {
    id: 'laboratorium-ilmuwan',
    name: 'Laboratorium Ilmuwan Muda',
    subtitle: 'Eksperimen Sains & Bangun Ruang 3D',
    accentHex: '#0D9488',
    spawnX: 24,
    spawnZ: 22,
    yaw: -1.57,
    radius: 18,
    description: 'Kawasan riset cilik tempat anak menguji benda padat-cair, cahaya-bayangan, listrik sederhana, dan hologram bangun ruang kubus bersama Prof. Cilik Nabil.',
    relatedSubjects: ['ipas', 'matematika'],
  },
];

export function findGrade1RegionAt(x: number, z: number): Grade1OpenWorldRegionMeta {
  let closest = GRADE1_OPEN_WORLD_REGIONS[0];
  let bestScore = Infinity;
  for (const reg of GRADE1_OPEN_WORLD_REGIONS) {
    const dx = x - reg.spawnX;
    const dz = z - reg.spawnZ;
    const dist = Math.hypot(dx, dz);
    if (dist < reg.radius && dist < bestScore) {
      bestScore = dist;
      closest = reg;
    } else if (bestScore === Infinity) {
      const normalized = dist / reg.radius;
      if (normalized < 1.35) {
        closest = reg;
      }
    }
  }
  return closest;
}

export interface Grade1WorldStationSpec {
  id: string;
  label: string;
  sublabel: string;
  category:
    | 'learn-spot'
    | 'fruit-tree'
    | 'fruit-basket'
    | 'fruit-stall'
    | 'trash-item'
    | 'trash-bin-organic'
    | 'trash-bin-anorganic'
    | 'plant-plot'
    | 'water-well'
    | 'safe-zone'
    | 'animal-feed'
    | 'hurdle'
    | 'balance-beam'
    | 'hygiene-sink'
    | 'color-fountain'
    | 'art-easel'
    | 'music-bar'
    | 'english-object'
    | 'cube-shrine'
    | 'shape-color-pad'
    | 'market-shop'
    | 'exam-throne'
    | 'boat-dock'
    | 'reading-spot'
    | 'pjok-coach';
  x: number;
  z: number;
  colorHex: number;
  detailText: string;
  englishWord?: string;
  englishTranslation?: string;
  noteIndex?: number;
  isRotten?: boolean;
  isOrganic?: boolean;
}

export interface Grade1BagState {
  subjectId: SubjectId;
  goodFruits: number;
  rottenFruits: number;
  eatenFruits: number;
  trashCollected: number;
  trashSorted: number;
  seedsPlanted: number;
  plantsWatered: number;
  plantsBloomed: number;
  hasWaterBucket: boolean;
  wordsAssembled: number;
  lettersFound: number;
  hurdlesJumped: number;
  balanceSuccess: boolean;
  handWashed: boolean;
  colorsMixed: number;
  musicNotesPlayed: number;
  englishWordsHeard: number;
  cubeNetInspected: boolean;
  chasedByPredator: boolean;
  inSafeZone: boolean;
  shapesColorsSorted: number;
  sentencesBuilt: number;
  marketPurchases: number;
  pjokPosesDone: number;
  activePose: string | null;
  stepsDiscovered: string[];
}

export function createInitialGrade1Bag(subjectId: SubjectId): Grade1BagState {
  return {
    subjectId,
    goodFruits: 0,
    rottenFruits: 0,
    eatenFruits: 0,
    trashCollected: 0,
    trashSorted: 0,
    seedsPlanted: 0,
    plantsWatered: 0,
    plantsBloomed: 0,
    hasWaterBucket: false,
    wordsAssembled: 0,
    lettersFound: 0,
    hurdlesJumped: 0,
    balanceSuccess: false,
    handWashed: false,
    colorsMixed: 0,
    musicNotesPlayed: 0,
    englishWordsHeard: 0,
    cubeNetInspected: false,
    chasedByPredator: false,
    inSafeZone: false,
    shapesColorsSorted: 0,
    sentencesBuilt: 0,
    marketPurchases: 0,
    pjokPosesDone: 0,
    activePose: null,
    stepsDiscovered: [],
  };
}

export interface ReligionSanctuaryMeta {
  id: ReligionId;
  sanctuaryName: string;
  skyHex: number;
  fogHex: number;
  grassRgb: [number, number, number];
  accentHex: string;
  wallHex: number;
  roofHex: number;
  greeting: string;
  introStory: string;
  mentorName: string;
  mentorRole: string;
  practiceStations: Array<{ id: string; title: string; lesson: string; x: number; z: number }>;
  triviaQ: {
    prompt: string;
    options: [string, string, string];
    correctIndex: number;
    explanation: string;
  };
}

// STRICTLY ISOLATED PER RELIGION — zero blending across religions!
export const RELIGION_SANCTUARY_META: Record<ReligionId, ReligionSanctuaryMeta> = {
  islam: {
    id: 'islam',
    sanctuaryName: 'Taman Masjid Cahaya',
    skyHex: 0xbae6fd,
    fogHex: 0xd1fae5,
    grassRgb: [0.18, 0.58, 0.34],
    accentHex: '#0D9488',
    wallHex: 0xffffff,
    roofHex: 0x059669,
    greeting: 'Assalamu’alaikum anak saleh! Selamat datang di Taman Masjid Cahaya.',
    introStory: 'Jelajahi Masjid Cahaya, pelajari doa Basmalah, tata cara wudu yang bersih, dan sikap hormat kepada ayah dan ibu.',
    mentorName: 'Ustadz Farhan',
    mentorRole: 'Pembimbing Akhlak Islam',
    practiceStations: [
      { id: 'isl-wudu', title: 'Pancuran Wudu', lesson: 'Sebelum salat, berwudu membersihkan wajah, tangan, kepala, dan kaki dengan tertib.', x: -7.5, z: 2.0 },
      { id: 'isl-doa', title: 'Mimbar Doa & Syukur', lesson: 'Ucapkan Bismillah saat memulai belajar dan Alhamdulillah sebagai rasa syukur kepada Allah.', x: -16.5, z: -10.0 },
      { id: 'isl-bakti', title: 'Pondok Bakti Orang Tua', lesson: 'Berbicara lembut, mencium tangan orang tua, dan berkata jujur membuat keluarga bahagia.', x: 20.0, z: -2.0 },
    ],
    triviaQ: {
      prompt: 'Kalimat baik yang dibaca sebelum memulai belajar bagi anak muslim adalah...',
      options: ['Bismillahirrahmanirrahim', 'Permisi dulu', 'Selamat malam'],
      correctIndex: 0,
      explanation: 'Basmalah dibaca untuk memohon berkah Allah Swt. sebelum aktivitas kebaikan.',
    },
  },
  kristen: {
    id: 'kristen',
    sanctuaryName: 'Bukit Gereja Damai',
    skyHex: 0xcffafe,
    fogHex: 0xe0f2fe,
    grassRgb: [0.22, 0.62, 0.36],
    accentHex: '#0284C7',
    wallHex: 0xf8fafc,
    roofHex: 0x0284c7,
    greeting: 'Shalom! Selamat datang di Bukit Gereja Damai penuh kasih Tuhan.',
    introStory: 'Kunjungi Gereja Damai, nyanyikan pujian syukur atas ciptaan Tuhan, dan praktikkan kasih kepada sesama.',
    mentorName: 'Kak Yohanes',
    mentorRole: 'Guru Sekolah Minggu',
    practiceStations: [
      { id: 'krs-ciptaan', title: 'Taman Ciptaan Tuhan', lesson: 'Matahari, bunga, dan burung adalah ciptaan Tuhan yang patut kita syukuri dan rawat.', x: -7.5, z: 2.0 },
      { id: 'krs-doa', title: 'Lonceng Doa Syukur', lesson: 'Anak Kristen berdoa sebelum makan, sebelum belajar, dan sebelum tidur mengucap terima kasih.', x: -16.5, z: -10.0 },
      { id: 'krs-kasih', title: 'Bangku Kasih Sesama', lesson: 'Menolong teman yang terjatuh dan berbagi makanan adalah wujud nyata kasih Kristus.', x: 20.0, z: -2.0 },
    ],
    triviaQ: {
      prompt: 'Wujud mengasihi sesama ciptaan Tuhan saat melihat tanaman layu adalah...',
      options: ['Menyiram dan merawatnya', 'Menginjak daunnya', 'Membiarkannya kering'],
      correctIndex: 0,
      explanation: 'Merawat tumbuhan dan menyayangi sesama adalah perintah kasih Tuhan.',
    },
  },
  katolik: {
    id: 'katolik',
    sanctuaryName: 'Taman Kapel Kasih',
    skyHex: 0xe0e7ff,
    fogHex: 0xf0f9ff,
    grassRgb: [0.2, 0.56, 0.34],
    accentHex: '#4F46E5',
    wallHex: 0xfef3c7,
    roofHex: 0x4338ca,
    greeting: 'Berkah Dalem! Selamat datang di Taman Kapel Kasih yang tenang.',
    introStory: 'Mari berdoa di Kapel Kasih, belajar mengasihi keluarga, dan menjaga kerukunan bersama teman.',
    mentorName: 'Suster Clara',
    mentorRole: 'Pendamping Iman Katolik',
    practiceStations: [
      { id: 'kat-doa', title: 'Altar Doa Harian', lesson: 'Awali hari dengan tanda salib dan doa singkat memohon bimbingan Tuhan Yesus.', x: -7.5, z: 2.0 },
      { id: 'kat-keluarga', title: 'Taman Keluarga Kudus', lesson: 'Menghormati ayah, ibu, dan menyayangi adik menciptakan damai di rumah.', x: -16.5, z: -10.0 },
      { id: 'kat-ampun', title: 'Air Mancur Pengampunan', lesson: 'Jika berbuat salah kepada teman, kita berani meminta maaf dan saling memaafkan.', x: 20.0, z: -2.0 },
    ],
    triviaQ: {
      prompt: 'Ketika teman tidak sengaja menjatuhkan pensil kita dan meminta maaf, sikap kita adalah...',
      options: ['Memaafkan dengan senyum ramah', 'Marah sepanjang hari', 'Membalas menjatuhkan bukunya'],
      correctIndex: 0,
      explanation: 'Yesus mengajarkan kita untuk saling mengampuni dan hidup dalam damai kasih.',
    },
  },
  hindu: {
    id: 'hindu',
    sanctuaryName: 'Taman Pura Agung Sari',
    skyHex: 0xfde68a,
    fogHex: 0xfef3c7,
    grassRgb: [0.26, 0.62, 0.28],
    accentHex: '#D97706',
    wallHex: 0xfef3c7,
    roofHex: 0x92400e,
    greeting: 'Om Swastyastu! Selamat datang di Taman Pura Agung yang damai.',
    introStory: 'Pelajari ajaran Tri Hita Karana di Pura Agung: harmonis dengan Sang Hyang Widhi, sesama manusia, dan alam.',
    mentorName: 'Pak Made',
    mentorRole: 'Pembimbing Budi Pekerti Hindu',
    practiceStations: [
      { id: 'hnd-trisandya', title: 'Candi Bentar Puja', lesson: 'Menghaturkan doa Trisandya dan Tri Kaya Parisudha: berpikir, berkata, dan berbuat baik.', x: -7.5, z: 2.0 },
      { id: 'hnd-alam', title: 'Taman Tri Hita Karana', lesson: 'Menyayangi hewan dan tumbuhan menjaga keharmonisan alam ciptaan Ida Sang Hyang Widhi.', x: -16.5, z: -10.0 },
      { id: 'hnd-sesama', title: 'Balai Saling Asah Asih', lesson: 'Berbicara jujur (satya) dan santun kepada orang tua serta guru adalah dharmamu.', x: 20.0, z: -2.0 },
    ],
    triviaQ: {
      prompt: 'Ajaran berpikir baik, berkata baik, dan berbuat baik dalam agama Hindu disebut...',
      options: ['Tri Kaya Parisudha', 'Catur Warna', 'Pancawara'],
      correctIndex: 0,
      explanation: 'Tri Kaya Parisudha terdiri dari Manacika (pikiran suci), Wacika (perkataan benar), Kayika (perbuatan baik).',
    },
  },
  buddha: {
    id: 'buddha',
    sanctuaryName: 'Taman Vihara Teratai',
    skyHex: 0xfef08a,
    fogHex: 0xfef9c3,
    grassRgb: [0.25, 0.6, 0.3],
    accentHex: '#CA8A04',
    wallHex: 0xfffbeb,
    roofHex: 0xb45309,
    greeting: 'Namo Buddhaya! Selamat datang di Taman Vihara Teratai penuh cinta kasih.',
    introStory: 'Di Vihara Teratai kita mempraktikkan Metta (cinta kasih kepada semua makhluk), kejujuran, dan ketenangan batin.',
    mentorName: 'Kak Ananda',
    mentorRole: 'Pembina Anak Vihara',
    practiceStations: [
      { id: 'bud-teratai', title: 'Kolam Bunga Teratai', lesson: 'Bunga teratai mekar suci dan tenang, melambangkan hati yang sabar dan penuh kasih (Metta).', x: -7.5, z: 2.0 },
      { id: 'bud-dana', title: 'Paviliun Berdana', lesson: 'Saling berbagi dan menolong teman yang kesusahan menumbuhkan kebahagiaan bersama.', x: -16.5, z: -10.0 },
      { id: 'bud-santun', title: 'Patung Lonceng Damai', lesson: 'Menjaga ucapan yang jujur, lembut, dan tidak menyakiti makhluk hidup.', x: 20.0, z: -2.0 },
    ],
    triviaQ: {
      prompt: 'Sikap cinta kasih tanpa membeda-bedakan kepada semua makhluk dalam ajaran Buddha disebut...',
      options: ['Metta (Cinta Kasih)', 'Marah', 'Iri hati'],
      correctIndex: 0,
      explanation: 'Metta adalah cinta kasih universal yang membuat hidup tenang dan penuh persahabatan.',
    },
  },
  khonghucu: {
    id: 'khonghucu',
    sanctuaryName: 'Taman Klenteng Harmoni',
    skyHex: 0xfecaca,
    fogHex: 0xfee2e2,
    grassRgb: [0.24, 0.58, 0.28],
    accentHex: '#DC2626',
    wallHex: 0xdc2626,
    roofHex: 0xf59e0b,
    greeting: 'Wei De Dong Tian! Selamat datang di Taman Klenteng Harmoni.',
    introStory: 'Temukan lentera kebajikan di Klenteng Harmoni dan pelajari bakti kepada orang tua (Xiao) serta kesusilaan (Li).',
    mentorName: 'Guru Mei Ling',
    mentorRole: 'Pembimbing Kebajikan Khonghucu',
    practiceStations: [
      { id: 'khg-xiao', title: 'Gerbang Bakti (Xiao)', lesson: 'Berbakti, patuh, dan menjaga nama baik orang tua merupakan akar segala kebajikan.', x: -7.5, z: 2.0 },
      { id: 'khg-ren', title: 'Lentera Cinta Kasih (Ren)', lesson: 'Menyayangi teman dan tidak melakukan kepada orang lain hal yang tidak kita sukai.', x: -16.5, z: -10.0 },
      { id: 'khg-xin', title: 'Paviliun Jujur (Xin)', lesson: 'Menepati janji dan berkata apa adanya membuat kita dipercaya semua orang.', x: 20.0, z: -2.0 },
    ],
    triviaQ: {
      prompt: 'Sikap berbakti dan hormat dengan tulus kepada ayah dan ibu dalam ajaran Khonghucu disebut...',
      options: ['Xiao (Laku Bakti)', 'Lupa diri', 'Egois'],
      correctIndex: 0,
      explanation: 'Xiao (berbakti kepada orang tua) adalah nilai utama kebajikan junzi.',
    },
  },
};

export interface LocalRegionWorldMeta {
  id: LocalRegionId;
  regionName: string;
  houseName: string;
  greeting: string;
  vocabPairs: Array<{ local: string; indo: string; meaning: string }>;
  foodName: string;
  foodDesc: string;
  instrumentName: string;
  skyHex: number;
  grassRgb: [number, number, number];
  wallHex: number;
  roofHex: number;
  accentHex: string;
}

export const LOCAL_REGION_WORLD_META: Record<LocalRegionId, LocalRegionWorldMeta> = {
  jawa: {
    id: 'jawa',
    regionName: 'Jawa Tengah & Yogyakarta',
    houseName: 'Rumah Joglo',
    greeting: 'Sugeng enjang, kanca-kanca!',
    vocabPairs: [
      { local: 'Sugeng enjang', indo: 'Selamat pagi', meaning: 'Salam ramah di pagi hari' },
      { local: 'Matur nuwun', indo: 'Terima kasih', meaning: 'Ungkapan rasa syukur' },
      { local: 'Nyuwun pangapunten', indo: 'Mohon maaf', meaning: 'Sikap santun saat bersalah' },
    ],
    foodName: 'Klepon & Gudeg Hangat',
    foodDesc: 'Klepon ketan hijau berisi gula jawa manis ditabur kelapa parut gurih.',
    instrumentName: 'Gamelan Saron',
    skyHex: 0xfef3c7,
    grassRgb: [0.28, 0.6, 0.24],
    wallHex: 0xfef3c7,
    roofHex: 0x78350f,
    accentHex: '#B45309',
  },
  sunda: {
    id: 'sunda',
    regionName: 'Tatar Sunda (Jawa Barat)',
    houseName: 'Imah Jolopong',
    greeting: 'Wilujeng enjing, sadayana!',
    vocabPairs: [
      { local: 'Wilujeng enjing', indo: 'Selamat pagi', meaning: 'Sapaan ramah khas Sunda' },
      { local: 'Hatur nuhun', indo: 'Terima kasih', meaning: 'Ucapan terima kasih tulus' },
      { local: 'Punten', indo: 'Permisi', meaning: 'Sapaan sopan saat melintas' },
    ],
    foodName: 'Surabi Oncom & Bandrek',
    foodDesc: 'Kue serabi lembut dimasak di tungku tanah liat dengan rasa manis gurih.',
    instrumentName: 'Angklung Bambu',
    skyHex: 0xd1fae5,
    grassRgb: [0.2, 0.64, 0.28],
    wallHex: 0xfafaf9,
    roofHex: 0x3f6212,
    accentHex: '#15803D',
  },
  bali: {
    id: 'bali',
    regionName: 'Pulau Dewata Bali',
    houseName: 'Bale Banjar Bali',
    greeting: 'Om Swastyastu, semeton!',
    vocabPairs: [
      { local: 'Om Swastyastu', indo: 'Semoga damai sejahtera', meaning: 'Salam pembuka ramah Bali' },
      { local: 'Suksma', indo: 'Terima kasih', meaning: 'Ungkapan terima kasih' },
      { local: 'Rahajeng semeng', indo: 'Selamat pagi', meaning: 'Sapaan pagi hari' },
    ],
    foodName: 'Jaje Laklak & Sate Lilit',
    foodDesc: 'Kue tradisional hijau pandan disiram gula merah cair dan parutan kelapa.',
    instrumentName: 'Gamelan Rindik Bambu',
    skyHex: 0xfde68a,
    grassRgb: [0.24, 0.62, 0.26],
    wallHex: 0xffedd5,
    roofHex: 0x9a3412,
    accentHex: '#D97706',
  },
  minang: {
    id: 'minang',
    regionName: 'Ranah Minang (Sumatera Barat)',
    houseName: 'Rumah Gadang Gonjong',
    greeting: 'Salamaik pagi, kawan!',
    vocabPairs: [
      { local: 'Salamaik pagi', indo: 'Selamat pagi', meaning: 'Sapaan ceria di Ranah Minang' },
      { local: 'Tarimo kasih', indo: 'Terima kasih', meaning: 'Rasa terima kasih tulus' },
      { local: 'Baa kaba?', indo: 'Apa kabar?', meaning: 'Menanyakan kabar teman' },
    ],
    foodName: 'Lamang Tapai & Dadiah',
    foodDesc: 'Ketan pulut panggang di dalam bambu yang harum disantap bersama tapai manis.',
    instrumentName: 'Talempong Minang',
    skyHex: 0xfee2e2,
    grassRgb: [0.25, 0.58, 0.26],
    wallHex: 0x78350f,
    roofHex: 0xb91c1c,
    accentHex: '#DC2626',
  },
  toraja: {
    id: 'toraja',
    regionName: 'Tana Toraja (Sulawesi Selatan)',
    houseName: 'Rumah Adat Tongkonan',
    greeting: 'Kurre sumanga, sangmane!',
    vocabPairs: [
      { local: 'Kurre sumanga', indo: 'Terima kasih banyak', meaning: 'Salam syukur & terima kasih Toraja' },
      { local: 'Melambi', indo: 'Selamat pagi', meaning: 'Sapaan pagi hari' },
      { local: 'Sipakatau', indo: 'Saling memanusiakan', meaning: 'Nilai saling menghargai' },
    ],
    foodName: 'Pa’piong & Deppa Tori',
    foodDesc: 'Kue wijen gula aren renyah khas Toraja yang manis dan gurih.',
    instrumentName: 'Suling Lembang',
    skyHex: 0xe0f2fe,
    grassRgb: [0.22, 0.55, 0.26],
    wallHex: 0x451a03,
    roofHex: 0x9a3412,
    accentHex: '#9A3412',
  },
  papua: {
    id: 'papua',
    regionName: 'Tanah Papua',
    houseName: 'Rumah Bundar Honai',
    greeting: 'Amole! Selamat pagi!',
    vocabPairs: [
      { local: 'Amole / Nare', indo: 'Salam kasih sayang', meaning: 'Sapaan persahabatan Papua' },
      { local: 'Apuse', indo: 'Kakek-nenek (Lagu rakyat)', meaning: 'Lagu daerah Papua yang mendunia' },
      { local: 'Wa wa wa', indo: 'Terima kasih', meaning: 'Ungkapan terima kasih ramah' },
    ],
    foodName: 'Papeda Sagu & Kue Lontar',
    foodDesc: 'Bubur sari sagu alami yang sehat dan lezat disantap hangat.',
    instrumentName: 'Tifa Papua',
    skyHex: 0xccfbf1,
    grassRgb: [0.18, 0.6, 0.32],
    wallHex: 0xfde68a,
    roofHex: 0xb45309,
    accentHex: '#0F766E',
  },
};

export interface Grade1SubjectFlowMeta {
  subjectId: SubjectId;
  worldName: string;
  introStory: string;
  discoveryGoalText: string;
  labTitle: string;
  labKind: Grade1LabKind;
  accentHex: string;
}

export function getGrade1SubjectFlowMeta(
  subjectId: SubjectId,
  religion: ReligionId,
  localRegion: LocalRegionId
): Grade1SubjectFlowMeta {
  const rel = RELIGION_SANCTUARY_META[religion];
  const reg = LOCAL_REGION_WORLD_META[localRegion];
  switch (subjectId) {
    case 'agama':
      return {
        subjectId,
        worldName: `Dunia Kerohanian · ${rel.sanctuaryName}`,
        introStory: rel.introStory,
        discoveryGoalText: `Kunjungi ${rel.sanctuaryName} & pelajari 3 pos akhlak mulia!`,
        labTitle: 'Praktik Ibadah & Budi Pekerti',
        labKind: 'agama-practice',
        accentHex: rel.accentHex,
      };
    case 'pancasila':
      return {
        subjectId,
        worldName: 'Kota Kebersamaan',
        introStory: 'Kota Kebersamaan bersih dan damai! Bantu warga memilah sampah organik/anorganik dan kenali 5 simbol Garuda Pancasila.',
        discoveryGoalText: 'Pungut sampah & pilah ke tong yang benar, lalu periksa Monumen 5 Sila!',
        labTitle: 'Lab Pilah Sampah & 5 Sila Garuda',
        labKind: 'pancasila-sort',
        accentHex: '#DC2626',
      };
    case 'bahasa-indonesia':
      return {
        subjectId,
        worldName: 'Desa Huruf dan Cerita',
        introStory: 'Temukan huruf tersembunyi di Rumah Huruf dan Perpustakaan, lalu rangkai menjadi suku kata dan kata utuh!',
        discoveryGoalText: 'Ambil balok kata, susun di Meja Rumah Huruf, atau buka Papan Rangkai Kata!',
        labTitle: 'Papan Rangkai Suku Kata & Bacaan',
        labKind: 'word-builder',
        accentHex: '#0284C7',
      };
    case 'matematika':
      return {
        subjectId,
        worldName: 'Kerajaan Balok Angka',
        introStory: 'Petik buah apel & jeruk langsung dari pohon, pilah buah bagus dan busuk, hitung tas panenmu, dan putar Jaring-Jaring Kubus 3D!',
        discoveryGoalText: 'Petik buah di kebun, pilah ke keranjang, atau jelajahi Kubus 3D interaktif!',
        labTitle: 'Kebun Hitung & Kubus Jaring 3D',
        labKind: 'math-orchard-cube',
        accentHex: '#059669',
      };
    case 'ipas':
      return {
        subjectId,
        worldName: 'Hutan dan Alam',
        introStory: 'Tanam benih dan siram hingga mekar, beri makan kelinci jinak, dan waspada! Jika hewan liar mengejar, larilah ke Lingkaran Zona Aman!',
        discoveryGoalText: 'Tanam & siram kebun, amati panca indera, serta gunakan Zona Aman!',
        labTitle: 'Buku Pengamatan Alam & Pancaindra',
        labKind: 'ipas-nature-lab',
        accentHex: '#16A34A',
      };
    case 'pjok':
      return {
        subjectId,
        worldName: 'Pulau Gerak Sehat',
        introStory: 'Lompati rintangan lintasan lari, jaga keseimbangan di balok titian, cuci tangan di wastafel bersih, dan pilih makanan bergizi!',
        discoveryGoalText: 'Lompati gawang lari, lewati titian seimbang, dan cuci tangan bersih!',
        labTitle: 'Panduan Gerak Sehat & Kebersihan',
        labKind: 'pjok-health-lab',
        accentHex: '#EA580C',
      };
    case 'seni-budaya':
      return {
        subjectId,
        worldName: 'Negeri Kreativitas',
        introStory: 'Campur warna primer di Air Mancur Warna, mainkan nada gambang musik di gazebo, dan lukis karyamu untuk dipajang di Galeri 3D!',
        discoveryGoalText: 'Tekan nada alat musik 3D, campur warna, & buat lukisanmu sendiri!',
        labTitle: 'Studio Gambar Kanvas & Alat Musik',
        labKind: 'seni-studio-music',
        accentHex: '#9333EA',
      };
    case 'bahasa-inggris':
      return {
        subjectId,
        worldName: 'English Adventure City',
        introStory: 'Explore English Adventure City! Touch colorful 3D city objects to hear spoken English words and match their Indonesian meanings.',
        discoveryGoalText: 'Sentuh objek kota 3D untuk mendengarkan pengucapan Bahasa Inggris!',
        labTitle: 'Kartu Suara Bahasa Inggris',
        labKind: 'english-voice-cards',
        accentHex: '#4F46E5',
      };
    case 'muatan-lokal':
      return {
        subjectId,
        worldName: `Kampung Budaya · ${reg.regionName}`,
        introStory: `Selamat datang di Kampung Budaya! Lihat ${reg.houseName} khas ${reg.regionName}, cicipi ${reg.foodName}, dan mainkan ${reg.instrumentName}.`,
        discoveryGoalText: `Kunjungi ${reg.houseName}, Warung Kuliner & Panggung ${reg.instrumentName}!`,
        labTitle: 'Kamera Budaya & Bahasa Daerah',
        labKind: 'mulok-culture-cards',
        accentHex: reg.accentHex,
      };
  }
}

export interface Grade1ChapterActivityMeta {
  activityMode: string;
  activityTitle: string;
  labKind: Grade1LabKind;
  recommendedRegionId: Grade1RegionId;
}

export function getGrade1ChapterActivityMeta(
  chapter: SubjectChapter,
  religion: ReligionId = 'islam',
  localRegion: LocalRegionId = 'jawa'
): Grade1ChapterActivityMeta {
  const base = getGrade1SubjectFlowMeta(chapter.subjectId, religion, localRegion);
  const id = chapter.id;
  const num = chapter.chapterNumber;

  if (chapter.subjectId === 'bahasa-indonesia') {
    if (num <= 2) {
      return {
        activityMode: 'alphabet-syllable',
        activityTitle: num === 1 ? 'Papan Huruf A–Z & Vokal' : 'Rangkai Bunyi & Suku Kata',
        labKind: 'word-builder',
        recommendedRegionId: 'desa-ceria',
      };
    }
    if (num === 3 || num === 5 || num === 6) {
      return {
        activityMode: 'word-writing',
        activityTitle:
          num === 5
            ? 'Lab Kata & Nama Benda Sekitar'
            : num === 6
            ? 'Bengkel Menulis Huruf & Kata'
            : 'Rangkai Kata Sederhana',
        labKind: 'word-builder',
        recommendedRegionId: 'kota-sekolah',
      };
    }
    return {
      activityMode: 'sentence-story',
      activityTitle:
        num === 4
          ? 'Susun Kalimat Pendek'
          : num === 7
          ? 'Panggung Cerita & Menyimak'
          : 'Penulis Kalimat Lengkap',
      labKind: 'sentence-builder',
      recommendedRegionId: 'kota-sekolah',
    };
  }

  if (chapter.subjectId === 'matematika') {
    if (num <= 3) {
      return {
        activityMode: num === 3 ? 'count-20' : 'count-10',
        activityTitle:
          num === 1
            ? 'Taman Bilangan 1–10'
            : num === 2
            ? 'Hitung Buah & Koin Benda'
            : 'Tangga Angka sampai 20',
        labKind: 'math-orchard-cube',
        recommendedRegionId: 'desa-ceria',
      };
    }
    if (num === 4 || num === 5) {
      return {
        activityMode: num === 4 ? 'addition-orchard' : 'subtraction-orchard',
        activityTitle:
          num === 4
            ? 'Kebun Penjumlahan Buah'
            : 'Kurangi & Hitung Sisa Buah',
        labKind: 'math-orchard-cube',
        recommendedRegionId: 'kebun-pengetahuan',
      };
    }
    if (num === 6) {
      return {
        activityMode: 'geometry-cube',
        activityTitle: 'Lab Bangun Geometri & Jaring Kubus 3D',
        labKind: 'math-orchard-cube',
        recommendedRegionId: 'laboratorium-ilmuwan',
      };
    }
    if (num === 7) {
      return {
        activityMode: 'measure-length-weight',
        activityTitle: 'Lab Ukuran Panjang & Berat Benda',
        labKind: 'math-orchard-cube',
        recommendedRegionId: 'pasar-sahabat',
      };
    }
    return {
      activityMode: 'time-and-money',
      activityTitle: 'Toko Uang Rupiah & Jam Dinding',
      labKind: 'market-money-shop',
      recommendedRegionId: 'pasar-sahabat',
    };
  }

  if (chapter.subjectId === 'ipas') {
    if (num === 1) {
      return {
        activityMode: 'senses-body',
        activityTitle: 'Lab Tubuh, Pancaindra & Cuci Tangan',
        labKind: 'ipas-nature-lab',
        recommendedRegionId: 'kebun-pengetahuan',
      };
    }
    if (num === 2 || num === 3) {
      return {
        activityMode: num === 2 ? 'plant-growth' : 'animals-weather',
        activityTitle:
          num === 2
            ? 'Kebun Tumbuh & Perawatan Biji'
            : 'Satwa Sahabat, Cuaca & Zona Aman',
        labKind: 'ipas-nature-lab',
        recommendedRegionId: num === 2 ? 'kebun-pengetahuan' : 'hutan-misteri',
      };
    }
    if (num === 4 || num === 5) {
      return {
        activityMode: num === 4 ? 'matter-states' : 'light-energy',
        activityTitle:
          num === 4
            ? 'Meja Benda Padat & Cair'
            : 'Lab Cahaya, Bayangan & Hemat Listrik',
        labKind: 'ipas-nature-lab',
        recommendedRegionId: 'laboratorium-ilmuwan',
      };
    }
    return {
      activityMode: 'ecosystem-clean',
      activityTitle: 'Penjaga Hutan, Pantai & Lingkungan Bersih',
      labKind: 'ipas-nature-lab',
      recommendedRegionId: 'pantai-dan-laut',
    };
  }

  if (chapter.subjectId === 'pancasila') {
    return {
      activityMode: num === 6 ? 'garuda-symbols' : num >= 3 ? 'rules-harmony' : 'identity-family',
      activityTitle:
        num === 1
          ? 'Kartu Diri & Sopan Santun'
          : num === 2
          ? 'Pohon Keluarga Rukun'
          : num === 3
          ? 'Aturan Rapi di Rumah'
          : num === 4
          ? 'Aturan Tertib di Sekolah'
          : num === 5
          ? 'Pilah Sampah & Hidup Rukun'
          : '5 Simbol Garuda Pancasila',
      labKind: 'pancasila-sort',
      recommendedRegionId: num === 6 ? 'kerajaan-ilmu' : 'kota-sekolah',
    };
  }

  if (chapter.subjectId === 'agama') {
    const rel = RELIGION_SANCTUARY_META[religion];
    return {
      activityMode: `agama-${religion}-b${num}`,
      activityTitle: `${rel.sanctuaryName} · Praktik Bab ${num}`,
      labKind: 'agama-practice',
      recommendedRegionId: 'kota-sekolah',
    };
  }

  if (chapter.subjectId === 'pjok') {
    if (num === 1 || num === 3) {
      return {
        activityMode: num === 1 ? 'locomotor' : 'non-locomotor',
        activityTitle:
          num === 1
            ? 'Lintasan Lari & Lompat Lokomotor'
            : 'Senam Gerak di Tempat & Bola',
        labKind: 'pjok-motion-coach',
        recommendedRegionId: 'desa-ceria',
      };
    }
    return {
      activityMode: 'hygiene-nutrition',
      activityTitle:
        num === 2
          ? 'Titian Seimbang & Kebersihan Diri'
          : num === 4
          ? 'Senam Irama & Aman di Air'
          : 'Gizi Seimbang, Sikat Gigi & Istirahat',
      labKind: 'pjok-health-lab',
      recommendedRegionId: num === 4 ? 'pantai-dan-laut' : 'desa-ceria',
    };
  }

  if (chapter.subjectId === 'seni-budaya') {
    if (num === 1 || num === 4) {
      return {
        activityMode: num === 1 ? 'color-shape' : 'craft-collage',
        activityTitle:
          num === 1
            ? 'Studio Warna Primer & Bentuk'
            : 'Kriya Kolase, Lipat & Stempel',
        labKind: num === 1 ? 'shape-color-sort' : 'seni-studio-music',
        recommendedRegionId: 'pantai-dan-laut',
      };
    }
    return {
      activityMode: 'music-dance',
      activityTitle:
        num === 2
          ? 'Paduan Lagu & Tari Ceria'
          : num === 3
          ? 'Bunyi Alam & Musik Ritmis'
          : 'Panggung Apresiasi Karya',
      labKind: 'seni-studio-music',
      recommendedRegionId: num === 5 ? 'kerajaan-ilmu' : 'desa-ceria',
    };
  }

  if (chapter.subjectId === 'bahasa-inggris') {
    return {
      activityMode: `eng-b${num}`,
      activityTitle:
        num === 1
          ? 'Greetings & Numbers 1–10'
          : num === 2
          ? 'Colors & Classroom Objects'
          : num === 3
          ? 'My Family & Animals'
          : 'Fresh Fruits & Action Words',
      labKind: 'english-voice-cards',
      recommendedRegionId: 'kota-sekolah',
    };
  }

  // Muatan Lokal
  const reg = LOCAL_REGION_WORLD_META[localRegion];
  return {
    activityMode: id,
    activityTitle: `${reg.regionName} · ${chapter.title.replace(/^Bab \d+:\s*/, '')}`,
    labKind: 'mulok-culture-cards',
    recommendedRegionId: num === 2 ? 'pasar-sahabat' : 'pantai-dan-laut',
  };
}

function makeG1Collectibles(prefix: string): CollectibleSpawn[] {
  return [
    { id: `${prefix}-c1`, kind: 'coin', x: -8.5, z: 3.5, valueCoins: 10, valueScore: 50 },
    { id: `${prefix}-c2`, kind: 'coin', x: -4.0, z: 1.0, valueCoins: 10, valueScore: 50 },
    { id: `${prefix}-c3`, kind: 'coin', x: 8.5, z: 1.5, valueCoins: 15, valueScore: 75 },
    { id: `${prefix}-c4`, kind: 'coin', x: 18.0, z: 4.5, valueCoins: 10, valueScore: 50 },
    { id: `${prefix}-c5`, kind: 'coin', x: 23.5, z: -6.5, valueCoins: 10, valueScore: 50 },
    { id: `${prefix}-c6`, kind: 'coin', x: -13.0, z: -11.0, valueCoins: 10, valueScore: 50 },
    { id: `${prefix}-c7`, kind: 'coin', x: -21.0, z: -15.0, valueCoins: 10, valueScore: 50 },
    { id: `${prefix}-c8`, kind: 'coin', x: -24.0, z: 8.5, valueCoins: 10, valueScore: 50 },
    { id: `${prefix}-g1`, kind: 'crystal', x: -25.0, z: -19.0, valueCoins: 20, valueScore: 100 },
    { id: `${prefix}-g2`, kind: 'crystal', x: 28.0, z: 14.0, valueCoins: 20, valueScore: 100 },
    { id: `${prefix}-s1`, kind: 'scroll', x: -12.0, z: -22.5, valueCoins: 25, valueScore: 150 },
    { id: `${prefix}-s2`, kind: 'scroll', x: 28.5, z: -22.0, valueCoins: 25, valueScore: 150 },
    { id: `${prefix}-s3`, kind: 'scroll', x: 24.0, z: 10.5, valueCoins: 25, valueScore: 150 },
  ];
}

export function getGrade1WorldTheme(
  subjectId: SubjectId,
  religion: ReligionId = 'islam',
  localRegion: LocalRegionId = 'jawa'
): WorldTheme3D {
  const rel = RELIGION_SANCTUARY_META[religion];
  const reg = LOCAL_REGION_WORLD_META[localRegion];

  const base = {
    grade: 1 as const,
    fogDensity: 0.0078,
    sunIntensity: 1.95,
    heroRoleName: 'Siswa Cerdas Kelas 1 SD',
    heroRoleDesc: 'Karakter anak SD Kelas 1 yang berpakaian dan membawa perlengkapan sesuai dunia pelajarannya.',
    landmarkPos: { x: -5.5, z: 10.5, rotY: 0.3 },
  };

  switch (subjectId) {
    case 'agama': {
      const religionRoleStyle = (`agama-${religion}`) as NpcRoleStyle;
      const npcs: NpcDefinition[] = [
        {
          id: `g1-ag-${religion}-1`,
          name: rel.mentorName,
          role: rel.mentorRole,
          roleStyle: religionRoleStyle,
          x: -10.5,
          z: 6.2,
          facingY: 0.35,
          greeting: rel.greeting,
          story: rel.introStory,
          trivia: {
            question: rel.triviaQ.prompt,
            options: rel.triviaQ.options,
            correctIndex: rel.triviaQ.correctIndex,
            rewardCoins: 20,
            rewardScore: 120,
            explanation: rel.triviaQ.explanation,
            hints: [
              `Ingat pesan utama ${rel.mentorName} di ${rel.sanctuaryName}.`,
              'Pilih tindakan baik dan doa yang penuh rasa syukur serta kasih sayang.',
            ],
          },
          colors: { skin: 0xe6b48a, hair: 0x1e293b, shirt: rel.wallHex, vest: rel.roofHex, pants: 0x334155, scarf: 0xf59e0b },
        },
        {
          id: `g1-ag-${religion}-2`,
          name: 'Kak Damai',
          role: 'Sahabat Budi Pekerti',
          roleStyle: 'student-friend',
          x: 19.2,
          z: -1.8,
          facingY: -1.4,
          greeting: 'Di seberang jembatan ini ada pondok bakti & kasih sayang kepada keluarga.',
          story: 'Selalu ucapkan tolong, maaf, dan terima kasih dengan senyum tulus setiap hari!',
          trivia: {
            question: 'Ketika ibu sedang sibuk merapikan rumah, sikap anak yang berbudi pekerti adalah...',
            options: ['Ikut membantu semampunya dengan senang hati', 'Berteriak meminta jajan', 'Menambah berantakan'],
            correctIndex: 0,
            rewardCoins: 20,
            rewardScore: 120,
            explanation: 'Membantu orang tua di rumah mencerminkan kasih sayang dan bakti seorang anak.',
            hints: [
              'Pikirkan sikap anak yang sayang kepada ayah dan ibu.',
              'Sikap terpuji adalah membantu pekerjaan ringan di rumah dengan ikhlas.',
            ],
          },
          colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xffffff, vest: rel.roofHex, pants: 0x1e293b, scarf: 0xfbbf24 },
        },
      ];
      return {
        ...base,
        worldName: `Dunia Kerohanian · ${rel.sanctuaryName}`,
        tagline: `Agama (${religion.toUpperCase()}) · ${rel.sanctuaryName}`,
        description: rel.introStory,
        badgeColor: rel.accentHex,
        skyHex: rel.skyHex,
        fogHex: rel.fogHex,
        waterHex: 0x0ea5e9,
        grassBaseRgb: rel.grassRgb,
        hillHex: rel.roofHex,
        peakHex: 0x64748b,
        roadHex: 0xfef3c7,
        houseWallHex: rel.wallHex,
        hemiSkyHex: rel.skyHex,
        hemiGroundHex: 0x4d7c0f,
        sunColorHex: 0xfffbeb,
        ambientMoteHex: 0xfde047,
        architectureTitle: rel.sanctuaryName,
        creatureNames: 'Merpati Damai & Kupu-Kupu Putih',
        worldIntroStory: rel.introStory,
        landmarkLabel: rel.sanctuaryName,
        npcs,
        collectibles: makeG1Collectibles(`g1-ag-${religion}`),
      };
    }

    case 'pancasila':
      return {
        ...base,
        worldName: 'Kota Kebersamaan',
        tagline: 'Pendidikan Pancasila · Kota Gotong Royong',
        description: 'Kota ceria berhias Monumen Garuda 5 Sila, taman pilah sampah organik/anorganik, dan warga yang saling membantu.',
        badgeColor: '#DC2626',
        skyHex: 0xbae6fd,
        fogHex: 0xe0f2fe,
        waterHex: 0x0284c7,
        grassBaseRgb: [0.24, 0.64, 0.28],
        hillHex: 0x16a34a,
        peakHex: 0x475569,
        roadHex: 0xe2e8f0,
        houseWallHex: 0xffffff,
        hemiSkyHex: 0xe0f2fe,
        hemiGroundHex: 0x65a30d,
        sunColorHex: 0xfffbeb,
        ambientMoteHex: 0xfca5a5,
        architectureTitle: 'Balai Warga & Monumen Garuda 5 Sila',
        creatureNames: 'Burung Garuda Emas & Kucing Kota',
        worldIntroStory: 'Selamat datang di Kota Kebersamaan! Bantu warga memungut dan memilah sampah serta temukan kelima lambang sila Pancasila!',
        landmarkLabel: 'Monumen Garuda Pancasila',
        npcs: [
          {
            id: 'g1-pnc-rt',
            name: 'Pak RT Slamet',
            role: 'Pemimpin Warga Kota',
            roleStyle: 'pancasila-guide',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: 'Ayo kerja bakti bersama! Pungut sampah di halaman lalu buang sesuai jenisnya: Organik (hijau) atau Anorganik (kuning).',
            story: 'Lingkungan bersih membuat semua warga hidup sehat dan rukun sesuai sila ke-3 Persatuan Indonesia!',
            trivia: {
              question: 'Lambang sila pertama Pancasila "Ketuhanan Yang Maha Esa" adalah...',
              options: ['Bintang Emas', 'Pohon Beringin', 'Rantai Baja'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Sila ke-1 berlambang Bintang Emas di tengah perisai Garuda.',
              hints: [
                'Simbol ini terletak di tengah perisai Burung Garuda dan bersinar terang.',
                'Lambang Sila ke-1 berbentuk Bintang Emas.',
              ],
            },
            colors: { skin: 0xd9a074, hair: 0x1e293b, shirt: 0xffffff, vest: 0xdc2626, pants: 0x1e293b, scarf: 0xfbbf24 },
          },
          {
            id: 'g1-pnc-siti',
            name: 'Ibu Siti',
            role: 'Pemandu Aturan & Sopan Santun',
            roleStyle: 'teacher',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: 'Terima kasih sudah menyeberang jembatan dengan tertib! Jangan lupa ucapkan tolong dan terima kasih ya.',
            story: 'Berbagi bekal dan bermain adil dengan semua teman mencerminkan nilai Pancasila.',
            trivia: {
              question: 'Contoh aturan tertib di rumah setelah pulang sekolah adalah...',
              options: ['Meletakkan sepatu di rak sepatu dengan rapi', 'Melempar tas ke lantai dapur', 'Langsung tidur tanpa cuci kaki'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Menaruh sepatu dan tas pada tempatnya melatih disiplin dan menjaga kerapian rumah.',
              hints: [
                'Pilih tindakan yang membuat rumah tetap rapi dan bersih.',
                'Sepatu sebaiknya ditaruh kembali di raknya.',
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xfef2f2, vest: 0xb91c1c, pants: 0x334155, scarf: 0xffffff },
          },
        ],
        collectibles: makeG1Collectibles('g1-pnc'),
      };

    case 'matematika':
      return {
        ...base,
        worldName: 'Kerajaan Balok Angka',
        tagline: 'Matematika · Kebun Buah & Jembatan Kubus',
        description: 'Kerajaan warna-warni penuh kebun buah interaktif yang bisa dipetik, keranjang sortir, batu lompat angka, dan menara kubus 3D!',
        badgeColor: '#059669',
        skyHex: 0xa7f3d0,
        fogHex: 0xd1fae5,
        waterHex: 0x0ea5e9,
        grassBaseRgb: [0.22, 0.68, 0.3],
        hillHex: 0x059669,
        peakHex: 0x64748b,
        roadHex: 0xfde68a,
        houseWallHex: 0xecfdf5,
        hemiSkyHex: 0xd1fae5,
        hemiGroundHex: 0x3f6212,
        sunColorHex: 0xfffbeb,
        ambientMoteHex: 0x34d399,
        architectureTitle: 'Menara Kubus, Kebun Buah & Batu Angka',
        creatureNames: 'Kelinci Kebun & Lebah Madu',
        worldIntroStory: 'Selamat datang di Kerajaan Balok Angka! Petik buah apel & jeruk dari pohon, pilah yang busuk, lalu putar Kubus 3D interaktif!',
        landmarkLabel: 'Menara Kubus & Kebun Buah',
        npcs: [
          {
            id: 'g1-mat-bu-tari',
            name: 'Bu Tari',
            role: 'Penjaga Kebun Buah Hitung',
            roleStyle: 'farmer',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: 'Lihat pohon buah di sekitar taman! Dekati buah apel & jeruk untuk memetik ke tas belanjamu, lalu pilah buah segar dan buah busuk.',
            story: 'Kamu juga bisa membuka Lab Kubus 3D untuk melihat jaring-jaring kubus melipat menjadi bangun ruang nyata!',
            trivia: {
              question: 'Jika kamu memetik 6 apel lalu makan 2 apel yang manis, sisa apel di tasmu adalah...',
              options: ['4 apel', '8 apel', '3 apel'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: '6 - 2 = 4 apel tersisa.',
              hints: [
                'Dimakan artinya jumlah buahnya berkurang (6 dikurangi 2).',
                'Hitung mundur 2 langkah dari 6: 5, lalu 4.',
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xffffff, vest: 0x059669, pants: 0x1e293b, scarf: 0xf59e0b },
          },
          {
            id: 'g1-mat-pak-kubus',
            name: 'Kak Kubi',
            role: 'Arsitek Bangun Ruang',
            roleStyle: 'scientist',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: 'Tahukah kamu berapa sisi yang dimiliki dadu atau kubus? Ada 6 sisi persegi yang sama luas!',
            story: 'Amati Menara Kubus dan coba lipat jaring-jaring kubus pada papan interaktif.',
            trivia: {
              question: 'Banyaknya sisi datar berbentuk persegi pada sebuah bangun ruang kubus adalah...',
              options: ['4 sisi', '6 sisi', '8 sisi'],
              correctIndex: 1,
              rewardCoins: 25,
              rewardScore: 140,
              explanation: 'Kubus tersusun dari 6 sisi persegi (bawah, atas, depan, belakang, kiri, kanan).',
              hints: [
                'Bayangkan sebuah dadu mainan: ada sisi atas-bawah, depan-belakang, kiri-kanan.',
                'Total ada 2 + 2 + 2 = 6 sisi persegi.',
              ],
            },
            colors: { skin: 0xe6b48a, hair: 0x0f172a, shirt: 0xe0f2fe, vest: 0x0284c7, pants: 0x1e293b, scarf: 0xfbbf24 },
          },
        ],
        collectibles: makeG1Collectibles('g1-mat'),
      };

    case 'ipas':
      return {
        ...base,
        worldName: 'Hutan dan Alam',
        tagline: 'IPAS · Kebun Tumbuh & Ekosistem Aman',
        description: 'Hutan segar dengan petak tanam biji yang tumbuh mekar saat disiram, kelinci ramah, dan Zona Aman dari satwa liar!',
        badgeColor: '#16A34A',
        skyHex: 0x86efac,
        fogHex: 0xbbf7d0,
        waterHex: 0x0d9488,
        grassBaseRgb: [0.16, 0.54, 0.26],
        hillHex: 0x15803d,
        peakHex: 0x475569,
        roadHex: 0xc29b6f,
        houseWallHex: 0xd1fae5,
        hemiSkyHex: 0xbbf7d0,
        hemiGroundHex: 0x14532d,
        sunColorHex: 0xecfdf5,
        ambientMoteHex: 0x86efac,
        architectureTitle: 'Pos Alam Pancaindra, Kebun Benih & Zona Aman',
        creatureNames: 'Kelinci Jinak & Serigala Hutan (Hindari ke Zona Aman!)',
        worldIntroStory: 'Selamat datang di Hutan dan Alam! Tanam dan siram benih tumbuhan hingga mekar, beri makan kelinci jinak, dan hindari serigala liar dengan masuk ke Lingkaran Zona Aman!',
        landmarkLabel: 'Pos Peneliti Alam Cilik',
        npcs: [
          {
            id: 'g1-ipas-rimba',
            name: 'Kak Rimba',
            role: 'Pemandu Kebun & Satwa',
            roleStyle: 'farmer',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: 'Halo peneliti alam! Ambil air di sumur kebun, lalu siram petak tanaman agar biji tumbuh menjadi bunga!',
            story: 'Hati-hati bila serigala hutan mendekat — segera masuk ke Lingkaran Hijau Zona Aman agar kamu terlindungi.',
            trivia: {
              question: 'Bagian tumbuhan di dalam tanah yang menyerap air hujan untuk disalurkan ke batang adalah...',
              options: ['Akar', 'Bunga', 'Daun'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Akar menyerap air dan zat mineral dari tanah.',
              hints: [
                'Bagian ini tumbuh tersembunyi di bawah permukaan tanah.',
                'Air diserap oleh bagian bernama Akar.',
              ],
            },
            colors: { skin: 0xd9a074, hair: 0x0f172a, shirt: 0xecfdf5, vest: 0x15803d, pants: 0x365314, scarf: 0xf59e0b },
          },
          {
            id: 'g1-ipas-indah',
            name: 'Bu Indah',
            role: 'Penjaga Cuaca & Sungai',
            roleStyle: 'scientist',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: 'Dengarkan gemericik air sungai bersih menggunakan telingamu, dan rasakan sejuknya angin lewat kulit!',
            story: 'Lima pancaindra membantu kita mengenal dan menjaga lingkungan alam sekitar.',
            trivia: {
              question: 'Indra tubuh yang digunakan untuk mencium harumnya bunga melati di hutan adalah...',
              options: ['Hidung', 'Lidah', 'Telinga'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Hidung adalah indra penciuman.',
              hints: [
                'Letaknya di tengah wajah di atas mulut.',
                'Kita menghirup dan mencium wangi menggunakan Hidung.',
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xfef3c7, vest: 0x16a34a, pants: 0x1e293b, scarf: 0x38bdf8 },
          },
        ],
        collectibles: makeG1Collectibles('g1-ipas'),
      };

    case 'pjok':
      return {
        ...base,
        worldName: 'Pulau Gerak Sehat',
        tagline: 'PJOK · Stadion Lari, Titian Seimbang & Kebersihan',
        description: 'Pulau olahraga cerah berlintasan lari merah-putih, gawang lompat ceria, balok titian keseimbangan, dan wastafel cuci tangan!',
        badgeColor: '#EA580C',
        skyHex: 0xfed7aa,
        fogHex: 0xffedd5,
        waterHex: 0x0284c7,
        grassBaseRgb: [0.25, 0.66, 0.25],
        hillHex: 0x16a34a,
        peakHex: 0x64748b,
        roadHex: 0xf97316,
        houseWallHex: 0xfff7ed,
        hemiSkyHex: 0xffedd5,
        hemiGroundHex: 0x3f6212,
        sunColorHex: 0xfffbeb,
        ambientMoteHex: 0xfb923c,
        architectureTitle: 'Stadion Lari, Gawang Lompat & Balok Titian',
        creatureNames: 'Rusa Pelari Cepat & Burung Semangat',
        worldIntroStory: 'Ayo bergerak sehat di Pulau Gerak Sehat! Lompati gawang rintangan, lintasi balok titian tanpa jatuh, lalu cuci tangan dengan bersih!',
        landmarkLabel: 'Stadion Gerak Sehat',
        npcs: [
          {
            id: 'g1-pjok-bimo',
            name: 'Coach Bimo',
            role: 'Pelatih Olahraga SD',
            roleStyle: 'coach',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: 'Sebelum berlari dan melompati gawang, ayo lakukan pemanasan ringan agar otot siap dan terhindar dari cedera!',
            story: 'Berjalan di atas balok titian biru sambil merentangkan tangan melatih keseimbangan tubuh.',
            trivia: {
              question: 'Gerakan berpindah tempat dari satu titik ke titik lain seperti berjalan, berlari, dan melompat disebut gerak...',
              options: ['Lokomotor', 'Mematung', 'Duduk diam'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Gerak lokomotor adalah gerak berpindah tempat.',
              hints: [
                'Kata kuncinya adalah gerakan tubuh yang membuat posisi kita berpindah tempat.',
                'Nama geraknya adalah gerak Lokomotor.',
              ],
            },
            colors: { skin: 0xd9a074, hair: 0x0f172a, shirt: 0xffffff, vest: 0xea580c, pants: 0x0f172a, scarf: 0xfbbf24 },
          },
          {
            id: 'g1-pjok-dr-putri',
            name: 'Dokter Putri',
            role: 'Pembina Hidup Bersih & Gizi',
            roleStyle: 'scientist',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: 'Setelah berolahraga dan menyentuh tanah, segera cuci tangan pakai sabun dan minum air putih bersih!',
            story: 'Makan sayur, buah, lauk, dan sikat gigi sebelum tidur membuat badan kuat dan bebas kuman.',
            trivia: {
              question: 'Minuman paling sehat untuk melepas dahaga setelah selesai olahraga berlari adalah...',
              options: ['Air putih bersih', 'Sirup sangat kental', 'Minuman bersoda dingin'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Air putih menggantikan cairan keringat tubuh secara sehat tanpa gula berlebih.',
              hints: [
                'Pilih minuman alami tanpa pemanis buatan atau soda.',
                'Air putih bersih adalah pilihan terbaik setelah olahraga.',
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xffffff, vest: 0x10b981, pants: 0x334155, scarf: 0xea580c },
          },
        ],
        collectibles: makeG1Collectibles('g1-pjok'),
      };

    case 'seni-budaya':
      return {
        ...base,
        worldName: 'Negeri Kreativitas',
        tagline: 'Seni Budaya · Air Mancur Warna, Galeri Lukis & Musik',
        description: 'Pulau penuh warna dengan Air Mancur Pencampur Warna, Galeri Kanvas Lukisan yang memajang gambarmu, serta Panggung Gambang Musik!',
        badgeColor: '#9333EA',
        skyHex: 0xe9d5ff,
        fogHex: 0xf3e8ff,
        waterHex: 0x38bdf8,
        grassBaseRgb: [0.3, 0.64, 0.34],
        hillHex: 0x7e22ce,
        peakHex: 0x94a3b8,
        roadHex: 0xfbcfe8,
        houseWallHex: 0xfaf5ff,
        hemiSkyHex: 0xf3e8ff,
        hemiGroundHex: 0x4d7c0f,
        sunColorHex: 0xffffff,
        ambientMoteHex: 0xe879f9,
        architectureTitle: 'Galeri Lukis, Air Mancur Warna & Gazebo Musik',
        creatureNames: 'Kupu-Kupu Pelangi & Merak Warna',
        worldIntroStory: 'Bebaskan imajinasimu di Negeri Kreativitas! Campur warna primer, mainkan nada balok musik 3D, dan gambar karya indahmu di Studio Kanvas!',
        landmarkLabel: 'Galeri & Panggung Kreativitas',
        npcs: [
          {
            id: 'g1-sb-kak-lala',
            name: 'Kak Lala',
            role: 'Pelukis Negeri Kreativitas',
            roleStyle: 'artist',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: 'Halo seniman cilik! Tahukah kamu kalau Merah + Kuning menjadi Jingga, sedangkan Biru + Kuning menjadi Hijau?',
            story: 'Buka Studio Gambar Kanvas untuk melukis bebas — lukisanmu akan langsung dipajang di Galeri 3D di taman ini!',
            trivia: {
              question: 'Jika cat biru dicampur dengan cat kuning dengan rata, warna baru yang muncul adalah...',
              options: ['Hijau', 'Merah muda', 'Hitam'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Biru + Kuning = Hijau (warna sekunder).',
              hints: [
                'Warna ini sama seperti warna daun segar di pohon.',
                'Biru dicampur Kuning menghasilkan warna Hijau.',
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x3b0764, shirt: 0xfaf5ff, vest: 0x9333ea, pants: 0x1e293b, scarf: 0xf43f5e },
          },
          {
            id: 'g1-sb-mas-nada',
            name: 'Mas Nada',
            role: 'Musisi Gambang Pelangi',
            roleStyle: 'musician',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: 'Berjalanlah di dekat Gazebo Musik untuk membunyikan tangga nada Do-Re-Mi-Fa-Sol-La-Si-Do!',
            story: 'Setiap tepuk tangan atau ayunan tari menirukan burung terbang bisa mengikuti ketukan cepat maupun lambat.',
            trivia: {
              question: 'Ukuran cepat atau lambatnya ketukan sebuah lagu disebut...',
              options: ['Tempo', 'Garis zig-zag', 'Krayon'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Tempo mengatur cepat-lambatnya ketukan irama lagu.',
              hints: [
                'Ini adalah istilah musik untuk kecepatan ketukan lagu.',
                'Cepat-lambatnya irama lagu disebut Tempo.',
              ],
            },
            colors: { skin: 0xe6b48a, hair: 0x0f172a, shirt: 0xffffff, vest: 0xd97706, pants: 0x312e81, scarf: 0x9333ea },
          },
        ],
        collectibles: makeG1Collectibles('g1-sb'),
      };

    case 'bahasa-inggris':
      return {
        ...base,
        worldName: 'English Adventure City',
        tagline: 'English · Speaking Signs, School & Animal Corner',
        description: 'Kota belajar Bahasa Inggris interaktif lengkap dengan papan benda 3D bersuara pengucapan asli (Book, Apple, Cat, Red Bag, Chair)!',
        badgeColor: '#4F46E5',
        skyHex: 0xc7d2fe,
        fogHex: 0xe0e7ff,
        waterHex: 0x0284c7,
        grassBaseRgb: [0.24, 0.62, 0.34],
        hillHex: 0x4338ca,
        peakHex: 0x64748b,
        roadHex: 0xe2e8f0,
        houseWallHex: 0xeef2ff,
        hemiSkyHex: 0xe0e7ff,
        hemiGroundHex: 0x365314,
        sunColorHex: 0xffffff,
        ambientMoteHex: 0x818cf8,
        architectureTitle: 'English Gate, Mini School & Vocabulary Park',
        creatureNames: 'Happy Cat & Bluebird',
        worldIntroStory: 'Welcome to English Adventure City! Sentuh objek-objek berlabel seperti Apple, Book, Cat, dan Bag untuk mendengar pengucapan Bahasa Inggrisnya!',
        landmarkLabel: 'English Learning Gate',
        npcs: [
          {
            id: 'g1-ing-miss-ena',
            name: 'Miss Ena',
            role: 'English Guide',
            roleStyle: 'english-guide',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: 'Good morning, little explorer! Sentuh benda-benda di English Adventure City untuk mendengar cara mengucapkannya.',
            story: 'Remember: Red is Merah, Blue is Biru, Book is Buku, and Thank you means Terima kasih!',
            trivia: {
              question: 'Ucapan "Good morning" dalam bahasa Indonesia artinya...',
              options: ['Selamat pagi', 'Selamat tidur', 'Sampai jumpa'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: '"Good morning" adalah sapaan ramah untuk Selamat pagi.',
              hints: [
                'Morning berarti waktu pagi hari saat matahari terbit.',
                '"Good morning" artinya Selamat pagi.',
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xffffff, vest: 0x4f46e5, pants: 0x1e293b, scarf: 0x38bdf8 },
          },
          {
            id: 'g1-ing-leo',
            name: 'Uncle Leo',
            role: 'Number & Animal Keeper',
            roleStyle: 'teacher',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: 'Hello! Can you count One, Two, Three, Four, Five? Try clicking the English Voice Cards!',
            story: 'Practice speaking aloud every day so you feel confident and happy.',
            trivia: {
              question: 'Angka "Eight" dan kata "Bag" secara berurutan berarti...',
              options: ['8 dan Tas', '7 dan Buku', '9 dan Kursi'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Eight = 8, Bag = Tas.',
              hints: [
                'Urutannya: six (6), seven (7), eight (8)!',
                'Bag adalah tempat membawa buku ke sekolah = Tas.',
              ],
            },
            colors: { skin: 0xe6b48a, hair: 0x334155, shirt: 0xe0e7ff, vest: 0x0284c7, pants: 0x0f172a, scarf: 0xf59e0b },
          },
        ],
        collectibles: makeG1Collectibles('g1-ing'),
      };

    case 'muatan-lokal':
      return {
        ...base,
        worldName: `Kampung Budaya · ${reg.regionName}`,
        tagline: `Muatan Lokal · ${reg.houseName}`,
        description: `Kampung tradisional ${reg.regionName} menampilkan ${reg.houseName}, warung kuliner ${reg.foodName}, dan panggung alat musik ${reg.instrumentName}.`,
        badgeColor: reg.accentHex,
        skyHex: reg.skyHex,
        fogHex: 0xfef3c7,
        waterHex: 0x0284c7,
        grassBaseRgb: reg.grassRgb,
        hillHex: reg.roofHex,
        peakHex: 0x78716c,
        roadHex: 0xd6b07c,
        houseWallHex: reg.wallHex,
        hemiSkyHex: 0xfef3c7,
        hemiGroundHex: 0x4d7c0f,
        sunColorHex: 0xfffbeb,
        ambientMoteHex: 0xfbbf24,
        architectureTitle: `${reg.houseName}, Warung Kuliner & Panggung ${reg.instrumentName}`,
        creatureNames: 'Ayam Kampung & Merpati Nusantara',
        worldIntroStory: `${reg.greeting} Selamat datang di Kampung Budaya ${reg.regionName}! Kenali ${reg.houseName}, cicipi ${reg.foodName}, dan pelajari kosakata daerah.`,
        landmarkLabel: reg.houseName,
        npcs: [
          {
            id: `g1-mulok-${localRegion}-1`,
            name: 'Mbah Rukun',
            role: `Tetua ${reg.regionName}`,
            roleStyle: 'mulok-elder',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: `${reg.greeting}! Di belakangmu berdiri megah ${reg.houseName} kebanggaan ${reg.regionName}.`,
            story: `Amati bentuk atap ${reg.houseName} lalu cicipi ${reg.foodName} di Warung Budaya!`,
            trivia: {
              question: `Rumah adat tradisional yang menjadi kebanggaan masyarakat ${reg.regionName} adalah...`,
              options: [reg.houseName, 'Gedung Pencakar Langit', 'Kapal Selam'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: `${reg.houseName} adalah rumah adat khas dari ${reg.regionName}.`,
              hints: [
                `Perhatikan bentuk atap tradisional di Kampung Budaya ${reg.regionName}.`,
                `Rumah adatnya bernama ${reg.houseName}.`,
              ],
            },
            colors: { skin: 0xd9a074, hair: 0xe2e8f0, shirt: 0xfffbeb, vest: reg.roofHex, pants: 0x1e293b, scarf: 0xfbbf24 },
          },
          {
            id: `g1-mulok-${localRegion}-2`,
            name: 'Kak Kirana',
            role: 'Pemandu Kuliner & Seni Daerah',
            roleStyle: 'merchant',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: `Selain ${reg.foodName}, masyarakat daerah kami gemar bermain ${reg.instrumentName} bersama-sama!`,
            story: 'Kamu bisa mengganti pilihan daerah (Jawa, Sunda, Bali, Minang, Toraja, Papua) di menu atas untuk melihat kampung adat yang berbeda!',
            trivia: {
              question: `Arti ungkapan santun "${reg.vocabPairs[0].local}" adalah...`,
              options: [reg.vocabPairs[0].indo, 'Sampai jumpa malam', 'Jangan lupa makan'],
              correctIndex: 0,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: `${reg.vocabPairs[0].local} berarti "${reg.vocabPairs[0].indo}" (${reg.vocabPairs[0].meaning}).`,
              hints: [
                'Ungkapan ini biasa diucapkan ketika bertemu teman saat matahari terbit.',
                `Artinya adalah "${reg.vocabPairs[0].indo}".`,
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xfef3c7, vest: reg.roofHex, pants: 0x334155, scarf: 0x10b981 },
          },
        ],
        collectibles: makeG1Collectibles(`g1-mulok-${localRegion}`),
      };

    case 'bahasa-indonesia':
    default:
      return {
        ...base,
        worldName: 'Desa Huruf dan Cerita',
        tagline: 'Bahasa Indonesia · Rumah Huruf & Perpustakaan',
        description: 'Desa pelangi ceria penuh Rumah Huruf, Perpustakaan, Balok Suku Kata tersembunyi, dan Taman Bermain literasi.',
        badgeColor: '#0284C7',
        skyHex: 0x93d5f7,
        fogHex: 0xbae6fd,
        waterHex: 0x0ea5e9,
        grassBaseRgb: [0.24, 0.65, 0.27],
        hillHex: 0x16a34a,
        peakHex: 0x64748b,
        roadHex: 0xe6be8a,
        houseWallHex: 0xfef3c7,
        hemiSkyHex: 0xbae6fd,
        hemiGroundHex: 0x65a30d,
        sunColorHex: 0xfffbeb,
        ambientMoteHex: 0xfde047,
        architectureTitle: 'Rumah Huruf, Perpustakaan & Balok Kata',
        creatureNames: 'Kupu-Kupu Pelangi & Kelinci Lucu',
        worldIntroStory: 'Selamat datang di Desa Huruf dan Cerita! Temukan balok suku kata, taruh di Rumah Huruf atau Perpustakaan, dan susun kalimat sederhana!',
        landmarkLabel: 'Taman Balok Huruf & Cerita',
        npcs: [
          {
            id: 'k1-raka',
            name: 'Kak Raka',
            role: 'Pemandu Huruf & Kata',
            roleStyle: 'teacher',
            x: -10.5,
            z: 6.2,
            facingY: 0.35,
            greeting: 'Halo petualang Kelas 1! Di Desa Huruf dan Cerita, temukan balok suku kata BO-LA dan kartu A-I-U-E-O!',
            story: 'Bawa balok kata ke meja Rumah Huruf atau kunjungi Perpustakaan untuk merangkai kata.',
            trivia: {
              question: 'Huruf vokal dalam kata "BUKU" adalah...',
              options: ['B dan K', 'U dan U', 'B dan U'],
              correctIndex: 1,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Huruf vokal terdiri atas a, i, u, e, o. Pada kata BUKU, huruf vokalnya adalah U.',
              hints: [
                'Ingat huruf vokal adalah A, I, U, E, O.',
                'Pada kata B-U-K-U, hanya huruf U yang merupakan vokal!',
              ],
            },
            colors: { skin: 0xe6b48a, hair: 0x1e293b, shirt: 0xf8fafc, vest: 0x0284c7, pants: 0x334155, scarf: 0xf59e0b },
          },
          {
            id: 'k1-tari',
            name: 'Bu Tari',
            role: 'Pustakawan Desa',
            roleStyle: 'librarian',
            x: 18.2,
            z: -1.6,
            facingY: -1.4,
            greeting: 'Wah, kamu hebat sudah menyeberangi jembatan! Jangan lupa membaca cerita pendek setiap hari ya.',
            story: 'Gunakan Papan Rangkai Kata untuk menggabungkan dua suku kata menjadi kata bermakna!',
            trivia: {
              question: 'Gabungan suku kata "ma" dan "ta" dibaca menjadi kata...',
              options: ['makan', 'mata', 'meja'],
              correctIndex: 1,
              rewardCoins: 20,
              rewardScore: 120,
              explanation: 'Suku kata "ma" + "ta" dibaca "mata".',
              hints: [
                'Ucapkan perlahan: ma ... ta ...',
                'Kata yang terbentuk adalah bagian tubuh untuk melihat: mata.',
              ],
            },
            colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xfef3c7, vest: 0xea580c, pants: 0x1e293b, scarf: 0x10b981 },
          },
        ],
        collectibles: makeG1Collectibles('g1-bi'),
      };
  }
}
