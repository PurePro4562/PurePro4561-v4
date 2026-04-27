import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Video, Sparkles } from 'lucide-react';
import { playCoin, playSlotsWin, playLose, playSpin, playClick, playHover } from '../audio';

const SYMBOLS = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];
const MULTIPLIERS: Record<string, number> = { '🍒': 2, '🍋': 3, '🍇': 5, '🔔': 10, '💎': 25, '7️⃣': 50 };

const getRarity = (symbol: string): 'COMMON' | 'EPIC' | 'LEGENDARY' | 'GODLY' => {
  if (symbol === '7️⃣') return 'GODLY';
  if (symbol === '💎') return 'LEGENDARY';
  if (symbol === '🔔' || symbol === '🍇') return 'EPIC';
  return 'COMMON';
};

interface SlotsProps {
  gameId: string;
  title: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
  themeGradient: string;
  themeColor: string;
  onRecordBet: (amount: number, winnings: number, game: string, type: 'chips' | 'tokens') => void;
  onWatchAd: () => void;
  adsWatchedToday: number;
  adsWatchedWithoutWin: number;
  resetPityTimer: () => void;
  globalMultiplier?: number;
  riggedness: number;
}

const GAME_CONFIGS: Record<string, { symbols: string[], multipliers: Record<string, number>, minBet: number }> = {
  'custom-101': {
    symbols: ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'],
    multipliers: { '🍒': 2, '🍋': 3, '🍇': 5, '🔔': 10, '💎': 25, '7️⃣': 50 },
    minBet: 10
  },
  'custom-202': {
    symbols: ['⚡', '🔥', '🔱', '⚖️', '👑', '🌌'],
    multipliers: { '⚡': 5, '🔥': 10, '🔱': 20, '⚖️': 50, '👑': 100, '🌌': 250 },
    minBet: 500
  },
  'custom-108': {
    symbols: ['💾', '💿', '📟', '🔋', '📡', '🛰️'],
    multipliers: { '💾': 3, '💿': 5, '📟': 8, '🔋': 15, '📡': 35, '🛰️': 100 },
    minBet: 50
  }
};

