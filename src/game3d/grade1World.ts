import * as THREE from 'three';
import { createLabelCanvasTexture } from './models';
import { LocalRegionId, ReligionId, SubjectId } from './inventoryData';
import {
  BoxCollider,
  CircleCollider,
  getRawTerrainHeight,
  getWalkableHeight,
} from './terrain';
import {
  buildGrade1CustomWorld,
  Grade1EaselTarget,
  Grade1InteractiveNode,
  Grade1PredatorEntity,
  Grade1SafeZone,
} from './grade1WorldBuilders';
import {
  buildGrade1OpenWorldAddons,
  Grade1DoorTrigger,
} from './grade1OpenWorldLayout';
import { Grade1SeatSpot } from './characterAnimation';
import { NpcDefinition } from './worldData';

export type Grade1UsableKind =
  | 'word-block'
  | 'vowel-card'
  | 'fruit-basket'
  | 'storybook';

export type Grade1ZoneId = 'rumah-huruf' | 'taman-angka' | 'perpustakaan';

export interface Grade1PickupItemDef {
  id: string;
  name: string;
  shortLabel: string;
  kind: Grade1UsableKind;
  targetZoneId: Grade1ZoneId;
  targetLabel: string;
  x: number;
  z: number;
  colorHex: number;
  learnMessage: string;
}

export interface Grade1ActivePickup extends Grade1PickupItemDef {
  y: number;
  mesh: THREE.Group;
  state: 'world' | 'carried' | 'used';
}

export interface Grade1TargetPedestal {
  id: Grade1ZoneId;
  label: string;
  x: number;
  z: number;
  y: number;
  root: THREE.Group;
  beaconRing: THREE.Mesh;
  displayAnchor: THREE.Group;
}

export interface Grade1NumberPad {
  num: number;
  x: number;
  z: number;
  mesh: THREE.Mesh;
  activated: boolean;
}

export interface Grade1WorldRuntime {
  subjectId: SubjectId;
  root: THREE.Group;
  trampoline?: {
    x: number;
    z: number;
    radius: number;
    padMesh: THREE.Mesh;
    bounceAnim: number;
  };
  swingPivot?: THREE.Group;
  swingBoost: number;
  swingPos?: { x: number; z: number };
  seesawBeam?: THREE.Group;
  numberPads: Grade1NumberPad[];
  numberSequenceDone: boolean;
  pickups: Grade1ActivePickup[];
  pedestals: Grade1TargetPedestal[];
  interactiveNodes: Grade1InteractiveNode[];
  predators: Grade1PredatorEntity[];
  safeZones: Grade1SafeZone[];
  easelTargets: Grade1EaselTarget[];
  doorTriggers: Grade1DoorTrigger[];
  exteriorSeats: Grade1SeatSpot[];
  openWorldNpcs: NpcDefinition[];
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
  disposables: Array<{ dispose: () => void }>;
}

export const GRADE1_PICKUP_ITEMS: Grade1PickupItemDef[] = [
  {
    id: 'g1-item-bola',
    name: 'Balok Kata: BO-LA',
    shortLabel: 'BO-LA',
    kind: 'word-block',
    targetZoneId: 'rumah-huruf',
    targetLabel: 'Rumah Huruf',
    x: -12.6,
    z: 9.8,
    colorHex: 0x0284c7,
    learnMessage: 'Hebat! Suku kata BO + LA dibaca BOLA di Rumah Huruf! (+15 Koin, +20 XP)',
  },
  {
    id: 'g1-item-vokal',
    name: 'Kartu Vokal: A-I-U',
    shortLabel: 'A-I-U',
    kind: 'vowel-card',
    targetZoneId: 'rumah-huruf',
    targetLabel: 'Rumah Huruf',
    x: -2.2,
    z: 5.2,
    colorHex: 0xef4444,
    learnMessage: 'Pintar! Kamu menyusun huruf vokal A, I, U, E, O di Rumah Huruf! (+15 Koin, +20 XP)',
  },
  {
    id: 'g1-item-buah',
    name: 'Keranjang Buah: 3 + 2',
    shortLabel: '3 + 2 = 5',
    kind: 'fruit-basket',
    targetZoneId: 'taman-angka',
    targetLabel: 'Taman Angka',
    x: -7.6,
    z: -2.6,
    colorHex: 0xf59e0b,
    learnMessage: 'Benar! 3 apel + 2 jeruk = 5 buah segar di Taman Angka! (+15 Koin, +20 XP)',
  },
  {
    id: 'g1-item-buku',
    name: 'Buku Cerita Nusantara',
    shortLabel: 'Cerita',
    kind: 'storybook',
    targetZoneId: 'perpustakaan',
    targetLabel: 'Perpustakaan',
    x: 16.8,
    z: -5.2,
    colorHex: 0x10b981,
    learnMessage: 'Bagus! Buku Cerita Nusantara tersimpan rapi di rak Perpustakaan! (+20 Koin, +25 XP)',
  },
];

