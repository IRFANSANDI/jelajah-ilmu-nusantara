export type NpcRoleStyle =
  | 'default'
  | 'librarian'
  | 'mathematician'
  | 'explorer'
  | 'pancasila'
  | 'pancasila-guide'
  | 'coach'
  | 'artist'
  | 'musician'
  | 'english'
  | 'english-guide'
  | 'culture'
  | 'mulok-elder'
  | 'scientist'
  | 'teacher'
  | 'farmer'
  | 'merchant'
  | 'sailor'
  | 'royal'
  | 'student-friend'
  | 'religion-islam'
  | 'religion-kristen'
  | 'religion-katolik'
  | 'religion-hindu'
  | 'religion-buddha'
  | 'religion-khonghucu'
  | 'agama-islam'
  | 'agama-kristen'
  | 'agama-katolik'
  | 'agama-hindu'
  | 'agama-buddha'
  | 'agama-khonghucu';

export interface NpcTrivia {
  question: string;
  options: [string, string, string];
  correctIndex: number;
  rewardCoins: number;
  rewardScore: number;
  explanation: string;
  hints?: [string, string];
}

export interface NpcDefinition {
  id: string;
  name: string;
  role: string;
  roleStyle?: NpcRoleStyle;
  x: number;
  z: number;
  facingY: number;
  greeting: string;
  story: string;
  trivia: NpcTrivia;
  colors: {
    skin: number;
    hair: number;
    shirt: number;
    vest: number;
    pants: number;
    scarf: number;
    hat?: number;
  };
}

export interface CollectibleSpawn {
  id: string;
  kind: 'coin' | 'scroll' | 'crystal';
  x: number;
  z: number;
  valueCoins: number;
  valueScore: number;
}

export interface MissionState {
  coinsCollected: number;
  coinsTarget: number;
  scrollsCollected: number;
  scrollsTarget: number;
  npcsTalked: string[];
  npcsTarget: number;
  bridgeCrossed: boolean;
}

export const NPCS: NpcDefinition[] = [
  {
    id: 'kak-raka',
    name: 'Kak Raka',
    role: 'Penjaga Desa Nusantara',
    x: -10.5,
    z: 6.2,
    facingY: 0.35,
    greeting:
      'Selamat datang di Pulau Petualangan Nusantara! Gunakan WASD atau tombol Panah untuk berjalan, Shift untuk berlari, dan Spasi untuk melompat.',
    story:
      'Di pulau ini tersebar Koin Ilmu, Permata Alam, dan 3 Gulungan Pustaka. Coba seberangi Jembatan Kayu di timur untuk menemui Pak Bagus dan daki bukit ke tempat Ibu Sekar!',
    trivia: {
      question: 'Apa semboyan persatuan bangsa Indonesia yang tertulis pada pita Garuda Pancasila?',
      options: [
        'Tut Wuri Handayani',
        'Bhinneka Tunggal Ika',
        'Rawe-Rawe Rantas',
      ],
      correctIndex: 1,
      rewardCoins: 25,
      rewardScore: 150,
      explanation: 'Bhinneka Tunggal Ika berarti "Berbeda-beda tetapi tetap satu jua".',
    },
    colors: {
      skin: 0xe6b48a,
      hair: 0x1e293b,
      shirt: 0xf8fafc,
      vest: 0x059669,
      pants: 0x334155,
      scarf: 0xf59e0b,
      hat: 0x92400e,
    },
  },
  {
    id: 'pak-bagus',
    name: 'Pak Bagus',
    role: 'Pemandu Sungai & Jembatan',
    x: 18.2,
    z: -1.6,
    facingY: -1.4,
    greeting:
      'Wah, kamu berhasil menyeberangi Jembatan Kayu! Sungai ini mengalir dari mata air pegunungan di utara menuju teluk selatan.',
    story:
      'Menjaga kebersihan sungai mencegah banjir saat musim hujan. Jangan lupa ambil Gulungan Pustaka di tepi bukit timur laut ya!',
    trivia: {
      question: 'Dalam siklus air, proses penguapan air laut dan sungai oleh panas matahari disebut...',
      options: ['Evaporasi', 'Kondensasi', 'Presipitasi'],
      correctIndex: 0,
      rewardCoins: 30,
      rewardScore: 180,
      explanation: 'Evaporasi adalah penguapan air akibat panas matahari sebelum mengembun menjadi awan (kondensasi).',
    },
    colors: {
      skin: 0xd9a074,
      hair: 0x334155,
      shirt: 0xe0f2fe,
      vest: 0x0284c7,
      pants: 0x1e293b,
      scarf: 0xdc2626,
      hat: 0xd97706,
    },
  },
  {
    id: 'ibu-sekar',
    name: 'Ibu Sekar',
    role: 'Pustakawan Bukit Ilmu',
    x: 28.5,
    z: -21.0,
    facingY: -0.6,
    greeting:
      'Hebat! Kamu sudah mendaki sampai ke Bukit Ilmu. Dari sini pemandangan seluruh pulau dan rumah adat terlihat sangat indah!',
    story:
      'Pendidikan dan rasa ingin tahu membuat generasi Nusantara semakin cerdas. Jawab pertanyaan dariku untuk hadiah koin tambahan!',
    trivia: {
      question: 'Jika sebuah taman persegi memiliki panjang sisi 7 meter, berapakah kelilingnya?',
      options: ['14 meter', '28 meter', '49 meter'],
      correctIndex: 1,
      rewardCoins: 35,
      rewardScore: 200,
      explanation: 'Keliling persegi = 4 × sisi = 4 × 7 meter = 28 meter.',
    },
    colors: {
      skin: 0xf1c29b,
      hair: 0x1e1b4b,
      shirt: 0xfef3c7,
      vest: 0x7c3aed,
      pants: 0x312e81,
      scarf: 0x10b981,
    },
  },
];

