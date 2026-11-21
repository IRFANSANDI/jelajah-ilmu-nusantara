import * as THREE from 'three';
import type { Chapter3DStation } from './chapterWorldAdapter';
import {
  Accessory3DId,
  GradeNumber,
  HeroStyleId,
  LocalRegionId,
  ReligionId,
  SubjectId,
} from './inventoryData';

import { NpcRoleStyle } from './worldData';

export interface CharacterRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftElbow?: THREE.Group;
  rightElbow?: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftKnee?: THREE.Group;
  rightKnee?: THREE.Group;
  heldBook?: THREE.Group;
  heldPencil?: THREE.Group;
  heldWateringCan?: THREE.Group;
  heldBasket?: THREE.Group;
  extraParts: THREE.Object3D[];
  gradeStyle: GradeNumber;
  indicator?: THREE.Mesh;
}

export interface CharacterColors {
  skin: number;
  hair: number;
  shirt: number;
  vest: number;
  pants: number;
  scarf: number;
  hat?: number;
}

export function getHeroColors(
  heroStyle: HeroStyleId,
  grade: GradeNumber = 1,
  g1Subject?: SubjectId,
  religion?: ReligionId,
  localRegion?: LocalRegionId
): CharacterColors {
  const isSari = heroStyle === 'sari';
  const skin = isSari ? 0xf5cba7 : 0xf1c29b;
  const hair = isSari ? 0x1e1b4b : 0x1e293b;

  if (grade === 1 && g1Subject) {
    switch (g1Subject) {
      case 'agama': {
        if (religion === 'islam') {
          return { skin, hair, shirt: 0xffffff, vest: 0x0d9488, pants: 0x0f766e, scarf: 0xfef3c7, hat: 0x0f172a };
        }
        if (religion === 'hindu') {
          return { skin, hair, shirt: 0xffffff, vest: 0xd97706, pants: 0xfef3c7, scarf: 0xf59e0b, hat: 0xffffff };
        }
        if (religion === 'buddha') {
          return { skin, hair, shirt: 0xfef3c7, vest: 0xd97706, pants: 0x78350f, scarf: 0xfbbf24, hat: 0xf59e0b };
        }
        if (religion === 'khonghucu') {
          return { skin, hair, shirt: 0xdc2626, vest: 0xf59e0b, pants: 0x1e293b, scarf: 0xfbbf24, hat: 0xdc2626 };
        }
        // kristen / katolik
        return { skin, hair, shirt: 0xf8fafc, vest: 0x0284c7, pants: 0x1e293b, scarf: 0xfde68a, hat: 0x0369a1 };
      }
      case 'pancasila':
        return { skin, hair, shirt: 0xffffff, vest: 0xdc2626, pants: 0xdc2626, scarf: 0xfbbf24, hat: 0xdc2626 };
      case 'matematika':
        return { skin, hair, shirt: 0xffffff, vest: 0x059669, pants: 0x047857, scarf: 0xf59e0b, hat: 0x059669 };
      case 'ipas':
        return { skin, hair, shirt: 0xecfdf5, vest: 0x16a34a, pants: 0x365314, scarf: 0x84cc16, hat: 0x15803d };
      case 'pjok':
        return { skin, hair, shirt: 0xffedd5, vest: 0xea580c, pants: 0x0f172a, scarf: 0xf97316, hat: 0xea580c };
      case 'seni-budaya':
        return { skin, hair, shirt: 0xfaf5ff, vest: 0x9333ea, pants: 0x3b0764, scarf: 0xf43f5e, hat: 0x7e22ce };
      case 'bahasa-inggris':
        return { skin, hair, shirt: 0xeef2ff, vest: 0x4f46e5, pants: 0x1e1b4b, scarf: 0x38bdf8, hat: 0x4338ca };
      case 'muatan-lokal': {
        const regMap: Record<LocalRegionId, [number, number, number]> = {
          jawa: [0x78350f, 0xb45309, 0xfef3c7],
          sunda: [0x15803d, 0x0f172a, 0x86efac],
          bali: [0xd97706, 0x7c2d12, 0xffffff],
          minang: [0xb91c1c, 0x0f172a, 0xfbbf24],
          toraja: [0x9a3412, 0x1e293b, 0xfde047],
          papua: [0x0f766e, 0x451a03, 0xf59e0b],
        };
        const [vestC, pantsC, hatC] = regMap[localRegion ?? 'jawa'];
        return { skin, hair, shirt: 0xfffbeb, vest: vestC, pants: pantsC, scarf: 0xfbbf24, hat: hatC };
      }
      case 'bahasa-indonesia':
      default:
        return { skin, hair, shirt: 0xffffff, vest: 0xdc2626, pants: 0xb91c1c, scarf: 0xdc2626, hat: 0xdc2626 };
    }
  }

  switch (grade) {
    case 1:
      // Anak SD Kelas 1: Seragam Putih-Merah cerah
      return {
        skin,
        hair,
        shirt: 0xffffff,
        vest: 0xdc2626,
        pants: 0xb91c1c,
        scarf: 0xdc2626,
        hat: 0xdc2626,
      };
    case 2:
      // Petualang Desa Ceria: Pakaian pertanian hijau-biru & topi anyaman
      return {
        skin,
        hair,
        shirt: isSari ? 0xfef3c7 : 0xfff7ed,
        vest: 0x059669,
        pants: 0x1d4ed8,
        scarf: 0xea580c,
        hat: 0xd97706,
      };
    case 3:
      // Penjelajah Hutan: Jaket ekspedisi khaki & zamrud
      return {
        skin,
        hair,
        shirt: 0xd6d3d1,
        vest: isSari ? 0x0f766e : 0x15803d,
        pants: 0x78350f,
        scarf: 0xf59e0b,
        hat: 0x065f46,
      };
    case 4:
      // Penjelajah Pulau: Pakaian navigator laut teal & biru dongker
      return {
        skin,
        hair,
        shirt: 0xf0f9ff,
        vest: isSari ? 0x0891b2 : 0x0369a1,
        pants: 0x0f172a,
        scarf: 0xf97316,
        hat: 0x0284c7,
      };
    case 5:
      // Ilmuwan Muda: Jas lab putih & setelan teknologi indigo/cyan
      return {
        skin,
        hair,
        shirt: 0xffffff,
        vest: isSari ? 0x6366f1 : 0x4f46e5,
        pants: 0x1e293b,
        scarf: 0x38bdf8,
        hat: 0x0284c7,
      };
    case 6:
    default:
      // Pahlawan Kerajaan: Kostum kesatria fantasi Nusantara zamrud & emas
      return {
        skin,
        hair,
        shirt: 0x1e293b,
        vest: isSari ? 0x7c3aed : 0x047857,
        pants: 0x312e81,
        scarf: 0xfbbf24,
        hat: 0xfbbf24,
      };
  }
}

