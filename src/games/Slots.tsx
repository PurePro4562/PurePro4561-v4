import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins } from 'lucide-react';
import { playCoin, playWin, playLose, playSpin, playClick } from '../audio';

const SYMBOLS = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];
const MULTIPLIERS: Record<string, number> = { '🍒': 2, '🍋': 3, '🍇': 5, '🔔': 10, '💎': 25, '7️⃣': 50 };

interface SlotsProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
  themeGradient: string;
  themeColor: string;
  onRecordBet: (amount: number, winnings: number, game: string, type: 'chips' | 'tokens') => void;
}

export default function Slots({ balance, setBalance, onExit, themeGradient, themeColor, onRecordBet }: SlotsProps) {
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [winMsg, setWinMsg] = useState('');
  const [winAmount, setWinAmount] = useState(0);

  const spin = () => {
    if (balance < bet || isSpinning) return;
    setBalance(b => b - bet);
    setIsSpinning(true);
    setWinMsg('');
    setWinAmount(0);
    playCoin();

    let spins = 0;
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      playSpin();
      spins++;
      if (spins > 20) {
        clearInterval(spinInterval);
        finalizeSpin();
      }
    }, 100);
  };

  const finalizeSpin = () => {
    const r1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const r2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const r3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    setReels([r1, r2, r3]);

    let win = 0;
    if (r1 === r2 && r2 === r3) {
      win = bet * MULTIPLIERS[r1];
      setBalance(b => b + win);
      setWinMsg('JACKPOT!');
      setWinAmount(win);
      playWin();
      setTimeout(() => setWinMsg(''), 3000);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      win = bet * 2;
      setBalance(b => b + win);
      setWinMsg('WINNER!');
      setWinAmount(win);
      playCoin();
      setTimeout(playCoin, 200);
      setTimeout(() => setWinMsg(''), 2000);
    } else {
      playLose();
    }
    onRecordBet(bet, win, 'Neon Slots', 'chips');
    setIsSpinning(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto"
    >
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={() => { playClick(); onExit(); }} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: themeColor }} /> 
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>Leave Machine</span>
        </button>
      </div>

      <div className="bg-zinc-900 border-2 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative w-full max-w-2xl" style={{ borderColor: `${themeColor}4d` }}>
        {/* Win Overlay */}
        <AnimatePresence>
          {winMsg && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-zinc-950/80 backdrop-blur-sm rounded-3xl"
            >
              <motion.h2 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl font-black drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] italic tracking-wider"
                style={{ color: themeColor }}
              >
                {winMsg}
              </motion.h2>
              <p className="text-3xl font-bold text-white mt-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                +${winAmount.toLocaleString()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-8">
          <h1 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b ${themeGradient} tracking-widest uppercase drop-shadow-lg`}>
            Neon Slots
          </h1>
        </div>

        {/* Reels */}
        <div className="flex gap-4 justify-center mb-10 bg-zinc-950 p-6 rounded-2xl border-y-4 shadow-inner" style={{ borderColor: `${themeColor}80` }}>
          {reels.map((symbol, i) => (
            <div key={i} className="w-24 h-32 sm:w-32 sm:h-32 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center text-6xl sm:text-7xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <motion.div
                animate={isSpinning ? { y: [ -100, 100 ] } : { y: 0 }}
                transition={isSpinning ? { repeat: Infinity, duration: 0.1, ease: "linear" } : { type: "spring", bounce: 0.5 }}
                className={isSpinning ? "blur-sm" : ""}
              >
                {symbol}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center bg-zinc-950/50 p-6 rounded-2xl border border-white/5 gap-6">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-zinc-500 text-xs font-mono mb-1">BET AMOUNT</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { playClick(); setBet(b => Math.max(10, b - 10)); }} disabled={isSpinning} className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 disabled:opacity-50 text-xl font-bold">-</button>
                <span className={`text-2xl font-mono font-bold w-24 text-center text-transparent bg-clip-text bg-gradient-to-b ${themeGradient}`}>${bet.toLocaleString()}</span>
                <button onClick={() => { playClick(); setBet(b => b + 10); }} disabled={isSpinning} className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 disabled:opacity-50 text-xl font-bold">+</button>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { playClick(); setBet(b => b + 100); }} 
                disabled={isSpinning}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors"
              >
                +100
              </button>
              <button 
                onClick={() => { playClick(); setBet(b => b + 1000); }} 
                disabled={isSpinning}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors"
              >
                +1k
              </button>
              <button 
                onClick={() => { playClick(); setBet(balance); }} 
                disabled={isSpinning}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          <motion.button
            whileHover={!isSpinning && balance >= bet ? { scale: 1.02 } : {}}
            whileTap={!isSpinning && balance >= bet ? { scale: 0.98 } : {}}
            onClick={spin}
            disabled={isSpinning || balance < bet}
            className={`w-full py-5 rounded-xl bg-gradient-to-b ${themeGradient} text-white font-black text-2xl tracking-wider shadow-lg disabled:opacity-50 disabled:grayscale transition-all`}
            style={{ boxShadow: !isSpinning && balance >= bet ? `0 0 20px ${themeColor}66` : 'none' }}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
