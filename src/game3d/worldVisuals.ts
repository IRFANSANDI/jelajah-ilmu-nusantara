import * as THREE from 'three';
import { GradeNumber } from './inventoryData';
import { getWalkableHeight, isInDeepWater } from './terrain';

export interface AnimatedCreature {
  group: THREE.Group;
  parts: THREE.Object3D[];
  mode: 'fly' | 'hop' | 'walk' | 'hover';
  homeX: number;
  homeZ: number;
  radius: number;
  angle: number;
  speed: number;
  baseY: number;
  phase: number;
}

/**
 * 6 Completely Distinct Architectural Buildings (1 unique architecture style per Grade 1–6)
 * Keeps an approximate ~6.6 x 5.8 footprint matching boxColliders.
 */
export function createGradeBuilding(
  grade: GradeNumber,
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture,
  wallHex: number
): THREE.Group {
  const b = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.62 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.72 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45,
    roughness: 0.28,
  });

  if (grade === 1) {
    // GRADE 1: Pondok Sekolah & Taman Pelangi (pastel wall, pencil pillars, rainbow trim, bunting)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.5, 5.4), stoneMat);
    plinth.position.y = 0.25;
    plinth.receiveShadow = true;
    b.add(plinth);

    const body = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.7, 4.5), wallMat);
    body.position.y = 1.85;
    body.castShadow = true;
    body.receiveShadow = true;
    b.add(body);

    // Colorful gable roof
    const gableMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.55 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2.1, 4), gableMat);
    roof.position.y = 4.25;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    b.add(roof);

    // Giant Pencil Bollards flanking the entrance!
    const pencilColors = [0xf59e0b, 0x0284c7];
    [-2.5, 2.5].forEach((px, idx) => {
      const pBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: pencilColors[idx], roughness: 0.5 })
      );
      pBody.position.set(px, 1.5, 2.65);
      pBody.castShadow = true;
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.55, 8),
        new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 })
      );
      tip.position.set(px, 2.95, 2.65);
      b.add(pBody, tip);
    });

    // School chalkboard sign above door + bright door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.9, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.55 })
    );
    door.position.set(0, 1.45, 2.28);
    const clock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.14, 16),
      glowMat
    );
    clock.rotation.x = Math.PI / 2;
    clock.position.set(0, 2.85, 2.3);
    b.add(door, clock);

    [-1.65, 1.65].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.14), glowMat);
      win.position.set(wx, 2.0, 2.27);
      b.add(win);
    });

    return b;
  }

  if (grade === 2) {
    // GRADE 2: Lumbung Padi & Rumah Kebun Desa Ceria (A-frame barn + timber stilts + hay bales)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.75, 5.4), woodMat);
    deck.position.y = 0.375;
    deck.receiveShadow = true;
    deck.castShadow = true;
    b.add(deck);

    const barnWall = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 2.4, 4.4),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.78 })
    );
    barnWall.position.y = 1.95;
    barnWall.castShadow = true;
    b.add(barnWall);

    // Tall curved/pitched straw Lumbung roof
    const thatchMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
    const lumbungRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 3.6, 2.8, 4), thatchMat);
    lumbungRoof.position.y = 4.55;
    lumbungRoof.rotation.y = Math.PI / 4;
    lumbungRoof.castShadow = true;
    b.add(lumbungRoof);

    // Grain Silo cylinder attached at side
    const silo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.9, 3.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.68 })
    );
    silo.position.set(2.85, 2.1, -0.8);
    silo.castShadow = true;
    const siloCap = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.9, 12), roofMat);
    siloCap.position.set(2.85, 4.2, -0.8);
    b.add(silo, siloCap);

    // Front hay bale & wooden door
    const hay = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.95, 10),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.9 })
    );
    hay.rotation.z = Math.PI / 2;
    hay.position.set(-2.1, 1.15, 2.5);
    hay.castShadow = true;

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.95, 0.14), woodMat);
    door.position.set(0, 1.72, 2.22);
    b.add(hay, door);

    return b;
  }

  if (grade === 3) {
    // GRADE 3: Pondok Penjaga Rimba (elevated jungle timber stilt lodge + moss + glowing crystal lamps)
    [-2.5, 2.5].forEach((sx) => {
      [-2.0, 2.0].forEach((sz) => {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.6, 8), woodMat);
        stilt.position.set(sx, 0.8, sz);
        stilt.castShadow = true;
        b.add(stilt);
      });
    });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.3, 5.2), woodMat);
    deck.position.y = 1.6;
    deck.castShadow = true;
    deck.receiveShadow = true;
    b.add(deck);

    const lodge = new THREE.Mesh(
      new THREE.BoxGeometry(5.1, 2.3, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.8 })
    );
    lodge.position.y = 2.9;
    lodge.castShadow = true;
    b.add(lodge);

    const mossRoof = new THREE.Mesh(
      new THREE.ConeGeometry(4.7, 2.0, 6),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.82 })
    );
    mossRoof.position.y = 5.0;
    mossRoof.castShadow = true;
    b.add(mossRoof);

    // Emerald glow lanterns on stilts
    const emeraldGlow = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0x10b981,
      emissiveIntensity: 0.75,
    });
    [-1.8, 1.8].forEach((lx) => {
      const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), emeraldGlow);
      lamp.position.set(lx, 2.5, 2.45);
      b.add(lamp);
    });

    return b;
  }

  if (grade === 4) {
    // GRADE 4: Rumah Dermaga Pesisir (whitewashed + cyan maritime boathouse, awning, lifebuoy)
    const pier = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.65, 5.6), woodMat);
    pier.position.y = 0.325;
    pier.receiveShadow = true;
    b.add(pier);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 2.6, 4.5),
      new THREE.MeshStandardMaterial({ color: 0xf0f9ff, roughness: 0.6 })
    );
    cabin.position.y = 1.95;
    cabin.castShadow = true;
    b.add(cabin);

    const navyRoof = new THREE.Mesh(
      new THREE.ConeGeometry(4.4, 1.7, 4),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 })
    );
    navyRoof.position.y = 4.05;
    navyRoof.rotation.y = Math.PI / 4;
    navyRoof.castShadow = true;
    b.add(navyRoof);

    // Front striped harbor awning
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.16, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.5 })
    );
    awning.position.set(0, 2.75, 2.8);
    awning.rotation.x = 0.28;
    awning.castShadow = true;
    b.add(awning);

    // Lifebuoy ring on front facade
    const buoy = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.12, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    buoy.position.set(-1.6, 2.0, 2.3);
    b.add(buoy);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.95, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.55 })
    );
    door.position.set(0, 1.62, 2.28);
    b.add(door);

    return b;
  }

  if (grade === 5) {
    // GRADE 5: Laboratorium Bio-Dome Ilmuwan Muda (metallic pod + sky-glass dome + solar array)
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.45,
    });
    const darkTechMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6,
    });
    const cyanGlow = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const domeGlass = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.58,
      roughness: 0.12,
      metalness: 0.1,
    });

    const basePad = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.7, 16), darkTechMat);
    basePad.position.y = 0.35;
    basePad.receiveShadow = true;
    basePad.castShadow = true;
    b.add(basePad);

    const labCore = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 1.9, 16), metalMat);
    labCore.position.y = 1.65;
    labCore.castShadow = true;
    b.add(labCore);

    const energyRing = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.09, 8, 28), cyanGlow);
    energyRing.rotation.x = Math.PI / 2;
    energyRing.position.y = 2.6;
    b.add(energyRing);

    const glassDome = new THREE.Mesh(
      new THREE.SphereGeometry(2.45, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
      domeGlass
    );
    glassDome.position.y = 2.58;
    b.add(glassDome);

    // Rooftop antenna spire & side solar panel
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.4, 8), darkTechMat);
    spire.position.y = 5.4;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), cyanGlow);
    beacon.position.y = 6.15;
    b.add(spire, beacon);

    const solarPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.08, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.25, metalness: 0.7 })
    );
    solarPanel.position.set(2.9, 1.9, 0);
    solarPanel.rotation.z = -0.5;
    b.add(solarPanel);

    const airlock = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.8, 0.6), darkTechMat);
    airlock.position.set(0, 1.5, 2.55);
    const doorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.45, 0.65), cyanGlow);
    doorGlow.position.set(0, 1.45, 2.56);
    b.add(airlock, doorGlow);

    return b;
  }

  // GRADE 6: Balai Istana & Candi Penjaga Ilmu (sandstone stepped base + crimson pillars + golden Meru roof)
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xd6b48a, roughness: 0.78 });
  const royalGoldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xb45309,
    emissiveIntensity: 0.25,
    roughness: 0.25,
    metalness: 0.78,
  });
  const crimsonMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });

  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.6, 5.8), sandMat);
  tier1.position.y = 0.3;
  tier1.receiveShadow = true;
  tier1.castShadow = true;
  b.add(tier1);

  const sanctum = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.6, 4.4), sandMat);
  sanctum.position.y = 1.9;
  sanctum.castShadow = true;
  b.add(sanctum);

  // Crimson royal pillars
  [
    [-2.75, 2.45],
    [2.75, 2.45],
    [-2.75, -2.2],
    [2.75, -2.2],
  ].forEach(([px, pz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.7, 10), crimsonMat);
    col.position.set(px, 1.95, pz);
    col.castShadow = true;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.22, 10), royalGoldMat);
    cap.position.set(px, 3.3, pz);
    b.add(col, cap);
  });

  // 2-tier golden Meru pagoda roof
  const meru1 = new THREE.Mesh(new THREE.ConeGeometry(4.6, 1.6, 4), crimsonMat);
  meru1.position.y = 4.1;
  meru1.rotation.y = Math.PI / 4;
  meru1.castShadow = true;

  const meru2 = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.6, 4), royalGoldMat);
  meru2.position.y = 5.35;
  meru2.rotation.y = Math.PI / 4;
  meru2.castShadow = true;

  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), royalGoldMat);
  finial.position.y = 6.35;
  b.add(meru1, meru2, finial);

  const royalDoor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.1, 0.16), royalGoldMat);
  royalDoor.position.set(0, 1.65, 2.22);
  b.add(royalDoor);

  return b;
}