export function createCartoonCharacter(
  colors: CharacterColors,
  options: {
    grade?: GradeNumber;
    hasBackpack?: boolean;
    hasHat?: boolean;
    isNpc?: boolean;
    heroStyle?: HeroStyleId;
    accessory?: Accessory3DId;
    grade1Subject?: SubjectId;
    religion?: ReligionId;
    localRegion?: LocalRegionId;
    npcRoleStyle?: NpcRoleStyle;
  } = {}
): CharacterRig {
  const grade: GradeNumber = options.grade ?? 1;
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const extraParts: THREE.Object3D[] = [];
  root.add(bodyGroup);

  // Distinct overall silhouette scale per grade (Grade 1 shortest child -> Grade 6 heroic teen/knight)
  const scaleMap: Record<GradeNumber, number> = {
    1: 0.85,
    2: 0.93,
    3: 0.98,
    4: 1.0,
    5: 1.03,
    6: 1.07,
  };
  if (!options.isNpc) {
    root.scale.setScalar(scaleMap[grade]);
  }

  const skinMat = new THREE.MeshStandardMaterial({
    color: colors.skin,
    roughness: 0.65,
    metalness: 0.0,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: colors.hair,
    roughness: 0.8,
    metalness: 0.05,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: colors.shirt,
    roughness: 0.72,
    metalness: 0.0,
  });
  const vestMat = new THREE.MeshStandardMaterial({
    color: colors.vest,
    roughness: 0.65,
    metalness: grade === 6 ? 0.35 : 0.05,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: colors.pants,
    roughness: 0.8,
    metalness: 0.0,
  });
  const bootColor =
    grade === 1
      ? 0x1e293b
      : grade === 2
      ? 0x5c2d16
      : grade === 5
      ? 0x0f172a
      : grade === 6
      ? 0x78350f
      : 0x3b2314;
  const bootMat = new THREE.MeshStandardMaterial({
    color: bootColor,
    roughness: grade === 6 ? 0.35 : 0.55,
    metalness: grade === 6 ? 0.45 : 0.08,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: grade === 5 ? 0x38bdf8 : 0xe2e8f0,
    roughness: 0.35,
    metalness: 0.1,
  });
  const scarfMat = new THREE.MeshStandardMaterial({
    color: colors.scarf,
    roughness: 0.6,
    metalness: 0.05,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.82,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.75,
    roughness: 0.2,
  });

  // 1. Grade-Tailored Legs & Footwear with Knee Joints (hip pivot y = 0.68, knee pivot y = -0.31)
  function buildLeg(side: -1 | 1): { hip: THREE.Group; knee: THREE.Group } {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.17, 0.68, 0);

    const knee = new THREE.Group();
    knee.position.set(0, -0.31, 0);
    pivot.add(knee);

    if (grade === 1) {
      // SD shorts + knee joint + bare lower legs + school sneakers
      const upperShort = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.128, 0.24, 10),
        pantsMat
      );
      upperShort.position.y = -0.14;
      upperShort.castShadow = true;
      const kneeJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.088, 10, 8),
        skinMat
      );
      kneeJoint.position.y = -0.29;
      pivot.add(upperShort, kneeJoint);

      const lowerBare = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.082, 0.14, 6, 10),
        skinMat
      );
      lowerBare.position.y = -0.09;
      lowerBare.castShadow = true;
      knee.add(lowerBare);
    } else {
      const upperThigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(grade === 6 ? 0.118 : 0.11, 0.14, 6, 12),
        pantsMat
      );
      upperThigh.position.y = -0.16;
      upperThigh.castShadow = true;
      pivot.add(upperThigh);

      const lowerShin = new THREE.Mesh(
        new THREE.CapsuleGeometry(grade === 6 ? 0.108 : 0.1, 0.14, 6, 12),
        pantsMat
      );
      lowerShin.position.y = -0.09;
      lowerShin.castShadow = true;
      knee.add(lowerShin);

      if (grade === 2 || grade === 3 || grade === 6) {
        const cuff = new THREE.Mesh(
          new THREE.CylinderGeometry(0.125, 0.12, 0.18, 10),
          grade === 6 ? brassMat : bootMat
        );
        cuff.position.y = -0.13;
        knee.add(cuff);
      }
    }

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.16, 0.3),
      bootMat
    );
    boot.position.set(0, -0.22, 0.04);
    boot.castShadow = true;
    knee.add(boot);

    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.23, 0.06, 0.32),
      soleMat
    );
    sole.position.set(0, -0.33, 0.04);
    sole.castShadow = true;
    knee.add(sole);

    return { hip: pivot, knee };
  }

  const leftLegBuilt = buildLeg(-1);
  const rightLegBuilt = buildLeg(1);
  const leftLeg = leftLegBuilt.hip;
  const rightLeg = rightLegBuilt.hip;
  const leftKnee = leftLegBuilt.knee;
  const rightKnee = rightLegBuilt.knee;
  bodyGroup.add(leftLeg, rightLeg);

  // 2. Grade-Specific Torso, Outfit & Gear
  const torsoTopR = grade === 6 ? 0.31 : grade === 1 ? 0.26 : 0.285;
  const torsoBotR = grade === 1 ? 0.27 : 0.25;
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(torsoTopR, torsoBotR, 0.64, 14),
    shirtMat
  );
  torso.position.y = 1.0;
  torso.castShadow = true;
  bodyGroup.add(torso);

  if (grade === 1) {
    // SD Uniform customized per Grade 1 Subject World!
    const g1Subj = options.grade1Subject;
    if (options.heroStyle === 'sari') {
      const skirt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.27, 0.36, 0.26, 14),
        pantsMat
      );
      skirt.position.y = 0.72;
      skirt.castShadow = true;
      bodyGroup.add(skirt);
    }

    if (!options.isNpc && g1Subj === 'pjok') {
      // Sporty vest stripe & referee whistle
      const trackStripe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.56, 0.56), vestMat);
      trackStripe.position.set(0, 1.0, 0);
      const whistle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8), brassMat);
      whistle.rotation.z = Math.PI / 2;
      whistle.position.set(0, 1.08, 0.29);
      bodyGroup.add(trackStripe, whistle);
    } else if (!options.isNpc && g1Subj === 'seni-budaya') {
      // Painter apron with colorful spots!
      const apron = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.05), vestMat);
      apron.position.set(0, 0.96, 0.27);
      bodyGroup.add(apron);
      [0xef4444, 0xfacc15, 0x3b82f6].forEach((c, idx) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.038, 8, 8),
          new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })
        );
        dot.position.set(-0.09 + idx * 0.09, 0.95 + (idx % 2) * 0.07, 0.3);
        bodyGroup.add(dot);
      });
    } else if (!options.isNpc && (g1Subj === 'ipas' || g1Subj === 'matematika' || g1Subj === 'pancasila' || g1Subj === 'agama' || g1Subj === 'muatan-lokal')) {
      const vestPanel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.285, 0.285, 0.44, 14, 1, false, -0.9, 1.8),
        vestMat
      );
      vestPanel.position.y = 0.98;
      bodyGroup.add(vestPanel);
      const sash = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.54, 0.52), scarfMat);
      sash.rotation.z = 0.52;
      sash.position.set(0, 1.02, 0);
      bodyGroup.add(sash);
      if (g1Subj === 'ipas') {
        const lens = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12), brassMat);
        lens.position.set(-0.28, 0.84, 0.1);
        lens.rotation.y = Math.PI / 2;
        bodyGroup.add(lens);
      }
    } else {
      const redTie = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 4), scarfMat);
      redTie.rotation.z = Math.PI;
      redTie.position.set(0, 1.12, 0.27);
      bodyGroup.add(redTie);
    }

    if (options.hasBackpack) {
      const packColor =
        g1Subj === 'ipas'
          ? 0x15803d
          : g1Subj === 'seni-budaya'
          ? 0x9333ea
          : g1Subj === 'matematika'
          ? 0x059669
          : g1Subj === 'muatan-lokal'
          ? 0x92400e
          : 0x0284c7;
      const miniPack = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.44, 0.22),
        new THREE.MeshStandardMaterial({ color: packColor, roughness: 0.55 })
      );
      miniPack.position.set(0, 1.02, -0.3);
      miniPack.castShadow = true;
      const pocket = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.22, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 })
      );
      pocket.position.set(0, 0.94, -0.43);
      bodyGroup.add(miniPack, pocket);
    }
  } else if (grade === 2) {
    // Petualang Desa: Bib overalls, village seed satchel, brass buttons & veggie harvest basket
    const bib = new THREE.Mesh(
      new THREE.CylinderGeometry(0.298, 0.285, 0.46, 14),
      pantsMat
    );
    bib.position.y = 0.92;
    bib.castShadow = true;
    bodyGroup.add(bib);

    [-0.12, 0.12].forEach((sx) => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.06), pantsMat);
      strap.position.set(sx, 1.2, 0.24);
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), brassMat);
      btn.position.set(sx, 1.12, 0.29);
      bodyGroup.add(strap, btn);
    });

    // Diagonal seed & tool satchel strap across chest + hip pouch
    const satchelStrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.62, 0.56),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 })
    );
    satchelStrap.rotation.z = -0.55;
    satchelStrap.position.set(0, 1.0, 0);
    const seedPouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.2, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 })
    );
    seedPouch.position.set(0.32, 0.76, 0.08);
    seedPouch.castShadow = true;
    bodyGroup.add(satchelStrap, seedPouch);

    const bandana = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.058, 8, 16), scarfMat);
    bandana.rotation.x = Math.PI / 2;
    bandana.position.y = 1.31;
    bodyGroup.add(bandana);

    if (options.hasBackpack) {
      // Woven Bamboo Harvest Basket filled with colorful village crops
      const basket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.19, 0.48, 12),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
      );
      basket.position.set(0, 1.04, -0.34);
      basket.castShadow = true;
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.035, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 1.28, -0.34);
      const cropA = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 })
      );
      cropA.position.set(-0.08, 1.32, -0.34);
      const cropB = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55 })
      );
      cropB.position.set(0.09, 1.31, -0.32);
      const corn = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.055, 0.14, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 })
      );
      corn.position.set(0, 1.37, -0.4);
      corn.rotation.x = -0.25;
      bodyGroup.add(basket, rim, cropA, cropB, corn);
    }
  } else if (grade === 3) {
    // Penjelajah Hutan: Multi-pocket safari vest, canteen, expedition roll pack & magnifying glass
    const safariJacket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.305, 0.28, 0.56, 14),
      vestMat
    );
    safariJacket.position.y = 1.01;
    safariJacket.castShadow = true;
    bodyGroup.add(safariJacket);

    // Side pockets + canteen + explorer magnifying lens on belt
    [-0.14, 0.14].forEach((px) => {
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.15, 0.06), shirtMat);
      pocket.position.set(px, 0.88, 0.28);
      bodyGroup.add(pocket);
    });
    const canteen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 })
    );
    canteen.position.set(0.3, 0.78, 0.06);
    const lensRim = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 8, 14), brassMat);
    lensRim.position.set(-0.29, 0.82, 0.12);
    lensRim.rotation.y = Math.PI / 2;
    const lensGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), cyanGlowMat);
    lensGlass.rotation.z = Math.PI / 2;
    lensGlass.position.set(-0.29, 0.82, 0.12);
    const bandana = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.052, 8, 16), scarfMat);
    bandana.rotation.x = Math.PI / 2;
    bandana.position.y = 1.31;
    bodyGroup.add(canteen, lensRim, lensGlass, bandana);

    if (options.hasBackpack) {
      const pack = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.52, 0.26),
        new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.78 })
      );
      pack.position.set(0, 1.04, -0.34);
      pack.castShadow = true;
      const bedroll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.5, 10),
        scarfMat
      );
      bedroll.rotation.z = Math.PI / 2;
      bedroll.position.set(0, 1.35, -0.34);
      bodyGroup.add(pack, bedroll);
    }
  } else if (grade === 4) {
    // Penjelajah Pulau: Maritime explorer coat + diagonal compass sash + glowing puzzle rune + trailing scarf
    const coat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.305, 0.28, 0.58, 14),
      vestMat
    );
    coat.position.y = 1.01;
    coat.castShadow = true;
    bodyGroup.add(coat);

    // Gold compass badge + glowing cyan puzzle crystal on chest + diagonal strap
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.62, 0.56),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 })
    );
    sash.position.set(0, 1.0, 0);
    sash.rotation.z = 0.55;
    const compass = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12), brassMat);
    compass.rotation.x = Math.PI / 2;
    compass.position.set(0.11, 1.08, 0.29);
    const puzzleCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), cyanGlowMat);
    puzzleCore.position.set(-0.12, 1.13, 0.29);
    bodyGroup.add(sash, compass, puzzleCore);

    // Animated trailing explorer scarf
    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.48), scarfMat);
    scarfTail.position.set(0, 1.24, -0.32);
    scarfTail.rotation.x = -0.3;
    bodyGroup.add(scarfTail);
    extraParts.push(scarfTail);

    if (options.hasBackpack) {
      const seaPack = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.44, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 })
      );
      seaPack.position.set(0, 1.0, -0.31);
      const mapTube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 10), brassMat);
      mapTube.rotation.z = 0.4;
      mapTube.position.set(0, 1.26, -0.35);
      const runeBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), cyanGlowMat);
      runeBeacon.position.set(0, 1.38, -0.34);
      bodyGroup.add(seaPack, mapTube, runeBeacon);
    }
  } else if (grade === 5) {
    // Ilmuwan Muda: Crisp white knee-length flared lab coat + holo chest badge + jet/antenna pack!
    const innerSuit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.285, 0.26, 0.62, 14),
      vestMat
    );
    innerSuit.position.y = 1.0;
    bodyGroup.add(innerSuit);

    // White flared lab coat open at front + lower coat skirt
    const coatBack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.35, 0.78, 14, 1, false, Math.PI * 0.25, Math.PI * 1.5),
      shirtMat
    );
    coatBack.position.y = 0.88;
    coatBack.rotation.y = Math.PI * 0.5;
    coatBack.castShadow = true;
    bodyGroup.add(coatBack);

    // Glowing holographic chest core
    const holoBadge = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), cyanGlowMat);
    holoBadge.position.set(0.13, 1.14, 0.28);
    bodyGroup.add(holoBadge);

    if (options.hasBackpack) {
      const techPack = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.48, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.55 })
      );
      techPack.position.set(0, 1.04, -0.34);
      techPack.castShadow = true;
      bodyGroup.add(techPack);

      [-0.14, 0.14].forEach((tx) => {
        const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 10), cyanGlowMat);
        cell.position.set(tx, 1.04, -0.45);
        bodyGroup.add(cell);
      });

      // Rotating science radar dish on top of backpack
      const dish = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 14), cyanGlowMat);
      dish.position.set(0, 1.42, -0.34);
      bodyGroup.add(dish);
      extraParts.push(dish);
    }
  } else {
    // GRADE 6: Pahlawan Kerajaan — Armored Chestplate, Shoulder Pauldrons, & Flowing Royal Cape!
    const armor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.27, 0.58, 14),
      vestMat
    );
    armor.position.y = 1.02;
    armor.castShadow = true;
    bodyGroup.add(armor);

    // Golden chest trim + glowing crest jewel
    const chestCross = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.08), brassMat);
    chestCross.position.set(0, 1.14, 0.29);
    const crestGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), cyanGlowMat);
    crestGem.position.set(0, 1.14, 0.33);
    bodyGroup.add(chestCross, crestGem);

    // Heroic Shoulder Pauldrons
    [-1, 1].forEach((side) => {
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
        brassMat
      );
      pauldron.position.set(side * 0.38, 1.28, 0);
      pauldron.rotation.z = side * -0.35;
      pauldron.castShadow = true;
      bodyGroup.add(pauldron);
    });

    // Flowing Animated Royal Cape (attached at shoulders!)
    const capePivot = new THREE.Group();
    capePivot.position.set(0, 1.28, -0.26);
    const capeMain = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.92, 0.045),
      new THREE.MeshStandardMaterial({
        color: options.heroStyle === 'sari' ? 0x9333ea : 0xb91c1c,
        roughness: 0.55,
      })
    );
    capeMain.position.set(0, -0.44, -0.05);
    capeMain.rotation.x = 0.14;
    capeMain.castShadow = true;
    const capeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.1, 0.055), brassMat);
    capeTrim.position.set(0, -0.88, -0.11);
    capeTrim.rotation.x = 0.14;
    capePivot.add(capeMain, capeTrim);
    bodyGroup.add(capePivot);
    extraParts.push(capePivot);
  }

  // Belt (shared clean waist anchor)
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.085, 14),
    bootMat
  );
  belt.position.y = 0.74;
  bodyGroup.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.085, 0.06), brassMat);
  buckle.position.set(0, 0.74, 0.27);
  bodyGroup.add(buckle);

  // 3. Arms with Elbow Joints (shoulder pivot y = 1.24, elbow pivot y = -0.21)
  let heldBook: THREE.Group | undefined;
  let heldPencil: THREE.Group | undefined;
  let heldWateringCan: THREE.Group | undefined;
  let heldBasket: THREE.Group | undefined;

  function buildArm(side: -1 | 1): { shoulder: THREE.Group; elbow: THREE.Group } {
    const pivot = new THREE.Group();
    pivot.position.set(side * (grade === 6 ? 0.39 : 0.35), 1.24, 0);

    const sleeve = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 10, 10),
      grade === 5 ? shirtMat : grade === 6 ? vestMat : shirtMat
    );
    sleeve.castShadow = true;
    pivot.add(sleeve);

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.072, 0.12, 6, 10),
      grade === 5 ? shirtMat : skinMat
    );
    upperArm.position.y = -0.12;
    upperArm.castShadow = true;
    pivot.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.21, 0);
    pivot.add(elbow);

    const forearm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.066, 0.11, 6, 10),
      grade === 5 ? shirtMat : skinMat
    );
    forearm.position.y = -0.1;
    forearm.castShadow = true;
    elbow.add(forearm);

    if (grade === 5 && side === 1) {
      const wristPad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.16), cyanGlowMat);
      wristPad.position.y = -0.13;
      elbow.add(wristPad);
    } else if (grade === 6) {
      const gauntlet = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.18, 8), brassMat);
      gauntlet.position.y = -0.11;
      elbow.add(gauntlet);
    }

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 10, 10),
      skinMat
    );
    hand.position.y = -0.22;
    hand.castShadow = true;
    elbow.add(hand);

    if (side === 1) {
      // Held 3D Book (visible during reading state)
      heldBook = new THREE.Group();
      const bCover = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.06, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 })
      );
      const bPages = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.068, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.7 })
      );
      heldBook.add(bCover, bPages);
      heldBook.position.set(-0.14, -0.25, 0.1);
      heldBook.rotation.x = 0.35;
      heldBook.visible = false;
      elbow.add(heldBook);

      // Held 3D Pencil (visible during writing state)
      heldPencil = new THREE.Group();
      const pBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 })
      );
      const pTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.022, 0.06, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
      );
      pTip.position.y = -0.15;
      pTip.rotation.x = Math.PI;
      heldPencil.add(pBody, pTip);
      heldPencil.position.set(0, -0.24, 0.06);
      heldPencil.rotation.x = -0.65;
      heldPencil.visible = false;
      elbow.add(heldPencil);

      // Held 3D Watering Can (visible during watering state)
      heldWateringCan = new THREE.Group();
      const canTank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.12, 0.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 })
      );
      const canSpout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.04, 0.22, 8),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
      );
      canSpout.position.set(0, 0.06, 0.16);
      canSpout.rotation.x = 1.0;
      heldWateringCan.add(canTank, canSpout);
      heldWateringCan.position.set(0, -0.26, 0.14);
      heldWateringCan.visible = false;
      elbow.add(heldWateringCan);

      // Held Small Harvest Basket (optional)
      heldBasket = new THREE.Group();
      const bkBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.1, 0.16, 10),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 })
      );
      heldBasket.add(bkBase);
      heldBasket.position.set(0, -0.28, 0.12);
      heldBasket.visible = false;
      elbow.add(heldBasket);
    }

    return { shoulder: pivot, elbow };
  }

  const leftArmBuilt = buildArm(-1);
  const rightArmBuilt = buildArm(1);
  const leftArm = leftArmBuilt.shoulder;
  const rightArm = rightArmBuilt.shoulder;
  const leftElbow = leftArmBuilt.elbow;
  const rightElbow = rightArmBuilt.elbow;
  bodyGroup.add(leftArm, rightArm);

  // 4. Cartoon Head (Grade 1 has larger cute child head!)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.36, 0);
  if (grade === 1 && !options.isNpc) {
    headGroup.scale.setScalar(1.08);
  }
  bodyGroup.add(headGroup);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.1, 0.12, 10),
    skinMat
  );
  neck.position.y = 0.05;
  headGroup.add(neck);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 20, 18),
    skinMat
  );
  head.position.y = 0.34;
  head.castShadow = true;
  headGroup.add(head);

  const earGeo = new THREE.SphereGeometry(0.07, 10, 10);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.31, 0.33, 0);
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.31, 0.33, 0);
  headGroup.add(leftEar, rightEar);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.048, 10, 10),
    skinMat
  );
  nose.position.set(0, 0.31, 0.31);
  headGroup.add(nose);

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15 });

  [-1, 1].forEach((side) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), whiteMat);
    eyeWhite.scale.set(0.95, 1.15, 0.65);
    eyeWhite.position.set(side * 0.12, 0.38, 0.27);
    headGroup.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), pupilMat);
    pupil.position.set(side * 0.12, 0.38, 0.305);
    headGroup.add(pupil);

    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.022, 0.03), hairMat);
    brow.position.set(side * 0.12, 0.47, 0.28);
    brow.rotation.z = side * -0.08;
    headGroup.add(brow);
  });

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.016, 8, 14, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.23, 0.285);
  headGroup.add(smile);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.335, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.position.set(0, 0.36, -0.02);
  hairCap.rotation.x = -0.22;
  hairCap.castShadow = true;
  headGroup.add(hairCap);

  if (options.heroStyle === 'sari') {
    if (grade === 2 && !options.isNpc) {
      // Twin village braided pigtails with colorful ribbons!
      [-1, 1].forEach((side) => {
        const braid = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.085, 0.26, 6, 10),
          hairMat
        );
        braid.position.set(side * 0.28, 0.18, -0.18);
        braid.rotation.z = side * 0.22;
        braid.castShadow = true;
        const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.024, 6, 12), scarfMat);
        ribbon.position.set(side * 0.25, 0.3, -0.18);
        headGroup.add(braid, ribbon);
      });
    } else {
      const ponytail = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.28, 6, 10),
        hairMat
      );
      ponytail.position.set(0, 0.26, -0.34);
      ponytail.rotation.x = 0.35;
      ponytail.castShadow = true;
      const hairTie = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.03, 6, 12),
        scarfMat
      );
      hairTie.position.set(0, 0.38, -0.31);
      headGroup.add(ponytail, hairTie);
    }
  } else if (grade === 2 && !options.isNpc) {
    // Tousled adventurer front hair bangs peeking out beneath the straw caping
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.12), hairMat);
    bangs.position.set(0, 0.5, 0.28);
    bangs.rotation.z = -0.1;
    headGroup.add(bangs);
  }

  // 5. Grade-Specific Signature Headgear (when accessory isn't overriding head)
  const hasHeadAccessory =
    options.accessory === 'topi-rimba' || options.accessory === 'mahkota-penjaga';

  if (!hasHeadAccessory && (!options.isNpc || options.hasHat || grade >= 1)) {
    if (grade === 1 && !options.isNpc) {
      const g1Subj = options.grade1Subject;
      if (g1Subj === 'seni-budaya') {
        // Artist Beret
        const beret = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.32, 0.14, 16),
          new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.65 })
        );
        beret.position.set(-0.04, 0.6, 0);
        beret.rotation.z = 0.14;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6), scarfMat);
        stem.position.set(-0.06, 0.69, 0);
        headGroup.add(beret, stem);
      } else if (g1Subj === 'pjok') {
        // Sporty Headband!
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.325, 0.055, 8, 18),
          new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 })
        );
        band.rotation.x = Math.PI / 2;
        band.position.set(0, 0.52, 0);
        headGroup.add(band);
      } else if (g1Subj === 'agama' && options.religion === 'islam') {
        if (options.heroStyle === 'sari') {
          const hijab = new THREE.Mesh(
            new THREE.SphereGeometry(0.355, 16, 14),
            new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.72 })
          );
          hijab.position.set(0, 0.36, -0.04);
          headGroup.add(hijab);
        } else {
          const peci = new THREE.Mesh(
            new THREE.CylinderGeometry(0.31, 0.32, 0.22, 16),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
          );
          peci.position.set(0, 0.61, 0);
          headGroup.add(peci);
        }
      } else if (g1Subj === 'agama' && options.religion === 'hindu') {
        const udeng = new THREE.Mesh(
          new THREE.TorusGeometry(0.33, 0.065, 8, 18),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 })
        );
        udeng.rotation.x = Math.PI / 2;
        udeng.position.set(0, 0.55, 0);
        const knot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 6), whiteMat);
        knot.position.set(0, 0.65, 0.26);
        headGroup.add(udeng, knot);
      } else if (g1Subj === 'muatan-lokal') {
        // Regional Iket / Udeng / Blangkon / Feather crown tailored per localRegion
        const iketMat = new THREE.MeshStandardMaterial({ color: colors.hat ?? 0xfef3c7, roughness: 0.68 });
        const iketBand = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.06, 8, 18), iketMat);
        iketBand.rotation.x = Math.PI / 2;
        iketBand.position.set(0, 0.54, 0);
        headGroup.add(iketBand);
        if (options.localRegion === 'papua') {
          [-0.12, 0, 0.12].forEach((fx) => {
            const feather = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.26, 6), scarfMat);
            feather.position.set(fx, 0.72, -0.1);
            headGroup.add(feather);
          });
        } else if (options.localRegion === 'minang') {
          const horn = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.14), brassMat);
          horn.position.set(0, 0.64, 0);
          headGroup.add(horn);
        } else {
          const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.33, 0.16, 14), vestMat);
          capTop.position.set(0, 0.61, 0);
          headGroup.add(capTop);
        }
      } else {
        // Topi Sekolah SD (color adapts to Grade 1 subject world!)
        const capMat = new THREE.MeshStandardMaterial({ color: colors.hat ?? 0xdc2626, roughness: 0.6 });
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.34, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
          capMat
        );
        dome.position.set(0, 0.44, 0);
        const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 14, 1, false, -0.9, 1.8), capMat);
        visor.position.set(0, 0.48, 0.14);
        const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.04), whiteMat);
        emblem.position.set(0, 0.57, 0.32);
        headGroup.add(dome, visor, emblem);
      }
    } else if (grade === 2 && (!options.isNpc || options.hasHat)) {
      // Topi Petani / Caping Jerami Anyaman dengan tali pengikat!
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.88 });
      const caping = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.29, 16), strawMat);
      caping.position.set(0, 0.71, 0);
      caping.castShadow = true;
      const brimRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.022, 6, 20), bootMat);
      brimRing.rotation.x = Math.PI / 2;
      brimRing.position.set(0, 0.57, 0);
      const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.032, 6, 16), scarfMat);
      ribbon.rotation.x = Math.PI / 2;
      ribbon.position.set(0, 0.61, 0);
      headGroup.add(caping, brimRing, ribbon);
    } else if (grade === 3 && (!options.isNpc || options.hasHat)) {
      // Safari / Jungle Ranger Hat
      const rangerMat = new THREE.MeshStandardMaterial({ color: colors.hat ?? 0x78350f, roughness: 0.72 });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.47, 0.04, 16), rangerMat);
      brim.position.set(0, 0.58, 0);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.22, 14), rangerMat);
      crown.position.set(0, 0.68, 0);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.03, 6, 16), brassMat);
      band.rotation.x = Math.PI / 2;
      band.position.set(0, 0.6, 0);
      headGroup.add(brim, crown, band);
    } else if (grade === 4 && (!options.isNpc || options.hasHat)) {
      // Island Navigator / Captain Cap
      const navyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45 });
      const topDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.14, 16), whiteMat);
      topDisc.position.set(0, 0.65, 0);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.09, 16), navyMat);
      band.position.set(0, 0.56, 0);
      const peak = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.035, 0.22), navyMat);
      peak.position.set(0, 0.53, 0.27);
      const badge = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), brassMat);
      badge.position.set(0, 0.62, 0.31);
      headGroup.add(topDisc, band, peak, badge);
    } else if (grade === 5) {
      // Young Scientist Safety Tech Goggles perched on forehead!
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.12, 0.14), bootMat);
      frame.position.set(0, 0.54, 0.26);
      [-0.12, 0.12].forEach((gx) => {
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), cyanGlowMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(gx, 0.54, 0.32);
        headGroup.add(lens);
      });
      headGroup.add(frame);
    } else if (grade === 6) {
      // Royal Hero Golden Circlet + Winged Crest
      const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 8, 20), brassMat);
      circlet.rotation.x = Math.PI / 2;
      circlet.position.set(0, 0.54, 0);
      const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), cyanGlowMat);
      crest.position.set(0, 0.57, 0.34);
      headGroup.add(circlet, crest);
    }
  }

  // 6. Equippable 3D Shop Accessories from Inventaris (always honored cleanly!)
  if (options.accessory === 'topi-rimba') {
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.68 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.46, 0.04, 18), hatMat);
    brim.position.set(0, 0.58, 0);
    brim.castShadow = true;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.2, 16), hatMat);
    crown.position.set(0, 0.68, 0);
    crown.castShadow = true;
    headGroup.add(brim, crown);
  } else if (options.accessory === 'kacamata-ilmu') {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.72,
      roughness: 0.1,
    });
    [-0.11, 0.11].forEach((gx) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.014, 8, 16), frameMat);
      rim.position.set(gx, 0.38, 0.32);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.078, 14), lensMat);
      lens.position.set(gx, 0.38, 0.322);
      headGroup.add(rim, lens);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 0.02), frameMat);
    bridge.position.set(0, 0.39, 0.325);
    headGroup.add(bridge);
  } else if (options.accessory === 'mahkota-penjaga') {
    const goldMat = brassMat;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.27, 0.1, 16), goldMat);
    band.position.set(0, 0.62, 0);
    headGroup.add(band);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 6), goldMat);
      spike.position.set(Math.sin(a) * 0.24, 0.73, Math.cos(a) * 0.24);
      headGroup.add(spike);
    }
    const jewel = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055, 0),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 })
    );
    jewel.position.set(0, 0.64, 0.28);
    headGroup.add(jewel);
  } else if (options.accessory === 'sayap-nusantara') {
    const wingMatA = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
      roughness: 0.35,
    });
    const wingMatB = brassMat;
    [-1, 1].forEach((side) => {
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.06), wingMatA);
      upper.position.set(side * 0.44, 1.18, -0.42);
      upper.rotation.z = side * 0.38;
      upper.rotation.y = side * -0.25;
      upper.castShadow = true;
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.05), wingMatB);
      lower.position.set(side * 0.36, 0.96, -0.41);
      lower.rotation.z = side * 0.18;
      lower.rotation.y = side * -0.25;
      bodyGroup.add(upper, lower);
    });
  }

  // 7. Role-Specific Distinct 3D NPC Outfits, Headgear & Props (zero clone teachers!)
  if (options.isNpc && options.npcRoleStyle) {
    const rs = options.npcRoleStyle;
    const addSpecs = (colorHex = 0x0f172a) => {
      const specMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.65 });
      [-0.11, 0.11].forEach((gx) => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.013, 6, 14), specMat);
        rim.position.set(gx, 0.38, 0.315);
        headGroup.add(rim);
      });
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.016, 0.02), specMat);
      br.position.set(0, 0.385, 0.318);
      headGroup.add(br);
    };

    if (rs === 'teacher') {
      addSpecs(0x0f172a);
      const sash = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.56), scarfMat);
      sash.rotation.z = 0.45;
      sash.position.set(0, 1.0, 0);
      bodyGroup.add(sash);
    } else if (rs === 'librarian') {
      addSpecs(0x0891b2);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), hairMat);
      bun.position.set(0, 0.48, -0.28);
      headGroup.add(bun);
    } else if (rs === 'farmer') {
      const caping = new THREE.Mesh(
        new THREE.ConeGeometry(0.56, 0.28, 16),
        new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.85 })
      );
      caping.position.set(0, 0.7, 0);
      headGroup.add(caping);
    } else if (rs === 'scientist') {
      const goggleFrame = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.11, 0.14), bootMat);
      goggleFrame.position.set(0, 0.54, 0.26);
      [-0.12, 0.12].forEach((gx) => {
        const l = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 12), cyanGlowMat);
        l.rotation.x = Math.PI / 2;
        l.position.set(gx, 0.54, 0.315);
        headGroup.add(l);
      });
      headGroup.add(goggleFrame);
    } else if (rs === 'coach') {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.325, 0.055, 8, 18),
        new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.55 })
      );
      band.rotation.x = Math.PI / 2;
      band.position.set(0, 0.52, 0);
      const whistle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8), brassMat);
      whistle.rotation.z = Math.PI / 2;
      whistle.position.set(0, 1.08, 0.29);
      headGroup.add(band);
      bodyGroup.add(whistle);
    } else if (rs === 'artist') {
      const beret = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.32, 0.14, 16),
        new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.65 })
      );
      beret.position.set(-0.04, 0.6, 0);
      beret.rotation.z = 0.14;
      headGroup.add(beret);
    } else if (rs === 'musician') {
      const feather = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 6), scarfMat);
      feather.position.set(0.18, 0.68, -0.05);
      feather.rotation.z = -0.35;
      headGroup.add(feather);
    } else if (rs === 'merchant') {
      const apron = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.52, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.72 })
      );
      apron.position.set(0, 0.88, 0.27);
      bodyGroup.add(apron);
    } else if (rs === 'sailor') {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.14, 16), whiteMat);
      cap.position.set(0, 0.64, 0);
      headGroup.add(cap);
    } else if (rs === 'royal') {
      const crown = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 18), brassMat);
      crown.rotation.x = Math.PI / 2;
      crown.position.set(0, 0.58, 0);
      headGroup.add(crown);
    } else if (rs === 'explorer') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.46, 0.04, 16), vestMat);
      brim.position.set(0, 0.57, 0);
      const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.2, 14), vestMat);
      cr.position.set(0, 0.67, 0);
      headGroup.add(brim, cr);
    } else if (rs === 'mulok-elder') {
      const iket = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.06, 8, 18), brassMat);
      iket.rotation.x = Math.PI / 2;
      iket.position.set(0, 0.54, 0);
      headGroup.add(iket);
    } else if (rs === 'pancasila-guide') {
      const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), brassMat);
      emblem.position.set(0, 1.12, 0.29);
      bodyGroup.add(emblem);
    } else if (rs === 'agama-islam') {
      const peci = new THREE.Mesh(
        new THREE.CylinderGeometry(0.31, 0.32, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 })
      );
      peci.position.set(0, 0.6, 0);
      headGroup.add(peci);
    } else if (rs === 'agama-hindu') {
      const udeng = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.065, 8, 18), whiteMat);
      udeng.rotation.x = Math.PI / 2;
      udeng.position.set(0, 0.55, 0);
      headGroup.add(udeng);
    } else if (rs === 'agama-katolik') {
      const veil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.38, 0.36, 14, 1, true, Math.PI * 0.65, Math.PI * 1.7),
        new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.72, side: THREE.DoubleSide })
      );
      veil.position.set(0, 0.44, -0.04);
      headGroup.add(veil);
    } else if (rs === 'agama-buddha') {
      const robe = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.58, 0.54),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 })
      );
      robe.rotation.z = 0.5;
      robe.position.set(0, 1.02, 0);
      bodyGroup.add(robe);
    } else if (rs === 'agama-khonghucu') {
      const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), brassMat);
      crest.rotation.x = Math.PI / 2;
      crest.position.set(0, 1.12, 0.28);
      bodyGroup.add(crest);
    }
  }

  // NPC floating quest diamond above head
  let indicator: THREE.Mesh | undefined;
  if (options.isNpc) {
    indicator = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.5,
      })
    );
    indicator.position.set(0, 2.45, 0);
    root.add(indicator);
  }

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftElbow,
    rightElbow,
    leftLeg,
    rightLeg,
    leftKnee,
    rightKnee,
    heldBook,
    heldPencil,
    heldWateringCan,
    heldBasket,
    extraParts,
    gradeStyle: grade,
    indicator,
  };
}

