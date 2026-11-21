import * as THREE from 'three';
import { createWoodenBridge } from './models';
import {
  BoxCollider,
  CircleCollider,
  getRawTerrainHeight,
  GRADE3_BRIDGE,
} from './terrain';

export type Grade3NodeKind =
  | 'clue-scroll'
  | 'specimen-pod'
  | 'hidden-relic'
  | 'lab-scanner'
  | 'kuil-altar';

export interface Grade3InteractiveNode {
  id: string;
  kind: Grade3NodeKind;
  bab: number;
  label: string;
  x: number;
  z: number;
  message: string;
  statusMesh?: THREE.Object3D;
}

export interface Grade3Location {
  bab: number;
  chapterId: string;
  name: string;
  shortLabel: string;
  x: number;
  z: number;
  yaw: number;
}

export const GRADE3_LOCATIONS: Grade3Location[] = [
  {
    bab: 1,
    chapterId: 'g3-bi-1',
    name: 'Desa Kecil di Tepi Hutan',
    shortLabel: '1. Desa Tepi Hutan',
    x: -15.5,
    z: 14.0,
    yaw: 0.4,
  },
  {
    bab: 2,
    chapterId: 'g3-bi-2',
    name: 'Sungai & Jembatan Kayu',
    shortLabel: '2. Sungai & Jembatan',
    x: -5.4,
    z: 0.0,
    yaw: Math.PI * 0.5,
  },
  {
    bab: 3,
    chapterId: 'g3-bi-3',
    name: 'Hutan Tropis & Ekosistem',
    shortLabel: '3. Hutan Tropis',
    x: -18.0,
    z: -12.0,
    yaw: 0.2,
  },
  {
    bab: 4,
    chapterId: 'g3-bi-4',
    name: 'Kebun & Area Pertanian',
    shortLabel: '4. Kebun Pertanian',
    x: -23.5,
    z: 23.5,
    yaw: -0.6,
  },
  {
    bab: 5,
    chapterId: 'g3-bi-5',
    name: 'Air Terjun & Siklus Air',
    shortLabel: '5. Air Terjun',
    x: 19.8,
    z: -15.2,
    yaw: 0.65,
  },
  {
    bab: 6,
    chapterId: 'g3-bi-6',
    name: 'Gua Misterius',
    shortLabel: '6. Gua Misterius',
    x: -22.0,
    z: -26.5,
    yaw: 0.1,
  },
  {
    bab: 7,
    chapterId: 'g3-bi-7',
    name: 'Laboratorium Alam',
    shortLabel: '7. Laboratorium Alam',
    x: 18.0,
    z: 12.0,
    yaw: -0.4,
  },
  {
    bab: 8,
    chapterId: 'g3-bi-8',
    name: 'Kuil Pengetahuan (Ujian Akhir)',
    shortLabel: '8. Kuil Pengetahuan',
    x: 22.0,
    z: 24.0,
    yaw: 0.0,
  },
];

// Non-MCQ Interactive Exploration Challenges (1 tailored interactive puzzle/task per Region/Bab 1..8)
export type Grade3Challenge =
  | {
      bab: number;
      type: 'word-decode';
      title: string;
      locationName: string;
      storyClue: string;
      prompt: string;
      hint: string;
      acceptedAnswers: string[];
      explanation: string;
    }
  | {
      bab: number;
      type: 'number-input';
      title: string;
      locationName: string;
      storyClue: string;
      prompt: string;
      hint: string;
      unit: string;
      expectedNumber: number;
      explanation: string;
    }
  | {
      bab: number;
      type: 'order-sequence';
      title: string;
      locationName: string;
      storyClue: string;
      prompt: string;
      items: string[]; // correct order from index 0 -> n-1
      explanation: string;
    }
  | {
      bab: number;
      type: 'classify-pairs';
      title: string;
      locationName: string;
      storyClue: string;
      prompt: string;
      pairs: Array<{ left: string; right: string }>;
      explanation: string;
    };

