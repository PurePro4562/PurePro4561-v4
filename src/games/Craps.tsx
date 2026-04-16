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
            <Dices className="w-8 h-8 text-amber-500" />
            Crypto Craps
          </motion.h2>
          <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">Decentralized Dice Probability Engine</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-[3rem] p-12 mb-8 shadow-2xl w-full flex flex-col items-center">
          <div className="flex gap-8 mb-12">
            <Die value={dice[0]} />
            <Die value={dice[1]} />
          </div>

          <div className="text-center mb-8">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Game Status</div>
            <div className="text-2xl font-black text-white tracking-tight">{message}</div>
            {point && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-sm">
                TARGET POINT: {point}
              </div>
            )}
          </div>

          <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Bet</div>
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-sm font-mono font-bold text-zinc-400">$</span>
                    <input 
                      type="number" 
                      value={bet || ''} 
                      onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                      className="w-24 bg-zinc-900/50 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-xl font-black text-white font-mono outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
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
              onClick={rollDice}
              disabled={isRolling || balance < bet}
              className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${
                isRolling || balance < bet
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : `bg-gradient-to-r ${themeGradient} text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`
              }`}
            >
              {isRolling ? 'ROLLING...' : point ? 'ROLL FOR POINT' : 'COME OUT ROLL'}
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
                  <div className={`text-2xl font-black font-mono ${lastWin > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {lastWin > 0 ? `+${lastWin.toLocaleString()} CHIPS` : 'NO WIN'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