export function createNusantaraHouse(
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture,
  wallHex = 0xfef3c7
): THREE.Group {
  const house = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88 });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.78 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.62 });
  const windowGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });

  // 1. Stone Foundation Plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.7, 5.8), stoneMat);
  plinth.position.y = 0.35;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  house.add(plinth);

  // Front steps
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 0.8), stoneMat);
  step1.position.set(0, 0.125, 3.25);
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 0.45), stoneMat);
  step2.position.set(0, 0.225, 2.95);
  house.add(step1, step2);

  // 2. Main House Body
  const walls = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.8, 4.8), wallMat);
  walls.position.y = 2.1;
  walls.castShadow = true;
  walls.receiveShadow = true;
  house.add(walls);

  // 3. Timber Veranda Pillars (4 corners)
  const pillarPositions = [
    [-2.9, 2.9],
    [2.9, 2.9],
    [-2.9, -2.5],
    [2.9, -2.5],
  ];
  pillarPositions.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.9, 10), woodMat);
    pillar.position.set(px, 2.15, pz);
    pillar.castShadow = true;
    house.add(pillar);
  });

  // 4. Doorway + Windows with shutters
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.14), woodMat);
  door.position.set(0, 1.7, 2.42);
  house.add(door);

  [-1.7, 1.7].forEach((wx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 0.14), woodMat);
    frame.position.set(wx, 2.2, 2.41);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.16), windowGlowMat);
    pane.position.set(wx, 2.2, 2.41);
    house.add(frame, pane);
  });

  // 5. Tiered Joglo Roof (Lower hip + upper pyramid peak)
  const lowerRoof = new THREE.Mesh(
    new THREE.ConeGeometry(5.0, 1.8, 4),
    roofMat
  );
  lowerRoof.position.y = 4.35;
  lowerRoof.rotation.y = Math.PI / 4;
  lowerRoof.castShadow = true;
  lowerRoof.receiveShadow = true;
  house.add(lowerRoof);

  const upperRoof = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, 1.9, 4),
    roofMat
  );
  upperRoof.position.y = 5.45;
  upperRoof.rotation.y = Math.PI / 4;
  upperRoof.castShadow = true;
  house.add(upperRoof);

  // 6. Glowing Porch Lantern
  const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), windowGlowMat);
  lantern.position.set(0.95, 3.1, 2.75);
  house.add(lantern);

  return house;
}

