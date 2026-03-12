import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  Terminal,
  Crosshair,
  Car,
  Puzzle,
  Rocket,
  Swords,
  Ghost,
  Search,
  Menu,
  Play,
  Dices,
  Coins,
  Spade,
  Club,
  Heart,
  Diamond,
  ShieldAlert,
  X,
  CheckCircle2,
  Loader2,
  Video,
  Ticket,
  Store,
  Key,
  History,
  ArrowLeft
} from 'lucide-react';

import Slots from './games/Slots';
import Blackjack from './games/Blackjack';
import GameImage from './components/GameImage';
import { playClick, playHover } from './audio';
import externalGames from './externalGames.json';

const STANDARD_GAMES = [
  ...externalGames,
  { id: 'custom-1', title: 'Cyber Strike', category: 'FPS', icon: Crosshair, color: 'from-lime-400 to-cyan-400', players: '1.2k', status: 'ONLINE' },
  { id: 'custom-2', title: 'Neon Drift', category: 'Racing', icon: Car, color: 'from-cyan-400 to-blue-500', players: '850', status: 'ONLINE' },
  { id: 'custom-3', title: 'Logic Grid', category: 'Puzzle', icon: Puzzle, color: 'from-lime-500 to-emerald-500', players: '3.4k', status: 'UPDATE' },
  { id: 'custom-4', title: 'Stellar Void', category: 'Space', icon: Rocket, color: 'from-cyan-300 to-lime-300', players: '5.1k', status: 'ONLINE' },
  { id: 'custom-5', title: 'Blade Runner', category: 'RPG', icon: Swords, color: 'from-lime-600 to-cyan-600', players: '920', status: 'BETA' },
  { id: 'custom-6', title: 'Phantom Protocol', category: 'Stealth', icon: Ghost, color: 'from-cyan-500 to-teal-500', players: '410', status: 'ONLINE' },
  { id: 'custom-7', title: 'Terminal Hack', category: 'Strategy', icon: Terminal, color: 'from-lime-400 to-cyan-400', players: '2.8k', status: 'EVENT' },
  { id: 'custom-8', title: 'Arcade Classic', category: 'Retro', icon: Gamepad2, color: 'from-teal-400 to-lime-400', players: '1.1k', status: 'ONLINE' },
];

const ADULT_GAMES = [
  { id: 'custom-101', title: 'Neon Slots', category: 'Slots', icon: Coins, color: 'from-amber-400 to-red-500', players: '4.2k', status: 'HOT' },
  { id: 'custom-102', title: 'High Roller Blackjack', category: 'Cards', icon: Spade, color: 'from-red-500 to-rose-600', players: '2.1k', status: 'ONLINE' },
  { id: 'custom-103', title: 'Cyber Poker', category: 'Cards', icon: Club, color: 'from-amber-500 to-orange-600', players: '5.5k', status: 'TOURNAMENT' },
  { id: 'custom-104', title: 'Quantum Roulette', category: 'Table', icon: Crosshair, color: 'from-rose-400 to-red-500', players: '1.8k', status: 'ONLINE' },
  { id: 'custom-105', title: 'Crypto Craps', category: 'Dice', icon: Dices, color: 'from-amber-400 to-orange-500', players: '950', status: 'ONLINE' },
  { id: 'custom-106', title: 'Baccarat Royale', category: 'Cards', icon: Diamond, color: 'from-red-400 to-rose-500', players: '620', status: 'VIP ONLY' },
  { id: 'custom-107', title: 'Hearts of Fire', category: 'Cards', icon: Heart, color: 'from-rose-500 to-red-600', players: '1.1k', status: 'ONLINE' },
  { id: 'custom-108', title: 'Jackpot Terminal', category: 'Slots', icon: Terminal, color: 'from-amber-300 to-red-500', players: '8.9k', status: 'MEGA DROP' },
];

