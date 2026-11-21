// Mathematical terrain, river, road, bridge, and collider definitions for Pulau Petualangan Nusantara

export const ISLAND_RADIUS = 72;
export const GRADE1_WORLD_RADIUS = 108;
export const WATER_LEVEL = -0.35;

export function getIslandRadius(grade = 1): number {
  return grade === 1 ? GRADE1_WORLD_RADIUS : ISLAND_RADIUS;
}

export interface BridgeBounds {
  centerX: number;
  centerZ: number;
  halfWidthX: number;
  halfLengthZ: number;
  deckHeight: number;
}

// Main wooden bridge spanning the river along the village road at (x=8.5, z=1.5) for Grades 1, 3–6
export const MAIN_BRIDGE: BridgeBounds = {
  centerX: 8.5,
  centerZ: 1.5,
  halfWidthX: 6.0,
  halfLengthZ: 2.3,
  deckHeight: 0.92,
};

// Dedicated North-South wooden & bamboo bridge for Grade 2 Desa Ceria across the East-West river
export const GRADE2_BRIDGE: BridgeBounds = {
  centerX: 0,
  centerZ: -2.0,
  halfWidthX: 2.4,
  halfLengthZ: 6.2,
  deckHeight: 0.96,
};

// Dedicated rustic timber-rope bridge for Grade 3 Hutan Misteri
export const GRADE3_BRIDGE: BridgeBounds = {
  centerX: 2.0,
  centerZ: 0.0,
  halfWidthX: 5.8,
  halfLengthZ: 2.2,
  deckHeight: 0.96,
};

// Dedicated Mechanical Drawbridge (Jembatan Mekanik) for Grade 4 Pulau Teka-Teki
export const GRADE4_BRIDGE: BridgeBounds = {
  centerX: 4.0,
  centerZ: 0.0,
  halfWidthX: 6.4,
  halfLengthZ: 2.3,
  deckHeight: 1.0,
};

export function getBridgeBounds(grade = 1): BridgeBounds {
  if (grade === 2) return GRADE2_BRIDGE;
  if (grade === 3) return GRADE3_BRIDGE;
  if (grade === 4) return GRADE4_BRIDGE;
  return MAIN_BRIDGE;
}

// River center X as a smooth S-curve passing cleanly through x=8.5 at z=1.5 (Grades 1, 5–6)
export function getRiverCenterX(z: number): number {
  return 8.5 + Math.sin((z - 1.5) * 0.075) * 6.5;
}

export function getRiverHalfWidth(z: number): number {
  return 3.3 + Math.sin((z - 1.5) * 0.11) * 0.45;
}

// Grade 2 Desa Ceria East-West river flowing through z = -2.0 at x = 0
export function getGrade2RiverCenterZ(x: number): number {
  return -2.0 + Math.sin(x * 0.065) * 4.2;
}

export function getGrade2RiverHalfWidth(x: number): number {
  return 3.1 + Math.cos(x * 0.1) * 0.38;
}

// Grade 3 Hutan Misteri winding jungle river passing under GRADE3_BRIDGE at (2, 0)
export function getGrade3RiverCenterX(z: number): number {
  return 2.0 + Math.sin(z * 0.068) * 4.2;
}

export function getGrade3RiverHalfWidth(z: number): number {
  return 2.9 + Math.cos(z * 0.09) * 0.4;
}

// Grade 4 Pulau Teka-Teki archipelago channel between Western & Eastern puzzle islands
export function getGrade4ChannelCenterX(z: number): number {
  return 4.0 + Math.sin(z * 0.05) * 1.4;
}

export function getGrade4ChannelHalfWidth(z: number): number {
  return 3.7 + Math.cos(z * 0.08) * 0.35;
}

export function getRoadCenterZ(x: number): number {
  return 1.5 + Math.sin((x - 8.5) * 0.075) * 4.5;
}

export function isOnBridge(
  x: number,
  z: number,
  grade = 1,
  bridgeExtended = true
): boolean {
  if (grade === 4 && !bridgeExtended) return false;
  const b = getBridgeBounds(grade);
  return (
    Math.abs(x - b.centerX) <= b.halfWidthX &&
    Math.abs(z - b.centerZ) <= b.halfLengthZ
  );
}

