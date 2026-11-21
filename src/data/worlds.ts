import { GradeLevel, WorldId, WorldThemeConfig } from '../types/game';

export const ASSETS = {
  heroBanner: '/src/assets/images/hero_nusantara_banner_1794925790189.jpg',
  avatarBima: '/src/assets/images/char_bima_explorer_1794925790890.jpg',
  avatarSari: '/src/assets/images/char_sari_explorer_1794925790966.jpg',
  backdropForest: '/src/assets/images/world_backdrop_forest_1794925791158.jpg',
  backdropArchipelago: '/src/assets/images/world_backdrop_archipelago_1794925791908.jpg',
};

export const GRADE_META: Record<
  GradeLevel,
  {
    label: string;
    fase: string;
    ageHint: string;
    summary: string;
  }
> = {
  1: {
    label: 'Kelas 1 SD',
    fase: 'Fase A',
    ageHint: 'Usia 6–7 Tahun',
    summary: 'Mengenal bilangan, membaca permulaan, lingkungan sekitar, dan nilai Pancasila dasar.',
  },
  2: {
    label: 'Kelas 2 SD',
    fase: 'Fase A',
    ageHint: 'Usia 7–8 Tahun',
    summary: 'Operasi hitung ratusan, kalimat sederhana, makhluk hidup, aturan sekolah, dan budaya lokal.',
  },
  3: {
    label: 'Kelas 3 SD',
    fase: 'Fase B',
    ageHint: 'Usia 8–9 Tahun',
    summary: 'Perkalian & pecahan dasar, paragraf informasi, wujud zat, hak kewajiban, serta keragaman pulau.',
  },
  4: {
    label: 'Kelas 4 SD',
    fase: 'Fase B',
    ageHint: 'Usia 9–10 Tahun',
    summary: 'FPB/KPK, bangun datar, ide pokok teks, gaya & energi, norma masyarakat, dan sejarah daerah.',
  },
  5: {
    label: 'Kelas 5 SD',
    fase: 'Fase C',
    ageHint: 'Usia 10–11 Tahun',
    summary: 'Desimal, volume kubus/balok, ekosistem & rantai makanan, teks eksplanasi, serta ekonomi maritim.',
  },
  6: {
    label: 'Kelas 6 SD',
    fase: 'Fase C',
    ageHint: 'Usia 11–12 Tahun',
    summary: 'Rasio & lingkaran, tata surya & listrik, teks pidato, persatuan bangsa, dan proklamasi kemerdekaan.',
  },
};

