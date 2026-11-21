import * as THREE from 'three';
import { createLabelCanvasTexture } from './models';
import { ReligionId } from './inventoryData';
import {
  BoxCollider,
  CircleCollider,
  GRADE1_PIER,
  getRawTerrainHeight,
  getWalkableHeight,
} from './terrain';
import { NpcDefinition } from './worldData';
import {
  Grade1InteractiveNode,
  Grade1PredatorEntity,
  Grade1SafeZone,
} from './grade1WorldBuilders';
import { Grade1InteriorId } from './grade1Interiors';
import { Grade1SeatSpot } from './characterAnimation';

export interface Grade1DoorTrigger {
  id: Grade1InteriorId;
  label: string;
  subtitle: string;
  accentHex: string;
  entryX: number;
  entryZ: number;
  radius: number;
  returnX: number;
  returnZ: number;
  returnYaw: number;
  glowRing: THREE.Mesh;
  doorLeafGroup?: THREE.Group;
}

export interface Grade1OpenWorldAddons {
  root: THREE.Group;
  doorTriggers: Grade1DoorTrigger[];
  interactiveNodes: Grade1InteractiveNode[];
  exteriorSeats: Grade1SeatSpot[];
  predators: Grade1PredatorEntity[];
  safeZones: Grade1SafeZone[];
  extraNpcs: NpcDefinition[];
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
  disposables: Array<{ dispose: () => void }>;
}

function makeBanner(
  title: string,
  subtitle: string,
  bgHex: string,
  w: number,
  h: number,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const tex = createLabelCanvasTexture(title, subtitle, bgHex, '#ffffff', maxAniso);
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.42,
    side: THREE.DoubleSide,
  });
  disposables.push(tex, geo, mat);
  return new THREE.Mesh(geo, mat);
}

function makePortalRing(
  colorHex: number,
  x: number,
  z: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const geo = new THREE.RingGeometry(0.95, 1.32, 24);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
  });
  disposables.push(geo, mat);
  const ring = new THREE.Mesh(geo, mat);
  ring.position.set(x, getWalkableHeight(x, z, 1) + 0.08, z);
  return ring;
}

function makeNodeOrb(
  colorHex: number,
  y: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const geo = new THREE.OctahedronGeometry(0.24, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.58,
    roughness: 0.25,
  });
  disposables.push(geo, mat);
  const m = new THREE.Mesh(geo, mat);
  m.position.y = y;
  return m;
}

function buildEnterableHouse(
  x: number,
  z: number,
  rotY: number,
  wallHex: number,
  roofHex: number,
  trimHex: number,
  bannerTitle: string,
  bannerSub: string,
  bannerBg: string,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>,
  style: 'house' | 'school' | 'mosque' | 'church' | 'market' | 'castle' | 'lab' = 'house'
): { group: THREE.Group; doorLeafGroup: THREE.Group } {
  const g = new THREE.Group();
  const baseY = getRawTerrainHeight(x, z, 1);
  g.position.set(x, baseY - 0.08, z);
  g.rotation.y = rotY;

  const w = style === 'castle' ? 7.6 : style === 'school' || style === 'market' ? 6.8 : 5.6;
  const d = style === 'castle' ? 6.4 : 4.8;
  const h = style === 'castle' ? 3.8 : 3.0;

  const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofHex, roughness: 0.52 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimHex, roughness: 0.45 });
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    emissive: 0x047857,
    emissiveIntensity: 0.25,
    roughness: 0.45,
  });
  const winMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45,
    roughness: 0.28,
  });
  disposables.push(wallMat, roofMat, trimMat, doorMat, winMat);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.36, d + 0.8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 }));
  plinth.position.y = 0.18;
  plinth.receiveShadow = true;
  g.add(plinth);

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  body.position.y = 0.36 + h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.22, d + 0.16), trimMat);
  trim.position.y = 0.36 + h;
  g.add(trim);

  if (style === 'mosque') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.15, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), roofMat);
    dome.position.y = 0.36 + h;
    dome.castShadow = true;
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 5.2, 10), wallMat);
    minaret.position.set(w / 2 + 0.45, 2.6, 0);
    minaret.castShadow = true;
    const minaretDome = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.1, 10), roofMat);
    minaretDome.position.set(w / 2 + 0.45, 5.65, 0);
    g.add(dome, minaret, minaretDome);
  } else if (style === 'castle') {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.35, d + 0.2), roofMat);
    roof.position.y = 0.36 + h + 0.18;
    g.add(roof);
    [-w / 2 + 0.4, w / 2 - 0.4].forEach((tx) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 5.6, 12), wallMat);
      tower.position.set(tx, 2.8, d / 2 - 0.4);
      tower.castShadow = true;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.8, 12), roofMat);
      spire.position.set(tx, 6.45, d / 2 - 0.4);
      g.add(tower, spire);
    });
  } else if (style === 'lab') {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.32, d + 0.2), roofMat);
    roof.position.y = 0.36 + h + 0.16;
    const obsDome = new THREE.Mesh(new THREE.SphereGeometry(1.45, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), trimMat);
    obsDome.position.y = 0.36 + h + 0.3;
    g.add(roof, obsDome);
  } else {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 2.1, 4), roofMat);
    roof.position.y = 0.36 + h + 1.05;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
    if (style === 'church') {
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.05, 0.16), trimMat);
      crossV.position.set(0, 0.36 + h + 2.45, 0);
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.16), trimMat);
      crossH.position.set(0, 0.36 + h + 2.6, 0);
      g.add(crossV, crossH);
    }
  }

  // Dark portal recess behind swinging door leaf
  const portalRecess = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 2.14, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  portalRecess.position.set(0, 0.36 + 1.07, d / 2 + 0.01);
  g.add(portalRecess);

  // Hinged swinging front entrance door leaf (+Z in local coords, pivot on left edge)
  const doorLeafGroup = new THREE.Group();
  doorLeafGroup.position.set(-0.725, 0.36 + 1.08, d / 2 + 0.06);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.15, 0.14), doorMat);
  door.position.set(0.725, 0, 0);
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.25 })
  );
  knob.position.set(1.26, -0.05, 0.1);
  doorLeafGroup.add(door, knob);
  g.add(doorLeafGroup);

  [-w * 0.3, w * 0.3].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.14), winMat);
    win.position.set(wx, 0.36 + 1.7, d / 2 + 0.05);
    g.add(win);
  });

  const sign = makeBanner(bannerTitle, bannerSub, bannerBg, 3.6, 1.0, maxAniso, disposables);
  sign.position.set(0, 0.36 + h - 0.18, d / 2 + 0.2);
  g.add(sign);

  return { group: g, doorLeafGroup };
}