const THEMES = {
  default: { name: 'Hacker Green', gradient: 'from-lime-400 to-cyan-400', colors: ['#a3e635', '#22d3ee'], glow: 'rgba(163, 230, 53, 0.5)', primary: '#a3e635', price: 0 },
  purple: { name: 'Neon Purple', gradient: 'from-purple-500 to-pink-500', colors: ['#a855f7', '#ec4899'], glow: 'rgba(168, 85, 247, 0.5)', primary: '#a855f7', price: 500 },
  gold: { name: 'Royal Gold', gradient: 'from-yellow-400 to-amber-600', colors: ['#facc15', '#d97706'], glow: 'rgba(250, 204, 21, 0.5)', primary: '#fbbf24', price: 1000 },
  monochrome: { name: 'Ghost White', gradient: 'from-zinc-100 to-zinc-400', colors: ['#f4f4f5', '#a1a1aa'], glow: 'rgba(244, 244, 245, 0.5)', primary: '#f4f4f5', price: 2500 },
  ocean: { name: 'Deep Ocean', gradient: 'from-blue-500 to-teal-400', colors: ['#3b82f6', '#2dd4bf'], glow: 'rgba(59, 130, 246, 0.5)', primary: '#3b82f6', price: 5000 },
  cyberpunk: { name: 'Cyberpunk', gradient: 'from-pink-500 to-yellow-500', colors: ['#ec4899', '#eab308'], glow: 'rgba(236, 72, 153, 0.5)', primary: '#ec4899', price: 10000 },
  matrix: { name: 'The Matrix', gradient: 'from-green-500 to-emerald-700', colors: ['#22c55e', '#047857'], glow: 'rgba(34, 197, 94, 0.5)', primary: '#22c55e', price: 15000 },
  blood: { name: 'Blood Moon', gradient: 'from-red-600 to-rose-900', colors: ['#dc2626', '#4c0519'], glow: 'rgba(220, 38, 38, 0.5)', primary: '#dc2626', price: 25000 },
};

const BADGES = {
  vip: { name: 'VIP Status', icon: '👑', price: 50000, currency: 'chips' as const },
  highRoller: { name: 'High Roller', icon: '🎲', price: 100000, currency: 'chips' as const },
  whale: { name: 'Casino Whale', icon: '🐋', price: 500000, currency: 'chips' as const },
  arcadeKing: { name: 'Arcade King', icon: '👾', price: 50000, currency: 'tokens' as const },
};

const EXCHANGE = {
  chips1k: { name: '1,000 Chips', price: 500, currency: 'tokens' as const, reward: 1000, rewardCurrency: 'chips' as const },
  chips10k: { name: '10,000 Chips', price: 4500, currency: 'tokens' as const, reward: 10000, rewardCurrency: 'chips' as const },
  tokens1k: { name: '1,000 Tokens', price: 5000, currency: 'chips' as const, reward: 1000, rewardCurrency: 'tokens' as const },
};

