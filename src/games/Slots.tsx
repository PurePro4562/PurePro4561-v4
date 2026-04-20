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
      className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto relative"
    >
      {isOutOfChips && (
        <div className="absolute inset-0 bg-black/60 z-40 pointer-events-none transition-opacity duration-1000" />
      )}

      <div className={`w-full flex justify-between items-center mb-8 relative ${isOutOfChips ? 'z-30 opacity-20' : 'z-50'}`}>
        <button onMouseEnter={playHover} onClick={() => { playClick(); onExit(); }} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: themeColor }} /> 
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>Leave Machine</span>
        </button>
      </div>

      <div className={`bg-zinc-900 border-2 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative w-full max-w-2xl overflow-hidden ${isOutOfChips ? 'z-50' : 'z-10'}`} style={{ borderColor: `${themeColor}4d` }}>
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
              className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-zinc-950/80 backdrop-blur-sm rounded-3xl"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="relative"
              >
                <Sparkles className="absolute -top-12 -left-12 w-24 h-24 text-yellow-400 animate-spin-slow opacity-50" />
                <h2 className="text-6xl font-black drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] italic tracking-wider uppercase" style={{ color: themeColor }}>
                  {winMsg}
                </h2>
              </motion.div>
              <p className="text-4xl font-black text-white mt-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                +${winAmount.toLocaleString()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAdOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-6"
            >
              <div className="text-center w-full">
                <Coins className="w-20 h-20 text-amber-500 mx-auto mb-6 animate-bounce drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]" />
                <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md">OUT OF CHIPS</h3>
                <p className="text-zinc-400 mb-8 font-mono text-sm">Session value increasing... Watch an ad to recharge with a bonus multiplier!</p>
                
                <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                  <button
                    onClick={() => { setShowAdOverlay(false); onWatchAd(); }}
                    className={`w-full py-5 rounded-2xl bg-gradient-to-r ${themeGradient} text-zinc-950 font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(251,191,36,0.6)] hover:scale-105 transition-transform`}
                  >
                    <Video className="w-6 h-6" /> INSTANT RECHARGE
                  </button>
                  <button
                    onClick={() => setShowAdOverlay(false)}
                    className="text-zinc-600 hover:text-zinc-400 text-sm font-bold transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
                
                <div className="mt-8 p-4 bg-zinc-800/50 rounded-xl border border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]">
                  <p className="text-xs text-amber-500/80 font-mono uppercase tracking-widest font-bold">
                    Next Reward Multiplier: x{(Math.pow(1.2, adsWatchedToday)).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-8">
          <h1 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b ${themeGradient} tracking-widest uppercase drop-shadow-lg`}>
            {title}
          </h1>
        </div>

        <div className="flex gap-4 justify-center mb-10 bg-zinc-950 p-6 rounded-2xl border-y-4 shadow-inner relative" style={{ borderColor: `${themeColor}80` }}>
          {reels.map((symbol, i) => (
            <div key={i} className="w-24 h-32 sm:w-32 sm:h-32 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center text-4xl sm:text-7xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <motion.div
                animate={spinningReels[i] ? { y: [ -100, 100 ] } : { y: 0 }}
                transition={spinningReels[i] ? { repeat: Infinity, duration: 0.1, ease: "linear" } : { type: "spring", bounce: isGhostJackpot && i === 2 ? 0.8 : 0.5 }}
                className={spinningReels[i] ? "blur-md" : ""}
                style={isNearMiss && (i === 2 || (reels[0] === reels[2] && i === 1)) ? { filter: 'brightness(1.5) contrast(1.2)' } : {}}
              >
                {symbol}
              </motion.div>
              {isNearMiss && (i === 2 || (reels[0] === reels[2] && i === 1)) && spinningReels[i] && (
                <div className="absolute inset-0 bg-yellow-400/10 animate-pulse border-2 border-yellow-400/30 rounded-xl" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center bg-zinc-950/50 p-6 rounded-2xl border border-white/5 gap-6">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-zinc-500 text-xs font-mono mb-1">BET AMOUNT</span>
              <div className="flex items-center gap-2">
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setBet(b => Math.max(config.minBet, b - 10)); }} 
                  disabled={isSpinning} 
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 disabled:opacity-50 text-xl font-bold"
                >
                  -
                </button>
                <div className="relative flex items-center">
                  <span className={`absolute left-3 text-xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b ${themeGradient}`}>$</span>
                  <input 
                    type="number" 
                    value={bet || ''} 
                    onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                    disabled={isSpinning}
                    className="w-32 bg-zinc-900/50 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-xl font-mono font-bold text-white outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setBet(b => b + 10); }} 
                  disabled={isSpinning} 
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 disabled:opacity-50 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { playClick(); setBet(b => b + 100); }} disabled={isSpinning} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors">+100</button>
              <button onClick={() => { playClick(); setBet(b => b + 1000); }} disabled={isSpinning} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors">+1k</button>
              <button onClick={() => { playClick(); setBet(balance); }} disabled={isSpinning} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors">MAX</button>
            </div>
          </div>

          <motion.button
            whileHover={!isSpinning && balance >= bet ? { scale: 1.02, boxShadow: `0 0 30px ${themeColor}aa` } : {}}
            whileTap={!isSpinning && balance >= bet ? { scale: 0.98 } : {}}
            onMouseEnter={playHover}
            onClick={spin}
            disabled={isSpinning || balance < bet}
            className={`w-full py-5 rounded-xl bg-gradient-to-b ${themeGradient} text-white font-black text-2xl tracking-wider shadow-lg disabled:opacity-50 disabled:grayscale transition-all relative overflow-hidden`}
            style={{ boxShadow: !isSpinning && balance >= bet ? `0 0 20px ${themeColor}66` : 'none' }}
          >
            {!isSpinning && balance >= bet && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            )}
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
