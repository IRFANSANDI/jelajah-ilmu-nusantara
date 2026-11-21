import * as THREE from 'three';
import { createLabelCanvasTexture } from './models';
import {
  LocalRegionId,
  ReligionId,
  SubjectId,
} from './inventoryData';
import {
  BoxCollider,
  CircleCollider,
  getRawTerrainHeight,
  getWalkableHeight,
} from './terrain';
import {
  Grade1WorldStationSpec,
  LOCAL_REGION_WORLD_META,
  RELIGION_SANCTUARY_META,
} from './grade1SubjectWorlds';

export interface Grade1InteractiveNode {
  id: string;
  category: Grade1WorldStationSpec['category'];
  label: string;
  sublabel: string;
  x: number;
  z: number;
  radius: number;
  detailText: string;
  mesh: THREE.Group;
  statusMesh?: THREE.Mesh;
  completed?: boolean;
  isRotten?: boolean;
  isOrganic?: boolean;
  noteIndex?: number;
  englishWord?: string;
  englishTranslation?: string;
  plantStage?: 0 | 1 | 2;
  stageMeshes?: THREE.Object3D[];
  detachableFruits?: Array<{
    mesh: THREE.Object3D;
    isRotten: boolean;
    picked: boolean;
  }>;
}

export interface Grade1PredatorEntity {
  group: THREE.Group;
  legParts: THREE.Object3D[];
  homeX: number;
  homeZ: number;
  x: number;
  z: number;
  yaw: number;
  chasing: boolean;
  cooldown: number;
}

export interface Grade1SafeZone {
  id: string;
  x: number;
  z: number;
  radius: number;
  ringMesh: THREE.Mesh;
}

export interface Grade1EaselTarget {
  index: number;
  canvasMesh: THREE.Mesh;
}

export interface Grade1CustomSceneResult {
  interactiveNodes: Grade1InteractiveNode[];
  predators: Grade1PredatorEntity[];
  safeZones: Grade1SafeZone[];
  easelTargets: Grade1EaselTarget[];
  boxColliders: BoxCollider[];
  circleColliders: CircleCollider[];
}

function addSignBanner(
  parent: THREE.Group,
  title: string,
  subtitle: string,
  bgHex: string,
  x: number,
  y: number,
  z: number,
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
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeIndicatorOrb(
  colorHex: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Mesh {
  const geo = new THREE.OctahedronGeometry(0.24, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.55,
    roughness: 0.25,
  });
  disposables.push(geo, mat);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

function makePedestalStation(
  id: string,
  category: Grade1WorldStationSpec['category'],
  label: string,
  sublabel: string,
  bgHex: string,
  colorHex: number,
  x: number,
  z: number,
  detailText: string,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>,
  propBuilder?: (g: THREE.Group, dis: Array<{ dispose: () => void }>) => void
): { node: Grade1InteractiveNode; collider: CircleCollider } {
  const g = new THREE.Group();
  const y = getWalkableHeight(x, z, 1);
  g.position.set(x, y, z);

  const baseGeo = new THREE.CylinderGeometry(0.62, 0.72, 0.85, 14);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const ringGeo = new THREE.RingGeometry(0.95, 1.25, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });
  disposables.push(baseGeo, baseMat, ringGeo, ringMat);

  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.425;
  base.castShadow = true;
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.05;
  g.add(base, ring);

  if (propBuilder) {
    propBuilder(g, disposables);
  }

  const orb = makeIndicatorOrb(colorHex, disposables);
  orb.position.set(0, 1.85, 0);
  g.add(orb);

  addSignBanner(g, label, sublabel, bgHex, 0, 2.55, 0, 2.2, 0.7, maxAniso, disposables);

  return {
    node: {
      id,
      category,
      label,
      sublabel,
      x,
      z,
      radius: 2.6,
      detailText,
      mesh: g,
      statusMesh: orb,
      completed: false,
    },
    collider: { x, z, radius: 0.75 },
  };
}

// =========================================================================
// 1. AGAMA — DUNIA KEROHANIAN (STRICTLY ISOLATED PER SELECTED RELIGION)
// =========================================================================
function buildAgamaSanctuary(
  religion: ReligionId,
  woodTex: THREE.CanvasTexture,
  maxAniso: number,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const rel = RELIGION_SANCTUARY_META[religion];
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: rel.wallHex, roughness: 0.65 });
  const roofMat = new THREE.MeshStandardMaterial({ color: rel.roofHex, roughness: 0.45 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    metalness: 0.55,
    roughness: 0.3,
  });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.7 });
  disposables.push(wallMat, roofMat, goldMat, woodMat);

  const plinthGeo = new THREE.BoxGeometry(7.2, 0.55, 6.2);
  const plinth = new THREE.Mesh(plinthGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 }));
  plinth.position.y = 0.275;
  plinth.receiveShadow = true;
  disposables.push(plinthGeo, plinth.material as THREE.Material);
  g.add(plinth);

  if (religion === 'islam') {
    // Masjid Cahaya: white arch hall + emerald dome + golden crescent minaret
    const hall = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.8, 4.8), wallMat);
    hall.position.y = 1.95;
    hall.castShadow = true;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      roofMat
    );
    dome.position.y = 3.35;
    dome.castShadow = true;
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.58, 5.2, 12), wallMat);
    minaret.position.set(2.9, 3.1, -1.5);
    minaret.castShadow = true;
    const minCap = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.9, 12), goldMat);
    minCap.position.set(2.9, 6.1, -1.5);
    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.07, 8, 16, Math.PI * 1.35), goldMat);
    crescent.position.set(0, 5.75, 0);
    crescent.rotation.z = 0.6;
    const archDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.16), roofMat);
    archDoor.position.set(0, 1.55, 2.42);
    g.add(hall, dome, minaret, minCap, crescent, archDoor);
  } else if (religion === 'kristen' || religion === 'katolik') {
    // Gereja Damai / Kapel Kasih: pitched sanctuary + bell tower + cross
    const nave = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.8, 5.2), wallMat);
    nave.position.y = 1.95;
    nave.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.1, 4), roofMat);
    roof.position.y = 4.4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.4, 1.5), wallMat);
    tower.position.set(0, 3.3, 1.9);
    tower.castShadow = true;
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.9, 4), roofMat);
    spire.position.set(0, 6.45, 1.9);
    spire.rotation.y = Math.PI / 4;
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.16), goldMat);
    crossV.position.set(0, 7.65, 1.9);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.16), goldMat);
    crossH.position.set(0, 7.82, 1.9);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.95, 0.15), woodMat);
    door.position.set(0, 1.52, 2.68);
    g.add(nave, roof, tower, spire, crossV, crossH, door);
  } else if (religion === 'hindu') {
    // Pura Agung: Candi Bentar split gate + tiered Meru/Padmasana pagoda
    [-1.7, 1.7].forEach((sx) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 3.6, 1.4), wallMat);
      pillar.position.set(sx, 2.35, 1.8);
      pillar.castShadow = true;
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.2, 4), roofMat);
      cap.position.set(sx, 4.75, 1.8);
      cap.rotation.y = Math.PI / 4;
      g.add(pillar, cap);
    });
    const baseShrine = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 2.8), wallMat);
    baseShrine.position.set(0, 1.45, -1.2);
    baseShrine.castShadow = true;
    g.add(baseShrine);
    [0, 1, 2].forEach((tier) => {
      const meru = new THREE.Mesh(
        new THREE.ConeGeometry(2.2 - tier * 0.45, 0.95, 4),
        roofMat
      );
      meru.position.set(0, 2.8 + tier * 0.85, -1.2);
      meru.rotation.y = Math.PI / 4;
      meru.castShadow = true;
      g.add(meru);
    });
    const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), goldMat);
    crown.position.set(0, 5.25, -1.2);
    g.add(crown);
  } else if (religion === 'buddha') {
    // Vihara Teratai: Golden Stupa + lotus pond platform
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 4.8), wallMat);
    tier1.position.y = 1.15;
    tier1.castShadow = true;
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.5, 0.9, 16), wallMat);
    tier2.position.y = 2.2;
    const stupaBell = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
      goldMat
    );
    stupaBell.position.y = 2.6;
    stupaBell.castShadow = true;
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.7, 12), goldMat);
    spire.position.y = 4.9;
    const lotusPond = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 })
    );
    lotusPond.position.set(0, 0.62, 2.8);
    g.add(tier1, tier2, stupaBell, spire, lotusPond);
  } else {
    // Klenteng Harmoni: Crimson pavilion + upturned golden pagoda tiers + hanging red lanterns
    const body = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.7, 4.4), wallMat);
    body.position.y = 1.9;
    body.castShadow = true;
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(4.4, 1.5, 4), roofMat);
    roof1.position.y = 4.0;
    roof1.rotation.y = Math.PI / 4;
    roof1.castShadow = true;
    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.3, 4), roofMat);
    roof2.position.y = 5.1;
    roof2.rotation.y = Math.PI / 4;
    g.add(body, roof1, roof2);
    [-2.0, 2.0].forEach((lx) => {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 })
      );
      lantern.position.set(lx, 2.7, 2.4);
      g.add(lantern);
    });
  }

  addSignBanner(g, rel.sanctuaryName, 'Dunia Kerohanian', rel.accentHex, 0, 5.9, 2.4, 3.6, 1.0, maxAniso, disposables);
  return g;
}

