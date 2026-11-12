import { KeySwitchProfile } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.6;
  private profile: KeySwitchProfile = 'blue';

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setProfile(profile: KeySwitchProfile) {
    this.profile = profile;
  }

  public getProfile(): KeySwitchProfile {
    return this.profile;
  }

  /**
   * Procedural mechanical switch click
   */
  public playClick() {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.8, now);
      masterGain.connect(this.ctx.destination);

      // Pitch jitter factor
      const jitter = 0.95 + Math.random() * 0.1; // 0.95 - 1.05

      // 1. High-frequency click / snap (switch leaf actuation)
      if (this.profile === 'blue') {
        const snapOsc = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snapOsc.type = 'triangle';
        snapOsc.frequency.setValueAtTime(3200 * jitter, now);
        snapOsc.frequency.exponentialRampToValueAtTime(1400 * jitter, now + 0.012);

        snapGain.gain.setValueAtTime(0.7, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        snapOsc.connect(snapGain);
        snapGain.connect(masterGain);

        snapOsc.start(now);
        snapOsc.stop(now + 0.018);
      } else if (this.profile === 'brown') {
        // Subtle tactile bump
        const bumpOsc = this.ctx.createOscillator();
        const bumpGain = this.ctx.createGain();
        bumpOsc.type = 'sine';
        bumpOsc.frequency.setValueAtTime(1800 * jitter, now);
        bumpOsc.frequency.exponentialRampToValueAtTime(900 * jitter, now + 0.015);

        bumpGain.gain.setValueAtTime(0.4, now);
        bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

        bumpOsc.connect(bumpGain);
        bumpGain.connect(masterGain);

        bumpOsc.start(now);
        bumpOsc.stop(now + 0.02);
      }

      // 2. Body resonance & keycap bottom-out thump (all mechanical switches have this)
      const thumpOsc = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thumpOsc.type = 'sine';

      const baseFreq = this.profile === 'red' ? 140 : this.profile === 'brown' ? 160 : 190;
      thumpOsc.frequency.setValueAtTime(baseFreq * jitter, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(55 * jitter, now + 0.045);

      thumpGain.gain.setValueAtTime(this.profile === 'red' ? 0.9 : 0.6, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(masterGain);

      thumpOsc.start(now);
      thumpOsc.stop(now + 0.055);

      // 3. Transient noise burst (micro texture of plastic on stem)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.012);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(this.profile === 'red' ? 2400 : 4200, now);
      noiseFilter.Q.setValueAtTime(2.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noiseSource.start(now);
    } catch {
      // Audio fallback fail silently if blocked
    }
  }

  /**
   * Error buzz / subtle thump for incorrect shortcut attempt
   */
  public playError() {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.5, now);
      masterGain.connect(this.ctx.destination);

      // Low saw/square frequency buzz
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Harmonious chime for completing a run
   */
  public playSuccessChime() {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.45);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
