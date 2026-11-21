import * as THREE from 'three';
import { ReligionId } from './inventoryData';
import type { CharacterRig } from './models';

export type CharacterAnimState =
  | 'idle'
  | 'walking'
  | 'running'
  | 'jumping'
  | 'turning'
  | 'sitting'
  | 'standing-up'
  | 'reading'
  | 'writing'
  | 'raising-hand'
  | 'pointing'
  | 'picking-up'
  | 'putting-down'
  | 'opening-door'
  | 'talking'
  | 'listening'
  | 'praying'
  | 'watering'
  | 'observing'
  | 'clapping'
  | 'celebrating'
  | 'tossing-ball'
  | 'greet'
  | 'nodding';

export interface Grade1SeatSpot {
  id: string;
  label: string;
  x: number;
  seatTopY: number;
  z: number;
  facingYaw: number;
  style: 'chair' | 'bench' | 'cushion';
  hasDesk?: boolean;
  religionContext?: ReligionId;
  locationContext?: 'classroom' | 'home' | 'library' | 'prayer' | 'lab' | 'park';
}

export interface CharacterMotionContext {
  state: CharacterAnimState;
  elapsed: number;
  dt: number;
  speed?: number;
  isSprinting?: boolean;
  isSeated?: boolean;
  seatStyle?: 'chair' | 'bench' | 'cushion';
  seatTopY?: number;
  carryingBasket?: boolean;
  religion?: ReligionId;
  heroScale?: number;
  phaseOffset?: number;
}

// Reusable pose target struct (zero per-frame allocations)
export interface PoseTargets {
  bodyPosY: number;
  bodyPosZ: number;
  bodyRotX: number;
  bodyRotZ: number;
  headRotX: number;
  headRotY: number;
  headRotZ: number;
  lArmX: number;
  lArmY: number;
  lArmZ: number;
  lElbowX: number;
  rArmX: number;
  rArmY: number;
  rArmZ: number;
  rElbowX: number;
  lLegX: number;
  lLegZ: number;
  lKneeX: number;
  lKneeZ: number;
  rLegX: number;
  rLegZ: number;
  rKneeX: number;
  rKneeZ: number;
}

const _pose: PoseTargets = {
  bodyPosY: 0,
  bodyPosZ: 0,
  bodyRotX: 0,
  bodyRotZ: 0,
  headRotX: 0,
  headRotY: 0,
  headRotZ: 0,
  lArmX: 0,
  lArmY: 0,
  lArmZ: 0,
  lElbowX: 0,
  rArmX: 0,
  rArmY: 0,
  rArmZ: 0,
  rElbowX: 0,
  lLegX: 0,
  lLegZ: 0,
  lKneeX: 0,
  lKneeZ: 0,
  rLegX: 0,
  rLegZ: 0,
  rKneeX: 0,
  rKneeZ: 0,
};

function resetPoseTargets(out: PoseTargets) {
  out.bodyPosY = 0;
  out.bodyPosZ = 0;
  out.bodyRotX = 0;
  out.bodyRotZ = 0;
  out.headRotX = 0;
  out.headRotY = 0;
  out.headRotZ = 0;
  out.lArmX = 0;
  out.lArmY = 0;
  out.lArmZ = 0;
  out.lElbowX = 0;
  out.rArmX = 0;
  out.rArmY = 0;
  out.rArmZ = 0;
  out.rElbowX = 0;
  out.lLegX = 0;
  out.lLegZ = 0;
  out.lKneeX = 0;
  out.lKneeZ = 0;
  out.rLegX = 0;
  rLegZReset(out);
}

function rLegZReset(out: PoseTargets) {
  out.rLegZ = 0;
  out.rKneeX = 0;
  out.rKneeZ = 0;
}