export function buildGrade1OpenWorldAddons(
  religion: ReligionId,
  maxAniso: number
): Grade1OpenWorldAddons {
  const root = new THREE.Group();
  const doorTriggers: Grade1DoorTrigger[] = [];
  const interactiveNodes: Grade1InteractiveNode[] = [];
  const exteriorSeats: Grade1SeatSpot[] = [];
  const predators: Grade1PredatorEntity[] = [];
  const safeZones: Grade1SafeZone[] = [];
  const extraNpcs: NpcDefinition[] = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  // ------------------------------------------------------------------
  // 1. DESA CERIA: Rumah Ceria (Enterable) at (-29, -2) facing East (+X)
  // ------------------------------------------------------------------
  const rumahCeria = buildEnterableHouse(
    -29,
    -2,
    Math.PI / 2,
    0xfffbeb,
    0xea580c,
    0xf59e0b,
    'RUMAH CERIA',
    'Masuk Ruangan [E]',
    '#ea580c',
    maxAniso,
    disposables,
    'house'
  );
  root.add(rumahCeria.group);
  boxColliders.push({ minX: -31.8, maxX: -26.2, minZ: -5.2, maxZ: 1.2 });
  const rumahDoorRing = makePortalRing(0x10b981, -25.1, -2, disposables);
  root.add(rumahDoorRing);
  doorTriggers.push({
    id: 'rumah-ceria',
    label: 'Masuk Rumah Ceria',
    subtitle: 'Ruang Tamu, Meja Belajar & Kanvas',
    accentHex: '#EA580C',
    entryX: -25.1,
    entryZ: -2,
    radius: 2.1,
    returnX: -23.6,
    returnZ: -2,
    returnYaw: -Math.PI / 2,
    glowRing: rumahDoorRing,
    doorLeafGroup: rumahCeria.doorLeafGroup,
  });

  // ------------------------------------------------------------------
  // 2. KEBUN PENGETAHUAN (-48, -28): Orchard Trees, Plants, Well, Animals
  // ------------------------------------------------------------------
  const kebunBanner = makeBanner(
    'KEBUN PENGETAHUAN',
    'Petik Buah · Tanam & Siram · Rawat Hewan',
    '#16a34a',
    4.6,
    1.25,
    maxAniso,
    disposables
  );
  kebunBanner.position.set(-48, getRawTerrainHeight(-48, -20, 1) + 2.8, -19.5);
  root.add(kebunBanner);

  // Fruit trees with detachable good & rotten fruits
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.72 });
  const goodAppleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
  const rottenMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 });
  disposables.push(trunkMat, leafMat, goodAppleMat, rottenMat);

  [
    { id: 'ow-orchard-1', x: -53, z: -26, label: 'Pohon Apel Kebun' },
    { id: 'ow-orchard-2', x: -45, z: -31, label: 'Pohon Jeruk Manis' },
  ].forEach((treeSpec, idx) => {
    const tg = new THREE.Group();
    tg.position.set(treeSpec.x, getWalkableHeight(treeSpec.x, treeSpec.z, 1), treeSpec.z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 2.2, 8), trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.65, 14, 12), leafMat);
    crown.position.y = 2.85;
    crown.castShadow = true;
    tg.add(trunk, crown);

    const detachableFruits: NonNullable<Grade1InteractiveNode['detachableFruits']> = [];
    for (let f = 0; f < 4; f++) {
      const angle = (f / 4) * Math.PI * 2;
      const isRotten = f === 3 && idx === 1;
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 10, 10),
        isRotten ? rottenMat : goodAppleMat
      );
      fruit.position.set(Math.cos(angle) * 1.28, 2.2, Math.sin(angle) * 1.28);
      fruit.castShadow = true;
      tg.add(fruit);
      detachableFruits.push({ mesh: fruit, isRotten, picked: false });
    }

    const orb = makeNodeOrb(0xef4444, 4.7, disposables);
    tg.add(orb);
    root.add(tg);
    circleColliders.push({ x: treeSpec.x, z: treeSpec.z, radius: 0.65 });
    interactiveNodes.push({
      id: treeSpec.id,
      category: 'fruit-tree',
      label: treeSpec.label,
      sublabel: 'Petik Buah Segar (Awas Buah Busuk!)',
      x: treeSpec.x,
      z: treeSpec.z,
      radius: 2.7,
      detailText: 'Petik buah matang untuk dihitung & dijual di Pasar Sahabat!',
      mesh: tg,
      statusMesh: orb,
      detachableFruits,
    });
  });

  // Water Well (-43, -24) + 2 Plant Plots (-50, -34), (-44, -35)
  const wellG = new THREE.Group();
  wellG.position.set(-43, getWalkableHeight(-43, -24, 1), -24);
  const wellRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.05, 0.95, 14),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 })
  );
  wellRim.position.y = 0.475;
  const wellWater = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.76, 0.1, 14),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15 })
  );
  wellWater.position.y = 0.85;
  const wellOrb = makeNodeOrb(0x38bdf8, 1.9, disposables);
  wellG.add(wellRim, wellWater, wellOrb);
  root.add(wellG);
  circleColliders.push({ x: -43, z: -24, radius: 1.05 });
  interactiveNodes.push({
    id: 'ow-kebun-well',
    category: 'water-well',
    label: 'Sumur Air Kebun',
    sublabel: 'Ambil Ember Air Segar',
    x: -43,
    z: -24,
    radius: 2.5,
    detailText: 'Timba air bersih dari sumur untuk menyiram tanaman di kebun!',
    mesh: wellG,
    statusMesh: wellOrb,
  });

  [
    { id: 'ow-plant-1', x: -50, z: -33, label: 'Petak Bunga Matahari' },
    { id: 'ow-plant-2', x: -45, z: -35, label: 'Petak Sayur Tomat' },
  ].forEach((ps) => {
    const pg = new THREE.Group();
    pg.position.set(ps.x, getWalkableHeight(ps.x, ps.z, 1), ps.z);
    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.22, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.92 })
    );
    soil.position.y = 0.11;
    const stage0 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.6 })
    );
    stage0.position.y = 0.3;
    const stage1 = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 1.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 })
    );
    stage1.position.y = 0.68;
    stage1.visible = false;
    const stage2 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.25 })
    );
    stage2.position.y = 1.15;
    stage2.visible = false;
    const pOrb = makeNodeOrb(0x22c55e, 1.9, disposables);
    pg.add(soil, stage0, stage1, stage2, pOrb);
    root.add(pg);
    interactiveNodes.push({
      id: ps.id,
      category: 'plant-plot',
      label: ps.label,
      sublabel: 'Tanam Benih -> Siram -> Mekar!',
      x: ps.x,
      z: ps.z,
      radius: 2.5,
      detailText: 'Tekan Aksi berurutan: Tanam benih, lalu ambil air di sumur & siram hingga mekar!',
      mesh: pg,
      statusMesh: pOrb,
      plantStage: 0,
      stageMeshes: [stage0, stage1, stage2],
    });
  });

  // Friendly Rabbit Feeding Pen (-54, -33)
  const rabbitG = new THREE.Group();
  rabbitG.position.set(-54, getWalkableHeight(-54, -33, 1), -33);
  const rabBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
  );
  rabBody.position.y = 0.42;
  const rabHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
  );
  rabHead.position.set(0, 0.72, 0.3);
  const rabOrb = makeNodeOrb(0xf59e0b, 1.6, disposables);
  rabbitG.add(rabBody, rabHead, rabOrb);
  root.add(rabbitG);
  circleColliders.push({ x: -54, z: -33, radius: 0.7 });
  interactiveNodes.push({
    id: 'ow-kebun-kelinci',
    category: 'animal-feed',
    label: 'Kelinci Jinak Kebun',
    sublabel: 'Beri Makan Wortel & Sayur Segar',
    x: -54,
    z: -33,
    radius: 2.5,
    detailText: 'Sayangi hewan peliharaan dengan memberi makan tumbuhan segar!',
    mesh: rabbitG,
    statusMesh: rabOrb,
  });

  extraNpcs.push({
    id: 'g1-ow-pak-tani',
    name: 'Pak Tani Budi',
    role: 'Penjaga Kebun Pengetahuan',
    roleStyle: 'farmer',
    x: -47,
    z: -22,
    facingY: 0.35,
    greeting: 'Halo petualang Kebun Pengetahuan! Petiklah apel segar, timba air sumur, dan sirami tanaman sampai mekar!',
    story: 'Tumbuhan membutuhkan air dan cahaya matahari untuk tumbuh subur. Buah panenmu bisa dijual di Pasar Sahabat!',
    trivia: {
      question: 'Bagian tumbuhan yang menyerap air dari dalam tanah adalah...',
      options: ['Akar', 'Bunga', 'Buah'],
      correctIndex: 0,
      rewardCoins: 20,
      rewardScore: 100,
      explanation: 'Akar menyerap air dan zat hara dari dalam tanah menuju batang dan daun.',
      hints: ['Bagian ini berada tersembunyi di dalam tanah.', 'Tugasnya menegakkan batang sekaligus menyedot air hujan.'],
    },
    colors: { skin: 0xd9a074, hair: 0x334155, shirt: 0xecfccb, vest: 0x15803d, pants: 0x78350f, scarf: 0xfbbf24, hat: 0xd97706 },
  });

  // ------------------------------------------------------------------
  // 3. KOTA SEKOLAH (-22, -44): Sekolah, Perpustakaan Ceria, Masjid, Gereja
  // ------------------------------------------------------------------
  const kotaBanner = makeBanner(
    'KOTA SEKOLAH',
    'Sekolah · Perpustakaan · Rumah Ibadah',
    '#4f46e5',
    5.0,
    1.25,
    maxAniso,
    disposables
  );
  kotaBanner.position.set(-20, getRawTerrainHeight(-20, -34, 1) + 2.8, -33.5);
  root.add(kotaBanner);

  // Sekolah Nusantara (-22, -49)
  const sekolah = buildEnterableHouse(-22, -49, 0, 0xf8fafc, 0xdc2626, 0x0284c7, 'SEKOLAH NUSANTARA', 'Masuk Kelas [E]', '#0284c7', maxAniso, disposables, 'school');
  root.add(sekolah.group);
  boxColliders.push({ minX: -25.6, maxX: -18.4, minZ: -51.7, maxZ: -46.3 });
  const sekolahRing = makePortalRing(0x0284c7, -22, -44.9, disposables);
  root.add(sekolahRing);
  doorTriggers.push({
    id: 'sekolah-nusantara',
    label: 'Masuk Sekolah Nusantara',
    subtitle: 'Ruang Kelas, Papan Kalimat & Berhitung',
    accentHex: '#0284C7',
    entryX: -22,
    entryZ: -44.9,
    radius: 2.2,
    returnX: -22,
    returnZ: -43.0,
    returnYaw: Math.PI,
    glowRing: sekolahRing,
    doorLeafGroup: sekolah.doorLeafGroup,
  });

  // Perpustakaan Ceria (-34, -44)
  const perpusKota = buildEnterableHouse(-34, -44, 0.35, 0xe0f2fe, 0x0891b2, 0xfbbf24, 'PERPUSTAKAAN CERIA', 'Masuk Ruangan [E]', '#0891b2', maxAniso, disposables, 'house');
  root.add(perpusKota.group);
  boxColliders.push({ minX: -37.2, maxX: -30.8, minZ: -46.8, maxZ: -41.2 });
  const perpusKotaRing = makePortalRing(0x0891b2, -32.2, -40.2, disposables);
  root.add(perpusKotaRing);
  doorTriggers.push({
    id: 'perpustakaan-ceria',
    label: 'Masuk Perpustakaan Ceria',
    subtitle: 'Buku Cerita, Vokal & Susun Kalimat',
    accentHex: '#0891B2',
    entryX: -32.2,
    entryZ: -40.2,
    radius: 2.2,
    returnX: -31.0,
    returnZ: -38.6,
    returnYaw: Math.PI,
    glowRing: perpusKotaRing,
    doorLeafGroup: perpusKota.doorLeafGroup,
  });

  // Masjid Cahaya (-9, -49)
  const masjid = buildEnterableHouse(-9, -49, 0, 0xffffff, 0x059669, 0xfbbf24, 'MASJID CAHAYA', 'Masuk Masjid [E]', '#0d9488', maxAniso, disposables, 'mosque');
  root.add(masjid.group);
  boxColliders.push({ minX: -12.3, maxX: -5.7, minZ: -51.7, maxZ: -46.3 });
  const masjidRing = makePortalRing(0x0d9488, -9, -45.0, disposables);
  root.add(masjidRing);
  doorTriggers.push({
    id: 'masjid-cahaya',
    label: 'Masuk Masjid Cahaya',
    subtitle: 'Wudu Bersih, Basmalah & Akhlak Mulia',
    accentHex: '#0D9488',
    entryX: -9,
    entryZ: -45.0,
    radius: 2.2,
    returnX: -9,
    returnZ: -43.2,
    returnYaw: Math.PI,
    glowRing: masjidRing,
    doorLeafGroup: masjid.doorLeafGroup,
  });

  // Gereja Damai (-2, -41)
  const gereja = buildEnterableHouse(-2, -41, -0.35, 0xf8fafc, 0x4f46e5, 0xfbbf24, 'GEREJA DAMAI', 'Masuk Gereja [E]', '#4f46e5', maxAniso, disposables, 'church');
  root.add(gereja.group);
  boxColliders.push({ minX: -5.2, maxX: 1.2, minZ: -43.8, maxZ: -38.2 });
  const gerejaRing = makePortalRing(0x4f46e5, -3.5, -37.2, disposables);
  root.add(gerejaRing);
  doorTriggers.push({
    id: 'gereja-damai',
    label: 'Masuk Gereja Damai',
    subtitle: 'Doa Syukur & Kasih Sesama',
    accentHex: '#4F46E5',
    entryX: -3.5,
    entryZ: -37.2,
    radius: 2.2,
    returnX: -4.5,
    returnZ: -35.8,
    returnYaw: Math.PI,
    glowRing: gerejaRing,
    doorLeafGroup: gereja.doorLeafGroup,
  });

  // Dedicated Heritage Sanctuary Landmark when player selects Hindu / Buddha / Khonghucu
  if (religion === 'hindu' || religion === 'buddha' || religion === 'khonghucu') {
    const labelTitle =
      religion === 'hindu' ? 'PURA AGUNG SARI' : religion === 'buddha' ? 'VIHARA TERATAI' : 'KLENTENG HARMONI';
    const sanctuaryAccent =
      religion === 'hindu' ? 0xd97706 : religion === 'buddha' ? 0xca8a04 : 0xdc2626;
    const pavG = new THREE.Group();
    pavG.position.set(-14, getWalkableHeight(-14, -36, 1), -36);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.35, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
    );
    base.position.y = 0.175;
    const shrine = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.2, 1.4),
      new THREE.MeshStandardMaterial({ color: sanctuaryAccent, roughness: 0.5 })
    );
    shrine.position.y = 1.28;
    const banner = makeBanner(labelTitle, 'Tempat Ibadah & Budi Pekerti', '#b45309', 3.4, 0.95, maxAniso, disposables);
    banner.position.set(0, 2.9, 0.8);
    const orb = makeNodeOrb(sanctuaryAccent, 3.6, disposables);
    pavG.add(base, shrine, banner, orb);
    root.add(pavG);
    circleColliders.push({ x: -14, z: -36, radius: 1.5 });
    interactiveNodes.push({
      id: `ow-sanctuary-${religion}`,
      category: 'learn-spot',
      label: labelTitle,
      sublabel: 'Pelajari Doa & Budi Pekerti',
      x: -14,
      z: -36,
      radius: 2.8,
      detailText: `Kunjungi ${labelTitle} untuk mempelajari nilai luhur agama yang kamu pilih!`,
      mesh: pavG,
      statusMesh: orb,
    });
  }

  // ------------------------------------------------------------------
  // 4. PASAR SAHABAT (-44, 40): Enterable Market Hall + Outdoor Stalls
  // ------------------------------------------------------------------
  const pasar = buildEnterableHouse(-48, 43, 0.55, 0xfef3c7, 0xd97706, 0xb45309, 'PASAR SAHABAT', 'Masuk Pasar [E]', '#d97706', maxAniso, disposables, 'market');
  root.add(pasar.group);
  boxColliders.push({ minX: -51.6, maxX: -44.4, minZ: 39.8, maxZ: 46.2 });
  const pasarRing = makePortalRing(0xd97706, -44.8, 39.2, disposables);
  root.add(pasarRing);
  doorTriggers.push({
    id: 'pasar-sahabat',
    label: 'Masuk Pasar Sahabat',
    subtitle: 'Jual Buah & Belanja dengan Koin Rupiah',
    accentHex: '#D97706',
    entryX: -44.8,
    entryZ: 39.2,
    radius: 2.3,
    returnX: -43.2,
    returnZ: 37.8,
    returnYaw: Math.PI,
    glowRing: pasarRing,
    doorLeafGroup: pasar.doorLeafGroup,
  });

  // Outdoor Pasar Rupiah Counter (-38, 36)
  const marketG = new THREE.Group();
  marketG.position.set(-38, getWalkableHeight(-38, 36, 1), 36);
  const mTable = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.9, 1.3),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
  );
  mTable.position.y = 0.45;
  const mCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.16, 1.6),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.55 })
  );
  mCanopy.position.y = 2.3;
  const mOrb = makeNodeOrb(0xfbbf24, 2.9, disposables);
  marketG.add(mTable, mCanopy, mOrb);
  root.add(marketG);
  boxColliders.push({ minX: -39.4, maxX: -36.6, minZ: 35.2, maxZ: 36.8 });
  interactiveNodes.push({
    id: 'ow-pasar-shop',
    category: 'market-shop',
    label: 'Kedai Koin Rupiah',
    sublabel: 'Berbelanja & Hitung Kembalian',
    x: -38,
    z: 36,
    radius: 2.6,
    detailText: 'Buka Toko Pasar Sahabat untuk menjual buah dan berbelanja perlengkapan sekolah!',
    mesh: marketG,
    statusMesh: mOrb,
  });

  // ------------------------------------------------------------------
  // 5. KERAJAAN ILMU (48, 2): Istana Enterable + Royal Exam Pedestal
  // ------------------------------------------------------------------
  const istana = buildEnterableHouse(55, 2, -Math.PI / 2, 0xfaf5ff, 0x7c3aed, 0xfbbf24, 'KERAJAAN ILMU', 'Masuk Istana [E]', '#7c3aed', maxAniso, disposables, 'castle');
  root.add(istana.group);
  boxColliders.push({ minX: 51.2, maxX: 58.8, minZ: -2.0, maxZ: 6.0 });
  const istanaRing = makePortalRing(0x7c3aed, 50.0, 2.0, disposables);
  root.add(istanaRing);
  doorTriggers.push({
    id: 'kerajaan-ilmu',
    label: 'Masuk Istana Kerajaan Ilmu',
    subtitle: 'Galeri Karya & Singgasana Ujian Akhir',
    accentHex: '#7C3AED',
    entryX: 50.0,
    entryZ: 2.0,
    radius: 2.4,
    returnX: 48.0,
    returnZ: 2.0,
    returnYaw: -Math.PI / 2,
    glowRing: istanaRing,
    doorLeafGroup: istana.doorLeafGroup,
  });

  // Outdoor Royal Archway & Combined Exam Pedestal at (42, 2)
  const throneExG = new THREE.Group();
  throneExG.position.set(42, getWalkableHeight(42, 2, 1), 2);
  const tBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.45, 14),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.45 })
  );
  tBase.position.y = 0.225;
  const tPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 1.0, 10),
    new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.35 })
  );
  tPillar.position.y = 0.85;
  const tOrb = makeNodeOrb(0xfbbf24, 2.0, disposables);
  throneExG.add(tBase, tPillar, tOrb);
  root.add(throneExG);
  circleColliders.push({ x: 42, z: 2, radius: 1.1 });
  interactiveNodes.push({
    id: 'ow-kerajaan-exam',
    category: 'exam-throne',
    label: 'Gerbang Ujian Akhir Kelas 1',
    sublabel: 'Kuis Gabungan Seluruh Mata Pelajaran',
    x: 42,
    z: 2,
    radius: 2.6,
    detailText: 'Siap menguji semua ilmu Kelas 1? Tekan Aksi untuk mulai Ujian Akhir!',
    mesh: throneExG,
    statusMesh: tOrb,
  });

  // ------------------------------------------------------------------
  // 6. HUTAN MISTERI (44, -38): Wild Flora, Safe Zone, Predator Wolf & Trash Sort
  // ------------------------------------------------------------------
  const hutanBanner = makeBanner(
    'HUTAN MISTERI',
    'Amati Alam · Waspada Serigala · Masuk Zona Aman',
    '#059669',
    4.8,
    1.25,
    maxAniso,
    disposables
  );
  hutanBanner.position.set(38, getRawTerrainHeight(38, -30, 1) + 2.8, -30);
  root.add(hutanBanner);

  // Cluster of lush forest canopy trees
  const forestCoords: Array<[number, number]> = [
    [48, -42],
    [53, -36],
    [41, -46],
    [52, -45],
    [35, -42],
  ];
  forestCoords.forEach(([tx, tz]) => {
    const ty = getRawTerrainHeight(tx, tz, 1);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.5, 2.8, 8), trunkMat);
    trunk.position.set(tx, ty + 1.4, tz);
    trunk.castShadow = true;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(2.1, 3.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78 })
    );
    crown.position.set(tx, ty + 4.1, tz);
    crown.castShadow = true;
    root.add(trunk, crown);
    circleColliders.push({ x: tx, z: tz, radius: 0.72 });
  });

  // Safe Zone Circle (37, -36)
  const szY = getWalkableHeight(37, -36, 1);
  const safeRing = new THREE.Mesh(
    new THREE.RingGeometry(2.2, 2.75, 28),
    new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
  );
  safeRing.rotation.x = -Math.PI / 2;
  safeRing.position.set(37, szY + 0.08, -36);
  root.add(safeRing);
  safeZones.push({ id: 'ow-hutan-safe', x: 37, z: -36, radius: 2.8, ringMesh: safeRing });

  // Active Forest Predator Wolf patrolling (46, -38)
  const wolfG = new THREE.Group();
  const wx = 46;
  const wz = -38;
  wolfG.position.set(wx, getWalkableHeight(wx, wz, 1), wz);
  const wolfMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
  const wolfBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.58, 1.3), wolfMat);
  wolfBody.position.y = 0.65;
  const wolfHead = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.56), wolfMat);
  wolfHead.position.set(0, 0.92, 0.72);
  const legParts: THREE.Object3D[] = [];
  [
    [-0.24, 0.42],
    [0.24, 0.42],
    [-0.24, -0.42],
    [0.24, -0.42],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.46, 0.16), wolfMat);
    leg.position.set(lx, 0.23, lz);
    wolfG.add(leg);
    legParts.push(leg);
  });
  wolfG.add(wolfBody, wolfHead);
  root.add(wolfG);
  predators.push({
    group: wolfG,
    legParts,
    homeX: wx,
    homeZ: wz,
    x: wx,
    z: wz,
    yaw: 0,
    chasing: false,
    cooldown: 0,
  });

  // Forest Observation Stone & Organic Trash Sort (40, -40)
  const forestTrashG = new THREE.Group();
  forestTrashG.position.set(40, getWalkableHeight(40, -40, 1), -40);
  const leafPile = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.45, 0),
    new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.85 })
  );
  leafPile.position.y = 0.3;
  const fOrb = makeNodeOrb(0x22c55e, 1.5, disposables);
  forestTrashG.add(leafPile, fOrb);
  root.add(forestTrashG);
  interactiveNodes.push({
    id: 'ow-hutan-sampah',
    category: 'trash-item',
    label: 'Bersihkan Hutan & Pilah Sampah',
    sublabel: 'Organik & Anorganik',
    x: 40,
    z: -40,
    radius: 2.5,
    isOrganic: true,
    detailText: 'Bersihkan sampah di hutan agar ekosistem tetap asri!',
    mesh: forestTrashG,
    statusMesh: fOrb,
  });

  // ------------------------------------------------------------------
  // 7. PANTAI DAN LAUT (44, 42): Palm Trees, Wooden Pier, Boat, Shape/Color Plaza, PJOK
  // ------------------------------------------------------------------
  const pantaiBanner = makeBanner(
    'PANTAI DAN LAUT',
    'Dermaga Kayu · Warna & Bentuk · Senam Pantai',
    '#0891b2',
    4.8,
    1.25,
    maxAniso,
    disposables
  );
  pantaiBanner.position.set(40, getRawTerrainHeight(40, 32, 1) + 2.8, 32);
  root.add(pantaiBanner);

  // Palm trees along beach
  const palmCoords: Array<[number, number]> = [
    [35, 42],
    [53, 41],
    [55, 34],
  ];
  palmCoords.forEach(([px, pz]) => {
    const py = getRawTerrainHeight(px, pz, 1);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.34, 4.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
    );
    trunk.position.set(px, py + 2.1, pz);
    trunk.rotation.z = 0.08;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(2.0, 1.1, 7),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 })
    );
    crown.position.set(px - 0.16, py + 4.3, pz);
    root.add(trunk, crown);
    circleColliders.push({ x: px, z: pz, radius: 0.55 });
  });

  // Playable Wooden Pier over GRADE1_PIER (x: 44..50, z: 46..60, deckHeight: 0.72)
  const pierW = GRADE1_PIER.maxX - GRADE1_PIER.minX;
  const pierL = GRADE1_PIER.maxZ - GRADE1_PIER.minZ;
  const pierCenterX = (GRADE1_PIER.minX + GRADE1_PIER.maxX) / 2;
  const pierCenterZ = (GRADE1_PIER.minZ + GRADE1_PIER.maxZ) / 2;
  const pierDeckMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.72 });
  const pierDeck = new THREE.Mesh(new THREE.BoxGeometry(pierW, 0.24, pierL), pierDeckMat);
  pierDeck.position.set(pierCenterX, GRADE1_PIER.deckHeight - 0.12, pierCenterZ);
  pierDeck.receiveShadow = true;
  root.add(pierDeck);
  for (let pz = GRADE1_PIER.minZ + 1; pz <= GRADE1_PIER.maxZ - 0.5; pz += 3.5) {
    [GRADE1_PIER.minX + 0.3, GRADE1_PIER.maxX - 0.3].forEach((px) => {
      const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 2.4, 8), trunkMat);
      piling.position.set(px, GRADE1_PIER.deckHeight - 0.45, pz);
      root.add(piling);
    });
  }

  // Nusantara Sailboat bobbing beside Pier at (53, 56)
  const boatG = new THREE.Group();
  boatG.position.set(53, -0.05, 56);
  boatG.rotation.y = 0.4;
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.75, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 })
  );
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), trunkMat);
  mast.position.y = 1.8;
  const sail = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 2.1, 1.9),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  sail.position.set(0, 2.1, -0.2);
  boatG.add(hull, mast, sail);
  root.add(boatG);

  // Shape & Color Sorting Plaza at Pantai (40, 39)
  const shapePlazaG = new THREE.Group();
  shapePlazaG.position.set(40, getWalkableHeight(40, 39, 1), 39);
  const padBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.85, 0.16, 18),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 })
  );
  padBase.position.y = 0.08;
  const redCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.65, 0.65),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 })
  );
  redCube.position.set(-0.65, 0.48, 0);
  const blueSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
  );
  blueSphere.position.set(0, 0.52, -0.45);
  const yellowCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.75, 4),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
  );
  yellowCone.position.set(0.65, 0.54, 0.15);
  const shapeOrb = makeNodeOrb(0x0891b2, 1.75, disposables);
  shapePlazaG.add(padBase, redCube, blueSphere, yellowCone, shapeOrb);
  root.add(shapePlazaG);
  circleColliders.push({ x: 40, z: 39, radius: 1.15 });
  interactiveNodes.push({
    id: 'ow-pantai-shape-color',
    category: 'shape-color-pad',
    label: 'Plaza Bentuk & Warna',
    sublabel: 'Kelompokkan Warna & Bangun 3D',
    x: 40,
    z: 39,
    radius: 2.8,
    detailText: 'Mainkan aktivitas mengelompokkan Lingkaran, Segitiga, Persegi, dan Warna!',
    mesh: shapePlazaG,
    statusMesh: shapeOrb,
  });

  // PJOK Beach Exercise Coach Mat at Pantai (47, 37)
  const pjokG = new THREE.Group();
  pjokG.position.set(47, getWalkableHeight(47, 37, 1), 37);
  const matExercise = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.1, 1.6),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.65 })
  );
  matExercise.position.y = 0.05;
  const pjokOrb = makeNodeOrb(0xf97316, 1.65, disposables);
  pjokG.add(matExercise, pjokOrb);
  root.add(pjokG);
  interactiveNodes.push({
    id: 'ow-pantai-pjok',
    category: 'pjok-coach',
    label: 'Arena Senam & Gerak Tubuh',
    sublabel: 'Lakukan Gerak Sehat 3D Bersama Karakter',
    x: 47,
    z: 37,
    radius: 2.5,
    detailText: 'Ikuti gerakan Lompat Bintang, Bangau Seimbang, dan Peregangan Tangan!',
    mesh: pjokG,
    statusMesh: pjokOrb,
  });

  extraNpcs.push({
    id: 'g1-ow-nelayan-rio',
    name: 'Pak Rio',
    role: 'Pemandu Pantai & Dermaga',
    roleStyle: 'sailor',
    x: 43.5,
    z: 44.5,
    facingY: 0.1,
    greeting: 'Wah sejuknya angin laut! Cobalah berjalan ke ujung Dermaga Kayu, lalu kunjungi Plaza Bentuk & Warna!',
    story: 'Menjaga pantai tetap bersih dari sampah plastik menjaga ikan dan penyu tetap aman berenang.',
    trivia: {
      question: 'Benda di pantai yang berbentuk bangun ruang BOLA adalah...',
      options: ['Bola pantai bulat', 'Kotak kayu persegi', 'Topi kerucut'],
      correctIndex: 0,
      rewardCoins: 20,
      rewardScore: 100,
      explanation: 'Bola pantai berbentuk bulat sempurna menyerupai bangun ruang bola.',
      hints: ['Bentuknya melengkung mulus di seluruh sisi.', 'Biasa dipantulkan atau dilempar saat bermain di pantai.'],
    },
    colors: { skin: 0xd9a074, hair: 0x1e293b, shirt: 0xffffff, vest: 0x0891b2, pants: 0x0f172a, scarf: 0xf97316 },
  });

  // ------------------------------------------------------------------
  // 8. LABORATORIUM ILMUWAN MUDA (28, 22): Enterable 8th Region
  // ------------------------------------------------------------------
  const labBanner = makeBanner(
    'LABORATORIUM ILMUWAN',
    'Sains Alam · Eksperimen & Kubus 3D',
    '#0d9488',
    4.6,
    1.2,
    maxAniso,
    disposables
  );
  labBanner.position.set(27, getRawTerrainHeight(27, 17, 1) + 2.7, 17);
  root.add(labBanner);

  const labBuilding = buildEnterableHouse(
    29,
    22,
    -Math.PI / 2,
    0xf8fafc,
    0x0d9488,
    0x38bdf8,
    'LAB ILMUWAN MUDA',
    'Masuk Lab [E]',
    '#0d9488',
    maxAniso,
    disposables,
    'lab'
  );
  root.add(labBuilding.group);
  boxColliders.push({ minX: 25.6, maxX: 32.4, minZ: 19.0, maxZ: 25.0 });
  const labRing = makePortalRing(0x0d9488, 25.0, 22.0, disposables);
  root.add(labRing);
  doorTriggers.push({
    id: 'laboratorium-ilmuwan',
    label: 'Masuk Laboratorium Ilmuwan Muda',
    subtitle: 'Eksperimen Sains, Pancaindra & Kubus 3D',
    accentHex: '#0D9488',
    entryX: 25.0,
    entryZ: 22.0,
    radius: 2.2,
    returnX: 23.2,
    returnZ: 22.0,
    returnYaw: -Math.PI / 2,
    glowRing: labRing,
    doorLeafGroup: labBuilding.doorLeafGroup,
  });

  // ------------------------------------------------------------------
  // OUTDOOR PARK BENCHES (Duduk system works outdoors too!)
  // ------------------------------------------------------------------
  const parkBenchMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.72 });
  const parkLegMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  disposables.push(parkBenchMat, parkLegMat);

  const benchSpecs: Array<{
    id: string;
    label: string;
    x: number;
    z: number;
    yaw: number;
  }> = [
    { id: 'ext-bench-desa', label: 'Bangku Taman Desa Ceria', x: -16.0, z: 9.2, yaw: 0 },
    { id: 'ext-bench-sekolah', label: 'Bangku Halaman Sekolah', x: -15.5, z: -40.5, yaw: 0 },
    { id: 'ext-bench-pantai', label: 'Bangku Pantai & Laut', x: 37.5, z: 44.5, yaw: 0.4 },
    { id: 'ext-bench-lab', label: 'Bangku Taman Ilmuwan', x: 24.5, z: 18.2, yaw: 0 },
  ];

  benchSpecs.forEach((bs) => {
    const by = getWalkableHeight(bs.x, bs.z, 1);
    const bg = new THREE.Group();
    bg.position.set(bs.x, by, bs.z);
    bg.rotation.y = bs.yaw;

    const seatPlank = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.68), parkBenchMat);
    seatPlank.position.y = 0.42;
    seatPlank.castShadow = true;
    const backRest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.44, 0.1), parkBenchMat);
    backRest.position.set(0, 0.72, -0.29);
    backRest.castShadow = true;
    [-0.78, 0.78].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.6), parkLegMat);
      leg.position.set(lx, 0.21, 0);
      bg.add(leg);
    });
    root.add(bg);

    exteriorSeats.push({
      id: bs.id,
      label: bs.label,
      x: bs.x,
      seatTopY: by + 0.48,
      z: bs.z,
      facingYaw: bs.yaw,
      style: 'bench',
      locationContext: 'park',
    });
  });

  return {
    root,
    doorTriggers,
    interactiveNodes,
    exteriorSeats,
    predators,
    safeZones,
    extraNpcs,
    boxColliders,
    circleColliders,
    disposables,
  };
}
