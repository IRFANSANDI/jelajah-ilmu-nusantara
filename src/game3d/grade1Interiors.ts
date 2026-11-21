import * as THREE from 'three';
import {
  CharacterRig,
  createCartoonCharacter,
  createLabelCanvasTexture,
} from './models';
import { ReligionId } from './inventoryData';
import { BoxCollider, CircleCollider } from './terrain';
import { NpcDefinition } from './worldData';
import {
  Grade1EaselTarget,
  Grade1InteractiveNode,
} from './grade1WorldBuilders';

import {
  CharacterAnimState,
  Grade1SeatSpot,
} from './characterAnimation';

export type Grade1InteriorId =
  | 'rumah-ceria'
  | 'sekolah-nusantara'
  | 'perpustakaan-ceria'
  | 'masjid-cahaya'
  | 'gereja-damai'
  | 'pasar-sahabat'
  | 'kerajaan-ilmu'
  | 'laboratorium-ilmuwan';

export interface Grade1NpcPatrolPoint {
  x: number;
  z: number;
  anim: CharacterAnimState;
  facingY?: number;
  holdSec?: number;
}

export interface Grade1InteriorNpcEntry {
  def: NpcDefinition;
  rig: CharacterRig;
  isSeated?: boolean;
  seatStyle?: 'chair' | 'bench' | 'cushion';
  seatTopY?: number;
  animMode?: CharacterAnimState;
  patrolWaypoints?: Grade1NpcPatrolPoint[];
  patrolIdx?: number;
  patrolHoldTimer?: number;
}

export interface Grade1InteriorRuntime {
  id: Grade1InteriorId;
  title: string;
  subtitle: string;
  accentHex: string;
  root: THREE.Group;
  roomBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  spawnPos: { x: number; z: number; yaw: number };
  exitDoor: { x: number; z: number; radius: number };
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
  stations: Grade1InteractiveNode[];
  seats: Grade1SeatSpot[];
  npcEntries: Grade1InteriorNpcEntry[];
  easelTargets: Grade1EaselTarget[];
  disposables: Array<{ dispose: () => void }>;
}

function makeWallBanner(
  parent: THREE.Group,
  title: string,
  subtitle: string,
  bgHex: string,
  x: number,
  y: number,
  z: number,
  rotY: number,
  width: number,
  height: number,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const tex = createLabelCanvasTexture(title, subtitle, bgHex, '#ffffff', maxAniso);
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  disposables.push(tex, geo, mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  parent.add(mesh);
  return mesh;
}

function createRoomShell(
  root: THREE.Group,
  width: number,
  depth: number,
  wallHeight: number,
  floorColor: number,
  wallColor: number,
  trimColor: number,
  disposables: Array<{ dispose: () => void }>
): void {
  const floorGeo = new THREE.BoxGeometry(width + 0.6, 0.3, depth + 0.6);
  const floorMat = new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.72 });
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.78 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.55 });
  const winMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0xbae6fd,
    emissiveIntensity: 0.65,
    roughness: 0.2,
  });
  const doorGlowMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 0.55,
    roughness: 0.3,
  });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.68 });
  disposables.push(floorGeo, floorMat, wallMat, trimMat, winMat, doorGlowMat, woodMat);

  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(0, -0.15, 0);
  floor.receiveShadow = true;
  root.add(floor);

  const hw = width / 2;
  const hd = depth / 2;

  // Back wall (-Z)
  const backGeo = new THREE.BoxGeometry(width, wallHeight, 0.36);
  const back = new THREE.Mesh(backGeo, wallMat);
  back.position.set(0, wallHeight / 2, -hd);
  back.receiveShadow = true;
  root.add(back);

  // Left & Right walls (-X, +X)
  const sideGeo = new THREE.BoxGeometry(0.36, wallHeight, depth);
  const left = new THREE.Mesh(sideGeo, wallMat);
  left.position.set(-hw, wallHeight / 2, 0);
  left.receiveShadow = true;
  const right = new THREE.Mesh(sideGeo, wallMat);
  right.position.set(hw, wallHeight / 2, 0);
  right.receiveShadow = true;
  root.add(left, right);

  // Front wall (+Z) split around Exit Door (width 2.4m centered at x=0)
  const segW = (width - 2.6) / 2;
  const frontSegGeo = new THREE.BoxGeometry(segW, wallHeight, 0.36);
  const frontL = new THREE.Mesh(frontSegGeo, wallMat);
  frontL.position.set(-hw + segW / 2, wallHeight / 2, hd);
  const frontR = new THREE.Mesh(frontSegGeo, wallMat);
  frontR.position.set(hw - segW / 2, wallHeight / 2, hd);
  const headerGeo = new THREE.BoxGeometry(2.8, wallHeight - 2.6, 0.36);
  const header = new THREE.Mesh(headerGeo, trimMat);
  header.position.set(0, 2.6 + (wallHeight - 2.6) / 2, hd);
  root.add(frontL, frontR, header);

  // Baseboard trim
  const trimBack = new THREE.Mesh(new THREE.BoxGeometry(width, 0.24, 0.42), trimMat);
  trimBack.position.set(0, 0.12, -hd);
  root.add(trimBack);

  // Illuminated windows on Left & Right walls
  [-depth * 0.22, depth * 0.22].forEach((wz) => {
    const wl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.45, 1.75), winMat);
    wl.position.set(-hw + 0.04, 2.35, wz);
    const wr = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.45, 1.75), winMat);
    wr.position.set(hw - 0.04, 2.35, wz);
    root.add(wl, wr);
  });

  // Ceiling rafters + warm hanging lamps (open enough overhead for camera)
  [-depth * 0.25, depth * 0.2].forEach((bz) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(width, 0.22, 0.26), woodMat);
    beam.position.set(0, wallHeight - 0.15, bz);
    root.add(beam);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
      })
    );
    lamp.position.set(0, wallHeight - 0.48, bz);
    root.add(lamp);
  });

  // Interior lighting rig
  const hemi = new THREE.HemisphereLight(0xfffbeb, 0xd6d3d1, 1.45);
  const pLightA = new THREE.PointLight(0xfff3c4, 1.85, 22);
  pLightA.position.set(0, wallHeight - 0.6, -1.5);
  const pLightB = new THREE.PointLight(0xe0f2fe, 1.25, 20);
  pLightB.position.set(0, wallHeight - 0.6, 2.5);
  root.add(hemi, pLightA, pLightB);

  // Exit Door portal frame + glowing floor mat at (0, hd - 0.25)
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.65, 0.46), woodMat);
  frameL.position.set(-1.3, 1.325, hd - 0.05);
  const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.65, 0.46), woodMat);
  frameR.position.set(1.3, 1.325, hd - 0.05);
  const matExit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 1.15), doorGlowMat);
  matExit.position.set(0, 0.03, hd - 0.45);
  root.add(frameL, frameR, matExit);

  disposables.push(backGeo, sideGeo, frontSegGeo, headerGeo);
}

function makeInteriorStationOrb(
  colorHex: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const geo = new THREE.OctahedronGeometry(0.22, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.65,
    roughness: 0.22,
  });
  disposables.push(geo, mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 1.65;
  return mesh;
}

