import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { playCoin, playWin, playLose, playCard, playChip } from '../audio';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

interface Card { suit: string; value: string; hidden?: boolean; }

interface BlackjackProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onExit: () => void;
  themeGradient: string;
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

export default function Blackjack({ balance, setBalance, onExit, themeGradient }: BlackjackProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState('');

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
    
    if (dHand[1] && dHand[1].hidden) {
      dHand[1].hidden = false;
      setDealerHand([...dHand]);
    }

    if (msg.includes('win')) {
      const multiplier = msg.includes('Blackjack') ? 2.5 : 2;
      setBalance(b => b + bet * multiplier);
      playWin();
    } else if (msg.includes('Push')) {
      setBalance(b => b + bet);
      playCoin();
    } else {
      playLose();
    }
  };

  const renderCard = (card: Card, index: number) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <motion.div
        initial={{ opacity: 0, x: 50, y: -50, rotate: 10 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        key={index}
        className={`w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-white flex flex-col justify-between p-2 sm:p-3 shadow-xl border border-zinc-200 ${card.hidden ? 'bg-gradient-to-br from-blue-800 to-blue-900 border-blue-400' : ''} ${index > 0 ? '-ml-10 sm:-ml-12' : ''}`}
        style={{ zIndex: index }}
      >
        {!card.hidden && (
          <>
            <div className={`text-lg sm:text-xl font-bold ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{card.value}</div>
            <div className={`text-3xl sm:text-4xl self-center ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{card.suit}</div>
            <div className={`text-lg sm:text-xl font-bold self-end rotate-180 ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>{card.value}</div>
          </>
        )}
        {card.hidden && (
          <div className="w-full h-full border-2 border-blue-400/30 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-400/20" />
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
      className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto"
    >
      <div className="w-full flex justify-between items-center mb-4">
        <button onClick={onExit} className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Leave Table
        </button>
      </div>

      <div className="bg-emerald-900/40 border-4 border-emerald-800 rounded-[3rem] p-4 sm:p-8 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] relative w-full min-h-[500px] sm:min-h-[600px] flex flex-col justify-between overflow-hidden">
        
        <div className="flex flex-col items-center">
          <div className="text-emerald-400/50 font-mono mb-4 uppercase tracking-widest text-xs sm:text-sm">Dealer Must Hit Soft 17</div>
          <div className="flex justify-center h-28 sm:h-36">
            {dealerHand.map((card, i) => renderCard(card, i))}
          </div>
          {gameState !== 'betting' && (
            <div className="mt-2 bg-black/50 px-3 py-1 rounded-full text-white font-mono text-sm">
              {calculateScore(dealerHand)}
            </div>
          )}
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full pointer-events-none z-50">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="text-3xl sm:text-5xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center mt-8">
          {gameState !== 'betting' && (
            <div className="mb-2 bg-black/50 px-3 py-1 rounded-full text-white font-mono text-sm">
              {calculateScore(playerHand)}
            </div>
          )}
          <div className="flex justify-center h-28 sm:h-36 mb-8">
            {playerHand.map((card, i) => renderCard(card, i))}
          </div>

          {gameState === 'betting' || gameState === 'gameOver' ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2">
                <button onClick={() => setBet(b => Math.max(10, b - 10))} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl">-</button>
                <div className="w-24 text-center text-2xl font-mono text-amber-400 font-bold">${bet}</div>
                <button onClick={() => setBet(b => b + 10)} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl">+</button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                disabled={balance < bet}
                className={`px-8 py-3 rounded-xl bg-gradient-to-r ${themeGradient} text-white font-bold uppercase tracking-wider disabled:opacity-50 w-full sm:w-auto`}
              >
                {gameState === 'gameOver' ? 'Play Again' : 'Place Bet'}
              </motion.button>
            </div>
          ) : (
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={hit}
                disabled={gameState !== 'playing'}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider shadow-lg disabled:opacity-50"
              >
                Hit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stand}
                disabled={gameState !== 'playing'}
                className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider shadow-lg disabled:opacity-50"
              >
                Stand
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