export function createCarriedItemMesh(
  kind: Grade1UsableKind,
  colorHex: number,
  maxAniso = 4
): { group: THREE.Group; disposables: Array<{ dispose: () => void }> } {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  if (kind === 'word-block' || kind === 'vowel-card') {
    const labelText = kind === 'word-block' ? 'BO-LA' : 'A·I·U';
    const subText = kind === 'word-block' ? 'Baca Kata' : 'Huruf Vokal';
    const tex = createLabelCanvasTexture(
      labelText,
      subText,
      kind === 'word-block' ? '#0284c7' : '#dc2626',
      '#ffffff',
      maxAniso
    );
    disposables.push(tex);
    const boxGeo = new THREE.BoxGeometry(0.56, 0.56, 0.56);
    const sideMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 });
    disposables.push(boxGeo, sideMat, faceMat);
    const cube = new THREE.Mesh(boxGeo, [
      sideMat,
      sideMat,
      sideMat,
      sideMat,
      faceMat,
      faceMat,
    ]);
    cube.castShadow = true;
    group.add(cube);
  } else if (kind === 'fruit-basket') {
    const basketGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.34, 12);
    const basketMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 });
    const fruitGeo = new THREE.SphereGeometry(0.11, 10, 10);
    const appleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    disposables.push(basketGeo, basketMat, fruitGeo, appleMat, orangeMat);

    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.castShadow = true;
    group.add(basket);

    const coords: Array<[number, number, number, boolean]> = [
      [-0.12, 0.2, 0.06, true],
      [0.12, 0.2, 0.06, true],
      [0, 0.22, -0.1, true],
      [-0.08, 0.28, -0.02, false],
      [0.09, 0.28, 0.0, false],
    ];
    coords.forEach(([fx, fy, fz, isApple]) => {
      const f = new THREE.Mesh(fruitGeo, isApple ? appleMat : orangeMat);
      f.position.set(fx, fy, fz);
      f.castShadow = true;
      group.add(f);
    });
  } else {
    // Storybook
    const coverGeo = new THREE.BoxGeometry(0.56, 0.12, 0.44);
    const pagesGeo = new THREE.BoxGeometry(0.5, 0.09, 0.39);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.45 });
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.75 });
    const starGeo = new THREE.OctahedronGeometry(0.08, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    disposables.push(coverGeo, pagesGeo, coverMat, pagesMat, starGeo, starMat);

    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.castShadow = true;
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    pages.position.x = 0.02;
    const emblem = new THREE.Mesh(starGeo, starMat);
    emblem.position.set(0, 0.08, 0);
    group.add(cover, pages, emblem);
  }

  return { group, disposables };
}

