// Procedural Web Audio API sound effects & per-grade / per-subject atmospheric music for 3D gameplay
import type { SubjectId } from './inventoryData';

export type GradeAudioId = 1 | 2 | 3 | 4 | 5 | 6;

interface BgmCfg {
  notes: number[];
  tempoMs: number;
  wave: OscillatorType;
  vol: number;
}

const GRADE_BGM_CONFIG: Record<GradeAudioId, BgmCfg> = {
  // Kelas 1: Ceria & playful xylophone/marimba C major pentatonic
  1: { notes: [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25], tempoMs: 420, wave: 'triangle', vol: 0.022 },
  // Kelas 2: Desa hangat slendro/pelog pentatonic angklung
  2: { notes: [440, 493.88, 554.37, 659.25, 739.99, 659.25, 554.37, 493.88], tempoMs: 480, wave: 'sine', vol: 0.025 },
  // Kelas 3: Hutan misteri & suling rimba
  3: { notes: [329.63, 392.0, 440, 493.88, 587.33, 493.88, 440, 392.0], tempoMs: 560, wave: 'sine', vol: 0.024 },
  // Kelas 4: Pesisir pulau berangin & ceria
  4: { notes: [392.0, 493.88, 587.33, 739.99, 783.99, 739.99, 587.33, 493.88], tempoMs: 440, wave: 'triangle', vol: 0.02 },
  // Kelas 5: Laboratorium sains futuristik bersih
  5: { notes: [440, 523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 523.25], tempoMs: 390, wave: 'sine', vol: 0.02 },
  // Kelas 6: Kerajaan megah Nusantara
  6: { notes: [293.66, 369.99, 440, 587.33, 554.37, 440, 369.99, 329.63], tempoMs: 500, wave: 'triangle', vol: 0.022 },
};

const GRADE1_SUBJECT_BGM: Record<SubjectId, BgmCfg> = {
  agama: { notes: [392.0, 440, 493.88, 587.33, 493.88, 440, 392.0, 329.63], tempoMs: 540, wave: 'sine', vol: 0.021 },
  pancasila: { notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 659.25], tempoMs: 430, wave: 'triangle', vol: 0.022 },
  'bahasa-indonesia': { notes: [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25], tempoMs: 420, wave: 'triangle', vol: 0.022 },
  matematika: { notes: [440, 554.37, 659.25, 880, 659.25, 554.37, 587.33, 440], tempoMs: 400, wave: 'triangle', vol: 0.021 },
  ipas: { notes: [349.23, 440, 523.25, 659.25, 587.33, 440, 392.0, 349.23], tempoMs: 470, wave: 'sine', vol: 0.022 },
  pjok: { notes: [587.33, 739.99, 880, 987.77, 880, 739.99, 659.25, 587.33], tempoMs: 340, wave: 'triangle', vol: 0.021 },
  'seni-budaya': { notes: [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 880, 783.99], tempoMs: 450, wave: 'sine', vol: 0.022 },
  'bahasa-inggris': { notes: [493.88, 622.25, 739.99, 830.61, 739.99, 622.25, 554.37, 493.88], tempoMs: 410, wave: 'triangle', vol: 0.021 },
  'muatan-lokal': { notes: [440, 493.88, 587.33, 659.25, 783.99, 659.25, 587.33, 493.88], tempoMs: 490, wave: 'sine', vol: 0.024 },
};

const INSTRUMENT_SCALE = [
  523.25, // C5 Do
  587.33, // D5 Re
  659.25, // E5 Mi
  698.46, // F5 Fa
  783.99, // G5 Sol
  880.0,  // A5 La
  987.77, // B5 Si
  1046.5, // C6 Do'
];

class Sound3D {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private bgmTimer: number | null = null;
  private activeBgmGrade: GradeAudioId | null = null;
  private activeGrade1Subject: SubjectId | null = null;
  private bgmStep = 0;

