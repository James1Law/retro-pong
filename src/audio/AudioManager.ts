/**
 * AudioManager - Retro 8-bit sound effects using Web Audio API
 * Generates all sounds procedurally for authentic chiptune aesthetic
 */

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _muted: boolean = false;
  private _volume: number = 0.3;
  private initialized: boolean = false;

  private constructor() {
    // Load saved preferences
    const savedMuted = localStorage.getItem('lawsBreakoutMuted');
    const savedVolume = localStorage.getItem('lawsBreakoutVolume');
    if (savedMuted) this._muted = savedMuted === 'true';
    if (savedVolume) this._volume = parseFloat(savedVolume);
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio context - must be called after user interaction
   */
  init(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.updateVolume();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  /**
   * Resume audio context if suspended (required for mobile)
   */
  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  set muted(value: boolean) {
    this._muted = value;
    localStorage.setItem('lawsBreakoutMuted', String(value));
    this.updateVolume();
  }

  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
    localStorage.setItem('lawsBreakoutVolume', String(this._volume));
    this.updateVolume();
  }

  private updateVolume(): void {
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : this._volume;
    }
  }

  toggleMute(): void {
    this.muted = !this._muted;
  }

  // ============ Core Sound Generation ============

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 1,
    fadeOut: boolean = true
  ): void {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    const gainValue = volume * 0.5; // Scale down to avoid clipping
    const now = this.audioContext.currentTime;

    // Must use setValueAtTime before exponentialRampToValueAtTime
    gain.gain.setValueAtTime(gainValue, now);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);

    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }

    osc.stop(now + duration);
  }

  private playFrequencySweep(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 1
  ): void {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;

    const gainValue = volume * 0.5;
    const now = this.audioContext.currentTime;

    // Must use setValueAtTime before exponentialRampToValueAtTime
    osc.frequency.setValueAtTime(startFreq, now);
    gain.gain.setValueAtTime(gainValue, now);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playNoise(duration: number, volume: number = 1): void {
    if (!this.audioContext || !this.masterGain) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    const gainValue = volume * 0.3;
    const now = this.audioContext.currentTime;

    // Must use setValueAtTime before exponentialRampToValueAtTime
    gain.gain.setValueAtTime(gainValue, now);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.start(now);
    noise.stop(now + duration);
  }

  private playArpeggio(
    frequencies: number[],
    noteDuration: number,
    type: OscillatorType = 'square',
    volume: number = 1
  ): void {
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, noteDuration, type, volume);
      }, i * noteDuration * 1000 * 0.8);
    });
  }

  // ============ Game Sound Effects ============

  /**
   * Ball hits paddle - soft boop
   */
  paddleHit(): void {
    this.playTone(440, 0.08, 'square', 0.6);
  }

  /**
   * Ball hits wall - quick high blip
   */
  wallHit(): void {
    this.playTone(660, 0.05, 'square', 0.4);
  }

  /**
   * Brick hit but not destroyed - tap
   */
  brickHit(): void {
    this.playTone(330, 0.06, 'square', 0.5);
  }

  /**
   * Brick destroyed - 8-bit explosion
   */
  brickDestroy(): void {
    // Noise burst + frequency sweep down for explosion effect
    this.playNoise(0.15, 0.8);
    this.playFrequencySweep(400, 80, 0.15, 'square', 0.6);
  }

  /**
   * Ball launched - whoosh sweep up
   */
  launch(): void {
    this.playFrequencySweep(200, 600, 0.15, 'triangle', 0.5);
  }

  /**
   * Power-up collected - rising chime
   */
  powerUpCollect(): void {
    this.playArpeggio([523, 659, 784], 0.08, 'square', 0.7); // C5, E5, G5
  }

  /**
   * Multi-ball activated - sparkle effect
   */
  multiBall(): void {
    this.playArpeggio([784, 988, 1175, 1318], 0.06, 'square', 0.6); // G5, B5, D6, E6
  }

  /**
   * Extra life gained - classic 1-up jingle
   */
  extraLife(): void {
    this.playArpeggio([523, 659, 784, 1047], 0.1, 'square', 0.8); // C5, E5, G5, C6
  }

  /**
   * Level complete - victory fanfare
   */
  levelComplete(): void {
    const melody = [523, 587, 659, 784, 659, 784, 1047]; // C5 D5 E5 G5 E5 G5 C6
    this.playArpeggio(melody, 0.12, 'square', 0.8);
  }

  /**
   * Life lost - sad descending tone
   */
  loseLife(): void {
    this.playFrequencySweep(440, 110, 0.4, 'triangle', 0.6);
  }

  /**
   * Game over - descending minor melody
   */
  gameOver(): void {
    const melody = [392, 370, 330, 294, 262]; // G4, F#4, E4, D4, C4
    this.playArpeggio(melody, 0.2, 'square', 0.7);
  }

  /**
   * Game start - upbeat start jingle
   */
  gameStart(): void {
    const melody = [262, 330, 392, 523]; // C4, E4, G4, C5
    this.playArpeggio(melody, 0.1, 'square', 0.7);
  }

  /**
   * New high score - celebratory jingle
   */
  newHighScore(): void {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319]; // C5 E5 G5 C6 G5 C6 E6
    this.playArpeggio(melody, 0.1, 'square', 0.9);
  }

  /**
   * Menu blip - simple UI sound
   */
  menuBlip(): void {
    this.playTone(880, 0.05, 'square', 0.4);
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
