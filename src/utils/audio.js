/**
 * Audio Utilities
 * Handles sound effects for the application.
 * All functions include zero-latency logic and handle browser restrictions.
 */

// --- PRELOADER CACHE ---
const audioCache = {};

const loadSound = (path, volume = 0.5) => {
  if (typeof Audio === "undefined") return null;
  if (audioCache[path]) return audioCache[path];
  
  const audio = new Audio(path);
  audio.preload = 'auto';
  audio.volume = volume;
  audioCache[path] = audio;
  return audio;
};

// Pre-initialize main sounds
if (typeof window !== "undefined") {
  loadSound('/click.mp3', 0.25);
  loadSound('/pop.mp3', 0.35);
  loadSound('/noti.mp3', 0.7);
  loadSound('/messag.mp3', 0.65);
  loadSound('/start.mp3', 0.5);
  loadSound('/victory.mp3', 0.4);
  loadSound('/coin.mp3', 0.3);
}

/**
 * Professional Keyboard Click (iPhone Style)
 */
export const playKeyClickSfx = (enabled = true) => {
  if (!enabled) return;
  const sfx = loadSound('/click.mp3', 0.25);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
};

/**
 * UI Transition / Grid Flip Sound
 */
let lastPopTime = 0;
export const playPopSfx = (enabled = true, bypassDebounce = false) => {
  if (!enabled) return;
  
  if (!bypassDebounce) {
    const now = Date.now();
    if (now - lastPopTime < 100) return; // Shorter debounce for grid flips
    lastPopTime = now;
  }

  const sfx = loadSound('/pop.mp3', 0.35);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
};

/**
 * System Notification Sound
 */
export const playNotifSfx = (enabled = true) => {
  if (!enabled) return;
  const sfx = loadSound('/noti.mp3', 0.7);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
};

/**
 * Private Message Sound
 */
export const playMessageSfx = (enabled = true) => {
  if (!enabled) return;
  const sfx = loadSound('/messag.mp3', 0.65);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
};

/**
 * Game Mode Start Sound
 */
export const playGameStartSfx = (enabled = true) => {
  if (!enabled) return;
  const sfx = loadSound('/start.mp3', 0.5);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
};

/**
 * Victory Fanfare Sound
 */
export const playSuccessSfx = (enabled = true) => {
  if (!enabled) return;
  const sfx = loadSound('/victory.mp3', 0.4);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
};

/**
 * Coin / Reward Sound
 */
export const playCoinSfx = (enabled = true) => {
  if (!enabled) return;
  const sfx = loadSound('/coin.mp3', 0.3);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
};
