import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Circle, RotateCcw, TrendingUp, History } from 'lucide-react';
import { playClick, playCoin, playLose } from '../audio';

interface CoinFlipProps {
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

const CoinFlip: React.FC<CoinFlipProps> = ({ balance, setBalance, onRecordBet, onExit, title, themeGradient, themeColor }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [history, setHistory] = useState<('heads' | 'tails')[]>([]);
  const [betAmount, setBetAmount] = useState(100);

  const handleFlip = () => {
    if (balance < betAmount || isFlipping) return;
    
    playClick();
    setIsFlipping(true);
    setResult(null);
    setBalance(b => b - betAmount);

    // 4% house edge: Probability of winning is 48% instead of 50%
    const win = Math.random() < 0.48;
    const finalResult = win ? choice : (choice === 'heads' ? 'tails' : 'heads');

    setTimeout(() => {
      setIsFlipping(false);
      setResult(finalResult);
      if (win) {
        playCoin();
        const winnings = betAmount * 2;
        setBalance(b => b + winnings);
        onRecordBet(betAmount, winnings, 'Cosmic Flip', 'chips');
      } else {
        playLose();
        onRecordBet(betAmount, 0, 'Cosmic Flip', 'chips');
      }
      setHistory(prev => [finalResult, ...prev].slice(0, 8));
    }, 1500);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto h-[calc(100vh-6rem)] sm:max-h-[85vh]">
      <div className="flex flex-col h-full bg-zinc-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="p-4 sm:p-6 bg-zinc-900/50 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            disabled={isFlipping}
            className="p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
            title="Return to Lobby"
          >
            <TrendingUp className="w-5 h-5 rotate-180 text-white" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <RotateCcw className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Cosmic Flip</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">Double or Nothing</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
           {history.map((h, i) => (
             <div key={i} className={`w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black ${h === 'heads' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
               {h[0].toUpperCase()}
             </div>
           ))}
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 mb-12">
          {/* Shadow */}
          <div className="absolute inset-x-8 bottom-0 h-4 bg-black/40 blur-xl rounded-full" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipping ? 'flipping' : (result || 'idle')}
              initial={{ rotateY: 0, y: 0 }}
              animate={isFlipping ? {
                rotateY: [0, 180, 360, 540, 720, 900, 1080],
                y: [0, -150, -200, -150, 0],
              } : {
                rotateY: result === 'tails' ? 180 : 0,
                y: 0
              }}
              transition={isFlipping ? {
                duration: 1.5,
                ease: "easeInOut"
              } : { duration: 0.5 }}
              className="w-full h-full relative preserve-3d"
            >
              {/* Heads Side */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 rounded-full border-8 border-amber-600/50 flex flex-col items-center justify-center shadow-2xl backface-hidden">
                <span className="text-6xl font-black text-amber-950">H</span>
                <div className="absolute inset-4 border-2 border-amber-400/20 rounded-full" />
              </div>
              {/* Tails Side */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-black rounded-full border-8 border-zinc-900 flex flex-col items-center justify-center shadow-2xl backface-hidden rotate-y-180">
                <span className="text-6xl font-black text-zinc-500">T</span>
                <div className="absolute inset-4 border-2 border-white/5 rounded-full" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-4 p-2 bg-zinc-900 rounded-2xl border border-white/5 mb-8">
          <button
            onClick={() => setChoice('heads')}
            className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${choice === 'heads' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
          >
            Heads
          </button>
          <button
            onClick={() => setChoice('tails')}
            className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${choice === 'tails' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Tails
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-8 bg-zinc-900 border-t border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button disabled={isFlipping} onClick={() => setBetAmount(b => Math.max(10, b - 100))} className="w-full sm:w-auto px-4 py-3 sm:py-4 bg-zinc-800 rounded-xl font-bold text-zinc-300">-</button>
          <div className="flex-1 text-center font-bold text-xl text-white">Bet: ${betAmount.toLocaleString()}</div>
          <button disabled={isFlipping} onClick={() => setBetAmount(b => b + 100)} className="w-full sm:w-auto px-4 py-3 sm:py-4 bg-zinc-800 rounded-xl font-bold text-zinc-300">+</button>
        </div>
        <button
          onClick={handleFlip}
          disabled={isFlipping}
          className="w-full py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-black rounded-2xl font-black uppercase tracking-widest text-lg sm:text-xl shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          {isFlipping ? 'Flipping...' : `Flip for $${(betAmount * 2).toLocaleString()}`}
        </button>
      </div>
      
      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
    </div>
  );
};

export default CoinFlip;