export function createWoodenBridge(woodTex: THREE.CanvasTexture): THREE.Group {
  const bridge = new THREE.Group();
  const plankMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.78 });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88 });

  // Stone abutments at both ends
  [-5.6, 5.6].forEach((bx) => {
    const abutment = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 4.6), stoneMat);
    abutment.position.set(bx, 0.0, 0);
    abutment.receiveShadow = true;
    abutment.castShadow = true;
    bridge.add(abutment);
  });

  // Arched wooden planks (14 planks across 11.4m span)
  const plankCount = 14;
  for (let i = 0; i < plankCount; i++) {
    const t = i / (plankCount - 1);
    const x = -5.2 + t * 10.4;
    const arch = Math.cos((t - 0.5) * Math.PI) * 0.35;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 4.2), plankMat);
    plank.position.set(x, 0.88 + arch, 0);
    plank.castShadow = true;
    plank.receiveShadow = true;
    bridge.add(plank);
  }

  // Handrail posts & rails on both sides (z = ±1.95)
  [-1.95, 1.95].forEach((rz) => {
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const x = -4.8 + t * 9.6;
      const arch = Math.cos((t - 0.5) * Math.PI) * 0.35;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 0.18), postMat);
      post.position.set(x, 1.45 + arch, rz);
      post.castShadow = true;
      bridge.add(post);
    }

    const rail = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.12, 0.14), postMat);
    rail.position.set(0, 2.05, rz);
    rail.castShadow = true;
    bridge.add(rail);
  });

  return bridge;
}

