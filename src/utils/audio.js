/**
 * Audio Utilities
 * Handles sound effects for the application.
 * Optimized for low-latency feedback.
 */

const SOUND_PATHS = {
  CLICK: '/click.mp3',
  POP: '/pop.mp3',
  NOTIF: '/noti.mp3',
  MESSAGE: '/messag.mp3',
  VICTORY: '/victory.mp3',
  COIN: '/coin.mp3'
};

// --- PRE-LOADED SINGLETONS ---
const preloadedSounds = {};

export const initAudio = () => {
  if (typeof Audio === "undefined") return;
  
  Object.entries(SOUND_PATHS).forEach(([key, path]) => {
    const audio = new Audio(path);
    audio.preload = 'auto';
    // Set default volumes
    if (key === 'CLICK') audio.volume = 0.25;
    if (key === 'POP') audio.volume = 0.35;
    if (key === 'NOTIF') audio.volume = 0.7;
    if (key === 'MESSAGE') audio.volume = 0.65;
    if (key === 'VICTORY') audio.volume = 0.4;
    if (key === 'COIN') audio.volume = 0.3;
    
    preloadedSounds[key] = audio;
  });
};

// Initialize early
if (typeof window !== "undefined") {
  initAudio();
}

const safePlay = (soundKey) => {
  const sfx = preloadedSounds[soundKey];
  if (sfx) {
    if (!sfx.paused) {
      sfx.pause();
    }
    sfx.currentTime = 0;
    // Offload to task queue to prevent blocking Main thread during critical paint
    setTimeout(() => {
      sfx.play().catch(() => {
        // Browsers often block auto-play until interaction.
      });
    }, 0);
  }
};

/**
 * Professional Keyboard Click (iPhone Style)
 */
export const playKeyClickSfx = (enabled = true) => {
  if (!enabled) return;
  safePlay('CLICK');
};

/**
 * UI Transition / Grid Flip Sound
 */
let lastPopTime = 0;
export const playPopSfx = (enabled = true, bypassDebounce = false) => {
  if (!enabled) return;
  
  if (!bypassDebounce) {
    const now = Date.now();
    if (now - lastPopTime < 80) return; // Slightly faster debounce
    lastPopTime = now;
  }

  safePlay('POP');
};

/**
 * System Notification Sound
 */
export const playNotifSfx = (enabled = true) => {
  if (!enabled) return;
  safePlay('NOTIF');
};

/**
 * Private Message Sound
 */
export const playMessageSfx = (enabled = true) => {
  if (!enabled) return;
  safePlay('MESSAGE');
};

/**
 * Game Mode Start Sound - Currently unused
 */
export const playGameStartSfx = () => {
  return;
};

/**
 * Victory Fanfare Sound
 */
export const playSuccessSfx = (enabled = true) => {
  if (!enabled) return;
  safePlay('VICTORY');
};

/**
 * Coin / Reward Sound
 */
export const playCoinSfx = (enabled = true) => {
  if (!enabled) return;
  safePlay('COIN');
};
