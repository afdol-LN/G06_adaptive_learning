// Sound effects for the student side. Files live in public/sounds/ and are served as-is by Vite.
// Controllers call soundService.play(...) — components never create Audio objects themselves.
const SOUND_FILES = {
  correct: "/sounds/correct-1.mp3",
  incorrect: "/sounds/incorrect-1.mp3",
  complete: "/sounds/complete-1.mp3",
  nodeClick: "/sounds/node-click-1.mp3",
} as const;

export type SoundName = keyof typeof SOUND_FILES;

const ENABLED_KEY = "sound";
const DEFAULT_VOLUME = 0.4;

export class SoundService {
  private cache = new Map<SoundName, HTMLAudioElement>();
  private enabled: boolean;

  constructor() {
    // storage may be unreadable (private mode / blocked) — fall back to sound on
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(ENABLED_KEY);
    } catch {
      // keep default
    }
    this.enabled = stored !== "off";
  }

  // Loads every file up front so the first play has no delay. Safe to call more than once.
  preload = (): void => {
    if (typeof Audio === "undefined") return;
    (Object.keys(SOUND_FILES) as SoundName[]).forEach((name) => this.get(name));
  };

  play = (name: SoundName): void => {
    if (!this.enabled || typeof Audio === "undefined") return;
    // clone so the same sound can overlap itself (e.g. fast repeated clicks)
    const audio = this.get(name).cloneNode() as HTMLAudioElement;
    audio.volume = DEFAULT_VOLUME;
    // browsers reject play() before the first user gesture (autoplay policy) — skip silently
    audio.play().catch(() => {});
  };

  isEnabled = (): boolean => this.enabled;

  setEnabled = (enabled: boolean): void => {
    this.enabled = enabled;
    try {
      localStorage.setItem(ENABLED_KEY, enabled ? "on" : "off");
    } catch {
      // not kept — resets to on next visit
    }
  };

  private get(name: SoundName): HTMLAudioElement {
    let audio = this.cache.get(name);
    if (!audio) {
      audio = new Audio(SOUND_FILES[name]);
      audio.preload = "auto";
      this.cache.set(name, audio);
    }
    return audio;
  }
}

export const soundService = new SoundService();
