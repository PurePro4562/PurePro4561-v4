import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, TrendingUp, AlertTriangle } from 'lucide-react';
import { playClick, playCoin, playLose } from '../audio';

interface DiceProps {
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

export default function Dice({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: DiceProps) {
  const [betAmount, setBetAmount] = useState(100);
  const [targetChance, setTargetChance] = useState(48.0); // % chance to win
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const calculateMultiplier = (chance: number) => {
    // Standard 4% house edge
    const houseEdge = 0.04;
    return (1 - houseEdge) * (100 / chance);
  };

  const handleRoll = () => {
    if (balance < betAmount || isRolling) return;
    
    playClick();
    setIsRolling(true);
    setBalance(b => b - betAmount);
    setLastRoll(null);
    setLastWin(null);

    const roll = Math.random() * 100;
    
    setTimeout(() => {
      setIsRolling(false);
      setLastRoll(roll);
      
      if (roll <= targetChance) {
        // Win
        playCoin();
        const multiplier = calculateMultiplier(targetChance) * globalMultiplier;
        const winnings = Math.floor(betAmount * multiplier);
        setBalance(b => b + winnings);
        setLastWin(winnings);
        onRecordBet(betAmount, winnings, title, 'chips');
      } else {
        // Lose
        playLose();
        setLastWin(0);
        onRecordBet(betAmount, 0, title, 'chips');
      }
    }, 500);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto h-[calc(100vh-6rem)] sm:max-h-[85vh]">
      <div className="flex flex-col h-full bg-zinc-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="p-4 sm:p-6 bg-zinc-900/50 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            disabled={isRolling}
            className="p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
            title="Return to Lobby"
          >
            <TrendingUp className="w-5 h-5 rotate-180 text-white" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Dices className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">{title}</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">Under target to win</p>
          </div>
        </div>
        <div className="flex bg-zinc-900 p-2 rounded-xl text-center">
            <div className="px-3 border-r border-white/10">
              <div className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Win Chance</div>
              <div className="text-xs text-white font-mono">{targetChance.toFixed(2)}%</div>
            </div>
            <div className="px-3">
              <div className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Multiplier</div>
              <div className="text-xs text-purple-400 font-mono">{(calculateMultiplier(targetChance) * globalMultiplier).toFixed(2)}x</div>
            </div>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {lastRoll !== null ? (
            <motion.div 
              key={lastRoll}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: lastRoll <= targetChance ? [-5, 5, 0] : 0 }}
              className={`text-8xl font-black font-mono tracking-tighter ${lastRoll <= targetChance ? 'text-emerald-400' : 'text-rose-500'}`}
            >
              {lastRoll.toFixed(2)}
            </motion.div>
          ) : (
            <motion.div
              key="rolling"
              animate={isRolling ? { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] } : {}}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="text-8xl font-black font-mono tracking-tighter text-zinc-700"
            >
              00.00
            </motion.div>
          )}
        </AnimatePresence>
        
        {lastWin !== null && lastWin > 0 && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest rounded-xl">
            WON ${lastWin.toLocaleString()}
          </motion.div>
        )}
      </div>

      <div className="p-8 bg-zinc-900 border-t border-white/5 space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Adjust Chance To Win</span>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Roll Under {targetChance.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="95" 
            step="0.01" 
            value={targetChance} 
            onChange={(e) => setTargetChance(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center bg-zinc-950 p-2 rounded-2xl border border-white/5">
            <div className="flex w-full sm:w-auto items-center gap-2">
              <button disabled={isRolling} onClick={() => setBetAmount(b => Math.max(10, b - 100))} className="flex-1 sm:flex-none px-4 py-4 sm:py-5 bg-zinc-800/80 rounded-xl font-bold text-zinc-400 hover:text-white">-</button>
              <div className="text-xl font-black text-white w-24 text-center">${betAmount.toLocaleString()}</div>
              <button disabled={isRolling} onClick={() => setBetAmount(b => b + 100)} className="flex-1 sm:flex-none px-4 py-4 sm:py-5 bg-zinc-800/80 rounded-xl font-bold text-zinc-400 hover:text-white">+</button>
            </div>
            
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full sm:w-64 py-4 sm:py-5 bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-[0_10px_40px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
        </div>
      </div>
    </div>
    </div>
  );
}
