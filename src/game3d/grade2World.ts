import * as THREE from 'three';
import { createLabelCanvasTexture, createWoodenBridge } from './models';
import {
  BoxCollider,
  CircleCollider,
  getRawTerrainHeight,
  getWalkableHeight,
  GRADE2_BRIDGE,
} from './terrain';

export type CropType = 'wortel' | 'jagung' | 'kubis' | 'tomat';

export interface Grade2SimState {
  cropsInBag: Record<CropType, number>;
  feedBag: number;
  cakeBag: number;
  fertilizerBag: number;
  eggsAndMilk: number;
  cropsStoredInGudang: number;
  totalHarvested: number;
  animalsFedCount: number;
  portionsShared: number;
  housesVisited: string[];
  measuredItems: string[];
  shapesInspected: string[];
  plotStages: Record<string, 0 | 1 | 2>;
}

const G2_SIM_STORAGE_KEY = 'jelajah_ilmu_g2_sim_v1';

export const DEFAULT_GRADE2_SIM: Grade2SimState = {
  cropsInBag: { wortel: 1, jagung: 0, kubis: 0, tomat: 0 },
  feedBag: 4,
  cakeBag: 3,
  fertilizerBag: 1,
  eggsAndMilk: 0,
  cropsStoredInGudang: 12,
  totalHarvested: 0,
  animalsFedCount: 0,
  portionsShared: 0,
  housesVisited: [],
  measuredItems: [],
  shapesInspected: [],
  plotStages: {
    'plot-wortel': 2,
    'plot-jagung': 1,
    'plot-kubis': 0,
    'plot-tomat': 0,
  },
};

export function loadGrade2SimState(): Grade2SimState {
  try {
    const raw = localStorage.getItem(G2_SIM_STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_GRADE2_SIM);
    const p = JSON.parse(raw) as Partial<Grade2SimState>;
    return {
      ...DEFAULT_GRADE2_SIM,
      ...p,
      cropsInBag: {
        ...DEFAULT_GRADE2_SIM.cropsInBag,
        ...(p.cropsInBag ?? {}),
      },
      housesVisited: Array.isArray(p.housesVisited) ? p.housesVisited : [],
      measuredItems: Array.isArray(p.measuredItems) ? p.measuredItems : [],
      shapesInspected: Array.isArray(p.shapesInspected) ? p.shapesInspected : [],
      plotStages: {
        ...DEFAULT_GRADE2_SIM.plotStages,
        ...(p.plotStages ?? {}),
      },
    };
  } catch {
    return structuredClone(DEFAULT_GRADE2_SIM);
  }
}

export function saveGrade2SimState(state: Grade2SimState): void {
  try {
    localStorage.setItem(G2_SIM_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors gracefully
  }
}

export interface Grade2LocationMeta {
  bab: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  chapterId: string;
  name: string;
  shortLabel: string;
  x: number;
  z: number;
  yaw: number;
}

export const GRADE2_LOCATIONS: Grade2LocationMeta[] = [
  { bab: 1, chapterId: 'g2-mat-1', name: 'Desa Bilangan sampai 100', shortLabel: 'Bab 1 · Desa Bilangan', x: -16.5, z: 13.5, yaw: Math.PI },
  { bab: 2, chapterId: 'g2-mat-2', name: 'Kebun Nilai Tempat', shortLabel: 'Bab 2 · Kebun & Sawah', x: 14.5, z: 13.5, yaw: 0 },
  { bab: 3, chapterId: 'g2-mat-3', name: 'Pasar Penjumlahan', shortLabel: 'Bab 3 · Pasar Desa', x: 4.5, z: 13.8, yaw: Math.PI },
  { bab: 4, chapterId: 'g2-mat-4', name: 'Gudang Pengurangan', shortLabel: 'Bab 4 · Gudang Panen', x: -12.5, z: -16.2, yaw: Math.PI },
  { bab: 5, chapterId: 'g2-mat-5', name: 'Peternakan Perkalian', shortLabel: 'Bab 5 · Peternakan', x: -23.5, z: -15.8, yaw: Math.PI },
  { bab: 6, chapterId: 'g2-mat-6', name: 'Dapur Pembagian', shortLabel: 'Bab 6 · Dapur Desa', x: 11.5, z: -15.5, yaw: Math.PI },
  { bab: 7, chapterId: 'g2-mat-7', name: 'Bengkel Pengukuran', shortLabel: 'Bab 7 · Bengkel Ukur', x: 24.5, z: -15.5, yaw: Math.PI },
  { bab: 8, chapterId: 'g2-mat-8', name: 'Taman Bangun Datar & Ruang', shortLabel: 'Bab 8 · Taman Geometri', x: 0, z: -26.2, yaw: Math.PI },
];

export type Grade2NodeKind =
  | 'house-number'
  | 'farm-plot'
  | 'place-value-table'
  | 'market-stall'
  | 'gudang-store'
  | 'hay-feed'
  | 'animal-pen'
  | 'kitchen-share'
  | 'workshop-measure'
  | 'shape-pedestal';

export interface Grade2InteractiveNode {
  id: string;
  kind: Grade2NodeKind;
  bab: number;
  x: number;
  z: number;
  radius: number;
  cropType?: CropType;
  animalKind?: 'sapi' | 'kambing' | 'ayam';
  houseNumber?: number;
  measureAnswer?: string;
  shapeInfo?: string;
  label: string;
  stageMeshes?: THREE.Group[]; // For farm plots (0: empty, 1: sprout, 2: ripe)
  statusMesh?: THREE.Mesh;
  plateGroups?: THREE.Group[]; // For kitchen share plates
  growTimer?: number;
}

export interface Grade2AnimatedAnimal {
  group: THREE.Group;
  homeX: number;
  homeZ: number;
  kind: 'sapi' | 'kambing' | 'ayam';
  phase: number;
  happyTimer: number;
}

export interface Grade2WorldRuntime {
  root: THREE.Group;
  nodes: Grade2InteractiveNode[];
  animals: Grade2AnimatedAnimal[];
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
  disposables: Array<{ dispose: () => void }>;
}

function makeSignMesh(
  title: string,
  sub: string,
  bgHex: string,
  w: number,
  h: number,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const tex = createLabelCanvasTexture(title, sub, bgHex, '#ffffff', maxAniso);
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.42,
    side: THREE.DoubleSide,
  });
  disposables.push(tex, geo, mat);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