export const GRADE3_CHALLENGES: Grade3Challenge[] = [
  {
    bab: 1,
    type: 'classify-pairs',
    title: 'Misi Arsip Desa: Bagian Tumbuhan & Fungsi',
    locationName: 'Desa Kecil di Tepi Hutan',
    storyClue:
      'Penjaga Desa meninggalkan catatan tumbuhan obat yang hilang labelnya. Cocokkan bagian tumbuhan dengan fungsinya!',
    prompt: 'Pasangkan setiap bagian tumbuhan di sebelah kiri dengan fungsi tepatnya di sebelah kanan.',
    pairs: [
      { left: 'Akar', right: 'Menyerap air & mineral' },
      { left: 'Batang', right: 'Mengalirkan zat hara' },
      { left: 'Daun', right: 'Tempat fotosintesis' },
    ],
    explanation:
      'Akar menyerap air dari tanah, batang menyalurkan ke seluruh bagian, dan daun memasak makanan lewat fotosintesis.',
  },
  {
    bab: 2,
    type: 'number-input',
    title: 'Teka-Teki Jembatan Sungai',
    locationName: 'Sungai & Jembatan Kayu',
    storyClue:
      'Papan jembatan memiliki 4 ruas. Setiap ruas disusun dari 18 bilah kayu ulin yang kuat.',
    prompt:
      'Hitunglah jumlah seluruh bilah kayu pada 4 ruas jembatan tersebut (4 × 18)!',
    hint: 'Kalikan 4 dengan 10 (40) lalu tambah 4 × 8 (32).',
    unit: 'bilah kayu',
    expectedNumber: 72,
    explanation: '4 × 18 = (4 × 10) + (4 × 8) = 40 + 32 = 72 bilah kayu.',
  },
  {
    bab: 3,
    type: 'order-sequence',
    title: 'Susun Rantai Makanan Hutan Tropis',
    locationName: 'Hutan Tropis',
    storyClue:
      'Di Hutan Tropis kamu mengamati rumput dimakan rusa atau belalang, lalu dimangsa predator, hingga diurai jamur.',
    prompt:
      'Klik tahapan rantai makanan di bawah ini secara berurutan dari Produsen sampai Pengurai!',
    items: [
      'Padi / Rumput (Produsen)',
      'Belalang (Konsumen I)',
      'Katak Hutan (Konsumen II)',
      'Burung Elang (Konsumen Puncak)',
      'Jamur Pengurai (Dekomposer)',
    ],
    explanation:
      'Energi mengalir dari produsen (tumbuhan) → herbivora → karnivora → pengurai yang menyuburkan tanah kembali.',
  },
  {
    bab: 4,
    type: 'word-decode',
    title: 'Sandi Kosakata Kebun Pertanian',
    locationName: 'Kebun & Area Pertanian',
    storyClue:
      'Petani membutuhkan satu istilah IPA untuk proses tumbuhan hijau membuat makanan dengan bantuan cahaya matahari.',
    prompt:
      'Ketikkan nama proses tumbuhan hijau membuat makanan dengan bantuan cahaya matahari:',
    hint: 'Terdiri dari 11 huruf, diawali "FOTO..."',
    acceptedAnswers: ['fotosintesis'],
    explanation:
      'Fotosintesis adalah proses tumbuhan hijau mengubah air dan karbon dioksida dengan cahaya matahari menjadi glukosa & oksigen.',
  },
  {
    bab: 5,
    type: 'order-sequence',
    title: 'Urutkan Siklus Air Terjun',
    locationName: 'Air Terjun',
    storyClue:
      'Amati uap air sungai yang naik karena panas matahari lalu turun kembali membasahi puncak gunung.',
    prompt:
      'Klik proses siklus air secara berurutan dari penguapan sampai kembali ke sungai!',
    items: [
      'Evaporasi (Air menguap terkena matahari)',
      'Kondensasi (Uap mendingin jadi awan)',
      'Presipitasi (Turun titik-titik hujan)',
      'Aliran sungai menuju air terjun & laut',
    ],
    explanation:
      'Siklus air berputar terus menerus: Evaporasi → Kondensasi → Presipitasi → Aliran kembali.',
  },
  {
    bab: 6,
    type: 'number-input',
    title: 'Kode Peti Gua Misterius',
    locationName: 'Gua Misterius',
    storyClue:
      'Di dinding gua tertulis teka-teki bilangan ribuan: "Aku adalah bilangan 6 ratusan + 4 puluhan + 7 satuan, ditambah 250."',
    prompt: 'Berapakah bilangan kode pembuka peti Gua Misterius tersebut?',
    hint: 'Ubah 6 ratusan + 4 puluhan + 7 satuan menjadi 647, lalu tambah 250.',
    unit: 'kode',
    expectedNumber: 897,
    explanation: '647 + 250 = 897!',
  },
  {
    bab: 7,
    type: 'classify-pairs',
    title: 'Uji Laboratorium Alam: Wujud Benda',
    locationName: 'Laboratorium Alam',
    storyClue:
      'Asisten Laboratorium Alam mengumpulkan sampel benda dari hutan. Kelompokkan tiap benda ke wujud zatnya!',
    prompt: 'Pasangkan sampel hutan di kiri dengan wujud zat yang tepat di kanan.',
    pairs: [
      { left: 'Batu Granit Gua', right: 'Padat (bentuk tetap)' },
      { left: 'Air Sungai Jernih', right: 'Cair (ikuti wadah)' },
      { left: 'Udara Segar Rimba', right: 'Gas (isi seluruh ruang)' },
    ],
    explanation:
      'Benda padat memiliki bentuk tetap, cair mengikuti wadah, dan gas menyebar mengisi ruangan.',
  },
  {
    bab: 8,
    type: 'word-decode',
    title: 'Prasasti Pancasila Kuil Pengetahuan',
    locationName: 'Kuil Pengetahuan',
    storyClue:
      'Prasasti Kuil menanyakan sikap bekerja sama warga desa membersihkan saluran irigasi hutan agar tetap bersih dan rukun.',
    prompt:
      'Ketikkan istilah budaya kerja sama khas bangsa Indonesia (2 kata):',
    hint: 'Diawali "GOTONG ..."',
    acceptedAnswers: ['gotong royong', 'gotong-royong'],
    explanation:
      'Gotong royong merupakan pengamalan nilai persatuan dan kebersamaan masyarakat Indonesia.',
  },
];