function createSignBanner(
  title: string,
  subtitle: string,
  bgHex: string,
  width: number,
  height: number,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const tex = createLabelCanvasTexture(title, subtitle, bgHex, '#ffffff', maxAniso);
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.42,
    side: THREE.DoubleSide,
  });
  disposables.push(tex, geo, mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

function buildRumahHuruf(
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.82 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45,
    roughness: 0.28,
  });
  disposables.push(stoneMat, wallMat, roofMat, trimMat, woodMat, glowMat);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.48, 5.6), stoneMat);
  plinth.position.y = 0.24;
  plinth.receiveShadow = true;
  g.add(plinth);

  const body = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.8, 4.6), wallMat);
  body.position.y = 1.88;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Rainbow trim band
  const trim = new THREE.Mesh(new THREE.BoxGeometry(5.75, 0.22, 4.75), trimMat);
  trim.position.y = 3.22;
  g.add(trim);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.15, 4), roofMat);
  roof.position.y = 4.35;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  // Giant A - B - C alphabet blocks perched on front awning
  const letterSpecs = [
    { ch: 'A', bg: '#ef4444', x: -1.4 },
    { ch: 'B', bg: '#0284c7', x: 0 },
    { ch: 'C', bg: '#10b981', x: 1.4 },
  ];
  letterSpecs.forEach((ls) => {
    const tex = createLabelCanvasTexture(ls.ch, '', ls.bg, '#ffffff', maxAniso);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.72), mat);
    cube.position.set(ls.x, 3.68, 2.2);
    cube.castShadow = true;
    disposables.push(tex, mat);
    g.add(cube);
  });

  // Door & Chalkboard Windows
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.0, 0.16), woodMat);
  door.position.set(0, 1.48, 2.34);
  g.add(door);

  [-1.75, 1.75].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.14), glowMat);
    win.position.set(wx, 2.0, 2.32);
    g.add(win);
  });

  // Signboard above entrance
  const sign = createSignBanner(
    'RUMAH HURUF',
    'Membaca Huruf & Kata',
    '#dc2626',
    3.6,
    1.1,
    maxAniso,
    disposables
  );
  sign.position.set(0, 2.75, 2.46);
  g.add(sign);

  return g;
}

function buildPerpustakaan(
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.7 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, color: 0x0284c7, roughness: 0.55 });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.7 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.4,
    roughness: 0.3,
  });
  disposables.push(stoneMat, wallMat, roofMat, woodMat, glowMat);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.48, 5.6), stoneMat);
  plinth.position.y = 0.24;
  plinth.receiveShadow = true;
  g.add(plinth);

  const body = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.9, 4.6), wallMat);
  body.position.y = 1.92;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.0, 4), roofMat);
  roof.position.y = 4.32;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  // Giant Open Book Roof Ornament
  const bookGroup = new THREE.Group();
  bookGroup.position.set(0, 5.3, 0);
  const leftPage = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.14, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
  );
  leftPage.position.x = -0.56;
  leftPage.rotation.z = 0.28;
  const rightPage = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.14, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.5 })
  );
  rightPage.position.x = 0.56;
  rightPage.rotation.z = -0.28;
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.18, 1.58),
    new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 })
  );
  bookGroup.add(leftPage, rightPage, spine);
  g.add(bookGroup);

  // Book Spine Columns flanking the doorway
  const spineColors = [0x10b981, 0xf59e0b];
  [-2.3, 2.3].forEach((px, idx) => {
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 2.8, 0.65),
      new THREE.MeshStandardMaterial({ color: spineColors[idx], roughness: 0.55 })
    );
    col.position.set(px, 1.88, 2.45);
    col.castShadow = true;
    g.add(col);
  });

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.05, 0.16), woodMat);
  door.position.set(0, 1.5, 2.34);
  g.add(door);

  [-1.45, 1.45].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.14), glowMat);
    win.position.set(wx, 2.0, 2.32);
    g.add(win);
  });

  const sign = createSignBanner(
    'PERPUSTAKAAN',
    'Buku Cerita & Pengetahuan',
    '#0284c7',
    3.8,
    1.1,
    maxAniso,
    disposables
  );
  sign.position.set(0, 2.85, 2.46);
  g.add(sign);

  return g;
}

