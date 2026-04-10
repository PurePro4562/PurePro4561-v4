import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Sparkles, Zap } from 'lucide-react';
import { playCoin, playClick, playHover, playLose } from '../audio';

interface PlinkoProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
  themeGradient: string;
  themeColor: string;
  onRecordBet: (amount: number, winnings: number, game: string, type: 'chips' | 'tokens') => void;
  globalMultiplier?: number;
}

const ROWS = 8;
const MULTIPLIERS = [5, 2, 1.5, 0.5, 0.2, 0.5, 1.5, 2, 5];

export default function Plinko({ balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: PlinkoProps) {
  const [bet, setBet] = useState(100);
  const [isDropping, setIsDropping] = useState(false);
  const [balls, setBalls] = useState<{ id: number; path: number[]; active: boolean; resultIndex?: number }[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const dropBall = () => {
    if (balance < bet) return;
    
    playClick();
    setBalance(prev => prev - bet);
    setIsDropping(true);

    // Generate path
    const path = [];
    let currentPos = 0;
    for (let i = 0; i < ROWS; i++) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      currentPos += direction;
      path.push(currentPos);
    }

    // Map final position to multiplier index
    const finalIndex = Math.floor((currentPos + ROWS) / (ROWS * 2) * (MULTIPLIERS.length - 1));
    const clampedIndex = Math.max(0, Math.min(MULTIPLIERS.length - 1, finalIndex));

    const ballId = Date.now() + Math.random();
    const newBall = {
      id: ballId,
      path,
      active: true,
      resultIndex: clampedIndex
    };

    setBalls(prev => [...prev, newBall]);

    // Calculate win after animation
    setTimeout(() => {
      const multiplier = MULTIPLIERS[clampedIndex] * globalMultiplier;
      const winnings = Math.floor(bet * multiplier);
      
      setBalance(prev => prev + winnings);
      setLastWin(winnings);
      onRecordBet(bet, winnings, 'Cyber Plinko', 'chips');
      
      if (winnings > bet) {
        playCoin();
      } else {
        playLose();
      }

      setBalls(prev => {
        const remaining = prev.filter(b => b.id !== ballId);
        if (remaining.length === 0) setIsDropping(false);
        return remaining;
      });
      setTimeout(() => setLastWin(null), 2000);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full bg-zinc-950 relative overflow-hidden">
      <button 
        onClick={onExit}
        className="absolute top-6 left-6 z-50 px-4 py-2 bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 hover:bg-zinc-800 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Exit to Lobby
      </button>

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full">
        <div className="mb-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3"
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Cyber Plinko
          </motion.h2>
          <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">Premium High-Stakes Physics Engine</p>
        </div>

        <div className="relative bg-zinc-900/50 border border-white/5 rounded-[3rem] p-12 mb-8 shadow-2xl overflow-hidden">
          {/* Pegs */}
          <div className="flex flex-col gap-8 items-center">
            {[...Array(ROWS)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-12">
                {[...Array(rowIndex + 3)].map((_, pegIndex) => (
                  <div key={pegIndex} className="w-2 h-2 rounded-full bg-zinc-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                ))}
              </div>
            ))}
          </div>

          {/* Multipliers */}
          <div className="flex justify-between mt-12 gap-2">
            {MULTIPLIERS.map((m, i) => (
              <div 
                key={i} 
                className={`flex-1 py-3 rounded-xl border text-center font-mono font-bold text-xs transition-all ${
                  m >= 2 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 
                  m >= 1 ? 'bg-zinc-800 border-white/10 text-zinc-400' : 
                  'bg-zinc-900/50 border-white/5 text-zinc-600'
                }`}
              >
                {m}x
              </div>
            ))}
          </div>

          {/* Active Balls */}
          <AnimatePresence>
            {balls.map(ball => (
              <motion.div
                key={ball.id}
                initial={{ top: '0%', left: '50%' }}
                animate={{ 
                  top: ['0%', '10%', '30%', '50%', '70%', '90%'],
                  left: ['50%', '48%', '52%', '45%', '55%', `${10 + ball.resultIndex! * 10}%`]
                }}
                transition={{ duration: 2, ease: "linear" }}
                className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_15px_white] z-20"
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Current Bet</div>
                <div className="text-xl font-black text-white font-mono">{bet.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => { playClick(); setBet(amt); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${bet === amt ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={dropBall}
            disabled={balance < bet}
            className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${
              balance < bet 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : `bg-gradient-to-r ${themeGradient} text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`
            }`}
          >
            {isDropping ? 'DROPPING...' : 'DROP BALL'}
            <Zap className="w-6 h-6" />
          </button>

          <AnimatePresence>
            {lastWin !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center"
              >
                <div className={`text-2xl font-black font-mono ${lastWin >= bet ? 'text-amber-500' : 'text-zinc-500'}`}>
                  {lastWin >= bet ? '+' : ''}{lastWin.toLocaleString()} CHIPS
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