export const G3_EXP_STORAGE_KEY = 'jelajah_ilmu_g3_exp_v1';

export interface Grade3ExpState {
  cluesFound: string[];
  specimensObserved: string[];
  relicsFound: string[];
  challengesSolved: number[];
  kuilCompleted: boolean;
}

export function createDefaultGrade3State(): Grade3ExpState {
  return {
    cluesFound: [],
    specimensObserved: [],
    relicsFound: [],
    challengesSolved: [],
    kuilCompleted: false,
  };
}

export function loadGrade3ExpState(): Grade3ExpState {
  try {
    const raw = localStorage.getItem(G3_EXP_STORAGE_KEY);
    if (!raw) return createDefaultGrade3State();
    const p = JSON.parse(raw) as Partial<Grade3ExpState>;
    return {
      cluesFound: Array.isArray(p.cluesFound) ? p.cluesFound : [],
      specimensObserved: Array.isArray(p.specimensObserved) ? p.specimensObserved : [],
      relicsFound: Array.isArray(p.relicsFound) ? p.relicsFound : [],
      challengesSolved: Array.isArray(p.challengesSolved) ? p.challengesSolved : [],
      kuilCompleted: Boolean(p.kuilCompleted),
    };
  } catch {
    return createDefaultGrade3State();
  }
}

export function saveGrade3ExpState(state: Grade3ExpState): void {
  try {
    localStorage.setItem(G3_EXP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export interface Grade3WorldRuntime {
  nodes: Grade3InteractiveNode[];
  waterfallBands: THREE.Mesh[];
  glowingMushrooms: THREE.Mesh[];
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
  disposables: Array<{ dispose: () => void }>;
}

function makeCanvasSign(title: string, subtitle: string, bgHex: string): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 112;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 256, 112);
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 246, 102);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 128, 48);
    ctx.fillStyle = '#ecfdf5';
    ctx.font = '18px sans-serif';
    ctx.fillText(subtitle, 128, 82);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 1.0),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
  );
  return mesh;
}

