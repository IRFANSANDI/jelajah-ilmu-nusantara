import * as THREE from 'three';
import {
  BoxCollider,
  CircleCollider,
  getRawTerrainHeight,
  GRADE4_BRIDGE,
} from './terrain';

export type Grade4NodeKind =
  | 'maze-clue'
  | 'maze-exit'
  | 'bridge-lever'
  | 'pattern-pillar'
  | 'crystal-pickup'
  | 'crystal-pedestal'
  | 'secret-door'
  | 'puzzle-shrine'
  | 'istana-gate';

export interface Grade4InteractiveNode {
  id: string;
  kind: Grade4NodeKind;
  bab: number;
  label: string;
  x: number;
  z: number;
  colorHex?: number;
  polygonSides?: number;
  crystalId?: string;
  doorId?: string;
  mesh?: THREE.Object3D;
}

export interface Grade4SecretDoorRuntime {
  id: string;
  bab: number;
  x: number;
  z: number;
  doorLeaf: THREE.Mesh;
  closedY: number;
  openY: number;
  collider: BoxCollider;
}

export interface Grade4CrystalOrbRuntime {
  id: string;
  label: string;
  colorHex: number;
  x: number;
  z: number;
  pedestalX: number;
  pedestalZ: number;
  orbMesh: THREE.Mesh;
  pedestalRing: THREE.Mesh;
}

export interface Grade4Location {
  bab: number;
  chapterId: string;
  name: string;
  shortLabel: string;
  x: number;
  z: number;
  yaw: number;
}

export const GRADE4_LOCATIONS: Grade4Location[] = [
  {
    bab: 1,
    chapterId: 'g4-mat-1',
    name: 'Pulau Utama',
    shortLabel: '1. Pulau Utama',
    x: -14.0,
    z: 10.0,
    yaw: 0.3,
  },
  {
    bab: 2,
    chapterId: 'g4-mat-2',
    name: 'Labirin Angka',
    shortLabel: '2. Labirin Angka',
    x: -22.0,
    z: -8.5,
    yaw: Math.PI,
  },
  {
    bab: 3,
    chapterId: 'g4-mat-3',
    name: 'Jembatan Mekanik',
    shortLabel: '3. Jembatan Mekanik',
    x: -5.5,
    z: 0.0,
    yaw: Math.PI * 0.5,
  },
  {
    bab: 4,
    chapterId: 'g4-mat-4',
    name: 'Hutan Pola & Bentuk',
    shortLabel: '4. Hutan Pola & Bentuk',
    x: -24.0,
    z: 20.5,
    yaw: 0.0,
  },
  {
    bab: 5,
    chapterId: 'g4-mat-5',
    name: 'Gua Kristal',
    shortLabel: '5. Gua Kristal',
    x: 20.0,
    z: 12.0,
    yaw: 0.0,
  },
  {
    bab: 6,
    chapterId: 'g4-mat-6',
    name: 'Menara Logika (Pintu Rahasia)',
    shortLabel: '6. Menara Logika',
    x: 24.0,
    z: 3.5,
    yaw: Math.PI,
  },
  {
    bab: 7,
    chapterId: 'g4-mat-7',
    name: 'Kuil Teka-Teki',
    shortLabel: '7. Kuil Teka-Teki',
    x: 18.0,
    z: -19.5,
    yaw: Math.PI,
  },
  {
    bab: 8,
    chapterId: 'g4-mat-8',
    name: 'Istana Pengetahuan (Ujian Akhir)',
    shortLabel: '8. Istana Pengetahuan',
    x: 32.0,
    z: -21.0,
    yaw: Math.PI,
  },
];

// Non-MCQ Interactive Puzzles for Grade 4 Puzzle Adventure (Mechanisms, Locks, Bridge, Sequences)
export type Grade4PuzzleChallenge =
  | {
      bab: number;
      type: 'number-sequence';
      title: string;
      locationName: string;
      story: string;
      prompt: string;
      sequenceDisplay: string[];
      missingIndex: number;
      expectedNumber: number;
      hint: string;
      explanation: string;
    }
  | {
      bab: number;
      type: 'mechanism-calc';
      title: string;
      locationName: string;
      story: string;
      prompt: string;
      expectedNumber: number;
      unit: string;
      hint: string;
      explanation: string;
    }
  | {
      bab: number;
      type: 'symbol-order';
      title: string;
      locationName: string;
      story: string;
      prompt: string;
      items: string[];
      explanation: string;
    }
  | {
      bab: number;
      type: 'pair-logic';
      title: string;
      locationName: string;
      story: string;
      prompt: string;
      pairs: Array<{ left: string; right: string }>;
      explanation: string;
    };

