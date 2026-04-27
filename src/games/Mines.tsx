import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bomb, Gem, Coins, AlertCircle, TrendingUp } from 'lucide-react';
import { playClick, playCoin, playLose } from '../audio';

interface MinesProps {
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

const Mines: React.FC<MinesProps> = ({ balance, setBalance, onRecordBet, onExit, title, themeGradient, themeColor }) => {
  const [grid, setGrid] = useState<('gem' | 'bomb' | null)[]>(new Array(25).fill(null));
  const [mineCount, setMineCount] = useState(3);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mines, setMines] = useState<number[]>([]);
  const [winnings, setWinnings] = useState(0);
  const [betAmount, setBetAmount] = useState(100);

  const calculateNextMultiplier = (count: number, mines: number) => {
    // Probability base multiplier with house edge
    let mult = 1.0;
    const total = 25;
    for (let i = 0; i < count; i++) {
       mult *= (total - i) / (total - mines - i);
    }
    return mult * 0.94; // 6% house edge
  };

  const startGame = () => {
    if (balance < betAmount || isPlaying) return;
    
    playClick();
    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!newMines.includes(pos)) newMines.push(pos);
    }
    
    setMines(newMines);
    setRevealed([]);
    setIsPlaying(true);
    setIsGameOver(false);
    setWinnings(0);
    setBalance(b => b - betAmount);
  };

  const revealTile = (idx: number) => {
    if (!isPlaying || revealed.includes(idx) || isGameOver) return;

    if (mines.includes(idx)) {
      playLose();
      setIsGameOver(true);
      setIsPlaying(false);
      onRecordBet(betAmount, 0, 'Nebula Mines', 'chips');
      return;
    }

    playCoin();
    const newRevealed = [...revealed, idx];
    setRevealed(newRevealed);
    
    const mult = calculateNextMultiplier(newRevealed.length, mineCount);
    setWinnings(Math.floor(betAmount * mult));
  };

  const cashOut = () => {
    if (!isPlaying || revealed.length === 0 || isGameOver) return;
    
    playClick();
    const finalWinnings = winnings;
    setIsPlaying(false);
    setIsGameOver(true);
    setBalance(b => b + finalWinnings);
    onRecordBet(betAmount, finalWinnings, 'Nebula Mines', 'chips');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto h-[calc(100vh-6rem)] sm:max-h-[85vh]">
      <div className="flex flex-col h-full bg-zinc-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="p-4 sm:p-6 bg-zinc-900/50 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            disabled={isPlaying}
            className="p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
            title="Return to Lobby"
          >
            <Coins className="w-5 h-5 rotate-180 text-white" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Gem className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Nebula Mines</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">Find Gems, Avoid Bombs</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Mine Density</div>
             <div className="flex gap-1 mt-1">
               {[1, 3, 5, 10].map(n => (
                 <button 
                  key={n}
                  disabled={isPlaying}
                  onClick={() => setMineCount(n)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${mineCount === n ? 'bg-amber-500 border-amber-400 text-black' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'}`}
                >
                   {n}
                 </button>
               ))}
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-5 gap-3 max-w-sm w-full">
          {new Array(25).fill(0).map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => revealTile(i)}
              className={`aspect-square rounded-xl border flex items-center justify-center transition-colors shadow-lg ${
                revealed.includes(i) 
                  ? 'bg-zinc-900 border-amber-500/30' 
                  : isGameOver && mines.includes(i)
                    ? 'bg-rose-500/20 border-rose-500'
                    : 'bg-zinc-800 border-white/5 hover:bg-zinc-700'
              }`}
            >
              <AnimatePresence mode="wait">
                {revealed.includes(i) ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Gem className="w-6 h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  </motion.div>
                ) : isGameOver && mines.includes(i) ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Bomb className="w-6 h-6 text-rose-500" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="p-8 bg-zinc-900 border-t border-white/5">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Currrent Loot</div>
            <div className="text-3xl font-black text-amber-500 flex items-center gap-2">
              <span className="text-zinc-600 font-mono text-xl">$</span>{winnings.toLocaleString()}
            </div>
            {revealed.length > 0 && isPlaying && (
              <div className="text-[10px] text-zinc-600 font-bold uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {(winnings / betAmount).toFixed(2)}x Multiplier
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {!isPlaying ? (
              <>
                <div className="flex items-center gap-2">
                  <button disabled={isPlaying} onClick={() => setBetAmount(b => Math.max(10, b - 100))} className="px-4 py-4 sm:py-5 bg-zinc-800 rounded-xl font-bold text-zinc-300">-</button>
                  <div className="text-xl font-black text-white w-20 text-center">${betAmount}</div>
                  <button disabled={isPlaying} onClick={() => setBetAmount(b => b + 100)} className="px-4 py-4 sm:py-5 bg-zinc-800 rounded-xl font-bold text-zinc-300">+</button>
                </div>
                <button
                  onClick={startGame}
                  className="w-full sm:w-auto px-12 py-4 sm:py-5 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-lg shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  Start Game
                </button>
              </>
            ) : (
              <button
                onClick={cashOut}
                disabled={revealed.length === 0}
                className="w-full sm:w-auto px-12 py-4 sm:py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-lg shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                Cash Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Mines;
