export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type WorldId =
  | 'hutan-angka'
  | 'lembah-kata'
  | 'taman-sains'
  | 'bukit-pancasila'
  | 'pulau-budaya'
  | 'puncak-logika';

export type AvatarId = 'bima' | 'sari';

export type AccessoryId =
  | 'none'
  | 'topi-rimba'
  | 'kacamata-pintar'
  | 'mahkota-bintang'
  | 'syal-garuda'
  | 'sayap-pelangi';

export type ScreenMode = 'home' | 'worlds' | 'play' | 'profile' | 'rewards';

export interface Question {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  pembahasan: string;
  materiTag: string;
}

export interface CheckpointMission {
  id: string;
  order: 1 | 2 | 3;
  title: string;
  objective: string;
  npcLine: string;
  rewardCoins: number;
  rewardXp: number;
  questions: Question[];
}

export interface WorldCurriculum {
  grade: GradeLevel;
  worldId: WorldId;
  faseLabel: string;
  materiTitle: string;
  materiSummary: string;
  materiPoints: string[];
  missions: [CheckpointMission, CheckpointMission, CheckpointMission];
}

export interface WorldThemeConfig {
  id: WorldId;
  name: string;
  subject: string;
  tagline: string;
  description: string;
  accentHex: string;
  surfaceClass: string;
  buttonClass: string;
  textAccentClass: string;
  ringClass: string;
  npcName: string;
  npcRole: string;
  backdropImage: string;
  skyGradient: string;
  groundTint: string;
  landmarkLabel: string;
}

export interface MissionProgress {
  completed: boolean;
  stars: number; // 0..3
  bestScore: number;
  attempts: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  moveSpeed: 'normal' | 'fast';
  showTouchPad: 'auto' | 'always';
}

export interface PlayerState {
  name: string;
  avatar: AvatarId;
  selectedGrade: GradeLevel;
  equippedAccessory: AccessoryId;
  unlockedAccessories: AccessoryId[];
  unlockedBadges: string[];
  coins: number;
  totalScore: number;
  xp: number;
  streakBest: number;
  missionProgress: Record<string, MissionProgress>; // key: `${grade}_${worldId}_${missionOrder}`
  worldTreasureClaimed: Record<string, boolean>; // key: `${grade}_${worldId}`
  settings: GameSettings;
}

export interface ShopItem {
  id: AccessoryId;
  name: string;
  description: string;
  price: number;
  colorHex: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  criteriaText: string;
  accentHex: string;
}
