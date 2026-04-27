import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Settings } from 'lucide-react';
import { playCoin, playSlotsWin, playLose, playCard, playChip, playClick, playHover, playBlackjackAction } from '../audio';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

interface Card { suit: string; value: string; hidden?: boolean; }

interface BlackjackProps {
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

const getCardValue = (card: Card) => {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
};

const calculateScore = (hand: Card[]) => {
  let score = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.hidden) continue;
    score += getCardValue(card);
    if (card.value === 'A') aces += 1;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

const CARD_BACKS = [
  { id: 'classic', name: 'Classic Red', color: 'bg-red-600', pattern: 'radial-gradient(circle, #ffffff33 1px, transparent 1px)' },
  { id: 'cyber', name: 'Cyber Blue', color: 'bg-cyan-600', pattern: 'linear-gradient(45deg, #000000 25%, transparent 25%, transparent 75%, #000000 75%, #000000), linear-gradient(45deg, #000000 25%, transparent 25%, transparent 75%, #000000 75%, #000000)' },
  { id: 'gold', name: 'Royal Gold', color: 'bg-amber-500', pattern: 'repeating-conic-gradient(#00000011 0% 25%, transparent 0% 50%) 50% / 20px 20px' },
  { id: 'void', name: 'Void Black', color: 'bg-zinc-950', pattern: 'repeating-linear-gradient(45deg, #ffffff05, #ffffff05 10px, transparent 10px, transparent 20px)' },
];

export default function Blackjack({ gameId, title, balance, setBalance, onExit, themeGradient, themeColor, onRecordBet, globalMultiplier = 1 }: BlackjackProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState('');
  const [cardBack, setCardBack] = useState(CARD_BACKS[0]);
  const [showSettings, setShowSettings] = useState(false);

  const createDeck = () => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        newDeck.push({ suit, value });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const dealCard = (currentDeck: Card[], hand: Card[], hidden = false) => {
    const card = { ...currentDeck.pop()!, hidden };
    playCard();
    return { card, newDeck: currentDeck };
  };

  const startGame = () => {
    if (balance < bet) return;
    setBalance(b => b - bet);
    playChip();
    setMessage('');
    
    let currentDeck = createDeck();
    const pHand: Card[] = [];
    const dHand: Card[] = [];

    setTimeout(() => {
      let res = dealCard(currentDeck, pHand);
      pHand.push(res.card); currentDeck = res.newDeck; setPlayerHand([...pHand]);
      
      setTimeout(() => {
        res = dealCard(currentDeck, dHand);
        dHand.push(res.card); currentDeck = res.newDeck; setDealerHand([...dHand]);
        
        setTimeout(() => {
          res = dealCard(currentDeck, pHand);
          pHand.push(res.card); currentDeck = res.newDeck; setPlayerHand([...pHand]);
          
          setTimeout(() => {
            res = dealCard(currentDeck, dHand, true);
            dHand.push(res.card); currentDeck = res.newDeck; setDealerHand([...dHand]);
            setDeck(currentDeck);
            
            const pScore = calculateScore(pHand);
            if (pScore === 21) {
              endGame(pHand, dHand, 'Blackjack! You win!');
            } else {
              setGameState('playing');
            }
          }, 300);
        }, 300);
      }, 300);
    }, 300);
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    playBlackjackAction('hit');
    const { card, newDeck } = dealCard([...deck], playerHand);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (calculateScore(newHand) > 21) {
      endGame(newHand, dealerHand, 'Bust! You lose.');
    }
  };

  const stand = () => {
    if (gameState !== 'playing') return;
    playBlackjackAction('stand');
    setGameState('dealerTurn');
    
    const newDHand = [...dealerHand];
    newDHand[1].hidden = false;
    setDealerHand(newDHand);
    playCard();

    playDealerTurn(newDHand, [...deck]);
  };

  const playDealerTurn = (dHand: Card[], currentDeck: Card[]) => {
    let score = calculateScore(dHand);
    
    const drawInterval = setInterval(() => {
      if (score < 17) {
        const { card, newDeck } = dealCard(currentDeck, dHand);
        dHand.push(card);
        currentDeck = newDeck;
        setDealerHand([...dHand]);
        setDeck(currentDeck);
        score = calculateScore(dHand);
      } else {
        clearInterval(drawInterval);
        const pScore = calculateScore(playerHand);
        if (score > 21) {
          endGame(playerHand, dHand, 'Dealer busts! You win!');
        } else if (score > pScore) {
          endGame(playerHand, dHand, 'Dealer wins.');
        } else if (score < pScore) {
          endGame(playerHand, dHand, 'You win!');
        } else {
          endGame(playerHand, dHand, 'Push (Tie).');
        }
      }
    }, 800);
  };

  const endGame = (pHand: Card[], dHand: Card[], msg: string) => {
    setGameState('gameOver');
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
    
    if (dHand[1] && dHand[1].hidden) {
      dHand[1].hidden = false;
      setDealerHand([...dHand]);
    }

    let winnings = 0;
    if (msg.includes('win')) {
      const isBlackjack = msg.includes('Blackjack');
      const multiplier = isBlackjack ? 2.5 : 2;
      winnings = bet * multiplier * globalMultiplier;
      setBalance(b => b + winnings);
      playBlackjackAction(isBlackjack ? 'blackjack' : 'win');
    } else if (msg.includes('Push')) {
      winnings = bet;
      setBalance(b => b + winnings);
      playBlackjackAction('push');
    } else {
      playBlackjackAction('lose');
    }
    onRecordBet(bet, winnings, title, 'chips');
  };

  const renderCard = (card: Card, index: number) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <motion.div
        initial={{ opacity: 0, x: 50, y: -50, rotate: 10 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        key={index}
        className={`w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-white flex flex-col justify-between p-2 sm:p-3 shadow-xl border-2 ${card.hidden ? 'bg-zinc-800' : ''} ${index > 0 ? '-ml-10 sm:-ml-12' : ''}`}
        style={{ zIndex: index, borderColor: `${themeColor}4d` }}
      >
        {!card.hidden && (
          <>
            <div className={`text-lg sm:text-xl font-bold ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{card.value}</div>
            <div className={`text-3xl sm:text-4xl self-center ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{card.suit}</div>
            <div className={`text-lg sm:text-xl font-bold self-end rotate-180 ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{card.value}</div>
          </>
        )}
        {card.hidden && (
          <div className={`w-full h-full border-2 border-white/20 rounded-lg flex items-center justify-center ${cardBack.color} relative overflow-hidden`} style={{ backgroundImage: cardBack.pattern, backgroundSize: cardBack.id === 'cyber' ? '10px 10px' : 'auto' }}>
            <div className="w-10 h-10 rounded-full border-4 border-white/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/20" />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-6xl mx-auto relative h-full"
    >
      <div className="w-full flex justify-between items-center mb-4 sm:mb-6">
        <button onMouseEnter={playHover} onClick={() => { playClick(); onExit(); }} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColor }} /> 
          <span className={`text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>Leave Table</span>
        </button>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 sm:top-20 right-3 sm:right-6 z-[100] bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-64"
          >
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Card Back Design</h3>
            <div className="grid grid-cols-2 gap-2">
              {CARD_BACKS.map(back => (
                <button
                  key={back.id}
                  onClick={() => { playClick(); setCardBack(back); }}
                  className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${cardBack.id === back.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-zinc-900/50 hover:border-white/20'}`}
                >
                  <div className={`w-full h-12 rounded-lg ${back.color}`} style={{ backgroundImage: back.pattern, backgroundSize: back.id === 'cyber' ? '5px 5px' : 'auto' }} />
                  <span className="text-[10px] font-bold text-zinc-400">{back.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-zinc-950/40 border-4 rounded-[2rem] sm:rounded-[3.5rem] p-4 sm:p-8 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] relative w-full flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12 min-h-0 overflow-hidden" style={{ borderColor: `${themeColor}33` }}>
        
        <div className="flex-1 flex flex-col justify-around items-center relative py-2 sm:py-6">
          {/* Dealer Area */}
          <div className="flex flex-col items-center w-full">
            <div className="text-zinc-500 font-mono mb-3 sm:mb-4 uppercase tracking-widest text-[8px] sm:text-[10px]">Dealer Must Hit Soft 17</div>
            <div className="flex justify-center h-24 sm:h-36">
              {dealerHand.map((card, i) => renderCard(card, i))}
            </div>
            {(gameState !== 'betting' && dealerHand.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-black/50 px-3 py-1 rounded-full text-white font-mono text-[10px] border border-white/10"
              >
                Dealer: {dealerHand.length > 0 ? calculateScore(dealerHand) : 0}
              </motion.div>
            )}
          </div>

          {/* Center Message */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full pointer-events-none z-50">
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  key={message}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="text-2xl sm:text-5xl lg:text-7xl font-black drop-shadow-[0_4px_30px_rgba(0,0,0,1)] italic tracking-tighter uppercase font-glow leading-none"
                  style={{ color: themeColor }}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Area */}
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-center h-24 sm:h-36 mb-3 sm:mb-4">
              {playerHand.map((card, i) => renderCard(card, i))}
            </div>
            {(gameState !== 'betting' && playerHand.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/50 px-3 py-1 rounded-full text-white font-mono text-[10px] border border-white/10"
              >
                Player: {playerHand.length > 0 ? calculateScore(playerHand) : 0}
              </motion.div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 flex flex-col justify-center gap-6 bg-black/40 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] backdrop-blur-xl border border-white/5 shrink-0">
          {gameState === 'betting' || gameState === 'gameOver' ? (
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col items-center">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3 leading-none">Stake Amount</span>
                <div className="flex items-center gap-2 w-full justify-center">
                  <button onMouseEnter={playHover} onClick={() => { playClick(); setBet(b => Math.max(10, b - 10)); }} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl transition-colors shrink-0">−</button>
                  <div className="relative flex items-center flex-1 max-w-[180px]">
                    <span className="absolute left-3 text-lg font-mono font-bold text-zinc-500">$</span>
                    <input 
                      type="number" 
                      value={bet || ''} 
                      onChange={(e) => setBet(Math.max(0, Math.min(balance, Number(e.target.value) || 0)))}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-8 pr-2 text-xl font-mono font-black text-white outline-none focus:border-white/30 transition-colors text-center"
                    />
                  </div>
                  <button onMouseEnter={playHover} onClick={() => { playClick(); setBet(b => b + 10); }} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl transition-colors shrink-0">+</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 w-full">
                {[50, 100, 500, 1000].map(amt => (
                  <button key={amt} onMouseEnter={playHover} onClick={() => { playClick(); setBet(amt); }} className={`py-2.5 rounded-lg border text-[10px] font-black transition-all truncate ${bet === amt ? 'bg-white text-zinc-950 border-white' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:bg-zinc-800'}`}>${amt >= 1000 ? (amt/1000) + 'k' : amt}</button>
                ))}
              </div>

              <motion.button
                whileHover={balance >= bet ? { scale: 1.02 } : {}}
                whileTap={balance >= bet ? { scale: 0.98 } : {}}
                onMouseEnter={playHover}
                onClick={startGame}
                disabled={balance < bet || bet <= 0}
                className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-tighter transition-all shadow-lg border-2 ${balance < bet || bet <= 0 ? 'bg-zinc-800 text-zinc-600 border-white/5 cursor-not-allowed' : `bg-gradient-to-r ${themeGradient} text-zinc-950 border-transparent`}`}
                style={{ boxShadow: balance >= bet && bet > 0 ? `0 0 30px ${themeColor}4d` : 'none' }}
              >
                {gameState === 'gameOver' ? 'REPLAY' : 'DEAL'}
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              <div className="text-center p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Stake</div>
                <div className="text-2xl font-black text-white font-mono leading-none">${bet.toLocaleString()}</div>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); hit(); }}
                  disabled={gameState !== 'playing'}
                  className="w-full py-5 rounded-2xl bg-zinc-800 border border-white/10 text-white font-black text-xl uppercase tracking-tighter disabled:opacity-50 transition-all hover:bg-zinc-700 shadow-xl"
                >
                  Hit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); stand(); }}
                  disabled={gameState !== 'playing'}
                  className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-tighter shadow-xl transition-all border-2 border-transparent bg-gradient-to-r ${themeGradient} text-zinc-950`}
                  style={{ boxShadow: `0 0 30px ${themeColor}4d` }}
                >
                  Stand
                </motion.button>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-6">
            <span>Bankroll</span>
            <span className="text-zinc-300 font-bold">${balance.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