export default function App() {
  const [isProMode, setIsProMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  // Modals & Verification
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState(false);
  
  // Ads & Shop
  const [showAdModal, setShowAdModal] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [showShopModal, setShowShopModal] = useState(false);
  
  // Currencies & Customization
  const [balance, setBalance] = useState(1000); // Casino Chips
  const [tokens, setTokens] = useState(250); // Arcade Tokens
  const [ownedThemes, setOwnedThemes] = useState<string[]>(['default']);
  const [ownedBadges, setOwnedBadges] = useState<string[]>([]);
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>('default');
  const [shopTab, setShopTab] = useState<'themes' | 'badges' | 'exchange'>('themes');
  const [rewardMessage, setRewardMessage] = useState('');

  // Bet History
  const [betHistory, setBetHistory] = useState<{id: string, date: string, amount: number, winnings: number, game: string, type: string}[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Game State
  const [launchingGame, setLaunchingGame] = useState<string | number | null>(null);
  const [activeGame, setActiveGame] = useState<string | number | null>(null);

  const gamesSectionRef = useRef<HTMLElement>(null);

  const handleToggleProMode = () => {
    if (isProMode) {
      setIsProMode(false);
      setActiveGame(null);
      setSearchQuery('');
    } else {
      setKeyInput('');
      setKeyError(false);
      setGeneratedKey('');
      setShowKeyModal(true);
      setSearchQuery('');
    }
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.toUpperCase() === generatedKey && generatedKey !== '') {
      setIsProMode(true);
      setShowKeyModal(false);
    } else {
      setKeyError(true);
      setKeyInput('');
    }
  };

  const watchAdForKey = () => {
    setShowAdModal(true);
    setAdProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setAdProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const newKey = "PRO-" + Math.floor(1000 + Math.random() * 9000);
          setGeneratedKey(newKey);
          setShowAdModal(false);
        }, 500);
      }
    }, 100);
  };

  const handlePlayGame = (id: string | number) => {
    setLaunchingGame(id);
    setTimeout(() => {
      setLaunchingGame(null);
      setActiveGame(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const handleReturnToLobby = () => {
    setActiveGame(null);
  };

  const recordBet = (amount: number, winnings: number, game: string, type: 'chips' | 'tokens' = 'chips') => {
    const newRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString(),
      amount,
      winnings,
      game,
      type
    };
    setBetHistory(prev => [newRecord, ...prev].slice(0, 50));
  };

  const watchAd = () => {
    setShowAdModal(true);
    setAdProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2; // 5 seconds total
      setAdProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (isProMode) {
            setBalance(b => b + 2500);
            setRewardMessage('+2500 Chips Earned!');
          } else {
            setTokens(t => t + 500);
            setRewardMessage('+500 Tokens Earned!');
          }
          setTimeout(() => setRewardMessage(''), 3000);
          setShowAdModal(false);
        }, 500);
      }
    }, 100);
  };

  const scrollToGames = () => {
    gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeGames = useMemo(() => {
    console.log('Active games changed, isProMode:', isProMode);
    return isProMode ? ADULT_GAMES : STANDARD_GAMES;
  }, [isProMode]);
  
  const displayedGames = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    console.log('Filtering games with query:', query, 'Active games count:', activeGames.length);
    if (query === '') return activeGames;
    
    const filtered = activeGames.filter(g => 
      g.title.toLowerCase().includes(query) || 
      g.category.toLowerCase().includes(query)
    );
    console.log('Filtered games count:', filtered.length);
    return filtered;
  }, [debouncedSearchQuery, activeGames]);

  const currentThemeConfig = THEMES[activeTheme];
  const themeGradient = currentThemeConfig.gradient;
  const themeColor = currentThemeConfig.primary;
  const themeColors = currentThemeConfig.colors;
  const themeGlow = currentThemeConfig.glow;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-700">
      <style>{`
        .dynamic-glow-text { text-shadow: 0 0 20px ${themeGlow}; }
        .dynamic-glow-box { box-shadow: 0 0 15px -3px ${themeGlow}; }
        .dynamic-glow-box-hover:hover { box-shadow: 0 0 25px -2px ${themeGlow}; }
      `}</style>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/80 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => { playClick(); setActiveGame(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <motion.div 
              layout
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeGradient} flex items-center justify-center dynamic-glow-box`}
            >
              <Terminal className="w-5 h-5 text-zinc-950" />
            </motion.div>
            <span className="font-bold text-xl tracking-tight hidden sm:flex items-center gap-2">
              PurePro<motion.span layout className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>4561</motion.span>
              {ownedBadges.map(b => <span key={b} className="text-lg" title={BADGES[b as keyof typeof BADGES].name}>{BADGES[b as keyof typeof BADGES].icon}</span>)}
            </span>
          </motion.div>

          {!activeGame && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center bg-zinc-900/50 border border-white/10 rounded-full px-4 py-2 w-96 focus-within:border-white/30 focus-within:dynamic-glow-box transition-all"
            >
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, genres..."
                className="bg-transparent border-none outline-none text-sm ml-3 w-full text-zinc-200 placeholder:text-zinc-500 font-mono"
              />
              {searchQuery && (
                <motion.button 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onMouseEnter={playHover}
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          )}

          <div className="flex items-center gap-4">
            {isProMode ? (
              <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 pl-3 pr-1 py-1 rounded-full border border-amber-500/20 text-amber-400 font-mono text-sm">
                <Coins className="w-4 h-4" /> ${balance.toLocaleString()}
                <button 
                  onMouseEnter={playHover}
                  onClick={watchAd} 
                  className="ml-2 bg-amber-500/20 hover:bg-amber-500/40 p-1.5 rounded-full transition-colors" 
                  title="Watch Ad for Chips"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 bg-zinc-800/50 pl-3 pr-1 py-1 rounded-full border border-white/10 text-zinc-300 font-mono text-sm">
                <Ticket className="w-4 h-4" /> {tokens.toLocaleString()}
                <button 
                  onMouseEnter={playHover}
                  onClick={watchAd} 
                  className="ml-2 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" 
                  title="Watch Ad for Tokens"
                >
                  <Video className="w-4 h-4 text-lime-400" />
                </button>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => setShowShopModal(true)} 
                  className="ml-2 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" 
                  title="Open Shop"
                >
                  <Store className="w-4 h-4 text-zinc-300" />
                </button>
              </div>
            )}
            
            {isProMode && (
              <button onClick={() => setShowHistoryModal(true)} className="hidden sm:flex bg-zinc-800/50 hover:bg-zinc-700/50 p-2 rounded-full border border-white/10 transition-colors" title="Bet History">
                <History className="w-4 h-4 text-amber-400" style={{ color: themeColor }} />
              </button>
            )}
            
            <motion.div 
              className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5"
              whileHover={{ scale: 1.05 }}
            >
              <span className={`text-xs font-mono font-bold ${isProMode ? 'text-amber-500' : 'text-zinc-500'}`}>PRO</span>
              <button 
                onMouseEnter={playHover}
                onClick={handleToggleProMode} 
                className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors duration-300 ${isProMode ? 'bg-gradient-to-r from-amber-500 to-red-500 justify-end' : 'bg-zinc-700 justify-start'}`}
              >
                <motion.div layout className="w-3 h-3 rounded-full bg-white shadow-sm" />
              </button>
            </motion.div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="md:hidden p-2 text-zinc-400 hover:text-zinc-100">
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {activeGame ? (
        activeGame === 'custom-101' ? (
          <Slots balance={balance} setBalance={setBalance} onExit={() => setActiveGame(null)} themeGradient={themeGradient} themeColor={themeColor} onRecordBet={recordBet} />
        ) : activeGame === 'custom-102' ? (
          <Blackjack balance={balance} setBalance={setBalance} onExit={() => setActiveGame(null)} themeGradient={themeGradient} themeColor={themeColor} onRecordBet={recordBet} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full">
            <button 
              onClick={handleReturnToLobby}
              className="absolute top-20 left-6 z-50 px-4 py-2 bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Lobby
            </button>
            {activeGame && ([...STANDARD_GAMES, ...ADULT_GAMES].find(g => g.id === activeGame)?.url) && (
              <iframe 
                src={([...STANDARD_GAMES, ...ADULT_GAMES].find(g => g.id === activeGame)?.url)}
                className="fixed inset-0 w-screen h-screen z-40 border-none bg-black"
                title="Game"
              />
            )}
          </div>
        )
      ) : (
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          <section className="py-16 md:py-24 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border ${isProMode ? 'border-amber-500/30 text-amber-400' : 'border-white/20 text-zinc-300'} text-xs font-mono mb-8`}
              >
                <span className={`w-2 h-2 rounded-full ${isProMode ? 'bg-amber-500' : 'bg-zinc-300'} animate-pulse`} />
                {isProMode ? 'RESTRICTED ACCESS GRANTED' : 'SYSTEM ONLINE // V2.0.4'}
              </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
            >
              All Your Favorite Games <br className="hidden md:block" />
              <motion.span layout className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient} dynamic-glow-text`}>
                In One Place
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl max-w-2xl font-light mb-10"
            >
              {isProMode 
                ? "Welcome to the high roller's club. Premium stakes, exclusive tables, and maximum payouts await."
                : "Access the ultimate collection of web-based experiences. Minimal latency, maximum performance. Initialize your session now."}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToGames}
              className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${themeGradient} text-zinc-950 font-bold flex items-center gap-2 dynamic-glow-box-hover transition-all`}
            >
              <Play className="w-5 h-5 fill-current" />
              {isProMode ? 'ENTER CASINO' : 'START PLAYING'}
            </motion.button>
          </section>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="md:hidden mb-8 bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-3 flex items-center focus-within:border-white/30 focus-within:dynamic-glow-box transition-all"
          >
            <Search className="w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="bg-transparent border-none outline-none text-base ml-3 w-full text-zinc-200 placeholder:text-zinc-500 font-mono"
            />
          </motion.div>

          <section ref={gamesSectionRef} className="py-12 scroll-mt-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                {isProMode ? <ShieldAlert className="w-6 h-6 text-amber-500" /> : <Terminal className="w-6 h-6 text-zinc-300" />}
                {isProMode ? 'High_Stakes_Lobby' : 'Featured_Executables'}
              </h2>
              <span className="text-zinc-500 font-mono text-sm">{displayedGames.length} MODULES</span>
            </motion.div>

            {displayedGames.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed"
              >
                <Ghost className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-mono">NO EXECUTABLES FOUND FOR "{searchQuery}"</p>
                <button onClick={() => { playClick(); setSearchQuery(''); }} className="mt-4 text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-4">
                  Clear Search
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={isProMode ? 'adult-grid' : 'standard-grid'}
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {displayedGames.length > 0 ? (
                    displayedGames.map((game) => (
                      <motion.div
                        layout
                        key={game.id}
                        variants={{
                          hidden: { opacity: 0, y: 30, scale: 0.9 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                        }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        whileHover={{ y: -8, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={playHover}
                        onClick={() => { playClick(); handlePlayGame(game.id); }}
                        className="group relative bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-4 cursor-pointer overflow-hidden transition-colors hover:border-white/20 dynamic-glow-box-hover"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                        <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${themeGradient} p-1 mb-4 relative`}>
                          <div className="w-full h-full bg-zinc-950/90 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            {launchingGame === game.id ? (
                              <motion.div
                                initial={{ opacity: 0, rotate: -180 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                className="text-zinc-100"
                              >
                                <Loader2 className="w-12 h-12 animate-spin" />
                              </motion.div>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.15, rotate: isProMode ? 5 : -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="w-full h-full flex items-center justify-center"
                              >
                                <GameImage 
                                  src={game.image} 
                                  alt={game.title} 
                                  icon={game.icon}
                                  className="w-full h-full"
                                />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-zinc-100 group-hover:text-white transition-colors">{game.title}</h3>
                            <p className="text-zinc-500 text-sm">{game.category}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border ${isProMode ? 'border-red-900/50' : 'border-zinc-700'}`}>
                              {game.status}
                            </span>
                            <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                              {game.players}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      key="no-results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="col-span-full py-20 flex flex-col items-center justify-center text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-white/5">
                        <Search className="w-10 h-10 text-zinc-700" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-300">No matches found</h3>
                      <p className="text-zinc-500 mt-2">Try searching for something else or clear the filter.</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        onMouseEnter={playHover}
                        className="mt-6 px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-colors"
                      >
                        Clear Search
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </main>
      )}

      <footer className="border-t border-white/5 py-8 mt-auto bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm font-mono">
          <p>&copy; 2026 PurePro4561. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <motion.a whileHover={{ y: -2, color: '#fff' }} href="#" className="transition-colors">STATUS</motion.a>
            <motion.a whileHover={{ y: -2, color: '#fff' }} href="#" className="transition-colors">TERMS</motion.a>
            <motion.a whileHover={{ y: -2, color: '#fff' }} href="#" className="transition-colors">PRIVACY</motion.a>
          </div>
        </div>
      </footer>

      {/* Reward Toast */}
      <AnimatePresence>
        {rewardMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 text-zinc-950 px-6 py-3 rounded-full font-bold flex items-center gap-2"
            style={{ backgroundColor: themeColor, boxShadow: `0 0 30px ${themeColor}80` }}
          >
            <Ticket className="w-5 h-5" />
            {rewardMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Modal */}
      <AnimatePresence>
        {showAdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-zinc-900 border rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
              style={{ borderColor: `${themeColor}33` }}
            >
              <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient} mb-4 flex items-center gap-2`}>
                <Video style={{ color: themeColor }} /> Sponsor Message
              </h3>
              <div className="w-full aspect-video bg-black rounded-xl border border-white/10 mb-6 flex items-center justify-center relative overflow-hidden shadow-inner">
                <Video className="w-16 h-16 text-zinc-800 animate-pulse" />
                <div className="absolute bottom-0 left-0 h-2 transition-all duration-100 ease-linear" style={{ width: `${adProgress}%`, backgroundColor: themeColor }} />
                <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs font-mono text-white">
                  Reward in {Math.ceil((100 - adProgress) / 20)}s
                </div>
              </div>
              <p className="text-zinc-400 font-mono text-sm">Please wait while the ad finishes to receive your {isProMode ? 'chips' : 'tokens'}...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShopModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-zinc-900 border rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden"
              style={{ borderColor: `${themeColor}33` }}
            >
              <button onMouseEnter={playHover} onClick={() => { playClick(); setShowShopModal(false); }} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient} flex items-center gap-3`}>
                    <Store style={{ color: themeColor }} className="w-8 h-8"/> The Shop
                  </h3>
                  <p className="text-zinc-400 mt-2">Spend your tokens and chips on custom themes, badges, or exchange currency.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-white/10">
                    <Ticket className="w-5 h-5 text-lime-400" />
                    <span className="text-xl font-mono font-bold text-zinc-100">{tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-white/10">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="text-xl font-mono font-bold text-zinc-100">{balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setShopTab('themes'); }}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${shopTab === 'themes' ? 'text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  style={shopTab === 'themes' ? { backgroundColor: themeColor } : {}}
                >
                  Themes
                </button>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setShopTab('badges'); }}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${shopTab === 'badges' ? 'text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  style={shopTab === 'badges' ? { backgroundColor: themeColor } : {}}
                >
                  Badges
                </button>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setShopTab('exchange'); }}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${shopTab === 'exchange' ? 'text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  style={shopTab === 'exchange' ? { backgroundColor: themeColor } : {}}
                >
                  Exchange
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {shopTab === 'themes' && Object.entries(THEMES).map(([id, theme]) => {
                  const isOwned = ownedThemes.includes(id);
                  const isActive = activeTheme === id;
                  return (
                    <div key={id} className={`bg-zinc-950 border ${isActive ? 'border-lime-500/50' : 'border-white/5'} rounded-2xl p-6 flex items-center justify-between transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.gradient} shadow-lg`} />
                        <div>
                          <h4 className="font-bold text-zinc-100">{theme.name}</h4>
                          <p className="text-sm font-mono text-zinc-500 flex items-center gap-1">
                            {isOwned ? 'Owned' : <><Ticket className="w-3 h-3" /> {theme.price.toLocaleString()}</>}
                          </p>
                        </div>
                      </div>
                      {isActive ? (
                        <span className="px-4 py-2 rounded-xl font-bold text-sm border" style={{ backgroundColor: `${themeColor}33`, color: themeColor, borderColor: `${themeColor}4d` }}>Equipped</span>
                      ) : isOwned ? (
                        <button 
                          onMouseEnter={playHover}
                          onClick={() => { playClick(); setActiveTheme(id as keyof typeof THEMES); }} 
                          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-colors"
                        >
                          Equip
                        </button>
                      ) : (
                        <button 
                          onMouseEnter={playHover}
                          onClick={() => {
                            playClick();
                            if (tokens >= theme.price) {
                              setTokens(t => t - theme.price);
                              setOwnedThemes(prev => [...prev, id]);
                            }
                          }}
                          disabled={tokens < theme.price}
                          className="px-4 py-2 rounded-xl text-zinc-950 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          style={{ backgroundColor: themeColor }}
                        >
                          Buy
                        </button>
                      )}
                    </div>
                  )
                })}

                {shopTab === 'badges' && Object.entries(BADGES).map(([id, badge]) => {
                  const isOwned = ownedBadges.includes(id);
                  const isChips = badge.currency === 'chips';
                  const canAfford = isChips ? balance >= badge.price : tokens >= badge.price;
                  return (
                    <div key={id} className={`bg-zinc-950 border ${isOwned ? 'border-amber-500/50' : 'border-white/5'} rounded-2xl p-6 flex items-center justify-between transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{badge.icon}</div>
                        <div>
                          <h4 className="font-bold text-zinc-100">{badge.name}</h4>
                          <p className="text-sm font-mono text-zinc-500 flex items-center gap-1">
                            {isOwned ? 'Owned' : (
                              <>
                                {isChips ? <Coins className="w-3 h-3 text-amber-500" /> : <Ticket className="w-3 h-3 text-lime-500" />}
                                {badge.price.toLocaleString()}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {isOwned ? (
                        <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-sm border border-amber-500/30">Owned</span>
                      ) : (
                        <button 
                          onMouseEnter={playHover}
                          onClick={() => {
                            if (canAfford) {
                              playClick();
                              if (isChips) setBalance(b => b - badge.price);
                              else setTokens(t => t - badge.price);
                              setOwnedBadges(prev => [...prev, id]);
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isChips ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950' : 'bg-lime-500 hover:bg-lime-400 text-zinc-950'}`}
                        >
                          Buy
                        </button>
                      )}
                    </div>
                  )
                })}

                {shopTab === 'exchange' && Object.entries(EXCHANGE).map(([id, item]) => {
                  const isChips = item.currency === 'chips';
                  const canAfford = isChips ? balance >= item.price : tokens >= item.price;
                  return (
                    <div key={id} className="bg-zinc-950 border border-white/5 rounded-2xl p-6 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900">
                          {item.rewardCurrency === 'chips' ? <Coins className="w-6 h-6 text-amber-500" /> : <Ticket className="w-6 h-6 text-lime-500" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100">{item.name}</h4>
                          <p className="text-sm font-mono text-zinc-500 flex items-center gap-1">
                            Cost: {isChips ? <Coins className="w-3 h-3 text-amber-500" /> : <Ticket className="w-3 h-3 text-lime-500" />} {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button 
                        onMouseEnter={playHover}
                        onClick={() => {
                          if (canAfford) {
                            playClick();
                            if (isChips) setBalance(b => b - item.price);
                            else setTokens(t => t - item.price);
                            
                            if (item.rewardCurrency === 'chips') setBalance(b => b + item.reward);
                            else setTokens(t => t + item.reward);
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${item.rewardCurrency === 'chips' ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950' : 'bg-lime-500 hover:bg-lime-400 text-zinc-950'}`}
                      >
                        Exchange
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Verification Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-zinc-900 border rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
              style={{ borderColor: `${themeColor}33` }}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${themeColor}33` }} />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${themeColor}33` }} />

              <button 
                onMouseEnter={playHover}
                onClick={() => { playClick(); setShowKeyModal(false); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ background: `linear-gradient(to bottom right, ${themeColors[0]}, ${themeColors[1]})`, boxShadow: `0 0 30px ${themeColor}4d` }}>
                  <Key className="w-8 h-8 text-zinc-950" />
                </div>
                
                <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient} mb-2`}>Access Key Required</h3>
                <p className="text-zinc-400 mb-8 text-sm">
                  To access the High Stakes Lobby, please enter your unique access key.
                </p>

                <form onSubmit={handleKeySubmit} className="w-full">
                  <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 mb-6">
                    <span className={`text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>
                      {generatedKey || "••••••••"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      autoFocus
                      value={keyInput}
                      onChange={(e) => {
                        setKeyInput(e.target.value);
                        setKeyError(false);
                      }}
                      placeholder="Enter Access Key"
                      className={`w-full bg-zinc-950 border ${keyError ? 'border-red-500 focus:border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-center text-xl font-mono text-zinc-100 outline-none transition-all uppercase`}
                      style={{ 
                        borderColor: keyInput && !keyError ? themeColor : undefined,
                        boxShadow: keyInput && !keyError ? `0 0 15px ${themeColor}33` : undefined
                      }}
                    />
                    
                    <AnimatePresence>
                      {keyError && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-sm font-mono"
                        >
                          Invalid Access Key. Please try again.
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      onMouseEnter={playHover}
                      disabled={!keyInput}
                      className="w-full py-4 rounded-xl text-zinc-950 font-bold text-lg shadow-lg transition-all disabled:opacity-50"
                      style={{ background: `linear-gradient(to right, ${themeColors[0]}, ${themeColors[1]})`, boxShadow: keyInput ? `0 0 20px ${themeColor}4d` : 'none' }}
                    >
                      Unlock Pro Mode
                    </button>

                    <div className="pt-4 border-t border-white/5">
                      <p className="text-zinc-500 text-xs mb-3 font-mono">DON'T HAVE A KEY?</p>
                      <button
                        type="button"
                        onMouseEnter={playHover}
                        onClick={() => { playClick(); watchAdForKey(); }}
                        className="w-full py-3 rounded-xl bg-zinc-900 border hover:bg-zinc-800 text-zinc-100 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ borderColor: `${themeColor}4d` }}
                      >
                        <Video className="w-4 h-4" style={{ color: themeColor }} />
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>Get Access Key (Watch Ad)</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-zinc-900 border rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
              style={{ borderColor: `${themeColor}33` }}
            >
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}20` }}>
                  <History className="w-6 h-6" style={{ color: themeColor }} />
                </div>
                <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>Bet History</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {betHistory.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 font-mono">
                    No bets recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {betHistory.map((bet) => (
                      <div key={bet.id} className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-zinc-100 font-bold">{bet.game}</span>
                          <span className="text-zinc-500 text-xs font-mono">{bet.date}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-zinc-500 text-[10px] font-mono uppercase">Bet</p>
                            <p className="text-zinc-300 font-mono font-bold">
                              {bet.type === 'chips' ? '$' : ''}{bet.amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="text-zinc-500 text-[10px] font-mono uppercase">Outcome</p>
                            <p className={`font-mono font-bold ${bet.winnings > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {bet.winnings > 0 ? '+' : ''}{bet.type === 'chips' ? '$' : ''}{bet.winnings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
