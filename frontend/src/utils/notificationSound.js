// utils/notificationSound.js

// Global audio context (reuse to avoid creating multiple contexts)
let audioContext = null;
let isAudioEnabled = false;

// Initialize audio context on first user interaction
const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      isAudioEnabled = true;
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Failed to create audio context:', error);
      isAudioEnabled = false;
    }
  }
  
  // Resume context if suspended (browser autoplay policy)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      isAudioEnabled = true;
      console.log('Audio context resumed');
    }).catch(err => {
      console.error('Failed to resume audio context:', err);
    });
  }
};

// Initialize on page load with user interaction
if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, initAudioContext, { once: true });
  });
}

export const playNotificationSound = (type = 'default') => {
  console.log(`🔊 playNotificationSound called with type: ${type}`);
  
  try {
    // Initialize audio context if not already done
    if (!audioContext) {
      console.log('Initializing audio context...');
      initAudioContext();
    }
    
    // Check if audio is enabled
    if (!isAudioEnabled || !audioContext) {
      console.warn('⚠️ Audio not enabled yet - waiting for user interaction');
      return;
    }
    
    console.log('Audio context state:', audioContext.state);
    
    // Resume if suspended
    if (audioContext.state === 'suspended') {
      console.log('Resuming suspended audio context...');
      audioContext.resume().then(() => {
        console.log('Audio context resumed successfully');
      });
    }
    
    const sounds = {
      like: () => createLikeSound(audioContext),
      friend_request: () => createFriendRequestSound(audioContext),
      friend_accepted: () => createSuccessSound(audioContext),
      match: () => createMatchSound(audioContext),
      message: () => createMessageSound(audioContext),
      gift: () => createGiftSound(audioContext),
      boost: () => createBoostSound(audioContext),
      error: () => createErrorSound(audioContext),
      default: () => createDefaultSound(audioContext),
      success: () => createSuccessSound(audioContext)
    };
    
    const soundFunction = sounds[type] || sounds.default;
    console.log(`Calling sound function for: ${type}`);
    soundFunction();
    
    console.log(`✅ Sound played: ${type}`);
    
  } catch (error) {
    console.error("❌ Could not play notification sound:", error);
  }
};

const createLikeSound = (audioContext) => {
  // Sweet heart sound - ascending notes
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Heart beat rhythm
  oscillator1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
  oscillator1.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
  
  oscillator2.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
  
  oscillator1.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.2);
  
  oscillator2.start(audioContext.currentTime + 0.2);
  oscillator2.stop(audioContext.currentTime + 0.4);
};

const createFriendRequestSound = (audioContext) => {
  // Friendly notification - two tone
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
  oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.15); // C#5
  
  gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const createSuccessSound = (audioContext) => {
  // Success sound - ascending triad (LOUDER)
  const frequencies = [523, 659, 784]; // C-E-G major chord
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine'; // Smooth sine wave
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const startTime = audioContext.currentTime + index * 0.1;
    oscillator.frequency.setValueAtTime(freq, startTime);
    
    // Much louder volume
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.3);
  });
  
  console.log('Success sound created and playing');
};

const createMatchSound = (audioContext) => {
  // Exciting match sound - celebration
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Rapid ascending notes
  oscillator1.frequency.setValueAtTime(523, audioContext.currentTime);
  oscillator1.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
  oscillator1.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
  
  oscillator2.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3); // High C
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator1.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.3);
  
  oscillator2.start(audioContext.currentTime + 0.3);
  oscillator2.stop(audioContext.currentTime + 0.5);
};

const createMessageSound = (audioContext) => {
  // Gentle message notification - soft ping
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
  
  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.25);
};

const createGiftSound = (audioContext) => {
  // Magical gift sound - sparkly ascending notes
  const frequencies = [523, 659, 784, 1047]; // C-E-G-C octave
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.08);
    
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime + index * 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.08 + 0.4);
    
    oscillator.start(audioContext.currentTime + index * 0.08);
    oscillator.stop(audioContext.currentTime + index * 0.08 + 0.4);
  });
};

const createErrorSound = (audioContext) => {
  // Error sound - descending disappointed tone (LOUDER)
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'square'; // Harsher sound for errors
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  const startTime = audioContext.currentTime;
  oscillator.frequency.setValueAtTime(400, startTime);
  oscillator.frequency.linearRampToValueAtTime(250, startTime + 0.3);
  
  // Much louder
  gainNode.gain.setValueAtTime(0.4, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.4);
  
  console.log('Error sound created and playing');
};

const createBoostSound = (audioContext) => {
  // Power-up boost sound - energetic ascending
  const frequencies = [440, 554, 659, 880]; // A-C#-E-A octave
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.06);
    
    gainNode.gain.setValueAtTime(0.18, audioContext.currentTime + index * 0.06);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.06 + 0.35);
    
    oscillator.start(audioContext.currentTime + index * 0.06);
    oscillator.stop(audioContext.currentTime + index * 0.06 + 0.35);
  });
};

const createDefaultSound = (audioContext) => {
  // Simple notification beep (LOUDER)
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  const startTime = audioContext.currentTime;
  oscillator.frequency.setValueAtTime(800, startTime);
  oscillator.frequency.setValueAtTime(600, startTime + 0.1);
  
  // Much louder
  gainNode.gain.setValueAtTime(0.5, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.2);
  
  console.log('Default sound created and playing');
};

export default { playNotificationSound };