/**
 * 6 Distinct Tree & Flora Types per Grade 1–6
 */
export function createGradeTree(
  grade: GradeNumber,
  variantIndex: number,
  scale = 1
): THREE.Group {
  const tree = new THREE.Group();
  const v = variantIndex % 2;

  if (grade === 1) {
    // Lollipop blossom & pastel orchard trees
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.3, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
    );
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);

    const crownColor = v === 0 ? 0x22c55e : 0xf472b6;
    const accentColor = v === 0 ? 0xfbbf24 : 0xfbcfe8;
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 12, 10),
      new THREE.MeshStandardMaterial({ color: crownColor, roughness: 0.7 })
    );
    crown.position.y = 3.0;
    crown.castShadow = true;
    tree.add(crown);

    for (let f = 0; f < 4; f++) {
      const a = (f / 4) * Math.PI * 2;
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 8),
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.5 })
      );
      flower.position.set(Math.cos(a) * 1.25, 3.0 + (f % 2) * 0.45, Math.sin(a) * 1.25);
      tree.add(flower);
    }
  } else if (grade === 2) {
    if (v === 0) {
      // Fruit-bearing mango/orange orchard tree
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.4, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.88 })
      );
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.65, 1),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.72 })
      );
      canopy.position.y = 3.2;
      canopy.castShadow = true;
      tree.add(trunk, canopy);

      for (let f = 0; f < 5; f++) {
        const a = (f / 5) * Math.PI * 2;
        const fruit = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 })
        );
        fruit.position.set(Math.cos(a) * 1.35, 2.7 + (f % 2) * 0.4, Math.sin(a) * 1.35);
        tree.add(fruit);
      }
    } else {
      // Bamboo grove cluster!
      const bambooMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.55 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
      [
        [-0.35, -0.2, 4.6],
        [0.35, 0.1, 5.2],
        [0, 0.38, 4.1],
      ].forEach(([bx, bz, h]) => {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, h, 8), bambooMat);
        stalk.position.set(bx, h * 0.5, bz);
        stalk.castShadow = true;
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.2, 6), leafMat);
        tuft.position.set(bx, h + 0.3, bz);
        tree.add(stalk, tuft);
      });
    }
  } else if (grade === 3) {
    if (v === 0) {
      // Ancient towering mossy jungle canopy giant
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.68, 4.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.92 })
      );
      trunk.position.y = 2.1;
      trunk.castShadow = true;
      tree.add(trunk);

      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.78 });
      const upperMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.72 });
      [
        [0, 4.7, 0, 2.1, canopyMat],
        [-1.3, 4.1, 0.6, 1.35, upperMat],
        [1.35, 4.2, -0.5, 1.4, canopyMat],
      ].forEach(([cx, cy, cz, r, mat]) => {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(r as number, 1),
          mat as THREE.Material
        );
        puff.position.set(cx as number, cy as number, cz as number);
        puff.castShadow = true;
        tree.add(puff);
      });
    } else {
      // Giant glowing bioluminescent jungle mushroom!
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.42, 2.2, 10),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
      );
      stem.position.y = 1.1;
      stem.castShadow = true;
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
        new THREE.MeshStandardMaterial({
          color: 0x14b8a6,
          emissive: 0x0d9488,
          emissiveIntensity: 0.35,
          roughness: 0.45,
        })
      );
      cap.position.y = 2.0;
      cap.castShadow = true;
      tree.add(stem, cap);
    }
  } else if (grade === 4) {
    // Leaning coastal coconut palm & tropical pandan
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: v === 0 ? 0x16a34a : 0x0d9488,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    let curX = 0;
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22 - i * 0.02, 0.27 - i * 0.02, 1.15, 8),
        trunkMat
      );
      curX += i * 0.08 * (v === 0 ? 1 : -1);
      seg.position.set(curX, 0.55 + i * 1.05, 0);
      seg.rotation.z = (v === 0 ? -1 : 1) * i * 0.05;
      seg.castShadow = true;
      tree.add(seg);
    }
    const crownY = 5.4;
    for (let f = 0; f < 6; f++) {
      const frondPivot = new THREE.Group();
      frondPivot.position.set(curX, crownY, 0);
      frondPivot.rotation.y = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.8, 5), leafMat);
      frond.rotation.z = -Math.PI * 0.64;
      frond.position.set(1.25, -0.25, 0);
      frond.scale.set(0.35, 1, 1);
      frond.castShadow = true;
      frondPivot.add(frond);
      tree.add(frondPivot);
    }
  } else if (grade === 5) {
    // Futuristic Bio-Crystal Tech Tree
    const metalTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.36, 2.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.65 })
    );
    metalTrunk.position.y = 1.4;
    metalTrunk.castShadow = true;
    tree.add(metalTrunk);

    const crystalMat = new THREE.MeshStandardMaterial({
      color: v === 0 ? 0x38bdf8 : 0x818cf8,
      emissive: v === 0 ? 0x0284c7 : 0x4f46e5,
      emissiveIntensity: 0.38,
      roughness: 0.2,
      metalness: 0.3,
    });
    const mainGem = new THREE.Mesh(new THREE.OctahedronGeometry(1.35, 0), crystalMat);
    mainGem.position.y = 3.8;
    mainGem.scale.set(1, 1.3, 1);
    mainGem.castShadow = true;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.06, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xa5f3fc, emissive: 0x06b6d4, emissiveIntensity: 0.6 })
    );
    ring.position.y = 3.6;
    ring.rotation.x = Math.PI / 2.4;
    tree.add(mainGem, ring);
  } else {
    // GRADE 6: Sacred Golden Kalpataru & Royal Blossom Tree
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.55, 3.0, 10),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);

    const goldLeaf = new THREE.MeshStandardMaterial({
      color: v === 0 ? 0xfbbf24 : 0x10b981,
      emissive: v === 0 ? 0xb45309 : 0x047857,
      emissiveIntensity: 0.18,
      roughness: 0.45,
    });
    const tier1 = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.5, 8), goldLeaf);
    tier1.position.y = 3.4;
    tier1.castShadow = true;
    const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.45, 1.4, 8), goldLeaf);
    tier2.position.y = 4.45;
    tier2.castShadow = true;
    const crownGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.6 })
    );
    crownGem.position.y = 5.45;
    tree.add(tier1, tier2, crownGem);
  }

  tree.scale.setScalar(scale);
  return tree;
}

