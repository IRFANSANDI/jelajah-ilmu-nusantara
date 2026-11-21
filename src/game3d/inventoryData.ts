export type GradeNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type HeroStyleId = 'bima' | 'sari';

export type ReligionId =
  | 'islam'
  | 'kristen'
  | 'katolik'
  | 'hindu'
  | 'buddha'
  | 'khonghucu';

export interface ReligionMeta {
  id: ReligionId;
  label: string;
}

export const RELIGIONS: ReligionMeta[] = [
  { id: 'islam', label: 'Islam' },
  { id: 'kristen', label: 'Kristen' },
  { id: 'katolik', label: 'Katolik' },
  { id: 'hindu', label: 'Hindu' },
  { id: 'buddha', label: 'Buddha' },
  { id: 'khonghucu', label: 'Khonghucu' },
];

export type Accessory3DId =
  | 'none'
  | 'topi-rimba'
  | 'kacamata-ilmu'
  | 'mahkota-penjaga'
  | 'sayap-nusantara';

export type LocalRegionId =
  | 'jawa'
  | 'sunda'
  | 'bali'
  | 'minang'
  | 'toraja'
  | 'papua';

export interface LocalRegionMeta {
  id: LocalRegionId;
  label: string;
  province: string;
  houseName: string;
  greeting: string;
  accentHex: string;
}

export const LOCAL_REGIONS: LocalRegionMeta[] = [
  {
    id: 'jawa',
    label: 'Jawa (Joglo)',
    province: 'Jawa Tengah / DIY',
    houseName: 'Rumah Joglo',
    greeting: 'Sugeng enjang',
    accentHex: '#B45309',
  },
  {
    id: 'sunda',
    label: 'Sunda (Jolopong)',
    province: 'Jawa Barat',
    houseName: 'Imah Jolopong',
    greeting: 'Wilujeng enjing',
    accentHex: '#15803D',
  },
  {
    id: 'bali',
    label: 'Bali (Bale Banjar)',
    province: 'Bali',
    houseName: 'Bale Bali',
    greeting: 'Om Swastyastu',
    accentHex: '#D97706',
  },
  {
    id: 'minang',
    label: 'Minangkabau (Gadang)',
    province: 'Sumatera Barat',
    houseName: 'Rumah Gadang',
    greeting: 'Salamaik pagi',
    accentHex: '#DC2626',
  },
  {
    id: 'toraja',
    label: 'Toraja (Tongkonan)',
    province: 'Sulawesi Selatan',
    houseName: 'Rumah Tongkonan',
    greeting: 'Kurre sumanga',
    accentHex: '#9A3412',
  },
  {
    id: 'papua',
    label: 'Papua (Honai)',
    province: 'Papua',
    houseName: 'Rumah Honai',
    greeting: 'Amole / Selamat pagi',
    accentHex: '#0F766E',
  },
];

export type SubjectId =
  | 'bahasa-indonesia'
  | 'matematika'
  | 'ipas'
  | 'pancasila'
  | 'agama'
  | 'pjok'
  | 'seni-budaya'
  | 'bahasa-inggris'
  | 'muatan-lokal';

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  shortName: string;
  minGrade: GradeNumber;
  accentHex: string;
  description: string;
  optionalSchool?: boolean;
}

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'bahasa-indonesia',
    name: 'Bahasa Indonesia',
    shortName: 'B. Indonesia',
    minGrade: 1,
    accentHex: '#0284C7',
    description: 'Membaca, menulis, menyimak, kosakata, tata bahasa, dan literasi kreatif.',
  },
  {
    id: 'matematika',
    name: 'Matematika',
    shortName: 'Matematika',
    minGrade: 1,
    accentHex: '#059669',
    description: 'Bilangan, operasi hitung, pecahan, geometri bangun, pengukuran, dan pengolahan data.',
  },
  {
    id: 'ipas',
    name: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    shortName: 'IPAS',
    minGrade: 1,
    accentHex: '#16A34A',
    description: 'Panca indera, pertumbuhan tanaman, ekosistem alam, wujud zat, energi, serta lingkungan sosial.',
  },
  {
    id: 'pancasila',
    name: 'Pendidikan Pancasila',
    shortName: 'Pancasila',
    minGrade: 1,
    accentHex: '#DC2626',
    description: 'Identitas diri, aturan, hak & kewajiban, musyawarah, gotong royong, dan simbol Pancasila.',
  },
  {
    id: 'agama',
    name: 'Pendidikan Agama dan Budi Pekerti',
    shortName: 'Agama & Budi Pekerti',
    minGrade: 1,
    accentHex: '#0D9488',
    description: 'Akhlak mulia, kasih sayang, toleransi, dan nilai ibadah sesuai agama pilihan pemain.',
  },
  {
    id: 'pjok',
    name: 'PJOK',
    shortName: 'PJOK',
    minGrade: 1,
    accentHex: '#EA580C',
    description: 'Gerak dasar lokomotor & non-lokomotor, keseimbangan, permainan bola, dan pola hidup sehat.',
  },
  {
    id: 'seni-budaya',
    name: 'Seni Budaya',
    shortName: 'Seni Budaya',
    minGrade: 1,
    accentHex: '#9333EA',
    description: 'Seni rupa, menggambar bebas, alat musik ritmis/melodis, gerak tari, dan kriya Nusantara.',
  },
  {
    id: 'bahasa-inggris',
    name: 'Bahasa Inggris',
    shortName: 'B. Inggris',
    minGrade: 1,
    accentHex: '#4F46E5',
    description: 'Kosakata harian, percakapan sederhana, pengucapan suara, angka, warna, dan cerita.',
    optionalSchool: true,
  },
  {
    id: 'muatan-lokal',
    name: 'Muatan Lokal & Budaya Daerah',
    shortName: 'Muatan Lokal',
    minGrade: 1,
    accentHex: '#B45309',
    description: 'Bahasa daerah, rumah adat, makanan khas, permainan rakyat, dan tradisi kearifan lokal Indonesia.',
  },
];