// Pantai dan Laut wooden pier extending out over shallow clear ocean at SE coast
export const GRADE1_PIER = {
  minX: 44,
  maxX: 50,
  minZ: 46,
  maxZ: 60,
  deckHeight: 0.72,
};

export function isOnGrade1Pier(x: number, z: number, grade = 1): boolean {
  if (grade !== 1) return false;
  return (
    x >= GRADE1_PIER.minX &&
    x <= GRADE1_PIER.maxX &&
    z >= GRADE1_PIER.minZ &&
    z <= GRADE1_PIER.maxZ
  );
}

// Raw ground terrain height (without bridge deck)
export function getRawTerrainHeight(x: number, z: number, grade = 1): number {
  const dist = Math.hypot(x, z);
  const islandRad = getIslandRadius(grade);

  // Island outer falloff into the sea
  const edgeFactor = Math.max(0, Math.min(1, (islandRad - dist) / 14));
  const smoothEdge = edgeFactor * edgeFactor * (3 - 2 * edgeFactor);

  if (grade === 1) {
    // Grade 1 Open World: 7 connected regions on a lush 108m Nusantara island
    const hillRimNE = Math.exp(-((x - 62) ** 2 + (z + 52) ** 2) / 260) * 6.8;
    const hillRimNW = Math.exp(-((x + 68) ** 2 + (z + 52) ** 2) / 260) * 5.8;
    const hillRimEast = Math.exp(-((x - 74) ** 2 + (z - 4) ** 2) / 220) * 2.2;
    const gentleUndulation =
      (Math.sin(x * 0.05) * Math.cos(z * 0.05) +
        Math.sin((x + z) * 0.03) * 0.45) *
      0.55;

    // Flatten all 7 Grade 1 regions & existing central playground so buildings & stations sit cleanly
    const inDesaCeria = Math.hypot(x + 15, z - 4) < 19;
    const inKebun = Math.hypot(x + 48, z + 28) < 18;
    const inKotaSekolah = Math.hypot(x + 22, z + 44) < 20;
    const inPasar = Math.hypot(x + 42, z - 40) < 18;
    const inHutan = Math.hypot(x - 46, z + 38) < 18;
    const inKerajaan = Math.hypot(x - 48, z - 2) < 18;
    const inPantaiPlaza = Math.hypot(x - 44, z - 36) < 15;
    const inLabIlmuwan = Math.hypot(x - 28, z - 22) < 15.5;
    const inCentralSlots = x > -26 && x < 34 && z > -28 && z < 18;
    const flatFactor =
      inDesaCeria ||
      inKebun ||
      inKotaSekolah ||
      inPasar ||
      inHutan ||
      inKerajaan ||
      inPantaiPlaza ||
      inLabIlmuwan ||
      inCentralSlots
        ? 0.12
        : 1.0;

    let h1 = 0.52 + (hillRimNE + hillRimNW + hillRimEast + gentleUndulation) * flatFactor;

    // Gentle sandy cove slope at Pantai dan Laut (SE bay beyond z > 46 & x > 36)
    if (x > 34 && z > 43) {
      const bayDepth = Math.min(1, Math.max(0, (z - 44) / 14));
      h1 = h1 * (1 - bayDepth) + -1.1 * bayDepth;
    }

    // Carve winding river channel passing cleanly under MAIN_BRIDGE (8.5, 1.5)
    const rx = getRiverCenterX(z);
    const rw = getRiverHalfWidth(z);
    const riverDist = Math.abs(x - rx);
    if (riverDist < rw + 2.5) {
      const t = Math.max(0, 1 - riverDist / (rw + 2.5));
      const smoothT = t * t * (3 - 2 * t);
      h1 = h1 * (1 - smoothT) + -1.25 * smoothT;
    }

    const seaFloor = -2.8;
    return seaFloor + (h1 - seaFloor) * smoothEdge;
  }

  if (grade === 2) {
    // Grade 2: Fertile golden river valley with flat South Village & North Farm/Craft plateau
    const rimHillNE = Math.exp(-((x - 42) ** 2 + (z + 40) ** 2) / 220) * 6.8;
    const rimHillNW = Math.exp(-((x + 44) ** 2 + (z + 38) ** 2) / 220) * 6.0;
    const rimHillSE = Math.exp(-((x - 44) ** 2 + (z - 38) ** 2) / 220) * 5.2;
    const gentle =
      Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.28 +
      (z < -26 ? Math.min(1.6, (-26 - z) * 0.12) : 0);

    // Flatten core South Village & North Farm zones so crops, barns & houses sit cleanly
    const inSouthVillage = x > -34 && x < 32 && z > 6 && z < 30;
    const inNorthPlateau = x > -34 && x < 32 && z > -36 && z < -9;
    const flatFactor = inSouthVillage || inNorthPlateau ? 0.18 : 1.0;

    let h2 = 0.56 + (rimHillNE + rimHillNW + rimHillSE + gentle) * flatFactor;

    // Carve East-West Desa Ceria river channel
    const rz = getGrade2RiverCenterZ(x);
    const rw = getGrade2RiverHalfWidth(x);
    const riverDist = Math.abs(z - rz);
    if (riverDist < rw + 2.4) {
      const t = Math.max(0, 1 - riverDist / (rw + 2.4));
      const smoothT = t * t * (3 - 2 * t);
      h2 = h2 * (1 - smoothT) + -1.2 * smoothT;
    }

    const seaFloor = -2.8;
    return seaFloor + (h2 - seaFloor) * smoothEdge;
  }

  if (grade === 3) {
    // Grade 3: Hutan Misteri — lush forest ridges, Waterfall cliff (NE), Cave rock (NW), flat Kuil terrace (SE)
    const waterfallCliff =
      Math.exp(-((x - 32) ** 2 + (z + 25) ** 2) / 68) * 8.6;
    const caveRidge =
      Math.exp(-((x + 28) ** 2 + (z + 32) ** 2) / 90) * 6.2;
    const westRidge =
      Math.exp(-((x + 42) ** 2 + (z - 4) ** 2) / 140) * 4.5;
    const gentle =
      Math.sin(x * 0.06) * Math.cos(z * 0.06) * 0.55 +
      Math.sin((x - z) * 0.04) * 0.35;

    // Flatten play clearings (Desa Tepi Hutan, Hutan Tropis, Lab Alam, Kuil Pengetahuan, Air Terjun shore)
    const inVillage = Math.hypot(x + 16, z - 14) < 12;
    const inLab = Math.hypot(x - 18, z - 12) < 10;
    const inKuil = Math.hypot(x - 22, z - 26) < 10;
    const inFallsShore = Math.hypot(x - 20, z + 15) < 7.5;
    const flatFactor = inVillage || inLab || inKuil || inFallsShore ? 0.15 : 1.0;

    let h3 = 0.58 + (waterfallCliff + caveRidge + westRidge + gentle) * flatFactor;

    // Small waterfall plunge pool right at (26, -20)
    const poolDist = Math.hypot(x - 26, z + 20);
    if (poolDist < 4.5) {
      const pt = Math.max(0, 1 - poolDist / 4.5);
      h3 = h3 * (1 - pt * pt) + -1.0 * (pt * pt);
    }

    // Carve winding jungle river along GRADE3_BRIDGE (x ≈ 2)
    const rx = getGrade3RiverCenterX(z);
    const rw = getGrade3RiverHalfWidth(z);
    const rDist = Math.abs(x - rx);
    if (rDist < rw + 2.4) {
      const t = Math.max(0, 1 - rDist / (rw + 2.4));
      const smoothT = t * t * (3 - 2 * t);
      h3 = h3 * (1 - smoothT) + -1.25 * smoothT;
    }

    const seaFloor = -2.8;
    return seaFloor + (h3 - seaFloor) * smoothEdge;
  }

  if (grade === 4) {
    // Grade 4: Pulau Teka-Teki — Dual-Archipelago separated by channel at x ≈ 4, flat puzzle arenas + high Istana terrace
    const mazePlateau = Math.hypot(x + 22, z + 18) < 13 ? 0.85 : 0;
    const crystalHill = Math.exp(-((x - 32) ** 2 + (z - 22) ** 2) / 140) * 4.4;
    const istanaTerrace = Math.exp(-((x - 32) ** 2 + (z + 26) ** 2) / 160) * 2.4;
    const rimNW = Math.exp(-((x + 42) ** 2 + (z + 36) ** 2) / 180) * 5.2;
    const gentle = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.35;

    // Flatten key puzzle arenas so walls, doors, pedestals & bridges sit level
    const inMaze = Math.abs(x + 22) < 11.5 && Math.abs(z + 18) < 11.5;
    const inMain = Math.hypot(x + 14, z - 10) < 11;
    const inPattern = Math.hypot(x + 24, z - 24) < 11;
    const inCave = Math.hypot(x - 20, z - 16) < 10;
    const inTower = Math.hypot(x - 24, z + 2) < 9.5;
    const inTemple = Math.hypot(x - 18, z + 24) < 10;
    const inIstana = Math.hypot(x - 32, z + 26) < 11;
    const flatFactor =
      inMaze || inMain || inPattern || inCave || inTower || inTemple || inIstana
        ? 0.14
        : 1.0;

    let h4 = 0.62 + mazePlateau + (crystalHill + istanaTerrace + rimNW + gentle) * flatFactor;

    // Carve deep archipelago channel separating West & East islands at x ≈ 4
    const cx = getGrade4ChannelCenterX(z);
    const cw = getGrade4ChannelHalfWidth(z);
    const cDist = Math.abs(x - cx);
    if (cDist < cw + 2.6) {
      const t = Math.max(0, 1 - cDist / (cw + 2.6));
      const smoothT = t * t * (3 - 2 * t);
      h4 = h4 * (1 - smoothT) + -1.45 * smoothT;
    }

    const seaFloor = -2.8;
    return seaFloor + (h4 - seaFloor) * smoothEdge;
  }

  // Rolling hills (Bukit Barat Daya, Bukit Timur Laut, Bukit Utara) for Grades 1, 5, 6
  const hillNE =
    Math.exp(-((x - 32) ** 2 + (z + 28) ** 2) / 260) * 7.8;
  const hillNW =
    Math.exp(-((x + 34) ** 2 + (z + 24) ** 2) / 220) * 6.4;
  const hillSE =
    Math.exp(-((x - 35) ** 2 + (z - 28) ** 2) / 210) * 5.2;
  const gentleUndulation =
    (Math.sin(x * 0.065) * Math.cos(z * 0.065) +
      Math.sin((x + z) * 0.04) * 0.6) *
    0.75;

  // Flatten central village plaza around (-10, 4) for houses & spawn
  const plazaDist = Math.hypot(x + 12, z - 4);
  const plazaFlat = Math.min(1, Math.max(0, (plazaDist - 8) / 10));

  let h =
    0.45 +
    (hillNE + hillNW + hillSE + gentleUndulation) * plazaFlat;

  // Carve winding river channel
  const rx = getRiverCenterX(z);
  const rw = getRiverHalfWidth(z);
  const riverDist = Math.abs(x - rx);
  if (riverDist < rw + 2.5) {
    const t = Math.max(0, 1 - riverDist / (rw + 2.5));
    const smoothT = t * t * (3 - 2 * t);
    h = h * (1 - smoothT) + -1.25 * smoothT;
  }

  // Blend down below ocean water near island shoreline
  const seaFloor = -2.8;
  return seaFloor + (h - seaFloor) * smoothEdge;
}