function applySeatedLegs(out: PoseTargets, style: 'chair' | 'bench' | 'cushion', seatTopY: number, scale: number) {
  // Pelvis height in unscaled local rig coords is ~0.68, thigh bottom radius ~0.12 => ~0.56.
  const localSeatY = seatTopY / scale;
  out.bodyPosY = localSeatY - 0.55;
  out.bodyPosZ = -0.04;

  if (style === 'cushion') {
    // Respectful cross-legged (bersila) floor cushion posture
    out.lLegX = -1.32;
    out.lLegZ = -0.44;
    out.lKneeX = 1.68;
    out.lKneeZ = 0.55;
    out.rLegX = -1.32;
    out.rLegZ = 0.44;
    out.rKneeX = 1.68;
    out.rKneeZ = -0.55;
  } else {
    // Natural 90-degree bench/chair posture
    out.lLegX = -1.48;
    out.rLegX = -1.48;
    out.lKneeX = 1.48;
    out.rKneeX = 1.48;
  }
}

export function applyCharacterPose(rig: CharacterRig, ctx: CharacterMotionContext): void {
  const {
    state,
    elapsed,
    dt,
    isSprinting = false,
    isSeated = false,
    seatStyle = 'chair',
    seatTopY = 0.46,
    carryingBasket = false,
    religion = 'islam',
    heroScale = 1,
    phaseOffset = 0,
  } = ctx;
  const t = elapsed + phaseOffset;

  resetPoseTargets(_pose);

  // Set base lower-body posture: either seated or locomotion/standing
  if (isSeated || state === 'sitting') {
    applySeatedLegs(_pose, seatStyle, seatTopY, heroScale);
  } else if (state === 'standing-up') {
    _pose.bodyPosY = 0.04;
    _pose.bodyRotX = 0.14;
    _pose.lLegX = -0.35;
    _pose.rLegX = -0.35;
    _pose.lKneeX = 0.55;
    _pose.rKneeX = 0.55;
  } else if (state === 'jumping') {
    _pose.lLegX = -0.36;
    _pose.rLegX = 0.28;
    _pose.lKneeX = 0.52;
    _pose.rKneeX = 0.35;
    _pose.lArmX = -1.1;
    _pose.rArmX = -1.1;
    _pose.lArmZ = 0.35;
    _pose.rArmZ = -0.35;
    _pose.lElbowX = -0.45;
    _pose.rElbowX = -0.45;
  } else if (state === 'walking' || state === 'running') {
    const freq = isSprinting || state === 'running' ? 14 : 9.2;
    const amp = isSprinting || state === 'running' ? 0.85 : 0.55;
    const swing = Math.sin(t * freq) * amp;
    const kneeLiftL = Math.max(0, Math.sin(t * freq + 0.4)) * (isSprinting ? 0.85 : 0.48);
    const kneeLiftR = Math.max(0, -Math.sin(t * freq + 0.4)) * (isSprinting ? 0.85 : 0.48);
    _pose.lLegX = swing;
    _pose.rLegX = -swing;
    _pose.lKneeX = kneeLiftL;
    _pose.rKneeX = kneeLiftR;
    _pose.bodyPosY = Math.abs(Math.sin(t * freq)) * (isSprinting ? 0.085 : 0.045);
    _pose.bodyRotX = isSprinting || state === 'running' ? 0.14 : 0.05;
    _pose.lArmX = -swing * 0.82;
    _pose.rArmX = swing * 0.82;
    _pose.lElbowX = isSprinting ? -0.85 : -0.35;
    _pose.rElbowX = isSprinting ? -0.85 : -0.35;
  } else if (state === 'turning') {
    _pose.bodyPosY = 0.02;
    _pose.lLegX = 0.18;
    _pose.rLegX = -0.18;
    _pose.lArmZ = 0.14;
    _pose.rArmZ = -0.14;
  } else {
    // Natural breathing idle
    _pose.bodyPosY = Math.sin(t * 2.2) * 0.02;
    _pose.headRotY = Math.sin(t * 0.9) * 0.09;
    _pose.headRotX = Math.sin(t * 1.4) * 0.03;
    _pose.lArmZ = 0.06 + Math.sin(t * 2.2) * 0.02;
    _pose.rArmZ = -0.06 - Math.sin(t * 2.2) * 0.02;
    _pose.lElbowX = -0.12;
    _pose.rElbowX = -0.12;
  }

  // Layer upper-body activity state smoothly on top (works both standing & seated!)
  switch (state) {
    case 'sitting': {
      _pose.bodyRotX = 0.03;
      _pose.lArmX = -0.52;
      _pose.rArmX = -0.52;
      _pose.lArmY = 0.18;
      _pose.rArmY = -0.18;
      _pose.lElbowX = -0.68;
      _pose.rElbowX = -0.68;
      _pose.headRotY = Math.sin(t * 1.0) * 0.08;
      break;
    }
    case 'reading': {
      _pose.bodyRotX = 0.08;
      _pose.headRotX = 0.28 + Math.sin(t * 1.8) * 0.04;
      _pose.lArmX = -0.78;
      _pose.rArmX = -0.78;
      _pose.lArmY = 0.28;
      _pose.rArmY = -0.28;
      _pose.lElbowX = -0.88;
      _pose.rElbowX = -0.88;
      break;
    }
    case 'writing': {
      _pose.bodyRotX = 0.14;
      _pose.headRotX = 0.34;
      _pose.headRotY = Math.sin(t * 4.5) * 0.04;
      _pose.lArmX = -0.72;
      _pose.lArmY = 0.25;
      _pose.lElbowX = -0.65;
      _pose.rArmX = -0.82 + Math.sin(t * 9.0) * 0.06;
      _pose.rArmY = -0.15 + Math.cos(t * 7.0) * 0.1;
      _pose.rElbowX = -0.58 + Math.sin(t * 9.0) * 0.08;
      break;
    }
    case 'raising-hand': {
      _pose.headRotX = -0.06;
      _pose.rArmX = -2.75 + Math.sin(t * 5.0) * 0.08;
      _pose.rArmZ = -0.18;
      _pose.rElbowX = -0.18;
      if (!isSeated) {
        _pose.lArmZ = 0.08;
      } else {
        _pose.lArmX = -0.5;
        _pose.lElbowX = -0.6;
      }
      break;
    }
    case 'pointing': {
      _pose.rArmX = -1.48;
      _pose.rArmZ = -0.08;
      _pose.rElbowX = -0.05;
      _pose.headRotX = -0.05;
      _pose.headRotY = Math.sin(t * 2.5) * 0.06;
      break;
    }
    case 'picking-up':
    case 'putting-down': {
      _pose.bodyRotX = 0.56;
      _pose.headRotX = 0.24;
      _pose.lKneeX = Math.max(_pose.lKneeX, 0.35);
      _pose.rKneeX = Math.max(_pose.rKneeX, 0.35);
      _pose.lLegX -= 0.22;
      _pose.rLegX -= 0.22;
      _pose.rArmX = -1.18 + Math.sin(t * 8.0) * 0.14;
      _pose.lArmX = -0.78;
      _pose.rElbowX = -0.25;
      _pose.lElbowX = -0.3;
      break;
    }
    case 'opening-door': {
      _pose.bodyRotX = 0.12;
      _pose.rArmX = -1.28;
      _pose.rArmY = -0.35 + Math.sin(t * 6.5) * 0.3;
      _pose.rElbowX = -0.45;
      break;
    }
    case 'talking': {
      _pose.headRotY = Math.sin(t * 2.8) * 0.14;
      _pose.headRotX = Math.sin(t * 4.2) * 0.07;
      _pose.rArmX = -0.62 + Math.sin(t * 5.5) * 0.22;
      _pose.rElbowX = -0.72 + Math.cos(t * 5.5) * 0.18;
      _pose.lArmX = -0.38 + Math.cos(t * 4.2) * 0.14;
      _pose.lElbowX = -0.58;
      break;
    }
    case 'listening':
    case 'nodding': {
      const nodSpeed = state === 'nodding' ? 6.5 : 3.2;
      _pose.headRotX = 0.08 + Math.max(0, Math.sin(t * nodSpeed)) * 0.18;
      if (isSeated) {
        _pose.lArmX = -0.54;
        _pose.rArmX = -0.54;
        _pose.lElbowX = -0.68;
        _pose.rElbowX = -0.68;
      } else {
        _pose.lArmX = -0.25;
        _pose.rArmX = -0.25;
        _pose.lElbowX = -0.4;
        _pose.rElbowX = -0.4;
      }
      break;
    }
    case 'praying': {
      // Strictly respectful & distinct per selected religion!
      if (religion === 'islam') {
        // Berdoa dengan menadahkan kedua telapak tangan di depan dada
        _pose.headRotX = 0.16;
        _pose.lArmX = -0.85;
        _pose.rArmX = -0.85;
        _pose.lArmY = 0.22;
        _pose.rArmY = -0.22;
        _pose.lElbowX = -0.75;
        _pose.rElbowX = -0.75;
      } else if (religion === 'hindu') {
        // Sembah Puyung / Amustikarana sopan di depan dada-dahi
        _pose.headRotX = 0.12;
        _pose.lArmX = -1.28;
        _pose.rArmX = -1.28;
        _pose.lArmY = 0.38;
        _pose.rArmY = -0.38;
        _pose.lElbowX = -1.12;
        _pose.rElbowX = -1.12;
      } else if (religion === 'buddha') {
        // Anjali: kedua telapak tangan dirangkapkan tenang di depan dada
        _pose.headRotX = 0.1;
        _pose.lArmX = -0.95;
        _pose.rArmX = -0.95;
        _pose.lArmY = 0.42;
        _pose.rArmY = -0.42;
        _pose.lElbowX = -1.18;
        _pose.rElbowX = -1.18;
      } else if (religion === 'khonghucu') {
        // Hormat Bao Quan Li tenang di depan dada
        _pose.headRotX = 0.14;
        _pose.bodyRotX = 0.08;
        _pose.lArmX = -0.92;
        _pose.rArmX = -0.92;
        _pose.lArmY = 0.36;
        _pose.rArmY = -0.36;
        _pose.lElbowX = -1.05;
        _pose.rElbowX = -1.05;
      } else {
        // Kristen / Katolik: tangan terkatup khusyuk & kepala tertunduk sopan
        _pose.headRotX = 0.24;
        _pose.lArmX = -0.82;
        _pose.rArmX = -0.82;
        _pose.lArmY = 0.35;
        _pose.rArmY = -0.35;
        _pose.lElbowX = -0.95;
        _pose.rElbowX = -0.95;
      }
      break;
    }
    case 'watering': {
      _pose.bodyRotX = 0.24;
      _pose.headRotX = 0.2;
      _pose.rArmX = -1.08 + Math.sin(t * 4.0) * 0.15;
      _pose.rElbowX = -0.35;
      _pose.lArmX = -0.35;
      break;
    }
    case 'observing': {
      _pose.bodyRotX = 0.42;
      _pose.headRotX = 0.28 + Math.sin(t * 2.2) * 0.08;
      _pose.headRotY = Math.sin(t * 1.7) * 0.2;
      _pose.lKneeX = Math.max(_pose.lKneeX, 0.28);
      _pose.rKneeX = Math.max(_pose.rKneeX, 0.28);
      _pose.lArmX = -0.55;
      _pose.rArmX = -0.55;
      _pose.lElbowX = -0.55;
      _pose.rElbowX = -0.55;
      break;
    }
    case 'clapping': {
      const clap = Math.abs(Math.sin(t * 11.0));
      _pose.lArmX = -0.95;
      _pose.rArmX = -0.95;
      _pose.lArmY = 0.22 + clap * 0.34;
      _pose.rArmY = -0.22 - clap * 0.34;
      _pose.lElbowX = -0.95;
      _pose.rElbowX = -0.95;
      _pose.headRotX = -0.05 + clap * 0.06;
      break;
    }
    case 'celebrating': {
      if (!isSeated) {
        _pose.bodyPosY = Math.abs(Math.sin(t * 8.0)) * 0.22;
      }
      _pose.lArmX = -2.45 + Math.sin(t * 10.0) * 0.25;
      _pose.rArmX = -2.45 + Math.cos(t * 10.0) * 0.25;
      _pose.lArmZ = 0.32;
      _pose.rArmZ = -0.32;
      _pose.lElbowX = -0.2;
      _pose.rElbowX = -0.2;
      _pose.headRotZ = Math.sin(t * 6.0) * 0.08;
      break;
    }
    case 'tossing-ball': {
      const toss = Math.sin(t * 7.5);
      _pose.rArmX = -1.6 + toss * 0.65;
      _pose.lArmX = -0.8 - toss * 0.3;
      _pose.rElbowX = -0.35;
      _pose.bodyRotX = -0.06 + toss * 0.08;
      break;
    }
    case 'greet': {
      _pose.rArmX = -2.35;
      _pose.rArmZ = -0.25 + Math.sin(t * 8.5) * 0.28;
      _pose.rElbowX = -0.25;
      _pose.headRotZ = 0.06;
      break;
    }
  }

  // Carrying basket/item adjusts arms smoothly when not doing a specialized two-hand override
  if (
    carryingBasket &&
    state !== 'praying' &&
    state !== 'reading' &&
    state !== 'writing' &&
    state !== 'clapping' &&
    state !== 'celebrating'
  ) {
    _pose.lArmX = -0.68;
    _pose.rArmX = -0.68;
    _pose.lArmY = 0.18;
    _pose.rArmY = -0.18;
    _pose.lElbowX = -0.65;
    _pose.rElbowX = -0.65;
  }

  // Toggle held 3D props cleanly with zero allocation
  if (rig.heldBook) {
    rig.heldBook.visible = state === 'reading';
  }
  if (rig.heldPencil) {
    rig.heldPencil.visible = state === 'writing';
  }
  if (rig.heldWateringCan) {
    rig.heldWateringCan.visible = state === 'watering';
  }

  // Smooth exponential damping across all joints
  const k = Math.min(1, 1 - Math.exp(-13 * Math.min(dt, 0.05)));
  const lerp = THREE.MathUtils.lerp;

  rig.bodyGroup.position.y = lerp(rig.bodyGroup.position.y, _pose.bodyPosY, k);
  rig.bodyGroup.position.z = lerp(rig.bodyGroup.position.z, _pose.bodyPosZ, k);
  rig.bodyGroup.rotation.x = lerp(rig.bodyGroup.rotation.x, _pose.bodyRotX, k);
  rig.bodyGroup.rotation.z = lerp(rig.bodyGroup.rotation.z, _pose.bodyRotZ, k);

  rig.headGroup.rotation.x = lerp(rig.headGroup.rotation.x, _pose.headRotX, k);
  rig.headGroup.rotation.y = lerp(rig.headGroup.rotation.y, _pose.headRotY, k);
  rig.headGroup.rotation.z = lerp(rig.headGroup.rotation.z, _pose.headRotZ, k);

  rig.leftArm.rotation.x = lerp(rig.leftArm.rotation.x, _pose.lArmX, k);
  rig.leftArm.rotation.y = lerp(rig.leftArm.rotation.y, _pose.lArmY, k);
  rig.leftArm.rotation.z = lerp(rig.leftArm.rotation.z, _pose.lArmZ, k);
  if (rig.leftElbow) {
    rig.leftElbow.rotation.x = lerp(rig.leftElbow.rotation.x, _pose.lElbowX, k);
  }

  rig.rightArm.rotation.x = lerp(rig.rightArm.rotation.x, _pose.rArmX, k);
  rig.rightArm.rotation.y = lerp(rig.rightArm.rotation.y, _pose.rArmY, k);
  rig.rightArm.rotation.z = lerp(rig.rightArm.rotation.z, _pose.rArmZ, k);
  if (rig.rightElbow) {
    rig.rightElbow.rotation.x = lerp(rig.rightElbow.rotation.x, _pose.rElbowX, k);
  }

  rig.leftLeg.rotation.x = lerp(rig.leftLeg.rotation.x, _pose.lLegX, k);
  rig.leftLeg.rotation.z = lerp(rig.leftLeg.rotation.z, _pose.lLegZ, k);
  if (rig.leftKnee) {
    rig.leftKnee.rotation.x = lerp(rig.leftKnee.rotation.x, _pose.lKneeX, k);
    rig.leftKnee.rotation.z = lerp(rig.leftKnee.rotation.z, _pose.lKneeZ, k);
  }

  rig.rightLeg.rotation.x = lerp(rig.rightLeg.rotation.x, _pose.rLegX, k);
  rig.rightLeg.rotation.z = lerp(rig.rightLeg.rotation.z, _pose.rLegZ, k);
  if (rig.rightKnee) {
    rig.rightKnee.rotation.x = lerp(rig.rightKnee.rotation.x, _pose.rKneeX, k);
    rig.rightKnee.rotation.z = lerp(rig.rightKnee.rotation.z, _pose.rKneeZ, k);
  }
}