function buildLocationBanner(
  title: string,
  sub: string,
  bgHex: string,
  x: number,
  z: number,
  rotY: number,
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>,
  circleColliders: CircleCollider[]
): THREE.Group {
  const g = new THREE.Group();
  const y = getRawTerrainHeight(x, z, 2);
  g.position.set(x, y, z);
  g.rotation.y = rotY;

  const postMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.78 });
  disposables.push(postMat);
  [-1.65, 1.65].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 3.0, 8), postMat);
    post.position.set(px, 1.5, 0);
    post.castShadow = true;
    g.add(post);
    const wx = x + Math.cos(rotY) * px;
    const wz = z - Math.sin(rotY) * px;
    circleColliders.push({ x: wx, z: wz, radius: 0.3 });
  });

  const banner = makeSignMesh(title, sub, bgHex, 3.5, 1.08, maxAniso, disposables);
  banner.position.set(0, 2.7, 0);
  g.add(banner);
  return g;
}

function buildVillageHouseWithNumber(
  num: number,
  wallHex: number,
  roofHex: number,
  x: number,
  z: number,
  rotY: number,
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const g = new THREE.Group();
  const y = getRawTerrainHeight(x, z, 2);
  g.position.set(x, y - 0.08, z);
  g.rotation.y = rotY;

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.88 });
  const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.75 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofHex, roughness: 0.65 });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const winMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
  });
  disposables.push(plinthMat, wallMat, roofMat, woodMat, winMat);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.45, 4.6), plinthMat);
  plinth.position.y = 0.225;
  plinth.receiveShadow = true;
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.9, 2.4, 4.0), wallMat);
  body.position.y = 1.65;
  body.castShadow = true;
  body.receiveShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.1, 4), roofMat);
  roof.position.y = 3.85;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.14), woodMat);
  door.position.set(0, 1.35, 2.02);

  [-1.4, 1.4].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.14), winMat);
    win.position.set(wx, 1.75, 2.02);
    g.add(win);
  });

  const numSign = makeSignMesh(
    `Rumah No. ${num}`,
    'Desa Bilangan',
    '#059669',
    2.2,
    0.72,
    maxAniso,
    disposables
  );
  numSign.position.set(0, 2.55, 2.1);

  g.add(plinth, body, roof, door, numSign);
  return g;
}

function buildSekolahDesa(
  x: number,
  z: number,
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const g = new THREE.Group();
  const y = getRawTerrainHeight(x, z, 2);
  g.position.set(x, y - 0.08, z);
  g.rotation.y = Math.PI; // Faces north toward South Village avenue

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.62 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  disposables.push(wallMat, roofMat, trimMat, woodMat);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 5.2), trimMat);
  deck.position.y = 0.25;
  const body = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.8, 4.4), wallMat);
  body.position.y = 1.9;
  body.castShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), roofMat);
  roof.position.y = 4.4;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.16), woodMat);
  door.position.set(0, 1.5, 2.22);

  // Flagpole outside school
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 4.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.3 })
  );
  pole.position.set(3.2, 2.1, 2.8);
  const flagRed = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.3, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xdc2626 })
  );
  flagRed.position.set(3.68, 3.95, 2.8);
  const flagWhite = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.3, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  flagWhite.position.set(3.68, 3.65, 2.8);

  const sign = makeSignMesh(
    'SEKOLAH DESA CERIA',
    'SDN Nusantara 02 · No. 95',
    '#0284c7',
    3.8,
    1.05,
    maxAniso,
    disposables
  );
  sign.position.set(0, 2.85, 2.3);

  g.add(deck, body, roof, door, pole, flagRed, flagWhite, sign);
  return g;
}

