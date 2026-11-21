import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createContactShadowTexture,
  createGrassDetailTexture,
  createRoofTileTexture,
  createWoodTexture,
} from './materials';
import {
  Chapter3DMissionConfig,
  Chapter3DStation,
} from './chapterWorldAdapter';
import {
  CharacterRig,
  createCartoonCharacter,
  createChapterStationMesh,
  createChapterZoneArchMesh,
  createCollectibleMesh,
  createThemedLandmark,
  createWoodenBridge,
  getHeroColors,
} from './models';
import {
  AnimatedCreature,
  createChapterDecorProp,
  createGradeBuilding,
  createGradeCreature,
  createGradeTree,
  updateCreatures,
} from './worldVisuals';
import {
  BoxCollider,
  CircleCollider,
  getBridgeBounds,
  getGrade2RiverCenterZ,
  getGrade2RiverHalfWidth,
  getGrade3RiverCenterX,
  getGrade3RiverHalfWidth,
  getGrade4ChannelCenterX,
  getGrade4ChannelHalfWidth,
  getIslandRadius,
  getRawTerrainHeight,
  getRiverCenterX,
  getRiverHalfWidth,
  getRoadCenterZ,
  getWalkableHeight,
  isInDeepWater,
  isOnBridge,
  isOnGrade1Pier,
  isOnRoad,
  ISLAND_RADIUS,
  WATER_LEVEL,
} from './terrain';
import { NpcDefinition } from './worldData';
import { WorldTheme3D } from './curriculumData';
import {
  Accessory3DId,
  HeroStyleId,
  LocalRegionId,
  ReligionId,
  SubjectId,
} from './inventoryData';
import { sound3d } from './sound3d';
import {
  createInitialGrade1Bag,
  findGrade1RegionAt,
  GRADE1_OPEN_WORLD_REGIONS,
  Grade1BagState,
  Grade1LabKind,
  Grade1RegionId,
} from './grade1SubjectWorlds';
import {
  buildGrade1World,
  createCarriedItemMesh,
  Grade1ActivePickup,
  Grade1TargetPedestal,
  Grade1WorldRuntime,
} from './grade1World';
import { Grade1InteractiveNode } from './grade1WorldBuilders';
import {
  buildGrade1InteriorRoom,
  Grade1InteriorId,
  Grade1InteriorRuntime,
} from './grade1Interiors';
import { Grade1DoorTrigger } from './grade1OpenWorldLayout';
import {
  applyCharacterPose,
  CharacterAnimState,
  Grade1SeatSpot,
} from './characterAnimation';
import {
  buildGrade2World,
  CropType,
  Grade2InteractiveNode,
  Grade2SimState,
  Grade2WorldRuntime,
  loadGrade2SimState,
  saveGrade2SimState,
} from './grade2World';
import {
  buildGrade3World,
  Grade3ExpState,
  Grade3InteractiveNode,
  Grade3WorldRuntime,
  loadGrade3ExpState,
  saveGrade3ExpState,
} from './grade3World';
import {
  buildGrade4World,
  createCarriedCrystalMesh,
  Grade4InteractiveNode,
  Grade4PuzzleState,
  Grade4WorldRuntime,
  loadGrade4PuzzleState,
  saveGrade4PuzzleState,
} from './grade4World';

export interface Grade1WorldContext {
  subjectId: SubjectId;
  chapterId: string;
  religion: ReligionId;
  localRegion: LocalRegionId;
  savedArtworks?: Array<{ id: string; title: string; dataUrl: string }>;
}

export interface WorldEngineConfig {
  theme: WorldTheme3D;
  heroStyle: HeroStyleId;
  equippedAccessory: Accessory3DId;
  chapterMission?: Chapter3DMissionConfig;
  grade1Context?: Grade1WorldContext;
}

export type PlayerMotionState = 'Diam' | 'Berjalan' | 'Berlari' | 'Melompat';

export interface Grade1HudCarried {
  id: string;
  name: string;
  shortLabel: string;
  targetZoneId: string;
  targetLabel: string;
}

export interface Grade1NearbyAction {
  kind:
    | 'pickup'
    | 'use'
    | 'swing'
    | 'custom-node'
    | 'enter-door'
    | 'exit-door'
    | 'sit-seat'
    | 'stand-up';
  label: string;
  dist: number;
  targetId?: string;
}

export interface Grade1WorldEvent {
  type:
    | 'pickup'
    | 'use'
    | 'number-pad'
    | 'number-sequence'
    | 'trampoline'
    | 'swing'
    | 'custom-interact'
    | 'open-lab'
    | 'predator-alert'
    | 'enter-interior'
    | 'exit-interior'
    | 'discover-region'
    | 'sit-seat'
    | 'stand-up'
    | 'pose';
  message: string;
  rewardCoins: number;
  rewardScore: number;
  rewardXp: number;
  completedPickupId?: string;
  numberPadCount?: number;
  openLabKind?: Grade1LabKind;
  bagState?: Grade1BagState;
  interiorId?: Grade1InteriorId;
  regionId?: Grade1RegionId;
}

export interface Grade2NearbyAction {
  id: string;
  kind: Grade2InteractiveNode['kind'];
  label: string;
  dist: number;
}

export interface Grade2WorldEvent {
  type: 'sim' | 'open-market';
  message: string;
  rewardCoins: number;
  rewardScore: number;
  rewardXp: number;
  simState: Grade2SimState;
}

export interface Grade3NearbyAction {
  id: string;
  kind: Grade3InteractiveNode['kind'];
  bab: number;
  label: string;
  dist: number;
}

export interface Grade3WorldEvent {
  type: 'explore' | 'open-challenge' | 'open-kuil-exam';
  bab: number;
  message: string;
  rewardCoins: number;
  rewardScore: number;
  rewardXp: number;
  expState: Grade3ExpState;
}

export interface Grade4NearbyAction {
  id: string;
  kind: Grade4InteractiveNode['kind'];
  bab: number;
  label: string;
  dist: number;
}

export interface Grade4WorldEvent {
  type: 'puzzle' | 'open-puzzle' | 'open-istana-exam';
  bab: number;
  message: string;
  rewardCoins: number;
  rewardScore: number;
  rewardXp: number;
  puzzleState: Grade4PuzzleState;
  carriedCrystalLabel?: string | null;
}

export interface EngineCallbacks {
  onHudTick: (data: {
    motionState: PlayerMotionState;
    nearbyNpc: NpcDefinition | null;
    nearbyStation: Chapter3DStation | null;
    crossedBridge: boolean;
    playerPos: { x: number; y: number; z: number };
    carriedItem?: Grade1HudCarried | null;
    nearbyGrade1Action?: Grade1NearbyAction | null;
    grade1Bag?: Grade1BagState | null;
    nearbyGrade2Node?: Grade2NearbyAction | null;
    nearbyGrade3Node?: Grade3NearbyAction | null;
    nearbyGrade4Node?: Grade4NearbyAction | null;
    carriedCrystalLabel?: string | null;
    currentRegionId?: Grade1RegionId;
    currentRegionName?: string;
    activeInteriorId?: Grade1InteriorId | null;
    activeInteriorName?: string | null;
    isSeated?: boolean;
    activeSeatLabel?: string | null;
    activeSeatContext?: Grade1SeatSpot['locationContext'] | null;
    activePoseState?: CharacterAnimState;
  }) => void;
  onCollectItem: (item: {
    id: string;
    kind: 'coin' | 'scroll' | 'crystal';
    valueCoins: number;
    valueScore: number;
  }) => void;
  onStationCompleted?: (station: Chapter3DStation) => void;
  onGrade1Event?: (event: Grade1WorldEvent) => void;
  onGrade2Event?: (event: Grade2WorldEvent) => void;
  onGrade3Event?: (event: Grade3WorldEvent) => void;
  onGrade4Event?: (event: Grade4WorldEvent) => void;
  onOpenNpc: (npc: NpcDefinition) => void;
  onContextLost?: (lost: boolean) => void;
}

interface ActiveCollectible {
  id: string;
  kind: 'coin' | 'scroll' | 'crystal';
  valueCoins: number;
  valueScore: number;
  x: number;
  y: number;
  z: number;
  mesh: THREE.Group;
  collected: boolean;
}

interface ActiveChapterStation {
  def: Chapter3DStation;
  root: THREE.Group;
  signBoard: THREE.Mesh;
  indicator: THREE.Mesh;
  activeVisual?: THREE.Object3D;
  targetRing?: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetZ: number;
  colliderRadius: number;
  completed: boolean;
  pushDustCooldown: number;
}

interface ActiveNpc {
  def: NpcDefinition;
  rig: CharacterRig;
}

interface DustParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _camTarget = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();
const _tempColor = new THREE.Color();

export class WorldEngine {
  private container: HTMLElement;
  private config: WorldEngineConfig;
  private callbacks: EngineCallbacks;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private sunLight!: THREE.DirectionalLight;
  private waterMesh!: THREE.Mesh;
  private contactShadow!: THREE.Mesh;
  private hero!: CharacterRig;
  private landmarkParts: THREE.Object3D[] = [];

  private isSoftwareGl = false;
  private disposed = false;
  private frameId = 0;
  private clock = new THREE.Clock();

  // Player physics state
  private playerPos = new THREE.Vector3(-13.5, 0, 4.5);
  private playerVelY = 0;
  private playerYaw = Math.PI * 0.45;
  private onGround = true;
  private walkCycle = 0;
  private landSquash = 0;
  private footstepTimer = 0;
  private bridgeCrossed = false;

  // Camera orbit state
  private camYaw = -Math.PI * 0.45;
  private camPitch = 0.42;
  private camDist = 9.5;
  private isDragging = false;
  private cameraPointerId: number | null = null;
  private lastPointerX = 0;
  private lastPointerY = 0;

  // Input state
  private keys: Record<string, boolean> = {};
  private touchMove = { x: 0, y: 0 };
  private touchSprint = false;
  private paused = false;

  // World entities & colliders
  private circleColliders: CircleCollider[] = [];
  private boxColliders: BoxCollider[] = [];
  private collectibles: ActiveCollectible[] = [];
  private chapterStations: ActiveChapterStation[] = [];
  private npcs: ActiveNpc[] = [];
  private creatures: AnimatedCreature[] = [];
  private ambientMotes?: THREE.Points;
  private particles: DustParticle[] = [];
  private hudThrottle = 0;
  private lastNearbyNpcId: string | null = null;
  private lastNearbyStationId: string | null = null;
  private lastNearbyG1ActionKey: string | null = null;
  private lastNearbyG2NodeKey: string | null = null;
  private lastNearbyG3NodeKey: string | null = null;
  private lastNearbyG4NodeKey: string | null = null;
  private lastCarriedId: string | null = null;
  private lastMotion: PlayerMotionState = 'Diam';
  private lastRegionId: Grade1RegionId | null = null;
  private discoveredRegionIds = new Set<Grade1RegionId>(['desa-ceria']);

  // Grade 1 dedicated interactive playground, 9 subject worlds & open-world interiors
  private exteriorGroup = new THREE.Group();
  private outdoorLightsGroup = new THREE.Group();
  private activeInterior: Grade1InteriorRuntime | null = null;
  private savedExteriorPos = { x: -12, z: 8, yaw: 0.35 };
  private heroPoseKind: 'jump-jack' | 'balance' | 'stretch' | 'march' | null = null;
  private heroPoseTimer = 0;

  // Unified Character Animation State Machine, Sitting & NPC Choreography
  private playerAnimState: CharacterAnimState = 'idle';
  private playerForcedAnim: CharacterAnimState | null = null;
  private playerForcedTimer = 0;
  private standingUpTimer = 0;
  private turningTimer = 0;
  private activeSeat: Grade1SeatSpot | null = null;
  private npcAnimOverrides = new Map<string, { state: CharacterAnimState; timer: number }>();
  private talkingNpcId: string | null = null;
  private lastSeatedId: string | null = null;
  private lastForcedPose: CharacterAnimState = 'idle';

  private grade1Runtime: Grade1WorldRuntime | null = null;
  private grade1Bag: Grade1BagState | null = null;
  private grade1TrashQueue: boolean[] = [];
  private grade1ActionAnimTimer = 0;
  private grade1StepNoteCooldown = 0;
  private grade1BalanceTimer = 0;
  private carriedItem: Grade1ActivePickup | null = null;
  private carriedAttachMesh: THREE.Group | null = null;
  private trampolineCooldown = 0;
  private trampolineNoticed = false;

  // Grade 2 Desa Ceria life-simulation runtime state
  private grade = 1;
  private grade2Runtime: Grade2WorldRuntime | null = null;
  private grade2SimState: Grade2SimState | null = null;
  private grade2ActionAnimTimer = 0;

  // Grade 3 Hutan Misteri exploration adventure state
  private grade3Runtime: Grade3WorldRuntime | null = null;
  private grade3ExpState: Grade3ExpState | null = null;

  // Grade 4 Pulau Teka-Teki puzzle adventure state
  private grade4Runtime: Grade4WorldRuntime | null = null;
  private grade4PuzzleState: Grade4PuzzleState | null = null;
  private carriedCrystalId: string | null = null;
  private carriedCrystalLabel: string | null = null;
  private carriedCrystalMesh: THREE.Group | null = null;

  // Textures & geometries to dispose cleanly
  private disposables: Array<{ dispose: () => void }> = [];

  constructor(
    container: HTMLElement,
    config: WorldEngineConfig,
    callbacks: EngineCallbacks
  ) {
    this.container = container;
    this.config = config;
    this.grade = config.theme.grade;
    if (this.grade === 1) {
      this.grade1Bag = createInitialGrade1Bag(
        config.grade1Context?.subjectId ?? 'bahasa-indonesia'
      );
    } else if (this.grade === 2) {
      this.grade2SimState = loadGrade2SimState();
    } else if (this.grade === 3) {
      this.grade3ExpState = loadGrade3ExpState();
    } else if (this.grade === 4) {
      this.grade4PuzzleState = loadGrade4PuzzleState();
    }
    this.callbacks = callbacks;
    this.init();
  }

  private isBridgePassable(): boolean {
    if (this.grade === 4) {
      return Boolean(this.grade4PuzzleState?.bridgeExtended);
    }
    return true;
  }

  private getDefaultSpawn() {
    if (this.grade === 2) return { x: -10.5, z: 13.5, yaw: Math.PI * 0.5 };
    if (this.grade === 3) return { x: -15.5, z: 14.0, yaw: 0.4 };
    if (this.grade === 4) return { x: -14.0, z: 10.0, yaw: 0.3 };
    return { x: -13.5, z: 4.5, yaw: Math.PI * 0.45 };
  }