// =========================================================================
// MAIN BUILDER FOR CUSTOM SUBJECT WORLDS (GRADES 1 NON-BAHASA-INDO)
// =========================================================================
export function buildGrade1CustomWorld(
  subjectId: SubjectId,
  religion: ReligionId,
  localRegion: LocalRegionId,
  savedArtworks: Array<{ id: string; title: string; dataUrl: string }>,
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture,
  maxAniso: number,
  root: THREE.Group,
  disposables: Array<{ dispose: () => void }>
): Grade1CustomSceneResult {
  const interactiveNodes: Grade1InteractiveNode[] = [];
  const predators: Grade1PredatorEntity[] = [];
  const safeZones: Grade1SafeZone[] = [];
  const easelTargets: Grade1EaselTarget[] = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];

  // Shared cozy gazebo / rest pavilion on East Hill so every world feels alive on both sides of the river
  const addEastGazebo = (gx: number, gz: number, colorHex: number, title: string, bgHex: string) => {
    const gzGroup = new THREE.Group();
    const gy = getRawTerrainHeight(gx, gz, 1);
    gzGroup.position.set(gx, gy - 0.05, gz);
    const wMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
    const rMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    disposables.push(wMat, rMat);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.35, 8), wMat);
    floor.position.y = 0.175;
    gzGroup.add(floor);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8), wMat);
      post.position.set(Math.cos(a) * 1.9, 1.4, Math.sin(a) * 1.9);
      post.castShadow = true;
      gzGroup.add(post);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 8), rMat);
    roof.position.y = 3.45;
    roof.castShadow = true;
    gzGroup.add(roof);
    addSignBanner(gzGroup, title, 'Pos Timur', bgHex, 0, 2.6, 2.2, 2.5, 0.78, maxAniso, disposables);
    root.add(gzGroup);
    circleColliders.push({ x: gx, z: gz, radius: 1.5 });
  };

  if (subjectId === 'agama') {
    const rel = RELIGION_SANCTUARY_META[religion];
    const sanctuary = buildAgamaSanctuary(religion, woodTex, maxAniso, disposables);
    const sx = -16.5;
    const sz = -4.0;
    sanctuary.position.set(sx, getRawTerrainHeight(sx, sz, 1) - 0.08, sz);
    sanctuary.rotation.y = 0.25;
    root.add(sanctuary);
    boxColliders.push({ minX: sx - 3.6, maxX: sx + 3.6, minZ: sz - 3.2, maxZ: sz + 3.2 });

    addEastGazebo(23.0, -7.5, rel.roofHex, 'Taman Budi Pekerti', rel.accentHex);

    rel.practiceStations.forEach((st) => {
      const built = makePedestalStation(
        st.id,
        'learn-spot',
        st.title,
        'Pos Praktik Akhlak',
        rel.accentHex,
        rel.roofHex,
        st.x,
        st.z,
        st.lesson,
        maxAniso,
        disposables
      );
      root.add(built.node.mesh);
      interactiveNodes.push(built.node);
      circleColliders.push(built.collider);
    });
  } else if (subjectId === 'pancasila') {
    // Monumen Garuda 5 Sila (-16.5, -4.5)
    const mx = -16.5;
    const mz = -4.5;
    const mon = new THREE.Group();
    mon.position.set(mx, getRawTerrainHeight(mx, mz, 1) - 0.08, mz);
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.65, roughness: 0.25 });
    disposables.push(marbleMat, redMat, goldMat);

    const step1 = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.5, 5.4), redMat);
    step1.position.y = 0.25;
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.5, 4.2), marbleMat);
    step2.position.y = 0.75;
    const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.05, 4.4, 6), marbleMat);
    obelisk.position.y = 3.1;
    obelisk.castShadow = true;
    const starWing = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), goldMat);
    starWing.position.y = 5.85;
    const lWing = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 0.2), goldMat);
    lWing.position.set(-1.1, 4.4, 0);
    lWing.rotation.z = 0.35;
    const rWing = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 0.2), goldMat);
    rWing.position.set(1.1, 4.4, 0);
    rWing.rotation.z = -0.35;
    mon.add(step1, step2, obelisk, starWing, lWing, rWing);
    addSignBanner(mon, 'Monumen 5 Sila', 'Garuda Pancasila', '#dc2626', 0, 2.5, 2.2, 2.8, 0.85, maxAniso, disposables);
    root.add(mon);
    boxColliders.push({ minX: mx - 3.4, maxX: mx + 3.4, minZ: mz - 2.8, maxZ: mz + 2.8 });

    addEastGazebo(23.0, -7.5, 0xdc2626, 'Balai Gotong Royong', '#dc2626');

    // Interactive Trash Pickups (3 organic leaves/peels + 3 anorganic bottles/cans)
    const trashSpecs = [
      { id: 'tr-1', label: 'Daun Kering', organic: true, x: -9.5, z: 2.5, color: 0x65a30d },
      { id: 'tr-2', label: 'Kulit Pisang', organic: true, x: -13.5, z: 10.5, color: 0xfacc15 },
      { id: 'tr-3', label: 'Sisa Sayur', organic: true, x: -6.2, z: -8.5, color: 0x16a34a },
      { id: 'tr-4', label: 'Botol Plastik', organic: false, x: -20.5, z: 8.5, color: 0x38bdf8 },
      { id: 'tr-5', label: 'Kaleng Minum', organic: false, x: 19.8, z: 3.5, color: 0x94a3b8 },
      { id: 'tr-6', label: 'Kardus Bekas', organic: false, x: 24.5, z: -2.0, color: 0xd97706 },
    ];
    trashSpecs.forEach((tr) => {
      const g = new THREE.Group();
      g.position.set(tr.x, getWalkableHeight(tr.x, tr.z, 1), tr.z);
      const tMat = new THREE.MeshStandardMaterial({ color: tr.color, roughness: 0.45 });
      disposables.push(tMat);
      const prop = tr.organic
        ? new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.55, 6), tMat)
        : new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.6, 10), tMat);
      prop.position.y = 0.42;
      prop.castShadow = true;
      g.add(prop);
      addSignBanner(
        g,
        tr.label,
        tr.organic ? 'Organik' : 'Anorganik',
        tr.organic ? '#16a34a' : '#d97706',
        0,
        1.35,
        0,
        1.65,
        0.55,
        maxAniso,
        disposables
      );
      root.add(g);
      interactiveNodes.push({
        id: tr.id,
        category: 'trash-item',
        label: `Pungut ${tr.label}`,
        sublabel: tr.organic ? 'Sampah Organik' : 'Sampah Anorganik',
        x: tr.x,
        z: tr.z,
        radius: 2.3,
        detailText: `Bagus! Kamu memungut ${tr.label}. Sekarang bawa ke Tong ${
          tr.organic ? 'Hijau (Organik)' : 'Kuning (Anorganik)'
        }!`,
        mesh: g,
        isOrganic: tr.organic,
      });
    });

    // Green Organic Bin & Yellow Anorganic Bin
    const buildBin = (id: string, isOrg: boolean, x: number, z: number) => {
      const built = makePedestalStation(
        id,
        isOrg ? 'trash-bin-organic' : 'trash-bin-anorganic',
        isOrg ? 'Tong Organik' : 'Tong Anorganik',
        isOrg ? 'Sampah Alam/Sisa Makanan' : 'Botol/Kaleng/Kertas',
        isOrg ? '#16a34a' : '#d97706',
        isOrg ? 0x16a34a : 0xf59e0b,
        x,
        z,
        isOrg
          ? 'Sampah organik (daun & kulit buah) bisa dijadikan pupuk kompos!'
          : 'Sampah anorganik (botol & kaleng) bisa didaur ulang menjadi barang berguna!',
        maxAniso,
        disposables,
        (bg, dis) => {
          const binGeo = new THREE.CylinderGeometry(0.55, 0.48, 1.0, 12);
          const binMat = new THREE.MeshStandardMaterial({
            color: isOrg ? 0x16a34a : 0xfacc15,
            roughness: 0.45,
          });
          dis.push(binGeo, binMat);
          const bin = new THREE.Mesh(binGeo, binMat);
          bin.position.y = 1.15;
          bin.castShadow = true;
          bg.add(bin);
        }
      );
      built.node.isOrganic = isOrg;
      root.add(built.node.mesh);
      interactiveNodes.push(built.node);
      circleColliders.push(built.collider);
    };
    buildBin('bin-organik', true, -12.5, 2.0);
    buildBin('bin-anorganik', false, -16.5, 2.0);

    // 5-Sila Info Node
    const silaInfo = makePedestalStation(
      'pnc-garuda-info',
      'learn-spot',
      'Perisai 5 Sila',
      'Buka Simbol Garuda',
      '#dc2626',
      0xfbbf24,
      -13.5,
      -4.5,
      'Garuda Pancasila memiliki 5 lambang sila: Bintang, Rantai, Pohon Beringin, Kepala Banteng, dan Padi-Kapas!',
      maxAniso,
      disposables
    );
    root.add(silaInfo.node.mesh);
    interactiveNodes.push(silaInfo.node);
    circleColliders.push(silaInfo.collider);
  } else if (subjectId === 'matematika') {
    // Menara Kubus Angka (-17, -5)
    const kx = -17.0;
    const kz = -5.0;
    const tower = new THREE.Group();
    tower.position.set(kx, getRawTerrainHeight(kx, kz, 1) - 0.08, kz);
    const blockColors = [0x059669, 0x0284c7, 0xf59e0b, 0xec4899];
    blockColors.forEach((cHex, idx) => {
      const szCube = 3.2 - idx * 0.48;
      const mat = new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.4 });
      disposables.push(mat);
      const box = new THREE.Mesh(new THREE.BoxGeometry(szCube, szCube * 0.85, szCube), mat);
      box.position.y = 0.6 + idx * 1.65;
      box.rotation.y = idx * 0.35;
      box.castShadow = true;
      tower.add(box);
    });
    addSignBanner(tower, 'Menara Kubus 3D', 'Kerajaan Balok Angka', '#059669', 0, 4.8, 2.0, 2.9, 0.85, maxAniso, disposables);
    root.add(tower);
    boxColliders.push({ minX: kx - 2.2, maxX: kx + 2.2, minZ: kz - 2.2, maxZ: kz + 2.2 });

    addEastGazebo(23.5, -7.5, 0x059669, 'Kios Hitung Timur', '#059669');

    // 4 Interactive Orchard Fruit Trees with individual detachable 3D fruits (Good Red/Orange + Rotten Brown)
    const treeDefs = [
      { id: 'tree-1', label: 'Pohon Apel Merah', x: -9.5, z: 8.5, fruitColor: 0xef4444, hasRotten: true },
      { id: 'tree-2', label: 'Pohon Jeruk Manis', x: -16.0, z: 9.5, fruitColor: 0xf97316, hasRotten: false },
      { id: 'tree-3', label: 'Pohon Apel Kebun', x: -7.0, z: -7.5, fruitColor: 0xdc2626, hasRotten: true },
      { id: 'tree-4', label: 'Pohon Jeruk Timur', x: 20.5, z: 3.8, fruitColor: 0xfb923c, hasRotten: false },
    ];
    treeDefs.forEach((td) => {
      const tg = new THREE.Group();
      tg.position.set(td.x, getWalkableHeight(td.x, td.z, 1), td.z);
      const trunkMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.72 });
      const goodMat = new THREE.MeshStandardMaterial({ color: td.fruitColor, roughness: 0.35 });
      const rottenMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.85 });
      disposables.push(trunkMat, leafMat, goodMat, rottenMat);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 2.2, 8), trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.65, 1), leafMat);
      canopy.position.y = 2.9;
      canopy.castShadow = true;
      tg.add(trunk, canopy);

      const fruits: Array<{ mesh: THREE.Object3D; isRotten: boolean; picked: boolean }> = [];
      const offsets: Array<[number, number, number, boolean]> = [
        [-0.85, 2.15, 0.9, false],
        [0.85, 2.25, 0.85, false],
        [0.0, 2.4, 1.35, false],
        [-0.75, 2.3, -0.8, td.hasRotten],
      ];
      offsets.forEach(([fx, fy, fz, rotten]) => {
        const fMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 10, 10),
          rotten ? rottenMat : goodMat
        );
        fMesh.position.set(fx, fy, fz);
        fMesh.castShadow = true;
        tg.add(fMesh);
        fruits.push({ mesh: fMesh, isRotten: rotten, picked: false });
      });

      addSignBanner(tg, td.label, 'Petik Buah [E]', '#059669', 0, 4.7, 0, 2.2, 0.65, maxAniso, disposables);
      root.add(tg);
      interactiveNodes.push({
        id: td.id,
        category: 'fruit-tree',
        label: `Petik ${td.label}`,
        sublabel: 'Klik / [E] Petik Buah',
        x: td.x,
        z: td.z,
        radius: 2.8,
        detailText: `Kamu memetik buah langsung dari ${td.label}!`,
        mesh: tg,
        detachableFruits: fruits,
      });
      circleColliders.push({ x: td.x, z: td.z, radius: 0.68 });
    });

    // Good vs Rotten Sorting Baskets & Interactive 3D Cube Net Shrine
    const goodBasket = makePedestalStation(
      'basket-good',
      'fruit-basket',
      'Keranjang Buah Bagus',
      'Simpan Buah Segar',
      '#16a34a',
      0x22c55e,
      -12.5,
      1.8,
      'Buah segar dan sehat siap dihitung untuk penjumlahan dan pengurangan!',
      maxAniso,
      disposables
    );
    goodBasket.node.isRotten = false;
    root.add(goodBasket.node.mesh);
    interactiveNodes.push(goodBasket.node);
    circleColliders.push(goodBasket.collider);

    const rottenBasket = makePedestalStation(
      'basket-rotten',
      'fruit-basket',
      'Keranjang Buah Busuk',
      'Pisahkan Buah Busuk',
      '#b45309',
      0x92400e,
      -16.5,
      1.8,
      'Bagus! Memisahkan buah busuk mengurangi jumlah buah di tas sehingga tersisa buah yang sehat!',
      maxAniso,
      disposables
    );
    rottenBasket.node.isRotten = true;
    root.add(rottenBasket.node.mesh);
    interactiveNodes.push(rottenBasket.node);
    circleColliders.push(rottenBasket.collider);

    const cubeShrine = makePedestalStation(
      'cube-shrine-1',
      'cube-shrine',
      'Lab Kubus & Balok 3D',
      'Buka Lipatan Jaring 3D',
      '#0284c7',
      0x0284c7,
      -12.5,
      -4.8,
      'Membuka Laboratorium 3D Kubus & Balok untuk melipat jaring-jaring menjadi bangun ruang!',
      maxAniso,
      disposables,
      (cg, dis) => {
        const cGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const cMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
        dis.push(cGeo, cMat);
        const cm = new THREE.Mesh(cGeo, cMat);
        cm.position.y = 1.35;
        cm.rotation.set(0.4, 0.7, 0.2);
        cm.castShadow = true;
        cg.add(cm);
      }
    );
    root.add(cubeShrine.node.mesh);
    interactiveNodes.push(cubeShrine.node);
    circleColliders.push(cubeShrine.collider);
  } else if (subjectId === 'ipas') {
    // Pos Peneliti Alam (-18, -5)
    const px = -18.0;
    const pz = -5.0;
    const cabin = new THREE.Group();
    cabin.position.set(px, getRawTerrainHeight(px, pz, 1) - 0.08, pz);
    const wMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.75 });
    const gMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
    disposables.push(wMat, gMat);
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.4, 4.0), wMat);
    base.position.y = 1.2;
    base.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 1.8, 4), gMat);
    roof.position.y = 3.3;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    cabin.add(base, roof);
    addSignBanner(cabin, 'Pos Peneliti Alam', 'Hutan dan Alam IPAS', '#16a34a', 0, 4.2, 2.0, 2.8, 0.85, maxAniso, disposables);
    root.add(cabin);
    boxColliders.push({ minX: px - 2.6, maxX: px + 2.6, minZ: pz - 2.2, maxZ: pz + 2.2 });

    addEastGazebo(23.0, -7.5, 0x15803d, 'Pos Sungai & Cuaca', '#15803d');

    // Sumur Air Kebun (-12.5, 2.5)
    const well = makePedestalStation(
      'ipas-well',
      'water-well',
      'Sumur Air Kebun',
      'Ambil Air Menyiram',
      '#0284c7',
      0x38bdf8,
      -12.5,
      2.5,
      'Kamu mengisi ember dengan air sumur jernih! Sekarang siram petak tanaman agar tumbuh mekar.',
      maxAniso,
      disposables,
      (wg, dis) => {
        const wGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.55, 12, 1, true);
        const wMat2 = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, side: THREE.DoubleSide });
        dis.push(wGeo, wMat2);
        const waterRim = new THREE.Mesh(wGeo, wMat2);
        waterRim.position.y = 1.05;
        wg.add(waterRim);
      }
    );
    root.add(well.node.mesh);
    interactiveNodes.push(well.node);
    circleColliders.push(well.collider);

    // 3 Multi-Stage Plant Plots (Stage 0: seed -> Stage 1: sprout -> Stage 2: flower)
    const plotCoords = [
      { id: 'plot-1', x: -8.0, z: 7.5, label: 'Petak Biji Melati' },
      { id: 'plot-2', x: -13.0, z: 8.5, label: 'Petak Biji Matahari' },
      { id: 'plot-3', x: -18.0, z: 7.5, label: 'Petak Biji Kacang' },
    ];
    plotCoords.forEach((pc) => {
      const pg = new THREE.Group();
      pg.position.set(pc.x, getWalkableHeight(pc.x, pc.z, 1), pc.z);
      const soilGeo = new THREE.BoxGeometry(1.7, 0.28, 1.7);
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
      disposables.push(soilGeo, soilMat);
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.14;
      soil.receiveShadow = true;
      pg.add(soil);

      // Stage 0: tiny seed mound
      const s0 = new THREE.Group();
      const seedM = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
      );
      seedM.position.y = 0.34;
      s0.add(seedM);

      // Stage 1: green sprout
      const s1 = new THREE.Group();
      const stem1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.55, 8),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 })
      );
      stem1.position.y = 0.52;
      const leaf1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.08, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 })
      );
      leaf1.position.set(0, 0.72, 0);
      s1.add(stem1, leaf1);
      s1.visible = false;

      // Stage 2: tall bloomed flower
      const s2 = new THREE.Group();
      const stem2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 1.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 })
      );
      stem2.position.y = 0.8;
      const flowerHead = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.32, 0),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xd97706,
          emissiveIntensity: 0.3,
        })
      );
      flowerHead.position.y = 1.45;
      s2.add(stem2, flowerHead);
      s2.visible = false;

      pg.add(s0, s1, s2);
      addSignBanner(pg, pc.label, 'Tanam & Siram [E]', '#16a34a', 0, 2.25, 0, 2.0, 0.62, maxAniso, disposables);
      root.add(pg);
      interactiveNodes.push({
        id: pc.id,
        category: 'plant-plot',
        label: `Tanam / Siram ${pc.label}`,
        sublabel: 'Tumbuhan Butuh Air & Cahaya',
        x: pc.x,
        z: pc.z,
        radius: 2.4,
        detailText: 'Tumbuhan tumbuh dari biji -> tunas -> bunga indah saat disiram teratur dan mendapat cahaya matahari!',
        mesh: pg,
        plantStage: 0,
        stageMeshes: [s0, s1, s2],
      });
    });

    // Two Glowing Green Safe Sanctuary Zones protecting against wild forest predators
    const szCoords = [
      { id: 'safe-west', x: -12.5, z: 3.0, radius: 4.0 },
      { id: 'safe-east', x: 22.0, z: -2.0, radius: 4.0 },
    ];
    szCoords.forEach((szc) => {
      const sy = getWalkableHeight(szc.x, szc.z, 1);
      const sg = new THREE.Group();
      sg.position.set(szc.x, sy + 0.04, szc.z);
      const rGeo = new THREE.RingGeometry(szc.radius - 0.35, szc.radius, 36);
      rGeo.rotateX(-Math.PI / 2);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const floorGeo = new THREE.CircleGeometry(szc.radius - 0.35, 32);
      floorGeo.rotateX(-Math.PI / 2);
      const floorMat = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      });
      disposables.push(rGeo, rMat, floorGeo, floorMat);
      const ringMesh = new THREE.Mesh(rGeo, rMat);
      const fillMesh = new THREE.Mesh(floorGeo, floorMat);
      sg.add(ringMesh, fillMesh);
      addSignBanner(sg, 'ZONA AMAN HIJAU', 'Berlindung dari Serigala', '#16a34a', 0, 2.7, -szc.radius + 0.6, 2.5, 0.72, maxAniso, disposables);
      root.add(sg);
      safeZones.push({ id: szc.id, x: szc.x, z: szc.z, radius: szc.radius, ringMesh });
    });

    // Herbivore Feeding Spot
    const rabbitFeed = makePedestalStation(
      'ipas-rabbit-feed',
      'animal-feed',
      'Meja Wortel Kelinci',
      'Beri Makan Herbivora',
      '#ea580c',
      0xf97316,
      -5.5,
      -6.5,
      'Kelinci adalah hewan jinak pemakan tumbuhan (wortel & daun segar)!',
      maxAniso,
      disposables
    );
    root.add(rabbitFeed.node.mesh);
    interactiveNodes.push(rabbitFeed.node);
    circleColliders.push(rabbitFeed.collider);

    // Wild Forest Wolf patrolling Northern Forest edge (gentle chase mechanic -> Safe Zone)
    const buildWolf = (wx: number, wz: number): Grade1PredatorEntity => {
      const wg = new THREE.Group();
      wg.position.set(wx, getWalkableHeight(wx, wz, 1), wz);
      const furMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
      const earMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.7 });
      disposables.push(furMat, earMat, eyeMat);

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 1.15), furMat);
      torso.position.y = 0.68;
      torso.castShadow = true;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.56), furMat);
      head.position.set(0, 0.96, 0.66);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.3), earMat);
      snout.position.set(0, 0.88, 0.98);
      const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), eyeMat);
      lEye.position.set(-0.14, 1.02, 0.94);
      const rEye = lEye.clone();
      rEye.position.x = 0.14;
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.55, 6), furMat);
      tail.position.set(0, 0.75, -0.72);
      tail.rotation.x = -0.65;
      wg.add(torso, head, snout, lEye, rEye, tail);

      const legParts: THREE.Object3D[] = [];
      [
        [-0.2, 0.38],
        [0.2, 0.38],
        [-0.2, -0.38],
        [0.2, -0.38],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.52, 6), earMat);
        leg.position.set(lx, 0.26, lz);
        leg.castShadow = true;
        wg.add(leg);
        legParts.push(leg);
      });

      root.add(wg);
      return {
        group: wg,
        legParts,
        homeX: wx,
        homeZ: wz,
        x: wx,
        z: wz,
        yaw: 0,
        chasing: false,
        cooldown: 0,
      };
    };
    predators.push(buildWolf(-12.5, -13.5));
  } else if (subjectId === 'pjok') {
    // Stadion Olahraga & Papan Gerak Sehat (-18, -5)
    addEastGazebo(23.0, -7.5, 0xea580c, 'Pos Gizi Sehat', '#ea580c');

    // Colorful oval running track markers + 3 Jumpable Hurdles along west meadow
    const hurdleSpots = [
      { id: 'hurdle-1', label: 'Gawang Lompat 1', x: -16.5, z: 6.0, color: 0xea580c },
      { id: 'hurdle-2', label: 'Gawang Lompat 2', x: -12.5, z: 6.0, color: 0x0284c7 },
      { id: 'hurdle-3', label: 'Gawang Lompat 3', x: -8.5, z: 6.0, color: 0x16a34a },
    ];
    hurdleSpots.forEach((hs) => {
      const hg = new THREE.Group();
      hg.position.set(hs.x, getWalkableHeight(hs.x, hs.z, 1), hs.z);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
      const bMat = new THREE.MeshStandardMaterial({ color: hs.color, roughness: 0.4 });
      disposables.push(pMat, bMat);
      [-1.1, 1.1].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.0, 8), pMat);
        post.position.set(px, 0.5, 0);
        hg.add(post);
      });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.16, 0.16), bMat);
      bar.position.y = 0.85;
      bar.castShadow = true;
      hg.add(bar);
      addSignBanner(hg, hs.label, 'Lompati [Spasi]', '#ea580c', 0, 1.7, 0, 1.9, 0.56, maxAniso, disposables);
      root.add(hg);
      interactiveNodes.push({
        id: hs.id,
        category: 'hurdle',
        label: hs.label,
        sublabel: 'Lompat Melewati Gawang',
        x: hs.x,
        z: hs.z,
        radius: 1.5,
        detailText: 'Hebat! Gerak melompat melatih kekuatan otot kaki dan kelincahan gerak lokomotor!',
        mesh: hg,
        statusMesh: bar,
      });
    });

    // Raised Balance Beam (-13.0, -3.5)
    const bx = -13.0;
    const bz = -3.5;
    const by = getWalkableHeight(bx, bz, 1);
    const beamG = new THREE.Group();
    beamG.position.set(bx, by, bz);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 });
    const legMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.7 });
    disposables.push(beamMat, legMat);
    const beamPlank = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.24, 0.65), beamMat);
    beamPlank.position.y = 0.48;
    beamPlank.castShadow = true;
    [-2.0, 2.0].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.85), legMat);
      leg.position.set(lx, 0.225, 0);
      beamG.add(leg);
    });
    beamG.add(beamPlank);
    addSignBanner(beamG, 'Titian Keseimbangan', 'Jalan di Atas Balok', '#0284c7', 0, 1.65, 0, 2.4, 0.66, maxAniso, disposables);
    root.add(beamG);
    interactiveNodes.push({
      id: 'pjok-beam',
      category: 'balance-beam',
      label: 'Titian Keseimbangan',
      sublabel: 'Latihan Keseimbangan',
      x: bx,
      z: bz,
      radius: 2.6,
      detailText: 'Luar biasa! Berjalan lurus dengan lengan terentang menjaga keseimbangan tubuh (gerak nonlokomotor)!',
      mesh: beamG,
      statusMesh: beamPlank,
    });

    // Wastafel Cuci Tangan (-17.5, -0.5)
    const sink = makePedestalStation(
      'pjok-sink',
      'hygiene-sink',
      'Wastafel Sabun & Air',
      'Cuci Tangan Bersih [E]',
      '#16a34a',
      0x38bdf8,
      -17.5,
      -0.5,
      'Cuci tangan pakai sabun mengalir setelah bermain dan sebelum makan agar bebas kuman!',
      maxAniso,
      disposables
    );
    root.add(sink.node.mesh);
    interactiveNodes.push(sink.node);
    circleColliders.push(sink.collider);
  } else if (subjectId === 'seni-budaya') {
    // Galeri Lukis 3D (-17.5, -4.5) + Air Mancur Warna + Gazebo Alat Musik 8 Nada!
    const gx = -17.5;
    const gz = -4.5;
    const gallery = new THREE.Group();
    gallery.position.set(gx, getRawTerrainHeight(gx, gz, 1) - 0.08, gz);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf5ff, roughness: 0.65 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.45 });
    disposables.push(wallMat, roofMat);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.7, 4.4), wallMat);
    hall.position.y = 1.35;
    hall.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 1.9, 4), roofMat);
    roof.position.y = 3.65;
    roof.rotation.y = Math.PI / 4;
    gallery.add(hall, roof);
    addSignBanner(gallery, 'Galeri Kreativitas', 'Seni Rupa & Tari', '#9333ea', 0, 4.5, 2.2, 2.8, 0.85, maxAniso, disposables);
    root.add(gallery);
    boxColliders.push({ minX: gx - 3.0, maxX: gx + 3.0, minZ: gz - 2.4, maxZ: gz + 2.4 });

    addEastGazebo(23.5, -7.5, 0x9333ea, 'Panggung Irama Musik', '#9333ea');

    // Color Mixing Fountain (-11.0, 2.5)
    const fountain = makePedestalStation(
      'seni-fountain',
      'color-fountain',
      'Air Mancur Campur Warna',
      'Merah + Kuning = Jingga [E]',
      '#9333ea',
      0xe879f9,
      -11.0,
      2.5,
      'Campuran warna primer: Merah + Kuning = Jingga, Biru + Kuning = Hijau, Merah + Biru = Ungu!',
      maxAniso,
      disposables,
      (fg, dis) => {
        const bowl = new THREE.Mesh(
          new THREE.CylinderGeometry(1.1, 0.75, 0.55, 14),
          new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 })
        );
        bowl.position.y = 1.05;
        dis.push(bowl.geometry, bowl.material as THREE.Material);
        fg.add(bowl);
      }
    );
    root.add(fountain.node.mesh);
    interactiveNodes.push(fountain.node);
    circleColliders.push(fountain.collider);

    // 2 In-World 3D Easels displaying Player's Saved Canvas Artworks!
    const easelCoords = [
      { id: 'easel-1', x: -16.5, z: 3.5 },
      { id: 'easel-2', x: -19.5, z: 3.5 },
    ];
    easelCoords.forEach((ec, idx) => {
      const eg = new THREE.Group();
      eg.position.set(ec.x, getWalkableHeight(ec.x, ec.z, 1), ec.z);
      const wMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.7 });
      disposables.push(wMat);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.1, 0.18), wMat);
      stand.position.y = 1.05;

      // Default colorful canvas texture (or saved artwork!)
      const canvasEl = document.createElement('canvas');
      canvasEl.width = 256;
      canvasEl.height = 192;
      const ctx = canvasEl.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(0, 0, 256, 192);
        ctx.fillStyle = idx === 0 ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(128, 86, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(0, 148, 256, 44);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(savedArtworks[idx]?.title ?? `Kanvas Lukis #${idx + 1}`, 128, 176);
      }
      const artTex = new THREE.CanvasTexture(canvasEl);
      artTex.colorSpace = THREE.SRGBColorSpace;
      const artMat = new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.45, side: THREE.DoubleSide });
      disposables.push(artTex, artMat);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.15), artMat);
      board.position.set(0, 1.45, 0.16);
      board.castShadow = true;
      eg.add(stand, board);
      addSignBanner(eg, `Kanvas #${idx + 1}`, 'Buka Studio Gambar [E]', '#9333ea', 0, 2.45, 0, 1.9, 0.56, maxAniso, disposables);
      root.add(eg);

      easelTargets.push({ index: idx, canvasMesh: board });
      interactiveNodes.push({
        id: ec.id,
        category: 'art-easel',
        label: 'Buka Studio Kanvas Lukis',
        sublabel: 'Gambar & Pajang Karya 3D',
        x: ec.x,
        z: ec.z,
        radius: 2.3,
        detailText: 'Membuka Studio Gambar Kanvas Negeri Kreativitas!',
        mesh: eg,
      });
      circleColliders.push({ x: ec.x, z: ec.z, radius: 0.65 });
    });

    // 8 Interactive Rainbow Xylophone Keys (playable in 3D!)
    const noteColors = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x06b6d4, 0x3b82f6, 0x8b5cf6, 0xec4899];
    const noteNames = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do²'];
    noteColors.forEach((nHex, nIdx) => {
      const nx = -14.5 + nIdx * 1.15;
      const nz = 8.8;
      const ng = new THREE.Group();
      ng.position.set(nx, getWalkableHeight(nx, nz, 1), nz);
      const kGeo = new THREE.BoxGeometry(0.92, 0.24, 1.35 - nIdx * 0.05);
      const kMat = new THREE.MeshStandardMaterial({ color: nHex, roughness: 0.35 });
      disposables.push(kGeo, kMat);
      const keyMesh = new THREE.Mesh(kGeo, kMat);
      keyMesh.position.y = 0.22;
      keyMesh.castShadow = true;
      ng.add(keyMesh);
      root.add(ng);
      interactiveNodes.push({
        id: `xylo-${nIdx}`,
        category: 'music-bar',
        label: `Nada ${noteNames[nIdx]}`,
        sublabel: 'Tekan / Injak Gambang',
        x: nx,
        z: nz,
        radius: 1.0,
        noteIndex: nIdx,
        detailText: `Ting! Kamu memainkan nada ${noteNames[nIdx]} pada Gambang Pelangi!`,
        mesh: ng,
        statusMesh: keyMesh,
      });
    });
  } else if (subjectId === 'bahasa-inggris') {
    // Mini English Schoolhouse (-17.0, -4.5)
    const sx = -17.0;
    const sz = -4.5;
    const school = new THREE.Group();
    school.position.set(sx, getRawTerrainHeight(sx, sz, 1) - 0.08, sz);
    const wMat = new THREE.MeshStandardMaterial({ color: 0xeef2ff, roughness: 0.65 });
    const rMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.45 });
    disposables.push(wMat, rMat);
    const body = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.7, 4.4), wMat);
    body.position.y = 1.35;
    body.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.4, 1.9, 4), rMat);
    roof.position.y = 3.65;
    roof.rotation.y = Math.PI / 4;
    school.add(body, roof);
    addSignBanner(school, 'English City School', 'Hello & Good Morning!', '#4f46e5', 0, 4.5, 2.2, 3.0, 0.85, maxAniso, disposables);
    root.add(school);
    boxColliders.push({ minX: sx - 3.0, maxX: sx + 3.0, minZ: sz - 2.4, maxZ: sz + 2.4 });

    addEastGazebo(23.5, -7.5, 0x4f46e5, 'Animal & Color Corner', '#4f46e5');

    // 6 Interactive Spoken-English 3D City Objects
    const engObjects = [
      { id: 'eng-apple', word: 'Red Apple', indo: 'Apel Merah', x: -11.5, z: 2.0, color: 0xef4444 },
      { id: 'eng-book', word: 'Blue Book', indo: 'Buku Biru', x: -15.5, z: 3.5, color: 0x0284c7 },
      { id: 'eng-bag', word: 'Yellow Bag', indo: 'Tas Kuning', x: -10.0, z: 8.5, color: 0xfacc15 },
      { id: 'eng-ball', word: 'Green Ball', indo: 'Bola Hijau', x: -15.0, z: 9.5, color: 0x22c55e },
      { id: 'eng-cat', word: 'Happy Cat', indo: 'Kucing Ceria', x: 19.8, z: 3.5, color: 0xf97316 },
      { id: 'eng-chair', word: 'Brown Chair', indo: 'Kursi Cokelat', x: 24.0, z: -2.0, color: 0x92400e },
    ];
    engObjects.forEach((eo) => {
      const built = makePedestalStation(
        eo.id,
        'english-object',
        eo.word,
        `= ${eo.indo} 🔊`,
        '#4f46e5',
        eo.color,
        eo.x,
        eo.z,
        `"${eo.word}" artinya "${eo.indo}"! Dengarkan pengucapan Bahasa Inggrisnya.`,
        maxAniso,
        disposables,
        (og, dis) => {
          const objGeo = eo.id.includes('ball') || eo.id.includes('apple')
            ? new THREE.SphereGeometry(0.38, 12, 12)
            : new THREE.BoxGeometry(0.62, 0.48, 0.45);
          const objMat = new THREE.MeshStandardMaterial({ color: eo.color, roughness: 0.35 });
          dis.push(objGeo, objMat);
          const m = new THREE.Mesh(objGeo, objMat);
          m.position.y = 1.25;
          m.castShadow = true;
          og.add(m);
        }
      );
      built.node.englishWord = eo.word;
      built.node.englishTranslation = eo.indo;
      root.add(built.node.mesh);
      interactiveNodes.push(built.node);
      circleColliders.push(built.collider);
    });
  } else if (subjectId === 'muatan-lokal') {
    const reg = LOCAL_REGION_WORLD_META[localRegion];
    // Regional Adat House (-17.0, -4.5)
    const rx = -17.0;
    const rz = -4.5;
    const adat = new THREE.Group();
    adat.position.set(rx, getRawTerrainHeight(rx, rz, 1) - 0.08, rz);
    const wMat = new THREE.MeshStandardMaterial({ color: reg.wallHex, roughness: 0.72 });
    const rMat = new THREE.MeshStandardMaterial({ color: reg.roofHex, roughness: 0.55 });
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
    disposables.push(wMat, rMat, woodMat);

    if (localRegion === 'papua') {
      // Honai circular dome house
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.7, 1.9, 16), woodMat);
      cyl.position.y = 0.95;
      cyl.castShadow = true;
      const dome = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.4, 16), rMat);
      dome.position.y = 3.05;
      dome.castShadow = true;
      adat.add(cyl, dome);
    } else if (localRegion === 'minang' || localRegion === 'toraja') {
      // Rumah Gadang Gonjong / Tongkonan soaring curved horns
      const stilts = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.9, 4.0), woodMat);
      stilts.position.y = 0.45;
      const body = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.1, 3.6), wMat);
      body.position.y = 1.95;
      body.castShadow = true;
      const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.85, 3.9), rMat);
      mainRoof.position.y = 3.35;
      const lHorn = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 4), rMat);
      lHorn.position.set(-2.6, 4.35, 0);
      lHorn.rotation.z = 0.45;
      const rHorn = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 4), rMat);
      rHorn.position.set(2.6, 4.35, 0);
      rHorn.rotation.z = -0.45;
      adat.add(stilts, body, mainRoof, lHorn, rHorn);
    } else {
      // Joglo / Jolopong / Bale Bali tiered pavilion
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.5, 5.2), woodMat);
      plinth.position.y = 0.25;
      const body = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.3, 4.2), wMat);
      body.position.y = 1.65;
      body.castShadow = true;
      const roofLower = new THREE.Mesh(new THREE.ConeGeometry(4.6, 1.4, 4), rMat);
      roofLower.position.y = 3.45;
      roofLower.rotation.y = Math.PI / 4;
      const roofTop = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.5, 4), rMat);
      roofTop.position.y = 4.6;
      roofTop.rotation.y = Math.PI / 4;
      adat.add(plinth, body, roofLower, roofTop);
    }
    addSignBanner(adat, reg.houseName, reg.regionName, reg.accentHex, 0, 5.4, 2.2, 3.2, 0.9, maxAniso, disposables);
    root.add(adat);
    boxColliders.push({ minX: rx - 3.2, maxX: rx + 3.2, minZ: rz - 2.6, maxZ: rz + 2.6 });

    addEastGazebo(23.5, -7.5, reg.roofHex, `Warung ${reg.foodName.split('&')[0].trim()}`, reg.accentHex);

    // 3 Regional Cultural Learning Spots + 3 Musical Instrument Notes
    const st1 = makePedestalStation(
      'mulok-house-info',
      'learn-spot',
      reg.houseName,
      reg.greeting,
      reg.accentHex,
      reg.roofHex,
      -11.5,
      2.0,
      `${reg.greeting}! Kamu berkunjung ke ${reg.houseName} di ${reg.regionName}.`,
      maxAniso,
      disposables
    );
    const st2 = makePedestalStation(
      'mulok-food-stall',
      'learn-spot',
      reg.foodName,
      'Kuliner Tradisional [E]',
      reg.accentHex,
      0xf59e0b,
      -15.5,
      4.5,
      `${reg.foodName}: ${reg.foodDesc}`,
      maxAniso,
      disposables
    );
    root.add(st1.node.mesh, st2.node.mesh);
    interactiveNodes.push(st1.node, st2.node);
    circleColliders.push(st1.collider, st2.collider);

    [0, 2, 4].forEach((nIdx, i) => {
      const bx = -13.0 + i * 2.2;
      const bz = 8.5;
      const built = makePedestalStation(
        `mulok-music-${i}`,
        'music-bar',
        `${reg.instrumentName} #${i + 1}`,
        'Mainkan Alat Musik [E]',
        reg.accentHex,
        reg.roofHex,
        bx,
        bz,
        `Ting! Kamu memainkan melodi tradisional menggunakan ${reg.instrumentName}!`,
        maxAniso,
        disposables
      );
      built.node.noteIndex = nIdx;
      root.add(built.node.mesh);
      interactiveNodes.push(built.node);
      circleColliders.push(built.collider);
    });
  }

  return {
    interactiveNodes,
    predators,
    safeZones,
    easelTargets,
    boxColliders,
    circleColliders,
  };
}