/**
 * 6 Distinct Wildlife / Companion Creatures per Grade 1–6
 */
export function createGradeCreature(
  grade: GradeNumber,
  index: number,
  homeX: number,
  homeZ: number
): AnimatedCreature {
  const group = new THREE.Group();
  const parts: THREE.Object3D[] = [];
  const variant = index % 2;

  let mode: AnimatedCreature['mode'] = 'walk';
  let baseY = getWalkableHeight(homeX, homeZ);
  let speed = 1.1;
  let radius = 3.2;

  if (grade === 1) {
    if (variant === 0) {
      // Kupu-Kupu Pelangi (Butterfly)
      mode = 'fly';
      baseY += 1.65;
      speed = 1.55;
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.05, 0.24, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      body.rotation.x = Math.PI / 2;
      group.add(body);
      const wingMat = new THREE.MeshStandardMaterial({
        color: index % 4 === 0 ? 0xf472b6 : 0x38bdf8,
        emissive: index % 4 === 0 ? 0xdb2777 : 0x0284c7,
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide,
      });
      [-1, 1].forEach((side) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.26), wingMat);
        wing.position.set(side * 0.17, 0.02, 0);
        group.add(wing);
        parts.push(wing);
      });
    } else {
      // Kelinci Lucu (Hopping Bunny)
      mode = 'hop';
      speed = 1.25;
      const furMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), furMat);
      body.position.y = 0.24;
      body.scale.set(0.9, 0.9, 1.25);
      body.castShadow = true;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), furMat);
      head.position.set(0, 0.42, 0.22);
      const earL = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.18, 4, 6), furMat);
      earL.position.set(-0.07, 0.62, 0.2);
      const earR = earL.clone();
      earR.position.x = 0.07;
      group.add(body, head, earL, earR);
      parts.push(earL, earR);
    }
  } else if (grade === 2) {
    if (variant === 0) {
      // Ayam Kampung (Village Chicken)
      mode = 'hop';
      speed = 1.0;
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.75 })
      );
      body.position.y = 0.26;
      body.scale.set(0.85, 0.9, 1.2);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7 })
      );
      head.position.set(0, 0.46, 0.2);
      const comb = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.09, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      );
      comb.position.set(0, 0.59, 0.2);
      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.45, 0.34);
      group.add(body, head, comb, beak);
      parts.push(head);
    } else {
      // Sapi Desa Lucu (Friendly Spotted Cow)
      mode = 'walk';
      speed = 0.75;
      radius = 4.0;
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75 });
      const spotMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.52, 0.9), whiteMat);
      body.position.y = 0.55;
      body.castShadow = true;
      const spot = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.25, 0.35), spotMat);
      spot.position.set(0, 0.62, -0.05);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.38), whiteMat);
      head.position.set(0, 0.68, 0.56);
      group.add(body, spot, head);
      parts.push(head);
    }
  } else if (grade === 3) {
    if (variant === 0) {
      // Burung Rangkong / Kakaktua Hutan (Forest Parrot)
      mode = 'fly';
      baseY += 2.6;
      speed = 1.6;
      radius = 4.6;
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.28, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 })
      );
      body.rotation.x = Math.PI / 2;
      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.22, 6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      beak.rotation.x = Math.PI / 2;
      beak.position.z = 0.28;
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
      [-1, 1].forEach((side) => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.22), wingMat);
        w.position.set(side * 0.25, 0.04, 0);
        group.add(w);
        parts.push(w);
      });
      group.add(body, beak);
    } else {
      // Katak Hijau Rimba (Jungle Frog)
      mode = 'hop';
      speed = 1.35;
      const frogMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), frogMat);
      body.scale.set(1.15, 0.72, 1.2);
      body.position.y = 0.18;
      body.castShadow = true;
      [-0.1, 0.1].forEach((ex) => {
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xfef08a })
        );
        eye.position.set(ex, 0.34, 0.16);
        group.add(eye);
      });
      group.add(body);
    }
  } else if (grade === 4) {
    if (variant === 0) {
      // Burung Camar Pesisir (Coastal Seagull)
      mode = 'fly';
      baseY += 3.2;
      speed = 1.85;
      radius = 5.4;
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.3, 6, 8), whiteMat);
      body.rotation.x = Math.PI / 2;
      group.add(body);
      [-1, 1].forEach((side) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.2), whiteMat);
        wing.position.set(side * 0.3, 0.04, 0);
        group.add(wing);
        parts.push(wing);
      });
    } else {
      // Kepiting Pesisir (Beach Crab)
      mode = 'walk';
      speed = 1.25;
      const crabMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.14, 10), crabMat);
      shell.position.y = 0.14;
      shell.castShadow = true;
      [-1, 1].forEach((side) => {
        const claw = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), crabMat);
        claw.position.set(side * 0.32, 0.18, 0.22);
        group.add(claw);
        parts.push(claw);
      });
      group.add(shell);
    }
  } else if (grade === 5) {
    if (variant === 0) {
      // Drone Riset Otonom (Hovering Lab Drone)
      mode = 'hover';
      baseY += 1.9;
      speed = 1.45;
      radius = 4.2;
      const podMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.5 });
      const glowMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), podMat);
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), glowMat);
      lens.position.z = 0.21;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 8, 20), glowMat);
      ring.rotation.x = Math.PI / 2;
      group.add(core, lens, ring);
      parts.push(ring);
    } else {
      // Robot Rover Mini (Lab Rover)
      mode = 'walk';
      speed = 1.15;
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.22, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.35, metalness: 0.4 })
      );
      chassis.position.y = 0.22;
      chassis.castShadow = true;
      const radar = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.16, 8),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 })
      );
      radar.position.set(0, 0.42, 0);
      group.add(chassis, radar);
      parts.push(radar);
    }
  } else {
    if (variant === 0) {
      // Burung Garuda Emas (Soaring Golden Spirit Bird)
      mode = 'fly';
      baseY += 3.4;
      speed = 1.5;
      radius = 5.5;
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.35,
        metalness: 0.7,
        roughness: 0.25,
      });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.36, 6, 8), goldMat);
      body.rotation.x = Math.PI / 2;
      group.add(body);
      [-1, 1].forEach((side) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.28), goldMat);
        wing.position.set(side * 0.38, 0.06, 0);
        group.add(wing);
        parts.push(wing);
      });
    } else {
      // Kunang-Kunang Cahaya Ilmu (Royal Mana Wisp)
      mode = 'hover';
      baseY += 1.4;
      speed = 1.2;
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.85,
      });
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), orbMat);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 16), orbMat);
      group.add(orb, halo);
      parts.push(halo);
    }
  }

  group.position.set(homeX, baseY, homeZ);
  return {
    group,
    parts,
    mode,
    homeX,
    homeZ,
    radius,
    angle: index * 1.35,
    speed,
    baseY,
    phase: index * 0.9,
  };
}

