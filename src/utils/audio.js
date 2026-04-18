/**
 * Premium Game Audio Engine (Web Audio API)
 * Optimized for low-latency, polyphony, and high-performance streaming.
 */

const SFX_PATHS = {
  CLICK: '/click.mp3',
  POP: '/pop.mp3',
  NOTIFICATION: '/ui_sfx_notification.wav',
  SETTINGS_OPEN: '/ui_sfx_menu_open.wav',
  SETTINGS_CLOSE: '/ui_sfx_menu_close.wav',
  ALERT: '/ui_sfx_alert.wav',
  START_GAME: '/ui_sfx_start_button.wav',
  BACK: '/ui_sfx_back.wav',
  SAVE: '/ui_sfx_save.wav',
  TAB: '/punchy-taps-ui.wav',
  VICTORY: '/victory.mp3',
  DAILY_OPEN: '/wooden-trunk-latch-ui.wav',
  DAILY_CLAIM: '/punchy-taps-ui.wav',
  BUBBLE_POP: '/bubble-poP.wav'
};

const MUSIC_PATH = '/background.mp3';

// --- AUDIO ENGINE CLASS ---
class SoundEngine {
  constructor() {
    this.context = null;
    this.buffers = {};
    this.initialized = false;
    this.masterVolume = 0.15; // 15% Default as requested
    this.musicVolume = 0.06;
    
    // Music management (Streaming)
    this.musicAudioElement = null;
    this.musicMediaSource = null;
    this.musicGain = null;
    
    // Matchmaking Loop Management
    this.searchingNodes = [];
    this.searchingGain = null;
  }

  /**
   * Initialize AudioContext on first user interaction
   */
  async init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      
      // 1. Setup global gain nodes for music
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.context.destination);

      // 2. Setup Streaming Music (HTML5 Audio)
      if (!this.musicAudioElement) {
        this.musicAudioElement = new Audio(MUSIC_PATH);
        this.musicAudioElement.loop = true;
        this.musicAudioElement.crossOrigin = "anonymous";
        
        // Pipe HTML5 Audio into Web Audio API for gain control
        this.musicMediaSource = this.context.createMediaElementSource(this.musicAudioElement);
        this.musicMediaSource.connect(this.musicGain);
      }

      // 3. Pre-fetch ONLY short SFX (Fast Parallel Load)
      const loadPromises = Object.entries(SFX_PATHS).map(async ([key, path]) => {
        const buffer = await this.loadBuffer(path);
        if (buffer) this.buffers[key] = buffer;
      });
      
      // Don't wait for sounds to finish loading before allowing music to start
      Promise.all(loadPromises).then(() => {
        console.log("🔊 [AudioEngine] All SFX Loaded");
      });

      // 4. Start Streaming Music Immediately
      this.startMusic();
    } catch (e) {
      console.warn("AudioContext failed to initialize:", e);
    }
  }

  /**
   * Load and decode audio file into a buffer (For SFX)
   */
  async loadBuffer(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const decodedData = await this.context.decodeAudioData(arrayBuffer);
      return decodedData;
    } catch (e) {
      console.error(`❌ [AudioEngine] Failed to load SFX: ${url}`, e);
      return null;
    }
  }

  /**
   * Start Looping Music (Streaming)
   */
  startMusic() {
    if (!this.initialized || !this.musicAudioElement) return;

    // Only attempt to resume context natively if user has interacted, stopping the yellow console warning
    if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
      if (this.context.state === 'suspended') {
        this.context.resume().catch(() => {});
      }
    }

    this.musicAudioElement.play().then(() => {
      console.log("🎵 [AudioEngine] Music Streaming Started");
    }).catch(e => {
      // Silently catch the autoplay block. The global unlock listener will restart it later.
      if (e.name !== 'NotAllowedError') {
        console.warn("🎵 [AudioEngine] Music playback error:", e);
      }
    });
  }

  /**
   * Stop Music
   */
  stopMusic() {
    if (this.musicAudioElement) {
      this.musicAudioElement.pause();
      console.log("🎵 [AudioEngine] Music Streaming Stopped");
    }
  }

  /**
   * Set Master SFX Volume
   */
  setSfxVolume(volume) {
    this.masterVolume = volume;
    console.log(`🔊 [AudioEngine] Master SFX Volume set to: ${Math.round(volume * 100)}%`);
  }

  /**
   * Set Music Volume
   */
  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
    }
  }

  /**
   * Play a sound with polyphony
   */
  play(key, options = {}) {
    if (!this.initialized || !this.buffers[key]) return;

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    const { volume = 1.0, pitchRandomization = 0, detune = 0 } = options;
    const source = this.context.createBufferSource();
    source.buffer = this.buffers[key];

    const gainNode = this.context.createGain();
    
    let baseVolume = volume;
    if (key === 'CLICK') baseVolume *= 0.3;
    if (key === 'POP') baseVolume *= 0.45;
    if (key === 'ALERT') baseVolume *= 0.8;
    if (key === 'NOTIFICATION') baseVolume *= 0.9;
    if (key === 'START_GAME') baseVolume *= 0.2;
    if (key === 'TAB') baseVolume *= 0.6;
    if (key === 'BUBBLE_POP') baseVolume *= 0.8;
    
    gainNode.gain.value = baseVolume * this.masterVolume;

    if (pitchRandomization > 0) {
      const randomDetune = (Math.random() * 2 - 1) * pitchRandomization;
      source.detune.value = detune + randomDetune;
    } else if (detune !== 0) {
      source.detune.value = detune;
    }

    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);
  }

  /**
   * Start Radar-like searching sound (Synthesized)
   */
  startSearchingSfx() {
    if (!this.initialized || this.searchingNodes.length > 0) return;

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    this.searchingGain = this.context.createGain();
    this.searchingGain.gain.value = 0;
    this.searchingGain.connect(this.context.destination);

    // Initial Fade In (Updated to 20% volume)
    this.searchingGain.gain.linearRampToValueAtTime(0.2, this.context.currentTime + 0.5);

    // 1. Ambient Drone (Very subtle low hum)
    const drone = this.context.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55; // Low A
    const droneGain = this.context.createGain();
    droneGain.gain.value = 0.03;
    drone.connect(droneGain);
    droneGain.connect(this.searchingGain);
    drone.start();
    this.searchingNodes.push(drone);

    // 2. Pulse Loop (The "Radar" Bip)
    const pulseInterval = 1.5; // seconds
    const schedulePulse = () => {
      if (!this.searchingGain) return;

      const osc = this.context.createOscillator();
      const g = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.context.currentTime); // High A
      osc.frequency.exponentialRampToValueAtTime(440, this.context.currentTime + 0.15); // Drop-off

      g.gain.setValueAtTime(0, this.context.currentTime);
      g.gain.linearRampToValueAtTime(0.08, this.context.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.4);

      osc.connect(g);
      g.connect(this.searchingGain);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.5);

      const nextPulse = setTimeout(schedulePulse, pulseInterval * 1000);
      this.searchingNodes.push({ stop: () => { 
        clearTimeout(nextPulse); 
        osc.stop(); 
      }});
    };

    schedulePulse();
  }

  /**
   * Stop searching sound with optional fade
   */
  stopSearchingSfx(fade = true) {
    if (!this.searchingGain) return;

    const stopAll = () => {
      this.searchingNodes.forEach(node => {
        if (node.stop) node.stop();
        else node.stop();
      });
      this.searchingNodes = [];
      if (this.searchingGain) {
        this.searchingGain.disconnect();
        this.searchingGain = null;
      }
    };

    if (fade) {
      this.searchingGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
      setTimeout(stopAll, 600);
    } else {
      stopAll();
    }
  }
}

