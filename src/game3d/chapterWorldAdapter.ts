import { getQuestionHints, SubjectChapter } from './curriculum/types';
import { WorldTheme3D } from './curriculumData';
import { GradeNumber, SUBJECTS, SubjectId } from './inventoryData';
import { NpcDefinition } from './worldData';

export type Chapter3DModelKind =
  | 'alphabet-block'
  | 'number-totem'
  | 'fruit-basket'
  | 'word-crate'
  | 'fraction-table'
  | 'force-crate'
  | 'organ-pod'
  | 'circuit-switch'
  | 'planet-orb'
  | 'foodchain-pillar'
  | 'book-pedestal'
  | 'royal-gate-lock';

export type Chapter3DActionType = 'collect' | 'activate' | 'push';

export interface Chapter3DStation {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  z: number;
  modelKind: Chapter3DModelKind;
  colorHex: number;
  actionType: Chapter3DActionType;
  targetOffsetX?: number;
  targetOffsetZ?: number;
  completionMessage: string;
}

export interface Chapter3DMissionConfig {
  chapterId: string;
  chapterNumber: number;
  grade: GradeNumber;
  subjectId: SubjectId;
  subjectName: string;
  accentHex: string;
  zoneTitle: string;
  missionType: 'collect-labeled' | 'activate-nodes' | 'push-box';
  missionVerb: string;
  objectiveBanner: string;
  mentorIntro: string;
  spawnPoint: { x: number; z: number; yaw: number };
  archPos: { x: number; z: number; rotY: number };
  stations: Chapter3DStation[];
  chapterNpcsOverrides: NpcDefinition[];
}

interface SlotCoord {
  x: number;
  z: number;
}

// 4 verified dry, walkable island regions so each chapter explores a distinct zone
const ZONE_SPAWNS: Array<{
  spawn: { x: number; z: number; yaw: number };
  arch: { x: number; z: number; rotY: number };
  slots: SlotCoord[];
}> = [
  {
    // Zona A: Plaza Depan & Jembatan Barat
    spawn: { x: -13.5, z: 4.5, yaw: Math.PI * 0.45 },
    arch: { x: -4.2, z: 4.6, rotY: 0.65 },
    slots: [
      { x: -7.2, z: 0.4 },
      { x: -10.2, z: -9.5 },
      { x: -23.0, z: -2.2 },
      { x: 17.2, z: 5.2 },
      { x: 24.2, z: -9.5 },
    ],
  },
  {
    // Zona B: Lembah Utara & Padang Hijau
    spawn: { x: -12.0, z: -13.5, yaw: 0.15 },
    arch: { x: -12.0, z: -8.5, rotY: 0.05 },
    slots: [
      { x: -10.2, z: -19.5 },
      { x: -21.5, z: -14.5 },
      { x: -4.5, z: -22.0 },
      { x: -23.0, z: -2.2 },
      { x: -7.2, z: 0.4 },
    ],
  },
  {
    // Zona C: Seberang Jembatan & Taman Timur
    spawn: { x: 15.8, z: 2.2, yaw: -1.1 },
    arch: { x: 14.2, z: 1.5, rotY: 1.52 },
    slots: [
      { x: 17.2, z: 5.2 },
      { x: 24.2, z: -9.5 },
      { x: 27.0, z: 6.5 },
      { x: 22.0, z: -2.0 },
      { x: -7.2, z: 0.4 },
    ],
  },
  {
    // Zona D: Lereng Bukit Ilmu Timur Laut
    spawn: { x: 22.2, z: -15.5, yaw: 0.75 },
    arch: { x: 24.5, z: -12.0, rotY: -0.4 },
    slots: [
      { x: 24.2, z: -9.5 },
      { x: 28.0, z: -14.5 },
      { x: 31.0, z: -24.0 },
      { x: 17.2, z: 5.2 },
      { x: -10.2, z: -9.5 },
    ],
  },
];

const PUSH_SLOTS: Array<{ x: number; z: number; dx: number; dz: number }> = [
  { x: -8.0, z: -5.5, dx: 3.6, dz: 0 },
  { x: -22.5, z: -2.0, dx: 0, dz: 3.6 },
  { x: 18.2, z: 5.5, dx: 3.6, dz: 0 },
];

const GRADE1_LAB_ZONE: {
  spawn: { x: number; z: number; yaw: number };
  arch: { x: number; z: number; rotY: number };
  slots: SlotCoord[];
} = {
  spawn: { x: 24.0, z: 22.0, yaw: -1.57 },
  arch: { x: 25.0, z: 18.8, rotY: 0.2 },
  slots: [
    { x: 21.5, z: 24.8 },
    { x: 24.0, z: 26.2 },
    { x: 27.2, z: 25.8 },
    { x: 22.0, z: 18.8 },
    { x: 20.8, z: 21.6 },
  ],
};

// 8 verified dry, walkable Desa Ceria regions for Grade 2 (East-West river at z ≈ -2)
const GRADE2_ZONE_SPAWNS: Array<{
  spawn: { x: number; z: number; yaw: number };
  arch: { x: number; z: number; rotY: number };
  slots: SlotCoord[];
}> = [
  {
    // 0 -> Bab 1: Desa Bilangan sampai 100
    spawn: { x: -10.5, z: 13.5, yaw: Math.PI * 0.5 },
    arch: { x: -9.5, z: 16.5, rotY: 0 },
    slots: [
      { x: -14.0, z: 14.2 },
      { x: -19.5, z: 13.5 },
      { x: -18.5, z: 17.5 },
      { x: -12.5, z: 18.2 },
      { x: -7.5, z: 15.0 },
    ],
  },
  {
    // 1 -> Bab 2: Kebun Nilai Tempat
    spawn: { x: 8.8, z: 13.5, yaw: -Math.PI * 0.5 },
    arch: { x: 9.2, z: 16.2, rotY: 0 },
    slots: [
      { x: 9.5, z: 11.2 },
      { x: 14.2, z: 11.8 },
      { x: 14.2, z: 15.6 },
      { x: 19.2, z: 13.5 },
      { x: 19.5, z: 18.0 },
    ],
  },
  {
    // 2 -> Bab 3: Pasar Penjumlahan
    spawn: { x: 0.0, z: 12.8, yaw: -Math.PI * 0.4 },
    arch: { x: 1.8, z: 16.2, rotY: 0 },
    slots: [
      { x: 2.5, z: 11.6 },
      { x: 5.8, z: 12.2 },
      { x: 8.2, z: 15.2 },
      { x: 3.2, z: 18.5 },
      { x: -2.8, z: 16.0 },
    ],
  },
  {
    // 3 -> Bab 4: Gudang Pengurangan
    spawn: { x: -11.5, z: -15.8, yaw: Math.PI },
    arch: { x: -9.0, z: -13.5, rotY: 0 },
    slots: [
      { x: -15.2, z: -17.5 },
      { x: -10.5, z: -17.5 },
      { x: -6.5, z: -16.5 },
      { x: -16.5, z: -14.2 },
      { x: -6.0, z: -21.0 },
    ],
  },
  {
    // 4 -> Bab 5: Peternakan Perkalian
    spawn: { x: -21.0, z: -15.5, yaw: Math.PI },
    arch: { x: -18.5, z: -13.5, rotY: 0 },
    slots: [
      { x: -26.5, z: -16.5 },
      { x: -22.5, z: -17.2 },
      { x: -17.5, z: -17.0 },
      { x: -26.0, z: -13.5 },
      { x: -20.5, z: -26.5 },
    ],
  },
  {
    // 5 -> Bab 6: Dapur Pembagian
    spawn: { x: 11.5, z: -15.5, yaw: Math.PI },
    arch: { x: 8.2, z: -13.5, rotY: 0 },
    slots: [
      { x: 8.5, z: -17.2 },
      { x: 11.8, z: -17.5 },
      { x: 14.8, z: -17.2 },
      { x: 16.5, z: -20.5 },
      { x: 6.5, z: -20.5 },
    ],
  },
  {
    // 6 -> Bab 7: Bengkel Pengukuran
    spawn: { x: 23.5, z: -15.2, yaw: Math.PI },
    arch: { x: 19.5, z: -13.5, rotY: 0 },
    slots: [
      { x: 20.5, z: -16.8 },
      { x: 24.5, z: -16.2 },
      { x: 27.8, z: -16.8 },
      { x: 21.5, z: -13.5 },
      { x: 27.2, z: -25.8 },
    ],
  },
  {
    // 7 -> Bab 8: Taman Bangun Datar dan Ruang
    spawn: { x: 0.0, z: -24.5, yaw: Math.PI },
    arch: { x: 0.0, z: -21.5, rotY: 0 },
    slots: [
      { x: -4.8, z: -28.0 },
      { x: 4.8, z: -28.0 },
      { x: -6.2, z: -33.2 },
      { x: 6.2, z: -33.2 },
      { x: 0.0, z: -29.0 },
    ],
  },
];

// 8 verified dry, walkable Hutan Misteri regions for Grade 3 (river at x ≈ 2)
const GRADE3_ZONE_SPAWNS: Array<{
  spawn: { x: number; z: number; yaw: number };
  arch: { x: number; z: number; rotY: number };
  slots: SlotCoord[];
}> = [
  {
    // 0 -> Bab 1: Desa Kecil di Tepi Hutan
    spawn: { x: -15.5, z: 14.0, yaw: 0.4 },
    arch: { x: -16.0, z: 16.5, rotY: 0 },
    slots: [
      { x: -11.5, z: 14.5 },
      { x: -17.0, z: 7.0 },
      { x: -11.0, z: 10.0 },
      { x: -20.5, z: 16.0 },
      { x: -15.5, z: 20.5 },
    ],
  },
  {
    // 1 -> Bab 2: Sungai & Jembatan Kayu
    spawn: { x: -5.4, z: 0.0, yaw: Math.PI * 0.5 },
    arch: { x: -7.5, z: 0.0, rotY: Math.PI * 0.5 },
    slots: [
      { x: -6.5, z: 3.5 },
      { x: -6.5, z: -3.5 },
      { x: 10.5, z: 3.0 },
      { x: 10.5, z: -3.0 },
      { x: -10.5, z: 0.0 },
    ],
  },
  {
    // 2 -> Bab 3: Hutan Tropis & Ekosistem
    spawn: { x: -18.0, z: -12.0, yaw: 0.2 },
    arch: { x: -18.0, z: -8.5, rotY: 0 },
    slots: [
      { x: -14.0, z: -12.0 },
      { x: -22.0, z: -11.5 },
      { x: -14.5, z: -16.5 },
      { x: -21.5, z: -16.5 },
      { x: -18.0, z: -19.0 },
    ],
  },
  {
    // 3 -> Bab 4: Kebun & Area Pertanian
    spawn: { x: -23.5, z: 23.5, yaw: -0.6 },
    arch: { x: -21.5, z: 20.0, rotY: 0 },
    slots: [
      { x: -20.0, z: 24.5 },
      { x: -27.5, z: 22.0 },
      { x: -24.0, z: 18.5 },
      { x: -18.0, z: 22.0 },
      { x: -26.5, z: 27.0 },
    ],
  },
  {
    // 4 -> Bab 5: Air Terjun & Siklus Air
    spawn: { x: 19.8, z: -15.2, yaw: 0.65 },
    arch: { x: 19.0, z: -11.5, rotY: 0 },
    slots: [
      { x: 16.5, z: -15.0 },
      { x: 22.5, z: -13.5 },
      { x: 17.5, z: -19.5 },
      { x: 22.0, z: -19.0 },
      { x: 15.0, z: -11.0 },
    ],
  },
  {
    // 5 -> Bab 6: Gua Misterius
    spawn: { x: -22.0, z: -26.5, yaw: 0.1 },
    arch: { x: -22.0, z: -23.0, rotY: 0 },
    slots: [
      { x: -18.0, z: -26.0 },
      { x: -26.0, z: -26.0 },
      { x: -18.5, z: -22.0 },
      { x: -25.5, z: -22.0 },
      { x: -22.0, z: -20.0 },
    ],
  },
  {
    // 6 -> Bab 7: Laboratorium Alam
    spawn: { x: 18.0, z: 12.0, yaw: -0.4 },
    arch: { x: 18.0, z: 8.5, rotY: 0 },
    slots: [
      { x: 14.0, z: 12.0 },
      { x: 22.5, z: 12.0 },
      { x: 15.0, z: 16.5 },
      { x: 21.5, z: 16.5 },
      { x: 18.0, z: 17.5 },
    ],
  },
  {
    // 7 -> Bab 8: Kuil Pengetahuan
    spawn: { x: 22.0, z: 24.0, yaw: 0.0 },
    arch: { x: 22.0, z: 20.5, rotY: 0 },
    slots: [
      { x: 17.5, z: 24.0 },
      { x: 26.5, z: 24.0 },
      { x: 18.5, z: 20.0 },
      { x: 25.5, z: 20.0 },
      { x: 22.0, z: 18.5 },
    ],
  },
];