function buildFarmPlot3D(
  crop: CropType,
  x: number,
  z: number,
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): { group: THREE.Group; stageMeshes: THREE.Group[] } {
  const group = new THREE.Group();
  const y = getRawTerrainHeight(x, z, 2);
  group.position.set(x, y, z);

  const soilMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.95 });
  const frameMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 });
  disposables.push(soilMat, frameMat, leafMat);

  const soil = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.22, 3.0), soilMat);
  soil.position.y = 0.11;
  soil.receiveShadow = true;
  group.add(soil);

  // Wooden raised bed border
  [
    [0, 1.52, 3.16, 0.14],
    [0, -1.52, 3.16, 0.14],
  ].forEach(([bx, bz, w, d]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), frameMat);
    rail.position.set(bx, 0.15, bz);
    group.add(rail);
  });
  [-1.52, 1.52].forEach((bx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 3.0), frameMat);
    rail.position.set(bx, 0.15, 0);
    group.add(rail);
  });

  // Label sign on corner
  const cropTitle =
    crop === 'wortel'
      ? 'Kebun Wortel'
      : crop === 'jagung'
      ? 'Kebun Jagung'
      : crop === 'kubis'
      ? 'Kebun Kubis'
      : 'Kebun Tomat';
  const sign = makeSignMesh(cropTitle, 'Tanam · Siram · Panen', '#15803d', 1.65, 0.56, maxAniso, disposables);
  sign.position.set(0, 1.05, -1.55);
  group.add(sign);

  // Stage 0: Fresh plowed mounds (empty)
  const stage0 = new THREE.Group();
  for (let r = -1; r <= 1; r += 2) {
    for (let c = -1; c <= 1; c += 2) {
      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), soilMat);
      mound.scale.set(1.2, 0.45, 1.2);
      mound.position.set(r * 0.68, 0.22, c * 0.68);
      stage0.add(mound);
    }
  }

  // Stage 1: Tender green sprouts
  const stage1 = new THREE.Group();
  for (let r = -1; r <= 1; r += 2) {
    for (let c = -1; c <= 1; c += 2) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.36, 6), leafMat);
      stem.position.set(r * 0.68, 0.38, c * 0.68);
      const leafA = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.12), leafMat);
      leafA.position.set(r * 0.68 + 0.1, 0.54, c * 0.68);
      leafA.rotation.z = 0.3;
      stage1.add(stem, leafA);
    }
  }

  // Stage 2: Full ripe vegetables ready to harvest!
  const stage2 = new THREE.Group();
  const cropHex =
    crop === 'wortel'
      ? 0xf97316
      : crop === 'jagung'
      ? 0xfacc15
      : crop === 'kubis'
      ? 0x4ade80
      : 0xef4444;
  const vegMat = new THREE.MeshStandardMaterial({ color: cropHex, roughness: 0.42 });
  disposables.push(vegMat);

  for (let r = -1; r <= 1; r += 2) {
    for (let c = -1; c <= 1; c += 2) {
      const px = r * 0.68;
      const pz = c * 0.68;
      if (crop === 'wortel') {
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 8), vegMat);
        body.rotation.x = Math.PI;
        body.position.set(px, 0.38, pz);
        const top = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 6), leafMat);
        top.position.set(px, 0.68, pz);
        stage2.add(body, top);
      } else if (crop === 'jagung') {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.1, 6), leafMat);
        stalk.position.set(px, 0.72, pz);
        const cob = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 4, 8), vegMat);
        cob.position.set(px + 0.12, 0.82, pz);
        cob.rotation.z = -0.3;
        stage2.add(stalk, cob);
      } else if (crop === 'kubis') {
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), vegMat);
        head.position.set(px, 0.38, pz);
        const outer = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.08, 6, 10), leafMat);
        outer.rotation.x = Math.PI / 2;
        outer.position.set(px, 0.32, pz);
        stage2.add(head, outer);
      } else {
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), leafMat);
        bush.position.set(px, 0.56, pz);
        const tom1 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), vegMat);
        tom1.position.set(px + 0.16, 0.64, pz + 0.14);
        const tom2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), vegMat);
        tom2.position.set(px - 0.14, 0.5, pz + 0.18);
        stage2.add(bush, tom1, tom2);
      }
    }
  }

  group.add(stage0, stage1, stage2);
  return { group, stageMeshes: [stage0, stage1, stage2] };
}

function buildSawahTerraces(
  x: number,
  z: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const g = new THREE.Group();
  const y = getRawTerrainHeight(x, z, 2);
  g.position.set(x, y, z);

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.15,
    transparent: true,
    opacity: 0.72,
  });
  const bundMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9 });
  const riceMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.78 });
  disposables.push(waterMat, bundMat, riceMat);

  // Two terraced flooded rice paddies
  [-1.9, 1.9].forEach((tz, tIdx) => {
    const bund = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.22, 3.2), bundMat);
    bund.position.set(0, 0.08 + tIdx * 0.12, tz);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.7), waterMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.2 + tIdx * 0.12, tz);
    g.add(bund, pool);

    for (let px = -3.6; px <= 3.6; px += 0.9) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 5), riceMat);
      tuft.position.set(px, 0.38 + tIdx * 0.12, tz + (px % 1.8 === 0 ? 0.5 : -0.5));
      g.add(tuft);
    }
  });

  // Cute farmer scarecrow in the rice paddy
  const scPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.9, 6), bundMat);
  scPost.position.set(0, 0.95, 0);
  const scCross = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.08), bundMat);
  scCross.position.set(0, 1.45, 0);
  const scHat = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 0.22, 10),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.8 })
  );
  scHat.position.set(0, 1.92, 0);
  g.add(scPost, scCross, scHat);

  return g;
}

