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
  RefreshCw,
  Megaphone,
  Trophy,
  Target,
  Flame,
  Gift,
  Star,
  Tag,
  Activity,
  Settings2,
  Trash2,
  MessageSquare,
  UserPlus,
  UserMinus,
  Check,
  Ban,
  MessageCircle
} from 'lucide-react';

import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { BAD_WORDS } from './constants';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where, orderBy, limit, getDocs, writeBatch } from 'firebase/firestore';

import Slots from './games/Slots';
import Blackjack from './games/Blackjack';
import Plinko from './games/Plinko';
import Roulette from './games/Roulette';
import Poker from './games/Poker';
import Craps from './games/Craps';
import Baccarat from './games/Baccarat';
import GameImage from './components/GameImage';
import AuraPackModal, { PackType } from './components/AuraPackModal';
import ChatModal from './components/ChatModal';
import { playClick, playHover, playCoin, playLose } from './audio';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  vfx_casino_glitter: { name: 'Casino Glitter', rarity: 'LEGENDARY' },
  vfx_heartbeat: { name: 'Heartbeat Pulse', rarity: 'EPIC' },
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
      {activeVFX === 'vfx_casino_glitter' && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 1000],
                x: [Math.random() * 1000, Math.random() * 1000 + 50],
                scale: [1, 1.5, 1],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute text-xl font-bold"
              style={{ left: `${Math.random() * 100}%`, color: ['#fbbf24', '#f59e0b', '#fff'][Math.floor(Math.random() * 3)] }}
            >
              {['✨', '💎', '🎰', '💰', '7'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}
      {activeVFX === 'vfx_heartbeat' && (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-red-600/10 shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]"
        />
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
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  const [gameSettings, setGameSettings] = useState<Record<string, any>>({});
  const [gameStats, setGameStats] = useState<Record<string, any>>({});

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
  const [adminTab, setAdminTab] = useState<'stats' | 'economy' | 'users' | 'promos' | 'live' | 'system'>('stats');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSort, setUserSort] = useState<'none' | 'hours' | 'online'>('none');
  const [newNickname, setNewNickname] = useState('');
  const [systemConfig, setSystemConfig] = useState<any>({
    maintenanceMode: false,
    announcement: '',
    globalMultiplier: 1
  });

  const [isProMode, setIsProMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  
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

  // New Engagement States
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loginStreak, setLoginStreak] = useState(0);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyReward, setDailyReward] = useState(0);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [quests, setQuests] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [globalWins, setGlobalWins] = useState<any[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoInput, setPromoInput] = useState('');

  // Admin states
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoRewardType, setNewPromoRewardType] = useState<string>('balance');
  const [newPromoRewardAmount, setNewPromoRewardAmount] = useState(1000);
  const [newPromoDuration, setNewPromoDuration] = useState<number>(60);
  const [newPromoPackType, setNewPromoPackType] = useState<string>('AVATAR');
  const [liveBetsFeed, setLiveBetsFeed] = useState<any[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChat, setShowChat] = useState<{isOpen: boolean, friendId: string, chatName: string}>({isOpen: false, friendId: '', chatName: ''});
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [socialTab, setSocialTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [socialSearchQuery, setSocialSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

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
              nickname: firebaseUser.email?.split('@')[0] || 'User',
              nicknameLower: (firebaseUser.email?.split('@')[0] || 'user').toLowerCase(),
              role: firebaseUser.email === 'purepro4561@gmail.com' ? 'admin' : 'user',
              username: firebaseUser.email?.split('@')[0] || 'User',
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
              isProMode: false,
              lastSeen: Date.now(),
              totalTimeSpent: 0,
              xp: 0,
              level: 1,
              loginStreak: 1,
              lastLoginDate: new Date().toDateString(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
            setShowDailyModal(true);
            setDailyReward(500); // 1st day reward
          } else {
            const data = userSnap.data();
            if (data.isSuspended) {
              setRewardMessage('Account Suspended. Contact support.');
              auth.signOut();
              return;
            }

            const today = new Date().toDateString();
            
            // Daily Login Logic
            let currentStreak = data.loginStreak || 0;
            let showDaily = false;
            let reward = 0;
            
            if (data.lastLoginDate !== today) {
              const lastLogin = new Date(data.lastLoginDate || 0);
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (lastLogin.toDateString() === yesterday.toDateString()) {
                currentStreak += 1;
              } else {
                currentStreak = 1;
              }
              
              showDaily = true;
              reward = currentStreak * 500; // 500 linearly increasing
              
              const newQuests = [
                { id: `q-${Date.now()}-1`, title: 'Play 50 Hands', desc: 'Play any card game 50 times.', target: 50, progress: 0, rewardType: 'keyFragments', rewardAmount: 1, completed: false },
                { id: `q-${Date.now()}-2`, title: 'High Roller', desc: 'Wager $10,000 total today.', target: 10000, progress: 0, rewardType: 'balance', rewardAmount: 5000, completed: false }
              ];

              const updates = {
                loginStreak: currentStreak,
                lastLoginDate: today,
                balance: (data.balance || 0) + reward,
                quests: newQuests
              };
              await updateDoc(userRef, updates);
              
              Object.assign(data, updates);
              setShowDailyModal(true);
              setDailyReward(reward);
              setQuests(newQuests);
            } else {
               setQuests(data.quests || []);
            }

            if (!data.nicknameLower) {
              const lower = (data.nickname || data.email?.split('@')[0] || 'user').toLowerCase();
              await updateDoc(userRef, { nicknameLower: lower });
              data.nicknameLower = lower;
            }

            if (!data.nickname) {
              setShowNicknameModal(true);
            }

            setUserProfile(data);
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
      setXp(userProfile.xp || 0);
      setLevel(userProfile.level || 1);
      setLoginStreak(userProfile.loginStreak || 0);
    }
  }, [userProfile]);

  // Activity Tracking
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      updateFirestoreProfile({
        lastSeen: Date.now(),
        totalTimeSpent: (userProfile?.totalTimeSpent || 0) + 60000
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [user, userProfile]);

  // Real-time listener for user profile
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile(data);
          if (!data.nickname && !showNicknameModal) {
            setShowNicknameModal(true);
          }
          // Sync to public profiles for search index
          if (data.nickname) {
            const lastSync = data.lastProfileSync || 0;
            if (Date.now() - lastSync > 3600000) { // Every hour sync
              setDoc(doc(db, 'profiles', user.uid), {
                uid: user.uid,
                nickname: data.nickname,
                nicknameLower: data.nicknameLower || data.nickname.toLowerCase(),
                timestamp: Date.now()
              }, { merge: true }).then(() => {
                updateDoc(doc(db, 'users', user.uid), { lastProfileSync: Date.now() });
              });
            }
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Real-time listener for settings & stats
  useEffect(() => {
    const unsubSettings = onSnapshot(collection(db, 'game_settings'), (snap) => {
      const settings: Record<string, any> = {};
      snap.docs.forEach(doc => { settings[doc.id] = doc.data(); });
      setGameSettings(settings);
    });
    const unsubStats = onSnapshot(collection(db, 'game_stats'), (snap) => {
      const stats: Record<string, any> = {};
      snap.docs.forEach(doc => { stats[doc.id] = doc.data(); });
      setGameStats(stats);
    });
    return () => { unsubSettings(); unsubStats(); };
  }, []);

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

  // Real-time listener for global big wins
  useEffect(() => {
    const qWins = query(
      collection(db, 'bets'),
      where('winnings', '>=', 1000), // Consider anything >= 1000 a big win to broadcast
      orderBy('winnings', 'desc'),
      limit(5)
    );
    const unsubscribeWins = onSnapshot(qWins, (snapshot) => {
      const wins = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setGlobalWins(wins);
    }, (error) => {
      console.log('Skipping global wins index error, wait for DB build', error);
      // Wait for it, error can be ignored if index is building
    });
    return () => unsubscribeWins();
  }, []);

  // Real-time listener for friends and requests
  useEffect(() => {
    if (user) {
      const unsubRequests = onSnapshot(query(
        collection(db, 'friend_requests'),
        where('toUid', '==', user.uid),
        where('status', '==', 'pending')
      ), (snap) => {
        setFriendRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'friend_requests'));

      const unsubFriends = onSnapshot(collection(db, 'users', user.uid, 'friends'), (snap) => {
        setFriends(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), uid: doc.id })));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'friends'));

      const unsubNotifications = onSnapshot(query(
        collection(db, 'notifications'),
        where('toUid', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(20)
      ), (snap) => {
        const notices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setNotifications(notices);
        setUnreadNotificationsCount(notices.filter((n: any) => !n.read).length);
        
        // Find latest unread message notification and show toast
        const latest = notices[0];
        if (latest && !latest.read && Date.now() - latest.timestamp < 5000) {
          if (latest.type === 'message' && (!showChat.isOpen || showChat.friendId !== latest.fromUid)) {
            setRewardMessage(`New DM from ${latest.fromName}`);
            setTimeout(() => setRewardMessage(''), 4000);
          } else if (latest.type === 'friend_accepted') {
            setRewardMessage(`${latest.fromName} accepted your friend request!`);
            setTimeout(() => setRewardMessage(''), 4000);
          }
        }
      }, (err) => console.log('Notice listener skip', err));

      return () => { unsubRequests(); unsubFriends(); unsubNotifications(); };
    }
  }, [user, showChat.isOpen]);

  const markNotificationsRead = async () => {
    if (!user || unreadNotificationsCount === 0) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const sendFriendRequest = async (targetUser: any) => {
    if (!user || targetUser.uid === user.uid) return;
    try {
      const friendSnap = await getDoc(doc(db, 'users', user.uid, 'friends', targetUser.uid));
      if (friendSnap.exists()) {
        setRewardMessage('Already friends!');
        setTimeout(() => setRewardMessage(''), 3000);
        return;
      }

      const q = query(
        collection(db, 'friend_requests'),
        where('fromUid', '==', user.uid),
        where('toUid', '==', targetUser.uid),
        where('status', '==', 'pending')
      );
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        setRewardMessage('Request already sent!');
        setTimeout(() => setRewardMessage(''), 3000);
        return;
      }

      await addDoc(collection(db, 'friend_requests'), {
        fromUid: user.uid,
        fromName: userProfile?.nickname || user.email?.split('@')[0],
        fromEmail: user.email || '',
        toUid: targetUser.uid,
        toEmail: targetUser.email || '',
        status: 'pending',
        timestamp: Date.now()
      });
      setRewardMessage('Friend request sent!');
      setTimeout(() => setRewardMessage(''), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friend_requests');
    }
  };

  const acceptFriendRequest = async (request: any) => {
    try {
      const batch = writeBatch(db);
      
      // 1. Update request status
      batch.update(doc(db, 'friend_requests', request.id), { status: 'accepted' });
      
      // We use the data already present in the request to avoid unauthorized getDoc on users collection
      // 2. Add to recipient's friends (User B's list)
      batch.set(doc(db, 'users', user!.uid, 'friends', request.fromUid), {
        uid: request.fromUid,
        nickname: request.fromName,
        email: request.fromEmail || '',
        timestamp: Date.now()
      });

      // 3. Add to sender's friends (User A's list)
      batch.set(doc(db, 'users', request.fromUid, 'friends', user!.uid), {
        uid: user!.uid,
        nickname: userProfile?.nickname || user!.email?.split('@')[0],
        email: user!.email || '',
        timestamp: Date.now()
      });

      // 4. Notify the person who sent the request
      const noticeRef = doc(collection(db, 'notifications'));
      batch.set(noticeRef, {
        toUid: request.fromUid,
        fromUid: user!.uid,
        fromName: userProfile?.nickname || user!.email?.split('@')[0],
        type: 'friend_accepted',
        text: 'Accepted your friend request!',
        read: false,
        timestamp: Date.now()
      });

      await batch.commit();

      setRewardMessage('Accepted friend request!');
      setTimeout(() => setRewardMessage(''), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friendship');
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'friend_requests', requestId), { status: 'declined' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friend_requests');
    }
  };

  const searchUsersSocial = async () => {
    if (!socialSearchQuery.trim()) return;
    setIsSearchingUsers(true);
    const search = socialSearchQuery.trim();
    const searchLower = search.toLowerCase();
    try {
      // 1. Try lowercase search
      const qNickLower = query(
        collection(db, 'profiles'),
        where('nicknameLower', '>=', searchLower),
        where('nicknameLower', '<=', searchLower + '\uf8ff'),
        limit(5)
      );
      
      // 2. Try regular case search (for unindexed users)
      const qNickNormal = query(
        collection(db, 'profiles'),
        where('nickname', '>=', search),
        where('nickname', '<=', search + '\uf8ff'),
        limit(5)
      );
      
      const [snapLower, snapNormal] = await Promise.all([
        getDocs(qNickLower), 
        getDocs(qNickNormal)
      ]);
      
      const resultsMap = new Map();
      [...snapLower.docs, ...snapNormal.docs].forEach(d => {
        resultsMap.set(d.id, { uid: d.id, ...d.data() });
      });
      
      setUserSearchResults(Array.from(resultsMap.values())
        .filter(u => u.uid !== user?.uid)
        .map(u => ({
          ...u,
          nickname: u.nickname
        }))
      );
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearchingUsers(false);
    }
  };

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
    
    const playerName = user.email ? user.email.split('@')[0] : 'Guest';
    const newBet = {
      uid: user.uid,
      playerName, // Helpful for global ticker
      date: new Date().toISOString(),
      amount,
      winnings,
      game,
      type
    };
    try {
      await addDoc(collection(db, 'bets'), newBet);

      // Update Game Stats
      const statRef = doc(db, 'game_stats', game); // using 'game' title as ID for now or find gameId
      const gameObj = [...STANDARD_GAMES, ...ADULT_GAMES].find(g => g.title === game);
      const gameId = gameObj?.id || 'unknown';
      const accurateStatRef = doc(db, 'game_stats', gameId);
      
      const currentStat = gameStats[gameId] || { totalBets: 0, totalWins: 0, netProfit: 0 };
      await setDoc(accurateStatRef, {
        totalBets: (currentStat.totalBets || 0) + amount,
        totalWins: (currentStat.totalWins || 0) + (winnings > 0 ? winnings : 0),
        netProfit: (currentStat.netProfit || 0) + (amount - winnings)
      }, { merge: true });
      
      // Calculate XP
      const xpGained = Math.floor(amount / 10);
      const newXp = xp + xpGained;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      
      const xpUpdates: any = { xp: newXp };
      if (newLevel > level) {
        xpUpdates.level = newLevel;
        setRewardMessage(`Level Up! You are now Level ${newLevel}!`);
      }
      
      // Update Quests
      if (quests && quests.length > 0) {
        const updatedQuests = quests.map(q => {
          if (q.completed) return q;
          let newProgress = q.progress;
          if (q.title === 'Play 50 Hands') newProgress += 1;
          if (q.title === 'High Roller' && type === 'chips') newProgress += amount;
          
          if (newProgress >= q.target && !q.completed) {
            // Quest completed
            if (q.rewardType === 'balance') {
               handleSetBalance(b => b + q.rewardAmount);
            } else if (q.rewardType === 'keyFragments') {
               const newFrags = keyFragments + q.rewardAmount;
               setKeyFragments(newFrags);
               xpUpdates.keyFragments = newFrags;
            }
            setRewardMessage(`Quest Completed: ${q.title}!`);
            return { ...q, progress: newProgress, completed: true };
          }
          return { ...q, progress: newProgress };
        });
        setQuests(updatedQuests);
        xpUpdates.quests = updatedQuests;
      }

      // Update public leaderboard entry
      try {
        await setDoc(doc(db, 'leaderboard', user.uid), {
           uid: user.uid,
           email: user.email,
           xp: newXp,
           level: Math.max(level, newLevel)
        });
      } catch (err) {
        console.log('Failed to update leaderboard', err);
      }

      updateFirestoreProfile(xpUpdates);
      setXp(newXp);
      setLevel(Math.max(level, newLevel)); // Ensure UI updates

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

  const fetchLeaderboards = async () => {
    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('xp', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      const topUsers = snap.docs.map(doc => doc.data() as any);
      setLeaderboardData(topUsers);
    } catch (error) {
      console.log('Skipping leaderboard error, wait for DB index', error);
      // Fallback: Fetch all from leaderboard and sort client side if index is missing
      try {
        const snap = await getDocs(collection(db, 'leaderboard'));
        let topUsers = snap.docs.map(doc => doc.data());
        topUsers.sort((a,b) => (b.xp || 0) - (a.xp || 0));
        setLeaderboardData(topUsers.slice(0, 20));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'leaderboard');
      }
    }
  };

  const handleRedeemPromo = async () => {
    if (!promoInput.trim() || !user) return;
    try {
      const code = promoInput.toUpperCase().trim();
      const codeRef = doc(db, 'promo_codes', code);
      const codeSnap = await getDoc(codeRef);

      const redeemedPromos = userProfile?.redeemedPromos || [];

      if (codeSnap.exists()) {
        const promoData = codeSnap.data();
        if (!promoData.active) {
          setRewardMessage('Promo code expired or inactive.');
        } else if (redeemedPromos.includes(code)) {
          setRewardMessage('Promo code already redeemed!');
        } else {
          const type = promoData.rewardType;
          const updates: any = { redeemedPromos: [...redeemedPromos, code] };
          
          if (type === 'balance' || type === 'tokens') {
            const amount = promoData.rewardAmount || 0;
            updates[type] = (userProfile[type] || 0) + amount;
            if (type === 'tokens') setTokens(t => t + amount);
            else setBalance(b => b + amount);
            setRewardMessage(`Redeemed ${code}! +${amount.toLocaleString()} ${type === 'tokens' ? 'Tokens' : 'Chips'}!`);
          } else if (type === 'multiplier' || type === 'no_ads' || type === 'pro_access') {
             const duration = promoData.duration || 60;
             const endTime = Date.now() + duration * 60000;
             updates[type + 'EndsAt'] = endTime;
             if (type === 'multiplier') updates.multiplierFactor = promoData.rewardAmount || 2;
             setRewardMessage(`Redeemed ${code}! You received ${type.replace('_', ' ')} for ${duration} mins!`);
             if (type === 'pro_access') setIsProMode(true);
          } else if (type === 'free_pack') {
             const amount = promoData.rewardAmount || 1;
             updates[`freePacks_${promoData.packType}`] = (userProfile[`freePacks_${promoData.packType}`] || 0) + amount;
             setRewardMessage(`Redeemed ${code}! +${amount} Free ${promoData.packType} Pack(s)!`);
          }
          
          updateFirestoreProfile(updates);
          setPromoInput('');
          setShowPromoModal(false);

          // Update uses counter
          await updateDoc(codeRef, { 
            uses: (promoData.uses || 0) + 1 
          });
        }
      } else if (code === 'LAUNCH2026') { // Fallback for the hardcoded one if it doesn't exist in DB
        if (redeemedPromos.includes('LAUNCH2026')) {
          setRewardMessage('Promo code already redeemed!');
        } else {
          updateFirestoreProfile({
            redeemedPromos: [...redeemedPromos, 'LAUNCH2026'],
            balance: (userProfile.balance || 0) + 5000,
            tokens: (userProfile.tokens || 0) + 1000,
          });
          setBalance(b => b + 5000);
          setTokens(t => t + 1000);
          setRewardMessage('Redeemed LAUNCH2026! +5,000 Chips & +1,000 Tokens!');
          setPromoInput('');
          setShowPromoModal(false);
        }
      } else {
        setRewardMessage('Invalid promo code.');
      }
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => setRewardMessage(''), 4000);
  };

  const handleRegisterNickname = async () => {
    if (!nicknameInput.trim() || nicknameInput.length < 3) {
      setNicknameError('Nickname must be at least 3 characters.');
      return;
    }
    setIsCheckingNickname(true);
    setNicknameError('');
    try {
      // 1. Check uniqueness
      const isOwner = user?.email === 'purepro4561@gmail.com';
      const nickRef = doc(db, 'nicknames', nicknameInput.toLowerCase().trim());
      if (!isOwner) {
        const nickSnap = await getDoc(nickRef);
        if (nickSnap.exists()) {
          setNicknameError('This nickname is already taken.');
          setIsCheckingNickname(false);
          return;
        }
      }

      // 2. Filter locally
      const isBad = BAD_WORDS.some(word => nicknameInput.toLowerCase().includes(word));
      if (isBad) {
        setNicknameError('Nickname contains inappropriate content.');
        setIsCheckingNickname(false);
        return;
      }

      // 3. Register
      const lower = nicknameInput.toLowerCase().trim();
      const nick = nicknameInput.trim();
      await setDoc(nickRef, { uid: user?.uid });
      await updateFirestoreProfile({ 
        nickname: nick,
        nicknameLower: lower
      });

      // Update public profile for search
      await setDoc(doc(db, 'profiles', user!.uid), {
        uid: user!.uid,
        nickname: nick,
        nicknameLower: lower,
        timestamp: Date.now()
      }, { merge: true });

      setShowNicknameModal(false);
    } catch (error) {
      setNicknameError('Error validating nickname. Try again.');
      console.error(error);
    }
    setIsCheckingNickname(false);
  };

  const handleUpdateNickname = async (targetUid?: any, targetNickname?: string) => {
    // Defensive check to avoid React event objects being passed as UIDs
    const uid = (typeof targetUid === 'string' ? targetUid : null) || user?.uid;
    const nickname = (targetNickname || newNickname || '').trim();

    if (!nickname.trim() || nickname.length < 3) {
      setRewardMessage('Nickname must be at least 3 characters.');
      setTimeout(() => setRewardMessage(''), 3000);
      return;
    }
    const isBad = BAD_WORDS.some(word => nickname.toLowerCase().includes(word));
    if (isBad) {
      setRewardMessage('Nickname contains inappropriate content.');
      setTimeout(() => setRewardMessage(''), 3000);
      return;
    }
    try {
      const isOwner = user?.email === 'purepro4561@gmail.com';
      const isAdmin = userProfile?.role === 'admin';
      
      // Check if nickname is taken
      const nickRef = doc(db, 'nicknames', nickname.toLowerCase().trim());
      const nickSnap = await getDoc(nickRef);
      
      if (nickSnap.exists() && nickSnap.data().uid !== uid) {
        setRewardMessage('This nickname is already taken.');
        setTimeout(() => setRewardMessage(''), 3000);
        return;
      }
      
      await setDoc(nickRef, { uid: uid });
      const lower = nickname.toLowerCase().trim();
      const nickTrimmed = nickname.trim();
      await updateDoc(doc(db, 'users', uid!), { 
        nickname: nickTrimmed,
        nicknameLower: lower
      });

      // Update public profile for search
      await setDoc(doc(db, 'profiles', uid), {
        uid: uid,
        nickname: nickTrimmed,
        nicknameLower: lower,
        timestamp: Date.now()
      }, { merge: true });

      if (uid === user?.uid) {
        setNewNickname(nickTrimmed);
        setUserProfile(prev => prev ? { ...prev, nickname: nickTrimmed, nicknameLower: lower } : null);
        setRewardMessage('Nickname updated successfully!');
        setTimeout(() => setRewardMessage(''), 3000);
      }
      
      if (!targetUid) setNewNickname('');
      setRewardMessage('Nickname updated!');
      setTimeout(() => setRewardMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setRewardMessage('Error updating nickname.');
      setTimeout(() => setRewardMessage(''), 3000);
    }
  };


  const deletePromoCodeFromDB = async (codeId: string) => {
    if (userProfile?.role !== 'admin') return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'promo_codes', codeId));
      fetchPromoCodes();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `promo_codes/${codeId}`);
    }
  };

  const autoAdjustOdds = async (gameId: string) => {
    if (userProfile?.role !== 'admin') return;
    const stats = gameStats[gameId];
    if (!stats || stats.netProfit >= 0) return;

    // We are losing money! Adjust riggedness.
    const currentRiggedness = gameSettings[gameId]?.riggedness || 1.0;
    const newRiggedness = Number((currentRiggedness + 0.1).toFixed(2));
    
    await setDoc(doc(db, 'game_settings', gameId), { riggedness: newRiggedness }, { merge: true });
    setRewardMessage(`Auto-Adjusted ${gameId} riggedness to ${newRiggedness}`);
    setTimeout(() => setRewardMessage(''), 3000);
  };

  const fetchAdminStats = async () => {
    if (!userProfile || userProfile.role !== 'admin') return;
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const betsSnap = await getDocs(collection(db, 'bets'));
      
      const totalUsers = usersSnap.size;
      const totalBets = betsSnap.size;
      let totalVolume = 0;
      let totalPayout = 0;
      
      const gameStats: Record<string, { bets: number, volume: number, payout: number }> = {};

      betsSnap.forEach(doc => {
        const data = doc.data();
        totalVolume += data.amount || 0;
        totalPayout += data.winnings || 0;
        
        const game = data.game || 'Unknown';
        if (!gameStats[game]) {
          gameStats[game] = { bets: 0, volume: 0, payout: 0 };
        }
        gameStats[game].bets += 1;
        gameStats[game].volume += (data.amount || 0);
        gameStats[game].payout += (data.winnings || 0);
      });

      setAdminStats({
        totalUsers,
        totalBets,
        totalVolume,
        totalPayout,
        gameStats
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_stats');
    }
  };

  const fetchAllUsers = async () => {
    if (userProfile?.role !== 'admin') return;
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
      setAllUsers(usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
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

  const toggleUserSuspend = async (userId: string, currentStatus: boolean) => {
    if (userProfile?.role !== 'admin') return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isSuspended: !currentStatus });
      fetchAllUsers(); // Refresh list
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const fetchPromoCodes = async () => {
    if (userProfile?.role !== 'admin') return;
    try {
      const promosSnap = await getDocs(collection(db, 'promo_codes'));
      setPromoCodes(promosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'promo_codes');
    }
  };

  const createPromoCode = async () => {
    if (userProfile?.role !== 'admin' || !newPromoCode.trim()) return;
    try {
      const data: any = {
        code: newPromoCode.toUpperCase(),
        rewardType: newPromoRewardType,
        rewardAmount: newPromoRewardAmount,
        active: true,
        createdBy: user?.uid,
        createdAt: new Date().toISOString()
      };
      if (['multiplier', 'no_ads', 'pro_access'].includes(newPromoRewardType)) {
        data.duration = newPromoDuration;
      }
      if (newPromoRewardType === 'free_pack') {
        data.packType = newPromoPackType;
      }
      await setDoc(doc(db, 'promo_codes', newPromoCode.toUpperCase()), data);
      setNewPromoCode('');
      fetchPromoCodes();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'promo_codes');
    }
  };

  const deletePromoCode = async (codeId: string) => {
    if (userProfile?.role !== 'admin') return;
    try {
      // We will perform a soft delete or hard delete. For this case we'll just toggle active status.
      const promoRef = doc(db, 'promo_codes', codeId);
      const promoSnap = await getDoc(promoRef);
      if (promoSnap.exists()) {
        await updateDoc(promoRef, { active: !promoSnap.data().active });
        fetchPromoCodes();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `promo_codes/${codeId}`);
    }
  };

  useEffect(() => {
    if (showAdminPanel) {
      fetchAdminStats();
      if (adminTab === 'users') fetchAllUsers();
      if (adminTab === 'promos') fetchPromoCodes();
    }
  }, [showAdminPanel, adminTab]);

  useEffect(() => {
    if (showAdminPanel && adminTab === 'live') {
      const currentQuery = query(collection(db, 'bets'), orderBy('date', 'desc'), limit(50));
      const unsubscribe = onSnapshot(currentQuery, (snapshot) => {
        const bets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLiveBetsFeed(bets);
      }, (error) => {
        console.log('Skipping live bets error, wait for DB index', error);
      });
      return () => unsubscribe();
    }
  }, [showAdminPanel, adminTab]);

  const handleToggleProMode = () => {
    if (isProMode) {
      setIsProMode(false);
      updateFirestoreProfile({ isProMode: false });
      setActiveGame(null);
    } else {
      setKeyInput('');
      setKeyError(false);
      setGeneratedKey('');
      setShowKeyModal(true);
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
    if (userProfile?.adsEnabled === false || (userProfile?.noAdsEndsAt && userProfile.noAdsEndsAt > Date.now())) {
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
    if (userProfile?.adsEnabled === false || (userProfile?.noAdsEndsAt && userProfile.noAdsEndsAt > Date.now())) {
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
    return activeGames.slice(0, visibleCount);
  }, [activeGames, visibleCount]);

  const totalFilteredGames = useMemo(() => {
    return activeGames.length;
  }, [activeGames]);

  const currentThemeConfig = THEMES[activeTheme];
  const themeGradient = currentThemeConfig.gradient;
  const themeColor = currentThemeConfig.primary;
  const themeColors = currentThemeConfig.colors;
  const themeGlow = currentThemeConfig.glow;

  const activeMultiplier = (systemConfig.globalMultiplier || 1) * (userProfile?.multiplierEndsAt && userProfile.multiplierEndsAt > Date.now() ? (userProfile.multiplierFactor || 2) : 1);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
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
            <span className="font-bold text-xl tracking-tight hidden md:flex items-center gap-2">
              PurePro<motion.span layout className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>4561</motion.span>
              {ownedBadges.map(b => <span key={b} className="text-lg" title={BADGES[b as keyof typeof BADGES].name}>{BADGES[b as keyof typeof BADGES].icon}</span>)}
            </span>
          </motion.div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 ml-4">
            <div className="hidden sm:flex items-center gap-2 lg:gap-4">
              <div className="flex items-center gap-2 bg-amber-500/10 pl-3 pr-1 py-1 rounded-full border border-amber-500/20 text-amber-400 font-mono text-sm">
                <Coins className="w-4 h-4" /> ${balance.toLocaleString()}
                <button 
                  onMouseEnter={playHover}
                  onClick={watchAd} 
                  className="ml-2 bg-amber-500/20 hover:bg-amber-500/40 p-1.5 rounded-full transition-colors hidden lg:block" 
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
                  className="ml-2 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors hidden lg:block" 
                  title="Watch Ad for Tokens"
                >
                  <Video className="w-4 h-4 text-lime-400" />
                </button>
                <button 
                  onMouseEnter={playHover}
                  onClick={() => setShowShopModal(true)} 
                  className="ml-2 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors hidden lg:block" 
                  title="Open Shop"
                >
                  <Store className="w-4 h-4 text-zinc-300" />
                </button>
              </div>
            </div>
            
            {isProMode && (
              <button onClick={() => setShowHistoryModal(true)} className="hidden sm:flex bg-zinc-800/50 hover:bg-zinc-700/50 p-2 rounded-full border border-white/10 transition-colors shrink-0" title="Bet History">
                <History className="w-4 h-4 text-amber-400" style={{ color: themeColor }} />
              </button>
            )}
            
            <motion.div 
              className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5 shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <span className={`hidden sm:inline text-xs font-mono font-bold ${isProMode ? 'text-amber-500' : 'text-zinc-500'}`}>PRO</span>
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
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {userProfile?.role === 'admin' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAdminPanel(true)}
                    className="p-1.5 sm:p-2 bg-zinc-900 border border-amber-500/30 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors"
                    title="Admin Panel"
                  >
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                )}
                
                <div className="hidden lg:flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    onClick={() => { setShowLeaderboard(true); fetchLeaderboards(); }}
                    className="p-2 bg-zinc-900 border border-white/10 rounded-full hover:bg-white/5 transition-colors" 
                    title="Leaderboard"
                  >
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowQuestsModal(true)}
                    className="p-2 bg-zinc-900 border border-white/10 rounded-full hover:bg-white/5 transition-colors" 
                    title="Daily Quests"
                  >
                    <Target className="w-4 h-4 text-emerald-400" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowPromoModal(true)}
                    className="p-2 bg-zinc-900 border border-white/10 rounded-full hover:bg-white/5 transition-colors" 
                    title="Promo Codes"
                  >
                    <Tag className="w-4 h-4 text-cyan-400" />
                  </motion.button>
                </div>

                <div className="hidden xl:flex flex-col items-end mr-2">
                  <div className="text-[10px] font-bold text-white flex items-center gap-1 mb-0.5">
                    {userProfile?.nickname || user?.email?.split('@')[0]}
                    {(userProfile?.role === 'admin' || user?.email === 'purepro4561@gmail.com') && <ShieldCheck className="w-2.5 h-2.5 text-amber-500" />}
                  </div>
                  <div className="font-mono text-[10px] sm:text-xs text-zinc-400 leading-none">Level {level}</div>
                  <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/10 mt-1" title={`${xp} XP`}>
                     <div 
                      className={`h-full bg-gradient-to-r ${themeGradient}`} 
                      style={{ width: `${((xp - Math.pow(level - 1, 2) * 100) / (Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100)) * 100}%` }} 
                     />
                  </div>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowShopModal(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-900 border border-white/10 p-1 cursor-pointer flex items-center justify-center relative group shrink-0"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {AVATARS[activeAvatar as keyof typeof AVATARS].icon}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-lime-500 rounded-full border-2 border-zinc-950" />
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowSettingsModal(true); markNotificationsRead(); }}
                  className="p-1.5 sm:p-2 bg-zinc-900 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-colors shrink-0 relative"
                  title="Account Settings"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  {(friendRequests.length + unreadNotificationsCount) > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg"
                    >
                      {friendRequests.length + unreadNotificationsCount}
                    </motion.div>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSignOut}
                  className="p-1.5 sm:p-2 bg-zinc-900 border border-white/10 rounded-full text-zinc-400 hover:text-red-400 transition-colors shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className={`px-4 py-2 sm:px-6 sm:py-2 rounded-xl bg-gradient-to-r ${themeGradient} text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg shrink-0`}
              >
                <User className="w-4 h-4" /> Sign In
              </motion.button>
            )}
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
            gameId={activeGame}
            title={STANDARD_GAMES.find(g => g.id === activeGame)?.title || ADULT_GAMES.find(g => g.id === activeGame)?.title || "Slots"}
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
            globalMultiplier={activeMultiplier * (activeGame === 'custom-202' ? 2 : activeGame === 'custom-108' ? 1.5 : 1)}
            riggedness={(gameSettings[activeGame as string]?.riggedness || 1.0) * (userProfile?.luckFactor || 1.0)}
          />
        ) : activeGame === 'custom-102' ? (
          <Blackjack 
            gameId={activeGame}
            title={STANDARD_GAMES.find(g => g.id === activeGame)?.title || "Blackjack"}
            balance={balance} 
            setBalance={handleSetBalance} 
            onExit={() => setActiveGame(null)} 
            themeGradient={themeGradient} 
            themeColor={themeColor} 
            onRecordBet={recordBet} 
            globalMultiplier={activeMultiplier}
          />
        ) : activeGame === 'custom-201' ? (
          <Plinko
            gameId={activeGame}
            title={ADULT_GAMES.find(g => g.id === activeGame)?.title || "Plinko"}
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={activeMultiplier}
          />
        ) : activeGame === 'custom-104' || activeGame === 'custom-203' ? (
          <Roulette
            gameId={activeGame}
            title={STANDARD_GAMES.find(g => g.id === activeGame)?.title || ADULT_GAMES.find(g => g.id === activeGame)?.title || "Roulette"}
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={activeMultiplier}
          />
        ) : activeGame === 'custom-103' || activeGame === 'custom-204' || activeGame === 'custom-107' ? (
          <Poker
            gameId={activeGame}
            title={STANDARD_GAMES.find(g => g.id === activeGame)?.title || ADULT_GAMES.find(g => g.id === activeGame)?.title || "Poker"}
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={activeMultiplier}
          />
        ) : activeGame === 'custom-105' ? (
          <Craps
            gameId={activeGame}
            title={STANDARD_GAMES.find(g => g.id === activeGame)?.title || "Craps"}
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={activeMultiplier}
          />
        ) : activeGame === 'custom-106' ? (
          <Baccarat
            gameId={activeGame}
            title={STANDARD_GAMES.find(g => g.id === activeGame)?.title || "Baccarat"}
            balance={balance}
            setBalance={handleSetBalance}
            onExit={() => setActiveGame(null)}
            themeGradient={themeGradient}
            themeColor={themeColor}
            onRecordBet={recordBet}
            globalMultiplier={activeMultiplier}
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
                {displayedGames.length > 0 && (
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] text-zinc-950 px-6 py-3 rounded-full font-bold flex items-center gap-2"
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

      {/* Daily Login Modal */}
      <AnimatePresence>
        {showDailyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full" />
              <Gift className="w-16 h-16 text-amber-400 mx-auto mb-4 relative z-10" />
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Daily Reward!</h3>
              <p className="text-zinc-400 mb-6 relative z-10">You are on a <span className="font-bold text-white">{loginStreak}</span> day login streak!</p>
              
              <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 mb-6 relative z-10">
                <p className="text-xs text-zinc-500 font-mono mb-2 uppercase">Reward</p>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-amber-500">
                   <Coins className="w-8 h-8" /> {dailyReward.toLocaleString()}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDailyModal(false)}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black flex items-center justify-center gap-2 relative z-10"
              >
                Claim Chips
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nickname Selection Modal */}
      <AnimatePresence>
        {showNicknameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Sparkles className="w-10 h-10 text-amber-500" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight text-center">Welcome, Player!</h3>
                <p className="text-zinc-500 text-sm mb-8 text-center px-4 leading-relaxed">
                  Before you start winning, choose a unique identity. This will be visible to others in the future.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Enter unique nickname..."
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono placeholder:text-zinc-700 outline-none focus:border-amber-500/50 transition-colors shadow-inner"
                      maxLength={16}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600">
                      {nicknameInput.length}/16
                    </div>
                  </div>

                  {nicknameError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-red-500 text-xs font-bold px-2 bg-red-500/5 py-2 rounded-lg border border-red-500/20"
                    >
                      {nicknameError}
                    </motion.p>
                  )}

                  <button 
                    disabled={nicknameInput.length < 3 || isCheckingNickname}
                    onClick={handleRegisterNickname}
                    className={`w-full py-4 rounded-2xl font-black text-lg tracking-tighter uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${
                      nicknameInput.length < 3 || isCheckingNickname
                        ? 'bg-zinc-800 text-zinc-600' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isCheckingNickname ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        SET IDENTITY
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-zinc-600 text-center font-mono leading-tight">
                    By confirming, you agree to our community standards. 
                    Nicknames are filtered for safety.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
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
              className="bg-zinc-900 border rounded-3xl p-8 max-w-2xl w-full flex flex-col max-h-[80vh] shadow-2xl relative overflow-hidden"
              style={{ borderColor: `${themeColor}33` }}
            >
              <button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
                <X className="w-6 h-6" />
              </button>
              <h3 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient} mb-6 flex items-center gap-3`}>
                <Trophy style={{ color: themeColor }} className="w-8 h-8"/> Hall of Fame
              </h3>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {leaderboardData.length > 0 ? leaderboardData.map((lbUser, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 mb-2 bg-zinc-950 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center font-bold font-mono rounded-full ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-100 flex items-center gap-2">
                             {lbUser.email?.split('@')[0] || 'Unknown'}
                             {idx === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="text-xs font-mono text-zinc-500">Level {lbUser.level || 1}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-300 font-bold font-mono">{Number(lbUser.xp || 0).toLocaleString()} XP</div>
                      </div>
                   </div>
                )) : (
                  <div className="text-center text-zinc-500 py-10">Loading ranks...</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Codes Modal */}
      <AnimatePresence>
        {showPromoModal && (
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
              className="bg-zinc-900 border rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center"
              style={{ borderColor: `${themeColor}33` }}
            >
              <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
                <X className="w-6 h-6" />
              </button>
              <Tag className="w-16 h-16 mx-auto mb-4" style={{ color: themeColor }} />
              <h3 className="text-2xl font-bold text-white mb-2">Redeem Promo Code</h3>
              <p className="text-zinc-400 mb-6 text-sm">Enter a valid promo code to receive free chips, tokens, or exclusive auras.</p>
              
              <input 
                type="text" 
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. LAUNCH2026)"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-4 mb-4 text-center text-white font-mono uppercase tracking-widest focus-within:border-white/30 focus-within:dynamic-glow-box transition-all"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRedeemPromo}
                className="w-full px-6 py-4 rounded-xl font-black text-zinc-950"
                style={{ background: `linear-gradient(to right, ${themeColor}, #ffffff)` }}
              >
                Redeem Code
              </motion.button>
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
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-bold text-zinc-400">LEVEL {level}</span>
                    </div>
                    <div className="w-32 h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/10 relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((xp - Math.pow(level - 1, 2) * 100) / (Math.pow(level, 2) * 100 - Math.pow(level - 1, 2) * 100)) * 100}%` }}
                        className={`h-full bg-gradient-to-r ${themeGradient}`}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-widest">{xp} / {Math.pow(level, 2) * 100} XP</span>
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
                    onClick={() => setAdminTab('economy')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'economy' ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                  >
                    Economy & Odds
                  </button>
                  <button 
                    onClick={() => setAdminTab('users')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'users' ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                  >
                    User Management
                  </button>
                  <button 
                    onClick={() => setAdminTab('promos')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'promos' ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                  >
                    Promo Codes
                  </button>
                  <button 
                    onClick={() => setAdminTab('live')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminTab === 'live' ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                  >
                    Live Bets Feed
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center gap-3 text-zinc-400 mb-2">
                          <Coins className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Total Payout</span>
                        </div>
                        <div className="text-3xl font-bold text-emerald-500">${adminStats?.totalPayout?.toLocaleString() || '...'}</div>
                      </div>
                    </div>

                    {adminStats?.gameStats && Object.keys(adminStats.gameStats).length > 0 && (
                      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 mb-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-zinc-400" />
                          Game Economy (RTP)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-zinc-500 font-bold whitespace-nowrap">
                                <th className="pb-4 pr-8">Game</th>
                                <th className="pb-4 pr-8 text-right">Bets Played</th>
                                <th className="pb-4 pr-8 text-right">Volume In</th>
                                <th className="pb-4 pr-8 text-right">Payout Out</th>
                                <th className="pb-4 text-right px-4">RTP %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(adminStats.gameStats as Record<string, {bets: number, volume: number, payout: number}>).map(([game, stats]) => {
                                const rtp = stats.volume > 0 ? (stats.payout / stats.volume) * 100 : 0;
                                return (
                                  <tr key={game} className="border-b border-white/5 hover:bg-white/5 transition-colors whitespace-nowrap">
                                    <td className="py-4 pr-8 font-bold text-white whitespace-nowrap">{game}</td>
                                    <td className="py-4 pr-8 text-right text-zinc-400 font-mono whitespace-nowrap">{stats.bets.toLocaleString()}</td>
                                    <td className="py-4 pr-8 text-right text-amber-500 font-mono whitespace-nowrap">${stats.volume.toLocaleString()}</td>
                                    <td className="py-4 pr-8 text-right text-emerald-500 font-mono whitespace-nowrap">${stats.payout.toLocaleString()}</td>
                                    <td className={`py-4 text-right font-bold font-mono whitespace-nowrap px-4 ${rtp > 100 ? 'text-red-500' : 'text-zinc-300'}`}>
                                      {rtp.toFixed(2)}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 mb-8">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        Quick Actions (My Account)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Change Nickname</span>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="New nickname..."
                              value={newNickname}
                              onChange={(e) => setNewNickname(e.target.value)}
                              className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-sm text-zinc-200"
                            />
                            <button onClick={() => handleUpdateNickname()} className="bg-amber-500 text-zinc-950 px-4 py-2 rounded-xl text-sm font-bold">Save</button>
                          </div>
                        </div>

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

                {adminTab === 'economy' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 mb-8">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-zinc-400" />
                        Adjust Game Payouts & Riggedness
                      </h3>
                      {Object.keys(gameStats).length === 0 && (
                        <p className="text-zinc-500 font-mono text-sm">No game statistics available to adjust.</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(gameStats).map(([gameId, val]) => {
                          const stats = val as { totalBets: number; totalWins: number; netProfit: number };
                          const settings = (gameSettings[gameId] as { riggedness?: number }) || { riggedness: 1.0 };
                          const riggedness = settings.riggedness ?? 1.0;
                          const rtp = stats.totalBets > 0 ? (stats.totalWins / stats.totalBets) * 100 : 0;
                          return (
                            <div key={gameId} className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5 flex flex-col gap-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold text-zinc-100">{gameId}</h4>
                                  <p className={`text-xs font-mono font-bold ${rtp > 95 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    Current RTP: {rtp.toFixed(2)}%
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-zinc-500 uppercase font-mono">Net Profit</p>
                                  <p className={`font-mono font-bold ${stats.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    ${(stats.netProfit || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                {(['riggedness', 'winMultiplier', 'ghostJackpotProb'] as const).map((param) => (
                                  <div key={param} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold text-zinc-400">
                                      <span className="capitalize">{param.replace(/([A-Z])/g, ' $1')}</span>
                                      <span>{settings[param] ?? (param === 'riggedness' ? 1.0 : param === 'winMultiplier' ? 1.0 : 0.1)}x</span>
                                    </div>
                                    <input 
                                      type="range" min="0.1" max="3.0" step="0.1"
                                      value={settings[param] ?? (param === 'riggedness' ? 1.0 : param === 'winMultiplier' ? 1.0 : 0.1)}
                                      onChange={async (e) => {
                                        const val = parseFloat(e.target.value);
                                        await setDoc(doc(db, 'game_settings', gameId), { [param]: val }, { merge: true });
                                      }}
                                      className="w-full accent-amber-500"
                                    />
                                  </div>
                                ))}
                              </div>

                              <button 
                                onClick={() => autoAdjustOdds(gameId)}
                                className={`w-full py-3 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${stats.netProfit < 0 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                              >
                                {stats.netProfit < 0 ? <><Zap className="w-3 h-3" /> Auto-Fix Profitability</> : 'Economy Stable'}
                              </button>
                            </div>
                          );
                        })}
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
                              placeholder="Search by email, nickname or UID..."
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter' && userSearchQuery.trim()) {
                                  // Server side search for admin
                                  const term = userSearchQuery.trim().toLowerCase();
                                  const qEmail = query(collection(db, 'users'), where('email', '>=', term), where('email', '<=', term + '\uf8ff'), limit(10));
                                  const qNick = query(collection(db, 'users'), where('nicknameLower', '>=', term), where('nicknameLower', '<=', term + '\uf8ff'), limit(10));
                                  const [s1, s2] = await Promise.all([getDocs(qEmail), getDocs(qNick)]);
                                  const results = Array.from(new Map([...s1.docs, ...s2.docs].map(d => [d.id, { uid: d.id, ...d.data() }])).values());
                                  setAllUsers(results as any[]);
                                }
                              }}
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                          </div>
                          <button 
                            onClick={async () => {
                              if (!userSearchQuery.trim()) return;
                              const term = userSearchQuery.trim().toLowerCase();
                              const qEmail = query(collection(db, 'users'), where('email', '>=', term), where('email', '<=', term + '\uf8ff'), limit(10));
                              const qNick = query(collection(db, 'users'), where('nicknameLower', '>=', term), where('nicknameLower', '<=', term + '\uf8ff'), limit(10));
                              const [s1, s2] = await Promise.all([getDocs(qEmail), getDocs(qNick)]);
                              const results = Array.from(new Map([...s1.docs, ...s2.docs].map(d => [d.id, { uid: d.id, ...d.data() }])).values());
                              setAllUsers(results as any[]);
                            }}
                            className="p-2 bg-amber-500 text-zinc-950 rounded-xl"
                            title="Server Search"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <select 
                            value={userSort}
                            onChange={(e) => setUserSort(e.target.value as any)}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                          >
                            <option value="none">Sort By</option>
                            <option value="hours">Hours Played</option>
                            <option value="online">Online Status</option>
                          </select>
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
                            u.uid?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                            u.nickname?.toLowerCase().includes(userSearchQuery.toLowerCase())
                          )
                          .sort((a, b) => {
                            if (userSort === 'hours') return (b.totalTimeSpent || 0) - (a.totalTimeSpent || 0);
                            if (userSort === 'online') return (b.lastSeen || 0) - (a.lastSeen || 0);
                            return 0;
                          })
                          .map((u) => {
                            const isOnline = Date.now() - (u.lastSeen || 0) < 300000;
                            const hoursPlayed = ((u.totalTimeSpent || 0) / 3600000).toFixed(1);
                            return (
                              <div key={u.uid} className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-zinc-900/50 rounded-3xl border border-white/5 gap-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                    {AVATARS[u.activeAvatar as keyof typeof AVATARS]?.icon || <User className="w-6 h-6 text-zinc-600" />}
                                    <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${isOnline ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                                      {u.nickname || u.email}
                                      {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                                      {u.email === 'purepro4561@gmail.com' && <div className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-mono uppercase">Dev/Owner</div>}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{u.email}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <input 
                                        type="text"
                                        placeholder="Force name..."
                                        className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[10px] w-24 outline-none focus:border-amber-500/30 text-zinc-300"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleUpdateNickname(u.uid, (e.target as HTMLInputElement).value);
                                            (e.target as HTMLInputElement).value = '';
                                          }
                                        }}
                                      />
                                      <span className="text-[9px] text-zinc-600 font-mono">⏎ to save</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-6">
                                  <button 
                                    onClick={() => setShowChat({ isOpen: true, friendId: u.uid, chatName: u.nickname || u.email })}
                                    className="p-2 bg-zinc-800 hover:bg-emerald-500/20 rounded-xl border border-white/5 transition-colors group/chat"
                                    title="Chat with User"
                                  >
                                    <MessageSquare className="w-4 h-4 text-zinc-500 group-hover/chat:text-emerald-500" />
                                  </button>
                                  
                                  <div className="flex flex-col gap-1 min-w-[120px]">
                                    <div className="flex justify-between items-center bg-zinc-800/50 rounded-lg px-2 py-0.5">
                                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Luck</span>
                                      <span className="text-[9px] font-mono font-bold text-amber-500">{(u.luckFactor || 1.0).toFixed(1)}x</span>
                                    </div>
                                    <input 
                                      type="range" min="0.1" max="3.0" step="0.1"
                                      value={u.luckFactor || 1.0}
                                      onChange={async (e) => {
                                        const val = parseFloat(e.target.value);
                                        await updateDoc(doc(db, 'users', u.uid), { luckFactor: val });
                                      }}
                                      className="w-full accent-amber-500 h-1"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Activity</span>
                                    <div className="text-xs font-mono text-zinc-300">{hoursPlayed} hrs</div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className={`w-3 h-3 ${u.isSuspended ? 'text-red-500' : 'text-zinc-500'}`} />
                                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</span>
                                    </div>
                                    <button 
                                      onClick={() => toggleUserSuspend(u.uid, u.isSuspended)}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${u.isSuspended ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}
                                    >
                                      {u.isSuspended ? 'Suspended' : 'Active'}
                                    </button>
                                  </div>

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
                            );
                          })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {adminTab === 'promos' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 mb-8">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-amber-500" />
                        Create Promo Code
                      </h3>
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full relative">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Promo Code</span>
                          <input 
                            type="text" 
                            placeholder="e.g. VIP2026"
                            value={newPromoCode}
                            onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 uppercase font-mono"
                          />
                        </div>
                        <div className="w-full md:w-auto relative">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Reward Type</span>
                          <select 
                            value={newPromoRewardType}
                            onChange={(e) => setNewPromoRewardType(e.target.value)}
                            className="w-full md:w-32 bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                          >
                            <option value="balance">Chips</option>
                            <option value="tokens">Tokens</option>
                            <option value="multiplier">Multiplier</option>
                            <option value="no_ads">No Ads</option>
                            <option value="pro_access">PRO Access</option>
                            <option value="free_pack">Free Pack</option>
                          </select>
                        </div>
                        {['balance', 'tokens'].includes(newPromoRewardType) && (
                          <div className="w-full md:w-32 relative">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Amount</span>
                            <input 
                              type="number"
                              value={newPromoRewardAmount}
                              onChange={(e) => setNewPromoRewardAmount(parseInt(e.target.value))}
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 font-mono"
                            />
                          </div>
                        )}
                        {['multiplier', 'no_ads', 'pro_access'].includes(newPromoRewardType) && (
                          <div className="w-full md:w-32 relative">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Mins</span>
                            <input 
                              type="number"
                              value={newPromoDuration}
                              onChange={(e) => setNewPromoDuration(parseInt(e.target.value))}
                              placeholder="Minutes"
                              className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 font-mono"
                            />
                          </div>
                        )}
                        {newPromoRewardType === 'free_pack' && (
                          <>
                            <div className="w-full md:w-32 relative">
                              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Pack Type</span>
                              <select 
                                value={newPromoPackType}
                                onChange={(e) => setNewPromoPackType(e.target.value)}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                              >
                                <option value="AVATAR">Avatar</option>
                                <option value="AURA">Aura</option>
                                <option value="VFX">VFX</option>
                              </select>
                            </div>
                            <div className="w-full md:w-32 relative">
                              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Quantity</span>
                              <input 
                                type="number"
                                value={newPromoRewardAmount}
                                onChange={(e) => setNewPromoRewardAmount(parseInt(e.target.value))}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 font-mono"
                              />
                            </div>
                          </>
                        )}
                        <button 
                          onClick={createPromoCode}
                          className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-colors"
                        >
                          Create
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-zinc-400" />
                        Active Promo Codes
                      </h3>
                      <div className="space-y-4">
                        {promoCodes.length > 0 ? (
                          promoCodes.map((promo) => (
                            <div key={promo.id} className={`flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border ${promo.active ? 'border-amber-500/20' : 'border-white/5 opacity-50'}`}>
                              <div>
                                <h4 className="text-xl font-bold font-mono text-zinc-100">{promo.code}</h4>
                                <p className="text-sm text-zinc-500">
                                  Rewards {promo.rewardAmount.toLocaleString()} {promo.rewardType}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => deletePromoCode(promo.id)}
                                  className={`px-4 py-2 hover:bg-white/5 transition-colors text-sm font-bold rounded-lg ${promo.active ? 'text-red-500' : 'text-emerald-500'}`}
                                >
                                  {promo.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button 
                                  onClick={() => deletePromoCodeFromDB(promo.id)}
                                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-zinc-500 font-mono">No promo codes found.</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {adminTab === 'live' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 max-h-[80vh] flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
                          Live Action Feed
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Real-time
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {liveBetsFeed.length > 0 ? (
                          <AnimatePresence initial={false}>
                            {liveBetsFeed.map((bet) => (
                              <motion.div 
                                key={bet.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-2 h-2 rounded-full ${bet.winnings > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                  <div className="flex flex-col">
                                    <div className="text-sm font-bold text-zinc-100">{bet.game}</div>
                                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                      Player: {bet.playerName || 'Guest'}
                                      {(bet.userRole === 'admin' || bet.playerEmail === 'purepro4561@gmail.com') && <ShieldCheck className="w-2.5 h-2.5 text-amber-500" />}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-8">
                                  <div className="text-right">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bet Amount</div>
                                    <div className="text-sm font-mono text-zinc-300">
                                      {bet.type === 'chips' ? '$' : ''}{bet.amount?.toLocaleString()} {bet.type === 'tokens' ? 'TK' : ''}
                                    </div>
                                  </div>
                                  <div className="text-right min-w-[80px]">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payout</div>
                                    <div className={`text-sm font-mono font-bold ${bet.winnings > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                      {bet.winnings > 0 ? '+' : ''}{bet.type === 'chips' ? '$' : ''}{bet.winnings?.toLocaleString() || 0}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        ) : (
                          <div className="text-center py-12 text-zinc-500 font-mono">Waiting for action...</div>
                        )}
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
      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-zinc-900 border rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[80vh]"
              style={{ borderColor: `${themeColor}33` }}
            >
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}20` }}>
                  <Trophy className="w-6 h-6" style={{ color: themeColor }} />
                </div>
                <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>Global Leaderboard</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {leaderboardData.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 font-mono">Loading top players...</div>
                ) : (
                  leaderboardData.map((lbUser, idx) => (
                    <div key={idx} className={`bg-zinc-950/50 border ${user?.uid === lbUser.uid ? `border-[${themeColor}]` : 'border-white/5'} rounded-xl p-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className="text-zinc-500 font-black text-xl w-6">#{idx + 1}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-zinc-100 font-bold">{lbUser.nickname || (lbUser.email ? lbUser.email.split('@')[0] : 'Guest')}</div>
                          {(lbUser.role === 'admin' || lbUser.email === 'purepro4561@gmail.com') && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-500 text-[10px] font-mono uppercase">Level</p>
                        <p className={`font-mono font-bold text-amber-500`}>{lbUser.level || 1}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Code Modal */}
      <AnimatePresence>
        {showPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-zinc-900 border rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center"
              style={{ borderColor: `${themeColor}33` }}
            >
              <button 
                onClick={() => setShowPromoModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <Tag className="w-12 h-12 mx-auto mb-4" style={{ color: themeColor }} />
              <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient} mb-2`}>Redeem Code</h3>
              <p className="text-zinc-400 mb-6 text-sm">Enter a promo code to receive free chips, tokens, or exclusive auras!</p>

              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter Code"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-mono text-white mb-4 outline-none uppercase"
              />
              
              <button
                onClick={handleRedeemPromo}
                className="w-full py-3 rounded-xl text-zinc-950 font-bold shadow-lg transition-all"
                style={{ background: `linear-gradient(to right, ${themeColors[0]}, ${themeColors[1]})` }}
              >
                Redeem
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Login Modal */}
      <AnimatePresence>
        {showDailyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -40, opacity: 0 }}
              className="bg-zinc-900 border rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center overflow-hidden"
              style={{ borderColor: `${themeColor}33` }}
            >
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent" />
              </div>
              
              <Gift className="w-16 h-16 mx-auto mb-4 text-amber-500 animate-bounce" />
              <h3 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2`}>
                DAILY REWARD
              </h3>
              <p className="text-zinc-300 font-mono mb-2 text-lg">Day {loginStreak} Streak!</p>
              
              <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl py-6 px-4 my-6">
                <div className="text-4xl font-black text-lime-400 font-mono tracking-tighter">
                  +{dailyReward.toLocaleString()}
                </div>
                <div className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Chips Added</div>
              </div>

              <div className="flex justify-between w-full gap-2 mb-6 text-xs text-zinc-500">
                {[1,2,3,4,5,6,7].map((day) => (
                  <div key={day} className={`flex flex-col items-center p-2 rounded-lg ${day <= loginStreak ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-950 border border-white/5'}`}>
                    <span className="font-bold">D{day}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowDailyModal(false)}
                className="w-full py-4 rounded-xl text-zinc-950 font-black text-lg bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                CLAIM REWARD
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quests Modal */}
      <AnimatePresence>
        {showChat.isOpen && (
          <ChatModal 
            isOpen={showChat.isOpen} 
            onClose={() => setShowChat({...showChat, isOpen: false})} 
            friendId={showChat.friendId}
            chatName={showChat.chatName}
            senderName={userProfile?.nickname || user?.email?.split('@')[0] || 'Friend'}
            themeColor={themeColor}
            themeGradient={themeGradient}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showQuestsModal && (
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
              className="bg-zinc-900 border rounded-3xl p-8 max-w-2xl w-full flex flex-col max-h-[80vh] shadow-2xl relative overflow-hidden"
              style={{ borderColor: `${themeColor}33` }}
            >
              <button onClick={() => setShowQuestsModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
                <X className="w-6 h-6" />
              </button>
              <h3 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeGradient} mb-2 flex items-center gap-3`}>
                <Target style={{ color: themeColor }} className="w-8 h-8"/> Daily Quests
              </h3>
              <p className="text-zinc-400 mb-6 text-sm">Complete these tasks to earn bonus Key Fragments and Chips.</p>

              <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {quests.length > 0 ? quests.map((q) => (
                  <div key={q.id} className={`bg-zinc-950 border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-opacity ${q.completed ? 'opacity-50 grayscale' : ''}`}>
                     <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${q.rewardType === 'balance' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                          {q.rewardType === 'balance' ? <Coins className="w-6 h-6 text-amber-500" /> : <Gamepad2 className="w-6 h-6 text-emerald-500" />}
                       </div>
                       <div>
                         <div className="font-bold text-white text-lg">{q.title}</div>
                         <div className="text-sm text-zinc-400">{q.desc}</div>
                       </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-2">
                       {q.completed ? (
                         <div className="flex items-center gap-2">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                           <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Completed</div>
                         </div>
                       ) : (
                         <>
                           <div className="flex items-center gap-2">
                             <div className="text-xs font-mono text-zinc-500">{q.progress}/{q.target}</div>
                             <div className="w-20 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, (q.progress / q.target) * 100))}%` }} />
                             </div>
                           </div>
                           <span className={`text-xs font-bold px-2 py-1 rounded-md border ${q.rewardType === 'balance' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                             Reward: {q.rewardAmount} {q.rewardType === 'balance' ? 'Chips' : 'Key Frags'}
                           </span>
                         </>
                       )}
                     </div>
                  </div>
                )) : (
                   <div className="text-center text-zinc-500 py-10 font-mono">No quests available today.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Settings className="text-zinc-400" /> Account Settings
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-zinc-500 hover:text-white">
                  <X />
                </button>
              </div>

              <div className="space-y-8">
                {/* Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> Profile
                  </h3>
                  <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase">Your Nickname</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Change nickname..."
                          value={newNickname}
                          onChange={(e) => setNewNickname(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50 transition-colors"
                        />
                        <button 
                          onClick={() => handleUpdateNickname()} 
                          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                          Save
                        </button>
                      </div>
                      {rewardMessage && <p className="mt-2 text-xs font-bold text-amber-500">{rewardMessage}</p>}
                    </div>
                  </div>
                </div>

                {/* Social Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" /> Community & Friends
                  </h3>
                  
                  <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-white/5">
                    {(['friends', 'requests', 'search'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setSocialTab(tab)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${socialTab === tab ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {tab} {tab === 'requests' && friendRequests.length > 0 && `(${friendRequests.length})`}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 min-h-[200px] flex flex-col">
                    {socialTab === 'friends' && (
                      <div className="space-y-2">
                        {friends.length === 0 ? (
                          <div className="text-center py-10 text-zinc-600 text-[11px] font-mono tracking-wider uppercase">Your friends list is empty.</div>
                        ) : (
                          friends.map(f => (
                            <div key={f.uid} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10">
                                  <User className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white">{f.nickname}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono">{f.email?.slice(0, 15)}...</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setShowChat({ isOpen: true, friendId: f.uid, chatName: f.nickname });
                                  setShowSettingsModal(false);
                                }}
                                className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {socialTab === 'requests' && (
                      <div className="space-y-2">
                        {friendRequests.length === 0 ? (
                          <div className="text-center py-10 text-zinc-600 text-[11px] font-mono tracking-wider uppercase">No pending requests.</div>
                        ) : (
                          friendRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10">
                                  <UserPlus className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white">{req.fromName}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono">Wants to be friends</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => acceptFriendRequest(req)} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => declineFriendRequest(req.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all">
                                  <Ban className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {socialTab === 'search' && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Search by nickname..."
                            value={socialSearchQuery}
                            onChange={(e) => setSocialSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchUsersSocial()}
                            className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50 transition-colors"
                          />
                          <button 
                            onClick={searchUsersSocial}
                            className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl border border-white/5 text-zinc-400 transition-all"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                          {isSearchingUsers ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-amber-500 animate-spin" /></div>
                          ) : userSearchResults.length === 0 && socialSearchQuery.trim() !== '' ? (
                            <div className="text-center py-6 text-zinc-600 text-[10px] font-mono uppercase">No users found.</div>
                          ) : (
                            userSearchResults.map(u => (
                              <div key={u.uid} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10">
                                    <User className="w-4 h-4 text-zinc-500" />
                                  </div>
                                  <div className="text-xs font-bold text-white">{u.nickname || u.email?.split('@')[0]}</div>
                                </div>
                                <button 
                                  onClick={() => sendFriendRequest(u)}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                                >
                                  <UserPlus className="w-3.5 h-3.5" /> Add
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
