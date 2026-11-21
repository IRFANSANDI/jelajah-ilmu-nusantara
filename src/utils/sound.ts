// Synthesized Web Audio API sound effects & gentle ambient chimes (zero external paid APIs or audio files)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicInterval: number | null = null;
  private noteStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setConfig(soundEnabled: boolean, musicEnabled: boolean) {
    this.soundEnabled = soundEnabled;
    if (this.musicEnabled !== musicEnabled) {
      this.musicEnabled = musicEnabled;
      if (musicEnabled) {
        this.startAmbientLoop();
      } else {
        this.stopAmbientLoop();
      }
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ) {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public playClick() {
    this.playTone(540, 0.07, 'triangle', 0.06);
  }

  public playStep() {
    this.playTone(210, 0.045, 'sine', 0.025);
  }

  public playCoin() {
    this.playTone(880, 0.09, 'sine', 0.07, 0);
    this.playTone(1318.5, 0.16, 'sine', 0.07, 0.06);
  }

  public playCorrect() {
    this.playTone(523.25, 0.11, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.11, 'triangle', 0.08, 0.08);
    this.playTone(783.99, 0.18, 'triangle', 0.09, 0.16);
  }

  public playWrong() {
    this.playTone(260, 0.14, 'sawtooth', 0.04, 0);
    this.playTone(210, 0.2, 'sawtooth', 0.04, 0.1);
  }

  public playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.18, 'triangle', 0.08, idx * 0.09);
    });
  }

  public playUnlock() {
    this.playTone(587.33, 0.1, 'sine', 0.07, 0);
    this.playTone(880, 0.14, 'sine', 0.08, 0.08);
    this.playTone(1174.66, 0.22, 'sine', 0.08, 0.16);
  }

  private startAmbientLoop() {
    if (this.musicInterval !== null || typeof window === 'undefined') return;
    // Gentle pentatonic Nusantara chime melody (pelog/slendro inspired)
    const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0];
    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      const freq = pentatonic[this.noteStep % pentatonic.length];
      this.noteStep += 1;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.7);
    }, 850);
  }

  public stopAmbientLoop() {
    if (this.musicInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
