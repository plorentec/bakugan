/**
 * audio.ts — AudioManager using Web Audio API.
 *
 * Generates all sounds procedurally (oscillators, noise, envelopes).
 * No external audio files needed.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type SoundName =
  | "throw"
  | "stand"
  | "battle_start"
  | "win"
  | "lose"
  | "select"
  | "buy"
  | "level_up"
  | "click"
  | "critical_ko"
  | "double_stand"
  | "gate_card_place"
  | "ability_play"
  | "minigame_scratch"
  | "timer_warning";

export type MusicName = "menu" | "arena" | "battle";

/* ------------------------------------------------------------------ */
/*  AudioManager singleton                                              */
/* ------------------------------------------------------------------ */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: MusicPlayer | null = null;
  private musicVolume = 0.3;
  private sfxVolume = 0.6;

  /** Lazy-init (needs user gesture) */
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /* ---- SFX ---- */

  playSfx(name: SoundName): void {
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;

    const now = ctx.currentTime;
    const sounds: Record<SoundName, () => void> = {
      throw: () => this.playThrowSfx(ctx, now),
      stand: () => this.playStandSfx(ctx, now),
      battle_start: () => this.playBattleStartSfx(ctx, now),
      win: () => this.playWinSfx(ctx, now),
      lose: () => this.playLoseSfx(ctx, now),
      select: () => this.playSelectSfx(ctx, now),
      buy: () => this.playBuySfx(ctx, now),
      level_up: () => this.playLevelUpSfx(ctx, now),
      click: () => this.playClickSfx(ctx, now),
      critical_ko: () => this.playCriticalKoSfx(ctx, now),
      double_stand: () => this.playDoubleStandSfx(ctx, now),
      gate_card_place: () => this.playGateCardPlaceSfx(ctx, now),
      ability_play: () => this.playAbilityPlaySfx(ctx, now),
      minigame_scratch: () => this.playMinigameScratchSfx(ctx, now),
      timer_warning: () => this.playTimerWarningSfx(ctx, now),
    };

    sounds[name]?.();
  }

  /* ---- Music ---- */

  playMusic(name: MusicName): void {
    this.stopMusic();
    const ctx = this.ensureContext();
    if (!this.musicGain) return;
    this.currentMusic = new MusicPlayer(ctx, this.musicGain, name);
    this.currentMusic.start();
  }

  stopMusic(): void {
    this.currentMusic?.stop();
    this.currentMusic = null;
  }

  /* ---- Volume ---- */

  setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  /* ================================================================== */
  /*  Individual sound generators                                         */
  /* ================================================================== */

  private playThrowSfx(ctx: AudioContext, now: number): void {
    // Ascending pitch sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playStandSfx(ctx: AudioContext, now: number): void {
    // Click + resonance
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "square";
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.15);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(600, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);
    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.4);
  }

  private playBattleStartSfx(ctx: AudioContext, now: number): void {
    // Dramatic chord (3-note power chord)
    const freqs = [220, 277, 330, 440];
    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.15, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  }

  private playWinSfx(ctx: AudioContext, now: number): void {
    // Triumphant melody: ascending notes
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.3);
    });
  }

  private playLoseSfx(ctx: AudioContext, now: number): void {
    // Descending pitch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  private playSelectSfx(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  private playBuySfx(ctx: AudioContext, now: number): void {
    // Coin sound: two quick high-pitched tones
    const freqs = [1200, 1600];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.25, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.15);
    });
  }

  private playLevelUpSfx(ctx: AudioContext, now: number): void {
    // Ascending arpeggio
    const notes = [392, 494, 587, 784, 988]; // G4 B4 D5 G5 B5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.25, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  }

  private playClickSfx(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1000, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  private playCriticalKoSfx(ctx: AudioContext, now: number): void {
    // Explosion-like noise burst + low rumble
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
    noise.stop(now + 0.5);

    // Low boom
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  private playDoubleStandSfx(ctx: AudioContext, now: number): void {
    // Quick triumphant double-beep
    const freqs = [880, 1100];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.3, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.2);
    });
  }

  private playGateCardPlaceSfx(ctx: AudioContext, now: number): void {
    // Metallic placement sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playAbilityPlaySfx(ctx: AudioContext, now: number): void {
    // Magical shimmer
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800 + i * 200, now + i * 0.06);
      gain.gain.setValueAtTime(0.15, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    }
  }

  private playMinigameScratchSfx(ctx: AudioContext, now: number): void {
    // Short scratchy noise
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    src.connect(gain);
    gain.connect(this.sfxGain!);
    src.start(now);
    src.stop(now + 0.06);
  }

  private playTimerWarningSfx(ctx: AudioContext, now: number): void {
    // Quick beep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0, now + 0.05);
    gain.gain.setValueAtTime(0.15, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.12);
  }
}

