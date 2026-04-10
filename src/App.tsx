import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  ArrowLeft,
  Sparkles,
  User,
  Zap,
  Skull,
  Crown,
  ShieldCheck,
  LogOut,
  Settings,
  Database,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

import Slots from './games/Slots';
import Blackjack from './games/Blackjack';
import Plinko from './games/Plinko';
import Roulette from './games/Roulette';
import Poker from './games/Poker';
import Craps from './games/Craps';
import Baccarat from './games/Baccarat';
import GameImage from './components/GameImage';
import AuraPackModal, { PackType } from './components/AuraPackModal';
import { playClick, playHover, playCoin, playLose } from './audio';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const STANDARD_GAMES = [
  { id: 'custom-101', title: 'Neon Slots', category: 'Slots', icon: Coins, color: 'from-amber-400 to-red-500', players: '4.2k', status: 'HOT' },
  { id: 'custom-102', title: 'High Roller Blackjack', category: 'Cards', icon: Spade, color: 'from-red-500 to-rose-600', players: '2.1k', status: 'ONLINE' },
  { id: 'custom-103', title: 'Cyber Poker', category: 'Cards', icon: Club, color: 'from-amber-500 to-orange-600', players: '5.5k', status: 'TOURNAMENT' },
  { id: 'custom-104', title: 'Quantum Roulette', category: 'Table', icon: Crosshair, color: 'from-rose-400 to-red-500', players: '1.8k', status: 'ONLINE' },
  { id: 'custom-105', title: 'Crypto Craps', category: 'Dice', icon: Dices, color: 'from-amber-400 to-orange-500', players: '950', status: 'ONLINE' },
  { id: 'custom-106', title: 'Baccarat Royale', category: 'Cards', icon: Diamond, color: 'from-red-400 to-rose-500', players: '620', status: 'VIP ONLY' },
  { id: 'custom-107', title: 'Hearts of Fire', category: 'Cards', icon: Heart, color: 'from-rose-500 to-red-600', players: '1.1k', status: 'ONLINE' },
  { id: 'custom-108', title: 'Jackpot Terminal', category: 'Slots', icon: Terminal, color: 'from-amber-300 to-red-500', players: '8.9k', status: 'MEGA DROP' },
];

const ADULT_GAMES = [
  { id: 'custom-201', title: 'Cyber Plinko', category: 'Premium', icon: Sparkles, color: 'from-yellow-400 to-amber-600', players: '12.5k', status: 'PREMIUM' },
  { id: 'custom-202', title: 'Godly Slots', category: 'Premium', icon: Crown, color: 'from-amber-300 via-orange-500 to-red-600', players: '8.1k', status: 'GODLY' },
  { id: 'custom-203', title: 'VIP Roulette', category: 'Premium', icon: Crosshair, color: 'from-purple-600 to-pink-600', players: '3.2k', status: 'VIP' },
  { id: 'custom-204', title: 'High Stakes Poker', category: 'Premium', icon: Club, color: 'from-emerald-500 to-teal-700', players: '1.5k', status: 'HIGH STAKES' },
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
  godAura: { name: 'God Aura', gradient: 'from-amber-300 via-orange-500 to-red-600', colors: ['#fcd34d', '#dc2626'], glow: 'rgba(251, 191, 36, 0.8)', primary: '#f59e0b', price: 999999 },
  theme_liquid_gold: { name: 'Liquid Gold', gradient: 'from-yellow-300 via-yellow-500 to-amber-700', colors: ['#fde047', '#b45309'], glow: 'rgba(253, 224, 71, 0.6)', primary: '#eab308', price: 999999 }, // Only from packs
  theme_midnight_nebula: { name: 'Midnight Nebula', gradient: 'from-indigo-900 via-purple-900 to-black', colors: ['#312e81', '#000000'], glow: 'rgba(79, 70, 229, 0.6)', primary: '#4f46e5', price: 999999 }, // Only from packs
};

const BADGES = {
  vip: { name: 'VIP Status', icon: '👑', price: 50000, currency: 'chips' as const },
  highRoller: { name: 'High Roller', icon: '🎲', price: 100000, currency: 'chips' as const },
  whale: { name: 'Casino Whale', icon: '🐋', price: 500000, currency: 'chips' as const },
  arcadeKing: { name: 'Arcade King', icon: '👾', price: 50000, currency: 'tokens' as const },
  badge_diamond: { name: 'Spinning Diamond', icon: '💎', price: 999999, currency: 'tokens' as const }, // Only from packs
  badge_whale_pulse: { name: 'Pulsing Whale', icon: '🐳', price: 999999, currency: 'tokens' as const }, // Only from packs
};

const EXCHANGE = {
  chips1k: { name: '1,000 Chips', price: 500, currency: 'tokens' as const, reward: 1000, rewardCurrency: 'chips' as const },
  chips10k: { name: '10,000 Chips', price: 4500, currency: 'tokens' as const, reward: 10000, rewardCurrency: 'chips' as const },
  tokens1k: { name: '1,000 Tokens', price: 5000, currency: 'chips' as const, reward: 1000, rewardCurrency: 'tokens' as const },
};

const AVATARS = {
  avatar_default: { name: 'Guest', icon: <User className="w-full h-full" />, rarity: 'COMMON' },
  avatar_hacker: { name: 'Ghost Hacker', icon: <User className="w-full h-full text-lime-400" />, rarity: 'COMMON' },
  avatar_cyberpunk: { name: 'Neon Samurai', icon: <Zap className="w-full h-full text-cyan-400" />, rarity: 'COMMON' },
  avatar_reaper: { name: 'Digital Reaper', icon: <Skull className="w-full h-full text-purple-500" />, rarity: 'EPIC' },
  avatar_king: { name: 'Crypto King', icon: <Crown className="w-full h-full text-yellow-400" />, rarity: 'LEGENDARY' },
};

