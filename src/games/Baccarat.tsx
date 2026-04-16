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
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full bg-zinc-950 relative overflow-hidden">
      <button 
        onClick={onExit}
        className="absolute top-6 left-6 z-50 px-4 py-2 bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 hover:bg-zinc-800 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Exit to Lobby
      </button>

      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full">
        <div className="mb-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3"
          >
            <Diamond className="w-8 h-8 text-rose-500" />
            Baccarat Royale
          </motion.h2>
          <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">Elite VIP High-Stakes Table</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-12">
          {/* Player Hand */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Player</h3>
            <div className="flex gap-4 mb-6 h-48 items-center">
              {playerHand.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -100, opacity: 0, rotate: -10 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  className="w-24 h-36 bg-white rounded-xl shadow-xl flex flex-col items-center justify-center relative"
                >
                  <span className="absolute top-2 left-2 font-black text-zinc-950">{card.value}</span>
                  <span className="text-3xl">{card.suit === 'hearts' ? '❤️' : card.suit === 'diamonds' ? '💎' : card.suit === 'spades' ? '♠️' : '♣️'}</span>
                </motion.div>
              ))}
            </div>
            <div className="text-3xl font-black text-white">{calculateScore(playerHand)}</div>
          </div>

          {/* Banker Hand */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Banker</h3>
            <div className="flex gap-4 mb-6 h-48 items-center">
              {bankerHand.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 100, opacity: 0, rotate: 10 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  className="w-24 h-36 bg-white rounded-xl shadow-xl flex flex-col items-center justify-center relative"
                >
                  <span className="absolute top-2 left-2 font-black text-zinc-950">{card.value}</span>
                  <span className="text-3xl">{card.suit === 'hearts' ? '❤️' : card.suit === 'diamonds' ? '💎' : card.suit === 'spades' ? '♠️' : '♣️'}</span>
                </motion.div>
              ))}
            </div>
            <div className="text-3xl font-black text-white">{calculateScore(bankerHand)}</div>
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => setBetOn('player')}
              className={`py-6 rounded-2xl border-2 transition-all font-black text-lg ${betOn === 'player' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
            >
              PLAYER
            </button>
            <button 
              onClick={() => setBetOn('tie')}
              className={`py-6 rounded-2xl border-2 transition-all font-black text-lg ${betOn === 'tie' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
            >
              TIE (9x)
            </button>
            <button 
              onClick={() => setBetOn('banker')}
              className={`py-6 rounded-2xl border-2 transition-all font-black text-lg ${betOn === 'banker' ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'}`}
            >
              BANKER
            </button>
          </div>

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
                    value={betAmount || ''} 
                    onChange={(e) => setBetAmount(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                    className="w-24 bg-zinc-900/50 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-xl font-black text-white font-mono outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => { playClick(); setBetAmount(amt); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${betAmount === amt ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
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
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : `bg-gradient-to-r ${themeGradient} text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`
            }`}
          >
            {isDealing ? 'DEALING...' : 'PLACE BET'}
            <Zap className="w-6 h-6" />
          </button>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center"
              >
                <div className={`text-2xl font-black font-mono ${lastWin! > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {result} WINS! {lastWin! > 0 ? `+${lastWin?.toLocaleString()} CHIPS` : ''}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