/* ------------------------------------------------------------------ */
/*  Procedural Music Player                                             */
/* ------------------------------------------------------------------ */

interface MusicPattern {
  /** Notes: [freq, startBeat, durationBeats] */
  notes: [number, number, number][];
  bpm: number;
  loopBeats: number;
}

class MusicPlayer {
  private ctx: AudioContext;
  private output: GainNode;
  private pattern: MusicPattern;
  private oscillators: OscillatorNode[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private running = false;

  constructor(ctx: AudioContext, output: GainNode, name: MusicName) {
    this.ctx = ctx;
    this.output = output;
    this.pattern = getMusicPattern(name);
  }

  start(): void {
    this.running = true;
    this.scheduleLoop();
  }

  stop(): void {
    this.running = false;
    for (const osc of this.oscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    for (const t of this.timers) {
      clearTimeout(t);
    }
    this.oscillators = [];
    this.timers = [];
  }

  private scheduleLoop(): void {
    if (!this.running) return;

    const beatDuration = 60 / this.pattern.bpm;
    const loopDuration = this.pattern.loopBeats * beatDuration * 1000;

    for (const [freq, startBeat, durBeats] of this.pattern.notes) {
      const startMs = startBeat * beatDuration * 1000;
      const durMs = durBeats * beatDuration * 1000;

      const timer = setTimeout(() => {
        if (!this.running) return;
        this.playNote(freq, durMs / 1000);
      }, startMs);
      this.timers.push(timer);
    }

    const loopTimer = setTimeout(() => {
      this.scheduleLoop();
    }, loopDuration);
    this.timers.push(loopTimer);
  }

  private playNote(freq: number, duration: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.setValueAtTime(0.08, now + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(this.output);
    osc.start(now);
    osc.stop(now + duration);
    this.oscillators.push(osc);
  }
}

/* ------------------------------------------------------------------ */
/*  Music patterns (procedural melodies)                                */
/* ------------------------------------------------------------------ */

function getMusicPattern(name: MusicName): MusicPattern {
  switch (name) {
    case "menu":
      // Calm, gentle melody in C major
      return {
        bpm: 90,
        loopBeats: 16,
        notes: [
          [262, 0, 2], [330, 2, 2], [392, 4, 2], [330, 6, 2],
          [349, 8, 2], [392, 10, 1], [330, 11, 1], [262, 12, 4],
          // Bass
          [131, 0, 4], [165, 4, 4], [175, 8, 4], [131, 12, 4],
        ],
      };
    case "arena":
      // Upbeat, rhythmic — driving energy
      return {
        bpm: 130,
        loopBeats: 16,
        notes: [
          [330, 0, 1], [330, 1, 0.5], [330, 2, 1], [0, 3, 0.5],
          [392, 4, 1], [392, 5, 0.5], [392, 6, 1], [0, 7, 0.5],
          [440, 8, 1], [392, 9, 1], [330, 10, 1], [294, 11, 1],
          [262, 12, 2], [294, 14, 2],
          // Bass line
          [165, 0, 2], [165, 2, 2], [196, 4, 2], [196, 6, 2],
          [220, 8, 2], [196, 10, 2], [165, 12, 2], [147, 14, 2],
        ],
      };
    case "battle":
      // Intense, fast-paced
      return {
        bpm: 160,
        loopBeats: 16,
        notes: [
          [440, 0, 0.5], [0, 0.5, 0.5], [440, 1, 0.5], [0, 1.5, 0.5],
          [523, 2, 0.5], [0, 2.5, 0.5], [587, 3, 0.5], [0, 3.5, 0.5],
          [659, 4, 1], [587, 5, 1], [523, 6, 1], [440, 7, 1],
          [392, 8, 0.5], [0, 8.5, 0.5], [440, 9, 0.5], [0, 9.5, 0.5],
          [523, 10, 0.5], [0, 10.5, 0.5], [659, 11, 0.5], [0, 11.5, 0.5],
          [880, 12, 2], [659, 14, 2],
          // Bass
          [220, 0, 1], [220, 2, 1], [262, 4, 1], [220, 6, 1],
          [196, 8, 1], [220, 10, 1], [262, 12, 2],
        ],
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton export                                                   */
/* ------------------------------------------------------------------ */

export const audioManager = new AudioManager();