function buildFarmAnimal(
  kind: 'sapi' | 'kambing' | 'ayam',
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const g = new THREE.Group();

  if (kind === 'sapi') {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72 });
    const spotMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.6 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });
    disposables.push(bodyMat, spotMat, noseMat, hornMat);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.72, 1.45), bodyMat);
    torso.position.y = 0.85;
    torso.castShadow = true;
    const spot = new THREE.Mesh(new THREE.BoxGeometry(0.87, 0.42, 0.58), spotMat);
    spot.position.set(0, 0.92, -0.15);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.46, 0.52), bodyMat);
    head.position.set(0, 1.05, 0.92);
    head.castShadow = true;
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.16), noseMat);
    snout.position.set(0, 0.94, 1.2);
    [-0.18, 0.18].forEach((hx) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 6), hornMat);
      horn.position.set(hx, 1.35, 0.88);
      g.add(horn);
    });
    [
      [-0.28, -0.52],
      [0.28, -0.52],
      [-0.28, 0.52],
      [0.28, 0.52],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.52, 8), spotMat);
      leg.position.set(lx, 0.26, lz);
      leg.castShadow = true;
      g.add(leg);
    });
    g.add(torso, spot, head, snout);
  } else if (kind === 'kambing') {
    const coatMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 });
    const hoofMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    disposables.push(coatMat, hoofMat);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 1.05), coatMat);
    torso.position.y = 0.62;
    torso.castShadow = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.42), coatMat);
    head.position.set(0, 0.85, 0.64);
    head.castShadow = true;
    [-0.12, 0.12].forEach((hx) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 6), hoofMat);
      horn.position.set(hx, 1.08, 0.6);
      horn.rotation.x = -0.35;
      g.add(horn);
    });
    [
      [-0.18, -0.36],
      [0.18, -0.36],
      [-0.18, 0.36],
      [0.18, 0.36],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.38, 6), hoofMat);
      leg.position.set(lx, 0.19, lz);
      g.add(leg);
    });
    g.add(torso, head);
  } else {
    // Ayam Kampung
    const featherMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.72 });
    const combMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
    disposables.push(featherMat, combMat, beakMat);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), featherMat);
    body.scale.set(0.95, 0.9, 1.25);
    body.position.y = 0.32;
    body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), featherMat);
    head.position.set(0, 0.54, 0.22);
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.14), combMat);
    comb.position.set(0, 0.68, 0.22);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 5), beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.52, 0.38);
    g.add(body, head, comb, beak);
  }

  return g;
}

function buildWoodFenceBox(
  cx: number,
  cz: number,
  w: number,
  d: number,
  woodTex: THREE.CanvasTexture,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const g = new THREE.Group();
  const y = getRawTerrainHeight(cx, cz, 2);
  g.position.set(cx, y, cz);
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
  disposables.push(woodMat);

  const hw = w / 2;
  const hd = d / 2;
  const corners = [
    [-hw, -hd],
    [hw, -hd],
    [-hw, hd],
    [hw, hd],
  ];
  corners.forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.95, 6), woodMat);
    post.position.set(px, 0.475, pz);
    post.castShadow = true;
    g.add(post);
  });
  [0.35, 0.72].forEach((ry) => {
    const north = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.08), woodMat);
    north.position.set(0, ry, -hd);
    const west = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, d), woodMat);
    west.position.set(-hw, ry, 0);
    const east = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, d), woodMat);
    east.position.set(hw, ry, 0);
    g.add(north, west, east);
  });

  return g;
}