function addInteriorNpc(
  root: THREE.Group,
  def: NpcDefinition,
  npcEntries: Grade1InteriorNpcEntry[],
  circleColliders: CircleCollider[],
  extra?: {
    isSeated?: boolean;
    seatStyle?: 'chair' | 'bench' | 'cushion';
    seatTopY?: number;
    animMode?: CharacterAnimState;
    patrolWaypoints?: Grade1NpcPatrolPoint[];
    heroStyle?: 'bima' | 'sari';
    grade?: 1 | 2;
  }
) {
  const rig = createCartoonCharacter(def.colors, {
    grade: extra?.grade ?? 1,
    hasBackpack: false,
    hasHat: Boolean(def.colors.hat),
    isNpc: true,
    heroStyle: extra?.heroStyle,
    npcRoleStyle: def.roleStyle,
  });
  rig.root.position.set(def.x, 0, def.z);
  rig.root.rotation.y = def.facingY;
  root.add(rig.root);
  npcEntries.push({
    def,
    rig,
    isSeated: extra?.isSeated,
    seatStyle: extra?.seatStyle,
    seatTopY: extra?.seatTopY,
    animMode: extra?.animMode,
    patrolWaypoints: extra?.patrolWaypoints,
    patrolIdx: 0,
    patrolHoldTimer: 2.2,
  });
  if (!extra?.isSeated) {
    circleColliders.push({ x: def.x, z: def.z, radius: 0.52 });
  }
}