export function createTropicalTree(
  type: 'palm' | 'banyan',
  scale = 1
): THREE.Group {
  const tree = new THREE.Group();

  if (type === 'palm') {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const coconutMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

    // Segmented gently curved trunk
    let curX = 0;
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24 - i * 0.025, 0.28 - i * 0.025, 1.15, 8),
        trunkMat
      );
      curX += i * 0.06;
      seg.position.set(curX, 0.55 + i * 1.05, 0);
      seg.rotation.z = -i * 0.04;
      seg.castShadow = true;
      tree.add(seg);
    }

    const crownY = 5.4;
    // Coconuts
    for (let c = 0; c < 3; c++) {
      const a = (c / 3) * Math.PI * 2;
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), coconutMat);
      nut.position.set(curX + Math.cos(a) * 0.25, crownY - 0.15, Math.sin(a) * 0.25);
      tree.add(nut);
    }

    // 6 radiating palm fronds
    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const frondPivot = new THREE.Group();
      frondPivot.position.set(curX, crownY, 0);
      frondPivot.rotation.y = angle;

      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.7, 5), leafMat);
      frond.rotation.z = -Math.PI * 0.64;
      frond.position.set(1.2, -0.25, 0);
      frond.scale.set(0.35, 1, 1);
      frond.castShadow = true;
      frondPivot.add(frond);
      tree.add(frondPivot);
    }
  } else {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.88 });
    const canopyMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.72 });
    const canopyMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.68 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.55, 3.0, 10), trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);

    const puffs = [
      { x: 0, y: 3.9, z: 0, r: 1.85, mat: canopyMat1 },
      { x: -1.1, y: 3.3, z: 0.6, r: 1.25, mat: canopyMat2 },
      { x: 1.15, y: 3.4, z: -0.5, r: 1.3, mat: canopyMat1 },
      { x: 0.2, y: 4.8, z: 0.3, r: 1.25, mat: canopyMat2 },
    ];
    puffs.forEach((p) => {
      const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(p.r, 1), p.mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      tree.add(mesh);
    });
  }

  tree.scale.setScalar(scale);
  return tree;
}