export const GRADE4_PUZZLES: Grade4PuzzleChallenge[] = [
  {
    bab: 1,
    type: 'mechanism-calc',
    title: 'Kompas Pelabuhan Pulau Utama',
    locationName: 'Pulau Utama',
    story:
      'Untuk menyalakan mercusuar pemandu arah pulau, masukkan jumlah total bilangan ribuan dan ratusan dari peta kuno.',
    prompt: 'Hitung hasil dari 3.450 + 2.350 untuk mengaktifkan kompas pulau!',
    expectedNumber: 5800,
    unit: 'energi',
    hint: '3.000 + 2.000 = 5.000, lalu 450 + 350 = 800.',
    explanation: '3.450 + 2.350 = 5.800 energi pelabuhan.',
  },
  {
    bab: 2,
    type: 'number-sequence',
    title: 'Gerbang Akhir Labirin Angka',
    locationName: 'Labirin Angka',
    story:
      'Di sepanjang lorong Labirin Angka kamu menemukan batu petunjuk pola kelipatan dua.',
    prompt: 'Lengkapi angka terakhir gerbang Labirin Angka:',
    sequenceDisplay: ['6', '12', '24', '?'],
    missingIndex: 3,
    expectedNumber: 48,
    hint: 'Setiap langkah dikalikan 2: 6×2=12, 12×2=24, 24×2=...',
    explanation: 'Pola bilangan ganda (×2) menghasilkan 24 × 2 = 48!',
  },
  {
    bab: 3,
    type: 'mechanism-calc',
    title: 'Mekanisme Tuas Jembatan Mekanik',
    locationName: 'Jembatan Mekanik',
    story:
      'Jembatan penghubung menuju pulau timur sedang terlipat! Tiga roda gigi besar perlu diputar hingga mencapai torsi seimbang.',
    prompt:
      'Setiap roda gigi menghasilkan tenaga 16 satuan. Berapakah total tenaga dari 6 roda gigi (6 × 16) untuk membentangkan Jembatan Mekanik?',
    expectedNumber: 96,
    unit: 'torsi',
    hint: '6 × 10 = 60, lalu 6 × 6 = 36. Jumlahkan!',
    explanation:
      '6 × 16 = 96 torsi! Roda gigi berputar dan Jembatan Mekanik pun terbentang kokoh.',
  },
  {
    bab: 4,
    type: 'symbol-order',
    title: 'Urutan Rune Hutan Pola dan Bentuk',
    locationName: 'Hutan Pola & Bentuk',
    story:
      'Empat pilar batu geometris di hutan ini memancarkan cahaya bila diaktifkan dari jumlah sisi paling sedikit ke paling banyak.',
    prompt: 'Susun urutan aktivasi pilar bangun datar dari sisi tersedikit hingga terbanyak!',
    items: [
      'Segitiga (3 sisi)',
      'Persegi (4 sisi)',
      'Segilima / Pentagon (5 sisi)',
      'Segienam / Heksagon (6 sisi)',
    ],
    explanation:
      'Segi banyak berurutan menurut jumlah sisinya: 3 → 4 → 5 → 6.',
  },
  {
    bab: 5,
    type: 'pair-logic',
    title: 'Resonansi Pecahan Gua Kristal',
    locationName: 'Gua Kristal',
    story:
      'Bawa 3 Kristal Energi di Gua Kristal ke alasnya masing-masing, lalu cocokkan pasangan pecahan senilai & desimalnya!',
    prompt: 'Pasangkan nilai pecahan di kiri dengan bentuk senilai/desimal di kanan.',
    pairs: [
      { left: '1/2', right: '0,5 atau 2/4' },
      { left: '1/4', right: '0,25 atau 2/8' },
      { left: '3/4', right: '0,75 atau 6/8' },
    ],
    explanation: '1/2 = 0,5; 1/4 = 0,25; dan 3/4 = 0,75.',
  },
  {
    bab: 6,
    type: 'number-sequence',
    title: 'Kunci Pintu Rahasia Menara Logika',
    locationName: 'Menara Logika',
    story:
      'Pintu Rahasia batu raksasa menghalangi ruang atas Menara Logika! Pecahkan pola faktor/kelipatan pada kunci pintunya.',
    prompt: 'Temukan angka yang hilang untuk membuka Pintu Rahasia Menara Logika:',
    sequenceDisplay: ['15', '25', '35', '?', '55'],
    missingIndex: 3,
    expectedNumber: 45,
    hint: 'Setiap bilangan bertambah 10 (+10).',
    explanation:
      '35 + 10 = 45! Pintu Rahasia Menara Logika terangkat ke atas.',
  },
  {
    bab: 7,
    type: 'mechanism-calc',
    title: 'Segel Pintu Rahasia Kuil Teka-Teki',
    locationName: 'Kuil Teka-Teki',
    story:
      'Sebuah pintu batu berukir segel luas persegi menjaga Kuil Teka-Teki sebelum Istana Pengetahuan.',
    prompt:
      'Pelat pintu berbentuk persegi dengan panjang sisi 12 cm. Berapakah keliling pelat pintu tersebut (4 × 12 cm)?',
    expectedNumber: 48,
    unit: 'cm',
    hint: 'Keliling persegi = 4 × sisi = 4 × 12.',
    explanation: 'Keliling persegi = 4 × 12 = 48 cm! Pintu Kuil Teka-Teki terbuka!',
  },
  {
    bab: 8,
    type: 'pair-logic',
    title: 'Gerbang Kehormatan Istana Pengetahuan',
    locationName: 'Istana Pengetahuan',
    story:
      'Gerbang Istana Pengetahuan menguji penguasaan gaya, energi, dan kelestarian budaya Nusantara sebelum Ujian Akhir Kelas 4.',
    prompt: 'Cocokkan konsep IPAS & Budaya di kiri dengan penjelasan tepatnya di kanan!',
    pairs: [
      { left: 'Gaya Gesek', right: 'Menghambat gerak di permukaan kasar' },
      { left: 'Energi Kipas Angin', right: 'Listrik menjadi gerak' },
      { left: 'Rumah Adat Tongkonan', right: 'Berasal dari Sulawesi Selatan' },
    ],
    explanation:
      'Kamu siap menghadapi Ujian Akhir Kelas 4 di Istana Pengetahuan!',
  },
];

