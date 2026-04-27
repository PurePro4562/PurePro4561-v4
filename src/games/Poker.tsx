import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Sparkles, Zap, Club, Spade, Heart, Diamond } from 'lucide-react';
import { playCoin, playClick, playHover, playLose } from '../audio';

interface PokerProps {
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
type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  value: Value;
  held: boolean;
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const VALUES: Value[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const STANDARD_PAYTABLE = [
  { name: 'Royal Flush', multiplier: 800 },
  { name: 'Straight Flush', multiplier: 50 },
  { name: 'Four of a Kind', multiplier: 25 },
  { name: 'Full House', multiplier: 9 },
  { name: 'Flush', multiplier: 6 },
  { name: 'Straight', multiplier: 4 },
  { name: 'Three of a Kind', multiplier: 3 },
  { name: 'Two Pair', multiplier: 2 },
  { name: 'Jacks or Better', multiplier: 1 },
];

const HIGH_STAKES_PAYTABLE = [
  { name: 'Royal Flush', multiplier: 2000 },
  { name: 'Straight Flush', multiplier: 100 },
  { name: 'Four of a Kind', multiplier: 40 },
  { name: 'Full House', multiplier: 12 },
  { name: 'Flush', multiplier: 8 },
  { name: 'Straight', multiplier: 5 },
  { name: 'Three of a Kind', multiplier: 4 },
  { name: 'Two Pair', multiplier: 2 },
  { name: 'Jacks or Better', multiplier: 1 },
];

const createDeck = () => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({ suit, value, held: false });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export default function Poker({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: PokerProps) {
  const isHighStakes = gameId === 'custom-204';
  const paytable = isHighStakes ? HIGH_STAKES_PAYTABLE : STANDARD_PAYTABLE;
  const minBet = isHighStakes ? 1000 : 100;

  const [bet, setBet] = useState(minBet);
  const [hand, setHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'bet' | 'deal' | 'result'>('bet');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winStreak, setWinStreak] = useState(0);

  const evaluateHand = (hand: Card[]) => {
    const values = hand.map(c => VALUES.indexOf(c.value) + 2).sort((a, b) => a - b);
    const suits = hand.map(c => c.suit);
    
    const isFlush = new Set(suits).size === 1;
    const isStraight = values.every((v, i) => i === 0 || v === values[i - 1] + 1) || 
                       (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14);

    const counts: { [key: number]: number } = {};
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    const countValues = Object.values(counts).sort((a, b) => b - a);

    if (isFlush && isStraight && values[0] === 10) return paytable[0];
    if (isFlush && isStraight) return paytable[1];
    if (countValues[0] === 4) return paytable[2];
    if (countValues[0] === 3 && countValues[1] === 2) return paytable[3];
    if (isFlush) return paytable[4];
    if (isStraight) return paytable[5];
    if (countValues[0] === 3) return paytable[6];
    if (countValues[0] === 2 && countValues[1] === 2) return paytable[7];
    
    const jacksOrBetter = Object.entries(counts).some(([val, count]) => parseInt(val) >= 11 && count === 2);
    if (jacksOrBetter) return paytable[8];

    return null;
  };

  const deal = () => {
    if (balance < bet) return;
    playClick();
    setBalance(prev => prev - bet);
    const deck = createDeck();
    setHand(deck.slice(0, 5));
    setGameState('deal');
    setResultMessage(null);
  };

  const draw = () => {
    playClick();
    const deck = createDeck().filter(c => !hand.some(hc => hc.suit === c.suit && hc.value === c.value));
    const newHand = hand.map(card => {
      if (card.held) return card;
      return deck.pop()!;
    });
    setHand(newHand);
    setGameState('result');

    const result = evaluateHand(newHand);
    if (result) {
      // High Stakes gets a streak bonus: 5% extra per streak (max 5)
      const streakBonus = isHighStakes ? (1 + (Math.min(winStreak, 5) * 0.05)) : 1;
      const winnings = Math.floor(bet * result.multiplier * globalMultiplier * streakBonus);
      setBalance(prev => prev + winnings);
      setLastWin(winnings);
      setResultMessage(result.name);
      setWinStreak(prev => prev + 1);
      playCoin();
      onRecordBet(bet, winnings, title, 'chips');
    } else {
      setLastWin(0);
      setResultMessage('No Hand');
      setWinStreak(0);
      playLose();
      onRecordBet(bet, 0, title, 'chips');
    }
    setTimeout(() => setLastWin(null), 3000);
  };

  const toggleHold = (index: number) => {
    if (gameState !== 'deal') return;
    playClick();
    setHand(prev => prev.map((c, i) => i === index ? { ...c, held: !c.held } : c));
  };

  const getSuitIcon = (suit: Suit) => {
    switch (suit) {
      case 'spades': return <Spade className="w-6 h-6 text-zinc-100" />;
      case 'hearts': return <Heart className="w-6 h-6 text-rose-500" />;
      case 'diamonds': return <Diamond className="w-6 h-6 text-rose-500" />;
      case 'clubs': return <Club className="w-6 h-6 text-zinc-100" />;
    }
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
            <Club className={`w-6 h-6 sm:w-8 sm:h-8 ${isHighStakes ? 'text-emerald-500 font-glow' : 'text-amber-500'}`} />
            {isHighStakes ? 'High Stakes Poker' : 'Cyber Poker'}
          </motion.h2>
          <p className="text-zinc-500 font-mono text-[8px] sm:text-xs mt-1 uppercase tracking-widest leading-none">
            {isHighStakes ? 'VIP Tournament Table' : 'Neural Network Card Engine'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8 w-full items-start">
          {/* Paytable - Visible on md+ */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 hidden md:block md:col-span-1 lg:col-span-1 h-full overflow-y-auto max-h-[500px] lg:max-h-none">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Paytable</h3>
            <div className="space-y-1">
              {paytable.map((p, i) => (
                <div key={i} className={`flex justify-between text-[10px] font-mono p-1.5 rounded-lg transition-colors ${resultMessage === p.name ? 'bg-amber-500 text-zinc-950 font-black' : 'text-zinc-400 hover:bg-white/5'}`}>
                  <span className="truncate mr-1">{p.name}</span>
                  <span className="shrink-0">{p.multiplier}x</span>
                </div>
              ))}
            </div>
          </div>

          {/* Game Area */}
          <div className="md:col-span-3 lg:col-span-4 flex flex-col gap-4 sm:gap-8">
            <div className="grid grid-cols-5 gap-2 sm:gap-4 justify-items-center">
              {hand.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="w-full aspect-[2/3] max-w-[120px] rounded-xl bg-zinc-900 border-2 border-white/5 flex items-center justify-center p-2">
                    <div className="w-full h-full rounded-lg bg-zinc-800/30 border border-white/5 flex items-center justify-center">
                      <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-zinc-700 opacity-20" />
                    </div>
                  </div>
                ))
              ) : (
                hand.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => toggleHold(i)}
                    className={`w-full aspect-[2/3] max-w-[120px] rounded-xl bg-zinc-900 border-2 transition-all cursor-pointer relative flex flex-col items-center justify-center shadow-2xl overflow-hidden p-2 ${card.held ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-white/10'}`}
                  >
                    {card.held && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 text-[8px] font-black px-2 py-0.5 rounded-full z-20">
                        HELD
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5 flex flex-col items-center leading-none">
                      <span className={`text-xs sm:text-lg font-black ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-rose-500' : 'text-zinc-100'}`}>{card.value}</span>
                    </div>
                    <div className="text-xl sm:text-4xl">{getSuitIcon(card.suit)}</div>
                    <div className="absolute bottom-1.5 right-1.5 rotate-180 flex flex-col items-center leading-none">
                      <span className={`text-xs sm:text-lg font-black ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-rose-500' : 'text-zinc-100'}`}>{card.value}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 sm:p-8 w-full shadow-2xl flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Bet</div>
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-xs font-mono font-bold text-zinc-400">$</span>
                      <input 
                        type="number" 
                        value={bet || ''} 
                        onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                        className="w-full sm:w-32 bg-zinc-950 border border-white/10 rounded-lg py-1.5 pl-6 pr-2 text-xl font-black text-white font-mono outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5 w-full">
                  {[100, 500, 1000, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => { playClick(); setBet(amt); }}
                      className={`py-2 rounded-lg text-[10px] font-bold transition-all truncate border ${bet === amt ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700'}`}
                    >
                      ${amt >= 1000 ? (amt/1000) + 'k' : amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-auto lg:min-w-[200px]">
                {gameState === 'bet' || gameState === 'result' ? (
                  <button
                    onClick={deal}
                    disabled={balance < bet}
                    className={`w-full py-4 sm:py-5 rounded-2xl font-black text-xl tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${
                      balance < bet 
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                        : `bg-gradient-to-r ${themeGradient} text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`
                    }`}
                  >
                    DEAL
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                ) : (
                  <button
                    onClick={draw}
                    className={`w-full py-4 sm:py-5 rounded-2xl font-black text-xl tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-zinc-950 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    DRAW
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>

              <div className="w-full lg:w-48 flex flex-col items-center lg:items-end">
                <AnimatePresence mode="wait">
                  {resultMessage && (
                    <motion.div
                      key={resultMessage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center lg:text-right"
                    >
                      <div className={`text-sm sm:text-lg font-black tracking-tighter uppercase leading-none ${lastWin! > 0 ? 'text-amber-500 font-glow' : 'text-zinc-500'}`}>
                        {resultMessage}
                      </div>
                      {lastWin! > 0 && <span className="block text-[10px] font-mono mt-1 text-zinc-400 tracking-tighter uppercase">Win: ${lastWin?.toLocaleString()}</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
                {!resultMessage && (
                  <div className="flex flex-col items-center lg:items-end">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Total Balance</span>
                    <span className="text-sm font-black text-white font-mono">${balance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