export function createCollectibleMesh(
  kind: 'coin' | 'scroll' | 'crystal'
): THREE.Group {
  const group = new THREE.Group();

  if (kind === 'coin') {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.35,
      roughness: 0.22,
      metalness: 0.85,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.9,
    });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 20), goldMat);
    disc.rotation.x = Math.PI / 2;
    disc.castShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.06, 8, 20), rimMat);
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), rimMat);
    group.add(disc, ring, star);
  } else if (kind === 'scroll') {
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
      roughness: 0.55,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.45,
      roughness: 0.3,
      metalness: 0.6,
    });
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.85, 14), paperMat);
    roll.rotation.z = Math.PI * 0.25;
    roll.castShadow = true;
    const capA = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 14), capMat);
    capA.position.set(0.32, 0.32, 0);
    capA.rotation.z = Math.PI * 0.25;
    const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 14), capMat);
    capB.position.set(-0.32, -0.32, 0);
    capB.rotation.z = Math.PI * 0.25;
    const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 16), capMat);
    ribbon.rotation.z = Math.PI * 0.25;
    group.add(roll, capA, capB, ribbon);
  } else {
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.3,
    });
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), gemMat);
    gem.scale.set(0.85, 1.35, 0.85);
    gem.castShadow = true;
    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.035, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xa7f3d0, emissive: 0x34d399, emissiveIntensity: 0.5 })
    );
    orbitRing.rotation.x = Math.PI / 3;
    group.add(gem, orbitRing);
  }

  return group;
}

export interface LandmarkBuildResult {
  group: THREE.Group;
  animatedParts: THREE.Object3D[];
  colliderRadius: number;
}