export function buildGrade2World(
  scene: THREE.Scene,
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture,
  maxAniso: number
): Grade2WorldRuntime {
  const root = new THREE.Group();
  const nodes: Grade2InteractiveNode[] = [];
  const animals: Grade2AnimatedAnimal[] = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  // 0. Dedicated North-South Wooden Bridge across Desa Ceria's East-West River
  const bridge = createWoodenBridge(woodTex);
  bridge.position.set(GRADE2_BRIDGE.centerX, 0, GRADE2_BRIDGE.centerZ);
  bridge.rotation.y = Math.PI / 2;
  root.add(bridge);

  // ==================== LOKASI 1: DESA BILANGAN SAMPAI 100 ====================
  const b1Banner = buildLocationBanner(
    '1. DESA BILANGAN',
    'Rumah Penduduk 1–100',
    '#059669',
    -16.5,
    15.8,
    0,
    woodTex,
    maxAniso,
    disposables,
    circleColliders
  );
  root.add(b1Banner);

  const houses: Array<{ id: string; num: number; x: number; z: number; rotY: number; wall: number; roof: number; plaqueZ: number }> = [
    { id: 'house-15', num: 15, x: -14.0, z: 9.2, rotY: 0, wall: 0xfef3c7, roof: 0xd97706, plaqueZ: 11.7 },
    { id: 'house-42', num: 42, x: -22.5, z: 9.2, rotY: 0, wall: 0xe0f2fe, roof: 0x0284c7, plaqueZ: 11.7 },
    { id: 'house-68', num: 68, x: -22.5, z: 19.8, rotY: Math.PI, wall: 0xdcfce7, roof: 0x15803d, plaqueZ: 17.2 },
  ];
  houses.forEach((h) => {
    const house = buildVillageHouseWithNumber(
      h.num,
      h.wall,
      h.roof,
      h.x,
      h.z,
      h.rotY,
      woodTex,
      maxAniso,
      disposables
    );
    root.add(house);
    boxColliders.push({
      minX: h.x - 2.9,
      maxX: h.x + 2.9,
      minZ: h.z - 2.4,
      maxZ: h.z + 2.4,
    });
    nodes.push({
      id: h.id,
      kind: 'house-number',
      bab: 1,
      x: h.x,
      z: h.plaqueZ,
      radius: 2.6,
      houseNumber: h.num,
      label: `Cek Rumah No. ${h.num}`,
    });
  });

  // Sekolah Desa Ceria (No. 95)
  const schoolX = -12.5;
  const schoolZ = 22.8;
  const school = buildSekolahDesa(schoolX, schoolZ, woodTex, maxAniso, disposables);
  root.add(school);
  boxColliders.push({
    minX: schoolX - 3.6,
    maxX: schoolX + 3.6,
    minZ: schoolZ - 2.6,
    maxZ: schoolZ + 2.6,
  });
  nodes.push({
    id: 'house-95',
    kind: 'house-number',
    bab: 1,
    x: schoolX,
    z: 19.6,
    radius: 2.8,
    houseNumber: 95,
    label: 'Cek Sekolah No. 95',
  });

  // ==================== LOKASI 2: KEBUN NILAI TEMPAT & SAWAH ====================
  const b2Banner = buildLocationBanner(
    '2. KEBUN NILAI TEMPAT',
    'Tanam & Panen Puluhan',
    '#15803d',
    14.5,
    13.5,
    0,
    woodTex,
    maxAniso,
    disposables,
    circleColliders
  );
  root.add(b2Banner);

  // Sawah Padi Berundak
  const sawah = buildSawahTerraces(18.5, 24.0, disposables);
  root.add(sawah);

  const plots: Array<{ id: string; crop: CropType; x: number; z: number; label: string }> = [
    { id: 'plot-wortel', crop: 'wortel', x: 11.8, z: 9.6, label: 'Kebun Wortel' },
    { id: 'plot-jagung', crop: 'jagung', x: 16.8, z: 9.6, label: 'Kebun Jagung' },
    { id: 'plot-kubis', crop: 'kubis', x: 11.8, z: 17.6, label: 'Kebun Kubis' },
    { id: 'plot-tomat', crop: 'tomat', x: 16.8, z: 17.6, label: 'Kebun Tomat' },
  ];
  plots.forEach((p) => {
    const built = buildFarmPlot3D(p.crop, p.x, p.z, woodTex, maxAniso, disposables);
    root.add(built.group);
    nodes.push({
      id: p.id,
      kind: 'farm-plot',
      bab: 2,
      x: p.x,
      z: p.z,
      radius: 2.7,
      cropType: p.crop,
      label: p.label,
      stageMeshes: built.stageMeshes,
      growTimer: 0,
    });
  });

  // Meja Hitung Nilai Tempat at (21.5, 13.5)
  const pvX = 21.5;
  const pvZ = 13.5;
  const pvY = getRawTerrainHeight(pvX, pvZ, 2);
  const pvTable = new THREE.Group();
  pvTable.position.set(pvX, pvY, pvZ);
  const tableMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.95, 1.4),
    new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 })
  );
  tableMesh.position.y = 0.475;
  tableMesh.castShadow = true;
  const pvSign = makeSignMesh(
    'MEJA NILAI TEMPAT',
    'Hitung Ikatan 10 & Satuan',
    '#16a34a',
    2.4,
    0.78,
    maxAniso,
    disposables
  );
  pvSign.position.set(0, 1.7, 0);
  pvTable.add(tableMesh, pvSign);
  root.add(pvTable);
  circleColliders.push({ x: pvX, z: pvZ, radius: 1.0 });
  nodes.push({
    id: 'pv-table',
    kind: 'place-value-table',
    bab: 2,
    x: pvX,
    z: pvZ,
    radius: 2.8,
    label: 'Hitung Hasil Panen',
  });

  // ==================== LOKASI 3: PASAR PENJUMLAHAN ====================
  const mktX = 4.8;
  const mktZ = 8.6;
  const mktY = getRawTerrainHeight(mktX, mktZ, 2);
  const market = new THREE.Group();
  market.position.set(mktX, mktY, mktZ);

  const counterMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const awningMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.55 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 });
  disposables.push(counterMat, awningMat, stripeMat);

  const counter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.05, 2.2), counterMat);
  counter.position.y = 0.525;
  counter.castShadow = true;
  market.add(counter);

  [-2.3, 2.3].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.8, 8), counterMat);
    post.position.set(px, 1.4, 0.9);
    market.add(post);
  });

  const roofA = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.16, 2.8), awningMat);
  roofA.position.set(0, 2.75, 0.25);
  roofA.rotation.x = 0.22;
  roofA.castShadow = true;
  const roofStripe = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 2.84), stripeMat);
  roofStripe.position.set(0, 2.76, 0.25);
  roofStripe.rotation.x = 0.22;
  const mktSign = makeSignMesh(
    '3. PASAR PENJUMLAHAN',
    'Jual Panen & Beli Pakan',
    '#ea580c',
    3.6,
    1.0,
    maxAniso,
    disposables
  );
  mktSign.position.set(0, 3.65, 0.4);
  market.add(roofA, roofStripe, mktSign);

  // Market display fruit crates
  [0xef4444, 0x22c55e, 0xfacc15].forEach((cHex, idx) => {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.45, 0.8),
      new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.5 })
    );
    crate.position.set(-1.5 + idx * 1.5, 1.25, 0.2);
    market.add(crate);
  });

  root.add(market);
  boxColliders.push({
    minX: mktX - 2.7,
    maxX: mktX + 2.7,
    minZ: mktZ - 1.2,
    maxZ: mktZ + 1.2,
  });
  nodes.push({
    id: 'market-main',
    kind: 'market-stall',
    bab: 3,
    x: mktX,
    z: mktZ + 1.9,
    radius: 3.1,
    label: 'Buka Pasar Tradisional',
  });

  // ==================== LOKASI 4: GUDANG PENGURANGAN ====================
  const gdX = -12.5;
  const gdZ = -22.2;
  const gdY = getRawTerrainHeight(gdX, gdZ, 2);
  const gudang = new THREE.Group();
  gudang.position.set(gdX, gdY - 0.08, gdZ);

  const barnBody = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 2.8, 4.6),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.78 })
  );
  barnBody.position.y = 1.45;
  barnBody.castShadow = true;
  const barnRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.5, 2.4, 4),
    new THREE.MeshStandardMaterial({ map: roofTex, color: 0xb45309, roughness: 0.65 })
  );
  barnRoof.position.y = 4.05;
  barnRoof.rotation.y = Math.PI / 4;
  barnRoof.castShadow = true;
  const silo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.0, 3.8, 12),
    new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.65 })
  );
  silo.position.set(3.1, 1.9, -0.5);
  silo.castShadow = true;
  const gdDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.1, 0.14),
    new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.75 })
  );
  gdDoor.position.set(0, 1.1, 2.32);
  const gdSign = makeSignMesh(
    '4. GUDANG PENGURANGAN',
    'Simpan & Kurangi Stok',
    '#b45309',
    3.8,
    1.05,
    maxAniso,
    disposables
  );
  gdSign.position.set(0, 2.75, 2.42);
  gudang.add(barnBody, barnRoof, silo, gdDoor, gdSign);
  root.add(gudang);

  boxColliders.push({
    minX: gdX - 3.0,
    maxX: gdX + 3.8,
    minZ: gdZ - 2.4,
    maxZ: gdZ + 2.4,
  });
  nodes.push({
    id: 'gudang-main',
    kind: 'gudang-store',
    bab: 4,
    x: gdX,
    z: gdZ + 3.2,
    radius: 3.1,
    label: 'Simpan & Cek Stok Gudang',
  });

  // ==================== LOKASI 5: PETERNAKAN PERKALIAN (SAPI, AYAM, KAMBING) ====================
  const b5Banner = buildLocationBanner(
    '5. PETERNAKAN PERKALIAN',
    'Beri Makan Sapi, Kambing & Ayam',
    '#7c3aed',
    -23.5,
    -15.6,
    0,
    woodTex,
    maxAniso,
    disposables,
    circleColliders
  );
  root.add(b5Banner);

  // Free Hay Feed Pile (so player never gets stuck without animal feed!)
  const hayX = -19.2;
  const hayZ = -19.2;
  const hayY = getRawTerrainHeight(hayX, hayZ, 2);
  const hayGroup = new THREE.Group();
  hayGroup.position.set(hayX, hayY, hayZ);
  const hayMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.9 });
  disposables.push(hayMat);
  for (let h = 0; h < 3; h++) {
    const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.88, 10), hayMat);
    bale.rotation.z = Math.PI / 2;
    bale.position.set((h - 1) * 0.45, h === 1 ? 0.8 : 0.42, 0);
    bale.castShadow = true;
    hayGroup.add(bale);
  }
  const haySign = makeSignMesh('Tumpukan Pakan', 'Ambil Rumput Gratis', '#ca8a04', 2.0, 0.68, maxAniso, disposables);
  haySign.position.set(0, 1.7, 0);
  hayGroup.add(haySign);
  root.add(hayGroup);
  circleColliders.push({ x: hayX, z: hayZ, radius: 1.0 });
  nodes.push({
    id: 'hay-feed',
    kind: 'hay-feed',
    bab: 5,
    x: hayX,
    z: hayZ + 1.4,
    radius: 2.5,
    label: 'Ambil Pakan Ternak',
  });

  // Three Animal Pens: Sapi, Kambing, Ayam
  const penSpecs: Array<{
    id: string;
    animalKind: 'sapi' | 'kambing' | 'ayam';
    cx: number;
    cz: number;
    w: number;
    d: number;
    feedZ: number;
    label: string;
  }> = [
    { id: 'pen-sapi', animalKind: 'sapi', cx: -28.5, cz: -21.5, w: 5.0, d: 4.5, feedZ: -18.5, label: 'Beri Makan Sapi' },
    { id: 'pen-kambing', animalKind: 'kambing', cx: -23.0, cz: -22.0, w: 4.2, d: 4.0, feedZ: -19.2, label: 'Beri Makan Kambing' },
    { id: 'pen-ayam', animalKind: 'ayam', cx: -26.5, cz: -27.2, w: 4.5, d: 3.8, feedZ: -24.8, label: 'Beri Makan Ayam' },
  ];

  penSpecs.forEach((pen) => {
    const fence = buildWoodFenceBox(pen.cx, pen.cz, pen.w, pen.d, woodTex, disposables);
    root.add(fence);
    // Feeding trough in front edge
    const troughY = getRawTerrainHeight(pen.cx, pen.feedZ, 2);
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.35, 0.55),
      new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 })
    );
    trough.position.set(pen.cx, troughY + 0.18, pen.feedZ);
    trough.castShadow = true;
    root.add(trough);

    const count = pen.animalKind === 'ayam' ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const animalMesh = buildFarmAnimal(pen.animalKind, disposables);
      const ax = pen.cx + (i - (count - 1) / 2) * 1.3;
      const az = pen.cz + (i % 2 === 0 ? -0.4 : 0.4);
      animalMesh.position.set(ax, getRawTerrainHeight(ax, az, 2), az);
      animalMesh.rotation.y = i * 1.4;
      root.add(animalMesh);
      animals.push({
        group: animalMesh,
        homeX: ax,
        homeZ: az,
        kind: pen.animalKind,
        phase: i * 1.9,
        happyTimer: 0,
      });
    }

    nodes.push({
      id: pen.id,
      kind: 'animal-pen',
      bab: 5,
      x: pen.cx,
      z: pen.feedZ + 0.9,
      radius: 2.7,
      animalKind: pen.animalKind,
      label: pen.label,
    });
  });

  // ==================== LOKASI 6: DAPUR PEMBAGIAN ====================
  const dpX = 11.5;
  const dpZ = -22.5;
  const dpY = getRawTerrainHeight(dpX, dpZ, 2);
  const dapur = new THREE.Group();
  dapur.position.set(dpX, dpY, dpZ);

  const dpBase = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.3, 4.4),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.78 })
  );
  dpBase.position.y = 0.15;
  const dpStove = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.1, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 })
  );
  dpStove.position.set(-1.4, 0.7, -0.9);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.38, 0.45, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.55, roughness: 0.35 })
  );
  pot.position.set(-1.4, 1.45, -0.9);
  const dpRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.4, 1.8, 4),
    new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 })
  );
  dpRoof.position.y = 3.6;
  dpRoof.rotation.y = Math.PI / 4;
  dpRoof.castShadow = true;
  const dpSign = makeSignMesh(
    '6. DAPUR PEMBAGIAN',
    'Bagikan Sama Rata ke 3 Meja',
    '#db2777',
    3.6,
    1.0,
    maxAniso,
    disposables
  );
  dpSign.position.set(0, 2.55, 1.8);
  dapur.add(dpBase, dpStove, pot, dpRoof, dpSign);

  // 3 Citizen Dining Tables in front of Dapur
  const plateGroups: THREE.Group[] = [];
  [-1.9, 0, 1.9].forEach((tx) => {
    const tbl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.75, 12),
      new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.75 })
    );
    tbl.position.set(tx, 0.52, 2.5);
    tbl.castShadow = true;
    dapur.add(tbl);

    const plates = new THREE.Group();
    plates.position.set(tx, 0.94, 2.5);
    plates.visible = false;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      const cake = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 })
      );
      cake.position.set(Math.cos(a) * 0.25, 0.05, Math.sin(a) * 0.25);
      plates.add(cake);
    }
    dapur.add(plates);
    plateGroups.push(plates);
  });

  root.add(dapur);
  circleColliders.push({ x: dpX, z: dpZ - 0.8, radius: 1.8 });
  nodes.push({
    id: 'kitchen-main',
    kind: 'kitchen-share',
    bab: 6,
    x: dpX,
    z: dpZ + 3.6,
    radius: 3.1,
    label: 'Bagikan Makanan Adil',
    plateGroups,
  });

  // ==================== LOKASI 7: BENGKEL PENGUKURAN ====================
  const bkX = 24.5;
  const bkZ = -22.2;
  const bkY = getRawTerrainHeight(bkX, bkZ, 2);
  const bengkel = new THREE.Group();
  bengkel.position.set(bkX, bkY, bkZ);

  const bkWall = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 2.6, 4.2),
    new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.75 })
  );
  bkWall.position.y = 1.3;
  bkWall.castShadow = true;
  const bkRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.3, 1.9, 4),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.55 })
  );
  bkRoof.position.y = 3.55;
  bkRoof.rotation.y = Math.PI / 4;
  // Giant Yellow Ruler Roof Sign!
  const ruler = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.55, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
  );
  ruler.position.set(0, 4.65, 0);
  const bkSign = makeSignMesh(
    '7. BENGKEL PENGUKURAN',
    'Ukur Meter & Timbang Kg',
    '#0284c7',
    3.8,
    1.05,
    maxAniso,
    disposables
  );
  bkSign.position.set(0, 2.35, 2.18);
  bengkel.add(bkWall, bkRoof, ruler, bkSign);
  root.add(bengkel);
  boxColliders.push({
    minX: bkX - 2.9,
    maxX: bkX + 2.9,
    minZ: bkZ - 2.3,
    maxZ: bkZ + 2.3,
  });

  const measureSpecs: Array<{ id: string; x: number; z: number; label: string; ans: string; hex: number }> = [
    {
      id: 'measure-wood',
      x: 22.0,
      z: -18.8,
      label: 'Ukur Papan 2 Meter',
      ans: 'Panjang Papan = 2 m = 200 cm!',
      hex: 0xd97706,
    },
    {
      id: 'measure-rice',
      x: 24.5,
      z: -18.8,
      label: 'Timbang Beras 5 kg',
      ans: 'Berat Karung Beras = 5 kg = 5.000 gram!',
      hex: 0x059669,
    },
    {
      id: 'measure-bamboo',
      x: 27.0,
      z: -18.8,
      label: 'Ukur Bambu 150 cm',
      ans: 'Panjang Bambu = 150 cm = 1 m 50 cm!',
      hex: 0x0284c7,
    },
  ];
  measureSpecs.forEach((ms) => {
    const my = getRawTerrainHeight(ms.x, ms.z, 2);
    const bench = new THREE.Group();
    bench.position.set(ms.x, my, ms.z);
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.75, 0.9),
      new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 })
    );
    table.position.y = 0.375;
    const obj = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.35, 0.45),
      new THREE.MeshStandardMaterial({ color: ms.hex, roughness: 0.5 })
    );
    obj.position.y = 0.92;
    const ind = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.5 })
    );
    ind.position.y = 1.65;
    bench.add(table, obj, ind);
    root.add(bench);
    nodes.push({
      id: ms.id,
      kind: 'workshop-measure',
      bab: 7,
      x: ms.x,
      z: ms.z,
      radius: 2.3,
      label: ms.label,
      measureAnswer: ms.ans,
      statusMesh: ind,
    });
  });

  // ==================== LOKASI 8: TAMAN BANGUN DATAR DAN RUANG ====================
  const t8X = 0;
  const t8Z = -32.2;
  const t8Y = getRawTerrainHeight(t8X, t8Z, 2);
  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(6.8, 7.2, 0.25, 24),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 })
  );
  plaza.position.set(t8X, t8Y + 0.08, t8Z);
  plaza.receiveShadow = true;
  root.add(plaza);

  const b8Banner = buildLocationBanner(
    '8. TAMAN BANGUN DATAR & RUANG',
    'Kubus · Balok · Limas · Segitiga',
    '#4f46e5',
    0,
    -26.6,
    0,
    woodTex,
    maxAniso,
    disposables,
    circleColliders
  );
  root.add(b8Banner);

  const shapeSpecs: Array<{
    id: string;
    x: number;
    z: number;
    label: string;
    info: string;
    geoKind: 'cube' | 'box' | 'pyramid';
    hex: number;
  }> = [
    {
      id: 'shape-kubus',
      x: -3.6,
      z: -31.8,
      label: 'Amati Kubus',
      info: 'Kubus memiliki 6 sisi persegi sama luas, 12 rusuk, dan 8 titik sudut!',
      geoKind: 'cube',
      hex: 0xef4444,
    },
    {
      id: 'shape-balok',
      x: 0,
      z: -35.6,
      label: 'Amati Balok',
      info: 'Balok memiliki 6 sisi datar (3 pasang berhadapan), 12 rusuk, dan 8 titik sudut!',
      geoKind: 'box',
      hex: 0x0284c7,
    },
    {
      id: 'shape-limas',
      x: 3.6,
      z: -31.8,
      label: 'Amati Limas Segiempat',
      info: 'Limas Segiempat memiliki 1 alas segiempat, 4 sisi segitiga tegak, 8 rusuk & 5 titik sudut!',
      geoKind: 'pyramid',
      hex: 0x10b981,
    },
  ];
  shapeSpecs.forEach((sp) => {
    const sy = getRawTerrainHeight(sp.x, sp.z, 2);
    const ped = new THREE.Group();
    ped.position.set(sp.x, sy, sp.z);
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.75, 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 })
    );
    col.position.y = 0.45;
    const shapeGeo =
      sp.geoKind === 'cube'
        ? new THREE.BoxGeometry(1.1, 1.1, 1.1)
        : sp.geoKind === 'box'
        ? new THREE.BoxGeometry(1.5, 0.85, 0.95)
        : new THREE.ConeGeometry(0.88, 1.3, 4);
    const shapeMesh = new THREE.Mesh(
      shapeGeo,
      new THREE.MeshStandardMaterial({ color: sp.hex, roughness: 0.35 })
    );
    shapeMesh.position.y = 1.65;
    if (sp.geoKind === 'pyramid') shapeMesh.rotation.y = Math.PI / 4;
    shapeMesh.castShadow = true;

    const sign = makeSignMesh(sp.label.replace('Amati ', ''), 'Klik [E] Hitung Sisi & Rusuk', '#4f46e5', 2.0, 0.65, maxAniso, disposables);
    sign.position.set(0, 2.75, 0);
    ped.add(col, shapeMesh, sign);
    root.add(ped);
    circleColliders.push({ x: sp.x, z: sp.z, radius: 0.85 });
    nodes.push({
      id: sp.id,
      kind: 'shape-pedestal',
      bab: 8,
      x: sp.x,
      z: sp.z,
      radius: 2.6,
      label: sp.label,
      shapeInfo: sp.info,
      statusMesh: shapeMesh,
    });
  });

  scene.add(root);

  return {
    root,
    nodes,
    animals,
    boxColliders,
    circleColliders,
    disposables,
  };
}
