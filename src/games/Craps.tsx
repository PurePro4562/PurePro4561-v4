import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Sparkles, Zap, Dices } from 'lucide-react';
import { playCoin, playClick, playHover, playLose } from '../audio';

interface CrapsProps {
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

export default function Craps({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: CrapsProps) {
  const [bet, setBet] = useState(100);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [point, setPoint] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('Place your bet and roll!');

  const rollDice = () => {
    if (isRolling || balance < bet) return;
    
    setIsRolling(true);
    playClick();
    if (point === null) setBalance(prev => prev - bet);

    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const total = roll1 + roll2;

    setTimeout(() => {
      setDice([roll1, roll2]);
      setIsRolling(false);
      
      if (point === null) {
        // Come out roll
        if (total === 7 || total === 11) {
          const winnings = Math.floor(bet * 2 * globalMultiplier);
          setBalance(prev => prev + winnings);
          setLastWin(winnings);
          setMessage(`Natural! You won ${winnings} chips!`);
          playCoin();
          onRecordBet(bet, winnings, title, 'chips');
        } else if (total === 2 || total === 3 || total === 12) {
          setLastWin(0);
          setMessage(`Craps! You lost.`);
          playLose();
          onRecordBet(bet, 0, title, 'chips');
        } else {
          setPoint(total);
          setMessage(`Point is ${total}. Roll again to hit the point!`);
        }
      } else {
        // Point rolls
        if (total === point) {
          const winnings = Math.floor(bet * 2 * globalMultiplier);
          setBalance(prev => prev + winnings);
          setLastWin(winnings);
          setPoint(null);
          setMessage(`Hit the point! You won ${winnings} chips!`);
          playCoin();
          onRecordBet(bet, winnings, title, 'chips');
        } else if (total === 7) {
          setLastWin(0);
          setPoint(null);
          setMessage(`Seven out! You lost.`);
          playLose();
          onRecordBet(bet, 0, title, 'chips');
        } else {
          setMessage(`Rolled ${total}. Still looking for ${point}...`);
        }
      }
      setTimeout(() => setLastWin(null), 3000);
    }, 1000);
  };

  const Die = ({ value }: { value: number }) => (
    <motion.div 
      animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
      className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center relative"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-12 h-12">
        {value === 1 && <div className="col-start-2 row-start-2 w-3 h-3 bg-zinc-950 rounded-full" />}
        {value === 2 && (
          <>
            <div className="col-start-1 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
          </>
        )}
        {value === 3 && (
          <>
            <div className="col-start-1 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-2 row-start-2 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
          </>
        )}
        {value === 4 && (
          <>
            <div className="col-start-1 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-1 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
          </>
        )}
        {value === 5 && (
          <>
            <div className="col-start-1 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-2 row-start-2 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-1 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
          </>
        )}
        {value === 6 && (
          <>
            <div className="col-start-1 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-1 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-1 row-start-2 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-2 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-1 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
            <div className="col-start-3 row-start-3 w-3 h-3 bg-zinc-950 rounded-full" />
          </>
        )}
      </div>
    </motion.div>
  );

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
            <Dices className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 font-glow" />
            Crypto Craps
          </motion.h2>
          <p className="text-zinc-500 font-mono text-[8px] sm:text-xs mt-1 uppercase tracking-widest leading-none">Decentralized Dice Probability Engine</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center lg:items-center w-full max-w-5xl">
          {/* Game Board (Dice Area) */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl flex-1 w-full flex flex-col items-center justify-center">
            <div className="flex gap-4 sm:gap-8 mb-8 sm:mb-12">
              <Die value={dice[0]} />
              <Die value={dice[1]} />
            </div>

            <div className="text-center">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 leading-none">Game Status</div>
              <div className="text-base sm:text-2xl font-black text-white tracking-tight leading-tight min-h-[3rem] flex items-center justify-center">{message}</div>
              {point && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs sm:text-sm font-bold">
                  TARGET POINT: {point}
                </div>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-96 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-zinc-950 border border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 leading-none">Stake</div>
                  <div className="relative flex items-center">
                    <span className="absolute left-0 text-xs font-mono font-bold text-zinc-400">$</span>
                    <input 
                      type="number" 
                      value={bet || ''} 
                      onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                      className="w-full bg-transparent border-none py-0 pl-4 pr-0 text-xl font-black text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 w-full">
                {[100, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => { playClick(); setBet(amt); }}
                    className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${bet === amt ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700'}`}
                  >
                    ${amt >= 1000 ? (amt/1000) + 'k' : amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={rollDice}
              disabled={isRolling || balance < bet}
              className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${
                isRolling || balance < bet
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                  : `bg-gradient-to-r ${themeGradient} text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`
              }`}
            >
              {isRolling ? 'ROLLING...' : point ? 'ROLL POINT' : 'COME OUT'}
              <Zap className="w-6 h-6" />
            </button>

            <div className="mt-2 flex flex-col gap-2 min-h-[40px] justify-center items-center">
              <AnimatePresence mode="wait">
                {lastWin !== null && (
                  <motion.div
                    key={lastWin}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className={`text-xl font-black font-mono leading-none ${lastWin > 0 ? 'text-emerald-400 font-glow' : 'text-zinc-500'}`}>
                      {lastWin > 0 ? `+${lastWin.toLocaleString()} CHIPS` : 'LOSE'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center justify-between w-full px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2 border-t border-white/5 pt-4">
                <span>Holdings</span>
                <span className="text-zinc-300 font-bold">${balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