function buildTamanAngka(
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): { group: THREE.Group; numberPads: Grade1NumberPad[]; collider: CircleCollider } {
  const group = new THREE.Group();
  const centerX = -3.6;
  const centerZ = -9.6;

  // Paved colorful base mat
  const baseY = getRawTerrainHeight(centerX, centerZ);
  const plazaMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 });
  const borderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  disposables.push(plazaMat, borderMat, woodMat);

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.16, 24), plazaMat);
  disc.position.set(centerX, baseY + 0.04, centerZ);
  disc.receiveShadow = true;
  group.add(disc);

  // Giant Abacus Arch Sign at north edge of Taman Angka
  const abacusGroup = new THREE.Group();
  abacusGroup.position.set(centerX, baseY, centerZ - 3.3);
  [-1.7, 1.7].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.2, 8), woodMat);
    post.position.set(px, 1.6, 0);
    post.castShadow = true;
    abacusGroup.add(post);
  });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 0.22), woodMat);
  topBar.position.set(0, 3.15, 0);
  abacusGroup.add(topBar);

  // Two abacus rods with colorful counting beads
  const beadColors = [0xef4444, 0xf59e0b, 0x10b981, 0x0284c7, 0x8b5cf6];
  [2.55, 2.1].forEach((ry, rIdx) => {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6),
      borderMat
    );
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, ry, 0);
    abacusGroup.add(rod);

    for (let b = 0; b < 5; b++) {
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 10),
        new THREE.MeshStandardMaterial({
          color: beadColors[(b + rIdx * 2) % beadColors.length],
          roughness: 0.35,
        })
      );
      bead.position.set(-1.1 + b * 0.55, ry, 0);
      bead.castShadow = true;
      abacusGroup.add(bead);
    }
  });

  const sign = createSignBanner(
    'TAMAN ANGKA',
    'Injak 1–5 & Hitung Buah',
    '#d97706',
    3.5,
    1.0,
    maxAniso,
    disposables
  );
  sign.position.set(0, 3.85, 0.08);
  abacusGroup.add(sign);
  group.add(abacusGroup);

  // 5 Interactive Number Stepping Pads (1 to 5) in an arc
  const padColors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#0284c7'];
  const numberPads: Grade1NumberPad[] = [];
  for (let i = 0; i < 5; i++) {
    const num = i + 1;
    const angle = -Math.PI * 0.72 + (i / 4) * (Math.PI * 1.44);
    const px = centerX + Math.sin(angle) * 2.55;
    const pz = centerZ + 0.45 + Math.cos(angle) * 1.75;
    const py = getWalkableHeight(px, pz);

    const tex = createLabelCanvasTexture(
      String(num),
      num === 1 ? 'Satu' : num === 2 ? 'Dua' : num === 3 ? 'Tiga' : num === 4 ? 'Empat' : 'Lima',
      padColors[i],
      '#ffffff',
      maxAniso
    );
    const topMat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.38,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });
    const sideMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const padGeo = new THREE.BoxGeometry(1.05, 0.16, 1.05);
    disposables.push(tex, topMat, sideMat, padGeo);

    const padMesh = new THREE.Mesh(padGeo, [
      sideMat,
      sideMat,
      topMat,
      sideMat,
      sideMat,
      sideMat,
    ]);
    padMesh.position.set(px, py + 0.08, pz);
    padMesh.receiveShadow = true;
    padMesh.castShadow = true;
    group.add(padMesh);

    numberPads.push({
      num,
      x: px,
      z: pz,
      mesh: padMesh,
      activated: false,
    });
  }

  return {
    group,
    numberPads,
    collider: { x: centerX, z: centerZ - 3.3, radius: 1.85 },
  };
}

