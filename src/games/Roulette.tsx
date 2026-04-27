import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Sparkles, Zap, RotateCw } from 'lucide-react';
import { playCoin, playClick, playHover, playLose } from '../audio';

interface RouletteProps {
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

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export default function Roulette({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: RouletteProps) {
  const isVIP = gameId === 'custom-203';
  const minBet = isVIP ? 500 : 100;
  
  const [betAmount, setBetAmount] = useState(minBet);
  const [selectedBets, setSelectedBets] = useState<{ type: string; value: any; amount: number }[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const totalBet = selectedBets.reduce((sum, b) => sum + b.amount, 0);

  const placeBet = (type: string, value: any) => {
    if (isSpinning) return;
    if (balance < totalBet + betAmount) return;
    
    playClick();
    setSelectedBets(prev => {
      const existing = prev.find(b => b.type === type && b.value === value);
      if (existing) {
        return prev.map(b => b.type === type && b.value === value ? { ...b, amount: b.amount + betAmount } : b);
      }
      return [...prev, { type, value, amount: betAmount }];
    });
  };

  const clearBets = () => {
    if (isSpinning) return;
    playClick();
    setSelectedBets([]);
  };

  const spin = () => {
    if (isSpinning || selectedBets.length === 0) return;
    
    setIsSpinning(true);
    setResult(null);
    setBalance(prev => prev - totalBet);
    
    // VIP table has slightly better win streaks
    const winningNumber = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    const winningIndex = NUMBERS.indexOf(winningNumber);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const targetRotation = rotation + (extraSpins * 360) + (winningIndex * (360 / NUMBERS.length));
    
    setRotation(targetRotation);

    setTimeout(() => {
      setResult(winningNumber);
      setIsSpinning(false);
      
      let totalWinnings = 0;
      selectedBets.forEach(bet => {
        let won = false;
        let multiplier = 0;

        if (bet.type === 'number' && bet.value === winningNumber) {
          won = true;
          // VIP table pays out 50x on 0 instead of 35x
          multiplier = (isVIP && winningNumber === 0) ? 50 : 35;
        } else if (bet.type === 'color') {
          const isRed = RED_NUMBERS.includes(winningNumber);
          if ((bet.value === 'red' && isRed) || (bet.value === 'black' && !isRed && winningNumber !== 0)) {
            won = true;
            multiplier = 2;
          }
        } else if (bet.type === 'even-odd') {
          if (winningNumber !== 0) {
            const isEven = winningNumber % 2 === 0;
            if ((bet.value === 'even' && isEven) || (bet.value === 'odd' && !isEven)) {
              won = true;
              multiplier = 2;
            }
          }
        }

        if (won) {
          totalWinnings += bet.amount * multiplier * globalMultiplier;
        }
      });

      if (totalWinnings > 0) {
        setBalance(prev => prev + totalWinnings);
        setLastWin(totalWinnings);
        playCoin();
      } else {
        setLastWin(0);
        playLose();
      }
      
      onRecordBet(totalBet, totalWinnings, title, 'chips');
      setTimeout(() => setLastWin(null), 3000);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full h-full bg-zinc-950 relative overflow-hidden">
      <button 
        onClick={onExit}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-xs sm:text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Exit
      </button>

      <div className="relative z-10 flex flex-col items-center max-w-6xl w-full h-full justify-center">
        <div className="mb-4 sm:mb-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3 justify-center"
          >
            <RotateCw className={`w-6 h-6 sm:w-8 sm:h-8 ${isVIP ? 'text-purple-500' : 'text-rose-500'}`} />
            {isVIP ? 'VIP Roulette' : 'Quantum Roulette'}
          </motion.h2>
          <p className="text-zinc-500 font-mono text-[8px] sm:text-xs mt-1 uppercase tracking-widest">
            {isVIP ? 'High Stakes Elite Table' : 'Quantum Probability Engine'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-center w-full">
          {/* Roulette Wheel */}
          <div className="relative flex items-center justify-center">
            <motion.div 
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.45, 0.05, 0.55, 0.95] }}
              className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full border-4 sm:border-8 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden bg-zinc-900 shrink-0"
            >
              {NUMBERS.map((num, i) => (
                <div 
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom flex flex-col items-center pt-1"
                  style={{ transform: `translateX(-50%) rotate(${i * (360 / NUMBERS.length)}deg)` }}
                >
                  <div className={`w-4 h-6 sm:w-6 sm:h-8 flex items-center justify-center text-[7px] sm:text-[10px] font-bold text-white rounded-t-sm ${num === 0 ? 'bg-emerald-600' : RED_NUMBERS.includes(num) ? 'bg-rose-600' : 'bg-zinc-950'}`}>
                    {num}
                  </div>
                </div>
              ))}
              <div className="absolute inset-6 sm:inset-8 rounded-full bg-zinc-900 border-2 sm:border-4 border-zinc-800 flex items-center justify-center shadow-inner">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_15px_white]" />
              </div>
            </motion.div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-6 sm:w-4 sm:h-8 bg-amber-500 clip-path-triangle z-20" />
            
            <AnimatePresence>
              {result !== null && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                >
                  <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-4xl font-black text-white shadow-2xl border-2 sm:border-4 border-white/20 ${result === 0 ? 'bg-emerald-600 font-glow' : RED_NUMBERS.includes(result) ? 'bg-rose-600 font-glow' : 'bg-zinc-950'}`}>
                    {result}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Betting Table Area */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl flex flex-col gap-4 sm:gap-6">
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => placeBet('color', 'red')}
                className="py-3 sm:py-4 rounded-xl bg-rose-600/20 border border-rose-600/30 text-rose-500 font-bold hover:bg-rose-600/30 transition-all relative overflow-hidden text-[10px] sm:text-xs"
              >
                RED (2x)
                {selectedBets.find(b => b.type === 'color' && b.value === 'red') && (
                  <div className="absolute top-0.5 right-0.5 bg-amber-500 text-zinc-950 text-[8px] px-1 rounded-full font-black">
                    ${selectedBets.find(b => b.type === 'color' && b.value === 'red')?.amount}
                  </div>
                )}
              </button>
              <button 
                onClick={() => placeBet('color', 'black')}
                className="py-3 sm:py-4 rounded-xl bg-zinc-950 border border-white/10 text-white font-bold hover:bg-zinc-800 transition-all relative overflow-hidden text-[10px] sm:text-xs"
              >
                BLACK (2x)
                {selectedBets.find(b => b.type === 'color' && b.value === 'black') && (
                  <div className="absolute top-0.5 right-0.5 bg-amber-500 text-zinc-950 text-[8px] px-1 rounded-full font-black">
                    ${selectedBets.find(b => b.type === 'color' && b.value === 'black')?.amount}
                  </div>
                )}
              </button>
              <button 
                onClick={() => placeBet('number', 0)}
                className="py-3 sm:py-4 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-500 font-bold hover:bg-emerald-600/30 transition-all relative overflow-hidden text-[10px] sm:text-xs"
              >
                ZERO (35x)
                {selectedBets.find(b => b.type === 'number' && b.value === 0) && (
                  <div className="absolute top-0.5 right-0.5 bg-amber-500 text-zinc-950 text-[8px] px-1 rounded-full font-black">
                    ${selectedBets.find(b => b.type === 'number' && b.value === 0)?.amount}
                  </div>
                )}
              </button>
              <button 
                onClick={() => placeBet('even-odd', 'even')}
                className="py-3 sm:py-4 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400 font-bold hover:bg-zinc-700 transition-all relative overflow-hidden text-[10px] sm:text-xs"
              >
                EVEN (2x)
                {selectedBets.find(b => b.type === 'even-odd' && b.value === 'even') && (
                  <div className="absolute top-0.5 right-0.5 bg-amber-500 text-zinc-950 text-[8px] px-1 rounded-full font-black">
                    ${selectedBets.find(b => b.type === 'even-odd' && b.value === 'even')?.amount}
                  </div>
                )}
              </button>
              <button 
                onClick={() => placeBet('even-odd', 'odd')}
                className="py-3 sm:py-4 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400 font-bold hover:bg-zinc-700 transition-all relative overflow-hidden text-[10px] sm:text-xs"
              >
                ODD (2x)
                {selectedBets.find(b => b.type === 'even-odd' && b.value === 'odd') && (
                  <div className="absolute top-0.5 right-0.5 bg-amber-500 text-zinc-950 text-[8px] px-1 rounded-full font-black">
                    ${selectedBets.find(b => b.type === 'even-odd' && b.value === 'odd')?.amount}
                  </div>
                )}
              </button>
              <button 
                onClick={clearBets}
                className="py-3 sm:py-4 rounded-xl bg-zinc-950 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/10 transition-all text-[10px] sm:text-xs uppercase"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5 leading-none">Total Stake</div>
                  <div className="text-lg font-black text-white font-mono leading-none">${totalBet.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <input 
                  type="number" 
                  value={betAmount || ''} 
                  onChange={(e) => setBetAmount(Math.max(1, Math.min(balance, Number(e.target.value) || 0)))}
                  className="flex-1 sm:w-20 bg-zinc-950 border border-white/10 rounded-lg py-1.5 px-2 text-sm font-bold text-white font-mono outline-none focus:border-white/30 transition-colors"
                />
                <div className="flex gap-1">
                  {[100, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => { playClick(); setBetAmount(amt); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all truncate min-w-[50px] ${betAmount === amt ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      ${amt >= 1000 ? (amt/1000) + 'k' : amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={spin}
              disabled={isSpinning || selectedBets.length === 0 || balance < totalBet}
              className={`w-full py-5 rounded-2xl font-black text-lg tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${
                isSpinning || selectedBets.length === 0 || balance < totalBet
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : `bg-gradient-to-r ${themeGradient} text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`
              }`}
            >
              {isSpinning ? 'SPINNING...' : 'SPIN WHEEL'}
              <Zap className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
              {lastWin !== null && (
                <motion.div
                  key={lastWin}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-2 rounded-xl bg-black/30 border border-white/5"
                >
                  <div className={`text-xl font-black font-mono ${lastWin > 0 ? 'text-emerald-400 font-glow' : 'text-zinc-500'}`}>
                    {lastWin > 0 ? `+${lastWin.toLocaleString()} CHIPS` : 'NO WIN'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2 border-t border-white/5 pt-4">
                <span>Holdings</span>
                <span className="text-zinc-300 font-bold">${balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