// Singleton Instance
const engine = new SoundEngine();

// Initialize on user activity
if (typeof window !== "undefined") {
  const unlock = () => {
    engine.init();
    if (engine.initialized) {
      if (engine.context && engine.context.state === 'suspended') {
        engine.context.resume().catch(()=>{});
      }
      engine.startMusic();
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock);
}

/**
 * Public API
 */
export const initAudio = () => engine.init();
export const startBackgroundMusic = () => engine.startMusic();
export const stopBackgroundMusic = () => engine.stopMusic();
export const setBackgroundMusicVolume = (volume) => engine.setMusicVolume(volume);
export const setSfxVolume = (volume) => engine.setSfxVolume(volume);

export const playKeyClickSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('CLICK', { pitchRandomization: 100 }); 
};

export const playPopSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('POP', { pitchRandomization: 50 });
};

export const playNotificationSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('NOTIFICATION');
};

export const playSettingsOpenSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('SETTINGS_OPEN');
};

export const playSettingsCloseSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('SETTINGS_CLOSE');
};

export const playAlertSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('ALERT');
};

export const playStartGameSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('START_GAME');
};

export const playBackSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('BACK');
};

export const playSaveSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('SAVE');
};

export const playTabSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('TAB');
};

export const playNotifSfx = playNotificationSfx;
export const playMessageSfx = playNotificationSfx;
export const playGameStartSfx = playStartGameSfx;
export const playSuccessSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('VICTORY');
};
export const playCoinSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('SAVE');
};

export const playDailyOpenSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('DAILY_OPEN');
};

export const playDailyClaimSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('DAILY_CLAIM');
};

export const playBubblePopSfx = (enabled = true) => {
  if (!enabled) return;
  engine.play('BUBBLE_POP', { pitchRandomization: 10 });
};

export const startSearchingSfx = () => engine.startSearchingSfx();
export const stopSearchingSfx = (fade = true) => engine.stopSearchingSfx(fade);