function buildPlayground(
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): {
  group: THREE.Group;
  trampoline: {
    x: number;
    z: number;
    radius: number;
    padMesh: THREE.Mesh;
    bounceAnim: number;
  };
  swingPivot: THREE.Group;
  swingPos: { x: number; z: number };
  seesawBeam: THREE.Group;
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
} {
  const group = new THREE.Group();
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];

  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.45 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.42 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.45 });
  disposables.push(woodMat, redMat, yellowMat, blueMat, greenMat);

  // Welcome sign for Taman Bermain Edukasi
  const pgSignX = -15.6;
  const pgSignZ = 10.6;
  const pgSignY = getRawTerrainHeight(pgSignX, pgSignZ);
  const pgSignGroup = new THREE.Group();
  pgSignGroup.position.set(pgSignX, pgSignY, pgSignZ);
  pgSignGroup.rotation.y = 0.2;
  const pgPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.2, 8), woodMat);
  pgPost.position.y = 1.1;
  pgPost.castShadow = true;
  const pgBanner = createSignBanner(
    'TAMAN BERMAIN',
    'Trampolin · Ayunan · Perosotan',
    '#10b981',
    3.1,
    0.95,
    maxAniso,
    disposables
  );
  pgBanner.position.set(0, 2.35, 0);
  pgSignGroup.add(pgPost, pgBanner);
  group.add(pgSignGroup);
  circleColliders.push({ x: pgSignX, z: pgSignZ, radius: 0.45 });

  // 1. Trampolin Pelangi (-15.0, 12.6) - Step on to bounce high!
  const trX = -15.0;
  const trZ = 12.6;
  const trY = getRawTerrainHeight(trX, trZ);
  const trGroup = new THREE.Group();
  trGroup.position.set(trX, trY, trZ);

  const trRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.18, 10, 24),
    redMat
  );
  trRim.rotation.x = Math.PI / 2;
  trRim.position.y = 0.34;
  trRim.castShadow = true;
  trGroup.add(trRim);

  const trPad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.36, 1.36, 0.14, 24),
    blueMat
  );
  trPad.position.y = 0.34;
  trPad.receiveShadow = true;
  trGroup.add(trPad);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 8), yellowMat);
    leg.position.set(Math.cos(a) * 1.32, 0.17, Math.sin(a) * 1.32);
    trGroup.add(leg);
  }
  group.add(trGroup);

  // 2. Ayunan Ceria (Swing Set) at (-18.8, 13.6)
  const swX = -18.8;
  const swZ = 13.6;
  const swY = getRawTerrainHeight(swX, swZ);
  const swGroup = new THREE.Group();
  swGroup.position.set(swX, swY, swZ);
  swGroup.rotation.y = 0.45;

  [-1.55, 1.55].forEach((sideX) => {
    const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 8), yellowMat);
    legA.position.set(sideX, 1.45, -0.75);
    legA.rotation.x = 0.25;
    legA.castShadow = true;
    const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 8), yellowMat);
    legB.position.set(sideX, 1.45, 0.75);
    legB.rotation.x = -0.25;
    legB.castShadow = true;
    swGroup.add(legA, legB);
  });

  const topBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8), redMat);
  topBeam.rotation.z = Math.PI / 2;
  topBeam.position.y = 2.9;
  topBeam.castShadow = true;
  swGroup.add(topBeam);

  const swingPivot = new THREE.Group();
  swingPivot.position.y = 2.9;
  [-0.65, 0.65].forEach((sx) => {
    [-0.36, 0.36].forEach((ropeOff) => {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.0, 6), woodMat);
      rope.position.set(sx + ropeOff, -1.0, 0);
      swingPivot.add(rope);
    });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.42), blueMat);
    seat.position.set(sx, -2.02, 0);
    seat.castShadow = true;
    swingPivot.add(seat);
  });
  swGroup.add(swingPivot);
  group.add(swGroup);
  circleColliders.push({ x: swX, z: swZ, radius: 1.5 });

  // 3. Jungkat-Jungkit (Seesaw) at (-13.2, 16.0)
  const ssX = -13.2;
  const ssZ = 16.0;
  const ssY = getRawTerrainHeight(ssX, ssZ);
  const ssGroup = new THREE.Group();
  ssGroup.position.set(ssX, ssY, ssZ);
  ssGroup.rotation.y = -0.35;

  const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.75, 4), greenMat);
  fulcrum.position.y = 0.375;
  fulcrum.rotation.y = Math.PI / 4;
  fulcrum.castShadow = true;
  ssGroup.add(fulcrum);

  const seesawBeam = new THREE.Group();
  seesawBeam.position.y = 0.76;
  const plank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 0.56), yellowMat);
  plank.castShadow = true;
  seesawBeam.add(plank);
  [-1.35, 1.35].forEach((hx, idx) => {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.12, 0.52),
      idx === 0 ? redMat : blueMat
    );
    seat.position.set(hx, 0.1, 0);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.36, 8), woodMat);
    handle.position.set(hx * 0.78, 0.25, 0);
    seesawBeam.add(seat, handle);
  });
  ssGroup.add(seesawBeam);
  group.add(ssGroup);
  circleColliders.push({ x: ssX, z: ssZ, radius: 1.35 });

  // 4. Perosotan Pelangi (Rainbow Slide) at (-18.4, 17.5)
  const slX = -18.4;
  const slZ = 17.5;
  const slY = getRawTerrainHeight(slX, slZ);
  const slGroup = new THREE.Group();
  slGroup.position.set(slX, slY, slZ);
  slGroup.rotation.y = 0.75;

  [
    [-0.65, -0.65],
    [0.65, -0.65],
    [-0.65, 0.65],
    [0.65, 0.65],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 2.4, 8), woodMat);
    leg.position.set(lx, 1.2, lz);
    leg.castShadow = true;
    slGroup.add(leg);
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 1.5), yellowMat);
  deck.position.y = 2.15;
  deck.castShadow = true;
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.9, 4), redMat);
  canopy.position.y = 3.25;
  canopy.rotation.y = Math.PI / 4;
  slGroup.add(deck, canopy);

  // Slide chute angled forward
  const chute = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, 3.2), blueMat);
  chute.position.set(0, 1.15, 1.85);
  chute.rotation.x = 0.62;
  chute.castShadow = true;
  slGroup.add(chute);

  // Ladder rungs on the back
  for (let r = 0; r < 5; r++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 6), greenMat);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, 0.4 + r * 0.42, -0.78);
    slGroup.add(rung);
  }
  group.add(slGroup);
  boxColliders.push({
    minX: slX - 1.5,
    maxX: slX + 1.5,
    minZ: slZ - 1.5,
    maxZ: slZ + 1.5,
  });

  return {
    group,
    trampoline: { x: trX, z: trZ, radius: 1.45, padMesh: trPad, bounceAnim: 0 },
    swingPivot,
    swingPos: { x: swX, z: swZ },
    seesawBeam,
    boxColliders,
    circleColliders,
  };
}