export function buildGrade3World(
  scene: THREE.Scene,
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture
): Grade3WorldRuntime {
  const nodes: Grade3InteractiveNode[] = [];
  const waterfallBands: THREE.Mesh[] = [];
  const glowingMushrooms: THREE.Mesh[] = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.78 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.65 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.92 });
  const emeraldGlowMat = new THREE.MeshStandardMaterial({
    color: 0x6ee7b7,
    emissive: 0x10b981,
    emissiveIntensity: 0.75,
    roughness: 0.25,
  });
  const amberGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.7,
    roughness: 0.3,
  });
  const waterCascadeMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.85,
    roughness: 0.15,
  });
  disposables.push(
    woodMat,
    roofMat,
    stoneMat,
    mossMat,
    soilMat,
    emeraldGlowMat,
    amberGlowMat,
    waterCascadeMat
  );

  // 1. SUNGAI & JEMBATAN KAYU (x=2, z=0)
  const bridge = createWoodenBridge(woodTex);
  bridge.position.set(GRADE3_BRIDGE.centerX, 0, GRADE3_BRIDGE.centerZ);
  scene.add(bridge);

  // 2. DESA KECIL DI TEPI HUTAN (-16, 14) — 2 wooden explorer huts + campfire
  const hutSpots = [
    { x: -19.5, z: 10.5, rotY: 0.3, label: 'Pos Desa Rimba' },
    { x: -12.5, z: 18.0, rotY: -0.5, label: 'Balai Penjaga' },
  ];
  hutSpots.forEach((hs) => {
    const g = new THREE.Group();
    const gy = getRawTerrainHeight(hs.x, hs.z, 3);
    g.position.set(hs.x, gy - 0.05, hs.z);
    g.rotation.y = hs.rotY;

    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 4.4), woodMat);
    deck.position.y = 0.4;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 2.2, 3.6),
      new THREE.MeshStandardMaterial({ color: 0xd1fae5, roughness: 0.75 })
    );
    cabin.position.y = 1.75;
    cabin.castShadow = true;
    const thatch = new THREE.Mesh(new THREE.ConeGeometry(3.8, 1.8, 4), roofMat);
    thatch.position.y = 3.75;
    thatch.rotation.y = Math.PI / 4;
    thatch.castShadow = true;
    const sign = makeCanvasSign(hs.label, 'Desa Tepi Hutan', '#064e3b');
    sign.position.set(0, 3.1, 2.3);
    g.add(deck, cabin, thatch, sign);
    scene.add(g);
    boxColliders.push({
      minX: hs.x - 2.6,
      maxX: hs.x + 2.6,
      minZ: hs.z - 2.2,
      maxZ: hs.z + 2.2,
    });
  });

  // 3. KEBUN & AREA PERTANIAN (-24, 24)
  const farmBase = new THREE.Group();
  const fGy = getRawTerrainHeight(-24, 24, 3);
  farmBase.position.set(-24, fGy, 24);
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 1.4), soilMat);
      bed.position.set((col - 1) * 2.8, 0.12, (row - 0.5) * 2.4);
      const sprout = new THREE.Mesh(
        new THREE.ConeGeometry(0.42, 0.9, 6),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75 })
      );
      sprout.position.set((col - 1) * 2.8, 0.65, (row - 0.5) * 2.4);
      farmBase.add(bed, sprout);
    }
  }
  const farmSign = makeCanvasSign('Kebun & Pertanian', 'Tanaman & Pangan', '#14532d');
  farmSign.position.set(0, 2.0, -3.5);
  farmBase.add(farmSign);
  scene.add(farmBase);

  // 4. AIR TERJUN & TEBING BATU (cliff around 29, -22, cascade facing toward observer at 20, -15)
  const fallsGroup = new THREE.Group();
  const cliffY = getRawTerrainHeight(26.5, -20, 3);
  fallsGroup.position.set(27.5, Math.max(0.2, cliffY), -21.5);
  fallsGroup.rotation.y = -Math.PI * 0.72;

  const cliffRock = new THREE.Mesh(new THREE.DodecahedronGeometry(4.6, 1), stoneMat);
  cliffRock.scale.set(1.4, 1.9, 1.0);
  cliffRock.position.set(0, 3.8, -1.8);
  cliffRock.castShadow = true;
  fallsGroup.add(cliffRock);

  // Shimmering animated water cascade bands
  for (let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(2.8 - i * 0.3, 6.8, 0.45), waterCascadeMat);
    band.position.set((i - 1) * 0.8, 3.5, 1.45 + i * 0.08);
    fallsGroup.add(band);
    waterfallBands.push(band);
  }
  const foamRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.32, 8, 20), waterCascadeMat);
  foamRing.rotation.x = Math.PI / 2;
  foamRing.position.set(0, 0.2, 2.2);
  fallsGroup.add(foamRing);
  scene.add(fallsGroup);
  circleColliders.push({ x: 27.5, z: -21.5, radius: 4.0 });

  // 5. GUA MISTERIUS (-22, -29.5) — Rocky stone arch & glowing crystal cluster inside
  const caveGroup = new THREE.Group();
  const cGy = getRawTerrainHeight(-22, -29.5, 3);
  caveGroup.position.set(-22, cGy - 0.1, -29.5);
  [-2.8, 2.8].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1, 0), stoneMat);
    pillar.scale.set(1.0, 2.1, 1.3);
    pillar.position.set(px, 1.9, 0);
    pillar.castShadow = true;
    caveGroup.add(pillar);
  });
  const archTop = new THREE.Mesh(new THREE.DodecahedronGeometry(3.3, 0), stoneMat);
  archTop.scale.set(1.9, 0.9, 1.4);
  archTop.position.set(0, 4.1, -0.2);
  archTop.castShadow = true;
  const caveBack = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 4.4, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 })
  );
  caveBack.position.set(0, 2.1, -2.5);
  const caveCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), emeraldGlowMat);
  caveCrystal.position.set(0, 1.3, -0.6);
  const caveSign = makeCanvasSign('Gua Misterius', 'Artefak & Rahasia', '#1e293b');
  caveSign.position.set(0, 5.4, 1.5);
  caveGroup.add(archTop, caveBack, caveCrystal, caveSign);
  scene.add(caveGroup);
  boxColliders.push({ minX: -26.0, maxX: -18.0, minZ: -32.2, maxZ: -29.8 });

  // 6. LABORATORIUM ALAM (18, 12) — Open forest timber pavilion + microscope & specimen jars
  const labGroup = new THREE.Group();
  const lGy = getRawTerrainHeight(18, 12, 3);
  labGroup.position.set(18, lGy - 0.05, 12);
  const labDeck = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.35, 5.4), woodMat);
  labDeck.position.y = 0.18;
  labGroup.add(labDeck);
  [-2.9, 2.9].forEach((lx) => {
    [-2.2, 2.2].forEach((lz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.0, 8), woodMat);
      post.position.set(lx, 1.65, lz);
      labGroup.add(post);
    });
  });
  const labRoof = new THREE.Mesh(new THREE.ConeGeometry(4.9, 1.7, 4), roofMat);
  labRoof.position.y = 3.9;
  labRoof.rotation.y = Math.PI / 4;
  const labTable = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 1.2), woodMat);
  labTable.position.set(0, 0.78, -0.8);
  const beakerA = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.55, 10), emeraldGlowMat);
  beakerA.position.set(-0.55, 1.48, -0.8);
  const beakerB = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), amberGlowMat);
  beakerB.position.set(0.55, 1.48, -0.8);
  const labSign = makeCanvasSign('Laboratorium Alam', 'Uji Wujud & Energi', '#065f46');
  labSign.position.set(0, 3.2, 2.75);
  labGroup.add(labRoof, labTable, beakerA, beakerB, labSign);
  scene.add(labGroup);
  boxColliders.push({ minX: 16.5, maxX: 19.5, minZ: 10.6, maxZ: 11.9 });

  // 7. KUIL PENGETAHUAN (22, 27.5) — Grand Stepped Stone Temple (Final Exam Landmark!)
  const kuilGroup = new THREE.Group();
  const kGy = getRawTerrainHeight(22, 27.5, 3);
  kuilGroup.position.set(22, kGy - 0.08, 27.5);
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.6, 7.6), stoneMat);
  step1.position.y = 0.3;
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.6, 5.4), stoneMat);
  step2.position.y = 0.9;
  const sanctuary = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.9, 3.8), stoneMat);
  sanctuary.position.y = 2.65;
  sanctuary.castShadow = true;
  const crownRoof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.4, 4), mossMat);
  crownRoof.position.y = 5.25;
  crownRoof.rotation.y = Math.PI / 4;
  const templeBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), amberGlowMat);
  templeBeacon.position.set(0, 6.85, 0);
  const kuilSign = makeCanvasSign('Kuil Pengetahuan', 'Ujian Akhir Kelas 3', '#78350f');
  kuilSign.position.set(0, 4.3, 2.2);
  kuilGroup.add(step1, step2, sanctuary, crownRoof, templeBeacon, kuilSign);
  scene.add(kuilGroup);
  boxColliders.push({ minX: 19.6, maxX: 24.4, minZ: 25.4, maxZ: 29.6 });

  // 8. GLOWING FOREST MUSHROOMS around Hutan Tropis (-18, -12)
  const mushCoords = [
    [-15.5, -10.5],
    [-20.5, -13.5],
    [-14.0, -15.5],
    [-21.5, -9.5],
    [-18.0, -16.8],
  ];
  mushCoords.forEach(([mx, mz]) => {
    const gy = getRawTerrainHeight(mx, mz, 3);
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 })
    );
    stem.position.set(mx, gy + 0.22, mz);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.34, 10), emeraldGlowMat);
    cap.position.set(mx, gy + 0.56, mz);
    scene.add(stem, cap);
    glowingMushrooms.push(cap);
  });

  // 9. INTERACTIVE EXPLORATION NODES ACROSS ALL 8 LOCATIONS
  const nodeSpecs: Array<Omit<Grade3InteractiveNode, 'statusMesh'>> = [
    {
      id: 'g3-clue-1',
      kind: 'clue-scroll',
      bab: 1,
      label: 'Periksa Catatan Desa (Bab 1)',
      x: -14.2,
      z: 14.5,
      message: 'Petunjuk Desa: Tumbuhan memerlukan akar, batang, dan daun agar tumbuh subur!',
    },
    {
      id: 'g3-clue-2',
      kind: 'clue-scroll',
      bab: 2,
      label: 'Cek Papan Jembatan (Bab 2)',
      x: -4.2,
      z: 1.6,
      message: 'Petunjuk Jembatan: 4 ruas × 18 bilah kayu menyangga jalan menyeberangi sungai!',
    },
    {
      id: 'g3-spec-3',
      kind: 'specimen-pod',
      bab: 3,
      label: 'Amati Ekosistem Hutan (Bab 3)',
      x: -17.8,
      z: -11.5,
      message: 'Pengamatan Ekosistem: Rumput → Belalang → Katak → Elang → Jamur Pengurai!',
    },
    {
      id: 'g3-spec-4',
      kind: 'specimen-pod',
      bab: 4,
      label: 'Periksa Tanaman Kebun (Bab 4)',
      x: -21.2,
      z: 21.8,
      message: 'Pengamatan Kebun: Daun hijau menangkap cahaya matahari untuk fotosintesis!',
    },
    {
      id: 'g3-spec-5',
      kind: 'specimen-pod',
      bab: 5,
      label: 'Amati Siklus Air Terjun (Bab 5)',
      x: 20.8,
      z: -15.8,
      message: 'Pengamatan Air Terjun: Evaporasi → Kondensasi → Presipitasi menjaga air sungai!',
    },
    {
      id: 'g3-relic-6',
      kind: 'hidden-relic',
      bab: 6,
      label: 'Ambil Artefak Gua Misterius (Bab 6)',
      x: -22.0,
      z: -27.2,
      message: 'Artefak Gua ditemukan! Sandi batu: 647 + 250 = 897!',
    },
    {
      id: 'g3-lab-7',
      kind: 'lab-scanner',
      bab: 7,
      label: 'Pindai Sampel di Lab Alam (Bab 7)',
      x: 18.0,
      z: 13.8,
      message: 'Hasil Lab Alam: Batu bersifat padat, air bersifat cair, udara bersifat gas!',
    },
    {
      id: 'g3-kuil-8',
      kind: 'kuil-altar',
      bab: 8,
      label: 'Gerbang Kuil Pengetahuan (Ujian)',
      x: 22.0,
      z: 23.8,
      message: 'Altar Kuil Pengetahuan terbuka! Tantang dirimu di Misi Eksplorasi & Ujian Akhir Kelas 3!',
    },
  ];

  nodeSpecs.forEach((spec) => {
    const gy = getRawTerrainHeight(spec.x, spec.z, 3);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.7, 10), stoneMat);
    pedestal.position.set(spec.x, gy + 0.35, spec.z);
    scene.add(pedestal);

    const orbMat =
      spec.kind === 'kuil-altar' || spec.kind === 'hidden-relic' ? amberGlowMat : emeraldGlowMat;
    const orb = new THREE.Mesh(
      spec.kind === 'clue-scroll'
        ? new THREE.BoxGeometry(0.48, 0.58, 0.22)
        : new THREE.OctahedronGeometry(0.42, 0),
      orbMat
    );
    orb.position.set(spec.x, gy + 1.25, spec.z);
    scene.add(orb);

    nodes.push({
      ...spec,
      statusMesh: orb,
    });
  });

  return {
    nodes,
    waterfallBands,
    glowingMushrooms,
    boxColliders,
    circleColliders,
    disposables,
  };
}
