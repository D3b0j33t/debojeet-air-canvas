/**
 * AudioManager — Procedural sound effects using Web Audio API.
 * No external audio files needed; all sounds are synthesized.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _muted: boolean;

  // Active oscillators for continuous sounds
  private drawOscillator: OscillatorNode | null = null;
  private drawGain: GainNode | null = null;

  constructor() {
    this._muted = localStorage.getItem('aircanvas_muted') === 'true';
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._muted ? 0 : 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  get muted(): boolean {
    return this._muted;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    localStorage.setItem('aircanvas_muted', String(this._muted));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this._muted ? 0 : 0.3,
        this.ctx!.currentTime,
        0.05
      );
    }
    return this._muted;
  }

  /** Soft sine hum that follows drawing — call once when drawing starts */
  startDrawSound(): void {
    const ctx = this.ensureContext();
    if (this.drawOscillator) return;

    this.drawOscillator = ctx.createOscillator();
    this.drawGain = ctx.createGain();

    this.drawOscillator.type = 'sine';
    this.drawOscillator.frequency.value = 440;
    this.drawGain.gain.value = 0;

    this.drawOscillator.connect(this.drawGain);
    this.drawGain.connect(this.masterGain!);
    this.drawOscillator.start();

    // Fade in
    this.drawGain.gain.setTargetAtTime(0.15, ctx.currentTime, 0.1);
  }

  /** Update draw sound frequency based on position/velocity */
  updateDrawSound(velocity: number): void {
    if (!this.drawOscillator || !this.ctx) return;
    // Map velocity to frequency range 300-600Hz
    const freq = 300 + Math.min(velocity / 3, 300);
    this.drawOscillator.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
  }

  /** Fade out and stop draw sound */
  stopDrawSound(): void {
    if (!this.drawGain || !this.drawOscillator || !this.ctx) return;

    this.drawGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    const osc = this.drawOscillator;
    const gain = this.drawGain;
    setTimeout(() => {
      try { osc.stop(); } catch {}
      try { osc.disconnect(); gain.disconnect(); } catch {}
    }, 200);
    this.drawOscillator = null;
    this.drawGain = null;
  }

  /** Rising pitch whoosh for inflation */
  playInflateSound(): void {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  }

  /** Short noise burst for pop/remove */
  playPopSound(): void {
    const ctx = this.ensureContext();
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start(ctx.currentTime);
  }

  /** Soft click for grab */
  playGrabSound(): void {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  /** Quick swoosh for swipe */
  playSwooshSound(): void {
    const ctx = this.ensureContext();
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15);
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start(ctx.currentTime);
  }

  /** Release sound when dropping object */
  playReleaseSound(): void {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  destroy(): void {
    this.stopDrawSound();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