export function updateCreatures(
  creatures: AnimatedCreature[],
  dt: number,
  elapsed: number
) {
  for (let i = 0; i < creatures.length; i++) {
    const c = creatures[i];
    c.angle += dt * (c.speed / Math.max(1.5, c.radius));
    const nx = c.homeX + Math.cos(c.angle) * c.radius;
    const nz = c.homeZ + Math.sin(c.angle) * c.radius;

    // Facing tangent along circular path
    c.group.rotation.y = -c.angle;

    if (c.mode === 'fly') {
      const y = c.baseY + Math.sin(elapsed * 2.5 + c.phase) * 0.35;
      c.group.position.set(nx, y, nz);
      const flap = Math.sin(elapsed * 11 + c.phase) * 0.55;
      if (c.parts[0]) c.parts[0].rotation.z = flap;
      if (c.parts[1]) c.parts[1].rotation.z = -flap;
    } else if (c.mode === 'hover') {
      const y = c.baseY + Math.sin(elapsed * 3.0 + c.phase) * 0.25;
      c.group.position.set(nx, y, nz);
      if (c.parts[0]) c.parts[0].rotation.z += dt * 3.5;
    } else if (c.mode === 'hop') {
      const gy = isInDeepWater(nx, nz) ? 0.3 : getWalkableHeight(nx, nz);
      const hop = Math.abs(Math.sin(elapsed * 5.2 + c.phase)) * 0.36;
      c.group.position.set(nx, gy + hop, nz);
    } else {
      const gy = isInDeepWater(nx, nz) ? 0.3 : getWalkableHeight(nx, nz);
      c.group.position.set(nx, gy, nz);
      if (c.parts[0]) {
        c.parts[0].rotation.y = Math.sin(elapsed * 2.2 + c.phase) * 0.25;
      }
    }
  }
}