  private detectSoftwareGl(): boolean {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return true;
    }
  }

  private init() {
    this.isSoftwareGl = this.detectSoftwareGl();
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';

    this.container.appendChild(this.renderer.domElement);

    // WebGL Context Loss Safety
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);

    // Scene & Horizon Sky Fog
    this.scene = new THREE.Scene();
    const { skyHex, fogHex, fogDensity } = this.config.theme;
    this.scene.background = new THREE.Color(skyHex);
    this.scene.fog = new THREE.FogExp2(fogHex, fogDensity);

    // Studio RoomEnvironment reflection map
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTex;
    this.disposables.push(envTex);
    pmrem.dispose();

    // Camera
    this.camera = new THREE.PerspectiveCamera(56, width / height, 0.2, 320);

    // 3-Point Outdoor Lighting Rig (Tailored per Grade 1..6 atmosphere)
    this.scene.add(this.exteriorGroup);
    this.scene.add(this.outdoorLightsGroup);
    const { hemiSkyHex, hemiGroundHex, sunColorHex, sunIntensity } = this.config.theme;
    const hemi = new THREE.HemisphereLight(hemiSkyHex, hemiGroundHex, 0.78);
    this.outdoorLightsGroup.add(hemi);

    this.sunLight = new THREE.DirectionalLight(sunColorHex, sunIntensity);
    this.sunLight.position.set(28, 42, 22);
    this.sunLight.castShadow = !this.isSoftwareGl;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    const d = 32;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 110;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.outdoorLightsGroup.add(this.sunLight);
    this.outdoorLightsGroup.add(this.sunLight.target);

    const rimLight = new THREE.DirectionalLight(hemiSkyHex, 0.45);
    rimLight.position.set(-25, 18, -28);
    this.outdoorLightsGroup.add(rimLight);

    // Build World Geometry & Grade-Specific Wildlife
    this.buildTerrainAndOcean();
    this.buildArchitectureAndProps();
    this.buildHero();
    this.buildNpcs();
    this.buildCollectibles();
    this.buildChapterStations();
    this.buildCreatures();
    this.buildAmbientMotes();
    this.buildSkyClouds();

    // Place hero grounded at active chapter zone spawn
    const sp = this.config.chapterMission?.spawnPoint ?? this.getDefaultSpawn();
    this.playerPos.set(
      sp.x,
      getWalkableHeight(sp.x, sp.z, this.grade, this.isBridgePassable()),
      sp.z
    );
    this.playerYaw = sp.yaw;
    this.camYaw = -this.playerYaw;
    this.hero.root.position.copy(this.playerPos);
    this.hero.root.rotation.y = this.playerYaw;

    // Position camera immediately behind hero on first frame
    this.updateCamera(1);

    // Pre-compile shaders on hardware GPUs
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    sound3d.startBgm(
      this.config.theme.grade,
      this.config.grade1Context?.subjectId
    );
    this.attachEvents();
    this.clock.start();
    this.tick();
  }

  private buildTerrainAndOcean() {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const grassTex = createGrassDetailTexture(maxAniso);
    this.disposables.push(grassTex);

    // 1. Vertex-colored Island Terrain Mesh
    const size = this.grade === 1 ? 244 : 164;
    const segs = this.grade === 1 ? 148 : 128;
    const islandRad = getIslandRadius(this.grade);
    const terrainGeo = new THREE.PlaneGeometry(size, size, segs, segs);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getRawTerrainHeight(x, z, this.grade);
      posAttr.setY(i, y);

      const dist = Math.hypot(x, z);
      const nearRiver =
        this.grade === 2
          ? Math.abs(z - getGrade2RiverCenterZ(x)) < getGrade2RiverHalfWidth(x) + 1.4
          : this.grade === 3
          ? Math.abs(x - getGrade3RiverCenterX(z)) < getGrade3RiverHalfWidth(z) + 1.4
          : this.grade === 4
          ? Math.abs(x - getGrade4ChannelCenterX(z)) < getGrade4ChannelHalfWidth(z) + 1.4
          : Math.abs(x - getRiverCenterX(z)) < getRiverHalfWidth(z) + 1.4;
      const inBeachSand = this.grade === 1 && x > 30 && z > 28 && y < 1.3;

      if (y < 0.05 || dist > islandRad - 7 || inBeachSand) {
        // Sandy shoreline, beach cove & riverbed
        _tempColor.setHex(nearRiver ? 0xc2a378 : 0xfde68a);
      } else if (isOnRoad(x, z, this.grade)) {
        // Themed village footpath
        _tempColor.setHex(this.config.theme.roadHex);
      } else if (y > 4.2) {
        // High rocky/emerald hilltops
        _tempColor.setHex(
          y > 6.2 ? this.config.theme.peakHex : this.config.theme.hillHex
        );
      } else {
        // Lush themed grass with subtle variation
        const patch = Math.sin(x * 0.14) * Math.cos(z * 0.14) * 0.04;
        const [gr, gg, gb] = this.config.theme.grassBaseRgb;
        _tempColor.setRGB(gr + patch, gg + patch, gb);
      }

      colors[i * 3] = _tempColor.r;
      colors[i * 3 + 1] = _tempColor.g;
      colors[i * 3 + 2] = _tempColor.b;
    }

    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();
    this.disposables.push(terrainGeo);

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: grassTex,
      roughness: 0.9,
      metalness: 0.0,
    });
    this.disposables.push(terrainMat);

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    this.exteriorGroup.add(terrainMesh);

    // 2. Expansive Ocean & River Water Surface (extends to horizon)
    const waterSize = this.grade === 1 ? 560 : 480;
    const waterGeo = new THREE.PlaneGeometry(waterSize, waterSize, 48, 48);
    waterGeo.rotateX(-Math.PI / 2);
    this.disposables.push(waterGeo);

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: this.config.theme.waterHex,
      roughness: 0.18,
      metalness: 0.05,
      transparent: true,
      opacity: 0.84,
      clearcoat: this.isSoftwareGl ? 0 : 0.8,
      clearcoatRoughness: 0.15,
    });
    this.disposables.push(waterMat);

    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = WATER_LEVEL;
    this.waterMesh.receiveShadow = true;
    this.exteriorGroup.add(this.waterMesh);
  }

  private buildArchitectureAndProps() {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const woodTex = createWoodTexture('#92400e', '#5c2808', maxAniso);
    const roofTex = createRoofTileTexture(maxAniso);
    this.disposables.push(woodTex, roofTex);

    const isGrade1 = this.grade === 1;
    const isGrade2 = this.grade === 2;
    const isGrade3 = this.grade === 3;
    const isGrade4 = this.grade === 4;

    if (isGrade2) {
      // Grade 2 Desa Ceria builds its own East-West river bridge, 8 village/farm locations & Taman Geometri
      const g2 = buildGrade2World(this.scene, woodTex, roofTex, maxAniso);
      this.grade2Runtime = g2;
      this.disposables.push(...g2.disposables);
      this.boxColliders.push(...g2.boxColliders);
      this.circleColliders.push(...g2.circleColliders);
      this.syncGrade2Visuals();
    } else if (isGrade3) {
      // Grade 3 Hutan Misteri builds its jungle river bridge, waterfall, cave, lab & Kuil Pengetahuan
      const g3 = buildGrade3World(this.scene, woodTex, roofTex);
      this.grade3Runtime = g3;
      this.disposables.push(...g3.disposables);
      this.boxColliders.push(...g3.boxColliders);
      this.circleColliders.push(...g3.circleColliders);

      const lm = createThemedLandmark(3, woodTex, roofTex);
      const lmPos = this.config.theme.landmarkPos;
      lm.group.position.set(lmPos.x, getRawTerrainHeight(lmPos.x, lmPos.z, 3) - 0.1, lmPos.z);
      lm.group.rotation.y = lmPos.rotY;
      this.scene.add(lm.group);
      this.landmarkParts.push(...lm.animatedParts);
      this.circleColliders.push({ x: lmPos.x, z: lmPos.z, radius: lm.colliderRadius });
    } else if (isGrade4) {
      // Grade 4 Pulau Teka-Teki builds Labirin Angka, Jembatan Mekanik, Gua Kristal, Secret Doors & Istana Pengetahuan
      const g4 = buildGrade4World(
        this.scene,
        woodTex,
        roofTex,
        this.grade4PuzzleState!
      );
      this.grade4Runtime = g4;
      this.disposables.push(...g4.disposables);
      this.boxColliders.push(...g4.boxColliders);
      this.circleColliders.push(...g4.circleColliders);

      const lm = createThemedLandmark(4, woodTex, roofTex);
      const lmPos = this.config.theme.landmarkPos;
      lm.group.position.set(lmPos.x, getRawTerrainHeight(lmPos.x, lmPos.z, 4) - 0.1, lmPos.z);
      lm.group.rotation.y = lmPos.rotY;
      this.scene.add(lm.group);
      this.landmarkParts.push(...lm.animatedParts);
      this.circleColliders.push({ x: lmPos.x, z: lmPos.z, radius: lm.colliderRadius });
    } else {
      // 1. Wooden Bridge across the river (Grades 1, 5–6)
      const bridgeDef = getBridgeBounds(this.grade);
      const bridge = createWoodenBridge(woodTex);
      bridge.position.set(bridgeDef.centerX, 0, bridgeDef.centerZ);
      this.exteriorGroup.add(bridge);

      // 2. Grade-Specific Architecture Buildings along the village & hilltop
      const g1Subject = this.config.grade1Context?.subjectId ?? 'bahasa-indonesia';
      const wallBase = this.config.theme.houseWallHex;
      const houseConfigs = isGrade1
        ? g1Subject === 'bahasa-indonesia'
          ? [
              // Bahasa Indonesia keeps the two eastern pondok houses while western village houses
              // become bespoke Rumah Huruf & Perpustakaan inside buildGrade1World()
              { x: 24.5, z: -24.5, rotY: -0.65, wall: 0xe0f2fe },
              { x: 20.5, z: 12.0, rotY: -2.4, wall: wallBase },
            ]
          : []
        : [
            { x: -15.5, z: -4.2, rotY: 0.15, wall: wallBase },
            { x: -21.5, z: 7.5, rotY: 2.5, wall: wallBase },
            { x: 24.5, z: -24.5, rotY: -0.65, wall: 0xe0f2fe },
            { x: 20.5, z: 12.0, rotY: -2.4, wall: wallBase },
          ];

      houseConfigs.forEach((hc) => {
        const house = createGradeBuilding(
          this.config.theme.grade,
          woodTex,
          roofTex,
          hc.wall
        );
        const gy = getRawTerrainHeight(hc.x, hc.z, this.grade);
        house.position.set(hc.x, gy - 0.12, hc.z);
        house.rotation.y = hc.rotY;
        this.exteriorGroup.add(house);

        // Register solid box collider around building body
        this.boxColliders.push({
          minX: hc.x - 3.3,
          maxX: hc.x + 3.3,
          minZ: hc.z - 2.9,
          maxZ: hc.z + 2.9,
        });
      });

      if (isGrade1) {
        const g1 = buildGrade1World(
          this.exteriorGroup,
          woodTex,
          roofTex,
          maxAniso,
          this.config.grade1Context
        );
        this.grade1Runtime = g1;
        this.disposables.push(...g1.disposables);
        this.boxColliders.push(...g1.boxColliders);
        this.circleColliders.push(...g1.circleColliders);
        if (this.config.grade1Context?.savedArtworks?.length) {
          this.updateGrade1Easels(this.config.grade1Context.savedArtworks);
        }
      }

      // 2B. Unique World Landmark per Grade (1 Bahasa Indo, 5–6)
      if (!isGrade1 || g1Subject === 'bahasa-indonesia') {
        const lm = createThemedLandmark(this.config.theme.grade, woodTex, roofTex);
        const lmPos = this.config.theme.landmarkPos;
        lm.group.position.set(
          lmPos.x,
          getRawTerrainHeight(lmPos.x, lmPos.z, this.grade) - 0.1,
          lmPos.z
        );
        lm.group.rotation.y = lmPos.rotY;
        this.exteriorGroup.add(lm.group);
        this.landmarkParts.push(...lm.animatedParts);
        this.circleColliders.push({
          x: lmPos.x,
          z: lmPos.z,
          radius: lm.colliderRadius,
        });
      }
    }

    // 2C. Chapter-Specific Zone Banner Arch & Micro-Decor Props
    if (this.config.chapterMission) {
      const arch = createChapterZoneArchMesh(
        this.config.chapterMission.zoneTitle,
        this.config.chapterMission.accentHex,
        woodTex,
        maxAniso
      );
      const { x: ax, z: az, rotY } = this.config.chapterMission.archPos;
      arch.group.position.set(ax, getRawTerrainHeight(ax, az, this.grade) - 0.05, az);
      arch.group.rotation.y = rotY;
      this.scene.add(arch.group);
      this.disposables.push(...arch.textures);

      // Place chapter-specific scenic props near each active station
      this.config.chapterMission.stations.forEach((st, idx) => {
        const px = st.x + (idx % 2 === 0 ? 1.8 : -1.8);
        const pz = st.z + (idx % 2 === 0 ? -1.4 : 1.5);
        if (!isInDeepWater(px, pz, this.grade)) {
          const prop = createChapterDecorProp(
            this.config.theme.grade,
            this.config.chapterMission!.chapterNumber,
            idx
          );
          prop.position.set(px, getWalkableHeight(px, pz, this.grade) - 0.02, pz);
          this.scene.add(prop);
        }
      });
    }

    // 3. Village Signposts along roads (Grades 1, 5–6)
    if (!isGrade2 && !isGrade3 && !isGrade4) {
      const signCoords = [
        { x: -5.5, z: 3.4, rotY: 0.4 },
        { x: 1.5, z: -1.5, rotY: -0.2 },
      ];
      signCoords.forEach((sc) => {
        const postGroup = new THREE.Group();
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.12, 2.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
        );
        post.position.y = 1.0;
        post.castShadow = true;
        const board = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.55, 0.12),
          new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 })
        );
        board.position.y = 1.65;
        board.castShadow = true;
        postGroup.add(post, board);
        postGroup.position.set(sc.x, getRawTerrainHeight(sc.x, sc.z, this.grade), sc.z);
        postGroup.rotation.y = sc.rotY;
        this.exteriorGroup.add(postGroup);
        this.circleColliders.push({ x: sc.x, z: sc.z, radius: 0.4 });
      });
    }

    // 4. Grade-Specific Trees & Flora around island (avoiding road, river, and houses)
    const treePositions: Array<{ x: number; z: number; variant: number; scale: number }> = [
      { x: -24, z: -12, variant: 0, scale: 1.05 },
      { x: -30, z: -2, variant: 1, scale: 1.0 },
      { x: -28, z: 14, variant: 1, scale: 0.95 },
      { x: -16, z: 16, variant: 0, scale: 1.0 },
      { x: -4, z: -14, variant: 0, scale: 1.1 },
      { x: -19, z: -24, variant: 1, scale: 1.05 },
      { x: -8, z: -30, variant: 0, scale: 1.0 },
      { x: -35, z: -22, variant: 1, scale: 1.15 },
      { x: 0, z: 22, variant: 1, scale: 1.0 },
      { x: 18, z: 21, variant: 0, scale: 1.05 },
      { x: 30, z: 10, variant: 0, scale: 1.0 },
      { x: 36, z: 24, variant: 1, scale: 1.1 },
      { x: 36, z: -10, variant: 0, scale: 1.1 },
      { x: 38, z: -28, variant: 1, scale: 1.15 },
      { x: 20, z: -32, variant: 1, scale: 0.95 },
      { x: -6, z: 32, variant: 1, scale: 1.05 },
      { x: -38, z: 4, variant: 0, scale: 1.0 },
      { x: 42, z: 2, variant: 1, scale: 1.05 },
    ];

    treePositions.forEach((tp) => {
      // Clear sunny lawn & open-world landmarks for Grade 1 (including Laboratorium Ilmuwan Muda at 28,22)
      if (this.grade === 1 && ((tp.x === -16 && tp.z === 16) || (tp.x === -30 && tp.z === -2) || (tp.x === 42 && tp.z === 2))) return;
      if (this.grade === 1 && Math.hypot(tp.x - 28, tp.z - 22) < 9.5) return;
      // Clear Desa Ceria village & farm zone for Grade 2
      if (isGrade2 && Math.abs(tp.x) < 33 && tp.z > -38 && tp.z < 28) return;
      // Clear Grade 3 Gua, Desa, Kuil & Lab zones
      if (isGrade3 && Math.hypot(tp.x + 16, tp.z - 14) < 7) return;
      if (isGrade3 && Math.hypot(tp.x + 22, tp.z + 27) < 7) return;
      if (isGrade3 && Math.hypot(tp.x - 22, tp.z - 26) < 8) return;
      // Clear Grade 4 Labirin Angka, Hutan Pola, Gua Kristal, Menara & Istana arenas
      if (isGrade4 && Math.abs(tp.x + 22) < 12 && Math.abs(tp.z + 18) < 12) return;
      if (isGrade4 && Math.hypot(tp.x - 20, tp.z - 16) < 9) return;
      if (isGrade4 && Math.hypot(tp.x - 25, tp.z + 2) < 8) return;
      if (isGrade4 && Math.hypot(tp.x - 32, tp.z + 26) < 9) return;
      if (isInDeepWater(tp.x, tp.z, this.grade) || isOnRoad(tp.x, tp.z, this.grade)) return;
      const tree = createGradeTree(this.config.theme.grade, tp.variant, tp.scale);
      tree.position.set(tp.x, getRawTerrainHeight(tp.x, tp.z, this.grade) - 0.1, tp.z);
      tree.rotation.y = (tp.x * 0.7 + tp.z * 0.3) % (Math.PI * 2);
      this.exteriorGroup.add(tree);
      this.circleColliders.push({
        x: tp.x,
        z: tp.z,
        radius: 0.62 * tp.scale,
      });
    });

    // 5. Instanced Grass Tufts (160) & Coastal Rocks (45)
    const tuftGeo = new THREE.ConeGeometry(0.18, 0.55, 5);
    tuftGeo.translate(0, 0.275, 0);
    const tuftMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
    const tuftCount = 160;
    const grassInstances = new THREE.InstancedMesh(tuftGeo, tuftMat, tuftCount);
    this.disposables.push(tuftGeo, tuftMat);

    let gPlaced = 0;
    for (let i = 0; i < 400 && gPlaced < tuftCount; i++) {
      const angle = i * 2.39996;
      const rad = 6 + ((i * 19.7) % (this.grade === 1 ? 70 : 46));
      const gx = Math.cos(angle) * rad;
      const gz = Math.sin(angle) * rad;
      const gy = getRawTerrainHeight(gx, gz, this.grade);
      if (gy < 0.25 || isOnRoad(gx, gz, this.grade)) continue;
      if (isGrade2 && Math.abs(gx) < 30 && gz > -36 && gz < 26) continue;
      if (isGrade4 && Math.abs(gx + 22) < 10 && Math.abs(gz + 18) < 10) continue;

      _dummyObj.position.set(gx, gy - 0.05, gz);
      _dummyObj.rotation.set(0, angle, 0);
      const s = 0.75 + ((i * 7) % 10) * 0.05;
      _dummyObj.scale.set(s, s, s);
      _dummyObj.updateMatrix();
      grassInstances.setMatrixAt(gPlaced, _dummyObj.matrix);

      _tempColor.setHSL(0.32 + ((i % 5) - 2) * 0.015, 0.65, 0.45 + (i % 3) * 0.05);
      grassInstances.setColorAt(gPlaced, _tempColor);
      gPlaced++;
    }
    grassInstances.count = gPlaced;
    grassInstances.instanceMatrix.needsUpdate = true;
    if (grassInstances.instanceColor) grassInstances.instanceColor.needsUpdate = true;
    grassInstances.computeBoundingSphere();
    this.exteriorGroup.add(grassInstances);

    // Coastal & Hill Boulders
    const rockGeo = new THREE.DodecahedronGeometry(0.95, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const rockCount = 42;
    const rockInstances = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInstances.castShadow = !this.isSoftwareGl;
    rockInstances.receiveShadow = true;
    this.disposables.push(rockGeo, rockMat);

    let rPlaced = 0;
    for (let i = 0; i < 120 && rPlaced < rockCount; i++) {
      const a = (i / 42) * Math.PI * 2 + 0.3;
      const rad = i % 3 === 0 ? 18 + (i % 24) : (this.grade === 1 ? 80 : 54) + (i % 10);
      const rx = Math.cos(a) * rad;
      const rz = Math.sin(a) * rad;
      if (isOnRoad(rx, rz, this.grade)) continue;
      if (isGrade2) {
        if (Math.abs(rz - getGrade2RiverCenterZ(rx)) < 4.8) continue;
        if (Math.abs(rx) < 33 && rz > -38 && rz < 28) continue;
      } else if (isGrade3) {
        if (Math.abs(rx - getGrade3RiverCenterX(rz)) < 4.8) continue;
        if (Math.hypot(rx - 22, rz - 25) < 9) continue;
      } else if (isGrade4) {
        if (Math.abs(rx - getGrade4ChannelCenterX(rz)) < 5.5) continue;
        if (Math.abs(rx + 22) < 11 && Math.abs(rz + 18) < 11) continue;
      } else {
        if (Math.abs(rx - getRiverCenterX(rz)) < 4.5) continue;
      }
      const ry = getRawTerrainHeight(rx, rz, this.grade);
      if (ry < -1.0) continue;

      const s = 0.65 + (i % 5) * 0.25;
      _dummyObj.position.set(rx, ry + s * 0.3, rz);
      _dummyObj.rotation.set(i * 0.4, i * 1.1, 0);
      _dummyObj.scale.set(s * 1.2, s * 0.85, s);
      _dummyObj.updateMatrix();
      rockInstances.setMatrixAt(rPlaced, _dummyObj.matrix);

      _tempColor.setHex(i % 2 === 0 ? 0x64748b : 0x78716c);
      rockInstances.setColorAt(rPlaced, _tempColor);
      rPlaced++;

      if (s > 0.8) {
        this.circleColliders.push({ x: rx, z: rz, radius: s * 0.85 });
      }
    }
    rockInstances.count = rPlaced;
    rockInstances.instanceMatrix.needsUpdate = true;
    if (rockInstances.instanceColor) rockInstances.instanceColor.needsUpdate = true;
    rockInstances.computeBoundingSphere();
    this.exteriorGroup.add(rockInstances);
  }

  private buildHero() {
    const grade = this.config.theme.grade;
    const g1Ctx = this.config.grade1Context;
    this.hero = createCartoonCharacter(
      getHeroColors(
        this.config.heroStyle,
        grade,
        g1Ctx?.subjectId,
        g1Ctx?.religion,
        g1Ctx?.localRegion
      ),
      {
        grade,
        hasBackpack: true,
        hasHat: false,
        heroStyle: this.config.heroStyle,
        accessory: this.config.equippedAccessory,
        grade1Subject: g1Ctx?.subjectId,
        religion: g1Ctx?.religion,
        localRegion: g1Ctx?.localRegion,
      }
    );
    this.scene.add(this.hero.root);

    // Soft radial contact shadow beneath hero feet
    const shadowTex = createContactShadowTexture();
    this.disposables.push(shadowTex);
    const shadowGeo = new THREE.PlaneGeometry(1.35, 1.35);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    this.disposables.push(shadowGeo, shadowMat);
    this.contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.scene.add(this.contactShadow);
  }

  private buildNpcs() {
    const grade = this.config.theme.grade;
    const baseList =
      this.config.chapterMission?.chapterNpcsOverrides ?? this.config.theme.npcs;
    const npcList =
      grade === 1 && !this.config.chapterMission?.chapterNpcsOverrides
        ? [...baseList, ...(this.grade1Runtime?.openWorldNpcs ?? [])]
        : baseList;
    npcList.forEach((def) => {
      const rig = createCartoonCharacter(def.colors, {
        grade,
        hasBackpack: false,
        hasHat: Boolean(def.colors.hat),
        isNpc: true,
        npcRoleStyle: def.roleStyle,
      });
      const y = getWalkableHeight(def.x, def.z, this.grade);
      rig.root.position.set(def.x, y, def.z);
      rig.root.rotation.y = def.facingY;
      this.exteriorGroup.add(rig.root);

      this.npcs.push({ def, rig });
      this.circleColliders.push({ x: def.x, z: def.z, radius: 0.55 });
    });
  }

  private buildCollectibles() {
    const hasChapterStations = Boolean(this.config.chapterMission);
    this.config.theme.collectibles.forEach((sp) => {
      // When a specific chapter mission is active, replace generic scrolls with chapter 3D stations
      if (hasChapterStations && sp.kind === 'scroll') return;
      const mesh = createCollectibleMesh(sp.kind);
      const groundY = getWalkableHeight(sp.x, sp.z, this.grade);
      const y = groundY + (sp.kind === 'scroll' ? 1.05 : 0.9);
      mesh.position.set(sp.x, y, sp.z);
      this.exteriorGroup.add(mesh);

      this.collectibles.push({
        ...sp,
        y,
        mesh,
        collected: false,
      });
    });
  }

  private buildChapterStations() {
    const mission = this.config.chapterMission;
    if (!mission) return;
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    mission.stations.forEach((st) => {
      const built = createChapterStationMesh(st, maxAniso);
      this.disposables.push(...built.textures);
      const gy = getWalkableHeight(st.x, st.z, this.grade);
      built.root.position.set(st.x, gy, st.z);
      this.exteriorGroup.add(built.root);

      const targetX = st.x + (st.targetOffsetX ?? 0);
      const targetZ = st.z + (st.targetOffsetZ ?? 0);
      if (built.targetRing) {
        const tgy = getWalkableHeight(targetX, targetZ, this.grade);
        built.targetRing.position.set(targetX, tgy + 0.08, targetZ);
        this.scene.add(built.targetRing);
      }

      this.chapterStations.push({
        def: st,
        root: built.root,
        signBoard: built.signBoard,
        indicator: built.indicator,
        activeVisual: built.activeVisual,
        targetRing: built.targetRing,
        x: st.x,
        y: gy,
        z: st.z,
        targetX,
        targetZ,
        colliderRadius: built.colliderRadius,
        completed: false,
        pushDustCooldown: 0,
      });
    });
  }

  private buildCreatures() {
    const grade = this.config.theme.grade;
    const spots =
      grade === 2
        ? [
            [-28, 22],
            [28, 16],
            [-32, -12],
            [32, -14],
            [18, 28],
            [-18, 28],
            [26, -29],
            [-32, -29],
          ]
        : grade === 3
        ? [
            [-14, 18],
            [-22, -8],
            [-28, 16],
            [14, -10],
            [24, 10],
            [16, 22],
            [-14, -22],
            [-28, -18],
          ]
        : grade === 4
        ? [
            [-12, 16],
            [-28, 12],
            [-10, -10],
            [-30, 26],
            [16, 10],
            [28, 12],
            [24, -14],
            [16, -29],
          ]
        : [
            [-9, 10],
            [-18, -8],
            [-25, 12],
            [14, -6],
            [22, 8],
            [27, -17],
            [-6, -21],
            [4, 18],
          ];
    spots.forEach(([cx, cz], idx) => {
      const creature = createGradeCreature(grade, idx, cx, cz);
      if (grade === 2 || grade === 3 || grade === 4) {
        creature.baseY = getRawTerrainHeight(cx, cz, grade);
        creature.group.position.y = creature.baseY;
      }
      this.exteriorGroup.add(creature.group);
      this.creatures.push(creature);
    });
  }

  private buildAmbientMotes() {
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = i * 2.39996;
      const r = 4 + ((i * 17.3) % 44);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 1.6 + (i % 7) * 0.85;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: this.config.theme.ambientMoteHex,
      size: this.config.theme.grade === 3 || this.config.theme.grade === 5 ? 0.34 : 0.26,
      transparent: true,
      opacity: 0.72,
    });
    this.disposables.push(geo, mat);
    this.ambientMotes = new THREE.Points(geo, mat);
    this.exteriorGroup.add(this.ambientMotes);
  }

  private buildSkyClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0,
    });
    const puffGeo = new THREE.SphereGeometry(1, 10, 10);
    this.disposables.push(cloudMat, puffGeo);

    for (let c = 0; c < 10; c++) {
      const cloud = new THREE.Group();
      const angle = (c / 10) * Math.PI * 2;
      const dist = (this.grade === 1 ? 122 : 85) + (c % 3) * 20;
      cloud.position.set(
        Math.cos(angle) * dist,
        28 + (c % 4) * 5,
        Math.sin(angle) * dist
      );
      [
        [0, 0, 0, 4.2],
        [-3.2, -0.5, 0.5, 3.0],
        [3.3, -0.4, -0.4, 3.2],
      ].forEach(([px, py, pz, r]) => {
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(px, py, pz);
        puff.scale.set(r * 1.3, r * 0.75, r);
        cloud.add(puff);
      });
      this.exteriorGroup.add(cloud);
    }
  }

  private spawnDustBurst(x: number, y: number, z: number, count: number, colorHex = 0xe2e8f0) {
    const geo = new THREE.SphereGeometry(0.11, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.75,
    });
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geo, mat.clone());
      m.position.set(x + (Math.random() - 0.5) * 0.4, y + 0.12, z + (Math.random() - 0.5) * 0.4);
      this.scene.add(m);
      const a = Math.random() * Math.PI * 2;
      const spd = 1.0 + Math.random() * 1.8;
      this.particles.push({
        mesh: m,
        vx: Math.cos(a) * spd,
        vy: 1.0 + Math.random() * 1.8,
        vz: Math.sin(a) * spd,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.2,
      });
    }
    geo.dispose();
    mat.dispose();
  }

  // Public Controls API for React HUD & Touch devices
  public setPaused(p: boolean) {
    this.paused = p;
    if (p) {
      this.keys = {};
      this.touchMove = { x: 0, y: 0 };
      this.touchSprint = false;
    }
  }

  public setTouchMove(x: number, y: number) {
    this.touchMove.x = THREE.MathUtils.clamp(x, -1, 1);
    this.touchMove.y = THREE.MathUtils.clamp(y, -1, 1);
  }

  public setTouchSprint(active: boolean) {
    this.touchSprint = active;
  }

  public triggerJump() {
    if (this.paused) return;
    if (this.activeSeat) {
      this.standUpFromSeat();
      return;
    }
    if (!this.onGround) return;
    this.playerForcedAnim = null;
    this.playerForcedTimer = 0;
    this.playerVelY = 8.4;
    this.onGround = false;
    sound3d.playJump();
    this.spawnDustBurst(this.playerPos.x, this.playerPos.y, this.playerPos.z, 5);
  }

  public triggerInteract() {
    if (this.paused) return;
    const g1Action = this.findNearestGrade1Action();
    const g2Node = this.findNearestGrade2Node();
    const g3Node = this.findNearestGrade3Node();
    const g4Node = this.findNearestGrade4Node();
    const nearStation = this.findNearestStation();
    const nearNpc = this.findNearestNpc();

    const dG1 = g1Action ? g1Action.dist : 999;
    const dG2 = g2Node ? Math.hypot(g2Node.x - this.playerPos.x, g2Node.z - this.playerPos.z) : 999;
    const dG3 = g3Node ? Math.hypot(g3Node.x - this.playerPos.x, g3Node.z - this.playerPos.z) : 999;
    const dG4 = g4Node ? Math.hypot(g4Node.x - this.playerPos.x, g4Node.z - this.playerPos.z) : 999;
    const dStation = nearStation
      ? Math.hypot(nearStation.x - this.playerPos.x, nearStation.z - this.playerPos.z)
      : 999;
    const dNpc = nearNpc
      ? Math.hypot(nearNpc.def.x - this.playerPos.x, nearNpc.def.z - this.playerPos.z)
      : 999;

    if (g1Action && dG1 <= dStation && dG1 <= dNpc) {
      this.executeGrade1Action(g1Action);
      return;
    }

    if (g2Node && dG2 <= dStation && dG2 <= dNpc) {
      this.interactGrade2Node(g2Node);
      return;
    }

    if (g3Node && dG3 <= dStation && dG3 <= dNpc) {
      this.interactGrade3Node(g3Node);
      return;
    }

    if (g4Node && dG4 <= dStation && dG4 <= dNpc) {
      this.interactGrade4Node(g4Node);
      return;
    }

    if (nearStation) {
      if (dStation <= dNpc || !nearNpc) {
        if (nearStation.def.actionType === 'push') {
          this.nudgePushStation(nearStation, 1.15);
          return;
        }
        this.completeStation(nearStation);
        return;
      }
    }

    if (nearNpc) {
      sound3d.playNpcTalk();
      this.talkingNpcId = nearNpc.def.id;
      this.triggerPlayerPose('listening', 4.0);
      this.callbacks.onOpenNpc(nearNpc.def);
    }
  }

  public resetCameraBehindPlayer() {
    this.camYaw = -this.playerYaw;
    this.camPitch = 0.42;
    this.camDist = 9.5;
  }

  public teleportTo(x: number, z: number, yaw = 0) {
    this.activeSeat = null;
    this.playerForcedAnim = null;
    this.playerForcedTimer = 0;
    if (this.activeInterior) {
      this.disposeActiveInterior();
      this.exteriorGroup.visible = true;
      this.outdoorLightsGroup.visible = true;
      this.camDist = 9.5;
      this.camPitch = 0.42;
    }
    this.playerPos.set(
      x,
      getWalkableHeight(x, z, this.grade, this.isBridgePassable()),
      z
    );
    this.playerYaw = yaw;
    this.playerVelY = 0;
    this.onGround = true;
    this.hero.root.position.copy(this.playerPos);
    this.hero.root.rotation.y = this.playerYaw;
    this.resetCameraBehindPlayer();
    this.updateCamera(1);
    this.spawnDustBurst(x, this.playerPos.y + 0.3, z, 8, 0xfbbf24);
  }

  public teleportToRegion(regionId: Grade1RegionId) {
    const reg = GRADE1_OPEN_WORLD_REGIONS.find((r) => r.id === regionId);
    if (!reg) return;
    this.teleportTo(reg.spawnX, reg.spawnZ, reg.yaw);
    sound3d.playScroll();
  }

  public triggerHeroPose(pose: 'jump-jack' | 'balance' | 'stretch' | 'march') {
    if (this.activeSeat) this.standUpFromSeat();
    this.playerForcedAnim = null;
    this.playerForcedTimer = 0;
    this.heroPoseKind = pose;
    this.heroPoseTimer = 2.6;
    if (this.grade1Bag) {
      this.grade1Bag.pjokPosesDone += 1;
      this.grade1Bag.activePose = pose;
    }
    sound3d.playPoseSuccess();
    this.spawnDustBurst(this.playerPos.x, this.playerPos.y + 0.6, this.playerPos.z, 10, 0xf97316);
  }

  public triggerPlayerPose(state: CharacterAnimState, durationSec = 3.0) {
    this.heroPoseKind = null;
    this.heroPoseTimer = 0;
    this.playerForcedAnim = state;
    this.playerForcedTimer = durationSec;
    if (state === 'clapping' || state === 'celebrating') {
      sound3d.playPoseSuccess();
      this.spawnDustBurst(this.playerPos.x, this.playerPos.y + 0.9, this.playerPos.z, 6, 0xfbbf24);
    } else if (state === 'praying' || state === 'raising-hand' || state === 'reading' || state === 'writing') {
      sound3d.playScroll();
    }
  }

  public sitInSeat(seat: Grade1SeatSpot) {
    this.heroPoseKind = null;
    this.heroPoseTimer = 0;
    this.activeSeat = seat;
    const seatGroundY = this.activeInterior
      ? 0
      : getWalkableHeight(seat.x, seat.z, this.grade, this.isBridgePassable());
    this.playerPos.set(seat.x, seatGroundY, seat.z);
    this.playerYaw = seat.facingYaw;
    this.playerVelY = 0;
    this.onGround = true;

    if (seat.locationContext === 'prayer') {
      this.playerForcedAnim = 'praying';
      this.playerForcedTimer = 30;
    } else {
      this.playerForcedAnim = null;
      this.playerForcedTimer = 0;
    }

    sound3d.playLand();
    this.spawnDustBurst(seat.x, seatGroundY + 0.35, seat.z, 6, 0x38bdf8);
    this.callbacks.onGrade1Event?.({
      type: 'sit-seat',
      message:
        seat.locationContext === 'prayer'
          ? `Duduk tenang di ${seat.label}. Gunakan tombol pose untuk Berdoa atau Mendengarkan.`
          : `Duduk nyaman di ${seat.label}! Pilih pose Baca Buku, Tulis, Angkat Tangan, atau gerak WASD untuk berdiri.`,
      rewardCoins: 2,
      rewardScore: 15,
      rewardXp: 5,
    });
  }

  public sitInNearestSeat(): boolean {
    if (this.activeSeat) return true;
    const seats = this.activeInterior
      ? this.activeInterior.seats
      : (this.grade1Runtime?.exteriorSeats ?? []);
    let best: Grade1SeatSpot | null = null;
    let bestD = 2.6;
    for (const s of seats) {
      const d = Math.hypot(s.x - this.playerPos.x, s.z - this.playerPos.z);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    if (best) {
      this.sitInSeat(best);
      return true;
    }
    return false;
  }

  public standUpFromSeat() {
    if (!this.activeSeat) return;
    const seat = this.activeSeat;
    this.activeSeat = null;
    this.playerForcedAnim = null;
    this.playerForcedTimer = 0;
    this.standingUpTimer = 0.28;

    // Gently step forward/side slightly clear of the chair front so collider does not clip
    const stepDist = seat.style === 'cushion' ? 0.35 : 0.42;
    const stepYaw = seat.style === 'chair' && seat.hasDesk ? seat.facingYaw + Math.PI : seat.facingYaw;
    const candX = this.playerPos.x + Math.sin(stepYaw) * stepDist;
    const candZ = this.playerPos.z + Math.cos(stepYaw) * stepDist;
    const [rx, rz] = this.resolveCollisions(candX, candZ);
    this.playerPos.x = rx;
    this.playerPos.z = rz;
    sound3d.playCoin();
    this.callbacks.onGrade1Event?.({
      type: 'stand-up',
      message: `Berdiri kembali dari ${seat.label}.`,
      rewardCoins: 0,
      rewardScore: 0,
      rewardXp: 0,
    });
  }

  public triggerNpcCelebrate(npcId?: string) {
    const targetList = this.activeInterior ? this.activeInterior.npcEntries : this.npcs;
    const id =
      npcId ??
      this.talkingNpcId ??
      this.findNearestNpc()?.def.id ??
      targetList[0]?.def.id;
    if (id) {
      this.npcAnimOverrides.set(id, { state: 'celebrating', timer: 3.0 });
    }
    this.triggerPlayerPose('celebrating', 2.4);
  }

  public triggerNpcTalk(npcId: string | null) {
    this.talkingNpcId = npcId;
    if (!npcId && this.playerForcedAnim === 'listening') {
      this.playerForcedAnim = null;
      this.playerForcedTimer = 0;
    }
  }

  public resetGrade1Activities() {
    if (this.grade !== 1 || !this.grade1Runtime) return;
    const rt = this.grade1Runtime;

    if (this.activeSeat) this.standUpFromSeat();
    if (this.carriedItem) {
      this.carriedItem = null;
      this.clearCarriedAttachMesh();
    }

    rt.pickups.forEach((p) => {
      p.state = 'world';
      p.mesh.visible = true;
    });

    rt.numberSequenceDone = false;
    rt.numberPads.forEach((pad) => {
      if (pad.activated) {
        pad.activated = false;
        pad.mesh.position.y += 0.04;
        const mats = pad.mesh.material as THREE.MeshStandardMaterial[];
        if (mats[2]) {
          mats[2].emissive.setHex(0x000000);
          mats[2].emissiveIntensity = 0;
        }
      }
    });

    rt.interactiveNodes.forEach((node) => {
      if (node.category === 'trash-item') {
        node.completed = false;
        node.mesh.visible = true;
      } else if (node.category === 'plant-plot' && node.stageMeshes) {
        node.plantStage = 0;
        node.stageMeshes.forEach((m, i) => {
          m.visible = i === 0;
        });
      } else if (node.category === 'fruit-tree' && node.detachableFruits) {
        node.detachableFruits.forEach((f) => {
          f.picked = false;
          f.mesh.visible = true;
        });
      } else if (node.category === 'hurdle' || node.category === 'balance-beam') {
        node.completed = false;
      }
    });

    this.grade1TrashQueue = [];
    this.grade1Bag = createInitialGrade1Bag(
      this.config.grade1Context?.subjectId ?? 'bahasa-indonesia'
    );
    sound3d.playScroll();
    this.spawnDustBurst(this.playerPos.x, this.playerPos.y + 0.8, this.playerPos.z, 10, 0x38bdf8);
    this.callbacks.onGrade1Event?.({
      type: 'custom-interact',
      message: 'Semua aktivitas 3D (buah, tanaman, sampah, angka, dan barang) telah disegarkan untuk dimainkan lagi!',
      rewardCoins: 0,
      rewardScore: 0,
      rewardXp: 0,
      bagState: structuredClone(this.grade1Bag),
    });
  }

  private disposeActiveInterior() {
    if (!this.activeInterior) return;
    this.scene.remove(this.activeInterior.root);
    this.activeInterior.disposables.forEach((d) => d.dispose());
    this.activeInterior = null;
  }

  public enterInterior(interiorId: Grade1InteriorId, customReturn?: { x: number; z: number; yaw: number }) {
    if (this.grade !== 1) return;
    if (this.activeSeat) this.activeSeat = null;
    const doorTrigger = this.grade1Runtime?.doorTriggers.find((d) => d.id === interiorId);
    if (customReturn) {
      this.savedExteriorPos = customReturn;
    } else if (doorTrigger) {
      this.savedExteriorPos = {
        x: doorTrigger.returnX,
        z: doorTrigger.returnZ,
        yaw: doorTrigger.returnYaw,
      };
    } else {
      this.savedExteriorPos = {
        x: this.playerPos.x,
        z: this.playerPos.z,
        yaw: this.playerYaw,
      };
    }

    this.disposeActiveInterior();
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const interior = buildGrade1InteriorRoom(
      interiorId,
      this.config.grade1Context?.religion ?? 'islam',
      this.config.grade1Context?.savedArtworks ?? [],
      maxAniso
    );
    this.activeInterior = interior;
    this.exteriorGroup.visible = false;
    this.outdoorLightsGroup.visible = false;
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = null;
    this.scene.add(interior.root);

    this.playerPos.set(interior.spawnPos.x, 0, interior.spawnPos.z);
    this.playerYaw = interior.spawnPos.yaw;
    this.playerVelY = 0;
    this.onGround = true;
    this.hero.root.position.copy(this.playerPos);
    this.hero.root.rotation.y = this.playerYaw;
    this.playerForcedAnim = 'opening-door';
    this.playerForcedTimer = 0.55;
    this.camYaw = -this.playerYaw;
    this.camPitch = 0.45;
    this.camDist = 6.8;
    this.updateCamera(1);
    sound3d.playDoorTransition(true);
    this.callbacks.onGrade1Event?.({
      type: 'enter-interior',
      interiorId,
      message: `Masuk ke ${interior.title}! (${interior.subtitle})`,
      rewardCoins: 5,
      rewardScore: 25,
      rewardXp: 8,
    });
  }

  public exitInterior() {
    if (!this.activeInterior) return;
    if (this.activeSeat) this.activeSeat = null;
    const prevTitle = this.activeInterior.title;
    const prevId = this.activeInterior.id;
    this.disposeActiveInterior();
    this.exteriorGroup.visible = true;
    this.outdoorLightsGroup.visible = true;
    this.scene.background = new THREE.Color(this.config.theme.skyHex);
    this.scene.fog = new THREE.FogExp2(this.config.theme.fogHex, this.config.theme.fogDensity);

    this.camDist = 9.5;
    this.camPitch = 0.42;
    this.teleportTo(this.savedExteriorPos.x, this.savedExteriorPos.z, this.savedExteriorPos.yaw);
    this.playerForcedAnim = 'opening-door';
    this.playerForcedTimer = 0.45;
    sound3d.playDoorTransition(false);
    this.callbacks.onGrade1Event?.({
      type: 'exit-interior',
      interiorId: prevId,
      message: `Keluar dari ${prevTitle} kembali ke dunia luar.`,
      rewardCoins: 0,
      rewardScore: 0,
      rewardXp: 0,
    });
  }

  public getGrade2SimState(): Grade2SimState | null {
    return this.grade2SimState ? structuredClone(this.grade2SimState) : null;
  }

  public applyGrade2MarketAction(
    action:
      | { kind: 'sell-crop'; crop: CropType }
      | { kind: 'sell-farm' }
      | { kind: 'buy-feed' }
      | { kind: 'buy-fertilizer' }
      | { kind: 'buy-cake' },
    playerCoins: number
  ): { ok: boolean; coinsDelta: number; scoreDelta: number; xpDelta: number; message: string; simState: Grade2SimState | null } {
    const sim = this.grade2SimState;
    if (!sim) {
      return { ok: false, coinsDelta: 0, scoreDelta: 0, xpDelta: 0, message: 'Simulasi tidak aktif.', simState: null };
    }

    if (action.kind === 'sell-crop') {
      const count = sim.cropsInBag[action.crop] ?? 0;
      if (count <= 0) {
        return { ok: false, coinsDelta: 0, scoreDelta: 0, xpDelta: 0, message: `Stok ${action.crop} di tas masih kosong.`, simState: structuredClone(sim) };
      }
      const priceEach = action.crop === 'wortel' ? 6 : action.crop === 'jagung' ? 8 : action.crop === 'kubis' ? 9 : 10;
      const earned = count * priceEach;
      sim.cropsInBag[action.crop] = 0;
      saveGrade2SimState(sim);
      sound3d.playCoin();
      const snapshot = structuredClone(sim);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Terjual ${count} ${action.crop} seharga +${earned} Koin! (${count} × ${priceEach} = ${earned})`,
        rewardCoins: earned,
        rewardScore: 45,
        rewardXp: 12,
        simState: snapshot,
      });
      return {
        ok: true,
        coinsDelta: earned,
        scoreDelta: 45,
        xpDelta: 12,
        message: `Terjual ${count} ${action.crop} (+${earned} Koin)!`,
        simState: snapshot,
      };
    }

    if (action.kind === 'sell-farm') {
      if (sim.eggsAndMilk <= 0) {
        return { ok: false, coinsDelta: 0, scoreDelta: 0, xpDelta: 0, message: 'Belum ada susu/telur untuk dijual.', simState: structuredClone(sim) };
      }
      const qty = sim.eggsAndMilk;
      const earned = qty * 10;
      sim.eggsAndMilk = 0;
      saveGrade2SimState(sim);
      sound3d.playCoin();
      const snapshot = structuredClone(sim);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Terjual ${qty} Susu & Telur (+${earned} Koin)!`,
        rewardCoins: earned,
        rewardScore: 50,
        rewardXp: 15,
        simState: snapshot,
      });
      return { ok: true, coinsDelta: earned, scoreDelta: 50, xpDelta: 15, message: `Terjual ${qty} produk ternak (+${earned} Koin)!`, simState: snapshot };
    }

    if (action.kind === 'buy-feed') {
      const cost = 10;
      if (playerCoins < cost) {
        return { ok: false, coinsDelta: 0, scoreDelta: 0, xpDelta: 0, message: `Koin belum cukup (perlu ${cost} Koin).`, simState: structuredClone(sim) };
      }
      sim.feedBag += 4;
      saveGrade2SimState(sim);
      sound3d.playScroll();
      const snapshot = structuredClone(sim);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Membeli +4 Pakan Ternak (-${cost} Koin)!`,
        rewardCoins: -cost,
        rewardScore: 20,
        rewardXp: 8,
        simState: snapshot,
      });
      return { ok: true, coinsDelta: -cost, scoreDelta: 20, xpDelta: 8, message: 'Berhasil beli +4 Pakan Ternak!', simState: snapshot };
    }

    if (action.kind === 'buy-fertilizer') {
      const cost = 12;
      if (playerCoins < cost) {
        return { ok: false, coinsDelta: 0, scoreDelta: 0, xpDelta: 0, message: `Koin belum cukup (perlu ${cost} Koin).`, simState: structuredClone(sim) };
      }
      sim.fertilizerBag += 2;
      saveGrade2SimState(sim);
      sound3d.playScroll();
      const snapshot = structuredClone(sim);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Membeli +2 Pupuk Subur (-${cost} Koin)!`,
        rewardCoins: -cost,
        rewardScore: 20,
        rewardXp: 8,
        simState: snapshot,
      });
      return { ok: true, coinsDelta: -cost, scoreDelta: 20, xpDelta: 8, message: 'Berhasil beli +2 Pupuk Subur!', simState: snapshot };
    }

    const cost = 15;
    if (playerCoins < cost) {
      return { ok: false, coinsDelta: 0, scoreDelta: 0, xpDelta: 0, message: `Koin belum cukup (perlu ${cost} Koin).`, simState: structuredClone(sim) };
    }
    sim.cakeBag += 3;
    saveGrade2SimState(sim);
    sound3d.playScroll();
    const snapshot = structuredClone(sim);
    this.callbacks.onGrade2Event?.({
      type: 'sim',
      message: `Membeli +3 Paket Kue Dapur (-${cost} Koin)!`,
      rewardCoins: -cost,
      rewardScore: 25,
      rewardXp: 10,
      simState: snapshot,
    });
    return { ok: true, coinsDelta: -cost, scoreDelta: 25, xpDelta: 10, message: 'Berhasil beli +3 Kue Dapur!', simState: snapshot };
  }

  public getGrade3ExpState(): Grade3ExpState | null {
    return this.grade3ExpState ? structuredClone(this.grade3ExpState) : null;
  }

  public markGrade3ChallengeSolved(bab: number): Grade3ExpState | null {
    const exp = this.grade3ExpState;
    if (!exp) return null;
    if (!exp.challengesSolved.includes(bab)) {
      exp.challengesSolved.push(bab);
      saveGrade3ExpState(exp);
    }
    sound3d.playMissionComplete();
    this.spawnDustBurst(
      this.playerPos.x,
      this.playerPos.y + 0.9,
      this.playerPos.z,
      12,
      0x10b981
    );
    const snapshot = structuredClone(exp);
    this.callbacks.onGrade3Event?.({
      type: 'explore',
      bab,
      message: `Tantangan Eksplorasi Wilayah ${bab} berhasil diselesaikan!`,
      rewardCoins: 20,
      rewardScore: 120,
      rewardXp: 30,
      expState: snapshot,
    });
    return snapshot;
  }

  public markGrade3KuilCompleted(): Grade3ExpState | null {
    const exp = this.grade3ExpState;
    if (!exp) return null;
    exp.kuilCompleted = true;
    saveGrade3ExpState(exp);
    return structuredClone(exp);
  }

  public getGrade4PuzzleState(): Grade4PuzzleState | null {
    return this.grade4PuzzleState ? structuredClone(this.grade4PuzzleState) : null;
  }

  public markGrade4PuzzleSolved(bab: number): Grade4PuzzleState | null {
    const puz = this.grade4PuzzleState;
    const rt = this.grade4Runtime;
    if (!puz) return null;
    if (!puz.puzzlesSolved.includes(bab)) {
      puz.puzzlesSolved.push(bab);
    }
    if (bab === 2) {
      puz.mazeSolved = true;
    } else if (bab === 3) {
      puz.bridgeExtended = true;
      if (rt) {
        rt.bridgeBarrierWall.visible = false;
        rt.bridgeBarrierCollider.minX = 999;
        rt.bridgeBarrierCollider.maxX = 999;
        rt.bridgeBarrierCollider.minZ = 999;
        rt.bridgeBarrierCollider.maxZ = 999;
      }
    } else if (bab === 4) {
      puz.patternStep = 4;
      if (rt) {
        rt.patternPillars.forEach((pp) => {
          (pp.orb.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.95;
        });
      }
    } else if (bab === 6) {
      if (!puz.doorsUnlocked.includes('door-menara')) {
        puz.doorsUnlocked.push('door-menara');
      }
      const d1 = rt?.secretDoors.find((d) => d.id === 'door-menara');
      if (d1) {
        d1.collider.minX = 999;
        d1.collider.maxX = 999;
        d1.collider.minZ = 999;
        d1.collider.maxZ = 999;
      }
    } else if (bab === 7) {
      if (!puz.doorsUnlocked.includes('door-kuil')) {
        puz.doorsUnlocked.push('door-kuil');
      }
      const d2 = rt?.secretDoors.find((d) => d.id === 'door-kuil');
      if (d2) {
        d2.collider.minX = 999;
        d2.collider.maxX = 999;
        d2.collider.minZ = 999;
        d2.collider.maxZ = 999;
      }
    }

    saveGrade4PuzzleState(puz);
    sound3d.playMissionComplete();
    this.spawnDustBurst(
      this.playerPos.x,
      this.playerPos.y + 1.0,
      this.playerPos.z,
      14,
      0x38bdf8
    );
    const snapshot = structuredClone(puz);
    this.callbacks.onGrade4Event?.({
      type: 'puzzle',
      bab,
      message:
        bab === 3
          ? 'Roda gigi berputar! Jembatan Mekanik terbentang menuju Kepulauan Timur!'
          : bab === 6 || bab === 7
          ? 'Kunci benar! Pintu Rahasia bergeser terbuka!'
          : `Teka-teki Wilayah ${bab} terpecahkan!`,
      rewardCoins: 25,
      rewardScore: 140,
      rewardXp: 35,
      puzzleState: snapshot,
      carriedCrystalLabel: this.carriedCrystalLabel,
    });
    return snapshot;
  }

  public markGrade4IstanaCompleted(): Grade4PuzzleState | null {
    const puz = this.grade4PuzzleState;
    if (!puz) return null;
    puz.istanaCompleted = true;
    saveGrade4PuzzleState(puz);
    return structuredClone(puz);
  }

  public respawnToVillage() {
    this.activeSeat = null;
    this.playerForcedAnim = null;
    this.playerForcedTimer = 0;
    const sp = this.config.chapterMission?.spawnPoint ?? this.getDefaultSpawn();
    this.playerPos.set(
      sp.x,
      getWalkableHeight(sp.x, sp.z, this.grade, this.isBridgePassable()),
      sp.z
    );
    this.playerYaw = sp.yaw;
    this.playerVelY = 0;
    this.onGround = true;
    this.resetCameraBehindPlayer();
  }

  private findNearestNpc(): ActiveNpc | null {
    let best: ActiveNpc | null = null;
    let bestDist = 3.8;
    const list: ActiveNpc[] = this.activeInterior
      ? this.activeInterior.npcEntries
      : this.npcs;
    for (const npc of list) {
      const d = Math.hypot(
        npc.def.x - this.playerPos.x,
        npc.def.z - this.playerPos.z
      );
      if (d < bestDist) {
        bestDist = d;
        best = npc;
      }
    }
    return best;
  }

  private findNearestStation(): ActiveChapterStation | null {
    if (this.activeInterior) return null;
    let best: ActiveChapterStation | null = null;
    let bestDist = 3.4;
    for (const st of this.chapterStations) {
      if (st.completed) continue;
      const d = Math.hypot(st.x - this.playerPos.x, st.z - this.playerPos.z);
      if (d < bestDist) {
        bestDist = d;
        best = st;
      }
    }
    return best;
  }

  public getGrade1BagState(): Grade1BagState | null {
    return this.grade1Bag ? structuredClone(this.grade1Bag) : null;
  }

  public applyGrade1BagMutation(
    action: {
      kind:
        | 'eat-fruit'
        | 'word-done'
        | 'color-mixed'
        | 'cube-done'
        | 'english-done'
        | 'shape-color-sorted'
        | 'sentence-built'
        | 'market-purchased'
        | 'sell-good-fruits';
    }
  ): Grade1BagState | null {
    const bag = this.grade1Bag;
    if (!bag) return null;
    if (action.kind === 'eat-fruit') {
      if (bag.goodFruits > 0) {
        bag.goodFruits -= 1;
        bag.eatenFruits += 1;
        sound3d.playCoin();
      }
    } else if (action.kind === 'sell-good-fruits') {
      if (bag.goodFruits > 0) {
        bag.goodFruits = 0;
        sound3d.playCashRegister();
      }
    } else if (action.kind === 'word-done') {
      bag.wordsAssembled += 1;
    } else if (action.kind === 'color-mixed') {
      bag.colorsMixed += 1;
    } else if (action.kind === 'cube-done') {
      bag.cubeNetInspected = true;
    } else if (action.kind === 'english-done') {
      bag.englishWordsHeard += 1;
    } else if (action.kind === 'shape-color-sorted') {
      bag.shapesColorsSorted += 1;
    } else if (action.kind === 'sentence-built') {
      bag.sentencesBuilt += 1;
    } else if (action.kind === 'market-purchased') {
      bag.marketPurchases += 1;
      sound3d.playCashRegister();
    }
    return structuredClone(bag);
  }

  public updateGrade1Easels(
    artworks: Array<{ id: string; title: string; dataUrl: string }>
  ) {
    const targets = [
      ...(this.grade1Runtime?.easelTargets ?? []),
      ...(this.activeInterior?.easelTargets ?? []),
    ];
    if (targets.length === 0 || artworks.length === 0) return;

    targets.forEach((easel, idx) => {
      const art = artworks[artworks.length - 1 - idx] ?? artworks[0];
      if (!art?.dataUrl) return;
      const img = new Image();
      img.onload = () => {
        if (this.disposed) return;
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        this.disposables.push(tex);
        const mat = easel.canvasMesh.material as THREE.MeshStandardMaterial;
        mat.map = tex;
        mat.needsUpdate = true;
      };
      img.src = art.dataUrl;
    });
  }

  private findNearestGrade1Action(): Grade1NearbyAction | null {
    const rt = this.grade1Runtime;
    if (!rt) return null;

    if (this.activeSeat) {
      return {
        kind: 'stand-up',
        label: `Berdiri dari ${this.activeSeat.label}`,
        dist: 0,
        targetId: this.activeSeat.id,
      };
    }

    // 0A. Inside a 3D Interior: check Exit Door, Seats, & Interior Interactive Stations
    if (this.activeInterior) {
      const exitD = Math.hypot(
        this.activeInterior.exitDoor.x - this.playerPos.x,
        this.activeInterior.exitDoor.z - this.playerPos.z
      );
      if (exitD < this.activeInterior.exitDoor.radius) {
        return {
          kind: 'exit-door',
          label: `Keluar dari ${this.activeInterior.title}`,
          dist: exitD,
          targetId: this.activeInterior.id,
        };
      }
      let bestSeat: Grade1SeatSpot | null = null;
      let bestSeatDist = 1.95;
      for (const seat of this.activeInterior.seats) {
        const d = Math.hypot(seat.x - this.playerPos.x, seat.z - this.playerPos.z);
        if (d < bestSeatDist) {
          bestSeatDist = d;
          bestSeat = seat;
        }
      }
      let bestIntNode: Grade1InteractiveNode | null = null;
      let bestIntDist = 999;
      for (const node of this.activeInterior.stations) {
        const d = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
        if (d < node.radius && d < bestIntDist) {
          bestIntDist = d;
          bestIntNode = node;
        }
      }
      if (bestSeat && bestSeatDist <= bestIntDist) {
        return {
          kind: 'sit-seat',
          label: `Duduk · ${bestSeat.label}`,
          dist: bestSeatDist,
          targetId: bestSeat.id,
        };
      }
      if (bestIntNode) {
        return {
          kind: 'custom-node',
          label: bestIntNode.label,
          dist: bestIntDist,
          targetId: bestIntNode.id,
        };
      }
      return null;
    }

    // 0B. Exterior Door Triggers for Enterable Buildings
    let bestDoor: Grade1DoorTrigger | null = null;
    let bestDoorDist = 999;
    for (const door of rt.doorTriggers) {
      const d = Math.hypot(door.entryX - this.playerPos.x, door.entryZ - this.playerPos.z);
      if (d < door.radius && d < bestDoorDist) {
        bestDoorDist = d;
        bestDoor = door;
      }
    }
    if (bestDoor) {
      return {
        kind: 'enter-door',
        label: bestDoor.label,
        dist: bestDoorDist,
        targetId: bestDoor.id,
      };
    }

    // 0C. Exterior Park Benches & Outdoor Seats
    let bestExtSeat: Grade1SeatSpot | null = null;
    let bestExtSeatDist = 2.05;
    for (const seat of rt.exteriorSeats) {
      const d = Math.hypot(seat.x - this.playerPos.x, seat.z - this.playerPos.z);
      if (d < bestExtSeatDist) {
        bestExtSeatDist = d;
        bestExtSeat = seat;
      }
    }

    // 1. Custom 9-world & 8-region interactive nodes
    let bestCustom: Grade1InteractiveNode | null = null;
    let bestCustomDist = 999;
    for (const node of rt.interactiveNodes) {
      if (node.category === 'trash-item' && node.completed) continue;
      const d = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
      if (d < node.radius && d < bestCustomDist) {
        bestCustomDist = d;
        bestCustom = node;
      }
    }
    if (bestExtSeat && bestExtSeatDist < bestCustomDist) {
      return {
        kind: 'sit-seat',
        label: `Duduk · ${bestExtSeat.label}`,
        dist: bestExtSeatDist,
        targetId: bestExtSeat.id,
      };
    }
    if (bestCustom) {
      return {
        kind: 'custom-node',
        label: bestCustom.label,
        dist: bestCustomDist,
        targetId: bestCustom.id,
      };
    }

    // 2. If carrying a Bahasa Indonesia pickup item and near its matching pedestal -> Use
    if (this.carriedItem) {
      const targetPed = rt.pedestals.find((p) => p.id === this.carriedItem!.targetZoneId);
      if (targetPed) {
        const d = Math.hypot(targetPed.x - this.playerPos.x, targetPed.z - this.playerPos.z);
        if (d < 3.2) {
          return {
            kind: 'use',
            label: `Gunakan di ${this.carriedItem.targetLabel}`,
            dist: d,
            targetId: targetPed.id,
          };
        }
      }
    }

    // 3. Nearby pickupable educational object (Bahasa Indonesia)
    let bestPickup: Grade1ActivePickup | null = null;
    let bestPickupDist = 2.6;
    for (const item of rt.pickups) {
      if (item.state !== 'world') continue;
      const d = Math.hypot(item.x - this.playerPos.x, item.z - this.playerPos.z);
      if (d < bestPickupDist) {
        bestPickupDist = d;
        bestPickup = item;
      }
    }
    if (bestPickup) {
      return {
        kind: 'pickup',
        label: this.carriedItem ? `Tukar ${bestPickup.shortLabel}` : `Ambil ${bestPickup.shortLabel}`,
        dist: bestPickupDist,
        targetId: bestPickup.id,
      };
    }

    // 4. Playground Swing interactive boost (only when Playground exists)
    if (rt.swingPos) {
      const dSwing = Math.hypot(
        rt.swingPos.x - this.playerPos.x,
        rt.swingPos.z - this.playerPos.z
      );
      if (dSwing < 3.0) {
        return {
          kind: 'swing',
          label: 'Dorong Ayunan',
          dist: dSwing,
        };
      }
    }

    return null;
  }

  private clearCarriedAttachMesh() {
    if (this.carriedAttachMesh) {
      this.hero.bodyGroup.remove(this.carriedAttachMesh);
      this.carriedAttachMesh = null;
    }
  }

  private pickupGrade1Item(item: Grade1ActivePickup) {
    if (item.state !== 'world') return;

    if (this.carriedItem) {
      const prev = this.carriedItem;
      prev.state = 'world';
      prev.mesh.visible = true;
      this.clearCarriedAttachMesh();
      this.carriedItem = null;
    }

    item.state = 'carried';
    item.mesh.visible = false;
    this.carriedItem = item;

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const built = createCarriedItemMesh(item.kind, item.colorHex, maxAniso);
    this.disposables.push(...built.disposables);
    built.group.position.set(0, 0.84, 0.56);
    built.group.scale.setScalar(0.95);
    this.hero.bodyGroup.add(built.group);
    this.carriedAttachMesh = built.group;

    if (this.grade1Bag) {
      this.grade1Bag.lettersFound += 1;
    }

    sound3d.playScroll();
    this.triggerPlayerPose('picking-up', 0.75);
    this.spawnDustBurst(item.x, item.y, item.z, 7, item.colorHex);
    this.callbacks.onGrade1Event?.({
      type: 'pickup',
      message: `Kamu mengambil ${item.name}! Antar & gunakan di ${item.targetLabel}.`,
      rewardCoins: 0,
      rewardScore: 10,
      rewardXp: 0,
      bagState: this.grade1Bag ? structuredClone(this.grade1Bag) : undefined,
    });
  }

  private useCarriedGrade1Item(pedestal: Grade1TargetPedestal) {
    const item = this.carriedItem;
    if (!item || item.targetZoneId !== pedestal.id) return;

    item.state = 'used';
    this.carriedItem = null;
    this.clearCarriedAttachMesh();

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const display = createCarriedItemMesh(item.kind, item.colorHex, maxAniso);
    this.disposables.push(...display.disposables);
    const existingCount = pedestal.displayAnchor.children.length;
    display.group.position.set((existingCount - 0.5) * 0.42, 0, 0);
    display.group.scale.setScalar(0.85);
    pedestal.displayAnchor.add(display.group);

    if (this.grade1Bag) {
      this.grade1Bag.wordsAssembled += 1;
    }

    sound3d.playMissionComplete();
    this.triggerPlayerPose('putting-down', 0.7);
    this.spawnDustBurst(pedestal.x, pedestal.y + 1.3, pedestal.z, 12, 0xfbbf24);
    const isBook = item.kind === 'storybook';
    this.callbacks.onGrade1Event?.({
      type: 'use',
      message: item.learnMessage,
      rewardCoins: isBook ? 20 : 15,
      rewardScore: isBook ? 100 : 80,
      rewardXp: isBook ? 25 : 20,
      completedPickupId: item.id,
      bagState: this.grade1Bag ? structuredClone(this.grade1Bag) : undefined,
    });
  }

  private executeCustomGrade1Node(node: Grade1InteractiveNode) {
    const bag = this.grade1Bag;
    if (!bag) return;
    this.grade1ActionAnimTimer = 0.55;
    const gy = getWalkableHeight(node.x, node.z, 1);

    if (node.category === 'fruit-tree' && node.detachableFruits) {
      this.triggerPlayerPose('picking-up', 0.75);
      const nextFruit = node.detachableFruits.find((f) => !f.picked);
      if (!nextFruit) {
        this.callbacks.onGrade1Event?.({
          type: 'custom-interact',
          message: `Semua buah di ${node.label} sudah dipetik! Cek pohon lain atau pilah keranjang.`,
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          bagState: structuredClone(bag),
        });
        return;
      }
      nextFruit.picked = true;
      nextFruit.mesh.visible = false;
      if (nextFruit.isRotten) {
        bag.rottenFruits += 1;
      } else {
        bag.goodFruits += 1;
      }
      sound3d.playCoin();
      this.spawnDustBurst(node.x, gy + 1.8, node.z, 8, nextFruit.isRotten ? 0x92400e : 0xef4444);
      this.callbacks.onGrade1Event?.({
        type: 'custom-interact',
        message: nextFruit.isRotten
          ? `Ups! Terpetik 1 buah busuk! Pisahkan ke Keranjang Buah Busuk (Tas: ${bag.goodFruits} segar, ${bag.rottenFruits} busuk).`
          : `Yey! Memetik 1 buah segar ke tas! (Buah segar di tas: ${bag.goodFruits})`,
        rewardCoins: nextFruit.isRotten ? 2 : 5,
        rewardScore: 25,
        rewardXp: 6,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'fruit-basket') {
      this.triggerPlayerPose('putting-down', 0.65);
      if (node.isRotten) {
        if (bag.rottenFruits > 0) {
          const cnt = bag.rottenFruits;
          bag.rottenFruits = 0;
          sound3d.playSortSuccess();
          this.spawnDustBurst(node.x, gy + 1.2, node.z, 10, 0xf59e0b);
          this.callbacks.onGrade1Event?.({
            type: 'custom-interact',
            message: `Bagus! Kamu memilah ${cnt} buah busuk. Sisa buah segar di tas: ${bag.goodFruits}!`,
            rewardCoins: cnt * 8,
            rewardScore: cnt * 40,
            rewardXp: cnt * 10,
            bagState: structuredClone(bag),
          });
        } else {
          this.callbacks.onGrade1Event?.({
            type: 'custom-interact',
            message: 'Tidak ada buah busuk di tasmu. Petik pohon apel/jeruk terlebih dahulu!',
            rewardCoins: 0,
            rewardScore: 0,
            rewardXp: 0,
            bagState: structuredClone(bag),
          });
        }
      } else {
        sound3d.playSortSuccess();
        this.spawnDustBurst(node.x, gy + 1.2, node.z, 8, 0x22c55e);
        this.callbacks.onGrade1Event?.({
          type: 'open-lab',
          openLabKind: 'math-orchard-cube',
          message: `Keranjang Hitung Buah: Kamu punya ${bag.goodFruits} buah segar (dimakan ${bag.eatenFruits})!`,
          rewardCoins: 4,
          rewardScore: 20,
          rewardXp: 5,
          bagState: structuredClone(bag),
        });
      }
      return;
    }

    if (node.category === 'cube-shrine') {
      this.triggerPlayerPose('observing', 1.1);
      sound3d.playScroll();
      this.callbacks.onGrade1Event?.({
        type: 'open-lab',
        openLabKind: 'math-orchard-cube',
        message: node.detailText,
        rewardCoins: 5,
        rewardScore: 25,
        rewardXp: 8,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'trash-item') {
      this.triggerPlayerPose('picking-up', 0.75);
      node.completed = true;
      node.mesh.visible = false;
      bag.trashCollected += 1;
      this.grade1TrashQueue.push(Boolean(node.isOrganic));
      sound3d.playCoin();
      this.spawnDustBurst(node.x, gy + 0.6, node.z, 7, node.isOrganic ? 0x16a34a : 0xfacc15);
      this.callbacks.onGrade1Event?.({
        type: 'custom-interact',
        message: node.detailText,
        rewardCoins: 4,
        rewardScore: 20,
        rewardXp: 6,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'trash-bin-organic' || node.category === 'trash-bin-anorganic') {
      this.triggerPlayerPose('putting-down', 0.65);
      const targetOrg = node.category === 'trash-bin-organic';
      const idx = this.grade1TrashQueue.findIndex((isOrg) => isOrg === targetOrg);
      if (idx !== -1) {
        this.grade1TrashQueue.splice(idx, 1);
        bag.trashSorted += 1;
        sound3d.playSortSuccess();
        this.spawnDustBurst(node.x, gy + 1.3, node.z, 10, targetOrg ? 0x16a34a : 0xfacc15);
        this.callbacks.onGrade1Event?.({
          type: 'custom-interact',
          message: `Tepat sekali! ${node.detailText} (+10 Koin, +15 XP)`,
          rewardCoins: 10,
          rewardScore: 50,
          rewardXp: 15,
          bagState: structuredClone(bag),
        });
      } else if (this.grade1TrashQueue.length > 0) {
        sound3d.playAlertCue();
        this.callbacks.onGrade1Event?.({
          type: 'custom-interact',
          message: `Ups, di tasmu ada sampah ${
            this.grade1TrashQueue[0] ? 'Organik (taruh di Tong Hijau)' : 'Anorganik (taruh di Tong Kuning)'
          }!`,
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          bagState: structuredClone(bag),
        });
      } else {
        this.callbacks.onGrade1Event?.({
          type: 'custom-interact',
          message: 'Pungut sampah yang berserakan di Kota Kebersamaan dahulu!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          bagState: structuredClone(bag),
        });
      }
      return;
    }

    if (node.category === 'water-well') {
      this.triggerPlayerPose('watering', 1.1);
      bag.hasWaterBucket = true;
      sound3d.playWaterSplash();
      this.spawnDustBurst(node.x, gy + 1.1, node.z, 8, 0x38bdf8);
      this.callbacks.onGrade1Event?.({
        type: 'custom-interact',
        message: node.detailText,
        rewardCoins: 3,
        rewardScore: 15,
        rewardXp: 5,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'plant-plot' && node.stageMeshes) {
      this.triggerPlayerPose('watering', 1.15);
      const stage = node.plantStage ?? 0;
      if (stage === 0) {
        node.plantStage = 1;
        bag.seedsPlanted += 1;
        node.stageMeshes.forEach((m, i) => {
          m.visible = i === 1;
        });
        sound3d.playWaterSplash();
        this.spawnDustBurst(node.x, gy + 0.5, node.z, 8, 0x22c55e);
        this.callbacks.onGrade1Event?.({
          type: 'custom-interact',
          message: 'Biji bertunas hijau! Ambil air sumur lalu siram lagi agar mekar menjadi bunga!',
          rewardCoins: 6,
          rewardScore: 30,
          rewardXp: 10,
          bagState: structuredClone(bag),
        });
      } else if (stage === 1) {
        node.plantStage = 2;
        bag.hasWaterBucket = false;
        bag.plantsWatered += 1;
        bag.plantsBloomed += 1;
        node.stageMeshes.forEach((m, i) => {
          m.visible = i === 2;
        });
        sound3d.playMissionComplete();
        this.spawnDustBurst(node.x, gy + 1.0, node.z, 12, 0xfacc15);
        this.callbacks.onGrade1Event?.({
          type: 'custom-interact',
          message: `Bunga mekar sempurna! ${node.detailText} (+12 Koin, +18 XP)`,
          rewardCoins: 12,
          rewardScore: 70,
          rewardXp: 18,
          bagState: structuredClone(bag),
        });
      } else {
        this.callbacks.onGrade1Event?.({
          type: 'custom-interact',
          message: `${node.label} sudah mekar indah! Coba siram petak tanaman lainnya.`,
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          bagState: structuredClone(bag),
        });
      }
      return;
    }

    if (node.category === 'hygiene-sink') {
      bag.handWashed = true;
      sound3d.playWaterSplash();
      this.spawnDustBurst(node.x, gy + 1.1, node.z, 9, 0x38bdf8);
      this.callbacks.onGrade1Event?.({
        type: 'custom-interact',
        message: node.detailText,
        rewardCoins: 8,
        rewardScore: 40,
        rewardXp: 12,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'color-fountain') {
      this.triggerPlayerPose('clapping', 0.9);
      bag.colorsMixed += 1;
      sound3d.playMissionComplete();
      this.spawnDustBurst(node.x, gy + 1.3, node.z, 14, 0xe879f9);
      this.callbacks.onGrade1Event?.({
        type: 'custom-interact',
        message: node.detailText,
        rewardCoins: 8,
        rewardScore: 40,
        rewardXp: 10,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'art-easel') {
      sound3d.playScroll();
      this.callbacks.onGrade1Event?.({
        type: 'open-lab',
        openLabKind: 'seni-studio-music',
        message: node.detailText,
        rewardCoins: 5,
        rewardScore: 20,
        rewardXp: 5,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'music-bar') {
      this.triggerPlayerPose('clapping', 0.7);
      const idx = node.noteIndex ?? 0;
      const timber = this.config.grade1Context?.subjectId === 'muatan-lokal' ? 'angklung' : 'xylophone';
      sound3d.playInstrumentNote(idx, timber);
      bag.musicNotesPlayed += 1;
      if (node.statusMesh) {
        node.statusMesh.position.y = 0.14;
        window.setTimeout(() => {
          if (!this.disposed && node.statusMesh) node.statusMesh.position.y = 0.22;
        }, 140);
      }
      this.spawnDustBurst(node.x, gy + 0.5, node.z, 5, 0xfbbf24);
      this.callbacks.onGrade1Event?.({
        type: 'custom-interact',
        message: node.detailText,
        rewardCoins: 2,
        rewardScore: 15,
        rewardXp: 4,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'english-object') {
      const word = node.englishWord ?? node.label;
      sound3d.speakEnglish(word);
      const firstTime = !bag.stepsDiscovered.includes(node.id);
      if (firstTime) {
        bag.stepsDiscovered.push(node.id);
        bag.englishWordsHeard += 1;
      }
      this.spawnDustBurst(node.x, gy + 1.2, node.z, 8, 0x818cf8);
      this.callbacks.onGrade1Event?.({
        type: 'custom-interact',
        message: node.detailText,
        rewardCoins: firstTime ? 8 : 1,
        rewardScore: firstTime ? 40 : 5,
        rewardXp: firstTime ? 12 : 2,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'shape-color-pad') {
      sound3d.playScroll();
      this.callbacks.onGrade1Event?.({
        type: 'open-lab',
        openLabKind: 'shape-color-sort',
        message: node.detailText,
        rewardCoins: 4,
        rewardScore: 20,
        rewardXp: 6,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'reading-spot') {
      sound3d.playScroll();
      this.callbacks.onGrade1Event?.({
        type: 'open-lab',
        openLabKind: 'sentence-builder',
        message: node.detailText,
        rewardCoins: 4,
        rewardScore: 20,
        rewardXp: 6,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'market-shop' || node.category === 'fruit-stall') {
      sound3d.playCashRegister();
      this.callbacks.onGrade1Event?.({
        type: 'open-lab',
        openLabKind: 'market-money-shop',
        message: node.detailText,
        rewardCoins: 0,
        rewardScore: 10,
        rewardXp: 4,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'pjok-coach') {
      this.triggerPlayerPose('tossing-ball', 1.2);
      sound3d.playPoseSuccess();
      this.callbacks.onGrade1Event?.({
        type: 'open-lab',
        openLabKind: 'pjok-motion-coach',
        message: node.detailText,
        rewardCoins: 4,
        rewardScore: 20,
        rewardXp: 6,
        bagState: structuredClone(bag),
      });
      return;
    }

    if (node.category === 'exam-throne') {
      this.triggerPlayerPose('celebrating', 1.5);
      sound3d.playMissionComplete();
      this.callbacks.onGrade1Event?.({
        type: 'open-lab',
        openLabKind: 'combined-exam',
        message: node.detailText,
        rewardCoins: 0,
        rewardScore: 0,
        rewardXp: 0,
        bagState: structuredClone(bag),
      });
      return;
    }

    // Default: learn-spot, animal-feed, hurdle, balance-beam inspect
    this.triggerPlayerPose('observing', 1.0);
    const firstVisit = !bag.stepsDiscovered.includes(node.id);
    if (firstVisit) {
      bag.stepsDiscovered.push(node.id);
    }
    sound3d.playMissionComplete();
    this.spawnDustBurst(node.x, gy + 1.2, node.z, 10, 0xfbbf24);
    this.callbacks.onGrade1Event?.({
      type: 'custom-interact',
      message: node.detailText,
      rewardCoins: firstVisit ? 10 : 2,
      rewardScore: firstVisit ? 50 : 10,
      rewardXp: firstVisit ? 15 : 3,
      bagState: structuredClone(bag),
    });
  }

  private executeGrade1Action(action: Grade1NearbyAction) {
    if (action.kind === 'stand-up') {
      this.standUpFromSeat();
      return;
    }
    if (action.kind === 'sit-seat' && action.targetId) {
      const seats = this.activeInterior
        ? this.activeInterior.seats
        : (this.grade1Runtime?.exteriorSeats ?? []);
      const seat = seats.find((s) => s.id === action.targetId);
      if (seat) this.sitInSeat(seat);
      return;
    }
    if (action.kind === 'enter-door' && action.targetId) {
      this.enterInterior(action.targetId as Grade1InteriorId);
      return;
    }
    if (action.kind === 'exit-door') {
      this.exitInterior();
      return;
    }
    const rt = this.grade1Runtime;
    if (!rt) return;

    if (action.kind === 'custom-node' && action.targetId) {
      const node = this.activeInterior
        ? this.activeInterior.stations.find((n) => n.id === action.targetId)
        : rt.interactiveNodes.find((n) => n.id === action.targetId);
      if (node) this.executeCustomGrade1Node(node);
    } else if (action.kind === 'use' && action.targetId) {
      const ped = rt.pedestals.find((p) => p.id === action.targetId);
      if (ped) this.useCarriedGrade1Item(ped);
    } else if (action.kind === 'pickup' && action.targetId) {
      const item = rt.pickups.find((p) => p.id === action.targetId);
      if (item) this.pickupGrade1Item(item);
    } else if (action.kind === 'swing' && rt.swingPos) {
      rt.swingBoost = 0.42;
      sound3d.playCoin();
      this.spawnDustBurst(
        rt.swingPos.x,
        getWalkableHeight(rt.swingPos.x, rt.swingPos.z) + 1.0,
        rt.swingPos.z,
        6,
        0x38bdf8
      );
      this.callbacks.onGrade1Event?.({
        type: 'swing',
        message: 'Wush! Ayunan Ceria berayun tinggi di Taman Bermain!',
        rewardCoins: 0,
        rewardScore: 10,
        rewardXp: 0,
      });
    }
  }

  private completeStation(st: ActiveChapterStation) {
    if (st.completed) return;
    st.completed = true;
    this.triggerPlayerPose(st.def.actionType === 'collect' ? 'picking-up' : 'observing', 0.8);

    if (st.def.actionType === 'collect') {
      st.root.visible = false;
      sound3d.playScroll();
      this.spawnDustBurst(st.x, st.y + 0.8, st.z, 9, 0xfbbf24);
    } else {
      // Visual state change for activated or pushed station
      sound3d.playMissionComplete();
      const indMat = st.indicator.material as THREE.MeshStandardMaterial;
      indMat.color.setHex(0x10b981);
      indMat.emissive.setHex(0x059669);
      indMat.emissiveIntensity = 0.9;
      if (st.def.modelKind === 'circuit-switch' && st.activeVisual) {
        st.activeVisual.rotation.z = 0.55;
      }
      if (st.targetRing) {
        (st.targetRing.material as THREE.MeshBasicMaterial).color.setHex(0xfbbf24);
      }
      this.spawnDustBurst(st.x, st.y + 0.9, st.z, 10, 0x34d399);
    }

    this.callbacks.onStationCompleted?.(st.def);
  }

  private nudgePushStation(st: ActiveChapterStation, stepDist: number) {
    if (st.completed) return;
    let dx = st.x - this.playerPos.x;
    let dz = st.z - this.playerPos.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.001) {
      dx = Math.sin(this.playerYaw);
      dz = Math.cos(this.playerYaw);
    } else {
      dx /= len;
      dz /= len;
    }

    const nextX = THREE.MathUtils.clamp(st.x + dx * stepDist, -42, 42);
    const nextZ = THREE.MathUtils.clamp(st.z + dz * stepDist, -42, 42);
    const passable = this.isBridgePassable();
    if (!isInDeepWater(nextX, nextZ, this.grade, passable)) {
      st.x = nextX;
      st.z = nextZ;
      st.y = getWalkableHeight(st.x, st.z, this.grade, passable);
      st.root.position.set(st.x, st.y, st.z);
      if (st.pushDustCooldown <= 0) {
        st.pushDustCooldown = 0.22;
        sound3d.playFootstep(false);
        this.spawnDustBurst(st.x, st.y, st.z, 3, 0xd6d3d1);
      }
    }

    const distToTarget = Math.hypot(st.x - st.targetX, st.z - st.targetZ);
    if (distToTarget <= 1.45) {
      st.x = st.targetX;
      st.z = st.targetZ;
      st.y = getWalkableHeight(st.x, st.z, this.grade, passable);
      st.root.position.set(st.x, st.y, st.z);
      this.completeStation(st);
    }
  }

  // ==================== GRADE 2 DESA CERIA SIMULATION LOGIC ====================
  private syncGrade2Visuals() {
    const rt = this.grade2Runtime;
    const sim = this.grade2SimState;
    if (!rt || !sim) return;

    rt.nodes.forEach((node) => {
      if (node.kind === 'farm-plot' && node.stageMeshes) {
        const st = sim.plotStages[node.id] ?? 0;
        node.stageMeshes.forEach((m, idx) => {
          m.visible = idx === st;
        });
      } else if (node.kind === 'kitchen-share' && node.plateGroups) {
        const served = sim.portionsShared > 0;
        node.plateGroups.forEach((pg) => {
          pg.visible = served;
        });
      } else if (node.kind === 'workshop-measure' && node.statusMesh) {
        const measured = sim.measuredItems.includes(node.id);
        const mat = node.statusMesh.material as THREE.MeshStandardMaterial;
        mat.color.setHex(measured ? 0x10b981 : 0xfacc15);
        mat.emissive.setHex(measured ? 0x059669 : 0xd97706);
      }
    });
  }

  private getGrade2NodeDynamicLabel(node: Grade2InteractiveNode): string {
    const sim = this.grade2SimState;
    if (!sim) return node.label;
    if (node.kind === 'farm-plot') {
      const stage = sim.plotStages[node.id] ?? 0;
      const crop = node.cropType ?? 'wortel';
      const cname = crop.charAt(0).toUpperCase() + crop.slice(1);
      if (stage === 0) return `Tanam ${cname}`;
      if (stage === 1) return sim.fertilizerBag > 0 ? `Beri Pupuk ${cname}` : `Siram ${cname}`;
      return `Panen ${cname}`;
    }
    if (node.kind === 'animal-pen') {
      return `${node.label} (${sim.feedBag})`;
    }
    return node.label;
  }

  private findNearestGrade2Node(): Grade2InteractiveNode | null {
    const rt = this.grade2Runtime;
    if (!rt) return null;
    let best: Grade2InteractiveNode | null = null;
    let bestDist = 999;
    for (const node of rt.nodes) {
      const d = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
      if (d < node.radius && d < bestDist) {
        bestDist = d;
        best = node;
      }
    }
    return best;
  }

  private interactGrade2Node(node: Grade2InteractiveNode) {
    const sim = this.grade2SimState;
    const rt = this.grade2Runtime;
    if (!sim || !rt) return;

    this.grade2ActionAnimTimer = 0.55;
    const gy = getWalkableHeight(node.x, node.z, 2);

    if (node.kind === 'house-number') {
      const n = node.houseNumber ?? 15;
      const puluhan = Math.floor(n / 10) * 10;
      const satuan = n % 10;
      const firstVisit = !sim.housesVisited.includes(node.id);
      if (firstVisit) sim.housesVisited.push(node.id);
      saveGrade2SimState(sim);
      sound3d.playCoin();
      this.spawnDustBurst(node.x, gy + 0.8, node.z, 8, 0x10b981);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Rumah No. ${n}: ${puluhan} (puluhan) + ${satuan} (satuan)! (${sim.housesVisited.length}/4 rumah dicek)`,
        rewardCoins: firstVisit ? 12 : 2,
        rewardScore: firstVisit ? 60 : 10,
        rewardXp: firstVisit ? 15 : 4,
        simState: structuredClone(sim),
      });
      return;
    }

    if (node.kind === 'farm-plot') {
      const crop = node.cropType ?? 'wortel';
      const cname = crop.charAt(0).toUpperCase() + crop.slice(1);
      const stage = sim.plotStages[node.id] ?? 0;

      if (stage === 0) {
        sim.plotStages[node.id] = 1;
        node.growTimer = 0;
        this.syncGrade2Visuals();
        saveGrade2SimState(sim);
        sound3d.playCoin();
        this.spawnDustBurst(node.x, gy + 0.4, node.z, 7, 0x22c55e);
        this.callbacks.onGrade2Event?.({
          type: 'sim',
          message: `Menanam bibit ${cname}! Tunggu beberapa detik atau siram agar siap panen.`,
          rewardCoins: 2,
          rewardScore: 15,
          rewardXp: 5,
          simState: structuredClone(sim),
        });
      } else if (stage === 1) {
        if (sim.fertilizerBag > 0) {
          sim.fertilizerBag -= 1;
          sim.plotStages[node.id] = 2;
          node.growTimer = 0;
          this.syncGrade2Visuals();
          saveGrade2SimState(sim);
          sound3d.playScroll();
          this.spawnDustBurst(node.x, gy + 0.6, node.z, 10, 0x4ade80);
          this.callbacks.onGrade2Event?.({
            type: 'sim',
            message: `${cname} dipupuk dan langsung tumbuh subur siap panen!`,
            rewardCoins: 0,
            rewardScore: 15,
            rewardXp: 5,
            simState: structuredClone(sim),
          });
        } else {
          node.growTimer = (node.growTimer ?? 0) + 2.5;
          if (node.growTimer >= 4.5) {
            sim.plotStages[node.id] = 2;
            node.growTimer = 0;
            this.syncGrade2Visuals();
            saveGrade2SimState(sim);
            sound3d.playScroll();
            this.callbacks.onGrade2Event?.({
              type: 'sim',
              message: `${cname} segar siap dipanen sekarang!`,
              rewardCoins: 0,
              rewardScore: 10,
              rewardXp: 5,
              simState: structuredClone(sim),
            });
          } else {
            sound3d.playCoin();
            this.spawnDustBurst(node.x, gy + 0.4, node.z, 6, 0x38bdf8);
            this.callbacks.onGrade2Event?.({
              type: 'sim',
              message: `Menyiram tanaman ${cname}... hampir matang!`,
              rewardCoins: 0,
              rewardScore: 5,
              rewardXp: 2,
              simState: structuredClone(sim),
            });
          }
        }
      } else {
        const yieldQty = 3;
        sim.cropsInBag[crop] = (sim.cropsInBag[crop] ?? 0) + yieldQty;
        sim.totalHarvested += yieldQty;
        sim.plotStages[node.id] = 0;
        node.growTimer = 0;
        this.syncGrade2Visuals();
        saveGrade2SimState(sim);
        sound3d.playMissionComplete();
        this.spawnDustBurst(node.x, gy + 0.6, node.z, 12, 0xfbbf24);
        this.callbacks.onGrade2Event?.({
          type: 'sim',
          message: `Panen +${yieldQty} ${cname}! Total panen: ${sim.totalHarvested}. Jual di Pasar atau simpan di Gudang!`,
          rewardCoins: 8,
          rewardScore: 60,
          rewardXp: 15,
          simState: structuredClone(sim),
        });
      }
      return;
    }

    if (node.kind === 'place-value-table') {
      const total =
        sim.cropsInBag.wortel +
        sim.cropsInBag.jagung +
        sim.cropsInBag.kubis +
        sim.cropsInBag.tomat;
      if (total === 0) {
        sound3d.playCoin();
        this.callbacks.onGrade2Event?.({
          type: 'sim',
          message: 'Keranjang panen masih kosong. Panen sayur di kebun terlebih dahulu lalu hitung nilai tempatnya!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          simState: structuredClone(sim),
        });
        return;
      }
      const puluhan = Math.floor(total / 10);
      const satuan = total % 10;
      sound3d.playMissionComplete();
      this.spawnDustBurst(node.x, gy + 0.8, node.z, 9, 0x16a34a);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Hasil panen di tas = ${total} sayur (${puluhan} ikatan puluhan + ${satuan} satuan)!`,
        rewardCoins: 10,
        rewardScore: 55,
        rewardXp: 15,
        simState: structuredClone(sim),
      });
      return;
    }

    if (node.kind === 'market-stall') {
      sound3d.playNpcTalk();
      this.callbacks.onGrade2Event?.({
        type: 'open-market',
        message: 'Selamat datang di Pasar Tradisional Desa Ceria!',
        rewardCoins: 0,
        rewardScore: 0,
        rewardXp: 0,
        simState: structuredClone(sim),
      });
      return;
    }

    if (node.kind === 'gudang-store') {
      const bagTotal =
        sim.cropsInBag.wortel +
        sim.cropsInBag.jagung +
        sim.cropsInBag.kubis +
        sim.cropsInBag.tomat;
      if (bagTotal > 0) {
        const before = sim.cropsStoredInGudang;
        sim.cropsStoredInGudang += bagTotal;
        sim.cropsInBag = { wortel: 0, jagung: 0, kubis: 0, tomat: 0 };
        saveGrade2SimState(sim);
        sound3d.playMissionComplete();
        this.spawnDustBurst(node.x, gy + 0.8, node.z, 10, 0xd97706);
        this.callbacks.onGrade2Event?.({
          type: 'sim',
          message: `Menyimpan +${bagTotal} sayur ke Gudang (${before} + ${bagTotal} = ${sim.cropsStoredInGudang} stok)!`,
          rewardCoins: bagTotal * 4,
          rewardScore: 65,
          rewardXp: 16,
          simState: structuredClone(sim),
        });
      } else {
        const taken = Math.min(3, sim.cropsStoredInGudang);
        const sisa = sim.cropsStoredInGudang - taken;
        sound3d.playCoin();
        this.callbacks.onGrade2Event?.({
          type: 'sim',
          message: `Stok Gudang: ${sim.cropsStoredInGudang} sayur. Jika diambil ${taken} untuk dapur: ${sim.cropsStoredInGudang} - ${taken} = ${sisa}!`,
          rewardCoins: 4,
          rewardScore: 25,
          rewardXp: 8,
          simState: structuredClone(sim),
        });
      }
      return;
    }

    if (node.kind === 'hay-feed') {
      sim.feedBag = Math.min(15, sim.feedBag + 3);
      saveGrade2SimState(sim);
      sound3d.playScroll();
      this.spawnDustBurst(node.x, gy + 0.6, node.z, 8, 0xfacc15);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Mengambil +3 rumput pakan gratis! Pakan di tas sekarang: ${sim.feedBag}.`,
        rewardCoins: 0,
        rewardScore: 15,
        rewardXp: 5,
        simState: structuredClone(sim),
      });
      return;
    }

    if (node.kind === 'animal-pen') {
      if (sim.feedBag <= 0) {
        sound3d.playCoin();
        this.callbacks.onGrade2Event?.({
          type: 'sim',
          message: 'Pakan di tas habis! Ambil rumput di Tumpukan Pakan sebelah kandang atau beli di Pasar.',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          simState: structuredClone(sim),
        });
        return;
      }
      const kind = node.animalKind ?? 'sapi';
      sim.feedBag -= 1;
      sim.animalsFedCount += 1;
      sim.eggsAndMilk += 2;
      rt.animals.forEach((a) => {
        if (a.kind === kind) a.happyTimer = 2.4;
      });
      saveGrade2SimState(sim);
      sound3d.playMissionComplete();
      this.spawnDustBurst(node.x, gy + 0.8, node.z, 10, 0x8b5cf6);
      const countText =
        kind === 'ayam'
          ? '3 ayam × 2 butir = 6 telur segar'
          : kind === 'sapi'
          ? '2 sapi × 2 botol = 4 botol susu'
          : '2 kambing × 2 mangkuk = 4 porsi rumput';
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `Memberi makan ${kind}! (${countText} · +2 Susu/Telur di tas)`,
        rewardCoins: 10,
        rewardScore: 65,
        rewardXp: 15,
        simState: structuredClone(sim),
      });
      return;
    }

    if (node.kind === 'kitchen-share') {
      const usedBought = sim.cakeBag > 0;
      if (usedBought) {
        sim.cakeBag -= 1;
      }
      sim.portionsShared += 12;
      this.syncGrade2Visuals();
      saveGrade2SimState(sim);
      sound3d.playMissionComplete();
      this.spawnDustBurst(node.x, gy + 0.8, node.z, 12, 0xec4899);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: '12 kue dibagikan sama rata ke 3 meja warga → 12 : 3 = 4 kue per meja!',
        rewardCoins: 12,
        rewardScore: 75,
        rewardXp: 18,
        simState: structuredClone(sim),
      });
      return;
    }

    if (node.kind === 'workshop-measure') {
      const firstMeasure = !sim.measuredItems.includes(node.id);
      if (firstMeasure) sim.measuredItems.push(node.id);
      this.syncGrade2Visuals();
      saveGrade2SimState(sim);
      sound3d.playMissionComplete();
      this.spawnDustBurst(node.x, gy + 0.9, node.z, 10, 0x0284c7);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `${node.measureAnswer ?? node.label} (${sim.measuredItems.length}/3 benda diukur)`,
        rewardCoins: firstMeasure ? 14 : 3,
        rewardScore: firstMeasure ? 75 : 15,
        rewardXp: firstMeasure ? 18 : 5,
        simState: structuredClone(sim),
      });
      return;
    }

    if (node.kind === 'shape-pedestal') {
      const firstInspect = !sim.shapesInspected.includes(node.id);
      if (firstInspect) sim.shapesInspected.push(node.id);
      saveGrade2SimState(sim);
      sound3d.playMissionComplete();
      this.spawnDustBurst(node.x, gy + 1.4, node.z, 12, 0x4f46e5);
      this.callbacks.onGrade2Event?.({
        type: 'sim',
        message: `${node.shapeInfo ?? node.label} (${sim.shapesInspected.length}/3 bangun diamati)`,
        rewardCoins: firstInspect ? 14 : 3,
        rewardScore: firstInspect ? 75 : 15,
        rewardXp: firstInspect ? 18 : 5,
        simState: structuredClone(sim),
      });
    }
  }

  // ==================== GRADE 3 HUTAN MISTERI EXPLORATION LOGIC ====================
  private findNearestGrade3Node(): Grade3InteractiveNode | null {
    const rt = this.grade3Runtime;
    if (!rt) return null;
    let best: Grade3InteractiveNode | null = null;
    let bestDist = 3.0;
    for (const node of rt.nodes) {
      const d = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
      if (d < bestDist) {
        bestDist = d;
        best = node;
      }
    }
    return best;
  }

  private interactGrade3Node(node: Grade3InteractiveNode) {
    const exp = this.grade3ExpState;
    if (!exp) return;

    const gy = getWalkableHeight(node.x, node.z, 3, true);
    let rewardCoins = 0;
    let rewardScore = 0;
    let rewardXp = 0;

    if (node.kind === 'clue-scroll' && !exp.cluesFound.includes(node.id)) {
      exp.cluesFound.push(node.id);
      rewardCoins = 8;
      rewardScore = 40;
      rewardXp = 12;
    } else if (
      (node.kind === 'specimen-pod' || node.kind === 'lab-scanner') &&
      !exp.specimensObserved.includes(node.id)
    ) {
      exp.specimensObserved.push(node.id);
      rewardCoins = 8;
      rewardScore = 45;
      rewardXp = 12;
    } else if (node.kind === 'hidden-relic' && !exp.relicsFound.includes(node.id)) {
      exp.relicsFound.push(node.id);
      rewardCoins = 12;
      rewardScore = 60;
      rewardXp = 15;
    }

    if (node.statusMesh) {
      node.statusMesh.scale.setScalar(1.25);
    }

    saveGrade3ExpState(exp);
    sound3d.playScroll();
    this.spawnDustBurst(node.x, gy + 0.9, node.z, 9, 0x34d399);

    const snapshot = structuredClone(exp);
    if (node.kind === 'kuil-altar' && exp.challengesSolved.includes(8)) {
      this.callbacks.onGrade3Event?.({
        type: 'open-kuil-exam',
        bab: 8,
        message: 'Altar Kuil Pengetahuan siap! Mulai Ujian Akhir Kelas 3!',
        rewardCoins,
        rewardScore,
        rewardXp,
        expState: snapshot,
      });
      return;
    }

    this.callbacks.onGrade3Event?.({
      type: 'open-challenge',
      bab: node.bab,
      message: node.message,
      rewardCoins,
      rewardScore,
      rewardXp,
      expState: snapshot,
    });
  }

  // ==================== GRADE 4 PULAU TEKA-TEKI PUZZLE LOGIC ====================
  private findNearestGrade4Node(): Grade4InteractiveNode | null {
    const rt = this.grade4Runtime;
    const puz = this.grade4PuzzleState;
    if (!rt || !puz) return null;

    let best: Grade4InteractiveNode | null = null;
    let bestDist = 3.0;
    for (const node of rt.nodes) {
      if (node.kind === 'crystal-pickup') {
        if (
          node.crystalId &&
          (this.carriedCrystalId === node.crystalId ||
            puz.placedCrystals.includes(node.crystalId))
        ) {
          continue;
        }
      }
      if (node.kind === 'crystal-pedestal' && node.crystalId) {
        if (puz.placedCrystals.includes(node.crystalId)) {
          continue;
        }
      }
      const d = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
      if (d < bestDist) {
        bestDist = d;
        best = node;
      }
    }
    return best;
  }

  private clearCarriedCrystalMesh() {
    if (this.carriedCrystalMesh) {
      this.hero.bodyGroup.remove(this.carriedCrystalMesh);
      this.carriedCrystalMesh = null;
    }
  }

  private interactGrade4Node(node: Grade4InteractiveNode) {
    const puz = this.grade4PuzzleState;
    const rt = this.grade4Runtime;
    if (!puz || !rt) return;

    const gy = getWalkableHeight(node.x, node.z, 4, this.isBridgePassable());

    if (node.kind === 'maze-clue') {
      const firstTime = !puz.mazeClues.includes(node.id);
      if (firstTime) {
        puz.mazeClues.push(node.id);
        saveGrade4PuzzleState(puz);
      }
      sound3d.playChime(puz.mazeClues.length);
      this.spawnDustBurst(node.x, gy + 0.9, node.z, 8, 0x38bdf8);
      this.callbacks.onGrade4Event?.({
        type: 'puzzle',
        bab: 2,
        message: `${node.label} dicatat! (${puz.mazeClues.length}/3 batu petunjuk labirin ditemukan)`,
        rewardCoins: firstTime ? 6 : 0,
        rewardScore: firstTime ? 35 : 0,
        rewardXp: firstTime ? 10 : 0,
        puzzleState: structuredClone(puz),
        carriedCrystalLabel: this.carriedCrystalLabel,
      });
      return;
    }

    if (node.kind === 'maze-exit') {
      sound3d.playScroll();
      this.callbacks.onGrade4Event?.({
        type: 'open-puzzle',
        bab: 2,
        message: 'Kamu mencapai pusat Labirin Angka! Pecahkan pola gerbangnya!',
        rewardCoins: 0,
        rewardScore: 0,
        rewardXp: 0,
        puzzleState: structuredClone(puz),
        carriedCrystalLabel: this.carriedCrystalLabel,
      });
      return;
    }

    if (node.kind === 'bridge-lever') {
      if (puz.bridgeExtended) {
        sound3d.playCoin();
        this.callbacks.onGrade4Event?.({
          type: 'puzzle',
          bab: 3,
          message: 'Jembatan Mekanik sudah terbentang menuju Kepulauan Timur!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
      } else {
        sound3d.playScroll();
        this.callbacks.onGrade4Event?.({
          type: 'open-puzzle',
          bab: 3,
          message: 'Tuas Jembatan Mekanik membutuhkan hitungan torsi yang tepat!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
      }
      return;
    }

    if (node.kind === 'pattern-pillar') {
      if (puz.puzzlesSolved.includes(4)) {
        sound3d.playCoin();
        this.callbacks.onGrade4Event?.({
          type: 'puzzle',
          bab: 4,
          message: 'Semua pilar pola 3 → 4 → 5 → 6 sisi sudah aktif!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
        return;
      }

      const expectedOrder = [3, 4, 5, 6];
      const expectedSides = expectedOrder[puz.patternStep] ?? 3;
      if (node.polygonSides === expectedSides) {
        puz.patternStep += 1;
        const pillar = rt.patternPillars.find((pp) => pp.sides === node.polygonSides);
        if (pillar) {
          (pillar.orb.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.95;
        }
        saveGrade4PuzzleState(puz);
        sound3d.playChime(puz.patternStep - 1);
        this.spawnDustBurst(node.x, gy + 1.2, node.z, 10, 0x10b981);

        if (puz.patternStep >= 4) {
          this.markGrade4PuzzleSolved(4);
        } else {
          this.callbacks.onGrade4Event?.({
            type: 'puzzle',
            bab: 4,
            message: `Tepat! ${node.label} aktif (${puz.patternStep}/4). Lanjut ke pilar ${expectedOrder[puz.patternStep]} sisi!`,
            rewardCoins: 5,
            rewardScore: 25,
            rewardXp: 8,
            puzzleState: structuredClone(puz),
            carriedCrystalLabel: this.carriedCrystalLabel,
          });
        }
      } else {
        puz.patternStep = 0;
        rt.patternPillars.forEach((pp) => {
          (pp.orb.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
        });
        saveGrade4PuzzleState(puz);
        sound3d.playCoin();
        this.callbacks.onGrade4Event?.({
          type: 'puzzle',
          bab: 4,
          message: 'Urutan salah! Aktifkan pilar dari sisi tersedikit: Segitiga (3) → Persegi (4) → Segilima (5) → Segienam (6)!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
      }
      return;
    }

    if (node.kind === 'crystal-pickup' && node.crystalId) {
      const crystal = rt.crystals.find((c) => c.id === node.crystalId);
      if (!crystal) return;

      // Return previously carried crystal to its world spot if swapping
      if (this.carriedCrystalId && this.carriedCrystalId !== crystal.id) {
        const prev = rt.crystals.find((c) => c.id === this.carriedCrystalId);
        if (prev) {
          prev.orbMesh.visible = true;
        }
        this.clearCarriedCrystalMesh();
      }

      crystal.orbMesh.visible = false;
      this.carriedCrystalId = crystal.id;
      this.carriedCrystalLabel = crystal.label;
      this.carriedCrystalMesh = createCarriedCrystalMesh(crystal.colorHex);
      this.carriedCrystalMesh.position.set(0, 1.08, 0.56);
      this.hero.bodyGroup.add(this.carriedCrystalMesh);

      sound3d.playScroll();
      this.spawnDustBurst(node.x, gy + 0.9, node.z, 9, crystal.colorHex);
      this.callbacks.onGrade4Event?.({
        type: 'puzzle',
        bab: 5,
        message: `Membawa ${crystal.label}! Bawa ke alas bercahaya sesuai warnanya di Gua Kristal.`,
        rewardCoins: 3,
        rewardScore: 20,
        rewardXp: 6,
        puzzleState: structuredClone(puz),
        carriedCrystalLabel: this.carriedCrystalLabel,
      });
      return;
    }

    if (node.kind === 'crystal-pedestal' && node.crystalId) {
      const crystal = rt.crystals.find((c) => c.id === node.crystalId);
      if (!crystal) return;

      if (this.carriedCrystalId !== crystal.id) {
        sound3d.playCoin();
        this.callbacks.onGrade4Event?.({
          type: 'puzzle',
          bab: 5,
          message: this.carriedCrystalId
            ? `Alas ini khusus untuk ${crystal.label}! Cari alas yang warnanya cocok dengan kristal di tanganmu.`
            : `Ambil ${crystal.label} di pintu Gua Kristal lalu bawa ke alas ini!`,
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
        return;
      }

      const pedGy = getRawTerrainHeight(crystal.pedestalX, crystal.pedestalZ, 4);
      crystal.orbMesh.position.set(crystal.pedestalX, pedGy + 1.25, crystal.pedestalZ);
      crystal.orbMesh.visible = true;
      this.clearCarriedCrystalMesh();
      this.carriedCrystalId = null;
      this.carriedCrystalLabel = null;

      if (!puz.placedCrystals.includes(crystal.id)) {
        puz.placedCrystals.push(crystal.id);
      }
      saveGrade4PuzzleState(puz);
      sound3d.playMissionComplete();
      this.spawnDustBurst(crystal.pedestalX, pedGy + 1.1, crystal.pedestalZ, 12, crystal.colorHex);

      if (puz.placedCrystals.length >= 3 && !puz.puzzlesSolved.includes(5)) {
        this.callbacks.onGrade4Event?.({
          type: 'open-puzzle',
          bab: 5,
          message: 'Semua 3 Kristal Pecahan terpasang! Pecahkan Resonansi Pecahan Gua Kristal!',
          rewardCoins: 15,
          rewardScore: 75,
          rewardXp: 20,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: null,
        });
      } else {
        this.callbacks.onGrade4Event?.({
          type: 'puzzle',
          bab: 5,
          message: `${crystal.label} terpasang di alas! (${puz.placedCrystals.length}/3 kristal)`,
          rewardCoins: 10,
          rewardScore: 50,
          rewardXp: 15,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: null,
        });
      }
      return;
    }

    if (node.kind === 'secret-door') {
      if (node.doorId && puz.doorsUnlocked.includes(node.doorId)) {
        sound3d.playCoin();
        this.callbacks.onGrade4Event?.({
          type: 'puzzle',
          bab: node.bab,
          message: 'Pintu Rahasia sudah terbuka! Masuk dan amati ruang di dalamnya!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
      } else {
        sound3d.playScroll();
        this.callbacks.onGrade4Event?.({
          type: 'open-puzzle',
          bab: node.bab,
          message: 'Pintu Rahasia terkunci oleh segel logika!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
      }
      return;
    }

    if (node.kind === 'puzzle-shrine') {
      sound3d.playScroll();
      this.callbacks.onGrade4Event?.({
        type: 'open-puzzle',
        bab: 1,
        message: 'Kompas Pelabuhan Pulau Utama menunggu kalibrasi!',
        rewardCoins: 0,
        rewardScore: 0,
        rewardXp: 0,
        puzzleState: structuredClone(puz),
        carriedCrystalLabel: this.carriedCrystalLabel,
      });
      return;
    }

    if (node.kind === 'istana-gate') {
      sound3d.playScroll();
      if (!puz.puzzlesSolved.includes(8)) {
        this.callbacks.onGrade4Event?.({
          type: 'open-puzzle',
          bab: 8,
          message: 'Selesaikan teka-teki Gerbang Kehormatan sebelum Ujian Akhir Kelas 4!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
      } else {
        this.callbacks.onGrade4Event?.({
          type: 'open-istana-exam',
          bab: 8,
          message: 'Selamat datang di Istana Pengetahuan! Mulai Ujian Akhir Kelas 4!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          puzzleState: structuredClone(puz),
          carriedCrystalLabel: this.carriedCrystalLabel,
        });
      }
    }
  }

  private resolveCollisions(nx: number, nz: number): [number, number] {
    let x = nx;
    let z = nz;
    const playerRadius = 0.45;

    // 0. If inside a real 3D Building Interior, clamp cleanly to interior walls & furniture
    if (this.activeInterior) {
      const b = this.activeInterior.roomBounds;
      x = THREE.MathUtils.clamp(x, b.minX, b.maxX);
      z = THREE.MathUtils.clamp(z, b.minZ, b.maxZ);
      for (const c of this.activeInterior.circleColliders) {
        const dx = x - c.x;
        const dz = z - c.z;
        const dist = Math.hypot(dx, dz);
        const minD = c.radius + playerRadius;
        if (dist < minD && dist > 0.0001) {
          const push = (minD - dist) / dist;
          x += dx * push;
          z += dz * push;
        }
      }
      for (const box of this.activeInterior.boxColliders) {
        const closestX = THREE.MathUtils.clamp(x, box.minX, box.maxX);
        const closestZ = THREE.MathUtils.clamp(z, box.minZ, box.maxZ);
        const dx = x - closestX;
        const dz = z - closestZ;
        const distSq = dx * dx + dz * dz;
        if (distSq < playerRadius * playerRadius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            const overlap = playerRadius - dist;
            x += (dx / dist) * overlap;
            z += (dz / dist) * overlap;
          } else {
            x = box.minX - playerRadius;
          }
        }
      }
      return [
        THREE.MathUtils.clamp(x, b.minX, b.maxX),
        THREE.MathUtils.clamp(z, b.minZ, b.maxZ),
      ];
    }

    // 1. Keep player on the island (or walkable pier for Grade 1)
    if (!isOnGrade1Pier(x, z, this.grade)) {
      const distFromCenter = Math.hypot(x, z);
      const maxAllowed = getIslandRadius(this.grade) - 6.5;
      if (distFromCenter > maxAllowed) {
        const s = maxAllowed / distFromCenter;
        x *= s;
        z *= s;
      }
    }

    // 2. Circle colliders (trees, rocks, NPCs, posts)
    for (const c of this.circleColliders) {
      const dx = x - c.x;
      const dz = z - c.z;
      const dist = Math.hypot(dx, dz);
      const minD = c.radius + playerRadius;
      if (dist < minD && dist > 0.0001) {
        const push = (minD - dist) / dist;
        x += dx * push;
        z += dz * push;
      }
    }

    // 3. Box colliders (houses)
    for (const b of this.boxColliders) {
      const closestX = THREE.MathUtils.clamp(x, b.minX, b.maxX);
      const closestZ = THREE.MathUtils.clamp(z, b.minZ, b.maxZ);
      const dx = x - closestX;
      const dz = z - closestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < playerRadius * playerRadius) {
        const dist = Math.sqrt(distSq);
        if (dist > 0.0001) {
          const overlap = playerRadius - dist;
          x += (dx / dist) * overlap;
          z += (dz / dist) * overlap;
        } else {
          // Inside box edge fallback
          x = b.minX - playerRadius;
        }
      }
    }

    // 4. Bridge side-rail containment when walking over the bridge
    if (isOnBridge(this.playerPos.x, this.playerPos.z, this.grade, this.isBridgePassable())) {
      const bridgeDef = getBridgeBounds(this.grade);
      if (this.grade === 2) {
        if (Math.abs(z - bridgeDef.centerZ) < bridgeDef.halfLengthZ - 0.5) {
          x = THREE.MathUtils.clamp(
            x,
            bridgeDef.centerX - bridgeDef.halfWidthX + 0.45,
            bridgeDef.centerX + bridgeDef.halfWidthX - 0.45
          );
        }
      } else {
        if (Math.abs(x - bridgeDef.centerX) < bridgeDef.halfWidthX - 0.5) {
          z = THREE.MathUtils.clamp(
            z,
            bridgeDef.centerZ - bridgeDef.halfLengthZ + 0.45,
            bridgeDef.centerZ + bridgeDef.halfLengthZ - 0.45
          );
        }
      }
    }

    return [x, z];
  }

  private updatePlayer(dt: number, elapsed: number) {
    let moveX = this.touchMove.x;
    let moveZ = this.touchMove.y;

    if (!this.paused) {
      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;
    }

    const inputLen = Math.hypot(moveX, moveZ);
    const hasMove = inputLen > 0.05 && !this.paused;
    const isSprinting =
      hasMove &&
      (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchSprint);

    // If seated and player starts moving, stand up smoothly first
    if (this.activeSeat && hasMove) {
      this.standUpFromSeat();
    }

    // Tick pose & turn timers
    if (this.standingUpTimer > 0) {
      this.standingUpTimer = Math.max(0, this.standingUpTimer - dt);
    }
    if (this.turningTimer > 0) {
      this.turningTimer = Math.max(0, this.turningTimer - dt);
    }
    if (this.playerForcedTimer > 0) {
      this.playerForcedTimer = Math.max(0, this.playerForcedTimer - dt);
      if (this.playerForcedTimer === 0) {
        this.playerForcedAnim = null;
      }
    }
    if (hasMove && this.playerForcedAnim && this.playerForcedAnim !== 'picking-up' && this.playerForcedAnim !== 'opening-door') {
      this.playerForcedAnim = null;
      this.playerForcedTimer = 0;
    }

    // Camera-relative planar movement direction
    _forward.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw)).normalize();
    _right.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw)).normalize();

    _moveDir.set(0, 0, 0);
    if (hasMove) {
      const nx = moveX / Math.max(1, inputLen);
      const nz = moveZ / Math.max(1, inputLen);
      _moveDir.addScaledVector(_right, nx);
      _moveDir.addScaledVector(_forward, -nz);
      _moveDir.normalize();
    }

    // Speed (slightly slower if wading in river water off the bridge)
    const bridgePassable = this.isBridgePassable();
    const inRiverWater =
      !isOnBridge(this.playerPos.x, this.playerPos.z, this.grade, bridgePassable) &&
      getRawTerrainHeight(this.playerPos.x, this.playerPos.z, this.grade) < WATER_LEVEL + 0.05;

    const baseSpeed = isSprinting ? 10.2 : 5.8;
    const moveSpeed = inRiverWater ? baseSpeed * 0.65 : baseSpeed;

    if (this.activeSeat) {
      const seatGroundY = this.activeInterior
        ? 0
        : getWalkableHeight(this.activeSeat.x, this.activeSeat.z, this.grade, bridgePassable);
      this.playerPos.set(this.activeSeat.x, seatGroundY, this.activeSeat.z);
      let seatDiff = this.activeSeat.facingYaw - this.playerYaw;
      while (seatDiff > Math.PI) seatDiff -= Math.PI * 2;
      while (seatDiff < -Math.PI) seatDiff += Math.PI * 2;
      this.playerYaw += seatDiff * (1 - Math.exp(-14 * dt));
    } else if (hasMove) {
      const targetX = this.playerPos.x + _moveDir.x * moveSpeed * dt;
      const targetZ = this.playerPos.z + _moveDir.z * moveSpeed * dt;
      const [rx, rz] = this.resolveCollisions(targetX, targetZ);
      this.playerPos.x = rx;
      this.playerPos.z = rz;

      // Smoothly rotate hero toward movement direction
      const targetYaw = Math.atan2(_moveDir.x, _moveDir.z);
      let diff = targetYaw - this.playerYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) > 0.65) {
        this.turningTimer = 0.22;
      }
      this.playerYaw += diff * (1 - Math.exp(-14 * dt));

      // Gentle auto camera follow behind player when strafing/turning without mouse drag
      if (!this.isDragging && Math.abs(moveX) > 0.2) {
        this.camYaw -= moveX * 0.75 * dt;
      }
    }

    // Vertical Gravity & Ground Snap
    const groundY = this.activeInterior
      ? 0
      : getWalkableHeight(this.playerPos.x, this.playerPos.z, this.grade, bridgePassable);
    if (!this.activeSeat && (!this.onGround || this.playerPos.y > groundY + 0.02)) {
      this.playerVelY -= 22.0 * dt;
      this.playerPos.y += this.playerVelY * dt;
      if (this.playerPos.y <= groundY) {
        this.playerPos.y = groundY;
        if (this.playerVelY < -3.5) {
          this.landSquash = 1.0;
          sound3d.playLand();
          this.spawnDustBurst(this.playerPos.x, groundY, this.playerPos.z, 4);
        }
        this.playerVelY = 0;
        this.onGround = true;
      }
    } else {
      this.playerPos.y = groundY;
    }

    // Track bridge crossing milestone
    if (isOnBridge(this.playerPos.x, this.playerPos.z, this.grade, bridgePassable) && !this.bridgeCrossed) {
      this.bridgeCrossed = true;
    }

    // Apply hero transform
    this.hero.root.position.copy(this.playerPos);
    this.hero.root.rotation.y = this.playerYaw;

    // Contact shadow sticks to ground beneath hero even while jumping
    this.contactShadow.position.set(this.playerPos.x, groundY + 0.03, this.playerPos.z);
    const heightAboveGround = Math.max(0, this.playerPos.y - groundY);
    const shadowScale = Math.max(0.45, 1 - heightAboveGround * 0.16);
    this.contactShadow.scale.setScalar(shadowScale);

    // Unified Character Animation State Machine (smooth damped joints, knees, elbows, held props)
    this.landSquash = THREE.MathUtils.damp(this.landSquash, 0, 12, dt);
    const sy = 1 - this.landSquash * 0.16;
    const sxz = 1 + this.landSquash * 0.1;
    this.hero.bodyGroup.scale.set(sxz, sy, sxz);

    const gStyle = this.hero.gradeStyle;

    if (hasMove && this.onGround && !this.activeSeat) {
      this.footstepTimer += dt;
      const stepInterval = isSprinting ? 0.25 : 0.39;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        sound3d.playFootstep(isSprinting);
        if (isSprinting) {
          this.spawnDustBurst(this.playerPos.x, groundY, this.playerPos.z, 2, 0xd6d3d1);
        }
      }
    }

    if (this.grade2ActionAnimTimer > 0) {
      this.grade2ActionAnimTimer = Math.max(0, this.grade2ActionAnimTimer - dt);
    }
    if (this.grade1ActionAnimTimer > 0) {
      this.grade1ActionAnimTimer = Math.max(0, this.grade1ActionAnimTimer - dt);
    }

    const locomotionState: CharacterAnimState = this.activeSeat
      ? 'sitting'
      : this.standingUpTimer > 0
      ? 'standing-up'
      : !this.onGround
      ? 'jumping'
      : hasMove
      ? isSprinting
        ? 'running'
        : this.turningTimer > 0
        ? 'turning'
        : 'walking'
      : 'idle';

    const effectiveAnimState: CharacterAnimState = this.activeSeat
      ? this.playerForcedAnim ?? 'sitting'
      : hasMove && !this.playerForcedAnim
      ? locomotionState
      : this.playerForcedAnim ?? locomotionState;

    this.playerAnimState = effectiveAnimState;

    applyCharacterPose(this.hero, {
      state: effectiveAnimState,
      elapsed,
      dt,
      speed: hasMove ? moveSpeed : 0,
      isSprinting,
      isSeated: Boolean(this.activeSeat),
      seatStyle: this.activeSeat?.style,
      seatTopY: this.activeSeat?.seatTopY,
      carryingBasket: Boolean(this.carriedItem) || Boolean(this.carriedCrystalId),
      religion: this.config.grade1Context?.religion,
      heroScale: this.grade === 1 ? 0.85 : 1,
    });

    // PJOK special 3D pose overlays when standing still
    if (this.heroPoseTimer > 0 && this.heroPoseKind && !hasMove && !this.activeSeat) {
      this.heroPoseTimer = Math.max(0, this.heroPoseTimer - dt);
      const t = elapsed * 8;
      if (this.heroPoseKind === 'jump-jack') {
        this.hero.leftArm.rotation.x = -Math.PI * 0.72 + Math.sin(t) * 0.45;
        this.hero.rightArm.rotation.x = -Math.PI * 0.72 + Math.sin(t) * 0.45;
        this.hero.leftLeg.rotation.x = Math.sin(t) * 0.25;
        this.hero.rightLeg.rotation.x = -Math.sin(t) * 0.25;
        this.hero.bodyGroup.position.y = Math.abs(Math.sin(t)) * 0.28;
      } else if (this.heroPoseKind === 'balance') {
        this.hero.leftArm.rotation.z = -1.1;
        this.hero.rightArm.rotation.z = 1.1;
        this.hero.rightLeg.rotation.x = 0.75;
        this.hero.leftLeg.rotation.x = 0;
        this.hero.bodyGroup.position.y = 0.05;
      } else if (this.heroPoseKind === 'stretch') {
        this.hero.leftArm.rotation.x = -2.4;
        this.hero.rightArm.rotation.x = -2.4;
        this.hero.leftLeg.rotation.x = 0;
        this.hero.rightLeg.rotation.x = 0;
        this.hero.bodyGroup.position.y = 0.08 + Math.sin(elapsed * 4) * 0.05;
      } else {
        this.hero.leftLeg.rotation.x = Math.sin(t * 1.2) * 0.75;
        this.hero.rightLeg.rotation.x = -Math.sin(t * 1.2) * 0.75;
        this.hero.leftArm.rotation.x = -Math.sin(t * 1.2) * 0.65;
        this.hero.rightArm.rotation.x = Math.sin(t * 1.2) * 0.65;
        this.hero.bodyGroup.position.y = Math.abs(Math.cos(t * 1.2)) * 0.08;
      }
      if (this.heroPoseTimer === 0) {
        this.heroPoseKind = null;
      }
    }

    // Animate Grade-specific Extra Gear (G4 Scarf, G5 Radar Dish, G6 Royal Cape)
    if (this.hero.extraParts.length > 0) {
      const gear = this.hero.extraParts[0];
      if (gStyle === 4) {
        gear.rotation.x = (hasMove ? (isSprinting ? -0.65 : -0.45) : -0.25) + Math.sin(elapsed * 8) * 0.12;
      } else if (gStyle === 5) {
        gear.rotation.y += dt * (hasMove ? 4.2 : 1.8);
      } else if (gStyle === 6) {
        gear.rotation.x = (hasMove ? (isSprinting ? 0.72 : 0.45) : 0.12) + Math.sin(elapsed * 7) * 0.08;
      }
    }

    // Dynamic FOV widening when sprinting
    const targetFov = isSprinting ? 62 : 56;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 7, dt);
      this.camera.updateProjectionMatrix();
    }

    // Update motion status for HUD
    const motionState: PlayerMotionState = !this.onGround
      ? 'Melompat'
      : isSprinting
      ? 'Berlari'
      : hasMove
      ? 'Berjalan'
      : 'Diam';

    // Check collectibles proximity (only when outside)
    if (!this.activeInterior) {
      for (const item of this.collectibles) {
        if (item.collected) continue;
        const d = Math.hypot(item.x - this.playerPos.x, item.z - this.playerPos.z);
        const dy = Math.abs(item.y - (this.playerPos.y + 0.9));
        if (d < 1.35 && dy < 2.2) {
          item.collected = true;
          item.mesh.visible = false;
          if (item.kind === 'scroll') sound3d.playScroll();
          else sound3d.playCoin();
          this.spawnDustBurst(item.x, item.y, item.z, 7, 0xfbbf24);
          this.callbacks.onCollectItem({
            id: item.id,
            kind: item.kind,
            valueCoins: item.valueCoins,
            valueScore: item.valueScore,
          });
        }
      }
    }

    // Check active chapter 3D stations (collect, push physics, activate)
    for (const st of this.chapterStations) {
      if (st.pushDustCooldown > 0) st.pushDustCooldown -= dt;
      if (st.completed) continue;

      const d = Math.hypot(st.x - this.playerPos.x, st.z - this.playerPos.z);
      const dy = Math.abs(st.y - this.playerPos.y);
      if (st.def.actionType === 'collect' && d < 1.65 && dy < 2.5) {
        this.completeStation(st);
      } else if (st.def.actionType === 'push' && d < st.colliderRadius + 0.6 && dy < 2.2) {
        if (hasMove) {
          this.nudgePushStation(st, 3.8 * dt);
        }
        // Keep player from overlapping push crate core
        const dx = this.playerPos.x - st.x;
        const dz = this.playerPos.z - st.z;
        const dist = Math.hypot(dx, dz);
        const minSep = st.colliderRadius + 0.45;
        if (dist < minSep && dist > 0.001) {
          this.playerPos.x = st.x + (dx / dist) * minSep;
          this.playerPos.z = st.z + (dz / dist) * minSep;
        }
      }
    }

    // Grade 1 interactive playground, 9 subject worlds & Ambil-Gunakan proximity checks
    if (this.grade1Runtime && !this.activeInterior) {
      const rt = this.grade1Runtime;
      if (this.trampolineCooldown > 0) this.trampolineCooldown -= dt;
      if (this.grade1StepNoteCooldown > 0) this.grade1StepNoteCooldown -= dt;

      // Trampolin Pelangi auto super-bounce (when playground is built)
      if (rt.trampoline) {
        const dTramp = Math.hypot(
          rt.trampoline.x - this.playerPos.x,
          rt.trampoline.z - this.playerPos.z
        );
        if (
          dTramp < rt.trampoline.radius &&
          this.playerPos.y <= groundY + 0.65 &&
          this.trampolineCooldown <= 0
        ) {
          this.playerVelY = 12.6;
          this.onGround = false;
          this.trampolineCooldown = 0.65;
          rt.trampoline.bounceAnim = 1;
          sound3d.playJump();
          this.spawnDustBurst(this.playerPos.x, groundY + 0.3, this.playerPos.z, 10, 0x38bdf8);
          if (!this.trampolineNoticed) {
            this.trampolineNoticed = true;
            this.callbacks.onGrade1Event?.({
              type: 'trampoline',
              message: 'Boing! Kamu melompat tinggi di Trampolin Pelangi!',
              rewardCoins: 5,
              rewardScore: 30,
              rewardXp: 5,
            });
          }
        }
      }

      // Taman Angka 1–5 stepping pads
      if (this.onGround && rt.numberPads.length > 0) {
        for (const pad of rt.numberPads) {
          if (pad.activated) continue;
          const dPad = Math.hypot(pad.x - this.playerPos.x, pad.z - this.playerPos.z);
          if (dPad < 0.85) {
            pad.activated = true;
            const mats = pad.mesh.material as THREE.MeshStandardMaterial[];
            if (mats[2]) {
              mats[2].emissive.setHex(0xfbbf24);
              mats[2].emissiveIntensity = 0.35;
            }
            pad.mesh.position.y -= 0.04;
            sound3d.playChime(pad.num - 1);
            this.spawnDustBurst(pad.x, groundY + 0.25, pad.z, 6, 0xfbbf24);
            const litCount = rt.numberPads.filter((p) => p.activated).length;
            if (litCount === rt.numberPads.length && !rt.numberSequenceDone) {
              rt.numberSequenceDone = true;
              sound3d.playMissionComplete();
              this.callbacks.onGrade1Event?.({
                type: 'number-sequence',
                message: 'Luar biasa! Semua angka 1 sampai 5 menyala di Taman Angka! (+15 Koin, +20 XP)',
                rewardCoins: 15,
                rewardScore: 100,
                rewardXp: 20,
                numberPadCount: litCount,
              });
            } else {
              this.callbacks.onGrade1Event?.({
                type: 'number-pad',
                message: `Angka ${pad.num}! (${litCount}/5 ubin angka menyala)`,
                rewardCoins: 2,
                rewardScore: 15,
                rewardXp: 3,
                numberPadCount: litCount,
              });
            }
          }
        }
      }

      // Effortless auto-pickup when empty-handed & auto-use right at matching pedestal
      if (!this.carriedItem) {
        for (const item of rt.pickups) {
          if (item.state !== 'world') continue;
          const dItem = Math.hypot(item.x - this.playerPos.x, item.z - this.playerPos.z);
          if (dItem < 1.25 && Math.abs(item.y - (this.playerPos.y + 0.8)) < 2.2) {
            this.pickupGrade1Item(item);
            break;
          }
        }
      } else {
        const targetPed = rt.pedestals.find(
          (p) => p.id === this.carriedItem!.targetZoneId
        );
        if (targetPed) {
          const dPed = Math.hypot(
            targetPed.x - this.playerPos.x,
            targetPed.z - this.playerPos.z
          );
          if (dPed < 1.45) {
            this.useCarriedGrade1Item(targetPed);
          }
        }
      }

      // Custom World Real-Time Mechanics (PJOK Hurdles/Beam, Seni Xylophone step, IPAS Safe Zone & Wolf)
      const bag = this.grade1Bag;
      if (bag) {
        // 1. Safe zones detection
        let inSafe = false;
        for (const sz of rt.safeZones) {
          if (Math.hypot(sz.x - this.playerPos.x, sz.z - this.playerPos.z) < sz.radius) {
            inSafe = true;
            break;
          }
        }
        bag.inSafeZone = inSafe;

        // 2. IPAS safe child-friendly predator wolf patrol / mild chase
        let anyChasing = false;
        for (const pred of rt.predators) {
          if (pred.cooldown > 0) pred.cooldown = Math.max(0, pred.cooldown - dt);
          const dPlayer = Math.hypot(this.playerPos.x - pred.x, this.playerPos.z - pred.z);

          if (!inSafe && pred.cooldown <= 0 && dPlayer < 9.5) {
            if (!pred.chasing) {
              pred.chasing = true;
              sound3d.playAlertCue();
              this.callbacks.onGrade1Event?.({
                type: 'predator-alert',
                message: 'Awas serigala hutan mendekat! Larilah masuk ke Lingkaran Hijau Zona Aman!',
                rewardCoins: 0,
                rewardScore: 0,
                rewardXp: 0,
                bagState: structuredClone(bag),
              });
            }
          } else if (inSafe || dPlayer > 12.5 || pred.cooldown > 0) {
            pred.chasing = false;
          }

          if (pred.chasing) {
            anyChasing = true;
            const dx = this.playerPos.x - pred.x;
            const dz = this.playerPos.z - pred.z;
            const dist = Math.max(0.01, Math.hypot(dx, dz));
            const chaseSpeed = 3.1;
            pred.x += (dx / dist) * chaseSpeed * dt;
            pred.z += (dz / dist) * chaseSpeed * dt;
            pred.yaw = Math.atan2(dx, dz);

            // Gentle kid-friendly nudge if predator reaches hero (zero game over / zero lost progress)
            if (dist < 1.65) {
              pred.cooldown = 4.5;
              pred.chasing = false;
              const safeX = -12.5;
              const safeZ = 3.0;
              this.playerPos.x = THREE.MathUtils.lerp(this.playerPos.x, safeX, 0.35);
              this.playerPos.z = THREE.MathUtils.lerp(this.playerPos.z, safeZ, 0.35);
              sound3d.playAlertCue();
              this.spawnDustBurst(this.playerPos.x, groundY + 0.4, this.playerPos.z, 8, 0x22c55e);
              this.callbacks.onGrade1Event?.({
                type: 'predator-alert',
                message: 'Ups! Hampir tersentuh serigala — berlindung di Zona Aman hijau ya!',
                rewardCoins: 0,
                rewardScore: 0,
                rewardXp: 0,
                bagState: structuredClone(bag),
              });
            }
          } else {
            // Return gently toward forest patrol circle
            const pX = pred.homeX + Math.cos(elapsed * 0.55) * 3.2;
            const pZ = pred.homeZ + Math.sin(elapsed * 0.55) * 2.2;
            const dx = pX - pred.x;
            const dz = pZ - pred.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.25) {
              pred.x += (dx / dist) * 1.9 * dt;
              pred.z += (dz / dist) * 1.9 * dt;
              pred.yaw = Math.atan2(dx, dz);
            }
          }

          const py = getWalkableHeight(pred.x, pred.z, 1);
          pred.group.position.set(pred.x, py, pred.z);
          pred.group.rotation.y = pred.yaw;
          const stride = Math.sin(elapsed * (pred.chasing ? 14 : 6)) * 0.55;
          if (pred.legParts[0]) pred.legParts[0].rotation.x = stride;
          if (pred.legParts[1]) pred.legParts[1].rotation.x = -stride;
          if (pred.legParts[2]) pred.legParts[2].rotation.x = -stride;
          if (pred.legParts[3]) pred.legParts[3].rotation.x = stride;
        }
        bag.chasedByPredator = anyChasing;

        // 3. PJOK Hurdles & Balance Beam + Seni Xylophone step-play
        for (const node of rt.interactiveNodes) {
          if (node.category === 'hurdle' && !node.completed) {
            const dH = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
            if (dH < 1.35 && !this.onGround && this.playerPos.y > groundY + 0.28) {
              node.completed = true;
              bag.hurdlesJumped += 1;
              if (node.statusMesh) {
                (node.statusMesh.material as THREE.MeshStandardMaterial).color.setHex(0xfacc15);
              }
              sound3d.playCoin();
              this.spawnDustBurst(node.x, groundY + 0.8, node.z, 8, 0xfacc15);
              this.callbacks.onGrade1Event?.({
                type: 'custom-interact',
                message: `Hebat! Lompatan gawang ke-${bag.hurdlesJumped} berhasil! (+8 Koin, +12 XP)`,
                rewardCoins: 8,
                rewardScore: 40,
                rewardXp: 12,
                bagState: structuredClone(bag),
              });
            }
          } else if (node.category === 'balance-beam' && !node.completed) {
            const dB = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
            if (dB < 2.1 && hasMove) {
              this.grade1BalanceTimer += dt;
              if (this.grade1BalanceTimer >= 0.7) {
                node.completed = true;
                bag.balanceSuccess = true;
                if (node.statusMesh) {
                  (node.statusMesh.material as THREE.MeshStandardMaterial).color.setHex(0x10b981);
                }
                sound3d.playMissionComplete();
                this.spawnDustBurst(node.x, groundY + 0.8, node.z, 10, 0x10b981);
                this.callbacks.onGrade1Event?.({
                  type: 'custom-interact',
                  message: 'Keren! Kamu menjaga keseimbangan di Titian Seimbang! (+12 Koin, +18 XP)',
                  rewardCoins: 12,
                  rewardScore: 60,
                  rewardXp: 18,
                  bagState: structuredClone(bag),
                });
              }
            }
          } else if (
            node.category === 'music-bar' &&
            this.grade1StepNoteCooldown <= 0 &&
            this.onGround
          ) {
            const dM = Math.hypot(node.x - this.playerPos.x, node.z - this.playerPos.z);
            if (dM < 0.72) {
              this.grade1StepNoteCooldown = 0.28;
              const idx = node.noteIndex ?? 0;
              sound3d.playInstrumentNote(
                idx,
                this.config.grade1Context?.subjectId === 'muatan-lokal' ? 'angklung' : 'xylophone'
              );
              bag.musicNotesPlayed += 1;
              if (node.statusMesh) {
                node.statusMesh.position.y = 0.14;
                window.setTimeout(() => {
                  if (!this.disposed && node.statusMesh) node.statusMesh.position.y = 0.22;
                }, 140);
              }
            }
          }
        }
      }
    }

    // Throttled HUD state emission
    this.hudThrottle += dt;
    const nearbyNpc = this.findNearestNpc()?.def ?? null;
    const nearbyStation = this.findNearestStation()?.def ?? null;
    const nearbyGrade1Action = this.findNearestGrade1Action();
    const g1Key = nearbyGrade1Action
      ? `${nearbyGrade1Action.kind}:${nearbyGrade1Action.targetId ?? ''}`
      : null;
    const g2Node = this.findNearestGrade2Node();
    const nearbyGrade2Node: Grade2NearbyAction | null = g2Node
      ? {
          id: g2Node.id,
          kind: g2Node.kind,
          label: this.getGrade2NodeDynamicLabel(g2Node),
          dist: Math.hypot(g2Node.x - this.playerPos.x, g2Node.z - this.playerPos.z),
        }
      : null;
    const g2Key = nearbyGrade2Node ? `${nearbyGrade2Node.id}:${nearbyGrade2Node.label}` : null;
    const g3Node = this.findNearestGrade3Node();
    const nearbyGrade3Node: Grade3NearbyAction | null = g3Node
      ? {
          id: g3Node.id,
          kind: g3Node.kind,
          bab: g3Node.bab,
          label: g3Node.label,
          dist: Math.hypot(g3Node.x - this.playerPos.x, g3Node.z - this.playerPos.z),
        }
      : null;
    const g3Key = nearbyGrade3Node ? nearbyGrade3Node.id : null;

    const g4Node = this.findNearestGrade4Node();
    const nearbyGrade4Node: Grade4NearbyAction | null = g4Node
      ? {
          id: g4Node.id,
          kind: g4Node.kind,
          bab: g4Node.bab,
          label: g4Node.label,
          dist: Math.hypot(g4Node.x - this.playerPos.x, g4Node.z - this.playerPos.z),
        }
      : null;
    const g4Key = nearbyGrade4Node
      ? `${nearbyGrade4Node.id}:${this.carriedCrystalId ?? ''}`
      : null;

    const carriedHud: Grade1HudCarried | null = this.carriedItem
      ? {
          id: this.carriedItem.id,
          name: this.carriedItem.name,
          shortLabel: this.carriedItem.shortLabel,
          targetZoneId: this.carriedItem.targetZoneId,
          targetLabel: this.carriedItem.targetLabel,
        }
      : null;

    // Track current Grade 1 open-world region & emit discovery reward when entering new region
    let currentRegionId: Grade1RegionId | undefined;
    let currentRegionName: string | undefined;
    if (this.grade === 1) {
      const checkX = this.activeInterior ? this.savedExteriorPos.x : this.playerPos.x;
      const checkZ = this.activeInterior ? this.savedExteriorPos.z : this.playerPos.z;
      const reg = findGrade1RegionAt(checkX, checkZ);
      currentRegionId = reg.id;
      currentRegionName = reg.name;
      if (!this.discoveredRegionIds.has(reg.id)) {
        this.discoveredRegionIds.add(reg.id);
        this.callbacks.onGrade1Event?.({
          type: 'discover-region',
          regionId: reg.id,
          message: `Menemukan Kawasan Baru: ${reg.name}! (${reg.subtitle})`,
          rewardCoins: 10,
          rewardScore: 50,
          rewardXp: 15,
        });
      }
    }

    const currentSeatId = this.activeSeat?.id ?? null;
    if (
      this.hudThrottle > 0.1 ||
      motionState !== this.lastMotion ||
      (nearbyNpc?.id ?? null) !== this.lastNearbyNpcId ||
      (nearbyStation?.id ?? null) !== this.lastNearbyStationId ||
      g1Key !== this.lastNearbyG1ActionKey ||
      g2Key !== this.lastNearbyG2NodeKey ||
      g3Key !== this.lastNearbyG3NodeKey ||
      g4Key !== this.lastNearbyG4NodeKey ||
      (carriedHud?.id ?? null) !== this.lastCarriedId ||
      (currentRegionId ?? null) !== this.lastRegionId ||
      currentSeatId !== this.lastSeatedId ||
      this.playerAnimState !== this.lastForcedPose
    ) {
      this.hudThrottle = 0;
      this.lastMotion = motionState;
      this.lastNearbyNpcId = nearbyNpc?.id ?? null;
      this.lastNearbyStationId = nearbyStation?.id ?? null;
      this.lastNearbyG1ActionKey = g1Key;
      this.lastNearbyG2NodeKey = g2Key;
      this.lastNearbyG3NodeKey = g3Key;
      this.lastNearbyG4NodeKey = g4Key;
      this.lastCarriedId = carriedHud?.id ?? null;
      this.lastRegionId = currentRegionId ?? null;
      this.lastSeatedId = currentSeatId;
      this.lastForcedPose = this.playerAnimState;
      this.callbacks.onHudTick({
        motionState,
        nearbyNpc,
        nearbyStation,
        crossedBridge: this.bridgeCrossed,
        playerPos: {
          x: this.playerPos.x,
          y: this.playerPos.y,
          z: this.playerPos.z,
        },
        carriedItem: carriedHud,
        nearbyGrade1Action,
        grade1Bag: this.grade1Bag ? structuredClone(this.grade1Bag) : null,
        nearbyGrade2Node,
        nearbyGrade3Node,
        nearbyGrade4Node,
        carriedCrystalLabel: this.carriedCrystalLabel,
        currentRegionId,
        currentRegionName,
        activeInteriorId: this.activeInterior?.id ?? null,
        activeInteriorName: this.activeInterior?.title ?? null,
        isSeated: Boolean(this.activeSeat),
        activeSeatLabel: this.activeSeat?.label ?? null,
        activeSeatContext: this.activeSeat?.locationContext ?? null,
        activePoseState: this.playerAnimState,
      });
    }
  }

  private updateCamera(dt: number) {
    _camTarget.set(
      this.playerPos.x,
      this.playerPos.y + 1.45,
      this.playerPos.z
    );

    const horizDist = Math.cos(this.camPitch) * this.camDist;
    const vertDist = Math.sin(this.camPitch) * this.camDist;

    _desiredCamPos.set(
      _camTarget.x + Math.sin(this.camYaw) * horizDist,
      _camTarget.y + vertDist,
      _camTarget.z + Math.cos(this.camYaw) * horizDist
    );

    if (this.activeInterior) {
      const b = this.activeInterior.roomBounds;
      _desiredCamPos.x = THREE.MathUtils.clamp(_desiredCamPos.x, b.minX + 0.35, b.maxX - 0.35);
      _desiredCamPos.z = THREE.MathUtils.clamp(_desiredCamPos.z, b.minZ + 0.35, b.maxZ - 0.45);
      _desiredCamPos.y = THREE.MathUtils.clamp(_desiredCamPos.y, 1.3, 4.35);
    } else {
      // Keep camera smoothly above terrain surface
      const camGround = getWalkableHeight(
        _desiredCamPos.x,
        _desiredCamPos.z,
        this.grade,
        this.isBridgePassable()
      );
      if (_desiredCamPos.y < camGround + 1.1) {
        _desiredCamPos.y = camGround + 1.1;
      }
    }

    if (dt >= 1) {
      this.camera.position.copy(_desiredCamPos);
    } else {
      const alpha = 1 - Math.exp(-10 * dt);
      this.camera.position.lerp(_desiredCamPos, alpha);
    }
    this.camera.lookAt(_camTarget);

    // Move directional sun shadow frustum with player
    this.sunLight.position.set(
      this.playerPos.x + 26,
      this.playerPos.y + 38,
      this.playerPos.z + 20
    );
    this.sunLight.target.position.copy(this.playerPos);
  }

  private updateEnvironment(dt: number, elapsed: number) {
    // Gentle water shimmer
    this.waterMesh.position.y = WATER_LEVEL + Math.sin(elapsed * 1.4) * 0.04;

    // Animate world-specific landmark elements (wind turbine, lighthouse beacon, crystals/orbs)
    for (let i = 0; i < this.landmarkParts.length; i++) {
      const part = this.landmarkParts[i];
      if (this.config.theme.grade === 5) {
        part.rotation.z -= dt * 1.8;
      } else {
        part.rotation.y += dt * 1.4;
      }
    }

    // Spin & float collectibles
    for (let i = 0; i < this.collectibles.length; i++) {
      const item = this.collectibles[i];
      if (item.collected) continue;
      item.mesh.rotation.y += dt * (item.kind === 'coin' ? 2.6 : 1.6);
      item.mesh.position.y = item.y + Math.sin(elapsed * 2.6 + i) * 0.14;
    }

    // Animate chapter 3D stations & orient readable signboards toward camera
    for (let i = 0; i < this.chapterStations.length; i++) {
      const st = this.chapterStations[i];
      if (!st.root.visible) continue;
      st.signBoard.lookAt(this.camera.position);
      st.indicator.rotation.y += dt * (st.completed ? 3.2 : 1.8);
      st.indicator.position.y = 2.95 + Math.sin(elapsed * 3.0 + i) * 0.1;

      if (st.activeVisual) {
        if (st.def.modelKind === 'planet-orb' || st.def.modelKind === 'royal-gate-lock') {
          st.activeVisual.rotation.y += dt * (st.completed ? 2.4 : 0.9);
        } else if (st.def.modelKind === 'organ-pod') {
          st.activeVisual.rotation.y += dt * 1.1;
          st.activeVisual.position.y = 0.95 + Math.sin(elapsed * 2.5 + i) * 0.08;
        }
      }
    }

    // Tick NPC animation override timers
    for (const [npcId, ov] of this.npcAnimOverrides) {
      ov.timer -= dt;
      if (ov.timer <= 0) {
        this.npcAnimOverrides.delete(npcId);
      }
    }

    // Animate exterior NPCs (greeting, talking, prayer/idle poses, face nearby player)
    const activeRel = this.config.grade1Context?.religion;
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.rig.indicator) {
        npc.rig.indicator.rotation.y += dt * 2.2;
        npc.rig.indicator.position.y = 2.45 + Math.sin(elapsed * 3.0 + i) * 0.1;
      }

      const dist = Math.hypot(
        npc.def.x - this.playerPos.x,
        npc.def.z - this.playerPos.z
      );
      const targetYaw =
        dist < 5.5
          ? Math.atan2(this.playerPos.x - npc.def.x, this.playerPos.z - npc.def.z)
          : npc.def.facingY;

      let diff = targetYaw - npc.rig.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      npc.rig.root.rotation.y += diff * (1 - Math.exp(-6 * dt));

      const ov = this.npcAnimOverrides.get(npc.def.id);
      const npcState: CharacterAnimState = ov
        ? ov.state
        : this.talkingNpcId === npc.def.id
        ? 'talking'
        : dist < 4.5
        ? 'greet'
        : npc.def.roleStyle?.startsWith('agama-') && Math.sin(elapsed * 0.4 + i) > 0.65
        ? 'praying'
        : 'idle';

      applyCharacterPose(npc.rig, {
        state: npcState,
        elapsed,
        dt,
        religion: activeRel,
        phaseOffset: i * 1.7,
      });
    }

    // Animate wildlife / companions per grade
    updateCreatures(this.creatures, dt, elapsed);

    // Animate active interior stations, living classroom patrol & seated NPCs when indoors
    if (this.activeInterior) {
      this.activeInterior.npcEntries.forEach((npc, i) => {
        if (npc.rig.indicator) {
          npc.rig.indicator.rotation.y += dt * 2.2;
          npc.rig.indicator.position.y = 2.45 + Math.sin(elapsed * 3.0 + i) * 0.1;
        }

        const dist = Math.hypot(npc.def.x - this.playerPos.x, npc.def.z - this.playerPos.z);
        const ov = this.npcAnimOverrides.get(npc.def.id);
        let npcState: CharacterAnimState = ov
          ? ov.state
          : this.talkingNpcId === npc.def.id
          ? 'talking'
          : npc.animMode ?? 'idle';

        if (npc.patrolWaypoints && npc.patrolWaypoints.length > 0 && !ov && this.talkingNpcId !== npc.def.id) {
          const wpIdx = npc.patrolIdx ?? 0;
          const wp = npc.patrolWaypoints[wpIdx];
          const wdx = wp.x - npc.rig.root.position.x;
          const wdz = wp.z - npc.rig.root.position.z;
          const wDist = Math.hypot(wdx, wdz);
          if (wDist > 0.12) {
            const step = Math.min(wDist, 1.35 * dt);
            npc.rig.root.position.x += (wdx / wDist) * step;
            npc.rig.root.position.z += (wdz / wDist) * step;
            npc.def.x = npc.rig.root.position.x;
            npc.def.z = npc.rig.root.position.z;
            const walkYaw = Math.atan2(wdx, wdz);
            let yDiff = walkYaw - npc.rig.root.rotation.y;
            while (yDiff > Math.PI) yDiff -= Math.PI * 2;
            while (yDiff < -Math.PI) yDiff += Math.PI * 2;
            npc.rig.root.rotation.y += yDiff * (1 - Math.exp(-8 * dt));
            npcState = 'walking';
          } else {
            npc.patrolHoldTimer = (npc.patrolHoldTimer ?? wp.holdSec ?? 3.5) - dt;
            const faceTarget =
              dist < 3.6
                ? Math.atan2(this.playerPos.x - npc.def.x, this.playerPos.z - npc.def.z)
                : wp.facingY ?? npc.def.facingY;
            let fDiff = faceTarget - npc.rig.root.rotation.y;
            while (fDiff > Math.PI) fDiff -= Math.PI * 2;
            while (fDiff < -Math.PI) fDiff += Math.PI * 2;
            npc.rig.root.rotation.y += fDiff * (1 - Math.exp(-6 * dt));
            npcState = dist < 3.4 ? 'greet' : wp.anim;
            if (npc.patrolHoldTimer <= 0) {
              const nextIdx = (wpIdx + 1) % npc.patrolWaypoints.length;
              npc.patrolIdx = nextIdx;
              npc.patrolHoldTimer = npc.patrolWaypoints[nextIdx].holdSec ?? 3.5;
            }
          }
        } else {
          const targetYaw =
            !npc.isSeated && dist < 5.5
              ? Math.atan2(this.playerPos.x - npc.def.x, this.playerPos.z - npc.def.z)
              : npc.def.facingY;
          let diff = targetYaw - npc.rig.root.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          npc.rig.root.rotation.y += diff * (1 - Math.exp(-6 * dt));

          if (npc.isSeated && this.playerAnimState === 'clapping' && !ov) {
            npcState = 'clapping';
          } else if (!npc.isSeated && dist < 4.2 && !ov && this.talkingNpcId !== npc.def.id) {
            npcState = 'greet';
          }
        }

        applyCharacterPose(npc.rig, {
          state: npcState,
          elapsed,
          dt,
          isSeated: npc.isSeated,
          seatStyle: npc.seatStyle,
          seatTopY: npc.seatTopY,
          religion: activeRel,
          phaseOffset: i * 1.7,
        });
      });
      this.activeInterior.stations.forEach((st, i) => {
        if (st.statusMesh) {
          st.statusMesh.rotation.y += dt * 1.9;
          st.statusMesh.position.y = 1.65 + Math.sin(elapsed * 2.6 + i) * 0.08;
        }
      });
    }

    // Animate Grade 1 playground rides, pickup bobbing, hinged exterior doors & pedestal beacons
    if (this.grade1Runtime && !this.activeInterior) {
      const rt = this.grade1Runtime;
      rt.swingBoost = Math.max(0, rt.swingBoost - dt * 0.18);
      for (let i = 0; i < rt.doorTriggers.length; i++) {
        const door = rt.doorTriggers[i];
        if (!door.doorLeafGroup) continue;
        const dDoor = Math.hypot(door.entryX - this.playerPos.x, door.entryZ - this.playerPos.z);
        const targetOpenRot = dDoor < 4.6 ? -1.35 : 0;
        door.doorLeafGroup.rotation.y = THREE.MathUtils.lerp(
          door.doorLeafGroup.rotation.y,
          targetOpenRot,
          Math.min(1, 8 * dt)
        );
      }
      if (rt.swingPivot) {
        rt.swingPivot.rotation.x = Math.sin(elapsed * 2.1) * (0.28 + rt.swingBoost);
      }
      if (rt.seesawBeam) {
        rt.seesawBeam.rotation.z = Math.sin(elapsed * 1.6) * 0.22;
      }

      if (rt.trampoline) {
        if (rt.trampoline.bounceAnim > 0) {
          rt.trampoline.bounceAnim = Math.max(0, rt.trampoline.bounceAnim - dt * 3.5);
          rt.trampoline.padMesh.position.y =
            0.34 - Math.sin(rt.trampoline.bounceAnim * Math.PI) * 0.1;
        } else {
          rt.trampoline.padMesh.position.y = 0.34;
        }
      }

      for (let i = 0; i < rt.pickups.length; i++) {
        const p = rt.pickups[i];
        if (p.state !== 'world') continue;
        p.mesh.rotation.y += dt * 1.6;
        p.mesh.position.y = p.y + Math.sin(elapsed * 2.8 + i) * 0.14;
      }

      for (let i = 0; i < rt.pedestals.length; i++) {
        const ped = rt.pedestals[i];
        const isTarget = this.carriedItem?.targetZoneId === ped.id;
        const pulse = isTarget ? 1.25 + Math.sin(elapsed * 6) * 0.2 : 1.0;
        ped.beaconRing.scale.setScalar(pulse);
        const rMat = ped.beaconRing.material as THREE.MeshBasicMaterial;
        rMat.opacity = isTarget ? 0.92 : 0.45;
        ped.displayAnchor.rotation.y += dt * 0.9;
      }

      for (let i = 0; i < rt.interactiveNodes.length; i++) {
        const node = rt.interactiveNodes[i];
        if (node.statusMesh && node.category !== 'music-bar' && node.category !== 'hurdle' && node.category !== 'balance-beam') {
          node.statusMesh.rotation.y += dt * 1.9;
          node.statusMesh.position.y = 1.85 + Math.sin(elapsed * 2.6 + i) * 0.1;
        }
      }

      for (let i = 0; i < rt.safeZones.length; i++) {
        const sz = rt.safeZones[i];
        sz.ringMesh.scale.setScalar(1 + Math.sin(elapsed * 3 + i) * 0.03);
      }
    }

    // Animate Grade 2 Desa Ceria: crop growth, farm animals & 3D geometry sculptures
    if (this.grade2Runtime && this.grade2SimState) {
      const rt = this.grade2Runtime;
      const sim = this.grade2SimState;
      let anyPlotMatured = false;

      for (const node of rt.nodes) {
        if (node.kind === 'farm-plot' && sim.plotStages[node.id] === 1) {
          node.growTimer = (node.growTimer ?? 0) + dt;
          if (node.growTimer >= 4.8) {
            sim.plotStages[node.id] = 2;
            node.growTimer = 0;
            anyPlotMatured = true;
          }
        } else if (node.kind === 'workshop-measure' && node.statusMesh) {
          node.statusMesh.rotation.y += dt * 1.8;
        } else if (node.kind === 'shape-pedestal' && node.statusMesh) {
          node.statusMesh.rotation.y += dt * 0.85;
          node.statusMesh.position.y = 1.68 + Math.sin(elapsed * 2.2 + node.x) * 0.08;
        }
      }

      if (anyPlotMatured) {
        this.syncGrade2Visuals();
        saveGrade2SimState(sim);
        this.callbacks.onGrade2Event?.({
          type: 'sim',
          message: 'Tanaman sayur di kebun sudah matang dan siap dipanen!',
          rewardCoins: 0,
          rewardScore: 0,
          rewardXp: 0,
          simState: structuredClone(sim),
        });
      }

      for (const animal of rt.animals) {
        const baseY = getRawTerrainHeight(animal.homeX, animal.homeZ, 2);
        if (animal.happyTimer > 0) {
          animal.happyTimer = Math.max(0, animal.happyTimer - dt);
          animal.group.position.x = animal.homeX;
          animal.group.position.z = animal.homeZ;
          animal.group.position.y = baseY + Math.abs(Math.sin(elapsed * 9 + animal.phase)) * 0.36;
          animal.group.rotation.y += dt * 3.5;
        } else {
          const wander = Math.sin(elapsed * 0.85 + animal.phase) * 0.42;
          animal.group.position.x = animal.homeX + wander;
          animal.group.position.z = animal.homeZ + Math.cos(elapsed * 0.65 + animal.phase) * 0.28;
          animal.group.position.y =
            baseY +
            (animal.kind === 'ayam'
              ? Math.abs(Math.sin(elapsed * 4.5 + animal.phase)) * 0.07
              : Math.sin(elapsed * 2.1 + animal.phase) * 0.02);
          animal.group.rotation.y = Math.sin(elapsed * 0.5 + animal.phase) * 0.8;
        }
      }
    }

    // Animate Grade 3 Hutan Misteri waterfall cascade, glowing forest mushrooms & exploration orbs
    if (this.grade3Runtime) {
      const rt = this.grade3Runtime;
      rt.waterfallBands.forEach((band, idx) => {
        const baseY = 3.2 - idx * 0.55;
        band.position.y = baseY - ((elapsed * 2.4 + idx * 0.35) % 1.1);
      });
      rt.glowingMushrooms.forEach((cap, idx) => {
        cap.scale.setScalar(0.95 + Math.sin(elapsed * 2.6 + idx) * 0.08);
      });
      rt.nodes.forEach((node, idx) => {
        if (node.statusMesh) {
          node.statusMesh.rotation.y += dt * 1.9;
          const gy = getRawTerrainHeight(node.x, node.z, 3);
          node.statusMesh.position.y = gy + 1.25 + Math.sin(elapsed * 2.8 + idx) * 0.1;
        }
      });
    }

    // Animate Grade 4 Pulau Teka-Teki drawbridge, gears, secret doors, crystals & carried gem
    if (this.grade4Runtime && this.grade4PuzzleState) {
      const rt = this.grade4Runtime;
      const puz = this.grade4PuzzleState;

      const targetDeckRot = puz.bridgeExtended ? 0 : 0.72;
      rt.bridgeDeckGroup.rotation.z = THREE.MathUtils.damp(
        rt.bridgeDeckGroup.rotation.z,
        targetDeckRot,
        5.5,
        dt
      );
      rt.bridgeGears.forEach((gear, idx) => {
        gear.rotation.z += dt * (puz.bridgeExtended ? 1.8 : 0.25) * (idx % 2 === 0 ? 1 : -1);
      });

      rt.secretDoors.forEach((door) => {
        const isUnlocked = puz.doorsUnlocked.includes(door.id);
        const targetY = isUnlocked ? door.openY : door.closedY;
        door.doorLeaf.position.y = THREE.MathUtils.damp(
          door.doorLeaf.position.y,
          targetY,
          5.0,
          dt
        );
      });

      rt.crystals.forEach((c, idx) => {
        if (c.orbMesh.visible) {
          c.orbMesh.rotation.y += dt * 2.1;
          const placed = puz.placedCrystals.includes(c.id);
          const gy = getRawTerrainHeight(
            placed ? c.pedestalX : c.x,
            placed ? c.pedestalZ : c.z,
            4
          );
          c.orbMesh.position.y =
            gy + (placed ? 1.25 : 0.85) + Math.sin(elapsed * 3.0 + idx) * 0.1;
        }
      });

      rt.nodes.forEach((n, idx) => {
        if (n.mesh && n.kind !== 'crystal-pickup') {
          n.mesh.rotation.y += dt * 1.6;
          if (n.kind === 'maze-clue' || n.kind === 'maze-exit') {
            const gy = getRawTerrainHeight(n.x, n.z, 4);
            n.mesh.position.y = gy + 1.42 + Math.sin(elapsed * 2.6 + idx) * 0.08;
          }
        }
      });

      if (this.carriedCrystalMesh) {
        this.carriedCrystalMesh.rotation.y += dt * 2.8;
      }
    }

    // Subtle floating atmospheric motes
    if (this.ambientMotes) {
      this.ambientMotes.rotation.y += dt * 0.035;
      this.ambientMotes.position.y = Math.sin(elapsed * 0.7) * 0.25;
    }

    // Update dust/sparkle particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
      } else {
        p.vy -= 4.5 * dt;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        const t = 1 - p.life / p.maxLife;
        p.mesh.scale.setScalar(t);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = t * 0.75;
      }
    }
  }

  private tick = () => {
    if (this.disposed) return;

    const dt = Math.min(0.05, this.clock.getDelta());
    const elapsed = this.clock.getElapsedTime();

    this.updatePlayer(dt, elapsed);
    this.updateCamera(dt);
    this.updateEnvironment(dt, elapsed);

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  // DOM Event Handlers
  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) &&
      !this.paused
    ) {
      e.preventDefault();
    }
    if (e.code === 'Space' && !e.repeat) {
      this.triggerJump();
    }
    if ((e.code === 'KeyE' || e.code === 'Enter') && !e.repeat) {
      this.triggerInteract();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onWindowBlur = () => {
    this.keys = {};
    this.isDragging = false;
    this.cameraPointerId = null;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.cameraPointerId !== null) return;
    this.isDragging = true;
    this.cameraPointerId = e.pointerId;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging || e.pointerId !== this.cameraPointerId) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    this.camYaw -= dx * 0.0065;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.005, 0.14, 1.15);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.cameraPointerId) return;
    this.isDragging = false;
    this.cameraPointerId = null;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.camDist = THREE.MathUtils.clamp(this.camDist + e.deltaY * 0.008, 5.5, 16.5);
  };

  private onResize = () => {
    if (!this.container || this.disposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    this.callbacks.onContextLost?.(true);
  };

  private handleContextRestored = () => {
    this.callbacks.onContextLost?.(false);
  };

  private attachEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('resize', this.onResize);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
  }

  public dispose() {
    this.disposed = true;
    sound3d.stopBgm();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('resize', this.onResize);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    dom.removeEventListener('wheel', this.onWheel);
    dom.removeEventListener('webglcontextlost', this.handleContextLost);
    dom.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.disposeActiveInterior();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });

    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    if (dom.parentNode === this.container) {
      this.container.removeChild(dom);
    }
  }
}