// 8 verified dry, walkable Pulau Teka-Teki regions for Grade 4 (channel at x ≈ 4)
const GRADE4_ZONE_SPAWNS: Array<{
  spawn: { x: number; z: number; yaw: number };
  arch: { x: number; z: number; rotY: number };
  slots: SlotCoord[];
}> = [
  {
    // 0 -> Bab 1: Pulau Utama
    spawn: { x: -14.0, z: 10.0, yaw: 0.3 },
    arch: { x: -14.0, z: 6.5, rotY: 0 },
    slots: [
      { x: -10.5, z: 10.5 },
      { x: -17.5, z: 9.5 },
      { x: -11.0, z: 14.0 },
      { x: -16.5, z: 5.5 },
      { x: -9.5, z: 6.0 },
    ],
  },
  {
    // 1 -> Bab 2: Labirin Angka
    spawn: { x: -22.0, z: -8.5, yaw: Math.PI },
    arch: { x: -22.0, z: -6.5, rotY: 0 },
    slots: [
      { x: -16.8, z: -13.0 },
      { x: -16.8, z: -21.2 },
      { x: -26.0, z: -22.4 },
      { x: -22.0, z: -22.5 },
      { x: -25.0, z: -13.0 },
    ],
  },
  {
    // 2 -> Bab 3: Jembatan Mekanik
    spawn: { x: -5.5, z: 0.0, yaw: Math.PI * 0.5 },
    arch: { x: -8.5, z: 0.0, rotY: Math.PI * 0.5 },
    slots: [
      { x: -6.5, z: 3.5 },
      { x: -6.5, z: -3.5 },
      { x: -10.5, z: 3.5 },
      { x: -10.5, z: -3.5 },
      { x: -4.0, z: -3.0 },
    ],
  },
  {
    // 3 -> Bab 4: Hutan Pola & Bentuk
    spawn: { x: -24.0, z: 20.5, yaw: 0.0 },
    arch: { x: -24.0, z: 17.5, rotY: 0 },
    slots: [
      { x: -27.5, z: 22.0 },
      { x: -20.5, z: 22.0 },
      { x: -27.5, z: 27.5 },
      { x: -20.5, z: 27.5 },
      { x: -24.0, z: 24.5 },
    ],
  },
  {
    // 4 -> Bab 5: Gua Kristal (safe West/East positions)
    spawn: { x: -12.0, z: 11.0, yaw: 0.2 },
    arch: { x: -12.0, z: 7.5, rotY: 0 },
    slots: [
      { x: -15.5, z: 11.5 },
      { x: -8.5, z: 11.5 },
      { x: -14.0, z: 15.5 },
      { x: -10.0, z: 15.5 },
      { x: -12.0, z: 3.5 },
    ],
  },
  {
    // 5 -> Bab 6: Menara Logika (Eastern half, post-bridge)
    spawn: { x: 24.0, z: 3.5, yaw: Math.PI },
    arch: { x: 20.5, z: 3.5, rotY: 0 },
    slots: [
      { x: 21.0, z: 0.0 },
      { x: 28.5, z: 1.5 },
      { x: 21.5, z: -5.5 },
      { x: 28.0, z: -5.5 },
      { x: 17.0, z: 2.0 },
    ],
  },
  {
    // 6 -> Bab 7: Kuil Teka-Teki
    spawn: { x: 18.0, z: -19.5, yaw: Math.PI },
    arch: { x: 18.0, z: -16.5, rotY: 0 },
    slots: [
      { x: 14.0, z: -20.5 },
      { x: 22.0, z: -20.5 },
      { x: 14.5, z: -24.5 },
      { x: 21.5, z: -24.5 },
      { x: 18.0, z: -14.5 },
    ],
  },
  {
    // 7 -> Bab 8: Istana Pengetahuan
    spawn: { x: 32.0, z: -21.0, yaw: Math.PI },
    arch: { x: 29.0, z: -19.0, rotY: 0 },
    slots: [
      { x: 28.5, z: -22.5 },
      { x: 35.5, z: -22.5 },
      { x: 28.5, z: -27.0 },
      { x: 35.5, z: -27.0 },
      { x: 32.0, z: -18.5 },
    ],
  },
];

const GRADE4_PUSH_SLOTS: Array<{ x: number; z: number; dx: number; dz: number }> = [
  { x: -15.5, z: 7.5, dx: 3.5, dz: 0 },
  { x: -11.5, z: 12.5, dx: 0, dz: 3.5 },
  { x: -17.5, z: 2.5, dx: 3.5, dz: 0 },
];

function hexStringToNumber(hex: string): number {
  const clean = hex.replace('#', '');
  const parsed = Number.parseInt(clean, 16);
  return Number.isNaN(parsed) ? 0x0284c7 : parsed;
}

function getZonesForGrade(grade: GradeNumber) {
  if (grade === 2) return GRADE2_ZONE_SPAWNS;
  if (grade === 3) return GRADE3_ZONE_SPAWNS;
  if (grade === 4) return GRADE4_ZONE_SPAWNS;
  return ZONE_SPAWNS;
}

function isGrade1LabChapter(chapterId: string): boolean {
  return chapterId === 'g1-mat-6' || chapterId === 'g1-ipas-4' || chapterId === 'g1-ipas-5';
}

function buildStationsFromSpecs(
  chapterId: string,
  chapterNumber: number,
  grade: GradeNumber,
  specs: Array<{
    label: string;
    sublabel: string;
    modelKind: Chapter3DModelKind;
    colorHex: number;
    actionType: Chapter3DActionType;
    completionMessage: string;
  }>
): Chapter3DStation[] {
  const zones = getZonesForGrade(grade);
  const zone =
    grade === 1 && isGrade1LabChapter(chapterId)
      ? GRADE1_LAB_ZONE
      : zones[(Math.max(1, chapterNumber) - 1) % zones.length];
  const pushList = grade === 4 ? GRADE4_PUSH_SLOTS : PUSH_SLOTS;
  return specs.map((spec, idx) => {
    if (spec.actionType === 'push') {
      const pSlot = pushList[idx % pushList.length];
      return {
        id: `${chapterId}-st-${idx + 1}`,
        label: spec.label,
        sublabel: spec.sublabel,
        x: pSlot.x,
        z: pSlot.z,
        targetOffsetX: pSlot.dx,
        targetOffsetZ: pSlot.dz,
        modelKind: spec.modelKind,
        colorHex: spec.colorHex,
        actionType: 'push',
        completionMessage: spec.completionMessage,
      };
    }
    const slot = zone.slots[idx % zone.slots.length];
    return {
      id: `${chapterId}-st-${idx + 1}`,
      label: spec.label,
      sublabel: spec.sublabel,
      x: slot.x,
      z: slot.z,
      modelKind: spec.modelKind,
      colorHex: spec.colorHex,
      actionType: spec.actionType,
      completionMessage: spec.completionMessage,
    };
  });
}

