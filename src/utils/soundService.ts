import { AlarmToneId, ALARM_TONES } from './fajrLogic';

type PlaybackListener = (isPlaying: boolean, toneId: AlarmToneId | null) => void;
type AutoplayBlockedListener = (isBlocked: boolean) => void;

/**
 * SoundService handles audio playback for the 3 Fajr Alarm tones:
 * 1. tone_qom: "قم يا أخي" (/audio/tone_qom.mp3 - 1:33 mins)
 * 2. tone_adhan: "الصلاة خير من النوم" (/audio/tone_adhan.mp3 - 0:33 mins)
 * 3. tone_quran: "إن المتقين في جنات" (/audio/tone_quran.mp3 - 0:56 mins)
 *
 * Features:
 * - Direct HTML5 Audio playback with BaseURL resolution
 * - AudioContext unlock on user interaction
 * - Autoplay policy detection with reactive UI state
 * - Synthesizer fallback for each tone if audio file fails
 * - Tasbih click & quiz haptics / chimes
 */
class SoundService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingToneId: AlarmToneId | null = null;
  private isAlarmLooping = false;
  private audioCtx: AudioContext | null = null;
  private previewEndCallback: (() => void) | null = null;
  private fallbackTimeout: ReturnType<typeof setTimeout> | null = null;
  private isAutoplayBlocked = false;

  private playbackListeners: Set<PlaybackListener> = new Set();
  private autoplayListeners: Set<AutoplayBlockedListener> = new Set();

  /**
   * Subscribe to playback state changes
   */
  public subscribePlayback(listener: PlaybackListener): () => void {
    this.playbackListeners.add(listener);
    listener(this.isPlaying(), this.currentPlayingToneId);
    return () => this.playbackListeners.delete(listener);
  }

  /**
   * Subscribe to autoplay blocked state changes
   */
  public subscribeAutoplayBlocked(listener: AutoplayBlockedListener): () => void {
    this.autoplayListeners.add(listener);
    listener(this.isAutoplayBlocked);
    return () => this.autoplayListeners.delete(listener);
  }

  private notifyPlaybackChange(): void {
    const playing = this.isPlaying();
    this.playbackListeners.forEach((listener) => {
      try {
        listener(playing, this.currentPlayingToneId);
      } catch (err) {
        console.warn('Playback listener error:', err);
      }
    });
  }

  private setAutoplayBlocked(blocked: boolean): void {
    if (this.isAutoplayBlocked !== blocked) {
      this.isAutoplayBlocked = blocked;
      this.autoplayListeners.forEach((listener) => {
        try {
          listener(blocked);
        } catch (err) {
          console.warn('Autoplay listener error:', err);
        }
      });
    }
  }

  public getIsAutoplayBlocked(): boolean {
    return this.isAutoplayBlocked;
  }

  /**
   * Resolves audio URL robustly accounting for Vite BASE_URL
   */
  public getAudioUrl(toneId: AlarmToneId): string {
    const tone = ALARM_TONES.find((t) => t.id === toneId);
    const rawPath = tone?.audioUrl || '/audio/tone_qom.mp3';
    
    // If running with a base path, ensure leading slash is handled
    const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;

    return `${cleanBase}${cleanPath}`;
  }

  /**
   * Initializes or unlocks Web Audio Context
   */
  public unlockAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('Failed to unlock AudioContext:', e);
      return null;
    }
  }

  /**
   * Stops any currently playing audio (alarm, preview, or synthesized fallback)
   */
  public stopAlarmSound(): void {
    this.isAlarmLooping = false;
    this.currentPlayingToneId = null;
    this.setAutoplayBlocked(false);

    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
      } catch (e) {
        console.warn('Error stopping audio:', e);
      }
      this.currentAudio = null;
    }

    if (this.previewEndCallback) {
      const cb = this.previewEndCallback;
      this.previewEndCallback = null;
      cb();
    }

    this.notifyPlaybackChange();
  }

  /**
   * Starts looping alarm sound for the selected toneId
   */
  public startAlarmSound(toneId: AlarmToneId = 'tone_qom'): void {
    this.stopAlarmSound();
    this.isAlarmLooping = true;
    this.currentPlayingToneId = toneId;
    this.unlockAudioContext();

    const src = this.getAudioUrl(toneId);
    const audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.volume = 1.0;
    audio.preload = 'auto';
    this.currentAudio = audio;

    const onUserInteractionUnlock = () => {
      this.unlockAudioContext();
      if (this.isAlarmLooping && this.currentAudio) {
        this.currentAudio.play().then(() => {
          this.setAutoplayBlocked(false);
          this.notifyPlaybackChange();
        }).catch(() => {
          // If still blocked, use synthesized melody
          this.playSynthesizedToneFallback(toneId, true);
        });
      }
      window.removeEventListener('click', onUserInteractionUnlock);
      window.removeEventListener('touchstart', onUserInteractionUnlock);
      window.removeEventListener('keydown', onUserInteractionUnlock);
    };

    audio.onerror = () => {
      console.warn('Failed to load audio file, falling back to synthesized chime:', src);
      if (this.isAlarmLooping) {
        this.playSynthesizedToneFallback(toneId, true);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.setAutoplayBlocked(false);
          this.notifyPlaybackChange();
        })
        .catch((err) => {
          console.warn('Audio play restricted by browser autoplay policy:', err);
          this.setAutoplayBlocked(true);

          window.addEventListener('click', onUserInteractionUnlock, { once: true });
          window.addEventListener('touchstart', onUserInteractionUnlock, { once: true });
          window.addEventListener('keydown', onUserInteractionUnlock, { once: true });
        });
    }

    this.notifyPlaybackChange();
  }

  /**
   * Previews a selected tone with automatic stop on track end
   */
  public previewTone(toneId: AlarmToneId, onEnd?: () => void): void {
    this.stopAlarmSound();
    this.currentPlayingToneId = toneId;
    this.previewEndCallback = onEnd || null;
    this.unlockAudioContext();

    const src = this.getAudioUrl(toneId);
    const audio = new Audio();
    audio.src = src;
    audio.loop = false;
    audio.volume = 1.0;
    audio.preload = 'auto';
    this.currentAudio = audio;

    const handleFinish = () => {
      this.currentPlayingToneId = null;
      this.currentAudio = null;
      if (this.previewEndCallback) {
        const cb = this.previewEndCallback;
        this.previewEndCallback = null;
        cb();
      }
      this.notifyPlaybackChange();
    };

    audio.onended = handleFinish;

    audio.onerror = () => {
      console.warn('Audio preview file error, playing synthesized preview:', src);
      this.playSynthesizedToneFallback(toneId, false, handleFinish);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.notifyPlaybackChange();
        })
        .catch((err) => {
          console.warn('Audio preview restricted, falling back to Web Audio:', err);
          this.playSynthesizedToneFallback(toneId, false, handleFinish);
        });
    }

    this.notifyPlaybackChange();
  }

  /**
   * Web Audio melodic fallback if audio files cannot be loaded or played
   */
  private playSynthesizedToneFallback(
    toneId: AlarmToneId,
    loop: boolean,
    onEnd?: () => void
  ): void {
    try {
      const ctx = this.unlockAudioContext();
      if (!ctx) {
        if (onEnd) onEnd();
        return;
      }

      const now = ctx.currentTime;
      let notes: { freq: number; duration: number; delay: number }[] = [];

      switch (toneId) {
        case 'tone_adhan':
          // Sacred Bayati / Hijaz Fajr Adhan sequence
          notes = [
            { freq: 293.66, duration: 0.8, delay: 0.0 }, // D4
            { freq: 329.63, duration: 0.7, delay: 0.8 }, // E4
            { freq: 349.23, duration: 1.0, delay: 1.5 }, // F4
            { freq: 392.00, duration: 0.9, delay: 2.5 }, // G4
            { freq: 440.00, duration: 1.2, delay: 3.4 }, // A4
            { freq: 392.00, duration: 0.8, delay: 4.6 }, // G4
            { freq: 349.23, duration: 1.4, delay: 5.4 }, // F4
          ];
          break;

        case 'tone_quran':
          // Peaceful morning recitation chimes
          notes = [
            { freq: 349.23, duration: 0.9, delay: 0.0 }, // F4
            { freq: 440.00, duration: 0.9, delay: 0.9 }, // A4
            { freq: 523.25, duration: 1.2, delay: 1.8 }, // C5
            { freq: 587.33, duration: 1.4, delay: 3.0 }, // D5
            { freq: 523.25, duration: 1.0, delay: 4.4 }, // C5
            { freq: 440.00, duration: 1.6, delay: 5.4 }, // A4
          ];
          break;

        case 'tone_qom':
        default:
          // Majestic awakening call
          notes = [
            { freq: 261.63, duration: 0.7, delay: 0.0 }, // C4
            { freq: 329.63, duration: 0.7, delay: 0.7 }, // E4
            { freq: 392.00, duration: 0.8, delay: 1.4 }, // G4
            { freq: 523.25, duration: 1.5, delay: 2.2 }, // C5
            { freq: 392.00, duration: 0.8, delay: 3.7 }, // G4
            { freq: 523.25, duration: 1.8, delay: 4.5 }, // C5
          ];
          break;
      }

      const totalDuration = notes.reduce((max, n) => Math.max(max, n.delay + n.duration), 0);

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = toneId === 'tone_adhan' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.delay);

        gain.gain.setValueAtTime(0.001, now + note.delay);
        gain.gain.linearRampToValueAtTime(0.3, now + note.delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.delay);
        osc.stop(now + note.delay + note.duration);
      });

      if (loop && this.isAlarmLooping) {
        this.fallbackTimeout = setTimeout(() => {
          if (this.isAlarmLooping) {
            this.playSynthesizedToneFallback(toneId, true);
          }
        }, (totalDuration + 1) * 1000);
      } else {
        this.fallbackTimeout = setTimeout(() => {
          this.currentPlayingToneId = null;
          if (onEnd) onEnd();
          this.notifyPlaybackChange();
        }, totalDuration * 1000);
      }
    } catch (e) {
      console.warn('Synthesized tone fallback error:', e);
      if (onEnd) onEnd();
    }
  }

  public isPlaying(): boolean {
    if (this.currentAudio && !this.currentAudio.paused) return true;
    return this.fallbackTimeout !== null;
  }

  public getCurrentlyPlayingToneId(): AlarmToneId | null {
    return this.currentPlayingToneId;
  }

  /**
   * Tasbih click tick via Web Audio
   */
  public playTasbihTick(): void {
    try {
      const ctx = this.unlockAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch {
      // Audio fallback
    }
  }

  /**
   * Mission completion celebratory sound
   */
  public playSuccessSound(): void {
    try {
      const ctx = this.unlockAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gainNode.gain.setValueAtTime(0.001, now + index * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.8);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 1.8);
      });
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 50, 100]);
      }
    } catch {
      // Audio fallback
    }
  }

  /**
   * Gentle incorrect answer sound
   */
  public playGentleErrorSound(): void {
    try {
      const ctx = this.unlockAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.25);

      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Fallback
    }
  }
}

export const soundService = new SoundService();
