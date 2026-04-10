let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // ignore audio errors
  }
};

export const playCoin = () => playTone(1200, 'sine', 0.15, 0.1);
export const playSpin = () => playTone(300, 'triangle', 0.05, 0.05);
export const playWin = () => {
  playTone(440, 'sine', 0.2, 0.1);
  setTimeout(() => playTone(554, 'sine', 0.2, 0.1), 100);
  setTimeout(() => playTone(659, 'sine', 0.4, 0.1), 200);
  setTimeout(() => playTone(880, 'sine', 0.6, 0.1), 300);
};

export const playSlotsWin = (rarity: 'COMMON' | 'EPIC' | 'LEGENDARY' | 'GODLY') => {
  const ctx = getCtx();
  if (!ctx) return;
  
  if (rarity === 'COMMON') {
    playTone(600, 'sine', 0.2, 0.1);
    setTimeout(() => playTone(800, 'sine', 0.3, 0.1), 100);
  } else if (rarity === 'EPIC') {
    [440, 554, 659, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 'square', 0.2, 0.05), i * 100);
    });
  } else if (rarity === 'LEGENDARY') {
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sawtooth', 0.3, 0.05), i * 80);
    });
  } else if (rarity === 'GODLY') {
    // Deep orchestral-style hit + high shimmer
    playTone(110, 'sawtooth', 1.0, 0.2);
    playTone(220, 'sawtooth', 1.0, 0.15);
    [880, 1100, 1320, 1760].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 0.5, 0.1), i * 50);
    });
  }
};

export const playBlackjackAction = (action: 'hit' | 'stand' | 'double' | 'win' | 'blackjack' | 'lose' | 'push') => {
  switch (action) {
    case 'hit': playTone(400, 'triangle', 0.1, 0.05); break;
    case 'stand': playTone(300, 'triangle', 0.1, 0.05); break;
    case 'double': 
      playTone(400, 'triangle', 0.1, 0.05);
      setTimeout(() => playTone(500, 'triangle', 0.1, 0.05), 50);
      break;
    case 'win':
      playTone(523, 'sine', 0.2, 0.1);
      setTimeout(() => playTone(659, 'sine', 0.3, 0.1), 100);
      break;
    case 'blackjack':
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => playTone(f, 'sine', 0.4, 0.1), i * 100);
      });
      break;
    case 'lose':
      playTone(200, 'sawtooth', 0.4, 0.1);
      setTimeout(() => playTone(150, 'sawtooth', 0.4, 0.1), 200);
      break;
    case 'push':
      playTone(300, 'sine', 0.3, 0.1);
      break;
  }
};

export const playVFXSound = (type: 'shatter' | 'explosion' | 'shimmer') => {
  switch (type) {
    case 'shatter':
      for(let i=0; i<5; i++) {
        setTimeout(() => playTone(2000 + Math.random() * 1000, 'sine', 0.05, 0.02), i * 20);
      }
      break;
    case 'explosion':
      playTone(60, 'sawtooth', 0.8, 0.2);
      playTone(100, 'triangle', 0.5, 0.1);
      break;
    case 'shimmer':
      for(let i=0; i<10; i++) {
        setTimeout(() => playTone(1500 + i * 100, 'sine', 0.1, 0.03), i * 30);
      }
      break;
  }
};

export const playLose = () => {
  playTone(300, 'sawtooth', 0.3, 0.1);
  setTimeout(() => playTone(250, 'sawtooth', 0.5, 0.1), 200);
};
export const playCard = () => playTone(150, 'square', 0.05, 0.05);
export const playChip = () => playTone(2000, 'sine', 0.05, 0.05);

export const playClick = () => {
  // Thoccy click: Low thud + high crisp click
  playTone(120, 'triangle', 0.1, 0.1); // Thud
  playTone(1200, 'sine', 0.01, 0.05);  // Click
};

export const playHover = () => {
  // Subtle thoccy hover
  playTone(150, 'triangle', 0.05, 0.03);
};