export const COLLECTIBLE_SPAWNS: CollectibleSpawn[] = [
  // Village road & plaza coins
  { id: 'c1', kind: 'coin', x: -8, z: 2.5, valueCoins: 10, valueScore: 50 },
  { id: 'c2', kind: 'coin', x: -3.5, z: 0.8, valueCoins: 10, valueScore: 50 },
  { id: 'c3', kind: 'coin', x: 1.0, z: 1.5, valueCoins: 10, valueScore: 50 },
  // On the wooden bridge
  { id: 'c4', kind: 'coin', x: 8.5, z: 1.5, valueCoins: 15, valueScore: 75 },
  // Across the bridge toward eastern hill
  { id: 'c5', kind: 'coin', x: 16.5, z: 4.5, valueCoins: 10, valueScore: 50 },
  { id: 'c6', kind: 'coin', x: 23.0, z: -6.5, valueCoins: 10, valueScore: 50 },
  { id: 'c7', kind: 'coin', x: 26.5, z: -14.0, valueCoins: 10, valueScore: 50 },
  // Northern & western meadow coins
  { id: 'c8', kind: 'coin', x: -12.0, z: -10.5, valueCoins: 10, valueScore: 50 },
  { id: 'c9', kind: 'coin', x: -22.0, z: -15.0, valueCoins: 10, valueScore: 50 },
  { id: 'c10', kind: 'coin', x: -26.0, z: 8.0, valueCoins: 10, valueScore: 50 },

  // 3 Energy Crystals
  { id: 'g1', kind: 'crystal', x: -29.0, z: -20.0, valueCoins: 20, valueScore: 100 },
  { id: 'g2', kind: 'crystal', x: 31.0, z: 18.0, valueCoins: 20, valueScore: 100 },
  { id: 'g3', kind: 'crystal', x: 2.0, z: 24.0, valueCoins: 20, valueScore: 100 },

  // 3 Major Knowledge Scrolls (Gulungan Pustaka)
  { id: 's1', kind: 'scroll', x: -12.0, z: -24.5, valueCoins: 25, valueScore: 150 },
  { id: 's2', kind: 'scroll', x: 32.0, z: -26.5, valueCoins: 25, valueScore: 150 },
  { id: 's3', kind: 'scroll', x: 25.0, z: 10.5, valueCoins: 25, valueScore: 150 },
];