export const G4_PUZZLE_STORAGE_KEY = 'jelajah_ilmu_g4_puz_v1';

export interface Grade4PuzzleState {
  bridgeExtended: boolean;
  doorsUnlocked: string[];
  mazeClues: string[];
  mazeSolved: boolean;
  patternStep: number; // 0..4 (activated sides 3,4,5,6)
  placedCrystals: string[]; // crystal IDs placed on pedestals
  puzzlesSolved: number[]; // Bab 1..8
  istanaCompleted: boolean;
}

export function createDefaultGrade4State(): Grade4PuzzleState {
  return {
    bridgeExtended: false,
    doorsUnlocked: [],
    mazeClues: [],
    mazeSolved: false,
    patternStep: 0,
    placedCrystals: [],
    puzzlesSolved: [],
    istanaCompleted: false,
  };
}

export function loadGrade4PuzzleState(): Grade4PuzzleState {
  try {
    const raw = localStorage.getItem(G4_PUZZLE_STORAGE_KEY);
    if (!raw) return createDefaultGrade4State();
    const p = JSON.parse(raw) as Partial<Grade4PuzzleState>;
    return {
      bridgeExtended: Boolean(p.bridgeExtended),
      doorsUnlocked: Array.isArray(p.doorsUnlocked) ? p.doorsUnlocked : [],
      mazeClues: Array.isArray(p.mazeClues) ? p.mazeClues : [],
      mazeSolved: Boolean(p.mazeSolved),
      patternStep: typeof p.patternStep === 'number' ? p.patternStep : 0,
      placedCrystals: Array.isArray(p.placedCrystals) ? p.placedCrystals : [],
      puzzlesSolved: Array.isArray(p.puzzlesSolved) ? p.puzzlesSolved : [],
      istanaCompleted: Boolean(p.istanaCompleted),
    };
  } catch {
    return createDefaultGrade4State();
  }
}

export function saveGrade4PuzzleState(state: Grade4PuzzleState): void {
  try {
    localStorage.setItem(G4_PUZZLE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export interface Grade4WorldRuntime {
  nodes: Grade4InteractiveNode[];
  bridgeDeckGroup: THREE.Group;
  bridgeGears: THREE.Mesh[];
  bridgeBarrierWall: THREE.Mesh;
  bridgeBarrierCollider: BoxCollider;
  secretDoors: Grade4SecretDoorRuntime[];
  crystals: Grade4CrystalOrbRuntime[];
  patternPillars: Array<{ sides: number; orb: THREE.Mesh }>;
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
  disposables: Array<{ dispose: () => void }>;
}

function makePuzzleSign(title: string, subtitle: string, bgHex = '#0f172a'): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 112;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 256, 112);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 246, 102);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 23px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 128, 46);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '18px sans-serif';
    ctx.fillText(subtitle, 128, 82);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.05),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
  );
}

