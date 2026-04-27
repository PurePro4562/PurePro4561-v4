import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Wallet, History, TrendingUp, AlertTriangle, Flame } from 'lucide-react';

interface CrashProps {
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

const AsteroidIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16 2L20 6L22 13L17 21L9 22L3 18L1 11L5 3L11 1Z" />
  </svg>
);

const Crash: React.FC<CrashProps> = ({ balance, setBalance, onRecordBet, onExit, title, themeGradient, themeColor }) => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [history, setHistory] = useState<number[]>([]);
  const [lastWin, setLastWin] = useState<{multiplier: number, amount: number} | null>(null);

  const multiplierRef = useRef(1.0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate some static star positions
  const starsRef = useRef(Array.from({ length: 50 }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: 1 + Math.random() * 2,
    delay: Math.random() * 2,
    size: Math.random() > 0.5 ? 2 : 1
  })));

  const startRound = () => {
    if (balance < betAmount || isRunning) return;
    
    setCurrentBet(betAmount);
    setBalance(b => b - betAmount);
    setIsRunning(true);
    setIsCrashed(false);
    setLastWin(null);
    setMultiplier(1.0);
    multiplierRef.current = 1.0;
    
    const crashAt = Math.max(1, (1 / (Math.random() || 0.001)) * 0.96);

    timerRef.current = setInterval(() => {
      multiplierRef.current += 0.01 + (multiplierRef.current * 0.002);
      
      if (multiplierRef.current >= crashAt) {
        clearInterval(timerRef.current!);
        setMultiplier(crashAt);
        setIsCrashed(true);
        setIsRunning(false);
        setHistory(prev => [crashAt, ...prev].slice(0, 10));
        onRecordBet(betAmount, 0, 'Nebula Crash', 'chips'); 
      } else {
        setMultiplier(multiplierRef.current);
      }
    }, 70);
  };

  const cashOut = () => {
    if (!isRunning || isCrashed) return;
    
    clearInterval(timerRef.current!);
    const winnings = Math.floor(currentBet * multiplier);
    setIsRunning(false);
    setBalance(b => b + winnings);
    setLastWin({ multiplier, amount: winnings });
    onRecordBet(currentBet, winnings, 'Nebula Crash', 'chips');
    setHistory(prev => [multiplier, ...prev].slice(0, 10));
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto h-[calc(100vh-6rem)] sm:max-h-[85vh]">
      <style>{`
        @keyframes star-fall {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .star-anim {
          animation: star-fall linear infinite;
        }
      `}</style>
      <div className="flex flex-col h-full bg-zinc-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="p-4 sm:p-6 bg-zinc-900/50 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            disabled={isRunning}
            className="p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
            title="Return to Lobby"
          >
            <TrendingUp className="w-5 h-5 rotate-180 text-white" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
            <Rocket className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Nebula Crash</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">High Stakes Multiplier</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {history.map((h, i) => (
            <div key={i} className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${h < 2 ? 'text-zinc-600' : 'text-emerald-500'}`}>
              {h.toFixed(2)}x
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden min-h-[400px]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Speeding Stars */}
        {(isRunning || lastWin) && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {starsRef.current.map((star, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full opacity-40 star-anim"
                style={{
                  left: star.left,
                  top: '-10px',
                  width: `${star.size}px`,
                  height: `${star.size * 10}px`, // Make them look like lines due to speed
                  animationDuration: `${isRunning ? star.duration : star.duration * 3}s`,
                  animationDelay: `${star.delay}s`
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isRunning && !isCrashed && !lastWin ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center space-y-6 relative z-10"
            >
              <div className="text-5xl font-black text-white mb-2">READY?</div>
              <p className="text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed">
                The rocket explodes randomly. Cash out before it does to multiply your chips.
              </p>
              <button
                onClick={startRound}
                className="px-12 py-5 bg-gradient-to-r from-rose-500 to-crimson-600 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-[0_10px_40px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                Launch Rocket
              </button>
            </motion.div>
          ) : (
            <div className="text-center relative z-10 mt-[-100px]">
              <motion.div 
                key={isCrashed ? 'crashed' : lastWin ? 'win' : 'running'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-6xl sm:text-8xl font-black font-mono transition-colors duration-200 ${isCrashed ? 'text-rose-600' : 'text-emerald-400'}`}
              >
                {lastWin ? lastWin.multiplier.toFixed(2) : multiplier.toFixed(2)}x
              </motion.div>
              {isCrashed && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="mt-4 flex flex-col items-center gap-4 justify-center"
                >
                  <div className="flex items-center gap-2 text-rose-500 font-black uppercase tracking-[0.2em] mb-4">
                    <AlertTriangle className="w-5 h-5" /> Exploded!
                  </div>
                  <button
                    onClick={() => { setIsCrashed(false); setLastWin(null); }}
                    className="px-8 py-4 bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl hover:bg-zinc-700 transition-colors"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}
              {lastWin && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="mt-4 flex flex-col items-center gap-4 justify-center"
                >
                  <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest rounded-xl mb-4">
                    WON ${lastWin.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => { setIsCrashed(false); setLastWin(null); }}
                    className="px-8 py-4 bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl hover:bg-zinc-700 transition-colors"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Rocket Animation */}
        {(isRunning || lastWin || isCrashed) && (
          <div className="absolute inset-x-0 bottom-20 flex justify-center items-center pointer-events-none z-0">
            {isCrashed ? (
              <motion.div
                 initial={{ opacity: 1, scale: 1 }}
                 animate={{ opacity: 0, scale: 2 }}
                 transition={{ duration: 0.5 }}
                 className="relative"
              >
                 <Flame className="w-32 h-32 text-orange-500 animate-pulse" />
                 <Flame className="w-32 h-32 text-rose-500 absolute inset-0 animate-ping" />
              </motion.div>
            ) : (
              <motion.div 
                animate={{ 
                  y: [-10, 10, -10],
                  x: [-2, 2, -2]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`${lastWin ? 'text-emerald-500' : 'text-rose-500'}`}
              >
                <Rocket className="w-32 h-32 sm:w-48 sm:h-48 -rotate-45 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
              </motion.div>
            )}

            {/* Asteroid Hitting Animation */}
            {isCrashed && (
              <motion.div
                initial={{ x: 0, y: -300, rotate: 0 }}
                animate={{ x: 0, y: 0, rotate: 180 }}
                transition={{ duration: 0.15, ease: "easeIn" }}
                className="absolute text-zinc-600"
              >
                <AsteroidIcon className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl" />
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-8 bg-zinc-900 border-t border-white/5 z-20 relative">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between">
          <div className="space-y-1 w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active Bet</div>
            <div className="text-2xl font-black text-white flex items-center gap-2">
              <span className="text-amber-500">$</span>{isRunning ? currentBet.toLocaleString() : betAmount.toLocaleString()}
            </div>
          </div>

          <div className="flex-1 flex w-full sm:justify-end">
            {isRunning ? (
              <button
                onClick={cashOut}
                disabled={isCrashed}
                className="w-full sm:w-64 py-4 sm:py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm sm:text-lg shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                Cash Out ${(currentBet * multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button disabled={isRunning} onClick={() => setBetAmount(b => Math.max(10, b - 100))} className="flex-1 sm:flex-none px-4 py-4 bg-zinc-800 rounded-xl font-bold text-zinc-300">-</button>
                <button disabled={isRunning} onClick={() => setBetAmount(b => b + 100)} className="flex-1 sm:flex-none px-4 py-4 bg-zinc-800 rounded-xl font-bold text-zinc-300">+</button>
                <div className="w-full sm:w-auto text-center text-zinc-500 font-mono text-xs uppercase tracking-widest px-4 mt-2 sm:mt-0">
                  Adjust Bet
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Crash;