const VFX_EFFECTS = {
  vfx_none: { name: 'None', rarity: 'COMMON' },
  vfx_matrix: { name: 'Matrix Rain', rarity: 'EPIC' },
  vfx_gold_dust: { name: 'Gold Dust', rarity: 'LEGENDARY' },
  vfx_cyber_glitch: { name: 'Cyber Glitch', rarity: 'EPIC' },
  vfx_god_rays: { name: 'God Rays', rarity: 'GODLY' },
};

const VFXOverlay = ({ activeVFX }: { activeVFX: string }) => {
  if (activeVFX === 'vfx_none') return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {activeVFX === 'vfx_matrix' && (
        <div className="absolute inset-0 opacity-20 flex justify-around">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100 }}
              animate={{ y: ['0%', '100%'] }}
              transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
              className="text-lime-500 font-mono text-xs whitespace-pre leading-none"
            >
              {Array(20).fill(0).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('\n')}
            </motion.div>
          ))}
        </div>
      )}
      {activeVFX === 'vfx_gold_dust' && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 1000],
                x: Math.random() * 1000,
                rotate: 360,
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 10
              }}
              className="absolute w-1 h-1 bg-yellow-400 blur-[1px] rounded-full shadow-[0_0_10px_#facc15]"
              style={{ left: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      )}
      {activeVFX === 'vfx_cyber_glitch' && (
        <motion.div
          animate={{
            opacity: [0, 0.1, 0, 0.05, 0],
            x: [0, -5, 5, -2, 0],
            filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatDelay: Math.random() * 10 + 5
          }}
          className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"
        />
      )}
      {activeVFX === 'vfx_god_rays' && (
        <div className="absolute inset-x-0 top-0 h-full flex justify-center opacity-30">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                rotate: [i * 10 - 20, i * 10 - 25, i * 10 - 20]
              }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] w-32 h-[150%] bg-gradient-to-b from-white/40 to-transparent blur-3xl origin-top"
              style={{ left: `${20 + i * 15}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminTab, setAdminTab] = useState<'stats' | 'users' | 'system'>('stats');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [systemConfig, setSystemConfig] = useState<any>({
    maintenanceMode: false,
    announcement: '',
    globalMultiplier: 1
  });

  const [isProMode, setIsProMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setVisibleCount(24); // Reset visible count on new search
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
  const [showAuraPackModal, setShowAuraPackModal] = useState(false);
  const [auraPackUpgradeTrigger, setAuraPackUpgradeTrigger] = useState(0);

  // Handle Redirect Result for Mobile
  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect sign in error:', error);
    });
  }, []);


  // Fetch System Config
  useEffect(() => {
    const configRef = doc(db, 'system', 'config');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setSystemConfig(doc.data());
      } else {
        // Initialize config if it doesn't exist
        setDoc(configRef, {
          maintenanceMode: false,
          announcement: 'Welcome to PurePro4561! Good luck!',
          globalMultiplier: 1
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'system/config');
    });
    return () => unsubscribe();
  }, []);

  // Currencies & Customization
  const [balance, setBalance] = useState(1000); // Casino Chips
  const [tokens, setTokens] = useState(250); // Arcade Tokens
  const [ownedThemes, setOwnedThemes] = useState<string[]>(['default']);
  const [ownedBadges, setOwnedBadges] = useState<string[]>([]);
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>(['avatar_default']);
  const [ownedVFX, setOwnedVFX] = useState<string[]>(['vfx_none']);
  const [activeAvatar, setActiveAvatar] = useState('avatar_default');
  const [activeVFX, setActiveVFX] = useState('vfx_none');
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>('default');
  const [shopTab, setShopTab] = useState<'themes' | 'badges' | 'avatars' | 'vfx' | 'exchange'>('themes');
  const [rewardMessage, setRewardMessage] = useState('');
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const [adsWatchedWithoutWin, setAdsWatchedWithoutWin] = useState(0);
  
  // Aura Pack State
  const [auraPackPityTimer, setAuraPackPityTimer] = useState(0);
  const [avatarPackPityTimer, setAvatarPackPityTimer] = useState(0);
  const [vfxPackPityTimer, setVfxPackPityTimer] = useState(0);
  const [activePackType, setActivePackType] = useState<PackType>('AURA');
  const [keyFragments, setKeyFragments] = useState(0);

  // Bet History
  const [betHistory, setBetHistory] = useState<{id: string, date: string, amount: number, winnings: number, game: string, type: string}[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Game State
  const [launchingGame, setLaunchingGame] = useState<string | number | null>(null);
  const [activeGame, setActiveGame] = useState<string | number | null>(null);

  const gamesSectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            // Create new user profile
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: firebaseUser.email === 'purepro4561@gmail.com' ? 'admin' : 'user',
              balance: 1000,
              tokens: 250,
              ownedThemes: ['default'],
              ownedBadges: [],
              ownedAvatars: ['avatar_default'],
              ownedVFX: ['vfx_none'],
              activeAvatar: 'avatar_default',
              activeVFX: 'vfx_none',
              activeTheme: 'default',
              adsWatchedToday: 0,
              adsWatchedWithoutWin: 0,
              keyFragments: 0,
              isProMode: false
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          } else {
            setUserProfile(userSnap.data());
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync state with userProfile
  useEffect(() => {
    if (userProfile) {
      setBalance(userProfile.balance);
      setTokens(userProfile.tokens);
      setOwnedThemes(userProfile.ownedThemes);
      setOwnedBadges(userProfile.ownedBadges);
      setOwnedAvatars(userProfile.ownedAvatars);
      setOwnedVFX(userProfile.ownedVFX);
      setActiveAvatar(userProfile.activeAvatar);
      setActiveVFX(userProfile.activeVFX);
      setActiveTheme(userProfile.activeTheme);
      setAdsWatchedToday(userProfile.adsWatchedToday);
      setAdsWatchedWithoutWin(userProfile.adsWatchedWithoutWin);
      setKeyFragments(userProfile.keyFragments);
      setIsProMode(userProfile.isProMode);
    }
  }, [userProfile]);

  // Real-time listener for user profile
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data());
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Real-time listener for bet history
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'bets'),
        where('uid', '==', user.uid),
        orderBy('date', 'desc'),
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        setBetHistory(history);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bets');
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleSignIn = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveGame(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateFirestoreProfile = async (updates: any) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSetBalance = (updater: number | ((prev: number) => number)) => {
    setBalance(prev => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      updateFirestoreProfile({ balance: newVal });
      return newVal;
    });
  };

  const handleSetTokens = (updater: number | ((prev: number) => number)) => {
    setTokens(prev => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      updateFirestoreProfile({ tokens: newVal });
      return newVal;
    });
  };

  const recordBet = async (amount: number, winnings: number, game: string, type: 'chips' | 'tokens' = 'chips') => {
    if (!user) return;
    const newBet = {
      uid: user.uid,
      date: new Date().toISOString(),
      amount,
      winnings,
      game,
      type
    };
    try {
      await addDoc(collection(db, 'bets'), newBet);
      // Award tokens if playing with chips and winning
      if (type === 'chips' && winnings > 0) {
        const tokenReward = Math.floor(winnings / 100); // 1% of winnings
        if (tokenReward > 0) {
          handleSetTokens(t => t + tokenReward);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bets');
    }
  };

  const fetchAdminStats = async () => {
    if (!userProfile || userProfile.role !== 'admin') return;
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const betsSnap = await getDocs(collection(db, 'bets'));
      
      const totalUsers = usersSnap.size;
      const totalBets = betsSnap.size;
      let totalVolume = 0;
      betsSnap.forEach(doc => {
        totalVolume += doc.data().amount;
      });

      setAdminStats({
        totalUsers,
        totalBets,
        totalVolume
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_stats');
    }
  };

  const fetchAllUsers = async () => {
    if (userProfile?.role !== 'admin') return;
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      setAllUsers(usersSnap.docs.map(doc => doc.data()));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'admin/users');
    }
  };

  const updateSystemConfig = async (newConfig: any) => {
    if (userProfile?.role !== 'admin') return;
    try {
      await setDoc(doc(db, 'system', 'config'), newConfig, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'system/config');
    }
  };

  const adjustUserCurrency = async (userId: string, amount: number, type: 'balance' | 'tokens') => {
    if (userProfile?.role !== 'admin') return;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentVal = userSnap.data()[type] || 0;
        await updateDoc(userRef, { [type]: currentVal + amount });
        if (userId === user?.uid) {
          if (type === 'balance') handleSetBalance(prev => prev + amount);
          else handleSetTokens(prev => prev + amount);
        }
        fetchAllUsers(); // Refresh list
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  };

  const toggleUserAds = async (userId: string, currentStatus: boolean) => {
    if (userProfile?.role !== 'admin') return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { adsEnabled: !currentStatus });
      fetchAllUsers(); // Refresh list
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  useEffect(() => {
    if (showAdminPanel) {
      fetchAdminStats();
      if (adminTab === 'users') fetchAllUsers();
    }
  }, [showAdminPanel, adminTab]);

  const handleToggleProMode = () => {
    if (isProMode) {
      setIsProMode(false);
      updateFirestoreProfile({ isProMode: false });
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

  const handleAuraPackReward = (reward: any) => {
    // Update Pity Timers
    if (activePackType === 'AVATAR') {
      if (reward.rarity === 'LEGENDARY') setAvatarPackPityTimer(0);
      else setAvatarPackPityTimer(prev => prev + 1);
    } else if (activePackType === 'AURA') {
      if (reward.rarity === 'LEGENDARY') setAuraPackPityTimer(0);
      else setAuraPackPityTimer(prev => prev + 1);
    } else if (activePackType === 'VFX') {
      if (reward.rarity === 'LEGENDARY') setVfxPackPityTimer(0);
      else setVfxPackPityTimer(prev => prev + 1);
    }

    if (reward.type === 'theme') {
      if (ownedThemes.includes(reward.id)) {
        // Duplicate Logic: Shatter into tokens
        setTokens(t => { const newT = t + 1500; updateFirestoreProfile({ tokens: newT }); return newT; });
        setRewardMessage(`Duplicate Aura shattered into 1,500 Tokens!`);
      } else {
        setOwnedThemes(prev => { const newT = [...prev, reward.id]; updateFirestoreProfile({ ownedThemes: newT }); return newT; });
        setRewardMessage(`Unlocked ${reward.name}!`);
      }
    } else if (reward.type === 'vfx') {
      if (ownedVFX.includes(reward.id)) {
        setTokens(t => { const newT = t + 1200; updateFirestoreProfile({ tokens: newT }); return newT; });
        setRewardMessage(`Duplicate VFX shattered into 1,200 Tokens!`);
      } else {
        setOwnedVFX(prev => { const newV = [...prev, reward.id]; updateFirestoreProfile({ ownedVFX: newV }); return newV; });
        setRewardMessage(`Unlocked ${reward.name}!`);
      }
    } else if (reward.type === 'avatar') {
      if (ownedAvatars.includes(reward.id)) {
        setTokens(t => { const newT = t + 1000; updateFirestoreProfile({ tokens: newT }); return newT; });
        setRewardMessage(`Duplicate Avatar shattered into 1,000 Tokens!`);
      } else {
        setOwnedAvatars(prev => { const newA = [...prev, reward.id]; updateFirestoreProfile({ ownedAvatars: newA }); return newA; });
        setRewardMessage(`Unlocked ${reward.name}!`);
      }
    } else if (reward.type === 'badge') {
      if (ownedBadges.includes(reward.id)) {
        setTokens(t => { const newT = t + 1500; updateFirestoreProfile({ tokens: newT }); return newT; });
        setRewardMessage(`Duplicate Badge shattered into 1,500 Tokens!`);
      } else {
        setOwnedBadges(prev => { const newB = [...prev, reward.id]; updateFirestoreProfile({ ownedBadges: newB }); return newB; });
        setRewardMessage(`Unlocked ${reward.name}!`);
      }
    } else if (reward.type === 'sfx') {
      // For now, just show a message. In a real app, we'd save this to state and use it in audio.ts
      setRewardMessage(`Unlocked Premium SFX: ${reward.name}!`);
    } else if (reward.type === 'fragment') {
      setKeyFragments(prev => {
        const newCount = prev + 1;
        if (newCount >= 5) {
          setIsProMode(true);
          updateFirestoreProfile({ isProMode: true, keyFragments: 0 });
          setRewardMessage(`5 Fragments Collected! VIP Key Forged!`);
          return 0;
        }
        updateFirestoreProfile({ keyFragments: newCount });
        setRewardMessage(`Key Fragment Found! (${newCount}/5)`);
        return newCount;
      });
    }
    
    setTimeout(() => setRewardMessage(''), 4000);
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.toUpperCase() === generatedKey && generatedKey !== '') {
      setIsProMode(true);
      updateFirestoreProfile({ isProMode: true });
      setShowKeyModal(false);
    } else {
      setKeyError(true);
      setKeyInput('');
    }
  };

  const watchAdForKey = () => {
    if (userProfile?.adsEnabled === false) {
      const newKey = "PRO-" + Math.floor(1000 + Math.random() * 9000);
      setGeneratedKey(newKey);
      return;
    }
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

  const watchAdWithCallback = (callback: () => void) => {
    if (userProfile?.adsEnabled === false) {
      callback();
      setAdsWatchedToday(prev => prev + 1);
      return;
    }
    setShowAdModal(true);
    setAdProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setAdProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          callback();
          setShowAdModal(false);
          setAdsWatchedToday(prev => prev + 1);
        }, 500);
      }
    }, 100);
  };

  const handleUpgradePack = () => {
    watchAdWithCallback(() => {
      // The modal will handle the re-roll logic if we trigger a state change or just re-open it
      // But it's easier to just let the modal know it's upgraded
      setRewardMessage('Pack Upgraded to EPIC!');
      setTimeout(() => setRewardMessage(''), 3000);
    });
  };

  const watchAd = () => {
    watchAdWithCallback(() => {
      const baseReward = 500;
      const reward = Math.floor(baseReward * Math.pow(1.2, adsWatchedToday));
      
      if (isProMode) {
        handleSetBalance(b => b + reward);
        setRewardMessage(`+${reward.toLocaleString()} Chips Earned!`);
      } else {
        handleSetTokens(t => t + reward);
        setRewardMessage(`+${reward.toLocaleString()} Tokens Earned!`);
      }
      setAdsWatchedWithoutWin(prev => prev + 1);
      setTimeout(() => setRewardMessage(''), 3000);
    });
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
    
    let filtered = activeGames;
    if (query !== '') {
      filtered = activeGames.filter(g => 
        g.title.toLowerCase().includes(query) || 
        g.category.toLowerCase().includes(query)
      );
    }
    
    return filtered.slice(0, visibleCount);
  }, [debouncedSearchQuery, activeGames, visibleCount]);

  const totalFilteredGames = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (query === '') return activeGames.length;
    return activeGames.filter(g => 
      g.title.toLowerCase().includes(query) || 
      g.category.toLowerCase().includes(query)
    ).length;
  }, [debouncedSearchQuery, activeGames]);

  const currentThemeConfig = THEMES[activeTheme];
  const themeGradient = currentThemeConfig.gradient;
  const themeColor = currentThemeConfig.primary;
  const themeColors = currentThemeConfig.colors;
  const themeGlow = currentThemeConfig.glow;

  if (hash === '#/privacy') {
    return <PrivacyPolicy />;
  }

  if (hash === '#/tos') {
    return <TermsOfService />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-700">
      {/* Maintenance Mode Overlay */}
      {systemConfig.maintenanceMode && userProfile?.role !== 'admin' && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-amber-500/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">System Maintenance</h1>
          <p className="text-zinc-400 max-w-md leading-relaxed mb-8">
            We are currently performing scheduled upgrades to the core engine. All systems are temporarily offline.
          </p>
          <div className="px-6 py-3 bg-zinc-900 rounded-2xl border border-white/5 font-mono text-sm text-zinc-500">
            ESTIMATED DOWNTIME: 2 HOURS
          </div>
        </div>
      )}

      {/* Announcement Bar */}
      {systemConfig.announcement && (
        <div className="bg-amber-500 text-zinc-950 py-2 px-4 text-center font-bold text-sm tracking-tight relative z-50 overflow-hidden">
          <motion.div
            animate={{ x: [1000, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap inline-block"
          >
            {systemConfig.announcement} • {systemConfig.announcement} • {systemConfig.announcement}
          </motion.div>
        </div>
      )}

      <VFXOverlay activeVFX={activeVFX} />
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
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-500/10 pl-3 pr-1 py-1 rounded-full border border-amber-500/20 text-amber-400 font-mono text-sm">
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
              <div className="flex items-center gap-2 bg-zinc-800/50 pl-3 pr-1 py-1 rounded-full border border-white/10 text-zinc-300 font-mono text-sm">
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
            </div>
            
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

            {/* Active Avatar */}
            {user ? (
              <div className="flex items-center gap-4">
                {userProfile?.role === 'admin' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAdminPanel(true)}
                    className="p-2 bg-zinc-900 border border-amber-500/30 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors"
                    title="Admin Panel"
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </motion.button>
                )}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowShopModal(true)}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 p-1.5 cursor-pointer flex items-center justify-center relative group"
                >
                  <div className="w-full h-full">
                    {AVATARS[activeAvatar as keyof typeof AVATARS].icon}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime-500 rounded-full border-2 border-zinc-950" />
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSignOut}
                  className="p-2 bg-zinc-900 border border-white/10 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className={`px-6 py-2 rounded-xl bg-gradient-to-r ${themeGradient} text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg`}
              >
                <User className="w-4 h-4" /> Sign In
              </motion.button>
            )}

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="md:hidden p-2 text-zinc-400 hover:text-zinc-100">
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {activeGame ? (
        !user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full bg-zinc-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex flex-col items-center text-center max-w-md"
            >
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                <ShieldAlert className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Authentication Required</h2>
              <p className="text-zinc-400 mb-10 leading-relaxed">
                You must be signed in to place bets, earn tokens, and save your progress. Initialize your session to continue.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className={`px-10 py-4 rounded-2xl bg-gradient-to-r ${themeGradient} text-zinc-950 font-black text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-3`}
              >
                <User className="w-6 h-6" /> SIGN IN WITH GOOGLE
              </motion.button>
              <button 
                onClick={() => setActiveGame(null)}
                className="mt-8 text-zinc-500 hover:text-zinc-300 text-sm font-mono uppercase tracking-widest transition-colors"
              >
                Return to Lobby
              </button>
            </motion.div>
          </div>
        ) : activeGame === 'custom-101' || activeGame === 'custom-202' || activeGame === 'custom-108' ? (
          <Slots 
            balance={balance} 
            setBalance={handleSetBalance} 
            onExit={() => setActiveGame(null)} 
            themeGradient={themeGradient} 
            themeColor={themeColor} 
            onRecordBet={recordBet}
            onWatchAd={watchAd}
            adsWatchedToday={adsWatchedToday}
            adsWatchedWithoutWin={adsWatchedWithoutWin}
            resetPityTimer={() => setAdsWatchedWithoutWin(0)}
            globalMultiplier={systemConfig.globalMultiplier * (activeGame === 'custom-202' ? 2 : activeGame === 'custom-108' ? 1.5 : 1)}
          />
        ) : activeGame === 'custom-102' ? (
          <Blackjack 
            balance={balance} 
            setBalance={handleSetBalance} 
            onExit={() => setActiveGame(null)} 
            themeGradient={themeGradient} 
            themeColor={themeColor} 
            onRecordBet={recordBet} 
            globalMultiplier={systemConfig.globalMultiplier}
          />
        ) : activeGame === 'custom-201' ? (
          <Plinko
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={systemConfig.globalMultiplier}
          />
        ) : activeGame === 'custom-104' || activeGame === 'custom-203' ? (
          <Roulette
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={systemConfig.globalMultiplier}
            isVIP={activeGame === 'custom-203'}
          />
        ) : activeGame === 'custom-103' || activeGame === 'custom-204' || activeGame === 'custom-107' ? (
          <Poker
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={systemConfig.globalMultiplier}
            isHighStakes={activeGame === 'custom-204' || activeGame === 'custom-107'}
          />
        ) : activeGame === 'custom-105' ? (
          <Craps
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={systemConfig.globalMultiplier}
          />
        ) : activeGame === 'custom-106' ? (
          <Baccarat
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={systemConfig.globalMultiplier}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full">
            <button 
              onClick={handleReturnToLobby}
              className="absolute top-20 left-6 z-50 px-4 py-2 bg-zinc-900/80 backdrop-blur rounded-xl border border-white/10 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Lobby
            </button>
            <div className="text-center">
              <Gamepad2 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-widest">Game Loading...</h3>
            </div>
          </div>
        )
      ) : (
        <>
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
                <span className="text-zinc-500 font-mono text-sm">{totalFilteredGames} MODULES</span>
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
                <>
                  <motion.div
                    key={isProMode ? 'adult-grid' : 'standard-grid'}
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                  {displayedGames.length > 0 ? (
                    displayedGames.map((game) => (
                      <motion.div
                        key={game.id}
                        variants={{
                          hidden: { opacity: 0, y: 30, scale: 0.9 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                        }}
                        whileHover={{ y: -8, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={playHover}
                        onClick={() => { playClick(); handlePlayGame(game.id); }}
                        className={`group relative bg-zinc-900/40 backdrop-blur-sm border rounded-3xl p-4 cursor-pointer overflow-hidden transition-colors dynamic-glow-box-hover ${launchingGame === game.id ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'border-white/5 hover:border-white/20'}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                        <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${themeGradient} p-1 mb-4 relative`}>
                          <div className="w-full h-full bg-zinc-950/90 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <motion.div
                              whileHover={{ scale: 1.15, rotate: isProMode ? 5 : -5 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className={`w-full h-full flex items-center justify-center transition-all duration-500 ${launchingGame === game.id ? 'scale-110 blur-sm opacity-40' : ''}`}
                            >
                              <GameImage 
                                src={game.image} 
                                alt={game.title} 
                                icon={game.icon}
                                className="w-full h-full"
                              />
                            </motion.div>
                            
                            <AnimatePresence>
                              {launchingGame === game.id && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-zinc-950/40 backdrop-blur-[2px]"
                                >
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                    className="flex flex-col items-center"
                                  >
                                    <Loader2 className="w-10 h-10 text-white animate-spin mb-4 drop-shadow-lg" />
                                    <div className="w-24 h-1.5 bg-black/60 rounded-full overflow-hidden backdrop-blur-md border border-white/10">
                                      <motion.div 
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                        className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                      />
                                    </div>
                                    <span className="text-[10px] font-mono text-white/80 mt-2 tracking-widest uppercase">Initializing</span>
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
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
                  </motion.div>
                
                  {displayedGames.length > 0 && visibleCount < totalFilteredGames && (
                    <div className="mt-12 flex justify-center">
                      <button
                        onClick={() => setVisibleCount(prev => prev + 24)}
                        onMouseEnter={playHover}
                        className="px-8 py-3 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 font-bold transition-all hover:bg-zinc-800"
                      >
                        Load More Games
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>

          <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-4">
                  <Gamepad2 className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`} />
                  <span className="text-xl font-black text-white tracking-tighter uppercase">PUREPRO CASINO</span>
                </div>
                <p className="text-zinc-500 text-sm font-mono max-w-xs text-center md:text-left">
                  The ultimate high-stakes digital playground. Play responsibly.
                </p>
              </div>
              
              <div className="flex gap-8">
                <a href="#/privacy" className="text-zinc-500 hover:text-zinc-300 text-xs font-mono uppercase tracking-widest transition-colors">Privacy Policy</a>
                <a href="#/tos" className="text-zinc-500 hover:text-zinc-300 text-xs font-mono uppercase tracking-widest transition-colors">Terms of Service</a>
              </div>

              <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em]">
                © 2026 PUREPRO DIGITAL // ALL RIGHTS RESERVED
              </div>
            </div>
          </footer>
        </>
      )}

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
                  Badges & Auras
                </button>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setShopTab('avatars'); }}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${shopTab === 'avatars' ? 'text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  style={shopTab === 'avatars' ? { backgroundColor: themeColor } : {}}
                >
                  Avatars
                </button>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); setShopTab('vfx'); }}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${shopTab === 'vfx' ? 'text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  style={shopTab === 'vfx' ? { backgroundColor: themeColor } : {}}
                >
                  VFX Packs
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
                          onClick={() => { playClick(); setActiveTheme(id as keyof typeof THEMES); updateFirestoreProfile({ activeTheme: id }); }} 
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
                              handleSetTokens(t => t - theme.price);
                              setOwnedThemes(prev => { const newT = [...prev, id]; updateFirestoreProfile({ ownedThemes: newT }); return newT; });
                              setRewardMessage(`Unlocked ${theme.name}!`);
                              setTimeout(() => setRewardMessage(''), 3000);
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

                {shopTab === 'badges' && (
                  <>
                    {/* Aura Pack - The Token Sink */}
                    <div className="bg-zinc-950 border border-purple-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.2)] md:col-span-2 mb-4">
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg z-10">PREMIUM LOOT</div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden group">
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-purple-500 blur-xl"
                          />
                          <Sparkles className="w-8 h-8 text-white relative z-10 group-hover:animate-spin-slow" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-100 text-lg">Aura Pack</h4>
                          <p className="text-xs text-zinc-400">Unlock Auras, Premium SFX, Prestige Badges, or Key Fragments.</p>
                          <p className="text-sm font-mono text-lime-500 flex items-center gap-1 mt-1">
                            <Ticket className="w-3 h-3" /> 1,500
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (tokens >= 1500) {
                              playClick();
                              handleSetTokens(t => t - 1500);
                              setActivePackType('AURA');
                              setShowShopModal(false);
                              setShowAuraPackModal(true);
                            } else {
                              playLose();
                              setRewardMessage('Need 1,500 Tokens!');
                              setTimeout(() => setRewardMessage(''), 3000);
                            }
                          }}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm transition-colors hover:scale-105 whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        >
                          BUY PACK
                        </button>
                      </div>
                    </div>

                    {/* Siege Pack Psychology: Currency Devaluation via Aura Packs */}
                    <div className="bg-zinc-950 border border-amber-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.2)] md:col-span-2">
                      <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded-bl-lg z-10">LIMITED EDITION</div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-inner relative overflow-hidden">
                          <Sparkles className="absolute w-full h-full text-white/30 animate-pulse" />
                          <span className="text-white font-black text-xs tracking-widest drop-shadow-md z-10">GOD</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-100 text-lg">God Aura Pack</h4>
                          <p className="text-xs text-zinc-400">The ultimate flex. Drains your balance but makes you look like a high roller.</p>
                          <p className="text-sm font-mono text-amber-500 flex items-center gap-1 mt-1">
                            <Coins className="w-3 h-3" /> 2,500
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (ownedThemes.includes('godAura')) return;
                            if (balance >= 2500) {
                              playCoin();
                              handleSetBalance(b => b - 2500);
                              setActivePackType('GOD');
                              setShowShopModal(false);
                              setShowAuraPackModal(true);
                            } else {
                              playLose();
                              setRewardMessage('Need 2,500 Chips!');
                              setTimeout(() => setRewardMessage(''), 3000);
                            }
                          }}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm transition-colors whitespace-nowrap shadow-lg hover:scale-105 active:scale-95"
                        >
                          {ownedThemes.includes('godAura') ? 'OWNED' : 'BUY AURA'}
                        </button>
                      </div>
                    </div>

                    {Object.entries(BADGES).map(([id, badge]) => {
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
                                  if (isChips) handleSetBalance(b => b - badge.price);
                                  else handleSetTokens(t => t - badge.price);
                                  setOwnedBadges(prev => { const newB = [...prev, id]; updateFirestoreProfile({ ownedBadges: newB }); return newB; });
                                  setRewardMessage(`Unlocked ${badge.name}!`);
                                  setTimeout(() => setRewardMessage(''), 3000);
                                }
                              }}
                              disabled={!canAfford}
                              className="px-4 py-2 rounded-xl text-zinc-950 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              style={{ backgroundColor: themeColor }}
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}

                {shopTab === 'avatars' && (
                  <>
                    {/* Avatar Pack */}
                    <div className="bg-zinc-950 border border-blue-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.2)] md:col-span-2 mb-4">
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg z-10">IDENTITY PACK</div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden group">
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-blue-500 blur-xl"
                          />
                          <User className="w-8 h-8 text-white relative z-10 group-hover:animate-bounce" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-100 text-lg">Avatar Pack</h4>
                          <p className="text-xs text-zinc-400">Unlock unique profile avatars and rare identity icons.</p>
                          <p className="text-sm font-mono text-lime-500 flex items-center gap-1 mt-1">
                            <Ticket className="w-3 h-3" /> 1,000
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (tokens >= 1000) {
                              playClick();
                              handleSetTokens(t => t - 1000);
                              setActivePackType('AVATAR');
                              setShowShopModal(false);
                              setShowAuraPackModal(true);
                            } else {
                              playLose();
                              setRewardMessage('Need 1,000 Tokens!');
                              setTimeout(() => setRewardMessage(''), 3000);
                            }
                          }}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-sm transition-colors hover:scale-105 whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        >
                          BUY PACK
                        </button>
                      </div>
                    </div>

                    {/* VFX Pack */}
                    <div className="bg-zinc-950 border border-emerald-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)] md:col-span-2 mb-4">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg z-10">VISUALS</div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden group">
                          <Zap className="w-8 h-8 text-emerald-400 relative z-10 group-hover:animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-100 text-lg">VFX Pack</h4>
                          <p className="text-xs text-zinc-400">Unlock screen effects, particle trails, and win animations.</p>
                          <p className="text-sm font-mono text-lime-500 flex items-center gap-1 mt-1">
                            <Ticket className="w-3 h-3" /> 1,200
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (tokens >= 1200) {
                              playClick();
                              handleSetTokens(t => t - 1200);
                              setActivePackType('VFX');
                              setShowShopModal(false);
                              setShowAuraPackModal(true);
                            } else {
                              playLose();
                              setRewardMessage('Need 1,200 Tokens!');
                              setTimeout(() => setRewardMessage(''), 3000);
                            }
                          }}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm transition-colors hover:scale-105 whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        >
                          BUY PACK
                        </button>
                      </div>
                    </div>

                    {Object.entries(AVATARS).map(([id, avatar]) => {
                      const isOwned = ownedAvatars.includes(id);
                      const isActive = activeAvatar === id;
                      return (
                        <div key={id} className={`bg-zinc-950 border ${isActive ? 'border-blue-500/50' : 'border-white/5'} rounded-2xl p-6 flex items-center justify-between transition-colors`}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 p-2 flex items-center justify-center">
                              {avatar.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-zinc-100">{avatar.name}</h4>
                              <p className={`text-[10px] font-black tracking-widest uppercase ${
                                avatar.rarity === 'LEGENDARY' ? 'text-yellow-400' : 
                                avatar.rarity === 'EPIC' ? 'text-purple-400' : 'text-zinc-500'
                              }`}>
                                {avatar.rarity}
                              </p>
                            </div>
                          </div>
                          {isActive ? (
                            <span className="px-4 py-2 rounded-xl font-bold text-sm border border-blue-500/30 bg-blue-500/10 text-blue-400">Active</span>
                          ) : isOwned ? (
                            <button 
                              onMouseEnter={playHover}
                              onClick={() => { playClick(); setActiveAvatar(id); updateFirestoreProfile({ activeAvatar: id }); }} 
                              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-colors"
                            >
                              Equip
                            </button>
                          ) : (
                            <span className="text-xs font-mono text-zinc-600 uppercase tracking-tighter">Locked</span>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}

                {shopTab === 'vfx' && Object.entries(VFX_EFFECTS).map(([id, vfx]) => {
                  const isOwned = ownedVFX.includes(id);
                  const isActive = activeVFX === id;
                  return (
                    <div key={id} className={`bg-zinc-950 border ${isActive ? 'border-emerald-500/50' : 'border-white/5'} rounded-2xl p-6 flex items-center justify-between transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                          <Zap className={`w-6 h-6 ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100">{vfx.name}</h4>
                          <p className="text-sm font-mono text-zinc-500">{vfx.rarity}</p>
                        </div>
                      </div>
                      {isActive ? (
                        <span className="px-4 py-2 rounded-xl font-bold text-sm border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</span>
                      ) : isOwned ? (
                        <button 
                          onMouseEnter={playHover}
                          onClick={() => { playClick(); setActiveVFX(id); updateFirestoreProfile({ activeVFX: id }); }} 
                          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-colors"
                        >
                          Activate
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-xs font-mono">Pack Only</span>
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
                            if (isChips) handleSetBalance(b => b - item.price);
                            else handleSetTokens(t => t - item.price);
                            
                            if (item.rewardCurrency === 'chips') handleSetBalance(b => b + item.reward);
                            else handleSetTokens(t => t + item.reward);
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

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-amber-500/30 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.1)]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Admin Control Center</h2>
                    <p className="text-zinc-500 text-sm font-mono tracking-tighter uppercase">System Oversight // Authorized Personnel Only</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdminPanel(false)}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-white/5 transition-colors"
                >
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Admin Tabs */}
                <div className="flex gap-2 mb-8 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
                  <button 
                    onClick={() => setAdminTab('stats')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'stats' ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setAdminTab('users')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'users' ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                  >
                    User Management
                  </button>
                  <button 
                    onClick={() => setAdminTab('system')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'system' ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                  >
                    System Settings
                  </button>
                </div>

                {adminTab === 'stats' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center gap-3 text-zinc-400 mb-2">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Total Users</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{adminStats?.totalUsers || '...'}</div>
                      </div>
                      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center gap-3 text-zinc-400 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Total Bets</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{adminStats?.totalBets || '...'}</div>
                      </div>
                      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center gap-3 text-zinc-400 mb-2">
                          <Database className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Total Volume</span>
                        </div>
                        <div className="text-3xl font-bold text-amber-500">${adminStats?.totalVolume?.toLocaleString() || '...'}</div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 mb-8">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        Quick Actions (My Account)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => adjustUserCurrency(user?.uid || '', 10000, 'balance')}
                          className="flex items-center justify-between p-6 bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl border border-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                              <Coins className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white">Add $10,000 Chips</div>
                              <div className="text-xs text-zinc-500">Instant balance injection</div>
                            </div>
                          </div>
                          <Zap className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button 
                          onClick={() => adjustUserCurrency(user?.uid || '', 5000, 'tokens')}
                          className="flex items-center justify-between p-6 bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl border border-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-lime-500/10 flex items-center justify-center">
                              <Ticket className="w-6 h-6 text-lime-500" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white">Add 5,000 Tokens</div>
                              <div className="text-xs text-zinc-500">Instant token injection</div>
                            </div>
                          </div>
                          <Zap className="w-5 h-5 text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {adminTab === 'users' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Users className="w-5 h-5 text-zinc-400" />
                          Registered Users ({allUsers.length})
                        </h3>
                        <div className="flex items-center gap-3 flex-1 max-w-md">
                          <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input 
                              type="text"
                              placeholder="Search by email or UID..."
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                          </div>
                          <button 
                            onClick={fetchAllUsers}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-white/5 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4 text-zinc-400" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {allUsers
                          .filter(u => 
                            u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                            u.uid?.toLowerCase().includes(userSearchQuery.toLowerCase())
                          )
                          .map((u) => (
                          <div key={u.uid} className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-zinc-900/50 rounded-3xl border border-white/5 gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                {AVATARS[u.activeAvatar as keyof typeof AVATARS]?.icon || <User className="w-6 h-6 text-zinc-600" />}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                                  {u.email}
                                  {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">UID: {u.uid.slice(0, 8)}...</div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Video className={`w-3 h-3 ${u.adsEnabled !== false ? 'text-emerald-500' : 'text-zinc-500'}`} />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ads</span>
                                </div>
                                <button 
                                  onClick={() => toggleUserAds(u.uid, u.adsEnabled !== false)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${u.adsEnabled !== false ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-white/5'}`}
                                >
                                  {u.adsEnabled !== false ? 'Enabled' : 'Disabled'}
                                </button>
                              </div>

                              <div className="text-right min-w-[100px]">
                                <div className="text-xs font-mono text-amber-500">${u.balance?.toLocaleString()}</div>
                                <div className="text-xs font-mono text-lime-500">{u.tokens?.toLocaleString()} TK</div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Chips</span>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => adjustUserCurrency(u.uid, 1000, 'balance')}
                                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 text-amber-500 transition-colors text-xs"
                                    >
                                      +$1k
                                    </button>
                                    <button 
                                      onClick={() => adjustUserCurrency(u.uid, -1000, 'balance')}
                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-red-500 transition-colors text-xs"
                                    >
                                      -$1k
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Tickets</span>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => adjustUserCurrency(u.uid, 500, 'tokens')}
                                      className="p-2 bg-lime-500/10 hover:bg-lime-500/20 rounded-xl border border-lime-500/20 text-lime-500 transition-colors text-xs"
                                    >
                                      +500
                                    </button>
                                    <button 
                                      onClick={() => adjustUserCurrency(u.uid, -500, 'tokens')}
                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-red-500 transition-colors text-xs"
                                    >
                                      -500
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {adminTab === 'system' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-zinc-400" />
                          Global Controls
                        </h3>
                        <div className="space-y-4">
                          <button 
                            onClick={() => updateSystemConfig({ maintenanceMode: !systemConfig.maintenanceMode })}
                            className="flex items-center justify-between w-full p-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl border border-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <AlertTriangle className={`w-5 h-5 ${systemConfig.maintenanceMode ? 'text-red-500' : 'text-zinc-500'}`} />
                              <span className="font-bold text-zinc-300">Maintenance Mode</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${systemConfig.maintenanceMode ? 'bg-red-500 justify-end' : 'bg-zinc-700 justify-start'}`}>
                              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                          </button>
                          <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Global Multiplier</div>
                            <div className="flex items-center gap-4">
                              <input 
                                type="range" 
                                min="0.5" 
                                max="5" 
                                step="0.1" 
                                value={systemConfig.globalMultiplier || 1}
                                onChange={(e) => updateSystemConfig({ globalMultiplier: parseFloat(e.target.value) })}
                                className="flex-1 accent-amber-500"
                              />
                              <span className="font-mono font-bold text-amber-500">{systemConfig.globalMultiplier || 1}x</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          Global Announcement
                        </h3>
                        <div className="space-y-4">
                          <textarea 
                            value={systemConfig.announcement || ''}
                            onChange={(e) => updateSystemConfig({ announcement: e.target.value })}
                            placeholder="Enter system-wide message..."
                            className="w-full h-32 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                          />
                          <button 
                            onClick={() => updateSystemConfig({ announcement: '' })}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-xl border border-white/5 transition-colors"
                          >
                            Clear Announcement
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-6 bg-zinc-900/50 border-t border-white/5 text-center">
                <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">End of Admin Session // Secure Logout Recommended</p>
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
      {/* Aura Pack Modal */}
      <AnimatePresence>
        {showAuraPackModal && (
          <AuraPackModal 
            onClose={() => setShowAuraPackModal(false)} 
            onReward={handleAuraPackReward}
            onWatchAd={() => {
              watchAdWithCallback(() => {
                setAuraPackUpgradeTrigger(prev => prev + 1);
              });
            }}
            pityTimer={activePackType === 'AVATAR' ? avatarPackPityTimer : auraPackPityTimer}
            packType={activePackType}
            upgradeTrigger={auraPackUpgradeTrigger}
          />
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
