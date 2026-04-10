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
}

export default function Slots({ balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, onWatchAd, adsWatchedToday, adsWatchedWithoutWin, resetPityTimer, globalMultiplier = 1 }: SlotsProps) {
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [winMsg, setWinMsg] = useState('');
  const [winAmount, setWinAmount] = useState(0);
  const [isNearMiss, setIsNearMiss] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [isGhostJackpot, setIsGhostJackpot] = useState(false);

  // Auto-clear win summary within 800ms for "Time-on-Device" optimization
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
    const rarity = getRarity(symbol);
    setWinMsg(rarity === 'COMMON' ? 'WIN!' : rarity === 'EPIC' ? 'EPIC WIN!' : rarity === 'LEGENDARY' ? 'LEGENDARY!' : 'GODLY JACKPOT!');
    playSlotsWin(rarity);
  }, []);

  const finalizeSpin = useCallback((forcedResult?: string[], ghostJackpot?: boolean) => {
    const finalReels = forcedResult || [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
    
    // Ghost Jackpot Logic: Show jackpot, then slip
    if (ghostJackpot) {
      setReels([finalReels[0], finalReels[1], finalReels[0]]); // Show full jackpot
      setTimeout(() => {
        setReels(finalReels); // Slip to the loss
        playLose(); // Play a harsh lose sound on the slip
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
        resetPityTimer(); // Reset pity timer on any win
      } else {
        if (!ghostJackpot) playLose();
      }
      onRecordBet(bet, win, 'Neon Slots', 'chips');
      setIsSpinning(false);
      setIsNearMiss(false);
      setIsGhostJackpot(false);
      setSpinningReels([false, false, false]);
    }, ghostJackpot ? 1600 : 1200); // Extra delay if ghost jackpot so they see the slip
  }, [bet, setBalance, triggerVictoryFeedback, onRecordBet, resetPityTimer]);

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

    // Mathematical Drain System (Dynamic RTP)
    const isHighBalance = balance > 5000;
    
    // Weighted RNG Pools
    const rand = Math.random();
    let forcedResult: string[] | undefined;
    let ghostJackpot = false;
    let nearMiss = false;

    // Pool 1: 70% Total Loss (or 80% if high balance)
    const lossThreshold = isHighBalance ? 0.80 : 0.70;
    // Pool 2: 20% False Win (pays back 50-80% of bet)
    const falseWinThreshold = lossThreshold + 0.20;
    // Pool 3: 10% Hype (2x or 3x) - reduced if high balance
    
    if (rand < lossThreshold) {
      // TOTAL LOSS
      const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const otherSymbols = SYMBOLS.filter(s => s !== s1);
      const s2 = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
      const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      
      // 50% chance of a "Near Miss" in the loss pool to keep them hooked
      if (Math.random() < 0.5) {
        forcedResult = [s1, s1, s2];
        nearMiss = true;
        setIsNearMiss(true);
      } else {
        forcedResult = [s1, s2, s3];
      }
    } else if (rand < falseWinThreshold) {
      // FALSE WIN (Disguised Loss)
      // In this game, 2 matching symbols pay 2x, which is a win.
      // To make it a "False Win" (50-80% return), we need to adjust the payout logic or just use a near miss that looks like a win.
      // Actually, let's just force a "Near Miss" that looks like a win but pays nothing, or a small win.
      const s1 = SYMBOLS[Math.floor(Math.random() * 3)]; // Use lower value symbols
      const otherSymbols = SYMBOLS.filter(s => s !== s1);
      const s2 = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
      
      // The "Sandwich" Near Miss
      forcedResult = [s1, s2, s1];
      nearMiss = true;
      setIsNearMiss(true);
    } else {
      // HYPE WIN (2x or 3x)
      const s1 = SYMBOLS[Math.floor(Math.random() * 4)]; // Avoid the top 2 symbols usually
      forcedResult = [s1, s1, s1];
    }

    // Pity Timer Override
    if (adsWatchedWithoutWin >= 5) {
      const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      forcedResult = [s1, s1, s1];
    }

    // Ghost Jackpot Logic (Visual Distraction)
    if (nearMiss && Math.random() < 0.3) {
      ghostJackpot = true;
      setIsGhostJackpot(true);
    }

    // Staggered Reel Stop Logic
    let spins = 0;
    const stopTimes = [20, 40, 70]; // Reel 1 stops at 2s, Reel 2 at 4s, Reel 3 at 7s
    
    const spinInterval = setInterval(() => {
      spins++;
      
      setReels(prev => {
        const next = [...prev];
        // Only update reels that haven't "stopped" yet
        if (spins <= stopTimes[0]) next[0] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        if (spins <= stopTimes[1]) next[1] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        if (spins <= stopTimes[2]) next[2] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        return next;
      });
      
      playSpin();

      // Apply forced results as reels stop
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
      {/* UI Dimming Effect when out of chips */}
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
        {/* Trance Palette: Particle Background Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse delay-700" />
        </div>

        {/* Win Overlay */}
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

        {/* Out of Credits Overlay */}
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
            Neon Slots
          </h1>
        </div>

        {/* Reels */}
        <div className="flex gap-4 justify-center mb-10 bg-zinc-950 p-6 rounded-2xl border-y-4 shadow-inner relative" style={{ borderColor: `${themeColor}80` }}>
          {reels.map((symbol, i) => (
            <div key={i} className="w-24 h-32 sm:w-32 sm:h-32 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center text-6xl sm:text-7xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <motion.div
                animate={spinningReels[i] ? { y: [ -100, 100 ] } : { y: 0 }}
                transition={spinningReels[i] ? { repeat: Infinity, duration: 0.1, ease: "linear" } : { type: "spring", bounce: isGhostJackpot && i === 2 ? 0.8 : 0.5 }}
                className={spinningReels[i] ? "blur-md" : ""}
                style={isNearMiss && (i === 2 || (reels[0] === reels[2] && i === 1)) ? { filter: 'brightness(1.5) contrast(1.2)' } : {}}
              >
                {symbol}
              </motion.div>
              {/* Visual Tension: Highlight for final reel during near-miss */}
              {isNearMiss && (i === 2 || (reels[0] === reels[2] && i === 1)) && spinningReels[i] && (
                <div className="absolute inset-0 bg-yellow-400/10 animate-pulse border-2 border-yellow-400/30 rounded-xl" />
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center bg-zinc-950/50 p-6 rounded-2xl border border-white/5 gap-6">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-zinc-500 text-xs font-mono mb-1">BET AMOUNT</span>
              <div className="flex items-center gap-2">
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setBet(b => Math.max(10, b - 10)); }} 
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
              <button 
                onMouseEnter={playHover}
                onClick={() => { playClick(); setBet(b => b + 100); }} 
                disabled={isSpinning}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors"
              >
                +100
              </button>
              <button 
                onMouseEnter={playHover}
                onClick={() => { playClick(); setBet(b => b + 1000); }} 
                disabled={isSpinning}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors"
              >
                +1k
              </button>
              <button 
                onMouseEnter={playHover}
                onClick={() => { playClick(); setBet(balance); }} 
                disabled={isSpinning}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors"
              >
                MAX
              </button>
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
            {/* Trance Palette: Glowing path to button */}
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
