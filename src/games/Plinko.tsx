import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Sparkles, Zap } from 'lucide-react';
import { playCoin, playClick, playHover, playLose } from '../audio';

interface PlinkoProps {
  gameId: string;
  title: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
  themeGradient: string;
  themeColor: string;
  onRecordBet: (amount: number, winnings: number, game: string, type: 'chips' | 'tokens') => void;
  globalMultiplier?: number;
}

const STANDARD_MULTIPLIERS = [10, 5, 2, 0.5, 0.5, 0.1, 0.05, 0.1, 0.5, 0.5, 2, 5, 10];
const CYBER_MULTIPLIERS = [10, 5, 2, 0.5, 0.5, 0.3, 0.1, 0.3, 0.5, 0.5, 2, 5, 10];

export default function Plinko({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: PlinkoProps) {
  const isCyber = gameId === 'custom-201';
  const ROWS = isCyber ? 16 : 12;
  const multipliers = isCyber ? CYBER_MULTIPLIERS : STANDARD_MULTIPLIERS;
  const minBet = isCyber ? 500 : 100;

  const [bet, setBet] = useState(minBet);
  const [isDropping, setIsDropping] = useState(false);
  const [balls, setBalls] = useState<{ id: number; path: number[]; active: boolean; resultIndex?: number }[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const dropBall = () => {
    if (balance < bet) return;
    
    playClick();
    setBalance(prev => prev - bet);
    setIsDropping(true);

    // Cyber Plinko drops 2 balls at once for 1.8x the bet cost? 
    // Actually, let's just make it drop balls faster or have a "Quantum Jump" logic.
    const createBall = (delay = 0) => {
      setTimeout(() => {
        const path = [];
        let currentPos = 0;
        const isFakeOut = Math.random() < 0.2;
        const fakeDirection = Math.random() > 0.5 ? 1 : -1;
        
        const rand = Math.random();
        let finalIndex;
        if (rand < 0.85) {
          finalIndex = 4 + Math.floor(Math.random() * 5);
        } else if (rand < 0.98) {
          finalIndex = Math.random() > 0.5 ? 3 : 9;
        } else {
          const highIndices = [0, 1, 11, 12];
          finalIndex = highIndices[Math.floor(Math.random() * highIndices.length)];
        }

        const targetPos = (finalIndex * 2) - multipliers.length + 1;

        for (let i = 0; i < ROWS; i++) {
          if (isFakeOut && i < ROWS * 0.5) {
            const move = Math.random() < 0.7 ? fakeDirection : -fakeDirection;
            currentPos += move;
          } else {
            if (currentPos < targetPos) currentPos++;
            else if (currentPos > targetPos) currentPos--;
            else currentPos += Math.random() > 0.5 ? 1 : -1;
          }
          path.push(currentPos);
        }

        const ballId = Date.now() + Math.random();
        const newBall = { id: ballId, path, active: true, resultIndex: finalIndex };
        setBalls(prev => [...prev, newBall]);

        setTimeout(() => {
          const mult = multipliers[finalIndex] * globalMultiplier;
          const winnings = Math.floor(bet * mult);
          
          setBalance(prev => prev + winnings);
          setLastWin(winnings);
          onRecordBet(bet, winnings, title, 'chips');
          
          if (winnings > bet) playCoin();
          else playLose();

          setBalls(prev => {
            const remaining = prev.filter(b => b.id !== ballId);
            if (remaining.length === 0) setIsDropping(false);
            return remaining;
          });
          setTimeout(() => setLastWin(null), 2000);
        }, 3000);
      }, delay);
    };

    createBall();
    if (isCyber && Math.random() < 0.3) {
       // Cyber Bonus: Double Ball!
       createBall(200);
    }
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

        <div className="relative bg-zinc-900/50 border border-white/5 rounded-3xl p-4 sm:p-12 mb-8 shadow-2xl overflow-hidden w-full aspect-[4/5] sm:aspect-square md:aspect-video flex flex-col justify-between">
          {/* Pegs */}
          <div className="flex-1 flex flex-col justify-around items-center py-4">
            {[...Array(ROWS)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 sm:gap-6 md:gap-8 justify-center">
                {[...Array(rowIndex + 3)].map((_, pegIndex) => (
                  <div key={pegIndex} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                ))}
              </div>
            ))}
          </div>

          {/* Multipliers */}
          <div className="flex justify-between mt-4 gap-0.5 sm:gap-1 px-1">
            {multipliers.map((m, i) => (
              <div 
                key={i} 
                className={`flex-1 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-center font-mono font-black text-[8px] sm:text-[10px] md:text-xs transition-all ${
                  m >= 20 ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 
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
                initial={{ top: '5%', left: '50%' }}
                animate={{ 
                  top: ['5%', ...ball.path.map((_, i) => `${8 + ((i + 1) / ROWS) * 78}%`)],
                  left: ['50%', ...ball.path.map(pos => `${50 + (pos / (ROWS + 2)) * 38}%`)]
                }}
                transition={{ duration: 3, ease: "linear" }}
                className="absolute w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_15px_white] z-20 -translate-x-1/2"
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
             <h3 className="text-2xl font-black text-white drop-shadow-lg">{title}</h3>
          </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Bet Amount</div>
                  <input 
                    type="number" 
                    value={bet || ''} 
                    onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                    className="w-full bg-transparent text-xl font-black text-white font-mono outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                {[100, 500, 1000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => { playClick(); setBet(amt); }}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-w-[60px] ${bet === amt ? 'bg-white text-zinc-950' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    {amt < 1000 ? amt : `${amt/1000}k`}
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