export default function Slots({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, onWatchAd, adsWatchedToday, adsWatchedWithoutWin, resetPityTimer, globalMultiplier = 1, riggedness = 1.0 }: SlotsProps) {
  const config = GAME_CONFIGS[gameId] || GAME_CONFIGS['custom-101'];
  const SYMBOLS = config.symbols;
  const MULTIPLIERS = config.multipliers;

  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(config.minBet);
  const [winMsg, setWinMsg] = useState('');
  const [winAmount, setWinAmount] = useState(0);
  const [isNearMiss, setIsNearMiss] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [isGhostJackpot, setIsGhostJackpot] = useState(false);

  // Auto-clear win summary within 800ms
  useEffect(() => {
    if (winMsg) {
      const timer = setTimeout(() => {
        setWinMsg('');
        setWinAmount(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [winMsg]);

  const triggerVictoryFeedback = useCallback((amount: number, symbol: string) => {
    setWinAmount(amount);
    const index = SYMBOLS.indexOf(symbol);
    const status = index > 4 ? 'GODLY' : index > 3 ? 'LEGENDARY' : index > 1 ? 'EPIC' : 'COMMON';
    setWinMsg(status === 'COMMON' ? 'WIN!' : status === 'EPIC' ? 'EPIC WIN!' : status === 'LEGENDARY' ? 'LEGENDARY!' : 'GODLY JACKPOT!');
    playSlotsWin(status as any);
  }, [SYMBOLS]);

  const finalizeSpin = useCallback((forcedResult?: string[], ghostJackpot?: boolean) => {
    const finalReels = forcedResult || [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
    
    // Ghost Jackpot Logic
    if (ghostJackpot) {
      setReels([finalReels[0], finalReels[1], finalReels[0]]);
      setTimeout(() => {
        setReels(finalReels);
        playLose();
      }, 400);
    }

    const [r1, r2, r3] = finalReels;

    let win = 0;
    if (r1 === r2 && r2 === r3) {
      win = bet * MULTIPLIERS[r1] * globalMultiplier;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      win = bet * 2 * globalMultiplier;
    }

    setTimeout(() => {
      if (win > 0) {
        setBalance(b => b + win);
        triggerVictoryFeedback(win, r1);
        if (win > bet) {
          playCoin();
          setTimeout(playCoin, 200);
        }
        resetPityTimer();
      } else {
        if (!ghostJackpot) playLose();
      }
      onRecordBet(bet, win, title, 'chips');
      setIsSpinning(false);
      setIsNearMiss(false);
      setIsGhostJackpot(false);
      setSpinningReels([false, false, false]);
    }, ghostJackpot ? 1600 : 1200);
  }, [bet, setBalance, triggerVictoryFeedback, onRecordBet, resetPityTimer, SYMBOLS, MULTIPLIERS, globalMultiplier, title]);

  const spin = () => {
    if (balance < bet || isSpinning) {
      if (balance < bet) setShowAdOverlay(true);
      return;
    }
    setBalance(b => b - bet);
    setIsSpinning(true);
    setSpinningReels([true, true, true]);
    setWinMsg('');
    setWinAmount(0);
    playCoin();

    const isHighBalance = balance > 10000;
    const rand = Math.random();
    let forcedResult: string[] | undefined;
    let ghostJackpot = false;
    let nearMiss = false;

    // Riggedness: Make it really hard to win
    const isGodly = gameId === 'custom-202';
    // Significantly increased loss threshold to make wins very rare
    const baseLossThreshold = isGodly ? (isHighBalance ? 0.98 : 0.95) : (isHighBalance ? 0.95 : 0.90);
    const lossThreshold = Math.min(0.995, baseLossThreshold * riggedness);
    const falseWinThreshold = Math.min(0.999, lossThreshold + 0.05);
    
    if (rand < lossThreshold) {
      const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const otherSymbols = SYMBOLS.filter(s => s !== s1);
      const s2 = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
      const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      
      if (Math.random() < 0.6) {
        forcedResult = [s1, s1, s2];
        nearMiss = true;
        setIsNearMiss(true);
      } else {
        forcedResult = [s1, s2, s3];
      }
    } else if (rand < falseWinThreshold) {
      const s1 = SYMBOLS[Math.floor(Math.random() * 3)];
      const otherSymbols = SYMBOLS.filter(s => s !== s1);
      const s2 = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
      forcedResult = [s1, s2, s1];
      nearMiss = true;
      setIsNearMiss(true);
    } else {
      // Jackpot Terminal has a higher chance for Satellite wins
      const upperLimit = gameId === 'custom-108' ? SYMBOLS.length : 4;
      const s1 = SYMBOLS[Math.floor(Math.random() * upperLimit)];
      forcedResult = [s1, s1, s1];
    }

    if (adsWatchedWithoutWin >= 5) {
      const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      forcedResult = [s1, s1, s1];
    }

    if (nearMiss && Math.random() < 0.4) {
      ghostJackpot = true;
      setIsGhostJackpot(true);
    }

    let spins = 0;
    const stopTimes = [20, 40, 70];
    
    const spinInterval = setInterval(() => {
      spins++;
      
      setReels(prev => {
        const next = [...prev];
        if (spins <= stopTimes[0]) next[0] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        if (spins <= stopTimes[1]) next[1] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        if (spins <= stopTimes[2]) next[2] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        return next;
      });
      
      playSpin();

      if (spins === stopTimes[0]) {
        setSpinningReels(prev => [false, prev[1], prev[2]]);
        if (forcedResult) setReels(prev => [forcedResult![0], prev[1], prev[2]]);
      }
      if (spins === stopTimes[1]) {
        setSpinningReels(prev => [prev[0], false, prev[2]]);
        if (forcedResult) setReels(prev => [prev[0], forcedResult![1], prev[2]]);
      }
      if (spins === stopTimes[2]) {
        setSpinningReels(prev => [prev[0], prev[1], false]);
        if (forcedResult && !ghostJackpot) setReels(prev => [prev[0], prev[1], forcedResult![2]]);
        clearInterval(spinInterval);
        finalizeSpin(forcedResult, ghostJackpot);
      }
    }, 100);
  };

  const isOutOfChips = balance < bet;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-6xl mx-auto relative overflow-y-auto h-full"
    >
      {isOutOfChips && (
        <div className="absolute inset-0 bg-black/60 z-40 pointer-events-none transition-opacity duration-1000" />
      )}

      <div className={`w-full flex justify-between items-center mb-4 sm:mb-8 relative ${isOutOfChips ? 'z-30 opacity-20' : 'z-50'}`}>
        <button onMouseEnter={playHover} onClick={() => { playClick(); onExit(); }} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColor }} /> 
          <span className={`text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>Leave Machine</span>
        </button>
      </div>

      <div className={`bg-zinc-950/40 border-4 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative w-full overflow-hidden ${isOutOfChips ? 'z-50' : 'z-10'} flex flex-col lg:flex-row gap-8 items-center lg:items-stretch min-h-0`} style={{ borderColor: `${themeColor}4d` }}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse delay-700" />
        </div>

        <AnimatePresence>
          {winMsg && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-zinc-950/90 backdrop-blur-md rounded-3xl"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="relative"
              >
                <Sparkles className="absolute -top-12 -left-12 w-24 h-24 text-yellow-400 animate-spin-slow opacity-50 font-glow" />
                <h2 className="text-4xl sm:text-7xl font-black italic tracking-tighter uppercase text-center font-glow" style={{ color: themeColor }}>
                  {winMsg}
                </h2>
              </motion.div>
              <p className="text-2xl sm:text-5xl font-black text-white mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] font-mono">
                +${winAmount.toLocaleString()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col justify-around items-center py-4">
          <div className="text-center mb-4 sm:mb-8">
            <h1 className={`text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b ${themeGradient} tracking-tighter uppercase drop-shadow-xl font-glow`}>
              {title}
            </h1>
            <p className="text-[8px] sm:text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] mt-2 opacity-50">Experimental Probability Core</p>
          </div>

          <div className="flex gap-2 sm:gap-4 justify-center bg-zinc-950/80 p-3 sm:p-6 rounded-[2rem] border-y-4 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] relative w-full max-w-2xl" style={{ borderColor: `${themeColor}66` }}>
            {reels.map((symbol, i) => (
              <div key={i} className="flex-1 aspect-[3/4] max-w-[140px] bg-zinc-900/50 rounded-2xl border border-white/5 flex items-center justify-center text-4xl sm:text-8xl shadow-[inset_0_0_30px_rgba(0,0,0,1)] relative overflow-hidden">
                <motion.div
                  animate={spinningReels[i] ? { y: [ -100, 100 ] } : { y: 0 }}
                  transition={spinningReels[i] ? { repeat: Infinity, duration: 0.1, ease: "linear" } : { type: "spring", bounce: isGhostJackpot && i === 2 ? 0.8 : 0.5 }}
                  className={spinningReels[i] ? "blur-md opacity-50" : ""}
                  style={isNearMiss && (i === 2 || (reels[0] === reels[2] && i === 1)) ? { filter: 'brightness(1.5) contrast(1.2)' } : {}}
                >
                  {symbol}
                </motion.div>
                {isNearMiss && (i === 2 || (reels[0] === reels[2] && i === 1)) && spinningReels[i] && (
                  <div className="absolute inset-0 bg-yellow-400/5 animate-pulse border-2 border-yellow-400/20 rounded-2xl" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col justify-center gap-6 bg-black/40 p-6 sm:p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl shrink-0">
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex flex-col items-center">
              <span className="text-zinc-500 text-[10px] font-black mb-3 uppercase tracking-widest leading-none">Stake Amount</span>
              <div className="flex items-center gap-2 w-full justify-center">
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setBet(b => Math.max(config.minBet, b - 10)); }} 
                  disabled={isSpinning} 
                  className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white disabled:opacity-50 text-2xl font-bold transition-all shrink-0"
                >
                  −
                </button>
                <div className="relative flex items-center flex-1 max-w-[180px]">
                  <span className="absolute left-3 text-lg font-mono font-bold text-zinc-500">$</span>
                  <input 
                    type="number" 
                    value={bet || ''} 
                    onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                    disabled={isSpinning}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-8 pr-2 text-xl font-mono font-black text-white outline-none focus:border-white/30 transition-all text-center"
                  />
                </div>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setBet(b => b + 10); }} 
                  disabled={isSpinning} 
                  className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white disabled:opacity-50 text-2xl font-bold transition-all shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              {[100, 1000].map(val => (
                <button 
                  key={val}
                  onClick={() => { playClick(); setBet(val); }} 
                  disabled={isSpinning} 
                  className={`py-2.5 rounded-lg border text-[10px] font-black transition-all truncate ${bet === val ? 'bg-white text-zinc-950 border-white' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'}`}
                >
                  ${val >= 1000 ? (val/1000)+'k' : val}
                </button>
              ))}
              <button onClick={() => { playClick(); setBet(balance); }} disabled={isSpinning} className="py-2.5 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-500 text-[10px] font-black transition-colors uppercase">Max</button>
            </div>
          </div>

          <motion.button
            whileHover={!isSpinning && balance >= bet ? { scale: 1.02 } : {}}
            whileTap={!isSpinning && balance >= bet ? { scale: 0.98 } : {}}
            onMouseEnter={playHover}
            onClick={spin}
            disabled={isSpinning || balance < bet || bet <= 0}
            className={`w-full py-5 sm:py-7 rounded-[1.5rem] font-black text-2xl sm:text-3xl tracking-tighter uppercase shadow-2xl disabled:opacity-50 disabled:grayscale transition-all relative overflow-hidden border-2 ${isSpinning || balance < bet || bet <= 0 ? 'bg-zinc-800 text-zinc-600 border-white/5 cursor-not-allowed' : `bg-gradient-to-b ${themeGradient} text-zinc-950 border-transparent`}`}
            style={{ boxShadow: !isSpinning && balance >= bet && bet > 0 ? `0 0 40px ${themeColor}4d` : 'none' }}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
            {!isSpinning && balance >= bet && bet > 0 && (
              <motion.div 
                animate={{ x: ['-200%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            )}
          </motion.button>

          <div className="mt-2 flex items-center justify-between px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-6">
            <span>Bankroll</span>
            <span className="text-zinc-300 font-bold">${balance.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