export const WORLDS: WorldThemeConfig[] = [
  {
    id: 'hutan-angka',
    name: 'Hutan Angka',
    subject: 'Matematika',
    tagline: 'Jejak berhitung di rimba hijau Nusantara',
    description:
      'Jelajahi jembatan kayu dan batu bilangan sambil memecahkan teka-teki berhitung, geometri, dan logika angka.',
    accentHex: '#059669',
    surfaceClass: 'bg-emerald-50 border-emerald-200',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    textAccentClass: 'text-emerald-700',
    ringClass: 'ring-emerald-500',
    npcName: 'Kak Raka',
    npcRole: 'Penjaga Rimba Bilangan',
    backdropImage: ASSETS.backdropForest,
    skyGradient: 'from-emerald-800/35 via-transparent to-emerald-950/60',
    groundTint: 'rgba(6, 95, 70, 0.14)',
    landmarkLabel: 'Prasasti Bilangan',
  },
  {
    id: 'lembah-kata',
    name: 'Lembah Kata',
    subject: 'Bahasa Indonesia',
    tagline: 'Petualangan membaca, menulis, dan sastra anak',
    description:
      'Temukan gulungan cerita di lembah yang sejuk, perbaiki ejaan kalimat, dan pahami makna bacaan Indonesia.',
    accentHex: '#0284C7',
    surfaceClass: 'bg-sky-50 border-sky-200',
    buttonClass: 'bg-sky-600 hover:bg-sky-700 text-white',
    textAccentClass: 'text-sky-700',
    ringClass: 'ring-sky-500',
    npcName: 'Ibu Sekar',
    npcRole: 'Pustakawan Lembah',
    backdropImage: ASSETS.heroBanner,
    skyGradient: 'from-sky-800/35 via-transparent to-sky-950/60',
    groundTint: 'rgba(2, 132, 199, 0.12)',
    landmarkLabel: 'Balai Pustaka Kuno',
  },
  {
    id: 'taman-sains',
    name: 'Taman Alam & Sains',
    subject: 'IPAS / IPA',
    tagline: 'Eksplorasi tumbuhan, energi, dan tata surya',
    description:
      'Amati keajaiban alam Indonesia, siklus air, gaya dan gerak, hingga planet tata surya di taman penelitian terbuka.',
    accentHex: '#0D9488',
    surfaceClass: 'bg-teal-50 border-teal-200',
    buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white',
    textAccentClass: 'text-teal-700',
    ringClass: 'ring-teal-500',
    npcName: 'Pak Bagus',
    npcRole: 'Peneliti Taman Alam',
    backdropImage: ASSETS.backdropForest,
    skyGradient: 'from-teal-800/35 via-transparent to-teal-950/60',
    groundTint: 'rgba(13, 148, 136, 0.14)',
    landmarkLabel: 'Rumah Kaca Sains',
  },
  {
    id: 'bukit-pancasila',
    name: 'Bukit Pancasila',
    subject: 'Pendidikan Pancasila',
    tagline: 'Belajar adab, gotong royong, dan hak kewajiban',
    description:
      'Daki pendopo bukit persatuan untuk mempraktikkan nilai sila Pancasila, toleransi, dan musyawarah.',
    accentHex: '#DC2626',
    surfaceClass: 'bg-rose-50 border-rose-200',
    buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    textAccentClass: 'text-rose-700',
    ringClass: 'ring-rose-500',
    npcName: 'Mbah Darmo',
    npcRole: 'Sesepuh Pendopo',
    backdropImage: ASSETS.backdropArchipelago,
    skyGradient: 'from-rose-900/30 via-transparent to-slate-950/65',
    groundTint: 'rgba(220, 38, 38, 0.10)',
    landmarkLabel: 'Pendopo Bhinneka',
  },
  {
    id: 'pulau-budaya',
    name: 'Pulau Budaya',
    subject: 'IPS & Sejarah Nusantara',
    tagline: 'Jelajahi peta kepulauan, pahlawan, dan tradisi',
    description:
      'Berlayar antar pulau mengenal rumah adat, pahlawan nasional, peninggalan sejarah, dan kegiatan ekonomi.',
    accentHex: '#D97706',
    surfaceClass: 'bg-amber-50 border-amber-200',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    textAccentClass: 'text-amber-700',
    ringClass: 'ring-amber-500',
    npcName: 'Nadia',
    npcRole: 'Pemandu Bahari',
    backdropImage: ASSETS.backdropArchipelago,
    skyGradient: 'from-amber-800/30 via-transparent to-amber-950/60',
    groundTint: 'rgba(217, 119, 6, 0.12)',
    landmarkLabel: 'Dermaga Nusantara',
  },
  {
    id: 'puncak-logika',
    name: 'Puncak Logika & English',
    subject: 'Bahasa Inggris & Logika',
    tagline: 'Tantangan kosakata global dan pola berpikir cerdas',
    description:
      'Taklukkan puncak menara awan dengan kosakata Bahasa Inggris Kurikulum Merdeka dan teka-teki pola logika.',
    accentHex: '#4F46E5',
    surfaceClass: 'bg-indigo-50 border-indigo-200',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    textAccentClass: 'text-indigo-700',
    ringClass: 'ring-indigo-500',
    npcName: 'Kak Lintang',
    npcRole: 'Mentor Puncak Cerdas',
    backdropImage: ASSETS.heroBanner,
    skyGradient: 'from-indigo-900/35 via-transparent to-slate-950/65',
    groundTint: 'rgba(79, 70, 229, 0.14)',
    landmarkLabel: 'Menara Bahasa & Logika',
  },
];

export function getWorldById(id: WorldId): WorldThemeConfig {
  return WORLDS.find((w) => w.id === id) || WORLDS[0];
}