export function buildGrade1InteriorRoom(
  id: Grade1InteriorId,
  religion: ReligionId,
  savedArtworks: Array<{ id: string; title: string; dataUrl: string }>,
  maxAniso = 4
): Grade1InteriorRuntime {
  const root = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];
  const stations: Grade1InteractiveNode[] = [];
  const seats: Grade1SeatSpot[] = [];
  const npcEntries: Grade1InteriorNpcEntry[] = [];
  const easelTargets: Grade1EaselTarget[] = [];

  const roomW = 15.6;
  const roomD = 12.2;
  const wallH = 4.9;
  const exitZ = roomD / 2 - 0.5;

  let title = 'Ruangan';
  let subtitle = 'Interior 3D';
  let accentHex = '#0284C7';

  if (id === 'rumah-ceria') {
    title = 'Rumah Ceria';
    subtitle = 'Ruang Tamu Hangat & Meja Belajar';
    accentHex = '#EA580C';
    createRoomShell(root, roomW, roomD, wallH, 0xfef3c7, 0xfffbeb, 0xea580c, disposables);
    makeWallBanner(root, 'RUMAH CERIA', 'Keluarga Harmonis & Belajar Huruf', '#ea580c', 0, 3.25, -roomD / 2 + 0.24, 0, 4.6, 1.15, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Desa Ceria', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    // Colorful living rug
    const rugMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.85 });
    const rug = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.04, 3.4), rugMat);
    rug.position.set(-2.5, 0.02, -0.5);
    root.add(rug);

    // Sofa + Table (-3.2, -2.5)
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.72 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 1.1), sofaMat);
    sofaBase.position.set(-3.2, 0.325, -3.5);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 0.28), sofaMat);
    sofaBack.position.set(-3.2, 0.85, -3.9);
    const coffeeTable = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.48, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.68 })
    );
    coffeeTable.position.set(-3.2, 0.24, -1.6);
    root.add(sofaBase, sofaBack, coffeeTable);
    boxColliders.push(
      { minX: -4.9, maxX: -1.5, minZ: -4.2, maxZ: -2.8 },
      { minX: -4.2, maxX: -2.2, minZ: -2.2, maxZ: -1.0 }
    );

    // Bed in corner (4.8, -3.6)
    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.52, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    bedFrame.position.set(5.2, 0.26, -3.8);
    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.22, 1.85),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.75 })
    );
    blanket.position.set(5.2, 0.56, -3.8);
    root.add(bedFrame, blanket);
    boxColliders.push({ minX: 3.7, maxX: 6.8, minZ: -5.0, maxZ: -2.6 });

    // Study Desk + Alphabet Blocks station (4.2, 1.0)
    const deskGroup = new THREE.Group();
    deskGroup.position.set(4.4, 0, 1.0);
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.82, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 })
    );
    desk.position.y = 0.41;
    const blockA = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.45, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    blockA.position.set(-0.4, 1.04, 0);
    const blockB = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.45, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
    );
    blockB.position.set(0.25, 1.04, 0);
    const deskOrb = makeInteriorStationOrb(0xef4444, disposables);
    deskGroup.add(desk, blockA, blockB, deskOrb);
    root.add(deskGroup);
    boxColliders.push({ minX: 3.2, maxX: 5.6, minZ: 0.3, maxZ: 1.7 });

    stations.push({
      id: 'int-rumah-huruf',
      category: 'reading-spot',
      label: 'Meja Susun Kalimat Rumah',
      sublabel: 'Rangkai Kata & Kalimat Sederhana',
      x: 4.4,
      z: 1.0,
      radius: 2.3,
      detailText: 'Susun kartu kata menjadi kalimat lengkap bersama Ibu!',
      mesh: deskGroup,
      statusMesh: deskOrb,
    });

    // Art Easel inside bedroom/study (-4.8, 1.8)
    const easelGroup = new THREE.Group();
    easelGroup.position.set(-4.8, 0, 1.8);
    easelGroup.rotation.y = 0.65;
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.75, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 })
    );
    stand.position.y = 0.95;
    const canvasMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.88), canvasMat);
    canvasMesh.position.set(0, 1.3, 0.1);
    const easelOrb = makeInteriorStationOrb(0x9333ea, disposables);
    easelGroup.add(stand, canvasMesh, easelOrb);
    root.add(easelGroup);
    circleColliders.push({ x: -4.8, z: 1.8, radius: 0.75 });
    easelTargets.push({ index: 0, canvasMesh });
    stations.push({
      id: 'int-rumah-easel',
      category: 'art-easel',
      label: 'Kanvas Gambar di Rumah',
      sublabel: 'Lukis Karyamu di Rumah',
      x: -4.8,
      z: 1.8,
      radius: 2.2,
      detailText: 'Gambar bentuk, warna, dan pemandangan indah di kanvasmu!',
      mesh: easelGroup,
      statusMesh: easelOrb,
    });

    // Study chair flush in front of study desk (4.4, 1.95) facing North (-Z -> PI)
    const studyChair = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.48, 0.62),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.65 })
    );
    studyChair.position.set(4.4, 0.24, 1.95);
    root.add(studyChair);

    seats.push(
      {
        id: 'seat-rumah-belajar',
        label: 'Kursi Meja Belajar',
        x: 4.4,
        seatTopY: 0.48,
        z: 1.95,
        facingYaw: Math.PI,
        style: 'chair',
        hasDesk: true,
        locationContext: 'home',
      },
      {
        id: 'seat-rumah-sofa',
        label: 'Sofa Ruang Tamu',
        x: -3.2,
        seatTopY: 0.62,
        z: -3.3,
        facingYaw: 0,
        style: 'bench',
        locationContext: 'home',
      }
    );

    addInteriorNpc(
      root,
      {
        id: 'int-npc-ibu',
        name: 'Ibu Sari',
        role: 'Bunda Rumah Ceria',
        roleStyle: 'teacher',
        x: -1.4,
        z: -2.0,
        facingY: 0.25,
        greeting: 'Selamat datang di rumah, Nak! Sudah rapikan mainan dan belajar merangkai kalimat hari ini?',
        story: 'Kamar tidur yang rapi dan belajar di meja membuat pikiran segar dan bersemangat!',
        trivia: {
          question: 'Kalimat yang tersusun rapi dari kata "adik – membaca – buku" adalah...',
          options: ['Adik membaca buku.', 'Buku adik membaca.', 'Membaca buku adik.'],
          correctIndex: 0,
          rewardCoins: 20,
          rewardScore: 100,
          explanation: 'Subjek (Adik) + Predikat (membaca) + Objek (buku) membentuk kalimat utuh.',
        },
        colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xfef3c7, vest: 0xea580c, pants: 0x78350f, scarf: 0xfb7185 },
      },
      npcEntries,
      circleColliders,
      { animMode: 'talking' }
    );
  } else if (id === 'sekolah-nusantara') {
    title = 'Sekolah Nusantara';
    subtitle = 'Ruang Kelas Interaktif Kelas 1';
    accentHex = '#0284C7';
    createRoomShell(root, roomW, roomD, wallH, 0xe2e8f0, 0xf8fafc, 0x0284c7, disposables);
    makeWallBanner(root, 'RUANG KELAS 1 SD', 'Papan Tulis · Berhitung · 5 Sila', '#0284c7', 0, 3.35, -roomD / 2 + 0.24, 0, 5.2, 1.35, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Kota Sekolah', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    // Chalkboard on back wall (-3.2, -3.2)
    const boardGroup = new THREE.Group();
    boardGroup.position.set(0, 0, -4.6);
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 2.1, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 })
    );
    board.position.y = 1.85;
    const boardOrb = makeInteriorStationOrb(0x38bdf8, disposables);
    boardOrb.position.set(0, 3.2, 0.4);
    boardGroup.add(board, boardOrb);
    root.add(boardGroup);
    boxColliders.push({ minX: -2.8, maxX: 2.8, minZ: -5.2, maxZ: -4.1 });

    stations.push({
      id: 'int-sekolah-kalimat',
      category: 'reading-spot',
      label: 'Papan Tulis Kata & Kalimat',
      sublabel: 'Susun Suku Kata & Kalimat Baku',
      x: 0,
      z: -3.6,
      radius: 2.6,
      detailText: 'Latihan menyusun kalimat pendek di papan tulis kelas!',
      mesh: boardGroup,
      statusMesh: boardOrb,
    });

    // 4 Student Desks + Interactive Chairs (player can sit on front-right & back-left; classmates sit on the other 2!)
    const deskPositions: Array<[number, number]> = [
      [-3.4, -1.2],
      [3.4, -1.2],
      [-3.4, 1.4],
      [3.4, 1.4],
    ];
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.65 });
    deskPositions.forEach(([dx, dz], idx) => {
      const d = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.72, 0.95), deskMat);
      d.position.set(dx, 0.36, dz);
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.48, 0.65), chairMat);
      c.position.set(dx, 0.24, dz + 0.85);
      // Small notebook prop on every student desk
      const nb = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.04, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
      );
      nb.position.set(dx - 0.2, 0.74, dz + 0.1);
      root.add(d, c, nb);
      // Collider covers ONLY the desk so player can walk to the chair behind it and sit!
      boxColliders.push({ minX: dx - 0.92, maxX: dx + 0.92, minZ: dz - 0.52, maxZ: dz + 0.48 });

      if (idx === 1 || idx === 2) {
        seats.push({
          id: `seat-kelas-${idx + 1}`,
          label: idx === 1 ? 'Bangku Depan Kelas' : 'Bangku Baris Dua',
          x: dx,
          seatTopY: 0.48,
          z: dz + 0.85,
          facingYaw: Math.PI,
          style: 'chair',
          hasDesk: true,
          locationContext: 'classroom',
        });
      }
    });

    // Math Cube & English Corner (right wall x=5.6, z=-3.2)
    const mathCorner = new THREE.Group();
    mathCorner.position.set(5.4, 0, -3.2);
    const tableM = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.2), deskMat);
    tableM.position.y = 0.4;
    const cubeM = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35 })
    );
    cubeM.position.y = 1.12;
    const mathOrb = makeInteriorStationOrb(0x10b981, disposables);
    mathCorner.add(tableM, cubeM, mathOrb);
    root.add(mathCorner);
    boxColliders.push({ minX: 4.4, maxX: 6.4, minZ: -3.9, maxZ: -2.5 });
    stations.push({
      id: 'int-sekolah-math',
      category: 'cube-shrine',
      label: 'Meja Berhitung & Kubus 3D',
      sublabel: 'Hitung Benda & Bangun Ruang',
      x: 5.4,
      z: -3.2,
      radius: 2.3,
      detailText: 'Belajar penjumlahan, pengurangan, dan kubus di meja kelas!',
      mesh: mathCorner,
      statusMesh: mathOrb,
    });

    // English Speaking Desk (left corner x=-5.4, z=-3.2)
    const engCorner = new THREE.Group();
    engCorner.position.set(-5.4, 0, -3.2);
    const tableE = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.2), deskMat);
    tableE.position.y = 0.4;
    const bookE = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.16, 0.48),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.4 })
    );
    bookE.position.y = 0.9;
    const engOrb = makeInteriorStationOrb(0x4f46e5, disposables);
    engCorner.add(tableE, bookE, engOrb);
    root.add(engCorner);
    boxColliders.push({ minX: -6.4, maxX: -4.4, minZ: -3.9, maxZ: -2.5 });
    stations.push({
      id: 'int-sekolah-english',
      category: 'english-object',
      label: 'English Desk: Book & Apple',
      sublabel: 'Dengar Suara Bahasa Inggris',
      x: -5.4,
      z: -3.2,
      radius: 2.3,
      englishWord: 'Classroom Book',
      englishTranslation: 'Buku Pelajaran di Kelas',
      detailText: 'Sentuh meja untuk mendengarkan pengucapan kosakata kelas!',
      mesh: engCorner,
      statusMesh: engOrb,
    });

    // Teacher Bu Dewi with live classroom patrol between chalkboard & desks
    addInteriorNpc(
      root,
      {
        id: 'int-npc-guru',
        name: 'Ibu Dewi',
        role: 'Wali Kelas 1 Nusantara',
        roleStyle: 'teacher',
        x: 1.6,
        z: -3.4,
        facingY: -0.2,
        greeting: 'Selamat pagi murid-murid! Duduklah di bangku kelas, angkat tangan, atau pelajari Papan Kalimat & Meja Berhitung!',
        story: 'Rajin membaca, menulis rapi di meja, dan bertanya di sekolah membuatmu cepat menguasai pelajaran Kelas 1.',
        trivia: {
          question: 'Sebelum pelajaran dimulai di kelas, sikap tertib siswa adalah...',
          options: ['Berdoa & duduk rapi mendengarkan guru', 'Berlari keliling kelas', 'Berbicara keras saat guru menjelaskan'],
          correctIndex: 0,
          rewardCoins: 20,
          rewardScore: 100,
          explanation: 'Duduk rapi dan berdoa bersama menunjukkan sikap disiplin anak Kelas 1.',
        },
        colors: { skin: 0xf1c29b, hair: 0x1e1b4b, shirt: 0xffffff, vest: 0x0284c7, pants: 0x1e293b, scarf: 0xf59e0b },
      },
      npcEntries,
      circleColliders,
      {
        animMode: 'pointing',
        patrolWaypoints: [
          { x: -1.4, z: -3.6, anim: 'pointing', facingY: Math.PI, holdSec: 3.2 },
          { x: 0.4, z: -2.4, anim: 'talking', facingY: 0, holdSec: 3.4 },
          { x: 2.0, z: -3.6, anim: 'writing', facingY: Math.PI, holdSec: 2.8 },
          { x: 0.0, z: -2.2, anim: 'reading', facingY: 0, holdSec: 3.0 },
        ],
      }
    );

    // Living Animated Classmate NPCs seated at desks!
    addInteriorNpc(
      root,
      {
        id: 'int-npc-teman-rani',
        name: 'Rani',
        role: 'Teman Sekelas',
        x: -3.4,
        z: -1.2 + 0.85,
        facingY: Math.PI,
        greeting: 'Hai! Aku sedang membaca buku cerita bergambar. Yuk duduk di bangku sebelahku dan belajar bersama!',
        story: 'Kalau Ibu Dewi bertanya di papan tulis, kita bisa mengangkat tangan dengan sopan!',
        trivia: {
          question: 'Saat ingin bertanya kepada guru di kelas, sikap sopan yang kita lakukan adalah...',
          options: ['Mengangkat tangan terlebih dahulu', 'Memotong pembicaraan dengan berteriak', 'Berdiri di atas meja'],
          correctIndex: 0,
          rewardCoins: 15,
          rewardScore: 80,
          explanation: 'Mengangkat tangan menunjukkan sikap tertib dan menghormati guru.',
        },
        colors: { skin: 0xf5cba7, hair: 0x1e1b4b, shirt: 0xffffff, vest: 0xdc2626, pants: 0xb91c1c, scarf: 0xdc2626 },
      },
      npcEntries,
      circleColliders,
      { isSeated: true, seatStyle: 'chair', seatTopY: 0.48, animMode: 'reading', heroStyle: 'sari' }
    );

    addInteriorNpc(
      root,
      {
        id: 'int-npc-teman-dimas',
        name: 'Dimas',
        role: 'Teman Sekelas',
        x: 3.4,
        z: 1.4 + 0.85,
        facingY: Math.PI,
        greeting: 'Aku lagi berlatih menulis suku kata di buku tulis! Duduklah di kursi depan supaya jelas melihat papan tulis!',
        story: 'Setelah selesai menulis, kita bisa bertepuk tangan bersama saat teman menjawab dengan benar!',
        trivia: {
          question: 'Alat tulis yang digunakan untuk menulis rapi di buku tulis sekolah adalah...',
          options: ['Pensil dan penghapus', 'Sendok makan', 'Bola sepak'],
          correctIndex: 0,
          rewardCoins: 15,
          rewardScore: 80,
          explanation: 'Pensil dan penghapus digunakan siswa Kelas 1 untuk berlatih menulis.',
        },
        colors: { skin: 0xf1c29b, hair: 0x1e293b, shirt: 0xffffff, vest: 0xdc2626, pants: 0xb91c1c, scarf: 0xdc2626 },
      },
      npcEntries,
      circleColliders,
      { isSeated: true, seatStyle: 'chair', seatTopY: 0.48, animMode: 'writing', heroStyle: 'bima' }
    );
  } else if (id === 'perpustakaan-ceria') {
    title = 'Perpustakaan Ceria';
    subtitle = 'Rak Dongeng, Huruf & Pengetahuan';
    accentHex = '#0891B2';
    createRoomShell(root, roomW, roomD, wallH, 0xdbeafe, 0xf0f9ff, 0x0891b2, disposables);
    makeWallBanner(root, 'PERPUSTAKAAN CERIA', 'Membaca Buku Membuka Jendela Dunia', '#0891b2', 0, 3.3, -roomD / 2 + 0.24, 0, 5.2, 1.25, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Kota Sekolah', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
    const bookColors = [0xef4444, 0x0284c7, 0x10b981, 0xf59e0b, 0x8b5cf6];
    [-4.8, 0, 4.8].forEach((sx, idx) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.5, 0.72), shelfMat);
      shelf.position.set(sx, 1.25, -4.6);
      root.add(shelf);
      for (let b = 0; b < 4; b++) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.45, 0.45),
          new THREE.MeshStandardMaterial({ color: bookColors[(idx + b) % bookColors.length], roughness: 0.5 })
        );
        book.position.set(sx - 0.75 + b * 0.5, 1.68, -4.5);
        root.add(book);
      }
      boxColliders.push({ minX: sx - 1.4, maxX: sx + 1.4, minZ: -5.1, maxZ: -4.1 });
    });

    // Reading round table in center-left (-3.2, 0.6)
    const readGroup = new THREE.Group();
    readGroup.position.set(-3.2, 0, 0.6);
    const roundTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.45, 0.14, 18),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 })
    );
    roundTop.position.y = 0.78;
    const roundLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.78, 12), shelfMat);
    roundLeg.position.y = 0.39;
    const readOrb = makeInteriorStationOrb(0x0284c7, disposables);
    readGroup.add(roundTop, roundLeg, readOrb);
    root.add(readGroup);
    circleColliders.push({ x: -3.2, z: 0.6, radius: 1.55 });
    stations.push({
      id: 'int-perpus-baca',
      category: 'reading-spot',
      label: 'Meja Rangkai Kalimat Cerita',
      sublabel: 'Susun Kalimat dari Buku Dongeng',
      x: -3.2,
      z: 0.6,
      radius: 2.6,
      detailText: 'Baca buku cerita dan susun kata menjadi kalimat bermakna!',
      mesh: readGroup,
      statusMesh: readOrb,
    });

    // Vowel & Shape showcase table (3.6, 0.6)
    const shapeGroup = new THREE.Group();
    shapeGroup.position.set(3.6, 0, 0.6);
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.14, 18), new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.55 }));
    t2.position.y = 0.78;
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.78, 12), shelfMat);
    l2.position.y = 0.39;
    const shapeOrb = makeInteriorStationOrb(0xd97706, disposables);
    shapeGroup.add(t2, l2, shapeOrb);
    root.add(shapeGroup);
    circleColliders.push({ x: 3.6, z: 0.6, radius: 1.45 });
    stations.push({
      id: 'int-perpus-huruf',
      category: 'learn-spot',
      label: 'Rak Kartu Huruf & Suku Kata',
      sublabel: 'Latihan Vokal A–I–U–E–O',
      x: 3.6,
      z: 0.6,
      radius: 2.5,
      detailText: 'Buka lab rangkai huruf dan suku kata di perpustakaan!',
      mesh: shapeGroup,
      statusMesh: shapeOrb,
    });

    // Reading chairs around round library tables
    const libChairMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.65 });
    const libChairA = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.46, 0.62), libChairMat);
    libChairA.position.set(-3.2, 0.23, 2.35);
    const libChairB = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.46, 0.62), libChairMat);
    libChairB.position.set(3.6, 0.23, 2.3);
    root.add(libChairA, libChairB);

    seats.push(
      {
        id: 'seat-perpus-baca',
        label: 'Kursi Baca Perpustakaan',
        x: -3.2,
        seatTopY: 0.46,
        z: 2.35,
        facingYaw: Math.PI,
        style: 'chair',
        hasDesk: true,
        locationContext: 'library',
      },
      {
        id: 'seat-perpus-kartu',
        label: 'Kursi Meja Huruf',
        x: 3.6,
        seatTopY: 0.46,
        z: 2.3,
        facingYaw: Math.PI,
        style: 'chair',
        hasDesk: true,
        locationContext: 'library',
      }
    );

    addInteriorNpc(
      root,
      {
        id: 'int-npc-pustakawan',
        name: 'Kak Nabila',
        role: 'Pustakawan Perpustakaan Ceria',
        roleStyle: 'librarian',
        x: 0.2,
        z: -2.2,
        facingY: 0,
        greeting: 'Sst… selamat datang di Perpustakaan Ceria! Duduklah di kursi baca lalu buka buku ceritamu dengan tenang.',
        story: 'Buku-buku di rak tersusun rapi sesuai abjad. Setelah membaca, kembalikan buku ke tempatnya ya!',
        trivia: {
          question: 'Saat berada di dalam perpustakaan, kita harus menjaga...',
          options: ['Ketenangan dan kebersihan buku', 'Suara teriakan keras', 'Melipat-lipat halaman buku'],
          correctIndex: 0,
          rewardCoins: 20,
          rewardScore: 100,
          explanation: 'Membaca dengan tenang membuat semua pengunjung nyaman dan buku tetap awet.',
        },
        colors: { skin: 0xf1c29b, hair: 0x0f172a, shirt: 0xffffff, vest: 0x0891b2, pants: 0x334155, scarf: 0xfbbf24 },
      },
      npcEntries,
      circleColliders,
      { animMode: 'reading' }
    );
  } else if (id === 'masjid-cahaya') {
    title = 'Masjid Cahaya';
    subtitle = 'Ruang Ibadah Islam, Doa & Budi Pekerti';
    accentHex = '#0D9488';
    createRoomShell(root, roomW, roomD, wallH, 0x047857, 0xf8fafc, 0x0d9488, disposables);
    makeWallBanner(root, 'MASJID CAHAYA', 'Basmalah · Kebersihan Wudu · Akhlak Mulia', '#0d9488', 0, 3.35, -roomD / 2 + 0.24, 0, 5.2, 1.25, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Kota Sekolah', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    // Mihrab & Mimbar at back wall
    const mihrabGroup = new THREE.Group();
    mihrabGroup.position.set(0, 0, -4.6);
    const archMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.3 });
    const archBack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.0, 0.55), archMat);
    archBack.position.y = 1.5;
    const mimbarWood = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.2, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 })
    );
    mimbarWood.position.set(2.3, 0.6, 0.4);
    const mihrabOrb = makeInteriorStationOrb(0x14b8a6, disposables);
    mihrabOrb.position.set(0, 3.3, 0.4);
    mihrabGroup.add(archBack, mimbarWood, mihrabOrb);
    root.add(mihrabGroup);
    boxColliders.push({ minX: -1.5, maxX: 3.0, minZ: -5.2, maxZ: -3.8 });

    // Prayer saf strips
    [-1.2, 1.6].forEach((sz) => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(11.5, 0.04, 0.24),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 })
      );
      strip.position.set(0, 0.02, sz);
      root.add(strip);
    });

    stations.push({
      id: 'int-masjid-doa',
      category: 'learn-spot',
      label: 'Mimbar Doa & Basmalah',
      sublabel: 'Baca Bismillah & Alhamdulillah',
      x: 0,
      z: -3.2,
      radius: 2.5,
      detailText: 'Berlatih mengucapkan Bismillah sebelum belajar dan Alhamdulillah setelah selesai!',
      mesh: mihrabGroup,
      statusMesh: mihrabOrb,
    });

    // Wudu Fountain inside right wing (5.2, 0.5)
    const wuduGroup = new THREE.Group();
    wuduGroup.position.set(5.2, 0, 0.5);
    const basin = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.85, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    basin.position.y = 0.425;
    const waterTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.08, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15 })
    );
    waterTop.position.y = 0.86;
    const wuduOrb = makeInteriorStationOrb(0x38bdf8, disposables);
    wuduGroup.add(basin, waterTop, wuduOrb);
    root.add(wuduGroup);
    boxColliders.push({ minX: 4.2, maxX: 6.2, minZ: -0.5, maxZ: 1.5 });
    stations.push({
      id: 'int-masjid-wudu',
      category: 'hygiene-sink',
      label: 'Pancuran Wudu Bersih',
      sublabel: 'Jaga Kesucian & Kebersihan Diri',
      x: 5.2,
      z: 0.5,
      radius: 2.3,
      detailText: 'Bersuci dengan air bersih sebelum salat dan menjaga kebersihan tubuh!',
      mesh: wuduGroup,
      statusMesh: wuduOrb,
    });

    // Sajadah Prayer Mat Cushions (cross-legged bersila sitting & Muslim doa gesture)
    [-2.0, 2.0].forEach((sx, idx) => {
      const sajadah = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.07, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8 })
      );
      sajadah.position.set(sx, 0.035, -1.2);
      root.add(sajadah);
      seats.push({
        id: `seat-masjid-sajadah-${idx + 1}`,
        label: 'Sajadah Doa Masjid',
        x: sx,
        seatTopY: 0.08,
        z: -1.2,
        facingYaw: Math.PI,
        style: 'cushion',
        religionContext: 'islam',
        locationContext: 'prayer',
      });
    });

    addInteriorNpc(
      root,
      {
        id: 'int-npc-ustadz',
        name: 'Ustadz Farhan',
        role: 'Guru PAI Masjid Cahaya',
        roleStyle: 'agama-islam',
        x: -3.8,
        z: -2.4,
        facingY: 0.35,
        greeting: religion === 'islam'
          ? 'Assalamu’alaikum anak saleh! Duduklah di sajadah dengan tertib untuk berdoa menadahkan tangan dan belajar wudu.'
          : 'Selamat datang di Masjid Cahaya! Mari mengenal tempat ibadah umat Islam yang bersih dan damai sebagai wujud toleransi.',
        story: 'Kebersihan sebagian dari iman. Setiap kegiatan kebaikan diawali dengan Basmalah.',
        trivia: {
          question: 'Ucapan syukur seorang muslim setelah menyelesaikan pekerjaan baik adalah...',
          options: ['Alhamdulillah', 'Permisi', 'Halo'],
          correctIndex: 0,
          rewardCoins: 20,
          rewardScore: 100,
          explanation: 'Alhamdulillah berarti segala puji bagi Allah atas nikmat yang diberikan.',
        },
        colors: { skin: 0xe6b48a, hair: 0x0f172a, shirt: 0xffffff, vest: 0x0d9488, pants: 0x0f766e, scarf: 0xfef3c7, hat: 0xffffff },
      },
      npcEntries,
      circleColliders,
      { animMode: religion === 'islam' ? 'praying' : 'greet' }
    );
  } else if (id === 'gereja-damai') {
    title = 'Gereja Damai';
    subtitle = 'Ruang Ibadah Kasih & Syukur';
    accentHex = '#4F46E5';
    createRoomShell(root, roomW, roomD, wallH, 0xfef3c7, 0xf8fafc, 0x4f46e5, disposables);
    makeWallBanner(root, 'GEREJA DAMAI', 'Kasih Sesama · Doa Syukur · Kerukunan', '#4f46e5', 0, 3.35, -roomD / 2 + 0.24, 0, 5.2, 1.25, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Kota Sekolah', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    // Altar at back wall
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0, -4.4);
    const altar = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.05, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 })
    );
    altar.position.y = 0.525;
    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 1.4, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.45 })
    );
    crossV.position.set(0, 1.9, -0.3);
    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.18, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.45 })
    );
    crossH.position.set(0, 2.15, -0.3);
    const altarOrb = makeInteriorStationOrb(0x6366f1, disposables);
    altarOrb.position.set(0, 2.95, 0.2);
    altarGroup.add(altar, crossV, crossH, altarOrb);
    root.add(altarGroup);
    boxColliders.push({ minX: -1.8, maxX: 1.8, minZ: -5.1, maxZ: -3.7 });

    // Wooden Pews (keep collider just on seat core so player can sit cleanly on bench top)
    const pewMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    [-3.4, 3.4].forEach((px, pIdx) => {
      [-1.0, 1.4].forEach((pz, rIdx) => {
        const pew = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.52, 0.78), pewMat);
        pew.position.set(px, 0.26, pz);
        root.add(pew);
        if (rIdx === 1) {
          boxColliders.push({ minX: px - 1.65, maxX: px + 1.65, minZ: pz - 0.42, maxZ: pz + 0.42 });
        } else {
          seats.push({
            id: `seat-gereja-bangku-${pIdx + 1}`,
            label: 'Bangku Doa Gereja',
            x: px,
            seatTopY: 0.52,
            z: pz,
            facingYaw: Math.PI,
            style: 'bench',
            religionContext: religion === 'katolik' ? 'katolik' : 'kristen',
            locationContext: 'prayer',
          });
        }
      });
    });

    stations.push({
      id: 'int-gereja-doa',
      category: 'learn-spot',
      label: 'Altar Doa & Lagu Syukur',
      sublabel: 'Mensyukuri Ciptaan & Mengasihi Teman',
      x: 0,
      z: -3.0,
      radius: 2.5,
      detailText: 'Berdoa mengucap syukur atas keluarga, alam ciptaan Tuhan, dan sahabat!',
      mesh: altarGroup,
      statusMesh: altarOrb,
    });

    addInteriorNpc(
      root,
      {
        id: 'int-npc-yohanes',
        name: religion === 'katolik' ? 'Suster Clara' : 'Kak Yohanes',
        role: religion === 'katolik' ? 'Pendamping Iman Katolik' : 'Pendamping Sekolah Minggu',
        roleStyle: religion === 'katolik' ? 'agama-katolik' : 'agama-kristen',
        x: -3.5,
        z: -2.8,
        facingY: 0.35,
        greeting: religion === 'kristen' || religion === 'katolik'
          ? 'Shalom & damai sejahtera! Duduklah di bangku kayu dengan tenang untuk berdoa mengucap syukur.'
          : 'Selamat datang di Gereja Damai! Mengenal rumah ibadah teman-teman menumbuhkan sikap toleransi Pancasila.',
        story: 'Kasih, pengampunan, dan saling menolong membuat hidup di sekolah dan rumah menjadi penuh sukacita.',
        trivia: {
          question: 'Sikap anak yang hidup rukun bersama teman berbeda suku dan agama adalah...',
          options: ['Saling menghargai dan tetap berteman baik', 'Memilih-milih teman', 'Mengganggu saat teman beribadah'],
          correctIndex: 0,
          rewardCoins: 20,
          rewardScore: 100,
          explanation: 'Saling menghargai menumbuhkan kedamaian dan persatuan di Indonesia.',
        },
        colors: { skin: 0xf1c29b, hair: 0x1e293b, shirt: 0xffffff, vest: 0x4f46e5, pants: 0x1e293b, scarf: 0xfde68a },
      },
      npcEntries,
      circleColliders,
      { animMode: religion === 'kristen' || religion === 'katolik' ? 'praying' : 'greet' }
    );
  } else if (id === 'pasar-sahabat') {
    title = 'Pasar Sahabat';
    subtitle = 'Berbelanja, Menjual Buah & Hitung Uang Rupiah';
    accentHex = '#D97706';
    createRoomShell(root, roomW, roomD, wallH, 0xfef3c7, 0xfff7ed, 0xd97706, disposables);
    makeWallBanner(root, 'PASAR SAHABAT', 'Jual Hasil Panen & Hitung Koin Rupiah', '#d97706', 0, 3.35, -roomD / 2 + 0.24, 0, 5.2, 1.25, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Halaman Pasar', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    // Market Counter & Cash Register (0, -3.5)
    const counterGroup = new THREE.Group();
    counterGroup.position.set(0, 0, -3.5);
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 1.0, 1.3),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 })
    );
    counter.position.y = 0.5;
    const register = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.55, 0.72),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.4 })
    );
    register.position.set(0, 1.25, 0);
    const cashOrb = makeInteriorStationOrb(0xf59e0b, disposables);
    cashOrb.position.set(0, 2.1, 0);
    counterGroup.add(counter, register, cashOrb);
    root.add(counterGroup);
    boxColliders.push({ minX: -2.4, maxX: 2.4, minZ: -4.2, maxZ: -2.7 });

    stations.push({
      id: 'int-pasar-kasir',
      category: 'market-shop',
      label: 'Kasir & Toko Uang Rupiah',
      sublabel: 'Bayar dengan Koin Rp 100 – Rp 5.000',
      x: 0,
      z: -2.3,
      radius: 2.5,
      detailText: 'Buka Toko Pasar Sahabat untuk berlatih menghitung uang belanja & jual buah!',
      mesh: counterGroup,
      statusMesh: cashOrb,
    });

    // Fruit Crates Stall Left (-4.6, 0.2)
    const stallL = new THREE.Group();
    stallL.position.set(-4.6, 0, 0.2);
    const crateL = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.85, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 })
    );
    crateL.position.y = 0.425;
    const apple = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 })
    );
    apple.position.set(-0.4, 1.02, 0);
    const orange = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 })
    );
    orange.position.set(0.4, 1.02, 0);
    const stallOrb = makeInteriorStationOrb(0xef4444, disposables);
    stallL.add(crateL, apple, orange, stallOrb);
    root.add(stallL);
    boxColliders.push({ minX: -5.7, maxX: -3.5, minZ: -0.6, maxZ: 1.0 });

    stations.push({
      id: 'int-pasar-buah',
      category: 'fruit-stall',
      label: 'Lapak Jual Buah Panen',
      sublabel: 'Jual Buah Segar Jadi Koin',
      x: -4.6,
      z: 0.2,
      radius: 2.4,
      detailText: 'Jual apel & jeruk segar hasil panenmu dari Kebun Pengetahuan!',
      mesh: stallL,
      statusMesh: stallOrb,
    });

    // Pasar rest bench at (4.0, 2.2)
    const pasarBench = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.48, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.72 })
    );
    pasarBench.position.set(4.0, 0.24, 2.2);
    root.add(pasarBench);
    seats.push({
      id: 'seat-pasar-bangku',
      label: 'Bangku Istirahat Pasar',
      x: 4.0,
      seatTopY: 0.48,
      z: 2.2,
      facingYaw: Math.PI,
      style: 'bench',
      locationContext: 'park',
    });

    addInteriorNpc(
      root,
      {
        id: 'int-npc-pedagang',
        name: 'Bu Minah',
        role: 'Pedagang Pasar Sahabat',
        roleStyle: 'merchant',
        x: 3.8,
        z: -1.6,
        facingY: -0.4,
        greeting: 'Mari mampir! Punya buah panen atau mau belanja buku dan pensil dengan koin Rupiah?',
        story: 'Menghitung harga dan uang kembalian dengan jujur membuat kegiatan jual beli berjalan lancar dan rukun.',
        trivia: {
          question: 'Harga 1 buku adalah Rp 2.000. Jika membayar dengan uang Rp 5.000, kembaliannya adalah...',
          options: ['Rp 3.000', 'Rp 2.000', 'Rp 1.000'],
          correctIndex: 0,
          rewardCoins: 25,
          rewardScore: 120,
          explanation: 'Rp 5.000 - Rp 2.000 = Rp 3.000.',
        },
        colors: { skin: 0xd9a074, hair: 0x1e293b, shirt: 0xfef3c7, vest: 0xd97706, pants: 0x78350f, scarf: 0xef4444 },
      },
      npcEntries,
      circleColliders,
      { animMode: 'talking' }
    );
  } else if (id === 'laboratorium-ilmuwan') {
    title = 'Laboratorium Ilmuwan Muda';
    subtitle = 'Eksperimen Alam, Pancaindra & Geometri 3D';
    accentHex = '#0D9488';
    createRoomShell(root, roomW, roomD, wallH, 0xe0f2fe, 0xf8fafc, 0x0d9488, disposables);
    makeWallBanner(root, 'LABORATORIUM ILMUWAN MUDA', 'Amati Benda · Eksperimen Sains · Geometri', '#0d9488', 0, 3.35, -roomD / 2 + 0.24, 0, 5.4, 1.25, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Pulau Ilmu', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    const labDeskMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.55 });

    // Water Sink & Buoyancy Experiment Table (-4.4, -2.0)
    const expGroup = new THREE.Group();
    expGroup.position.set(-4.4, 0, -2.0);
    const expTable = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.84, 1.3), labDeskMat);
    expTable.position.y = 0.42;
    const tank = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.55, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72, roughness: 0.15 })
    );
    tank.position.set(-0.4, 1.1, 0);
    const beaker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.42, 12),
      new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.8, roughness: 0.2 })
    );
    beaker.position.set(0.55, 1.05, 0);
    const expOrb = makeInteriorStationOrb(0x0ea5e9, disposables);
    expOrb.position.y = 1.95;
    expGroup.add(expTable, tank, beaker, expOrb);
    root.add(expGroup);
    boxColliders.push({ minX: -5.8, maxX: -3.0, minZ: -2.75, maxZ: -1.25 });

    stations.push({
      id: 'int-lab-ipas',
      category: 'learn-spot',
      label: 'Meja Eksperimen Sains Alam',
      sublabel: 'Uji Benda Tenggelam & Terapung',
      x: -4.4,
      z: -2.0,
      radius: 2.5,
      detailText: 'Amati benda kayu yang mengapung dan batu yang tenggelam di Lab Ilmuwan!',
      mesh: expGroup,
      statusMesh: expOrb,
    });

    // Hologram Geometry & Cube-Net Pedestal (4.4, -2.0)
    const holoGroup = new THREE.Group();
    holoGroup.position.set(4.4, 0, -2.0);
    const holoBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.84, 1.3), metalMat);
    holoBase.position.y = 0.42;
    const holoCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.62, 0.62),
      new THREE.MeshStandardMaterial({ color: 0x14b8a6, emissive: 0x0f766e, emissiveIntensity: 0.45, roughness: 0.25 })
    );
    holoCube.position.y = 1.28;
    const holoOrb = makeInteriorStationOrb(0x14b8a6, disposables);
    holoOrb.position.y = 2.15;
    holoGroup.add(holoBase, holoCube, holoOrb);
    root.add(holoGroup);
    boxColliders.push({ minX: 3.1, maxX: 5.7, minZ: -2.75, maxZ: -1.25 });

    stations.push({
      id: 'int-lab-geometri',
      category: 'cube-shrine',
      label: 'Simulator Kubus & Jaring 3D',
      sublabel: 'Lipat & Hitung Sisi Bangun Ruang',
      x: 4.4,
      z: -2.0,
      radius: 2.5,
      detailText: 'Buka Simulator Kubus & Kebun Hitung di Laboratorium!',
      mesh: holoGroup,
      statusMesh: holoOrb,
    });

    // Lab Stools in front of benches
    const stoolMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.55 });
    [
      { id: 'seat-lab-sains', label: 'Bangku Meja Eksperimen', x: -4.4, z: -0.65 },
      { id: 'seat-lab-geo', label: 'Bangku Meja Geometri', x: 4.4, z: -0.65 },
    ].forEach((st) => {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.48, 14), stoolMat);
      stool.position.set(st.x, 0.24, st.z);
      root.add(stool);
      seats.push({
        id: st.id,
        label: st.label,
        x: st.x,
        seatTopY: 0.48,
        z: st.z,
        facingYaw: Math.PI,
        style: 'chair',
        hasDesk: true,
        locationContext: 'lab',
      });
    });

    addInteriorNpc(
      root,
      {
        id: 'int-npc-prof-nabil',
        name: 'Prof. Cilik Nabil',
        role: 'Ilmuwan Laboratorium',
        roleStyle: 'scientist',
        x: 0.0,
        z: -3.2,
        facingY: 0,
        greeting: 'Selamat datang di Laboratorium Ilmuwan Muda! Duduklah di kursi lab lalu uji percobaan IPA dan Kubus 3D!',
        story: 'Ilmuwan cilik gemar mengamati, mencoba hal baru, dan mencatat hasil pengamatan dengan teliti.',
        trivia: {
          question: 'Jika sepotong kayu ringan diletakkan di atas bak air tenang, kayu tersebut akan...',
          options: ['Mengapung di permukaan air', 'Berubah menjadi batu', 'Langsung menghilang'],
          correctIndex: 0,
          rewardCoins: 25,
          rewardScore: 120,
          explanation: 'Kayu ringan memiliki massa jenis lebih kecil daripada air sehingga mengapung.',
        },
        colors: { skin: 0xf1c29b, hair: 0x0f172a, shirt: 0xffffff, vest: 0x0d9488, pants: 0x1e293b, scarf: 0x38bdf8 },
      },
      npcEntries,
      circleColliders,
      { animMode: 'observing' }
    );
  } else {
    // kerajaan-ilmu
    title = 'Istana Kerajaan Ilmu';
    subtitle = 'Galeri Karya & Ujian Akhir Kelas 1';
    accentHex = '#7C3AED';
    createRoomShell(root, roomW, roomD, wallH, 0xede9fe, 0xfaf5ff, 0x7c3aed, disposables);
    makeWallBanner(root, 'ISTANA KERAJAAN ILMU', 'Galeri Karya Siswa & Ujian Akhir Kelas 1', '#7c3aed', 0, 3.35, -roomD / 2 + 0.24, 0, 5.6, 1.3, maxAniso, disposables);
    makeWallBanner(root, 'PINTU KELUAR [E]', 'Kembali ke Halaman Istana', '#059669', 0, 3.15, roomD / 2 - 0.24, Math.PI, 2.7, 0.85, maxAniso, disposables);

    // Royal Red Carpet
    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.04, 8.8),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.78 })
    );
    carpet.position.set(0, 0.02, 0.6);
    root.add(carpet);

    // Royal Exam Pedestal & Crown at back center (0, -3.5)
    const throneGroup = new THREE.Group();
    throneGroup.position.set(0, 0, -3.5);
    const dais = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 2.1, 0.36, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.45 })
    );
    dais.position.y = 0.18;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.65, 1.05, 12),
      new THREE.MeshStandardMaterial({ color: 0x6d28d9, roughness: 0.35 })
    );
    pillar.position.y = 0.88;
    const crown = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.11, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.7 })
    );
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 1.62;
    const examOrb = makeInteriorStationOrb(0xfbbf24, disposables);
    examOrb.position.y = 2.35;
    throneGroup.add(dais, pillar, crown, examOrb);
    root.add(throneGroup);
    circleColliders.push({ x: 0, z: -3.5, radius: 1.9 });

    stations.push({
      id: 'int-kerajaan-exam',
      category: 'exam-throne',
      label: 'Singgasana Ujian Akhir Kelas 1',
      sublabel: 'Uji Seluruh Pelajaran Kelas 1!',
      x: 0,
      z: -3.5,
      radius: 2.9,
      detailText: 'Tekan Aksi untuk mengikuti Ujian Akhir Gabungan semua mapel Kelas 1!',
      mesh: throneGroup,
      statusMesh: examOrb,
    });

    // 3 Saved Artwork Display Easels along the left & right hall
    const easelPositions: Array<{ x: number; z: number; rotY: number }> = [
      { x: -5.2, z: -1.6, rotY: 0.65 },
      { x: -5.2, z: 1.8, rotY: 0.85 },
      { x: 5.2, z: -1.6, rotY: -0.65 },
    ];
    easelPositions.forEach((ep, idx) => {
      const eg = new THREE.Group();
      eg.position.set(ep.x, 0, ep.z);
      eg.rotation.y = ep.rotY;
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.85, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 })
      );
      frame.position.y = 1.05;
      const canvasMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.24, 0.96),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 })
      );
      canvasMesh.position.set(0, 1.38, 0.1);
      const artOrb = makeInteriorStationOrb(0x9333ea, disposables);
      eg.add(frame, canvasMesh, artOrb);
      root.add(eg);
      circleColliders.push({ x: ep.x, z: ep.z, radius: 0.82 });
      easelTargets.push({ index: idx, canvasMesh });
      if (idx === 0) {
        stations.push({
          id: 'int-kerajaan-easel',
          category: 'art-easel',
          label: 'Galeri Lukisan Istana',
          sublabel: 'Buat & Pajang Karya Senimu',
          x: ep.x,
          z: ep.z,
          radius: 2.3,
          detailText: 'Lukis karya seni indah lalu pajang langsung di aula Istana Kerajaan Ilmu!',
          mesh: eg,
          statusMesh: artOrb,
        });
      }
    });

    // Apply existing artworks immediately
    if (savedArtworks.length > 0) {
      easelTargets.forEach((target) => {
        const art = savedArtworks[target.index % savedArtworks.length];
        if (!art) return;
        const img = new Image();
        img.onload = () => {
          const tex = new THREE.Texture(img);
          tex.needsUpdate = true;
          tex.colorSpace = THREE.SRGBColorSpace;
          const mat = target.canvasMesh.material as THREE.MeshStandardMaterial;
          mat.map = tex;
          mat.needsUpdate = true;
          disposables.push(tex);
        };
        img.src = art.dataUrl;
      });
    }

    // Royal hall wooden benches for resting/listening
    [-3.2, 3.2].forEach((bx, idx) => {
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.5, 0.72),
        new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.55 })
      );
      bench.position.set(bx, 0.25, 2.4);
      root.add(bench);
      seats.push({
        id: `seat-kerajaan-${idx + 1}`,
        label: 'Kursi Aula Kerajaan',
        x: bx,
        seatTopY: 0.5,
        z: 2.4,
        facingYaw: Math.PI,
        style: 'bench',
        locationContext: 'home',
      });
    });

    addInteriorNpc(
      root,
      {
        id: 'int-npc-profesor',
        name: 'Profesor Arya',
        role: 'Penjaga Kerajaan Ilmu',
        roleStyle: 'royal',
        x: 3.4,
        z: 1.5,
        facingY: -0.5,
        greeting: 'Selamat datang di aula Istana Kerajaan Ilmu! Kamu siap membuktikan kepandaianmu di Ujian Akhir Kelas 1?',
        story: 'Semua materi Bahasa Indonesia, Matematika, Pancasila, IPAS, PJOK, Seni, Inggris, dan Agama tergabung di singgasana pengetahuan.',
        trivia: {
          question: 'Jika rajin berlatih di 8 kawasan Pulau Nusantara, kemampuan yang kita kuasai adalah...',
          options: ['Membaca, berhitung, berkarya & berbudi pekerti', 'Hanya tidur sepanjang hari', 'Lupa semua pelajaran'],
          correctIndex: 0,
          rewardCoins: 30,
          rewardScore: 150,
          explanation: 'Belajar sambil berpetualang melatih otak, tubuh sehat, dan akhlak mulia!',
        },
        colors: { skin: 0xe6b48a, hair: 0xe2e8f0, shirt: 0xffffff, vest: 0x7c3aed, pants: 0x312e81, scarf: 0xfbbf24, hat: 0xfbbf24 },
      },
      npcEntries,
      circleColliders,
      { animMode: 'celebrating' }
    );
  }

  return {
    id,
    title,
    subtitle,
    accentHex,
    root,
    roomBounds: {
      minX: -roomW / 2 + 0.72,
      maxX: roomW / 2 - 0.72,
      minZ: -roomD / 2 + 0.72,
      maxZ: roomD / 2 - 0.55,
    },
    spawnPos: {
      x: 0,
      z: exitZ - 1.25,
      yaw: 0,
    },
    exitDoor: {
      x: 0,
      z: exitZ,
      radius: 1.85,
    },
    boxColliders,
    circleColliders,
    stations,
    seats,
    npcEntries,
    easelTargets,
    disposables,
  };
}
