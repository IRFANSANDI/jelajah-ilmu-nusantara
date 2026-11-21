import { BadgeItem, PlayerState, ShopItem } from '../types/game';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'topi-rimba',
    name: 'Topi Rimba Penjelajah',
    description: 'Topi petualang berwarna cokelat hangat untuk melindungi dari terik matahari Nusantara.',
    price: 40,
    colorHex: '#B45309',
  },
  {
    id: 'kacamata-pintar',
    name: 'Kacamata Cendekia',
    description: 'Kacamata bingkai biru laut bergaya peneliti cilik yang gemar membaca.',
    price: 65,
    colorHex: '#0284C7',
  },
  {
    id: 'syal-garuda',
    name: 'Syal Merah Putih',
    description: 'Syal kehormatan penjelajah muda yang menjunjung semangat gotong royong.',
    price: 90,
    colorHex: '#DC2626',
  },
  {
    id: 'mahkota-bintang',
    name: 'Mahkota Bintang Emas',
    description: 'Mahkota berkilau bagi siswa yang tekun menaklukkan pos tantangan.',
    price: 140,
    colorHex: '#D97706',
  },
  {
    id: 'sayap-pelangi',
    name: 'Sayap Pelangi Nusantara',
    description: 'Perlengkapan legendaris berwarna pelangi untuk penjelajah tingkat lanjut.',
    price: 200,
    colorHex: '#059669',
  },
];

export const BADGES: BadgeItem[] = [
  {
    id: 'langkah-pertama',
    name: 'Langkah Pertama',
    description: 'Berhasil menyelesaikan misi pertama di dunia petualangan.',
    criteriaText: 'Selesaikan 1 Pos Tantangan',
    accentHex: '#059669',
  },
  {
    id: 'kolektor-koin',
    name: 'Kolektor Koin Ilmu',
    description: 'Mengumpulkan tabungan minimal 100 Koin Ilmu dari petualangan.',
    criteriaText: 'Miliki 100 Koin atau lebih',
    accentHex: '#D97706',
  },
  {
    id: 'bintang-sempurna',
    name: 'Penjawab Sempurna',
    description: 'Meraih 3 bintang penuh pada salah satu Pos Tantangan.',
    criteriaText: 'Raih 3 bintang di 1 Pos',
    accentHex: '#0284C7',
  },
  {
    id: 'penjelajah-tekun',
    name: 'Penjelajah Tekun',
    description: 'Menyelesaikan minimal 6 Pos Tantangan di berbagai dunia.',
    criteriaText: 'Selesaikan 6 Pos Tantangan',
    accentHex: '#4F46E5',
  },
  {
    id: 'juara-dunia',
    name: 'Penakluk Satu Dunia',
    description: 'Menamatkan seluruh 3 Pos Tantangan dalam satu dunia dan membuka Peti Harta.',
    criteriaText: 'Buka 1 Peti Harta Dunia',
    accentHex: '#DC2626',
  },
  {
    id: 'master-nusantara',
    name: 'Duta Ilmu Nusantara',
    description: 'Mencapai Level 4 dan membuktikan penguasaan lintas mata pelajaran.',
    criteriaText: 'Capai Level 4 Pemain',
    accentHex: '#0D9488',
  },
];

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextXp: number;
}

const LEVEL_TITLES = [
  'Penjelajah Pemula',
  'Perintis Cerdas',
  'Pengembara Ilmu',
  'Penjaga Rimba',
  'Cendekia Muda',
  'Ksatria Nusantara',
  'Ahli Kurikulum',
  'Pemandu Bintang',
  'Maha Penjelajah',
  'Legenda Nusantara',
];

export function getLevelInfo(xp: number): LevelInfo {
  // Progressive XP curve: 100 XP per level early, scaling gently
  let level = 1;
  let threshold = 0;
  for (let i = 1; i < LEVEL_TITLES.length; i++) {
    const step = i * 120;
    if (xp >= threshold + step) {
      threshold += step;
      level = i + 1;
    } else {
      return {
        level,
        title: LEVEL_TITLES[level - 1],
        minXp: threshold,
        nextXp: threshold + step,
      };
    }
  }
  return {
    level: LEVEL_TITLES.length,
    title: LEVEL_TITLES[LEVEL_TITLES.length - 1],
    minXp: threshold,
    nextXp: threshold + 1200,
  };
}

export function evaluateUnlockedBadges(state: PlayerState): string[] {
  const earned = new Set<string>(state.unlockedBadges);
  const progressValues = Object.values(state.missionProgress);
  const completedCount = progressValues.filter((p) => p.completed).length;
  const hasThreeStars = progressValues.some((p) => p.stars >= 3);
  const treasureCount = Object.values(state.worldTreasureClaimed).filter(Boolean).length;
  const levelInfo = getLevelInfo(state.xp);

  if (completedCount >= 1) earned.add('langkah-pertama');
  if (state.coins >= 100) earned.add('kolektor-koin');
  if (hasThreeStars) earned.add('bintang-sempurna');
  if (completedCount >= 6) earned.add('penjelajah-tekun');
  if (treasureCount >= 1) earned.add('juara-dunia');
  if (levelInfo.level >= 4) earned.add('master-nusantara');

  return Array.from(earned);
}