  private ensureCtx(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.clearBgmTimer();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    } else if (this.activeBgmGrade && this.bgmTimer === null) {
      this.startBgmLoop(this.activeBgmGrade, this.activeGrade1Subject);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private clearBgmTimer() {
    if (this.bgmTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private startBgmLoop(grade: GradeAudioId, g1Subject?: SubjectId | null) {
    this.clearBgmTimer();
    if (!this.enabled || typeof window === 'undefined') return;
    const cfg =
      grade === 1 && g1Subject && GRADE1_SUBJECT_BGM[g1Subject]
        ? GRADE1_SUBJECT_BGM[g1Subject]
        : GRADE_BGM_CONFIG[grade];
    this.bgmTimer = window.setInterval(() => {
      if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
      const freq = cfg.notes[this.bgmStep % cfg.notes.length];
      const dur = (cfg.tempoMs / 1000) * 0.85;
      this.tone(freq, dur, cfg.wave, cfg.vol, 0);
      // Soft octave/fifth harmony every 4th beat
      if (this.bgmStep % 4 === 0) {
        this.tone(freq * 0.5, dur * 1.4, 'sine', cfg.vol * 0.75, 0.02);
      }
      this.bgmStep = (this.bgmStep + 1) % cfg.notes.length;
    }, cfg.tempoMs);
  }

  public startBgm(grade: GradeAudioId, g1Subject?: SubjectId) {
    this.activeBgmGrade = grade;
    this.activeGrade1Subject = grade === 1 ? (g1Subject ?? null) : null;
    this.bgmStep = 0;
    if (this.enabled) {
      this.startBgmLoop(grade, this.activeGrade1Subject);
    }
  }

  public stopBgm() {
    this.activeBgmGrade = null;
    this.activeGrade1Subject = null;
    this.clearBgmTimer();
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    vol = 0.06,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t0 + duration);
    }

    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  public playFootstep(running = false) {
    this.tone(running ? 165 : 135, 0.055, 'triangle', running ? 0.04 : 0.028, 0, 80);
  }

  public playJump() {
    this.tone(240, 0.16, 'sine', 0.07, 0, 520);
  }

  public playLand() {
    this.tone(140, 0.09, 'triangle', 0.05, 0, 65);
  }

  public playCoin() {
    this.tone(987.77, 0.08, 'sine', 0.07, 0);
    this.tone(1318.51, 0.16, 'sine', 0.07, 0.06);
  }

  public playScroll() {
    this.tone(523.25, 0.1, 'triangle', 0.07, 0);
    this.tone(659.25, 0.1, 'triangle', 0.07, 0.07);
    this.tone(783.99, 0.18, 'triangle', 0.08, 0.14);
  }

  public playNpcTalk() {
    this.tone(440, 0.06, 'sine', 0.05, 0);
    this.tone(554.37, 0.08, 'sine', 0.05, 0.05);
  }

  public playMissionComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      this.tone(f, 0.2, 'triangle', 0.08, idx * 0.09);
    });
  }

  public playGradeUpFanfare() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chord.forEach((f, idx) => {
      this.tone(f, 0.34, 'triangle', 0.085, idx * 0.11);
    });
    this.tone(1046.5, 0.55, 'sine', 0.07, 0.58);
  }

  public playChime(step: number) {
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0];
    const freq = scale[Math.max(0, Math.min(scale.length - 1, step))];
    this.tone(freq, 0.22, 'triangle', 0.08, 0);
  }

  public playInstrumentNote(noteIdx: number, timber: 'xylophone' | 'angklung' = 'xylophone') {
    const freq = INSTRUMENT_SCALE[((noteIdx % INSTRUMENT_SCALE.length) + INSTRUMENT_SCALE.length) % INSTRUMENT_SCALE.length];
    if (timber === 'angklung') {
      this.tone(freq, 0.36, 'sine', 0.09, 0);
      this.tone(freq * 2, 0.24, 'triangle', 0.035, 0.03);
      this.tone(freq * 1.006, 0.32, 'sine', 0.045, 0.06);
    } else {
      this.tone(freq, 0.34, 'triangle', 0.09, 0);
      this.tone(freq * 2, 0.14, 'sine', 0.035, 0);
    }
  }

  public playAlertCue() {
    this.tone(587.33, 0.1, 'triangle', 0.07, 0, 440);
    this.tone(587.33, 0.12, 'triangle', 0.07, 0.14, 440);
  }

  public playWaterSplash() {
    this.tone(360, 0.16, 'sine', 0.06, 0, 180);
    this.tone(520, 0.14, 'triangle', 0.045, 0.06, 760);
  }

  public playSortSuccess() {
    this.tone(659.25, 0.09, 'triangle', 0.07, 0);
    this.tone(880.0, 0.14, 'triangle', 0.075, 0.07);
  }

  public playDoorTransition(entering = true) {
    if (entering) {
      this.tone(392.0, 0.09, 'triangle', 0.06, 0);
      this.tone(523.25, 0.14, 'triangle', 0.065, 0.07);
    } else {
      this.tone(523.25, 0.09, 'triangle', 0.06, 0);
      this.tone(392.0, 0.14, 'triangle', 0.065, 0.07);
    }
  }

  public playCashRegister() {
    this.tone(1046.5, 0.07, 'sine', 0.07, 0);
    this.tone(1318.51, 0.08, 'sine', 0.075, 0.06);
    this.tone(1567.98, 0.18, 'triangle', 0.08, 0.12);
  }

  public playPoseSuccess() {
    this.tone(587.33, 0.09, 'triangle', 0.07, 0);
    this.tone(739.99, 0.09, 'triangle', 0.07, 0.07);
    this.tone(880.0, 0.18, 'triangle', 0.08, 0.14);
  }

  public speakEnglish(text: string): boolean {
    if (!this.enabled) return false;
    this.playChime(2);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.88;
      utter.pitch = 1.08;
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (enVoice) utter.voice = enVoice;
      window.speechSynthesis.speak(utter);
      return true;
    } catch {
      return false;
    }
  }
}

export const sound3d = new Sound3D();

