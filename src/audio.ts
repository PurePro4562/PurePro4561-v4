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
export const playLose = () => {
  playTone(300, 'sawtooth', 0.3, 0.1);
  setTimeout(() => playTone(250, 'sawtooth', 0.5, 0.1), 200);
};
export const playCard = () => playTone(150, 'square', 0.05, 0.05);
export const playChip = () => playTone(2000, 'sine', 0.05, 0.05);

export const playClick = () => {
  playTone(180, 'triangle', 0.1, 0.05);
  playTone(800, 'sine', 0.02, 0.02);
};