/**
 * Chapter-specific micro-decor props so different Babs within the same grade look distinct!
 */
export function createChapterDecorProp(
  grade: GradeNumber,
  chapterNumber: number,
  index: number
): THREE.Group {
  const g = new THREE.Group();
  const palette = [0xef4444, 0x0284c7, 0x10b981, 0xf59e0b, 0x8b5cf6];
  const colorHex = palette[(chapterNumber + index) % palette.length];
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45 });

  if (grade === 1) {
    // Oversized colorful block stack / flower planter
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), mat);
    b1.position.y = 0.38;
    b1.castShadow = true;
    const b2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45 })
    );
    b2.position.y = 1.02;
    b2.rotation.y = 0.45;
    b2.castShadow = true;
    g.add(b1, b2);
  } else if (grade === 2) {
    // Rustic farm barrel & sunflower post
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.38, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
    );
    barrel.position.y = 0.45;
    barrel.castShadow = true;
    const crop = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), mat);
    crop.position.y = 1.02;
    g.add(barrel, crop);
  } else if (grade === 3) {
    // Carved wooden forest totem / glowing crystal stone
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55, 0),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    );
    rock.position.y = 0.45;
    rock.castShadow = true;
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x059669, emissiveIntensity: 0.55 })
    );
    gem.position.y = 1.15;
    g.add(rock, gem);
  } else if (grade === 4) {
    // Coastal anchor bollard & rope post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 1.15, 10),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.55 })
    );
    post.position.y = 0.58;
    post.castShadow = true;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.06, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    ring.position.y = 1.05;
    g.add(post, ring);
  } else if (grade === 5) {
    // Holographic lab pylon
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 0.95, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.6 })
    );
    base.position.y = 0.48;
    base.castShadow = true;
    const orb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.26, 0),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.75 })
    );
    orb.position.y = 1.25;
    g.add(base, orb);
  } else {
    // Royal sandstone brazier torch with golden flame crystal
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.42, 1.15, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
    );
    stand.position.y = 0.58;
    stand.castShadow = true;
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.85 })
    );
    flame.position.y = 1.42;
    g.add(stand, flame);
  }

  return g;
}