export function createThemedLandmark(
  grade: GradeNumber,
  woodTex: THREE.CanvasTexture,
  roofTex: THREE.CanvasTexture
): LandmarkBuildResult {
  const group = new THREE.Group();
  const animatedParts: THREE.Object3D[] = [];
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.62 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });

  if (grade === 1) {
    // Dunia Huruf dan Angka: Taman Balok Warna-Warni & Gerbang Pelangi
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.4, 24), stoneMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    group.add(base);

    const blockColors = [0xef4444, 0xf59e0b, 0x10b981, 0x0284c7];
    const blockCoords = [
      [-1.3, 0.9, -0.6],
      [1.3, 0.9, -0.6],
      [-0.7, 1.9, 0.4],
      [0.7, 2.2, 0.2],
    ];
    blockCoords.forEach(([bx, by, bz], idx) => {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 1.15, 1.15),
        new THREE.MeshStandardMaterial({ color: blockColors[idx], roughness: 0.45 })
      );
      block.position.set(bx, by, bz);
      block.rotation.y = idx * 0.4;
      block.castShadow = true;
      group.add(block);
    });

    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.24, 10, 28, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xb45309, emissiveIntensity: 0.25, roughness: 0.35 })
    );
    arch.position.y = 2.6;
    arch.castShadow = true;
    group.add(arch);

    const starTop = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.48, 0),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.55 })
    );
    starTop.position.set(0, 5.5, 0);
    group.add(starTop);
    animatedParts.push(starTop);

    return { group, animatedParts, colliderRadius: 3.1 };
  }

  if (grade === 2) {
    // Petualangan Desa Ceria: Pendopo Pasar Desa
    const floor = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 5.4), stoneMat);
    floor.position.y = 0.225;
    floor.receiveShadow = true;
    group.add(floor);

    [
      [-2.6, -2.1],
      [2.6, -2.1],
      [-2.6, 2.1],
      [2.6, 2.1],
    ].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 2.8, 10), woodMat);
      col.position.set(px, 1.8, pz);
      col.castShadow = true;
      group.add(col);
    });

    const pendopoRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 1.9, 4), roofMat);
    pendopoRoof.position.y = 4.1;
    pendopoRoof.rotation.y = Math.PI / 4;
    pendopoRoof.castShadow = true;
    group.add(pendopoRoof);

    // Fruit stall crates
    [0xef4444, 0x22c55e, 0xf59e0b].forEach((cHex, i) => {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.85, 0.9),
        new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.65 })
      );
      crate.position.set(-1.5 + i * 1.5, 0.88, 0.2);
      crate.castShadow = true;
      group.add(crate);
    });

    return { group, animatedParts, colliderRadius: 3.3 };
  }

  if (grade === 3) {
    // Hutan Misteri: Candi Rimba & Pilar Kristal Zamrud
    const mossStone = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.35,
    });

    for (let tier = 0; tier < 3; tier++) {
      const w = 5.2 - tier * 1.3;
      const step = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, w), mossStone);
      step.position.y = 0.4 + tier * 0.8;
      step.castShadow = true;
      step.receiveShadow = true;
      group.add(step);
    }

    const shrineTop = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.2, 4), mossMat);
    shrineTop.position.y = 3.5;
    shrineTop.rotation.y = Math.PI / 4;
    shrineTop.castShadow = true;
    group.add(shrineTop);

    const floatingCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), crystalMat);
    floatingCrystal.position.set(0, 5.2, 0);
    group.add(floatingCrystal);
    animatedParts.push(floatingCrystal);

    return { group, animatedParts, colliderRadius: 2.9 };
  }

  if (grade === 4) {
    // Pulau Teka-Teki: Mercusuar Pesisir & Obelisk
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.9, 0.7, 16), stoneMat);
    base.position.y = 0.35;
    base.receiveShadow = true;
    group.add(base);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.55 });
    for (let seg = 0; seg < 4; seg++) {
      const rBot = 1.65 - seg * 0.2;
      const rTop = 1.45 - seg * 0.2;
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBot, 1.75, 16),
        seg % 2 === 0 ? whiteMat : redMat
      );
      band.position.y = 1.55 + seg * 1.75;
      band.castShadow = true;
      group.add(band);
    }

    const lanternRoom = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 1.1, 14),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      })
    );
    lanternRoom.position.y = 8.1;
    group.add(lanternRoom);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.2, 14), redMat);
    cap.position.y = 9.2;
    group.add(cap);

    const beaconArm = new THREE.Group();
    beaconArm.position.y = 8.1;
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 3.2, 10),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.45 })
    );
    beam.rotation.z = Math.PI / 2;
    beam.position.x = 1.8;
    beaconArm.add(beam);
    group.add(beaconArm);
    animatedParts.push(beaconArm);

    return { group, animatedParts, colliderRadius: 2.6 };
  }

  if (grade === 5) {
    // Laboratorium Ilmuwan Muda: Kincir Angin & Kubah Observatorium
    const labBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.8, 1.2, 18),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 })
    );
    labBase.position.y = 0.6;
    labBase.castShadow = true;
    group.add(labBase);

    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.85, 6.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.2 })
    );
    tower.position.set(0, 4.1, 0);
    tower.castShadow = true;
    group.add(tower);

    const rotor = new THREE.Group();
    rotor.position.set(0, 6.9, 0.55);
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.5, roughness: 0.3 })
    );
    rotor.add(hub);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35 });
    for (let b = 0; b < 3; b++) {
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (b / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.9, 0.08), bladeMat);
      blade.position.y = 1.55;
      blade.castShadow = true;
      bladePivot.add(blade);
      rotor.add(bladePivot);
    }
    group.add(rotor);
    animatedParts.push(rotor);

    return { group, animatedParts, colliderRadius: 2.8 };
  }

  // Grade 6: Kerajaan Penjaga Ilmu — Gapura Kerajaan & Mahkota Emas
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xb45309,
    emissiveIntensity: 0.25,
    roughness: 0.25,
    metalness: 0.78,
  });
  const royalStone = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.65, 3.6), stoneMat);
  plinth.position.y = 0.325;
  plinth.receiveShadow = true;
  group.add(plinth);

  [-2.2, 2.2].forEach((px) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, 4.6, 1.1), royalStone);
    col.position.set(px, 2.9, 0);
    col.castShadow = true;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.2, 4), goldMat);
    cap.position.set(px, 5.8, 0);
    cap.rotation.y = Math.PI / 4;
    cap.castShadow = true;
    group.add(col, cap);
  });

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.85, 1.3), royalStone);
  lintel.position.set(0, 4.9, 0);
  lintel.castShadow = true;
  group.add(lintel);

  const royalOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), goldMat);
  royalOrb.position.set(0, 6.2, 0);
  group.add(royalOrb);
  animatedParts.push(royalOrb);

  return { group, animatedParts, colliderRadius: 3.3 };
}

export function createLabelCanvasTexture(
  title: string,
  subtitle: string,
  bgHex: string,
  fgHex = '#ffffff',
  maxAniso = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Background rounded placard
    ctx.fillStyle = bgHex;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 172, 26);
    ctx.fill();

    // Inner border
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 160, 22);
    ctx.stroke();

    // Title
    ctx.fillStyle = fgHex;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleSize = title.length > 16 ? 34 : title.length > 10 ? 42 : 52;
    ctx.font = `800 ${titleSize}px sans-serif`;
    ctx.fillText(title.slice(0, 24), 256, subtitle ? 74 : 96, 446);

    if (subtitle) {
      ctx.font = '600 26px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(subtitle.slice(0, 30), 256, 134, 446);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, Math.max(1, maxAniso));
  tex.needsUpdate = true;
  return tex;
}

export function createChapterZoneArchMesh(
  zoneTitle: string,
  accentHex: string,
  woodTex: THREE.CanvasTexture,
  maxAniso = 4
): { group: THREE.Group; textures: THREE.CanvasTexture[] } {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const accentNum = Number.parseInt(accentHex.replace('#', ''), 16) || 0x0284c7;
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentNum,
    roughness: 0.38,
    metalness: 0.15,
  });

  // Left & Right pillars
  [-2.35, 2.35].forEach((px) => {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.45, 0.62), accentMat);
    plinth.position.set(px, 0.225, 0);
    plinth.castShadow = true;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.3, 10), woodMat);
    post.position.set(px, 1.9, 0);
    post.castShadow = true;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 4), accentMat);
    cap.position.set(px, 3.7, 0);
    cap.rotation.y = Math.PI / 4;
    group.add(plinth, post, cap);
  });

  // Crossbeam & Readable Banner Signboard
  const beam = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.28, 0.28), woodMat);
  beam.position.set(0, 3.45, 0);
  beam.castShadow = true;
  group.add(beam);

  const tex = createLabelCanvasTexture(zoneTitle, 'Zona Belajar Bab Aktif', accentHex, '#ffffff', maxAniso);
  const signGeo = new THREE.BoxGeometry(3.8, 1.15, 0.14);
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const faceMat = new THREE.MeshBasicMaterial({ map: tex });
  const sign = new THREE.Mesh(signGeo, [
    sideMat,
    sideMat,
    sideMat,
    sideMat,
    faceMat,
    faceMat,
  ]);
  sign.position.set(0, 3.1, 0);
  sign.castShadow = true;
  group.add(sign);

  return { group, textures: [tex] };
}