export function createCarriedCrystalMesh(colorHex: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.75,
    roughness: 0.2,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mat);
  g.add(gem);
  return g;
}

export function buildGrade4World(
  scene: THREE.Scene,
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture,
  initialState: Grade4PuzzleState
): Grade4WorldRuntime {
  const nodes: Grade4InteractiveNode[] = [];
  const bridgeGears: THREE.Mesh[] = [];
  const secretDoors: Grade4SecretDoorRuntime[] = [];
  const crystals: Grade4CrystalOrbRuntime[] = [];
  const patternPillars: Array<{ sides: number; orb: THREE.Mesh }> = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.78 });
  const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.65,
    roughness: 0.3,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const goldGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.75,
    roughness: 0.25,
  });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.6 });

  disposables.push(
    stoneMat,
    hedgeMat,
    brassMat,
    cyanGlowMat,
    goldGlowMat,
    woodMat,
    roofMat
  );

  // 1. PULAU UTAMA (-14, 10) — Archipelago Harbor Plaza & Compass Altar
  const plazaBase = new THREE.Group();
  const pGy = getRawTerrainHeight(-14, 10, 4);
  plazaBase.position.set(-14, pGy, 10);
  const compassRing = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.2, 24), cyanGlowMat);
  compassRing.rotation.x = -Math.PI / 2;
  compassRing.position.y = 0.05;
  const harborSign = makePuzzleSign('Pulau Utama', 'Mulai Petualangan Teka-Teki', '#0c4a6e');
  harborSign.position.set(0, 2.3, -4.5);
  plazaBase.add(compassRing, harborSign);
  scene.add(plazaBase);

  nodes.push({
    id: 'g4-shrine-1',
    kind: 'puzzle-shrine',
    bab: 1,
    label: 'Pecahkan Kompas Pulau (Bab 1)',
    x: -11.5,
    z: 8.5,
  });

  // 2. LABIRIN ANGKA (-22, -18) — REAL WALKABLE 3D MAZE WITH BOX COLLIDERS!
  const mazeGy = getRawTerrainHeight(-22, -18, 4);
  const mazeWalls: Array<{ cx: number; cz: number; w: number; d: number }> = [
    // Outer perimeter (south gate open at x ∈ [-23.8, -20.2])
    { cx: -29.0, cz: -18.0, w: 0.9, d: 14.8 }, // West wall
    { cx: -15.0, cz: -18.0, w: 0.9, d: 14.8 }, // East wall
    { cx: -22.0, cz: -25.0, w: 14.8, d: 0.9 }, // North wall
    { cx: -26.4, cz: -11.0, w: 5.2, d: 0.9 }, // South-Left wall
    { cx: -17.6, cz: -11.0, w: 5.2, d: 0.9 }, // South-Right wall
    // Inner winding corridor walls (guaranteed >= 2.8m wide passages!)
    { cx: -22.2, cz: -15.0, w: 7.4, d: 0.9 }, // Baffle 1
    { cx: -25.2, cz: -19.2, w: 7.6, d: 0.9 }, // Baffle 2
    { cx: -19.0, cz: -20.8, w: 0.9, d: 3.4 }, // Baffle 3
  ];

  mazeWalls.forEach((mw) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(mw.w, 2.6, mw.d), hedgeMat);
    wall.position.set(mw.cx, mazeGy + 1.25, mw.cz);
    wall.castShadow = true;
    wall.receiveShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(mw.w + 0.15, 0.2, mw.d + 0.15), stoneMat);
    cap.position.set(mw.cx, mazeGy + 2.55, mw.cz);
    scene.add(wall, cap);

    boxColliders.push({
      minX: mw.cx - mw.w / 2,
      maxX: mw.cx + mw.w / 2,
      minZ: mw.cz - mw.d / 2,
      maxZ: mw.cz + mw.d / 2,
    });
  });

  const mazeArchSign = makePuzzleSign('Labirin Angka', 'Ikuti Pola Kelipatan ×2', '#064e3b');
  mazeArchSign.position.set(-22.0, mazeGy + 3.4, -10.4);
  scene.add(mazeArchSign);

  const mazeCluePoints = [
    { id: 'g4-maze-c1', label: 'Batu Petunjuk: 6', x: -16.8, z: -13.0 },
    { id: 'g4-maze-c2', label: 'Batu Petunjuk: 12', x: -16.8, z: -21.2 },
    { id: 'g4-maze-c3', label: 'Batu Petunjuk: 24', x: -26.0, z: -22.4 },
  ];
  mazeCluePoints.forEach((mc) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 1.1, 8), stoneMat);
    pillar.position.set(mc.x, mazeGy + 0.55, mc.z);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), cyanGlowMat);
    gem.position.set(mc.x, mazeGy + 1.45, mc.z);
    scene.add(pillar, gem);
    nodes.push({
      id: mc.id,
      kind: 'maze-clue',
      bab: 2,
      label: mc.label,
      x: mc.x,
      z: mc.z,
      mesh: gem,
    });
  });

  // Exit Relic Chest inside Maze North-West Chamber (-22.0, -22.5)
  const exitPedestal = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), brassMat);
  exitPedestal.position.set(-22.0, mazeGy + 0.45, -22.5);
  const exitOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), goldGlowMat);
  exitOrb.position.set(-22.0, mazeGy + 1.4, -22.5);
  scene.add(exitPedestal, exitOrb);
  nodes.push({
    id: 'g4-maze-exit',
    kind: 'maze-exit',
    bab: 2,
    label: 'Buka Gerbang Labirin Angka (Bab 2)',
    x: -22.0,
    z: -22.5,
    mesh: exitOrb,
  });

  // 3. JEMBATAN MEKANIK (GRADE4_BRIDGE at x=4, z=0) — Retractable Drawbridge + Gear Console!
  const bridgePylonW = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.8, 4.8), stoneMat);
  bridgePylonW.position.set(GRADE4_BRIDGE.centerX - GRADE4_BRIDGE.halfWidthX, 0.9, 0);
  const bridgePylonE = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.8, 4.8), stoneMat);
  bridgePylonE.position.set(GRADE4_BRIDGE.centerX + GRADE4_BRIDGE.halfWidthX, 0.9, 0);
  scene.add(bridgePylonW, bridgePylonE);

  // Turning brass gears flanking West abutment
  [-2.2, 2.2].forEach((gz) => {
    const gear = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.2, 6, 8), brassMat);
    gear.position.set(-2.2, 1.65, gz);
    scene.add(gear);
    bridgeGears.push(gear);
  });

  // Sliding bridge deck group (moves from retracted X=-8.5/tilted up to full span!)
  const bridgeDeckGroup = new THREE.Group();
  const deckWood = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.38, 4.1), woodMat);
  deckWood.castShadow = true;
  deckWood.receiveShadow = true;
  const trimL = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.26, 0.25), brassMat);
  trimL.position.set(0, 0.3, -1.9);
  const trimR = trimL.clone();
  trimR.position.set(0, 0.3, 1.9);
  bridgeDeckGroup.add(deckWood, trimL, trimR);
  // Pivot on West side (-2.2, 0.96, 0) so rotating Z tilts it up like a real drawbridge when retracted!
  deckWood.position.set(6.2, 0, 0);
  trimL.position.x = 6.2;
  trimR.position.x = 6.2;
  bridgeDeckGroup.position.set(-2.2, GRADE4_BRIDGE.deckHeight, 0);
  bridgeDeckGroup.rotation.z = initialState.bridgeExtended ? 0 : 0.72;
  scene.add(bridgeDeckGroup);

  // Glowing barrier laser & invisible collider blocking crossing until bridgeExtended === true
  const barrierMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.65,
  });
  disposables.push(barrierMat);
  const bridgeBarrierWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 4.4), barrierMat);
  bridgeBarrierWall.position.set(-1.3, 1.6, 0);
  bridgeBarrierWall.visible = !initialState.bridgeExtended;
  scene.add(bridgeBarrierWall);

  const bridgeBarrierCollider: BoxCollider = initialState.bridgeExtended
    ? { minX: 999, maxX: 999, minZ: 999, maxZ: 999 }
    : { minX: -1.6, maxX: 1.5, minZ: -3.2, maxZ: 3.2 };
  boxColliders.push(bridgeBarrierCollider);

  // Tuas Jembatan Mekanik console at (-4.0, 0)
  const leverGy = getRawTerrainHeight(-4.0, 2.2, 4);
  const consoleBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 1.1), stoneMat);
  consoleBase.position.set(-4.0, leverGy + 0.6, 2.2);
  const consoleCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.38, 0),
    initialState.bridgeExtended ? cyanGlowMat : goldGlowMat
  );
  consoleCrystal.position.set(-4.0, leverGy + 1.55, 2.2);
  const bridgeSign = makePuzzleSign('Jembatan Mekanik', 'Pecahkan Mekanisme Torsi', '#78350f');
  bridgeSign.position.set(-3.2, leverGy + 2.8, -2.8);
  bridgeSign.rotation.y = Math.PI * 0.5;
  scene.add(consoleBase, consoleCrystal, bridgeSign);
  nodes.push({
    id: 'g4-bridge-lever',
    kind: 'bridge-lever',
    bab: 3,
    label: initialState.bridgeExtended
      ? 'Jembatan Mekanik Sudah Aktif'
      : 'Aktifkan Jembatan Mekanik (Bab 3)',
    x: -4.0,
    z: 2.2,
    mesh: consoleCrystal,
  });

  // 4. HUTAN POLA DAN BENTUK (-24, 24) — 4 Geometric Polygon Pillars (3, 4, 5, 6 sides!)
  const patGy = getRawTerrainHeight(-24, 24, 4);
  const patSign = makePuzzleSign('Hutan Pola & Bentuk', 'Urutkan Sisi: 3 → 4 → 5 → 6', '#065f46');
  patSign.position.set(-24, patGy + 2.8, 18.5);
  scene.add(patSign);

  const polygonSpecs = [
    { sides: 3, label: 'Pilar Segitiga (3 Sisi)', x: -27.5, z: 22.0, color: 0xef4444 },
    { sides: 4, label: 'Pilar Persegi (4 Sisi)', x: -20.5, z: 22.0, color: 0x3b82f6 },
    { sides: 5, label: 'Pilar Segilima (5 Sisi)', x: -27.5, z: 27.5, color: 0x10b981 },
    { sides: 6, label: 'Pilar Segienam (6 Sisi)', x: -20.5, z: 27.5, color: 0xf59e0b },
  ];
  polygonSpecs.forEach((ps, idx) => {
    const gy = getRawTerrainHeight(ps.x, ps.z, 4);
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.72, 1.5, ps.sides),
      stoneMat
    );
    col.position.set(ps.x, gy + 0.75, ps.z);
    const lit = initialState.patternStep > idx;
    const orb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.45, ps.sides),
      new THREE.MeshStandardMaterial({
        color: ps.color,
        emissive: ps.color,
        emissiveIntensity: lit ? 0.9 : 0.2,
      })
    );
    orb.position.set(ps.x, gy + 1.85, ps.z);
    scene.add(col, orb);
    patternPillars.push({ sides: ps.sides, orb });
    nodes.push({
      id: `g4-pattern-${ps.sides}`,
      kind: 'pattern-pillar',
      bab: 4,
      label: ps.label,
      x: ps.x,
      z: ps.z,
      polygonSides: ps.sides,
      mesh: orb,
    });
  });

  // 5. GUA KRISTAL (20, 16) — Pick-Up, Carry & Place Crystals onto Matching Pedestals!
  const caveGy = getRawTerrainHeight(20, 16, 4);
  const caveArch = new THREE.Group();
  caveArch.position.set(20, caveGy - 0.05, 19.5);
  [-3.2, 3.2].forEach((cx) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 0), stoneMat);
    rock.scale.set(1.0, 1.9, 1.2);
    rock.position.set(cx, 1.8, 0);
    caveArch.add(rock);
  });
  const topRock = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2, 0), stoneMat);
  topRock.scale.set(2.0, 0.85, 1.2);
  topRock.position.set(0, 3.9, 0);
  const caveSign = makePuzzleSign('Gua Kristal', 'Ambil & Pasang 3 Kristal', '#312e81');
  caveSign.position.set(0, 5.1, 1.4);
  caveArch.add(topRock, caveSign);
  scene.add(caveArch);

  const crystalSpecs = [
    {
      id: 'kris-merah',
      label: 'Kristal Merah (1/2)',
      color: 0xef4444,
      x: 15.5,
      z: 14.0,
      px: 17.5,
      pz: 19.2,
    },
    {
      id: 'kris-biru',
      label: 'Kristal Biru (1/4)',
      color: 0x38bdf8,
      x: 24.5,
      z: 14.0,
      px: 20.0,
      pz: 20.5,
    },
    {
      id: 'kris-hijau',
      label: 'Kristal Hijau (3/4)',
      color: 0x22c55e,
      x: 20.0,
      z: 12.2,
      px: 22.5,
      pz: 19.2,
    },
  ];

  crystalSpecs.forEach((cs) => {
    const isPlaced = initialState.placedCrystals.includes(cs.id);
    const orbGy = getRawTerrainHeight(cs.x, cs.z, 4);
    const pedGy = getRawTerrainHeight(cs.px, cs.pz, 4);

    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.75, 10), stoneMat);
    ped.position.set(cs.px, pedGy + 0.37, cs.pz);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.9, 16),
      new THREE.MeshBasicMaterial({ color: cs.color, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(cs.px, pedGy + 0.06, cs.pz);
    scene.add(ped, ring);

    const orbMat = new THREE.MeshStandardMaterial({
      color: cs.color,
      emissive: cs.color,
      emissiveIntensity: 0.75,
      roughness: 0.2,
    });
    const orbMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), orbMat);
    orbMesh.position.set(
      isPlaced ? cs.px : cs.x,
      (isPlaced ? pedGy + 1.25 : orbGy + 0.85),
      isPlaced ? cs.pz : cs.z
    );
    scene.add(orbMesh);

    crystals.push({
      id: cs.id,
      label: cs.label,
      colorHex: cs.color,
      x: cs.x,
      z: cs.z,
      pedestalX: cs.px,
      pedestalZ: cs.pz,
      orbMesh,
      pedestalRing: ring,
    });

    nodes.push({
      id: `pickup-${cs.id}`,
      kind: 'crystal-pickup',
      bab: 5,
      label: `Ambil ${cs.label}`,
      x: cs.x,
      z: cs.z,
      crystalId: cs.id,
      colorHex: cs.color,
      mesh: orbMesh,
    });
    nodes.push({
      id: `ped-${cs.id}`,
      kind: 'crystal-pedestal',
      bab: 5,
      label: `Pasang di Alas ${cs.label}`,
      x: cs.px,
      z: cs.pz,
      crystalId: cs.id,
      colorHex: cs.color,
    });
  });

  // 6. MENARA LOGIKA (24, -2) — Tall Tower + Interactive SECRET DOOR 1!
  const towerX = 25.0;
  const towerZ = -2.0;
  const tGy = getRawTerrainHeight(towerX, towerZ, 4);
  const towerFrame = new THREE.Group();
  towerFrame.position.set(towerX, tGy, towerZ);
  // Left, Right & Back walls leaving front doorway facing West/South (x=towerX, z=towerZ+2.2)
  const backW = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.2, 0.8), stoneMat);
  backW.position.set(0, 2.6, -2.2);
  const leftW = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.2, 4.6), stoneMat);
  leftW.position.set(-2.2, 2.6, 0);
  const rightW = leftW.clone();
  rightW.position.set(2.2, 2.6, 0);
  const towerCap = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.6, 4), roofMat);
  towerCap.position.set(0, 6.4, 0);
  towerCap.rotation.y = Math.PI / 4;
  const towerSign = makePuzzleSign('Menara Logika', 'Pintu Rahasia Pola', '#0e7490');
  towerSign.position.set(0, 4.3, 2.6);
  towerFrame.add(backW, leftW, rightW, towerCap, towerSign);
  scene.add(towerFrame);

  boxColliders.push(
    { minX: towerX - 2.6, maxX: towerX + 2.6, minZ: towerZ - 2.6, maxZ: towerZ - 1.8 },
    { minX: towerX - 2.6, maxX: towerX - 1.8, minZ: towerZ - 2.2, maxZ: towerZ + 2.2 },
    { minX: towerX + 1.8, maxX: towerX + 2.6, minZ: towerZ - 2.2, maxZ: towerZ + 2.2 }
  );

  const door1Open = initialState.doorsUnlocked.includes('door-menara');
  const door1Leaf = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 3.4, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.45, metalness: 0.3 })
  );
  door1Leaf.position.set(towerX, tGy + (door1Open ? 5.2 : 1.7), towerZ + 2.0);
  scene.add(door1Leaf);
  const door1Collider: BoxCollider = door1Open
    ? { minX: 999, maxX: 999, minZ: 999, maxZ: 999 }
    : { minX: towerX - 1.8, maxX: towerX + 1.8, minZ: towerZ + 1.7, maxZ: towerZ + 2.3 };
  boxColliders.push(door1Collider);
  secretDoors.push({
    id: 'door-menara',
    bab: 6,
    x: towerX,
    z: towerZ + 2.0,
    doorLeaf: door1Leaf,
    closedY: tGy + 1.7,
    openY: tGy + 5.2,
    collider: door1Collider,
  });

  // Treasure crystal inside Menara behind Secret Door!
  const towerTreasure = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), goldGlowMat);
  towerTreasure.position.set(towerX, tGy + 1.15, towerZ);
  scene.add(towerTreasure);

  nodes.push({
    id: 'g4-door-menara',
    kind: 'secret-door',
    bab: 6,
    doorId: 'door-menara',
    label: door1Open ? 'Pintu Menara Logika Terbuka' : 'Buka Pintu Rahasia Menara (Bab 6)',
    x: towerX,
    z: towerZ + 2.8,
  });

  // 7. KUIL TEKA-TEKI (18, -24) — Temple Chamber + SECRET DOOR 2!
  const templeX = 18.0;
  const templeZ = -24.5;
  const kGy = getRawTerrainHeight(templeX, templeZ, 4);
  const templeGroup = new THREE.Group();
  templeGroup.position.set(templeX, kGy, templeZ);
  const tBack = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.2, 0.8), stoneMat);
  tBack.position.set(0, 2.1, -2.4);
  const tLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.2, 4.8), stoneMat);
  tLeft.position.set(-2.4, 2.1, 0);
  const tRight = tLeft.clone();
  tRight.position.set(2.4, 2.1, 0);
  const tRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.1, 4), brassMat);
  tRoof.position.set(0, 5.2, 0);
  tRoof.rotation.y = Math.PI / 4;
  const kuilSign = makePuzzleSign('Kuil Teka-Teki', 'Pintu Segel Persegi', '#7c2d12');
  kuilSign.position.set(0, 4.0, 2.6);
  templeGroup.add(tBack, tLeft, tRight, tRoof, kuilSign);
  scene.add(templeGroup);

  boxColliders.push(
    { minX: templeX - 2.8, maxX: templeX + 2.8, minZ: templeZ - 2.8, maxZ: templeZ - 2.0 },
    { minX: templeX - 2.8, maxX: templeX - 2.0, minZ: templeZ - 2.4, maxZ: templeZ + 2.4 },
    { minX: templeX + 2.0, maxX: templeX + 2.8, minZ: templeZ - 2.4, maxZ: templeZ + 2.4 }
  );

  const door2Open = initialState.doorsUnlocked.includes('door-kuil');
  const door2Leaf = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 3.2, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45, metalness: 0.35 })
  );
  door2Leaf.position.set(templeX, kGy + (door2Open ? 4.8 : 1.6), templeZ + 2.2);
  scene.add(door2Leaf);
  const door2Collider: BoxCollider = door2Open
    ? { minX: 999, maxX: 999, minZ: 999, maxZ: 999 }
    : { minX: templeX - 1.9, maxX: templeX + 1.9, minZ: templeZ + 1.9, maxZ: templeZ + 2.5 };
  boxColliders.push(door2Collider);
  secretDoors.push({
    id: 'door-kuil',
    bab: 7,
    x: templeX,
    z: templeZ + 2.2,
    doorLeaf: door2Leaf,
    closedY: kGy + 1.6,
    openY: kGy + 4.8,
    collider: door2Collider,
  });

  nodes.push({
    id: 'g4-door-kuil',
    kind: 'secret-door',
    bab: 7,
    doorId: 'door-kuil',
    label: door2Open ? 'Pintu Kuil Terbuka' : 'Buka Pintu Rahasia Kuil (Bab 7)',
    x: templeX,
    z: templeZ + 3.0,
  });

  // 8. ISTANA PENGETAHUAN (32, -26) — Grand Final Exam Palace!
  const istanaX = 32.0;
  const istanaZ = -26.5;
  const iGy = getRawTerrainHeight(istanaX, istanaZ, 4);
  const istanaGroup = new THREE.Group();
  istanaGroup.position.set(istanaX, iGy - 0.1, istanaZ);
  const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.7, 7.6), stoneMat);
  plinth1.position.y = 0.35;
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 3.6, 5.2),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 })
  );
  hall.position.y = 2.5;
  hall.castShadow = true;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(4.4, 3.2, 4), brassMat);
  spire.position.y = 5.9;
  spire.rotation.y = Math.PI / 4;
  const crownOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), cyanGlowMat);
  crownOrb.position.y = 8.1;
  const istanaSign = makePuzzleSign('Istana Pengetahuan', 'Ujian Akhir Kelas 4', '#1e1b4b');
  istanaSign.position.set(0, 4.4, 3.0);
  istanaGroup.add(plinth1, hall, spire, crownOrb, istanaSign);
  scene.add(istanaGroup);

  boxColliders.push({
    minX: istanaX - 3.6,
    maxX: istanaX + 3.6,
    minZ: istanaZ - 2.9,
    maxZ: istanaZ + 2.9,
  });

  nodes.push({
    id: 'g4-istana-gate',
    kind: 'istana-gate',
    bab: 8,
    label: 'Gerbang Istana Pengetahuan (Ujian Akhir)',
    x: istanaX,
    z: istanaZ + 4.3,
  });

  return {
    nodes,
    bridgeDeckGroup,
    bridgeGears,
    bridgeBarrierWall,
    bridgeBarrierCollider,
    secretDoors,
    crystals,
    patternPillars,
    boxColliders,
    circleColliders,
    disposables,
  };
}
