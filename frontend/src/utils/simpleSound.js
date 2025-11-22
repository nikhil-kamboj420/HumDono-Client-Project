// Simple sound utility using HTML5 Audio
// Works reliably across all browsers

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.audioContext = null;
  }

  // Initialize AudioContext on first use (requires user interaction)
  initAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext not supported:', error);
        return false;
      }
    }
    return true;
  }

  // Create sound using data URI (base64 encoded beep)
  createBeep(frequency = 800, duration = 200) {
    if (!this.initAudioContext()) {
      return false;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);

      return true;
    } catch (error) {
      console.warn('Error creating beep:', error);
      return false;
    }
  }

  play(type = 'default') {
    if (!this.enabled) {
      return;
    }

    try {
      switch (type) {
        case 'success':
          // Happy ascending beeps
          this.createBeep(523, 100);
          setTimeout(() => this.createBeep(659, 100), 100);
          setTimeout(() => this.createBeep(784, 150), 200);
          break;

        case 'error':
          // Sad descending beep
          this.createBeep(400, 150);
          setTimeout(() => this.createBeep(300, 200), 150);
          break;

        case 'notification':
        case 'message':
          // Gentle ping
          this.createBeep(600, 100);
          setTimeout(() => this.createBeep(800, 100), 100);
          break;

        case 'match':
          // Exciting celebration
          this.createBeep(523, 80);
          setTimeout(() => this.createBeep(659, 80), 80);
          setTimeout(() => this.createBeep(784, 80), 160);
          setTimeout(() => this.createBeep(1047, 150), 240);
          break;

        case 'gift':
          // Magical sparkle
          this.createBeep(523, 60);
          setTimeout(() => this.createBeep(659, 60), 60);
          setTimeout(() => this.createBeep(784, 60), 120);
          setTimeout(() => this.createBeep(1047, 100), 180);
          break;

        default:
          // Simple beep
          this.createBeep(800, 150);
          break;
      }
    } catch (error) {
      // Silent fail
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export simple function
export const playSound = (type) => {
  soundManager.play(type);
};

export const enableSound = () => {
  soundManager.enable();
};

export const disableSound = () => {
  soundManager.disable();
};

export const setVolume = (volume) => {
  soundManager.setVolume(volume);
};

export default soundManager;