export interface ChapterStationBuildResult {
  root: THREE.Group;
  signBoard: THREE.Mesh;
  indicator: THREE.Mesh;
  activeVisual?: THREE.Object3D;
  targetRing?: THREE.Mesh;
  textures: THREE.CanvasTexture[];
  colliderRadius: number;
}

export function createChapterStationMesh(
  station: Chapter3DStation,
  maxAniso = 4
): ChapterStationBuildResult {
  const root = new THREE.Group();
  const hexCss = `#${station.colorHex.toString(16).padStart(6, '0')}`;
  const mainMat = new THREE.MeshStandardMaterial({
    color: station.colorHex,
    roughness: 0.42,
    metalness: 0.14,
  });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xb45309,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.65,
  });

  let activeVisual: THREE.Object3D | undefined;
  let colliderRadius = 0.8;
  const extraTextures: THREE.CanvasTexture[] = [];

  if (station.modelKind === 'alphabet-block') {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.2, 16), baseMat);
    pad.position.y = 0.1;
    pad.receiveShadow = true;
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 1.05), mainMat);
    cube.position.y = 0.85;
    cube.rotation.y = 0.35;
    cube.castShadow = true;
    const letterFace = createLabelCanvasTexture(station.label, station.sublabel, hexCss, '#ffffff', maxAniso);
    extraTextures.push(letterFace);
    const faceMat = new THREE.MeshBasicMaterial({ map: letterFace });
    const facePlate = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.56), faceMat);
    facePlate.position.set(0, 0, 0.54);
    cube.add(facePlate);
    root.add(pad, cube);
    activeVisual = cube;
  } else if (station.modelKind === 'number-totem') {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 0.25, 16), baseMat);
    pad.position.y = 0.125;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.45, 12), woodMat);
    post.position.y = 0.9;
    post.castShadow = true;
    root.add(pad, post);
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.36 - r * 0.05, 0.09, 10, 18),
        r === 1 ? goldMat : mainMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.55 + r * 0.36;
      ring.castShadow = true;
      root.add(ring);
    }
    activeVisual = post;
  } else if (station.modelKind === 'fruit-basket') {
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.54, 0.65, 14), woodMat);
    basket.position.y = 0.34;
    basket.castShadow = true;
    root.add(basket);
    const fruitColors = [station.colorHex, 0xfbbf24, 0x22c55e, 0xef4444];
    for (let f = 0; f < 5; f++) {
      const a = (f / 5) * Math.PI * 2;
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 10, 10),
        new THREE.MeshStandardMaterial({ color: fruitColors[f % fruitColors.length], roughness: 0.4 })
      );
      fruit.position.set(
        f === 4 ? 0 : Math.cos(a) * 0.28,
        f === 4 ? 0.82 : 0.66,
        f === 4 ? 0 : Math.sin(a) * 0.28
      );
      fruit.castShadow = true;
      root.add(fruit);
    }
    activeVisual = basket;
  } else if (station.modelKind === 'word-crate') {
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.65, 0.82), woodMat);
    chest.position.y = 0.35;
    chest.castShadow = true;
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.62), mainMat);
    book.position.set(0, 0.78, 0);
    book.rotation.x = -0.25;
    book.castShadow = true;
    const page = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.05, 0.54),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 })
    );
    page.position.y = 0.08;
    book.add(page);
    root.add(chest, book);
    activeVisual = book;
  } else if (station.modelKind === 'fraction-table') {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.78, 10), woodMat);
    leg.position.y = 0.39;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 20), baseMat);
    top.position.y = 0.82;
    top.castShadow = true;
    const pieMain = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.14, 18, 1, false, 0, Math.PI * 1.25), mainMat);
    pieMain.position.y = 0.95;
    const pieGold = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.14, 14, 1, false, Math.PI * 1.28, Math.PI * 0.68), goldMat);
    pieGold.position.set(0.06, 0.97, 0.04);
    root.add(leg, top, pieMain, pieGold);
    activeVisual = pieGold;
  } else if (station.modelKind === 'force-crate') {
    colliderRadius = 0.85;
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.05, 1.25), woodMat);
    crate.position.y = 0.58;
    crate.castShadow = true;
    crate.receiveShadow = true;
    const bandMat = mainMat;
    const bandH = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 1.3), bandMat);
    bandH.position.y = 0.58;
    const skidL = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.1, 0.2), baseMat);
    skidL.position.set(0, 0.05, -0.45);
    const skidR = skidL.clone();
    skidR.position.z = 0.45;
    root.add(crate, bandH, skidL, skidR);
    activeVisual = bandH;
  } else if (station.modelKind === 'organ-pod') {
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.88, 0.35, 16), baseMat);
    plinth.position.y = 0.175;
    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.56, 1.25, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.42,
        roughness: 0.1,
      })
    );
    glass.position.y = 0.95;
    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), mainMat);
    core.position.y = 0.95;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 16), baseMat);
    cap.position.y = 1.62;
    root.add(plinth, glass, core, cap);
    activeVisual = core;
  } else if (station.modelKind === 'circuit-switch') {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.9), baseMat);
    box.position.y = 0.36;
    box.castShadow = true;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: station.colorHex,
        emissiveIntensity: 0.25,
        roughness: 0.25,
      })
    );
    bulb.position.set(-0.28, 0.92, 0);
    const leverPivot = new THREE.Group();
    leverPivot.position.set(0.25, 0.72, 0);
    leverPivot.rotation.z = -0.55;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.62, 8), goldMat);
    stick.position.y = 0.31;
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), mainMat);
    handle.position.y = 0.62;
    leverPivot.add(stick, handle);
    root.add(box, bulb, leverPivot);
    activeVisual = leverPivot;
  } else if (station.modelKind === 'planet-orb') {
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.55, 0.75, 14), baseMat);
    stand.position.y = 0.375;
    const planetGroup = new THREE.Group();
    planetGroup.position.y = 1.25;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 16, 16),
      new THREE.MeshStandardMaterial({
        color: station.colorHex,
        emissive: station.colorHex,
        emissiveIntensity: 0.22,
        roughness: 0.45,
      })
    );
    sphere.castShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 8, 24), goldMat);
    ring.rotation.x = Math.PI * 0.38;
    planetGroup.add(sphere, ring);
    root.add(stand, planetGroup);
    activeVisual = planetGroup;
  } else if (station.modelKind === 'foodchain-pillar') {
    const rock = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.85, 0.72, 8), baseMat);
    rock.position.y = 0.36;
    rock.castShadow = true;
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.85, 6), mainMat);
    leaf.position.y = 1.12;
    leaf.castShadow = true;
    root.add(rock, leaf);
    activeVisual = leaf;
  } else if (station.modelKind === 'royal-gate-lock') {
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.95), baseMat);
    pedestal.position.y = 0.45;
    pedestal.castShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 10, 20), goldMat);
    ring.position.y = 1.32;
    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), mainMat);
    jewel.position.y = 1.32;
    root.add(pedestal, ring, jewel);
    activeVisual = ring;
  } else {
    // book-pedestal
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 0.88, 10), woodMat);
    pillar.position.y = 0.44;
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.14, 0.72), mainMat);
    desk.position.y = 0.92;
    desk.rotation.x = -0.22;
    const openPage = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.08, 0.56),
      new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.7 })
    );
    openPage.position.y = 0.1;
    desk.add(openPage);
    root.add(pillar, desk);
    activeVisual = desk;
  }

  // Crisp readable billboard signboard above the 3D station
  const labelTex = createLabelCanvasTexture(station.label, station.sublabel, hexCss, '#ffffff', maxAniso);
  const signGeo = new THREE.PlaneGeometry(1.9, 0.72);
  const signMat = new THREE.MeshBasicMaterial({
    map: labelTex,
    side: THREE.DoubleSide,
  });
  const signBoard = new THREE.Mesh(signGeo, signMat);
  signBoard.position.y = 2.35;
  root.add(signBoard);

  // Floating status diamond above signboard
  const indicator = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.2, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    })
  );
  indicator.position.y = 2.95;
  root.add(indicator);

  let targetRing: THREE.Mesh | undefined;
  if (station.actionType === 'push') {
    const ringGeo = new THREE.RingGeometry(1.05, 1.35, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    targetRing = new THREE.Mesh(ringGeo, ringMat);
  }

  return {
    root,
    signBoard,
    indicator,
    activeVisual,
    targetRing,
    textures: [labelTex, ...extraTextures],
    colliderRadius,
  };
}