// Effective walkable ground height (includes bridge deck and Grade 1 beach pier!)
export function getWalkableHeight(
  x: number,
  z: number,
  grade = 1,
  bridgeExtended = true
): number {
  const raw = getRawTerrainHeight(x, z, grade);
  if (isOnBridge(x, z, grade, bridgeExtended)) {
    const b = getBridgeBounds(grade);
    const ratio =
      grade === 2
        ? Math.abs(z - b.centerZ) / b.halfLengthZ
        : Math.abs(x - b.centerX) / b.halfWidthX;
    // Slight arch in middle of bridge
    const arch = Math.cos(ratio * (Math.PI * 0.5)) * 0.35;
    return Math.max(raw, b.deckHeight + arch);
  }
  if (isOnGrade1Pier(x, z, grade)) {
    return Math.max(raw, GRADE1_PIER.deckHeight);
  }
  return raw;
}

export function isInDeepWater(
  x: number,
  z: number,
  grade = 1,
  bridgeExtended = true
): boolean {
  if (isOnBridge(x, z, grade, bridgeExtended)) return false;
  if (isOnGrade1Pier(x, z, grade)) return false;
  return getRawTerrainHeight(x, z, grade) < WATER_LEVEL - 0.15;
}

export function isOnRoad(x: number, z: number, grade = 1): boolean {
  if (grade === 2) {
    // North-South main avenue over the bridge & into Taman Geometri
    const mainNS = Math.abs(x) < 2.0 && z > -31 && z < 25;
    // South Village avenue (Desa Bilangan <-> Pasar <-> Kebun & Sawah)
    const southAve = Math.abs(z - 13.5) < 2.0 && x > -30 && x < 26;
    // North Farm/Workshop avenue (Peternakan <-> Gudang <-> Dapur <-> Bengkel)
    const northAve = Math.abs(z + 16.5) < 2.0 && x > -30 && x < 28;
    return mainNS || southAve || northAve;
  }

  if (grade === 3) {
    // West-East forest trail across Jembatan Kayu (z = 0)
    const eastWest = Math.abs(z) < 2.0 && x > -26 && x < 26;
    // West trail: Kebun <-> Desa Tepi Hutan <-> Hutan Tropis <-> Gua Misterius
    const westTrail = Math.abs(x + 18) < 2.0 && z > -30 && z < 26;
    // East trail: Air Terjun <-> Lab Alam <-> Kuil Pengetahuan
    const eastTrail = Math.abs(x - 19) < 2.0 && z > -18 && z < 27;
    return eastWest || westTrail || eastTrail;
  }

  if (grade === 4) {
    // West island plaza avenue (Hutan Pola <-> Pulau Utama <-> Jembatan Mekanik <-> Labirin Angka)
    const westHub = Math.abs(z) < 2.0 && x > -24 && x < -1.5;
    const westNS = Math.abs(x + 14) < 2.0 && z > -20 && z < 26;
    // East island stone avenue (Jembatan Mekanik <-> Menara Logika <-> Gua Kristal & Kuil Teka-Teki <-> Istana)
    const eastHub = Math.abs(z) < 2.0 && x > 9.5 && x < 25;
    const eastNS = Math.abs(x - 20) < 2.0 && z > -26 && z < 20;
    const istanaPath = Math.abs(z + 25) < 2.0 && x > 18 && x < 34;
    return westHub || westNS || eastHub || eastNS || istanaPath;
  }

  if (grade === 1) {
    const rz = getRoadCenterZ(x);
    const mainRoad = Math.abs(z - rz) < 2.25 && x > -50 && x < 54;
    // West north-south artery linking Pasar Sahabat <-> Desa Ceria <-> Kota Sekolah
    const westArtery = Math.abs(x + 22) < 2.0 && z > -46 && z < 40;
    // Kebun Pengetahuan spur from Kota Sekolah (-22, -32) west to (-48, -28)
    const kebunSpur = Math.abs(z + 30) < 1.9 && x > -50 && x < -20;
    // Pasar Sahabat spur south-west (-22, 40) <-> (-44, 40)
    const pasarSpur = Math.abs(z - 40) < 1.9 && x > -46 && x < -20;
    // East north-south avenue linking Hutan Misteri (44,-38) <-> Kerajaan Ilmu (44,2) <-> Pantai (44,40)
    const eastArtery = Math.abs(x - 42) < 2.0 && z > -40 && z < 42;
    // Laboratorium Ilmuwan Muda spur connecting eastArtery (42, 22) west to Lab entrance (27, 22)
    const labSpur = x >= 27 && x <= 42 && Math.abs(z - 22) < 2.1;
    return mainRoad || westArtery || kebunSpur || pasarSpur || eastArtery || labSpur;
  }

  const rz = getRoadCenterZ(x);
  const mainRoad = Math.abs(z - rz) < 2.25 && Math.hypot(x, z) < 52;
  // Branch path going north toward Bukit Ilmu
  const northBranch =
    Math.abs(x + 12) < 1.9 && z < 4 && z > -28;
  // Branch path east toward Bukit Timur
  const eastBranch =
    Math.abs(z + 18) < 1.8 && x > 14 && x < 34;
  return mainRoad || northBranch || eastBranch;
}

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
}

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