export function getSubjectsForGrade(
  grade: GradeNumber,
  includeEnglish = true
): SubjectMeta[] {
  return SUBJECTS.filter((s) => {
    if (!includeEnglish && s.id === 'bahasa-inggris') return false;
    if (s.id === 'ipas') return grade === 1 || grade >= 3;
    if (s.id === 'muatan-lokal') return grade === 1;
    return grade >= s.minGrade;
  });
}

export interface InventoryShopItem {
  id: Accessory3DId;
  name: string;
  description: string;
  price: number;
  colorHex: string;
  bonusText: string;
}

export const SHOP_ACCESSORIES: InventoryShopItem[] = [
  {
    id: 'topi-rimba',
    name: 'Topi Rimba Penjelajah',
    description: 'Topi petualang cokelat klasik yang langsung terpasang di kepala karakter 3D.',
    price: 40,
    colorHex: '#B45309',
    bonusText: 'Perlengkapan Kepala 3D',
  },
  {
    id: 'kacamata-ilmu',
    name: 'Kacamata Ilmuwan Muda',
    description: 'Kacamata lensa biru jernih bergaya peneliti untuk menjelajahi teka-teki pulau.',
    price: 75,
    colorHex: '#0284C7',
    bonusText: 'Perlengkapan Wajah 3D',
  },
  {
    id: 'mahkota-penjaga',
    name: 'Mahkota Penjaga Ilmu',
    description: 'Mahkota emas berkilau tanda kehormatan penjelajah Kerajaan Penjaga Ilmu.',
    price: 130,
    colorHex: '#D97706',
    bonusText: 'Perlengkapan Kerajaan 3D',
  },
  {
    id: 'sayap-nusantara',
    name: 'Sayap Cahaya Nusantara',
    description: 'Sayap pelangi berkilau di punggung karakter saat berlari dan melompat di dunia 3D.',
    price: 200,
    colorHex: '#059669',
    bonusText: 'Perlengkapan Punggung 3D',
  },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  requirementLabel: string;
  rewardCoins: number;
  accentHex: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'bab-pertama',
    title: 'Langkah Penjelajah',
    description: 'Menyelesaikan Bab pertama di salah satu dunia petualangan 3D.',
    requirementLabel: 'Selesaikan 1 Bab',
    rewardCoins: 25,
    accentHex: '#059669',
  },
  {
    id: 'kolektor-koin-100',
    title: 'Pemburu Koin Ilmu',
    description: 'Mengumpulkan minimal 100 Koin Ilmu dari misi dan eksplorasi pulau.',
    requirementLabel: 'Capai 100 Koin',
    rewardCoins: 30,
    accentHex: '#D97706',
  },
  {
    id: 'sahabat-npc',
    title: 'Sahabat Pemandu Pulau',
    description: 'Berbicara dengan para pemandu NPC dan menuntaskan 3 Bab belajar.',
    requirementLabel: 'Selesaikan 3 Bab',
    rewardCoins: 45,
    accentHex: '#0284C7',
  },
  {
    id: 'penakluk-kelas',
    title: 'Juara Satu Kelas',
    description: 'Menamatkan seluruh 4 Bab pada satu jenjang kelas secara berurutan.',
    requirementLabel: 'Tamatkan 4 Bab dalam 1 Kelas',
    rewardCoins: 80,
    accentHex: '#DC2626',
  },
  {
    id: 'kolektor-gaya',
    title: 'Penjelajah Bergaya',
    description: 'Membeli dan memasang minimal 1 perlengkapan 3D di Inventaris.',
    requirementLabel: 'Miliki 1 Perlengkapan 3D',
    rewardCoins: 25,
    accentHex: '#9333EA',
  },
  {
    id: 'cendekia-level-4',
    title: 'Cendekia Nusantara',
    description: 'Mencapai Level 4 pemain melalui perolehan XP dari tantangan belajar.',
    requirementLabel: 'Capai Level 4 Pemain',
    rewardCoins: 60,
    accentHex: '#0D9488',
  },
];

export interface LevelStatus {
  level: number;
  title: string;
  minXp: number;
  nextXp: number;
}

const TITLES = [
  'Perintis Cilik',
  'Penjelajah Pulau',
  'Pengembara Ilmu',
  'Cendekia Muda',
  'Penjaga Hutan',
  'Pemandu Nusantara',
  'Ilmuwan Cilik',
  'Kesatria Pustaka',
  'Master Pengetahuan',
  'Legenda Nusantara',
];

export function computeLevelStatus(xp: number): LevelStatus {
  let level = 1;
  let floor = 0;
  for (let i = 1; i < TITLES.length; i++) {
    const step = i * 120;
    if (xp >= floor + step) {
      floor += step;
      level = i + 1;
    } else {
      return {
        level,
        title: TITLES[level - 1],
        minXp: floor,
        nextXp: floor + step,
      };
    }
  }
  return {
    level: TITLES.length,
    title: TITLES[TITLES.length - 1],
    minXp: floor,
    nextXp: floor + 1000,
  };
}
