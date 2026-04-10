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

const ROWS = 12;
const MULTIPLIERS = [25, 10, 5, 2, 0.5, 0.2, 0.1, 0.2, 0.5, 2, 5, 10, 25];

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

    // Advanced Path Generation with "Fake-out" Logic
    const path = [];
    let currentPos = 0;
    const isFakeOut = Math.random() < 0.3; // 30% chance of a fake-out
    const fakeDirection = Math.random() > 0.5 ? 1 : -1;
    
    // Determine final result first to maintain house edge
    // Middle indices are 4-8 (0.5, 0.2, 0.1, 0.2, 0.5)
    const rand = Math.random();
    let finalIndex;
    if (rand < 0.7) {
      // 70% chance of landing in the middle (0.1x to 0.5x)
      finalIndex = 4 + Math.floor(Math.random() * 5);
    } else if (rand < 0.95) {
      // 25% chance of landing in the mid-range (2x)
      finalIndex = Math.random() > 0.5 ? 3 : 9;
    } else {
      // 5% chance of landing in the high-range (5x to 25x)
      const highIndices = [0, 1, 2, 10, 11, 12];
      finalIndex = highIndices[Math.floor(Math.random() * highIndices.length)];
    }

    // Target position based on index
    const targetPos = (finalIndex * 2) - ROWS;

    for (let i = 0; i < ROWS; i++) {
      if (isFakeOut && i < ROWS * 0.7) {
        // First 70% of the way, head towards the edge
        const move = Math.random() < 0.8 ? fakeDirection : -fakeDirection;
        currentPos += move;
      } else {
        // Head towards the actual target
        if (currentPos < targetPos) currentPos++;
        else if (currentPos > targetPos) currentPos--;
        else currentPos += Math.random() > 0.5 ? 1 : -1;
      }
      path.push(currentPos);
    }

    const ballId = Date.now() + Math.random();
    const newBall = {
      id: ballId,
      path,
      active: true,
      resultIndex: finalIndex
    };

    setBalls(prev => [...prev, newBall]);

    // Calculate win after animation
    setTimeout(() => {
      const multiplier = MULTIPLIERS[finalIndex] * globalMultiplier;
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
          <div className="flex flex-col gap-6 items-center">
            {[...Array(ROWS)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-8">
                {[...Array(rowIndex + 3)].map((_, pegIndex) => (
                  <div key={pegIndex} className="w-1.5 h-1.5 rounded-full bg-zinc-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
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

          <AnimatePresence>
            {balls.map(ball => (
              <motion.div
                key={ball.id}
                initial={{ top: '0%', left: '50%' }}
                animate={{ 
                  top: ['0%', ...ball.path.map((_, i) => `${((i + 1) / ROWS) * 90}%`)],
                  left: ['50%', ...ball.path.map(pos => `${50 + (pos / ROWS) * 45}%`)]
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
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Bet</div>
                <input 
                  type="number" 
                  value={bet || ''} 
                  onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                  className="w-28 bg-zinc-900/50 border border-white/10 rounded-lg py-1 px-2 text-xl font-black text-white font-mono outline-none focus:border-white/30 transition-colors"
                />
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
            DROP BALL
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