function buildDeliveryPedestal(
  id: Grade1ZoneId,
  label: string,
  subtitle: string,
  colorHex: number,
  bgHex: string,
  x: number,
  z: number,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): Grade1TargetPedestal {
  const root = new THREE.Group();
  const y = getWalkableHeight(x, z);
  root.position.set(x, y, z);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const rimMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.25,
    roughness: 0.4,
  });
  const colGeo = new THREE.CylinderGeometry(0.58, 0.68, 0.95, 14);
  const topGeo = new THREE.CylinderGeometry(0.75, 0.72, 0.16, 16);
  const ringGeo = new THREE.RingGeometry(1.15, 1.45, 28);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });
  disposables.push(baseMat, rimMat, colGeo, topGeo, ringGeo, ringMat);

  const col = new THREE.Mesh(colGeo, baseMat);
  col.position.y = 0.475;
  col.castShadow = true;
  const top = new THREE.Mesh(topGeo, rimMat);
  top.position.y = 1.0;
  top.castShadow = true;

  const beaconRing = new THREE.Mesh(ringGeo, ringMat);
  beaconRing.position.y = 0.06;

  const sign = createSignBanner(label, subtitle, bgHex, 2.2, 0.72, maxAniso, disposables);
  sign.position.set(0, 1.95, 0);

  const displayAnchor = new THREE.Group();
  displayAnchor.position.set(0, 1.38, 0);

  root.add(col, top, beaconRing, sign, displayAnchor);

  return {
    id,
    label,
    x,
    z,
    y,
    root,
    beaconRing,
    displayAnchor,
  };
}

export interface BuildGrade1WorldOptions {
  subjectId?: SubjectId;
  religion?: ReligionId;
  localRegion?: LocalRegionId;
  savedArtworks?: Array<{ id: string; title: string; dataUrl: string }>;
}

