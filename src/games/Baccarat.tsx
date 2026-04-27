import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Sparkles, Zap, Diamond } from 'lucide-react';
import { playCoin, playClick, playHover, playLose } from '../audio';

interface BaccaratProps {
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

type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  value: Value;
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const VALUES: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default function Baccarat({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: BaccaratProps) {
  const [betAmount, setBetAmount] = useState(100);
  const [betOn, setBetOn] = useState<'player' | 'banker' | 'tie' | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bankerHand, setBankerHand] = useState<Card[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const getCardValue = (value: Value) => {
    if (value === 'A') return 1;
    if (['10', 'J', 'Q', 'K'].includes(value)) return 0;
    return parseInt(value);
  };

  const calculateScore = (hand: Card[]) => {
    const sum = hand.reduce((acc, card) => acc + getCardValue(card.value), 0);
    return sum % 10;
  };

  const dealCard = () => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { suit, value };
  };

  const play = () => {
    if (isDealing || !betOn || balance < betAmount) return;
    
    setIsDealing(true);
    setResult(null);
    setBalance(prev => prev - betAmount);
    playClick();

    const pHand = [dealCard(), dealCard()];
    const bHand = [dealCard(), dealCard()];
    
    setPlayerHand(pHand);
    setBankerHand(bHand);

    setTimeout(() => {
      let pScore = calculateScore(pHand);
      let bScore = calculateScore(bHand);

      // Third card rules (simplified)
      if (pScore <= 5) {
        const thirdCard = dealCard();
        pHand.push(thirdCard);
        setPlayerHand([...pHand]);
        pScore = calculateScore(pHand);
      }

      if (bScore <= 5) {
        const thirdCard = dealCard();
        bHand.push(thirdCard);
        setBankerHand([...bHand]);
        bScore = calculateScore(bHand);
      }

      let winner: 'player' | 'banker' | 'tie';
      if (pScore > bScore) winner = 'player';
      else if (bScore > pScore) winner = 'banker';
      else winner = 'tie';

      setResult(winner.toUpperCase());
      setIsDealing(false);

      let winnings = 0;
      if (betOn === winner) {
        if (winner === 'tie') winnings = Math.floor(betAmount * 9 * globalMultiplier);
        else winnings = Math.floor(betAmount * 2 * globalMultiplier);
        
        setBalance(prev => prev + winnings);
        setLastWin(winnings);
        playCoin();
      } else {
        setLastWin(0);
        playLose();
      }

      onRecordBet(betAmount, winnings, title, 'chips');
      setTimeout(() => setLastWin(null), 3000);
    }, 2000);
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
            <Diamond className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 font-glow" />
            Baccarat Royale
          </motion.h2>
          <p className="text-zinc-500 font-mono text-[8px] sm:text-xs mt-1 uppercase tracking-widest leading-none">Elite VIP High-Stakes Table</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 w-full mb-6 max-w-4xl">
          {/* Player Hand */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Player</h3>
            <div className="flex gap-2 sm:gap-4 mb-4 h-24 sm:h-36 items-center">
              {playerHand.length === 0 ? (
                <div className="w-16 h-24 sm:w-24 sm:h-36 border-2 border-white/5 border-dashed rounded-xl flex items-center justify-center opacity-20">
                  <span className="text-xs">?</span>
                </div>
              ) : (
                playerHand.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -50, opacity: 0, rotate: -10 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    className="w-16 h-24 sm:w-24 sm:h-36 bg-white rounded-lg sm:rounded-xl shadow-xl flex flex-col items-center justify-center relative p-1"
                  >
                    <span className="absolute top-1 left-1.5 font-black text-zinc-950 text-[10px] sm:text-base leading-none">{card.value}</span>
                    <span className="text-xl sm:text-4xl">{card.suit === 'hearts' ? '❤️' : card.suit === 'diamonds' ? '💎' : card.suit === 'spades' ? '♠️' : '♣️'}</span>
                    <span className="absolute bottom-1 right-1.5 font-black text-zinc-950 rotate-180 text-[10px] sm:text-base leading-none">{card.value}</span>
                  </motion.div>
                ))
              )}
            </div>
            <div className="text-xl sm:text-3xl font-black text-white px-4 py-1 rounded-full bg-zinc-800/50">{calculateScore(playerHand)}</div>
          </div>

          {/* Banker Hand */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Banker</h3>
            <div className="flex gap-2 sm:gap-4 mb-4 h-24 sm:h-36 items-center">
              {bankerHand.length === 0 ? (
                <div className="w-16 h-24 sm:w-24 sm:h-36 border-2 border-white/5 border-dashed rounded-xl flex items-center justify-center opacity-20">
                  <span className="text-xs">?</span>
                </div>
              ) : (
                bankerHand.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 50, opacity: 0, rotate: 10 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    className="w-16 h-24 sm:w-24 sm:h-36 bg-white rounded-lg sm:rounded-xl shadow-xl flex flex-col items-center justify-center relative p-1"
                  >
                    <span className="absolute top-1 left-1.5 font-black text-zinc-950 text-[10px] sm:text-base leading-none">{card.value}</span>
                    <span className="text-xl sm:text-4xl">{card.suit === 'hearts' ? '❤️' : card.suit === 'diamonds' ? '💎' : card.suit === 'spades' ? '♠️' : '♣️'}</span>
                    <span className="absolute bottom-1 right-1.5 font-black text-zinc-950 rotate-180 text-[10px] sm:text-base leading-none">{card.value}</span>
                  </motion.div>
                ))
              )}
            </div>
            <div className="text-xl sm:text-3xl font-black text-white px-4 py-1 rounded-full bg-zinc-800/50">{calculateScore(bankerHand)}</div>
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 sm:p-8 w-full max-w-2xl shadow-2xl">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <button 
              onClick={() => setBetOn('player')}
              disabled={isDealing}
              className={`py-3 sm:py-6 rounded-2xl border-2 transition-all font-black text-sm sm:text-lg uppercase ${betOn === 'player' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
            >
              PLAYER
            </button>
            <button 
              onClick={() => setBetOn('tie')}
              disabled={isDealing}
              className={`py-3 sm:py-6 rounded-2xl border-2 transition-all font-black text-sm sm:text-lg uppercase ${betOn === 'tie' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
            >
              TIE (9x)
            </button>
            <button 
              onClick={() => setBetOn('banker')}
              disabled={isDealing}
              className={`py-3 sm:py-6 rounded-2xl border-2 transition-all font-black text-sm sm:text-lg uppercase ${betOn === 'banker' ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
            >
              BANKER
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 leading-none">Bet Amount</div>
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-xs font-mono font-bold text-zinc-400">$</span>
                  <input 
                    type="number" 
                    value={betAmount || ''} 
                    onChange={(e) => setBetAmount(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                    className="w-full sm:w-32 bg-zinc-950 border border-white/10 rounded-lg py-1.5 pl-6 pr-2 text-xl font-black text-white font-mono outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
              {[100, 500, 1000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => { playClick(); setBetAmount(amt); }}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border truncate ${betAmount === amt ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700'}`}
                >
                  ${amt >= 1000 ? (amt/1000) + 'k' : amt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={play}
            disabled={isDealing || !betOn || balance < betAmount}
            className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${
              isDealing || !betOn || balance < betAmount
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                : `bg-gradient-to-r ${themeGradient} text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`
            }`}
          >
            {isDealing ? 'DEALING...' : 'PLACE BET'}
            <Zap className="w-6 h-6" />
          </button>

          <div className="mt-4 flex flex-col gap-2 min-h-[40px] justify-center items-center">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={result + (lastWin || 0)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className={`text-xl font-black font-mono leading-none ${lastWin! > 0 ? 'text-emerald-400 font-glow' : 'text-zinc-500'}`}>
                    {result} WINS! {lastWin! > 0 ? `+${lastWin?.toLocaleString()}` : ''}
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
  );
}