function buildScenarioSpec(chapter: SubjectChapter, subjectColor: number): {
  zoneTitle: string;
  missionType: 'collect-labeled' | 'activate-nodes' | 'push-box';
  missionVerb: string;
  objectiveBanner: string;
  specs: Array<{
    label: string;
    sublabel: string;
    modelKind: Chapter3DModelKind;
    colorHex: number;
    actionType: Chapter3DActionType;
    completionMessage: string;
  }>;
} {
  const id = chapter.id;
  const titleLower = chapter.title.toLowerCase();

  // ---------------- KELAS 1 SPECIFIC SCENARIOS ----------------
  if (id === 'g1-bi-1' || (chapter.grade === 1 && titleLower.includes('huruf a sampai z'))) {
    return {
      zoneTitle: 'Taman Huruf A–Z',
      missionType: 'collect-labeled',
      missionVerb: 'Kumpulkan Balok Huruf',
      objectiveBanner: 'Jelajahi Taman Huruf dan kumpulkan 4 balok huruf vokal & konsonan.',
      specs: [
        { label: 'Huruf A', sublabel: 'Vokal: Apel', modelKind: 'alphabet-block', colorHex: 0xef4444, actionType: 'collect', completionMessage: 'Huruf A (Vokal) ditemukan! Contoh kata: Apel, Ayam.' },
        { label: 'Huruf I', sublabel: 'Vokal: Ikan', modelKind: 'alphabet-block', colorHex: 0x0284c7, actionType: 'collect', completionMessage: 'Huruf I (Vokal) ditemukan! Contoh kata: Ikan, Ibu.' },
        { label: 'Huruf B', sublabel: 'Konsonan: Bola', modelKind: 'alphabet-block', colorHex: 0x10b981, actionType: 'collect', completionMessage: 'Huruf B (Konsonan) ditemukan! Contoh kata: Bola, Buku.' },
        { label: 'Huruf U', sublabel: 'Vokal: Ular', modelKind: 'alphabet-block', colorHex: 0xf59e0b, actionType: 'collect', completionMessage: 'Huruf U (Vokal) ditemukan! Contoh kata: Ubi, Ular.' },
      ],
    };
  }

  if (id === 'g1-bi-2') {
    return {
      zoneTitle: 'Pos Bunyi & Suku Kata',
      missionType: 'collect-labeled',
      missionVerb: 'Tangkap Suku Kata Awal',
      objectiveBanner: 'Kumpulkan 4 balok suku kata BA-BI-BU-BE-BO untuk membentuk bunyi awal kata.',
      specs: [
        { label: 'Suku BA', sublabel: 'Ba-ju, Ba-tu', modelKind: 'alphabet-block', colorHex: 0x0284c7, actionType: 'collect', completionMessage: 'BA: b + a berbunyi ba seperti baju dan batu!' },
        { label: 'Suku BI', sublabel: 'Bi-ru, Bi-ji', modelKind: 'alphabet-block', colorHex: 0x10b981, actionType: 'collect', completionMessage: 'BI: b + i berbunyi bi seperti biru dan biji!' },
        { label: 'Suku BU', sublabel: 'Bu-ku, Bu-nga', modelKind: 'alphabet-block', colorHex: 0xf59e0b, actionType: 'collect', completionMessage: 'BU: b + u berbunyi bu seperti buku dan bunga!' },
        { label: 'Suku BO', sublabel: 'Bo-la, Bo-nek', modelKind: 'alphabet-block', colorHex: 0xef4444, actionType: 'collect', completionMessage: 'BO: b + o berbunyi bo seperti bola!' },
      ],
    };
  }

  if (id === 'g1-bi-3' || id === 'g1-bi-5') {
    const isBenda = id === 'g1-bi-5';
    return {
      zoneTitle: isBenda ? 'Inventaris Nama Benda Sekitar' : 'Taman Rangkai Kata Sederhana',
      missionType: 'collect-labeled',
      missionVerb: isBenda ? 'Kenali Nama Benda 3D' : 'Rangkai Dua Suku Kata',
      objectiveBanner: isBenda
        ? 'Temukan dan baca nama benda nyata di rumah dan kelas: Meja, Kursi, Lampu, Topi.'
        : 'Baca gabungan suku kata dan kumpulkan 4 kata bermakna!',
      specs: [
        { label: isBenda ? 'ME - JA' : 'BO - LA', sublabel: isBenda ? 'Benda Kelas' : 'Kata: BOLA', modelKind: 'word-crate', colorHex: 0x0284c7, actionType: 'collect', completionMessage: isBenda ? 'Meja berguna untuk meletakkan buku dan menulis rapi.' : 'Suku kata BO + LA membentuk kata BOLA!' },
        { label: isBenda ? 'KUR - SI' : 'BU - KU', sublabel: isBenda ? 'Tempat Duduk' : 'Kata: BUKU', modelKind: 'word-crate', colorHex: 0x059669, actionType: 'collect', completionMessage: isBenda ? 'Kursi adalah benda keras untuk duduk tegak.' : 'Suku kata BU + KU membentuk kata BUKU!' },
        { label: isBenda ? 'LAM - PU' : 'MA - TA', sublabel: isBenda ? 'Penerang Ruangan' : 'Kata: MATA', modelKind: 'word-crate', colorHex: 0xd97706, actionType: 'collect', completionMessage: isBenda ? 'Lampu menerangi ruangan saat membaca.' : 'Suku kata MA + TA membentuk kata MATA!' },
        { label: isBenda ? 'TO - PI' : 'SA - PI', sublabel: isBenda ? 'Pelindung Kepala' : 'Kata: SAPI', modelKind: 'word-crate', colorHex: 0x7c3aed, actionType: 'collect', completionMessage: isBenda ? 'Topi melindungi kepala dari panas matahari.' : 'Suku kata SA + PI membentuk kata SAPI!' },
      ],
    };
  }

  if (id === 'g1-bi-4' || id === 'g1-bi-6' || id === 'g1-bi-7' || id === 'g1-bi-8' || (chapter.grade === 1 && chapter.subjectId === 'bahasa-indonesia')) {
    return {
      zoneTitle: id === 'g1-bi-6' ? 'Bengkel Tulis & Huruf Kapital' : id === 'g1-bi-7' ? 'Panggung Cerita & Menyimak' : 'Papan Kalimat Pendek Desa',
      missionType: 'collect-labeled',
      missionVerb: id === 'g1-bi-7' ? 'Simak & Ceritakan Kembali' : 'Susun Kalimat Sederhana',
      objectiveBanner: chapter.tantanganPetualangan.instruction,
      specs: [
        { label: 'S-P-O Jelas', sublabel: 'Ibu beli roti', modelKind: 'book-pedestal', colorHex: 0x0284c7, actionType: 'collect', completionMessage: 'Kalimat pendek memiliki pelaku (Ibu), kegiatan (beli), dan benda (roti).' },
        { label: 'Huruf Kapital', sublabel: 'Awal Kalimat & Nama', modelKind: 'alphabet-block', colorHex: 0x10b981, actionType: 'collect', completionMessage: 'Awal kalimat dan nama orang selalu ditulis dengan huruf kapital!' },
        { label: 'Tanda Baca', sublabel: 'Titik (.) & Tanya (?)', modelKind: 'word-crate', colorHex: 0xf59e0b, actionType: 'collect', completionMessage: 'Kalimat berita diakhiri titik (.) sedangkan kalimat tanya diakhiri tanda tanya (?)!' },
        { label: 'Cerita Runtut', sublabel: 'Awal · Tengah · Akhir', modelKind: 'book-pedestal', colorHex: 0x7c3aed, actionType: 'collect', completionMessage: 'Bagus! Kamu siap membaca dan menulis kalimat pendek dengan rapi.' },
      ],
    };
  }

  if (id === 'g1-mat-1' || id === 'g1-mat-2' || id === 'g1-mat-3') {
    const is20 = id === 'g1-mat-3';
    return {
      zoneTitle: is20 ? 'Tangga Bilangan 11–20' : id === 'g1-mat-2' ? 'Kebun Hitung Banyak Benda' : 'Taman Angka 1–10',
      missionType: 'collect-labeled',
      missionVerb: is20 ? 'Jelajahi Bilangan 11–20' : 'Hitung & Kumpulkan Totem Angka',
      objectiveBanner: is20
        ? 'Kunjungi 4 pos tangga bilangan 11 hingga 20 dan kenali puluhan serta satuannya.'
        : 'Kunjungi Taman Angka dan hitung jumlah benda pada setiap totem berhitung.',
      specs: [
        { label: is20 ? '12 = 10 + 2' : 'Angka 3', sublabel: is20 ? 'Dua Belas' : '3 Balok Kayu', modelKind: 'number-totem', colorHex: 0x0284c7, actionType: 'collect', completionMessage: is20 ? '12 terdiri dari 1 puluhan (10) dan 2 satuan!' : 'Benar! Terdapat 3 balok pada totem angka 3.' },
        { label: is20 ? '15 = 10 + 5' : 'Angka 5', sublabel: is20 ? 'Lima Belas' : '5 Buah Jeruk', modelKind: 'number-totem', colorHex: 0xf59e0b, actionType: 'collect', completionMessage: is20 ? '15 adalah 1 puluhan ditambah 5 satuan!' : 'Hebat! Kamu membilang hingga angka 5 dengan tepat.' },
        { label: is20 ? '18 = 10 + 8' : 'Angka 8', sublabel: is20 ? 'Delapan Belas' : '8 Biji Kelereng', modelKind: 'number-totem', colorHex: 0x10b981, actionType: 'collect', completionMessage: is20 ? '18 lebih besar dari 15 dan lebih kecil dari 20!' : 'Bagus! Bilangan 8 lebih besar dari 5.' },
        { label: is20 ? '20 = 2 Puluhan' : 'Angka 10', sublabel: is20 ? 'Dua Puluh' : '10 Bola Warna', modelKind: 'number-totem', colorHex: 0xec4899, actionType: 'collect', completionMessage: is20 ? 'Dua puluh berisi tepat 2 kelompok sepuluh!' : 'Mantap! Sepuluh adalah 1 puluhan sempurna.' },
      ],
    };
  }

  if (id === 'g1-mat-4' || id === 'g1-mat-5') {
    const isMinus = id === 'g1-mat-5';
    return {
      zoneTitle: isMinus ? 'Kios Buah Pengurangan' : 'Pasar Buah Penjumlahan',
      missionType: 'activate-nodes',
      missionVerb: isMinus ? 'Hitung Sisa Buah Kios' : 'Bantu Pedagang Jumlahkan Buah',
      objectiveBanner: isMinus
        ? 'Datangi 4 keranjang buah pedagang dan periksa sisa buahnya dengan [E].'
        : 'Bantu pedagang pasar menjumlahkan 4 keranjang buah Nusantara dengan [E].',
      specs: [
        { label: isMinus ? '8 - 3 = 5' : '3 + 2 = 5', sublabel: 'Keranjang Apel', modelKind: 'fruit-basket', colorHex: 0xef4444, actionType: 'activate', completionMessage: isMinus ? '8 apel dikurangi 3 apel menyisakan 5 apel!' : '3 apel merah + 2 apel hijau = 5 apel!' },
        { label: isMinus ? '10 - 4 = 6' : '4 + 5 = 9', sublabel: 'Keranjang Jeruk', modelKind: 'fruit-basket', colorHex: 0xf97316, actionType: 'activate', completionMessage: isMinus ? '10 jeruk dikurangi 4 jeruk = 6 jeruk!' : '4 jeruk + 5 jeruk = 9 jeruk!' },
        { label: isMinus ? '12 - 5 = 7' : '6 + 4 = 10', sublabel: 'Keranjang Mangga', modelKind: 'fruit-basket', colorHex: 0x22c55e, actionType: 'activate', completionMessage: isMinus ? '12 mangga dikurangi 5 mangga = 7 mangga!' : '6 mangga + 4 mangga = 10 mangga!' },
        { label: isMinus ? '15 - 6 = 9' : '7 + 6 = 13', sublabel: 'Keranjang Pisang', modelKind: 'fruit-basket', colorHex: 0xeab308, actionType: 'activate', completionMessage: isMinus ? '15 pisang dikurangi 6 pisang = 9 pisang!' : '7 pisang + 6 pisang = 13 pisang!' },
      ],
    };
  }

  if (id === 'g1-mat-6' || id === 'g1-mat-7' || id === 'g1-mat-8') {
    if (id === 'g1-mat-6') {
      return {
        zoneTitle: 'Laboratorium Geometri & Kubus',
        missionType: 'activate-nodes',
        missionVerb: 'Amati Bangun Datar & Ruang',
        objectiveBanner: 'Periksa 4 model bangun geometri di sekitar Laboratorium Ilmuwan Muda!',
        specs: [
          { label: 'Segitiga (3 Sisi)', sublabel: 'Atap Rumah', modelKind: 'force-crate', colorHex: 0xef4444, actionType: 'activate', completionMessage: 'Segitiga memiliki 3 sisi dan 3 titik sudut!' },
          { label: 'Segiempat', sublabel: 'Papan & Buku', modelKind: 'force-crate', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Persegi memiliki 4 sisi yang sama panjang!' },
          { label: 'Lingkaran', sublabel: 'Roda & Jam', modelKind: 'planet-orb', colorHex: 0xf59e0b, actionType: 'activate', completionMessage: 'Lingkaran berbentuk bulat mulus tanpa sudut tajam.' },
          { label: 'Kubus (6 Sisi)', sublabel: 'Bangun Ruang Dadu', modelKind: 'force-crate', colorHex: 0x10b981, actionType: 'activate', completionMessage: 'Kubus mempunyai 6 sisi persegi yang sama luas!' },
        ],
      };
    }
    if (id === 'g1-mat-7') {
      return {
        zoneTitle: 'Meja Ukur Panjang & Berat',
        missionType: 'activate-nodes',
        missionVerb: 'Bandingkan Panjang & Berat',
        objectiveBanner: 'Periksa 4 pos perbandingan panjang (panjang-pendek) dan berat (berat-ringan) benda.',
        specs: [
          { label: 'Pensil & Penggaris', sublabel: 'Lebih Panjang', modelKind: 'number-totem', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Mengukur panjang tidak baku dapat memakai jengkal atau langkah kaki!' },
          { label: 'Semangka vs Apel', sublabel: 'Lebih Berat', modelKind: 'fruit-basket', colorHex: 0x16a34a, actionType: 'activate', completionMessage: 'Buah semangka lebih berat daripada apel dan kapas!' },
          { label: 'Pohon Tinggi', sublabel: 'Tinggi vs Rendah', modelKind: 'foodchain-pillar', colorHex: 0xd97706, actionType: 'activate', completionMessage: 'Membandingkan tinggi benda dari bagian pangkal yang sejajar.' },
          { label: 'Neraca Timbang', sublabel: 'Sama Berat', modelKind: 'number-totem', colorHex: 0x7c3aed, actionType: 'activate', completionMessage: 'Neraca sejajar menunjukkan berat benda di kiri dan kanan sama!' },
        ],
      };
    }
    return {
      zoneTitle: 'Kios Jam Istana & Koin Rupiah',
      missionType: 'activate-nodes',
      missionVerb: 'Baca Jam & Hitung Rupiah',
      objectiveBanner: 'Periksa jam dinding tepat dan kelompok koin/uang kertas Rupiah di Pasar Sahabat.',
      specs: [
        { label: 'Pukul 07.00', sublabel: 'Berangkat Sekolah', modelKind: 'planet-orb', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Jarum pendek di angka 7 dan jarum panjang di 12 dibaca pukul tujuh tepat!' },
        { label: 'Koin Rp500', sublabel: 'Dua Keping = Rp1.000', modelKind: 'number-totem', colorHex: 0xf59e0b, actionType: 'activate', completionMessage: 'Rp500 + Rp500 bernilai sama dengan Rp1.000!' },
        { label: 'Uang Rp2.000', sublabel: 'Belanja Buah Pasar', modelKind: 'fruit-basket', colorHex: 0x10b981, actionType: 'activate', completionMessage: 'Uang Rp2.000 bisa ditukar 2 lembar Rp1.000!' },
        { label: 'Menabung Rutin', sublabel: 'Celengan Sekolah', modelKind: 'book-pedestal', colorHex: 0x7c3aed, actionType: 'activate', completionMessage: 'Menyisihkan sebagian uang saku melatih sikap hemat sejak kecil!' },
      ],
    };
  }

  if (chapter.grade === 1 && chapter.subjectId === 'ipas') {
    if (id === 'g1-ipas-4' || id === 'g1-ipas-5') {
      const isLight = id === 'g1-ipas-5';
      return {
        zoneTitle: isLight ? 'Lab Cahaya & Hemat Energi' : 'Meja Sains Benda Padat & Cair',
        missionType: 'activate-nodes',
        missionVerb: isLight ? 'Uji Cahaya & Listrik' : 'Uji Sifat Benda 3D',
        objectiveBanner: isLight
          ? 'Amati sumber cahaya matahari, bayangan, dan kebiasaan hemat listrik di Laboratorium Ilmuwan Muda!'
          : 'Amati perbedaan bentuk dan aliran benda padat serta cair di meja eksperimen!',
        specs: [
          { label: isLight ? 'Sinar Matahari' : 'Balok Kayu (Padat)', sublabel: isLight ? 'Sumber Cahaya Alami' : 'Bentuk Tetap', modelKind: isLight ? 'planet-orb' : 'force-crate', colorHex: 0xf59e0b, actionType: 'activate', completionMessage: isLight ? 'Matahari memberi cahaya terang dan kehangatan untuk seluruh makhluk hidup!' : 'Benda padat seperti balok kayu bentuknya tetap meski dipindah wadahnya.' },
          { label: isLight ? 'Bayangan Gelap' : 'Air Gelas (Cair)', sublabel: isLight ? 'Cahaya Terhalang' : 'Ikut Wadahnya', modelKind: isLight ? 'organ-pod' : 'organ-pod', colorHex: 0x0284c7, actionType: 'activate', completionMessage: isLight ? 'Bayangan muncul saat benda padat menghalangi arah datangnya cahaya.' : 'Air benda cair selalu mengalir ke tempat lebih rendah dan mengikuti bentuk wadah!' },
          { label: isLight ? 'Lampu Hemat' : 'Bola & Kertas', sublabel: isLight ? 'Matikan Siang Hari' : 'Kasar vs Halus', modelKind: 'circuit-switch', colorHex: 0x10b981, actionType: 'activate', completionMessage: isLight ? 'Matikan lampu dan televisi jika sudah selesai dipakai untuk menghemat listrik!' : 'Permukaan benda ada yang halus seperti kertas dan kasar seperti kulit kayu.' },
          { label: isLight ? 'Buka Jendela Pagi' : 'Gelas Ukur Lab', sublabel: isLight ? 'Cahaya Hemat Listrik' : 'Uji Tenggelam-Apung', modelKind: 'circuit-switch', colorHex: 0x7c3aed, actionType: 'activate', completionMessage: isLight ? 'Membuka jendela siang hari membuat ruangan terang alami tanpa boros listrik!' : 'Daun kering dan gabus mengapung di air, sedangkan batu kecil tenggelam.' },
        ],
      };
    }
    return {
      zoneTitle: id === 'g1-ipas-1' ? 'Pos Tubuh & Pancaindra' : id === 'g1-ipas-2' ? 'Kebun Pertumbuhan Tumbuhan' : 'Hutan Satwa, Cuaca & Pantai Bersih',
      missionType: 'activate-nodes',
      missionVerb: 'Amati Alam & Tumbuhan',
      objectiveBanner: 'Amati kebun benih yang disiram, pancaindra tubuh, dan kenali Zona Aman hijau di Hutan dan Alam!',
      specs: [
        { label: 'Mata & Telinga', sublabel: 'Melihat & Mendengar', modelKind: 'organ-pod', colorHex: 0x16a34a, actionType: 'activate', completionMessage: 'Mata untuk melihat dan telinga untuk mendengar suara alam!' },
        { label: 'Biji & Akar', sublabel: 'Siram Hingga Tumbuh', modelKind: 'foodchain-pillar', colorHex: 0x22c55e, actionType: 'activate', completionMessage: 'Tumbuhan butuh air, tanah subur, dan cahaya matahari untuk mekar!' },
        { label: 'Hewan Jinak', sublabel: 'Kelinci Pemakan Wortel', modelKind: 'fruit-basket', colorHex: 0xf97316, actionType: 'activate', completionMessage: 'Kelinci makan sayuran dan hidup damai di padang rumput.' },
        { label: 'Cuaca & Zona Aman', sublabel: 'Pelindung Diri Hutan', modelKind: 'planet-orb', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Masuklah ke Lingkaran Hijau Zona Aman saat melihat hewan liar di hutan!' },
      ],
    };
  }

  if (chapter.grade === 1 && chapter.subjectId === 'muatan-lokal') {
    const num = chapter.chapterNumber;
    return {
      zoneTitle: num <= 2 ? 'Kampung Budaya & Kuliner Nusantara' : 'Balai Kerajinan, Lagu & Dongeng Daerah',
      missionType: 'activate-nodes',
      missionVerb: 'Kenali Budaya Daerah',
      objectiveBanner: chapter.tantanganPetualangan.instruction,
      specs: [
        { label: num <= 2 ? 'Salam Daerah' : 'Baju Adat', sublabel: num <= 2 ? 'Sapaan Ramah' : 'Kain Nusantara', modelKind: 'book-pedestal', colorHex: 0xb45309, actionType: 'activate', completionMessage: num <= 2 ? 'Menyapa dengan bahasa daerah melatih sopan santun dan bangga budaya!' : 'Pakaian adat mencerminkan keindahan warisan suku bangsa Indonesia!' },
        { label: num <= 2 ? 'Rumah Adat' : 'Gotong Royong', sublabel: num <= 2 ? 'Arsitektur Daerah' : 'Kerja Bersama', modelKind: 'royal-gate-lock', colorHex: 0x92400e, actionType: 'activate', completionMessage: num <= 2 ? 'Setiap daerah di Nusantara memiliki rumah adat unik yang indah!' : 'Gotong royong membuat pekerjaan berat di kampung cepat selesai!' },
        { label: num <= 2 ? 'Kuliner Tradisional' : 'Lagu Daerah', sublabel: num <= 2 ? 'Makanan Khas' : 'Irama Ceria', modelKind: 'fruit-basket', colorHex: 0xd97706, actionType: 'activate', completionMessage: num <= 2 ? 'Makanan tradisional dibuat dari bahan alam lokal yang sehat dan lezat!' : 'Menyanyikan lagu daerah mengenalkan kearifan lokal Nusantara!' },
        { label: num <= 2 ? 'Alat Musik Adat' : 'Dongeng Rakyat', sublabel: num <= 2 ? 'Nada Harmoni' : 'Pesan Moral', modelKind: 'book-pedestal', colorHex: 0x0f766e, actionType: 'activate', completionMessage: num <= 2 ? 'Alat musik tradisional dimainkan bersama dalam pertunjukan budaya!' : 'Dongeng rakyat mengajarkan kejujuran, kerendahan hati, dan kasih sayang!' },
      ],
    };
  }

  if (chapter.grade === 1 && chapter.subjectId === 'pancasila') {
    const num = chapter.chapterNumber;
    return {
      zoneTitle: num === 6 ? 'Monumen 5 Sila Garuda' : num <= 2 ? 'Rumah Perkenalan & Keluarga' : 'Taman Aturan & Hidup Rukun',
      missionType: 'activate-nodes',
      missionVerb: 'Amalkan Nilai Pancasila',
      objectiveBanner: chapter.tantanganPetualangan.instruction,
      specs: [
        { label: num <= 2 ? 'Salam Diri' : 'Sila 1 · Bintang', sublabel: num <= 2 ? 'Nama & Ciri Khas' : 'Ketuhanan YME', modelKind: 'royal-gate-lock', colorHex: 0xdc2626, actionType: 'activate', completionMessage: num <= 2 ? 'Memperkenalkan nama lengkap dengan sopan adalah kebiasaan anak baik!' : 'Sila ke-1 mengajak kita berdoa dan bersyukur kepada Tuhan!' },
        { label: num <= 2 ? 'Sayang Keluarga' : 'Sila 2 · Rantai', sublabel: num <= 2 ? 'Ayah Ibu Kakak Adik' : 'Kemanusiaan Adil', modelKind: 'royal-gate-lock', colorHex: 0xf59e0b, actionType: 'activate', completionMessage: num <= 2 ? 'Keluarga saling menyayangi dan membantu pekerjaan rumah bersama!' : 'Sila ke-2 mengajarkan sikap ramah, menolong, dan berbagi dengan teman!' },
        { label: num === 3 || num === 4 ? 'Aturan Tertib' : 'Sila 3 · Beringin', sublabel: num === 3 || num === 4 ? 'Rumah & Sekolah' : 'Persatuan Indonesia', modelKind: 'foodchain-pillar', colorHex: 0x16a34a, actionType: 'activate', completionMessage: 'Aturan tertib dan kerja bakti menjaga kerukunan di rumah maupun sekolah!' },
        { label: 'Kebersihan Kota', sublabel: 'Organik & Anorganik', modelKind: 'fruit-basket', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Memilah sampah menjaga keindahan Kota Kebersamaan!' },
      ],
    };
  }

  if (chapter.grade === 1 && chapter.subjectId === 'agama') {
    const shortCh = chapter.title.replace(/^Bab \d+:\s*/, '').slice(0, 22);
    return {
      zoneTitle: `Taman Kerohanian · ${shortCh}`,
      missionType: 'activate-nodes',
      missionVerb: 'Pelajari Akhlak Mulia',
      objectiveBanner: `Kunjungi tempat ibadahmu dan amalkan pesan "${shortCh}" bersama mentor agamamu!`,
      specs: [
        { label: 'Doa & Syukur', sublabel: shortCh, modelKind: 'book-pedestal', colorHex: 0x0d9488, actionType: 'activate', completionMessage: 'Mengawali kegiatan dengan doa membuat hati tenang dan penuh rasa syukur!' },
        { label: 'Hormat Orang Tua', sublabel: 'Bakti & Santun', modelKind: 'royal-gate-lock', colorHex: 0xf59e0b, actionType: 'activate', completionMessage: 'Berbicara sopan dan membantu ayah-ibu adalah akhlak mulia!' },
        { label: 'Sayang Sesama', sublabel: 'Rukun & Damai', modelKind: 'book-pedestal', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Menyayangi teman dan merawat alam menciptakan kedamaian!' },
        { label: 'Jujur Selalu', sublabel: 'Berkata Benar', modelKind: 'royal-gate-lock', colorHex: 0x16a34a, actionType: 'activate', completionMessage: 'Anak jujur dipercaya Tuhan, orang tua, guru, dan teman!' },
      ],
    };
  }

  if (chapter.grade === 1 && chapter.subjectId === 'pjok') {
    return {
      zoneTitle: `Stadion Gerak · ${chapter.title.replace(/^Bab \d+:\s*/, '').slice(0, 20)}`,
      missionType: 'activate-nodes',
      missionVerb: 'Selesaikan Pos Olahraga',
      objectiveBanner: chapter.tantanganPetualangan.instruction,
      specs: [
        { label: 'Pemanasan Otot', sublabel: 'Gerak Nonlokomotor', modelKind: 'force-crate', colorHex: 0xea580c, actionType: 'activate', completionMessage: 'Pemanasan sebelum olahraga mencegah otot kaku dan cedera!' },
        { label: 'Lari & Lompat', sublabel: 'Gerak Lokomotor', modelKind: 'force-crate', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Berlari dan melompati gawang memperkuat jantung dan otot kaki!' },
        { label: 'Titian Seimbang', sublabel: 'Fokus Tubuh', modelKind: 'force-crate', colorHex: 0x16a34a, actionType: 'activate', completionMessage: 'Merentangkan kedua tangan membantumu seimbang di atas titian!' },
        { label: 'Cuci Tangan & Gizi', sublabel: 'Hidup Bersih Sehat', modelKind: 'fruit-basket', colorHex: 0x10b981, actionType: 'activate', completionMessage: 'Air putih, makanan bergizi, dan cuci tangan menjaga tubuh tetap bugar!' },
      ],
    };
  }

  if (chapter.grade === 1 && chapter.subjectId === 'seni-budaya') {
    return {
      zoneTitle: `Negeri Kreativitas · ${chapter.title.replace(/^Bab \d+:\s*/, '').slice(0, 18)}`,
      missionType: 'activate-nodes',
      missionVerb: 'Temukan Inspirasi Seni',
      objectiveBanner: chapter.tantanganPetualangan.instruction,
      specs: [
        { label: 'Garis & Bentuk', sublabel: 'Lengkung & Lurus', modelKind: 'book-pedestal', colorHex: 0x9333ea, actionType: 'activate', completionMessage: 'Garis lurus, lengkung, dan zig-zag membentuk gambar yang indah!' },
        { label: 'Warna Sekunder', sublabel: 'Campur Primer', modelKind: 'planet-orb', colorHex: 0xec4899, actionType: 'activate', completionMessage: 'Merah+Kuning=Jingga, Biru+Kuning=Hijau, Merah+Biru=Ungu!' },
        { label: 'Irama & Tempo', sublabel: 'Cepat & Lambat', modelKind: 'book-pedestal', colorHex: 0xf59e0b, actionType: 'activate', completionMessage: 'Tempo mengatur cepat-lambatnya ketukan lagu dan tarian!' },
        { label: 'Kanvas Karya 3D', sublabel: 'Studio Gambar', modelKind: 'book-pedestal', colorHex: 0x0284c7, actionType: 'activate', completionMessage: 'Karya gambarmu langsung dipajang di Galeri Lukis Negeri Kreativitas!' },
      ],
    };
  }

  if (chapter.grade === 1 && chapter.subjectId === 'bahasa-inggris') {
    const num = chapter.chapterNumber;
    return {
      zoneTitle: num >= 3 ? 'English Family, Zoo & Fruit Corner' : 'English Vocabulary Plaza',
      missionType: 'collect-labeled',
      missionVerb: 'Temukan Kata Inggris',
      objectiveBanner: chapter.tantanganPetualangan.instruction,
      specs: num >= 3
        ? [
            { label: 'Father & Mother', sublabel: 'My Family', modelKind: 'word-crate', colorHex: 0x4f46e5, actionType: 'collect', completionMessage: 'Father = Ayah, Mother = Ibu, Sister = Saudara Perempuan!' },
            { label: 'Cat & Bird', sublabel: 'Friendly Animals', modelKind: 'alphabet-block', colorHex: 0xf59e0b, actionType: 'collect', completionMessage: 'Cat = Kucing, Bird = Burung, Rabbit = Kelinci, Fish = Ikan!' },
            { label: 'Apple & Banana', sublabel: 'Fresh Fruits', modelKind: 'fruit-basket', colorHex: 0xef4444, actionType: 'collect', completionMessage: 'Apple = Apel, Banana = Pisang, Orange = Jeruk!' },
            { label: 'Jump & Read', sublabel: 'Action Words', modelKind: 'word-crate', colorHex: 0x10b981, actionType: 'collect', completionMessage: 'Jump = Lompat, Run = Lari, Read = Baca, Sit = Duduk!' },
          ]
        : [
            { label: 'Good Morning!', sublabel: 'Selamat Pagi', modelKind: 'word-crate', colorHex: 0x4f46e5, actionType: 'collect', completionMessage: 'Good morning = Selamat pagi! Good afternoon = Selamat siang!' },
            { label: 'Red & Blue', sublabel: 'Colors (Warna)', modelKind: 'alphabet-block', colorHex: 0xef4444, actionType: 'collect', completionMessage: 'Red = Merah, Blue = Biru, Yellow = Kuning, Green = Hijau!' },
            { label: 'One to Ten', sublabel: 'Numbers (Angka)', modelKind: 'number-totem', colorHex: 0x0284c7, actionType: 'collect', completionMessage: 'One, Two, Three, Four, Five = Satu sampai Lima!' },
            { label: 'Book & Bag', sublabel: 'Classroom Items', modelKind: 'word-crate', colorHex: 0x10b981, actionType: 'collect', completionMessage: 'Book = Buku, Bag = Tas, Chair = Kursi, Apple = Apel!' },
          ],
    };
  }

  // ---------------- KELAS 2 SPECIFIC SCENARIOS ----------------
  if (id === 'g2-mat-1') {
    return {
      zoneTitle: 'Desa Bilangan sampai 100',
      missionType: 'activate-nodes',
      missionVerb: 'Periksa Nomor Rumah Desa',
      objectiveBanner: 'Jelajahi Desa Bilangan sampai 100, cek papan nomor rumah warga, dan aktifkan 4 pos bilangan.',
      specs: [
        {
          label: 'Rumah No. 15',
          sublabel: 'Lima Belas',
          modelKind: 'number-totem',
          colorHex: 0x059669,
          actionType: 'activate',
          completionMessage: '15 dibaca lima belas! Paling kecil di antara 15, 42, 68, dan 95.',
        },
        {
          label: 'Rumah No. 42',
          sublabel: 'Empat Puluh Dua',
          modelKind: 'number-totem',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: '42 lebih besar dari 15 dan lebih kecil dari 68.',
        },
        {
          label: 'Rumah No. 68',
          sublabel: 'Enam Puluh Delapan',
          modelKind: 'number-totem',
          colorHex: 0x16a34a,
          actionType: 'activate',
          completionMessage: 'Urutan naik: 15 → 42 → 68!',
        },
        {
          label: 'Sekolah No. 95',
          sublabel: 'Sembilan Puluh Lima',
          modelKind: 'number-totem',
          colorHex: 0xd97706,
          actionType: 'activate',
          completionMessage: '95 adalah bilangan terbesar di Desa Bilangan!',
        },
      ],
    };
  }

  if (id === 'g2-mat-2') {
    return {
      zoneTitle: 'Kebun Nilai Tempat',
      missionType: 'activate-nodes',
      missionVerb: 'Hitung Puluhan & Satuan Panen',
      objectiveBanner: 'Tanam dan panen sayur di Kebun Nilai Tempat, lalu kelompokkan menjadi puluhan dan satuan.',
      specs: [
        {
          label: '34 = 3P + 4S',
          sublabel: '3 Ikatan Wortel + 4',
          modelKind: 'fruit-basket',
          colorHex: 0xf97316,
          actionType: 'activate',
          completionMessage: 'Pada 34, angka 3 bernilai 30 (puluhan) dan 4 bernilai 4 (satuan)!',
        },
        {
          label: '52 = 5P + 2S',
          sublabel: '5 Ikatan Jagung + 2',
          modelKind: 'fruit-basket',
          colorHex: 0xfacc15,
          actionType: 'activate',
          completionMessage: '5 puluhan + 2 satuan = 50 + 2 = 52!',
        },
        {
          label: '70 = 7P + 0S',
          sublabel: '7 Ikatan Kubis',
          modelKind: 'fruit-basket',
          colorHex: 0x22c55e,
          actionType: 'activate',
          completionMessage: '7 puluhan pas tanpa sisa satuan = 70!',
        },
        {
          label: '86 = 8P + 6S',
          sublabel: '8 Ikatan Tomat + 6',
          modelKind: 'fruit-basket',
          colorHex: 0xef4444,
          actionType: 'activate',
          completionMessage: 'Hebat! Kamu sudah mahir membaca nilai tempat ratusan-puluhan-satuan!',
        },
      ],
    };
  }

  if (id === 'g2-mat-3') {
    return {
      zoneTitle: 'Pasar Penjumlahan Desa',
      missionType: 'activate-nodes',
      missionVerb: 'Hitung Total Belanja Pasar',
      objectiveBanner: 'Kunjungi Pasar Penjumlahan, jual hasil panen atau beli pakan, dan hitung penjumlahan dua angka!',
      specs: [
        {
          label: '24 + 15 = 39',
          sublabel: 'Kios Sayur Segar',
          modelKind: 'fruit-basket',
          colorHex: 0xea580c,
          actionType: 'activate',
          completionMessage: '24 + 15 = 39! Jumlahkan satuan lalu puluhannya.',
        },
        {
          label: '36 + 27 = 63',
          sublabel: 'Kios Buah Desa',
          modelKind: 'fruit-basket',
          colorHex: 0xef4444,
          actionType: 'activate',
          completionMessage: '6 + 7 = 13 (simpan 1 puluhan): 30 + 20 + 13 = 63!',
        },
        {
          label: '48 + 14 = 62',
          sublabel: 'Kios Pakan & Benih',
          modelKind: 'fruit-basket',
          colorHex: 0x059669,
          actionType: 'activate',
          completionMessage: '48 + 14 = 62 dengan teknik menyimpan puluhan!',
        },
        {
          label: '55 + 25 = 80',
          sublabel: 'Kasir Pasar Ceria',
          modelKind: 'fruit-basket',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: '55 + 25 = 80 koin! Ayo coba transaksi nyata di meja Pasar!',
        },
      ],
    };
  }

  if (id === 'g2-mat-4') {
    return {
      zoneTitle: 'Gudang Pengurangan Panen',
      missionType: 'activate-nodes',
      missionVerb: 'Hitung Sisa Stok Gudang',
      objectiveBanner: 'Bantu penjaga Gudang Pengurangan menghitung sisa karung panen setelah dibagikan ke warga.',
      specs: [
        {
          label: '48 - 13 = 35',
          sublabel: 'Karung Padi Utara',
          modelKind: 'number-totem',
          colorHex: 0xb45309,
          actionType: 'activate',
          completionMessage: '48 dikurangi 13 menyisakan 35 karung padi!',
        },
        {
          label: '54 - 18 = 36',
          sublabel: 'Peti Wortel Gudang',
          modelKind: 'number-totem',
          colorHex: 0xf97316,
          actionType: 'activate',
          completionMessage: 'Pinjam 1 puluhan: 14 - 8 = 6, lalu 4 - 1 = 3 → 36!',
        },
        {
          label: '72 - 25 = 47',
          sublabel: 'Silo Jagung Desa',
          modelKind: 'number-totem',
          colorHex: 0x059669,
          actionType: 'activate',
          completionMessage: '72 - 25 = 47 karung jagung tersisa!',
        },
        {
          label: '90 - 34 = 56',
          sublabel: 'Buku Catatan Stok',
          modelKind: 'number-totem',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: '90 - 34 = 56! Jangan lupa simpan panenmu di Gudang!',
        },
      ],
    };
  }

  if (id === 'g2-mat-5') {
    return {
      zoneTitle: 'Kebun Panen Perkalian',
      missionType: 'activate-nodes',
      missionVerb: 'Hitung Kelompok Panen Petani',
      objectiveBanner: 'Bantu petani Desa Ceria menghitung hasil panen berkelompok menggunakan perkalian.',
      specs: [
        {
          label: '3 × 4 = 12',
          sublabel: '3 Keranjang × 4 Apel',
          modelKind: 'fruit-basket',
          colorHex: 0xef4444,
          actionType: 'activate',
          completionMessage: '3 kelompok berisi 4 apel = 4 + 4 + 4 = 12 apel!',
        },
        {
          label: '4 × 5 = 20',
          sublabel: '4 Karung × 5 Jagung',
          modelKind: 'fruit-basket',
          colorHex: 0xf59e0b,
          actionType: 'activate',
          completionMessage: '4 kelompok berisi 5 jagung = 5 + 5 + 5 + 5 = 20 jagung!',
        },
        {
          label: '5 × 3 = 15',
          sublabel: '5 Peti × 3 Mangga',
          modelKind: 'fruit-basket',
          colorHex: 0x16a34a,
          actionType: 'activate',
          completionMessage: '5 peti × 3 mangga = 15 mangga!',
        },
        {
          label: '2 × 8 = 16',
          sublabel: '2 Keranjang × 8 Jeruk',
          modelKind: 'fruit-basket',
          colorHex: 0xf97316,
          actionType: 'activate',
          completionMessage: '2 keranjang × 8 jeruk = 16 jeruk!',
        },
      ],
    };
  }

  if (id === 'g2-mat-6') {
    return {
      zoneTitle: 'Balai Pembagian Adil Desa',
      missionType: 'activate-nodes',
      missionVerb: 'Bagikan Buah Sama Rata',
      objectiveBanner: 'Antarkan dan bagikan buah secara adil ke 4 pos penduduk Desa Ceria.',
      specs: [
        {
          label: '12 : 3 = 4',
          sublabel: 'Pos Keluarga Pak Tani',
          modelKind: 'fruit-basket',
          colorHex: 0x059669,
          actionType: 'activate',
          completionMessage: '12 apel dibagi 3 rumah = masing-masing 4 apel adil!',
        },
        {
          label: '16 : 4 = 4',
          sublabel: 'Pos Anak Sekolah',
          modelKind: 'fruit-basket',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: '16 jeruk dibagi 4 anak = masing-masing 4 jeruk!',
        },
        {
          label: '20 : 5 = 4',
          sublabel: 'Pos Kerja Bakti',
          modelKind: 'fruit-basket',
          colorHex: 0xd97706,
          actionType: 'activate',
          completionMessage: '20 pisang dibagi 5 warga = 4 pisang per orang!',
        },
        {
          label: '18 : 3 = 6',
          sublabel: 'Pos Balai Desa',
          modelKind: 'fruit-basket',
          colorHex: 0x7c3aed,
          actionType: 'activate',
          completionMessage: '18 mangga dibagi 3 meja = 6 mangga per meja!',
        },
      ],
    };
  }

  if (id === 'g2-mat-7') {
    return {
      zoneTitle: 'Bengkel Pengukuran Desa',
      missionType: 'activate-nodes',
      missionVerb: 'Ukur Panjang & Berat Benda',
      objectiveBanner: 'Kunjungi Bengkel Pengukuran, cek meja ukur meter, sentimeter, dan timbangan kilogram!',
      specs: [
        {
          label: '1 m = 100 cm',
          sublabel: 'Penggaris Kayu Desa',
          modelKind: 'number-totem',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: '1 meter sama dengan 100 sentimeter!',
        },
        {
          label: '2 m = 200 cm',
          sublabel: 'Meja Ukur Papan',
          modelKind: 'number-totem',
          colorHex: 0xd97706,
          actionType: 'activate',
          completionMessage: 'Papan kayu 2 meter sama panjangnya dengan 200 cm.',
        },
        {
          label: '1 kg = 1.000 g',
          sublabel: 'Timbangan Karung Beras',
          modelKind: 'number-totem',
          colorHex: 0x059669,
          actionType: 'activate',
          completionMessage: '1 kilogram sama beratnya dengan 1.000 gram!',
        },
        {
          label: 'Jam & Durasi',
          sublabel: 'Jadwal Kerja Bengkel',
          modelKind: 'number-totem',
          colorHex: 0x7c3aed,
          actionType: 'activate',
          completionMessage: 'Jarum pendek menunjukkan jam dan jarum panjang menunjukkan menit.',
        },
      ],
    };
  }

  if (id === 'g2-mat-8') {
    return {
      zoneTitle: 'Taman Bangun Datar & Ruang',
      missionType: 'activate-nodes',
      missionVerb: 'Identifikasi Sisi & Rusuk Bangun',
      objectiveBanner: 'Jelajahi Taman Bangun Datar dan Ruang, lalu amati ciri segitiga, persegi, kubus, balok, dan limas.',
      specs: [
        {
          label: 'Segitiga & Persegi',
          sublabel: '3 & 4 Sisi Datar',
          modelKind: 'force-crate',
          colorHex: 0x4f46e5,
          actionType: 'activate',
          completionMessage: 'Segitiga punya 3 sisi & 3 sudut; persegi punya 4 sisi sama panjang.',
        },
        {
          label: 'Kubus (6 Sisi)',
          sublabel: '12 Rusuk · 8 Sudut',
          modelKind: 'force-crate',
          colorHex: 0xef4444,
          actionType: 'activate',
          completionMessage: 'Kubus tersusun dari 6 sisi persegi yang sama luasnya!',
        },
        {
          label: 'Balok (6 Sisi)',
          sublabel: '3 Pasang Berhadapan',
          modelKind: 'force-crate',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: 'Balok memiliki 6 sisi datar, 12 rusuk, dan 8 titik sudut!',
        },
        {
          label: 'Limas Segiempat',
          sublabel: '1 Alas + 4 Segitiga',
          modelKind: 'force-crate',
          colorHex: 0x10b981,
          actionType: 'activate',
          completionMessage: 'Limas segiempat memiliki 5 sisi (1 alas segiempat + 4 sisi segitiga tegak)!',
        },
      ],
    };
  }

  if (chapter.grade === 2 && chapter.subjectId === 'bahasa-indonesia') {
    return {
      zoneTitle: 'Jejak Petunjuk & Misteri Desa',
      missionType: 'collect-labeled',
      missionVerb: 'Baca Petunjuk Misteri Desa',
      objectiveBanner: 'Temukan 4 papan petunjuk cerita di Desa Ceria untuk memecahkan misteri.',
      specs: [
        {
          label: 'Petunjuk 1',
          sublabel: 'Siapa Tokohnya?',
          modelKind: 'word-crate',
          colorHex: 0x0284c7,
          actionType: 'collect',
          completionMessage: 'Petunjuk 1: Kata tanya "Siapa" menanyakan tokoh pelaku cerita!',
        },
        {
          label: 'Petunjuk 2',
          sublabel: 'Di Mana Tempatnya?',
          modelKind: 'word-crate',
          colorHex: 0x059669,
          actionType: 'collect',
          completionMessage: 'Petunjuk 2: Kata tanya "Di mana" menunjukkan latar tempat!',
        },
        {
          label: 'Petunjuk 3',
          sublabel: 'Kapan Terjadinya?',
          modelKind: 'word-crate',
          colorHex: 0xd97706,
          actionType: 'collect',
          completionMessage: 'Petunjuk 3: Kata tanya "Kapan" menunjukkan latar waktu kejadian!',
        },
        {
          label: 'Petunjuk 4',
          sublabel: 'Pesan Cerita',
          modelKind: 'book-pedestal',
          colorHex: 0x7c3aed,
          actionType: 'collect',
          completionMessage: 'Misteri Desa terpecahkan lewat pemahaman bacaan yang cermat!',
        },
      ],
    };
  }

  // ---------------- KELAS 3 SPECIFIC SCENARIOS ----------------
  if (
    chapter.grade === 3 &&
    chapter.subjectId === 'ipas' &&
    (id === 'g3-ipas-1' || id === 'g3-ipas-2' || id === 'g3-ipas-3' || id === 'g3-ipas-4')
  ) {
    return {
      zoneTitle: 'Rimba Identifikasi Makhluk Hidup',
      missionType: 'activate-nodes',
      missionVerb: 'Amati Tumbuhan & Hewan Hutan',
      objectiveBanner: 'Jelajahi Hutan Misteri dan identifikasi 4 spesimen tumbuhan serta hewan dengan [E].',
      specs: [
        {
          label: 'Akar & Daun',
          sublabel: 'Tumbuhan Fotosintesis',
          modelKind: 'foodchain-pillar',
          colorHex: 0x16a34a,
          actionType: 'activate',
          completionMessage: 'Tumbuhan berhijau daun membuat makanan sendiri melalui fotosintesis!',
        },
        {
          label: 'Kupu-Kupu',
          sublabel: 'Metamorfosis Sempurna',
          modelKind: 'foodchain-pillar',
          colorHex: 0xf59e0b,
          actionType: 'activate',
          completionMessage: 'Kupu-kupu bermetamorfosis: Telur → Ulat → Kepompong → Kupu-kupu!',
        },
        {
          label: 'Katak Hijau',
          sublabel: 'Bernapas & Berkembang Biak',
          modelKind: 'foodchain-pillar',
          colorHex: 0x0d9488,
          actionType: 'activate',
          completionMessage: 'Hewan memerlukan makan, minum, oksigen, serta peka terhadap rangsang.',
        },
        {
          label: 'Jamur Pengurai',
          sublabel: 'Pelestarian Tanah',
          modelKind: 'foodchain-pillar',
          colorHex: 0x8b5cf6,
          actionType: 'activate',
          completionMessage: 'Jamur membantu menguraikan sisa daun menjadi humus subur bagi hutan!',
        },
      ],
    };
  }

  // ---------------- FOOD CHAIN (KELAS 3/4/5) ----------------
  if (chapter.visualType === 'food-chain' || titleLower.includes('rantai makanan')) {
    return {
      zoneTitle: 'Jalur Ekosistem Rantai Makanan',
      missionType: 'activate-nodes',
      missionVerb: 'Susun Urutan Rantai Makanan',
      objectiveBanner: 'Aktifkan berurutan 4 tingkatan ekosistem: Produsen → Konsumen I → II → Pengurai.',
      specs: [
        {
          label: '1. Padi / Rumput',
          sublabel: 'Produsen',
          modelKind: 'foodchain-pillar',
          colorHex: 0x22c55e,
          actionType: 'activate',
          completionMessage: 'Produsen (Padi) menghasilkan energi dari cahaya matahari!',
        },
        {
          label: '2. Belalang / Tikus',
          sublabel: 'Konsumen I (Herbivora)',
          modelKind: 'foodchain-pillar',
          colorHex: 0xeab308,
          actionType: 'activate',
          completionMessage: 'Konsumen Tingkat I memakan tumbuhan produsen.',
        },
        {
          label: '3. Ular / Elang',
          sublabel: 'Konsumen II & Puncak',
          modelKind: 'foodchain-pillar',
          colorHex: 0xef4444,
          actionType: 'activate',
          completionMessage: 'Konsumen puncak menjaga populasi konsumen bawah tetap seimbang.',
        },
        {
          label: '4. Jamur & Bakteri',
          sublabel: 'Pengurai (Dekomposer)',
          modelKind: 'foodchain-pillar',
          colorHex: 0x7c3aed,
          actionType: 'activate',
          completionMessage: 'Pengurai mengembalikan unsur hara ke tanah agar siklus berlanjut!',
        },
      ],
    };
  }

  // ---------------- FRACTIONS (KELAS 2/3/4/5/6) ----------------
  if (chapter.visualType === 'fraction' || titleLower.includes('pecahan')) {
    return {
      zoneTitle: 'Meja Pecahan Kue & Buah',
      missionType: 'activate-nodes',
      missionVerb: 'Periksa Bagian Pecahan',
      objectiveBanner: 'Kunjungi 4 meja pecahan 3D dan periksa pembagian bagian yang sama besar dengan [E].',
      specs: [
        {
          label: 'Pecahan 1/2',
          sublabel: '1 dari 2 Bagian',
          modelKind: 'fraction-table',
          colorHex: 0xef4444,
          actionType: 'activate',
          completionMessage: '1/2 berarti satu bagian utuh dibagi menjadi 2 potongan sama besar!',
        },
        {
          label: 'Pecahan 1/4',
          sublabel: '1 dari 4 Bagian',
          modelKind: 'fraction-table',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: '1/4 lebih kecil daripada 1/2 karena benda dibagi menjadi 4 bagian.',
        },
        {
          label: 'Pecahan 3/4',
          sublabel: '3 dari 4 Bagian',
          modelKind: 'fraction-table',
          colorHex: 0x10b981,
          actionType: 'activate',
          completionMessage: '3/4 berarti 3 potongan dari total 4 potongan sama besar!',
        },
        {
          label: 'Senilai 2/4 = 1/2',
          sublabel: 'Pecahan Senilai',
          modelKind: 'fraction-table',
          colorHex: 0xf59e0b,
          actionType: 'activate',
          completionMessage: '2/4 memiliki besar wilayah yang sama persis dengan 1/2!',
        },
      ],
    };
  }

  // ---------------- KELAS 4 GAYA & GERAK (PUSHABLE CRATES!) ----------------
  if (id === 'g4-ipas-5' || titleLower.includes('gaya dan gerak')) {
    return {
      zoneTitle: 'Zona Eksperimen Gaya & Gerak',
      missionType: 'push-box',
      missionVerb: 'Dorong Peti ke Lingkaran Target',
      objectiveBanner: 'Dorong 3 peti gaya di arena hingga masuk ke lingkaran target hijau dengan berjalan mendorongnya atau tekan [E]!',
      specs: [
        {
          label: 'Gaya Dorong 1',
          sublabel: 'Dorong ke Lingkaran →',
          modelKind: 'force-crate',
          colorHex: 0xd97706,
          actionType: 'push',
          completionMessage: 'Berhasil! Gaya dorong mengubah benda diam menjadi bergerak.',
        },
        {
          label: 'Gaya Gesek 2',
          sublabel: 'Dorong ke Target ↓',
          modelKind: 'force-crate',
          colorHex: 0x0284c7,
          actionType: 'push',
          completionMessage: 'Hebat! Permukaan tanah memberi gaya gesek yang memperlambat gerak peti.',
        },
        {
          label: 'Gaya Otot 3',
          sublabel: 'Dorong ke Target →',
          modelKind: 'force-crate',
          colorHex: 0x059669,
          actionType: 'push',
          completionMessage: 'Mantap! Gaya otot kaki dan tanganmu berhasil memindahkan beban!',
        },
      ],
    };
  }

  // ---------------- KELAS 5/6 ORGAN TUBUH MANUSIA ----------------
  if (
    id === 'g5-ipas-1' ||
    id === 'g5-ipas-2' ||
    id === 'g6-ipas-1' ||
    titleLower.includes('organ tubuh') ||
    titleLower.includes('pernapasan dan pencernaan')
  ) {
    return {
      zoneTitle: 'Laboratorium Organ Tubuh 3D',
      missionType: 'activate-nodes',
      missionVerb: 'Pindai Kapsul Organ Tubuh',
      objectiveBanner: 'Periksa 4 kapsul organ tubuh manusia di laboratorium untuk memahami fungsinya.',
      specs: [
        {
          label: 'Paru-Paru',
          sublabel: 'Pertukaran O₂ & CO₂',
          modelKind: 'organ-pod',
          colorHex: 0x38bdf8,
          actionType: 'activate',
          completionMessage: 'Alveolus di paru-paru menukar oksigen dengan karbon dioksida!',
        },
        {
          label: 'Jantung',
          sublabel: 'Memompa Darah',
          modelKind: 'organ-pod',
          colorHex: 0xef4444,
          actionType: 'activate',
          completionMessage: 'Jantung memompa darah kaya oksigen dan nutrisi ke seluruh tubuh!',
        },
        {
          label: 'Lambung',
          sublabel: 'Cerna Makanan',
          modelKind: 'organ-pod',
          colorHex: 0xf59e0b,
          actionType: 'activate',
          completionMessage: 'Lambung menghasilkan asam lambung & enzim untuk mencerna makanan.',
        },
        {
          label: 'Usus Halus',
          sublabel: 'Serap Sari Makanan',
          modelKind: 'organ-pod',
          colorHex: 0x10b981,
          actionType: 'activate',
          completionMessage: 'Usus halus menyerap sari-sari makanan untuk energi tubuh kita!',
        },
      ],
    };
  }

  // ---------------- KELAS 5/6 LISTRIK & RANGKAIAN LISTRIK ----------------
  if (
    chapter.visualType === 'circuit' ||
    titleLower.includes('listrik') ||
    titleLower.includes('rangkaian')
  ) {
    return {
      zoneTitle: 'Stasiun Rangkaian Listrik 3D',
      missionType: 'activate-nodes',
      missionVerb: 'Aktifkan Saklar Mesin Listrik',
      objectiveBanner: 'Nyalakan 4 saklar rangkaian listrik dengan [E] agar arus listrik mengalir menyalakan mesin!',
      specs: [
        {
          label: 'Sumber Baterai',
          sublabel: 'Energi Kimia → Listrik',
          modelKind: 'circuit-switch',
          colorHex: 0xf59e0b,
          actionType: 'activate',
          completionMessage: 'Baterai menyediakan beda potensial (energi kimia → listrik)!',
        },
        {
          label: 'Saklar Seri',
          sublabel: 'Arus Satu Jalur',
          modelKind: 'circuit-switch',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: 'Pada rangkaian seri, arus mengalir berurutan tanpa percabangan.',
        },
        {
          label: 'Saklar Paralel',
          sublabel: 'Arus Bercabang',
          modelKind: 'circuit-switch',
          colorHex: 0x10b981,
          actionType: 'activate',
          completionMessage: 'Pada rangkaian paralel, jika satu lampu mati, lampu cabang lain tetap menyala!',
        },
        {
          label: 'Turbin Mesin',
          sublabel: 'Listrik → Gerak/Cahaya',
          modelKind: 'circuit-switch',
          colorHex: 0x6366f1,
          actionType: 'activate',
          completionMessage: 'Mesin utama menyala! Listrik berubah menjadi energi gerak & cahaya.',
        },
      ],
    };
  }

  // ---------------- KELAS 5/6 TATA SURYA ----------------
  if (chapter.visualType === 'solar-system' || titleLower.includes('tata surya')) {
    return {
      zoneTitle: 'Observatorium Tata Surya 3D',
      missionType: 'activate-nodes',
      missionVerb: 'Amati Planet Tata Surya',
      objectiveBanner: 'Kunjungi 4 model planet 3D dan pelajari pergerakan rotasi serta revolusinya.',
      specs: [
        {
          label: 'Matahari',
          sublabel: 'Pusat Tata Surya',
          modelKind: 'planet-orb',
          colorHex: 0xf59e0b,
          actionType: 'activate',
          completionMessage: 'Matahari adalah bintang pusat tata surya dengan gravitasi terbesar.',
        },
        {
          label: 'Bumi',
          sublabel: 'Rotasi 24 Jam',
          modelKind: 'planet-orb',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: 'Rotasi Bumi 24 jam menimbulkan siang-malam; revolusi 365 hari menimbulkan musim.',
        },
        {
          label: 'Planet Mars',
          sublabel: 'Planet Merah',
          modelKind: 'planet-orb',
          colorHex: 0xdc2626,
          actionType: 'activate',
          completionMessage: 'Mars dijuluki Planet Merah karena permukaan oksida besinya.',
        },
        {
          label: 'Saturnus',
          sublabel: 'Planet Bercincin Es',
          modelKind: 'planet-orb',
          colorHex: 0xd97706,
          actionType: 'activate',
          completionMessage: 'Saturnus terkenal dengan cincin es dan debu raksasa yang mengorbitnya!',
        },
      ],
    };
  }

  // ---------------- KELAS 6 MATEMATIKA PENUTUP / KERAJAAN ----------------
  if (chapter.grade === 6 && chapter.subjectId === 'matematika') {
    return {
      zoneTitle: 'Gerbang Logika Kerajaan Matematika',
      missionType: 'activate-nodes',
      missionVerb: 'Buka Segel Gerbang Kerajaan',
      objectiveBanner: 'Aktifkan 4 segel logika matematika untuk membuka Gerbang Kerajaan Penjaga Ilmu.',
      specs: [
        {
          label: 'Segel Bilangan',
          sublabel: chapter.title.replace(/^Bab \d+:\s*/, '').slice(0, 18),
          modelKind: 'royal-gate-lock',
          colorHex: 0xb45309,
          actionType: 'activate',
          completionMessage: 'Segel Pertama terbuka! Ketelitian hitungan adalah kunci pembuka gerbang.',
        },
        {
          label: 'Segel Pola',
          sublabel: 'Analisis Soal Cerita',
          modelKind: 'royal-gate-lock',
          colorHex: 0x0284c7,
          actionType: 'activate',
          completionMessage: 'Segel Kedua terbuka! Kamu menguasai strategi pemecahan masalah.',
        },
        {
          label: 'Segel Geometri',
          sublabel: 'Ruang & Pengukuran',
          modelKind: 'royal-gate-lock',
          colorHex: 0x059669,
          actionType: 'activate',
          completionMessage: 'Segel Ketiga terbuka! Satu langkah lagi menuju tantangan akhir.',
        },
        {
          label: 'Kunci Mahkota',
          sublabel: 'Gerbang Kerajaan',
          modelKind: 'royal-gate-lock',
          colorHex: 0x7c3aed,
          actionType: 'activate',
          completionMessage: 'Seluruh Segel Gerbang Kerajaan aktif! Sekarang ikuti Tantangan Bab!',
        },
      ],
    };
  }

  // ---------------- TAILORED FALLBACKS BY VISUAL TYPE / SUBJECT ----------------
  const shortTitle = chapter.title.replace(/^Bab \d+:\s*/, '').slice(0, 26);
  const example0 = (chapter.contohSehariHari[0] ?? shortTitle).slice(0, 22);
  const example1 = (chapter.contohSehariHari[1] ?? chapter.tujuanPembelajaran[0] ?? 'Konsep Inti').slice(0, 22);
  const targetObj = chapter.tantanganPetualangan.target3dObject || 'Pos Materi';

  let defaultModel: Chapter3DModelKind = 'book-pedestal';
  if (chapter.visualType === 'numbers' || chapter.visualType === 'addition') defaultModel = 'number-totem';
  else if (chapter.visualType === 'alphabet' || chapter.visualType === 'syllables') defaultModel = 'alphabet-block';
  else if (chapter.visualType === 'geometry' || chapter.visualType === 'volume-cube') defaultModel = 'force-crate';
  else if (chapter.visualType === 'plant-parts') defaultModel = 'foodchain-pillar';
  else if (chapter.visualType === 'magnet') defaultModel = 'circuit-switch';
  else if (chapter.subjectId === 'pancasila' || chapter.subjectId === 'agama') defaultModel = 'royal-gate-lock';

  const action: Chapter3DActionType =
    chapter.subjectId === 'bahasa-indonesia' || chapter.subjectId === 'bahasa-inggris'
      ? 'collect'
      : 'activate';

  return {
    zoneTitle: `Zona ${shortTitle}`,
    missionType: action === 'collect' ? 'collect-labeled' : 'activate-nodes',
    missionVerb: action === 'collect' ? 'Kumpulkan Kartu Ilmu' : 'Periksa Pos Belajar',
    objectiveBanner: chapter.tantanganPetualangan.instruction,
    specs: [
      {
        label: 'Pos 1 · Tujuan',
        sublabel: shortTitle.slice(0, 18),
        modelKind: defaultModel,
        colorHex: subjectColor,
        actionType: action,
        completionMessage: `Tujuan Belajar: ${chapter.tujuanPembelajaran[0] ?? shortTitle}`,
      },
      {
        label: 'Pos 2 · Konsep',
        sublabel: targetObj.slice(0, 18),
        modelKind: defaultModel,
        colorHex: 0x0284c7,
        actionType: action,
        completionMessage: chapter.materiLengkap[0]?.slice(0, 110) ?? shortTitle,
      },
      {
        label: 'Pos 3 · Contoh',
        sublabel: example0,
        modelKind: defaultModel,
        colorHex: 0x059669,
        actionType: action,
        completionMessage: `Contoh Nyata: ${chapter.contohSehariHari[0] ?? shortTitle}`,
      },
      {
        label: 'Pos 4 · Aplikasi',
        sublabel: example1,
        modelKind: defaultModel,
        colorHex: 0xd97706,
        actionType: action,
        completionMessage: `Siap! Sekarang selesaikan Tantangan Bab "${chapter.title}"!`,
      },
    ],
  };
}

/**
 * Generates a 100% single-subject, chapter-accurate 3D mission config for ANY active SubjectChapter.
 * Ensures NPC dialogues, NPC trivia, zone title, and 3D stations strictly match the played chapter.
 */
export function buildChapter3DMission(
  chapter: SubjectChapter,
  baseTheme: WorldTheme3D
): Chapter3DMissionConfig {
  const subjectMeta =
    SUBJECTS.find((s) => s.id === chapter.subjectId) ?? SUBJECTS[0];
  const accentNumber = hexStringToNumber(subjectMeta.accentHex);

  const scenario = buildScenarioSpec(chapter, accentNumber);
  const zones = getZonesForGrade(chapter.grade);
  const zone =
    chapter.grade === 1 && isGrade1LabChapter(chapter.id)
      ? GRADE1_LAB_ZONE
      : zones[(Math.max(1, chapter.chapterNumber) - 1) % zones.length];
  const stations = buildStationsFromSpecs(
    chapter.id,
    chapter.chapterNumber,
    chapter.grade,
    scenario.specs
  );

  // Override all island NPCs so their greeting, story, trivia & 2-step hints come STRICTLY from this chapter
  const chapterNpcsOverrides: NpcDefinition[] = baseTheme.npcs.map((npc, idx) => {
    const q = chapter.questions[idx % chapter.questions.length];
    const contoh = chapter.contohSehariHari[idx % chapter.contohSehariHari.length] ?? '';
    const materiShort = chapter.materiLengkap[idx % chapter.materiLengkap.length] ?? '';

    const greeting =
      idx === 0
        ? `Selamat datang di ${scenario.zoneTitle}! Hari ini kita fokus mempelajari ${subjectMeta.name}: ${chapter.title}.`
        : idx === 1
        ? `Hebat sudah menjelajahi pulau! Ingat contoh materi "${chapter.title}": ${contoh}`
        : `Kamu sudah jauh melangkah! Uji pemahamanmu tentang ${chapter.title} bersama saya sebelum kuis bab.`;

    const story =
      idx === 0
        ? `Misi 3D Bab Ini: ${scenario.objectiveBanner}`
        : materiShort;

    return {
      ...npc,
      role: idx === 0 ? `Mentor ${subjectMeta.shortName} · Bab ${chapter.chapterNumber}` : `Pendamping ${subjectMeta.shortName}`,
      greeting,
      story,
      trivia: {
        question: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        rewardCoins: 15 + chapter.grade * 3,
        rewardScore: 100 + chapter.grade * 20,
        explanation: q.penjelasan,
        hints: getQuestionHints(q),
      },
    };
  });

  return {
    chapterId: chapter.id,
    chapterNumber: chapter.chapterNumber,
    grade: chapter.grade,
    subjectId: chapter.subjectId,
    subjectName: subjectMeta.name,
    accentHex: subjectMeta.accentHex,
    zoneTitle: scenario.zoneTitle,
    missionType: scenario.missionType,
    missionVerb: scenario.missionVerb,
    objectiveBanner: scenario.objectiveBanner,
    mentorIntro: chapter.materiLengkap[0] ?? chapter.tujuanPembelajaran[0] ?? '',
    spawnPoint:
      chapter.grade === 1 && isGrade1LabChapter(chapter.id)
        ? GRADE1_LAB_ZONE.spawn
        : chapter.grade === 1 && chapter.subjectId === 'ipas'
        ? { x: -12.5, z: 3.5, yaw: 0.35 }
        : scenario.missionType === 'push-box'
        ? zones[0].spawn
        : zone.spawn,
    archPos:
      chapter.grade === 1 && isGrade1LabChapter(chapter.id)
        ? GRADE1_LAB_ZONE.arch
        : scenario.missionType === 'push-box'
        ? zones[0].arch
        : zone.arch,
    stations,
    chapterNpcsOverrides,
  };
}