export function buildGrade1World(
  scene: THREE.Object3D,
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture,
  maxAniso: number,
  options?: BuildGrade1WorldOptions
): Grade1WorldRuntime {
  const subjectId = options?.subjectId ?? 'bahasa-indonesia';
  const religion = options?.religion ?? 'islam';
  const localRegion = options?.localRegion ?? 'jawa';
  const savedArtworks = options?.savedArtworks ?? [];

  const root = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];

  const ow = buildGrade1OpenWorldAddons(religion, maxAniso);
  root.add(ow.root);
  disposables.push(...ow.disposables);
  boxColliders.push(...ow.boxColliders);
  circleColliders.push(...ow.circleColliders);

  if (subjectId !== 'bahasa-indonesia') {
    const custom = buildGrade1CustomWorld(
      subjectId,
      religion,
      localRegion,
      savedArtworks,
      woodTex,
      roofTex,
      maxAniso,
      root,
      disposables
    );
    boxColliders.push(...custom.boxColliders);
    circleColliders.push(...custom.circleColliders);

    scene.add(root);

    return {
      subjectId,
      root,
      swingBoost: 0,
      numberPads: [],
      numberSequenceDone: false,
      pickups: [],
      pedestals: [],
      interactiveNodes: [...custom.interactiveNodes, ...ow.interactiveNodes],
      predators: [...custom.predators, ...ow.predators],
      safeZones: [...custom.safeZones, ...ow.safeZones],
      easelTargets: custom.easelTargets,
      doorTriggers: ow.doorTriggers,
      exteriorSeats: ow.exteriorSeats,
      openWorldNpcs: ow.extraNpcs,
      boxColliders,
      circleColliders,
      disposables,
    };
  }

  // BAHASA INDONESIA — Desa Huruf dan Cerita (Rumah Huruf, Perpustakaan, Taman Angka, Playground & Pickups)
  const rumahX = -15.5;
  const rumahZ = -4.2;
  const rumah = buildRumahHuruf(woodTex, maxAniso, disposables);
  rumah.position.set(rumahX, getRawTerrainHeight(rumahX, rumahZ) - 0.1, rumahZ);
  rumah.rotation.y = 0.2;
  root.add(rumah);
  boxColliders.push({
    minX: rumahX - 3.3,
    maxX: rumahX + 3.3,
    minZ: rumahZ - 2.9,
    maxZ: rumahZ + 2.9,
  });

  const perpusX = -21.5;
  const perpusZ = 7.5;
  const perpus = buildPerpustakaan(woodTex, roofTex, maxAniso, disposables);
  perpus.position.set(perpusX, getRawTerrainHeight(perpusX, perpusZ) - 0.1, perpusZ);
  perpus.rotation.y = 1.9;
  root.add(perpus);
  boxColliders.push({
    minX: perpusX - 3.3,
    maxX: perpusX + 3.3,
    minZ: perpusZ - 2.9,
    maxZ: perpusZ + 2.9,
  });

  const tamanAngka = buildTamanAngka(woodTex, maxAniso, disposables);
  root.add(tamanAngka.group);
  circleColliders.push(tamanAngka.collider);

  const playground = buildPlayground(woodTex, maxAniso, disposables);
  root.add(playground.group);
  boxColliders.push(...playground.boxColliders);
  circleColliders.push(...playground.circleColliders);

  const pedestals: Grade1TargetPedestal[] = [
    buildDeliveryPedestal(
      'rumah-huruf',
      'Meja Rumah Huruf',
      'Letakkan Kartu/Balok',
      0xdc2626,
      '#dc2626',
      -14.4,
      -0.3,
      maxAniso,
      disposables
    ),
    buildDeliveryPedestal(
      'taman-angka',
      'Meja Taman Angka',
      'Hitung Buah & Angka',
      0xf59e0b,
      '#d97706',
      -3.6,
      -6.2,
      maxAniso,
      disposables
    ),
    buildDeliveryPedestal(
      'perpustakaan',
      'Rak Perpustakaan',
      'Simpan Buku Cerita',
      0x0284c7,
      '#0284c7',
      -17.6,
      6.1,
      maxAniso,
      disposables
    ),
  ];
  pedestals.forEach((p) => {
    root.add(p.root);
    circleColliders.push({ x: p.x, z: p.z, radius: 0.72 });
  });

  const pickups: Grade1ActivePickup[] = GRADE1_PICKUP_ITEMS.map((item) => {
    const built = createCarriedItemMesh(item.kind, item.colorHex, maxAniso);
    disposables.push(...built.disposables);
    const y = getWalkableHeight(item.x, item.z) + 0.75;
    built.group.position.set(item.x, y, item.z);
    built.group.scale.setScalar(1.35);
    root.add(built.group);
    return {
      ...item,
      y,
      mesh: built.group,
      state: 'world',
    };
  });

  scene.add(root);

  return {
    subjectId,
    root,
    trampoline: playground.trampoline,
    swingPivot: playground.swingPivot,
    swingBoost: 0,
    swingPos: playground.swingPos,
    seesawBeam: playground.seesawBeam,
    numberPads: tamanAngka.numberPads,
    numberSequenceDone: false,
    pickups,
    pedestals,
    interactiveNodes: ow.interactiveNodes,
    predators: ow.predators,
    safeZones: ow.safeZones,
    easelTargets: [],
    doorTriggers: ow.doorTriggers,
    exteriorSeats: ow.exteriorSeats,
    openWorldNpcs: ow.extraNpcs,
    boxColliders,
    circleColliders,
    disposables,
  };
}
