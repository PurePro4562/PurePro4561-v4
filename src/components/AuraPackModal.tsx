import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { X, Sparkles, Key, Music, Palette, Shield, User, Zap, Skull, Crown } from 'lucide-react';
import { playClick, playHover, playCoin, playWin, playSpin, playVFXSound } from '../audio';

export type PackType = 'AURA' | 'AVATAR' | 'VFX' | 'GOD';

interface AuraPackModalProps {
  onClose: () => void;
  onReward: (reward: any) => void;
  pityTimer: number;
  packType?: PackType;
}

const RARITIES = {
  COMMON: { name: 'Common', color: 'bg-zinc-400', glow: 'shadow-[0_0_30px_rgba(161,161,170,0.8)]', light: 'bg-zinc-400', text: 'text-zinc-400' },
  EPIC: { name: 'Epic', color: 'bg-purple-500', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.8)]', light: 'bg-purple-500', text: 'text-purple-400' },
  LEGENDARY: { name: 'Legendary', color: 'bg-yellow-400', glow: 'shadow-[0_0_50_rgba(250,204,21,0.8)]', light: 'bg-yellow-400', text: 'text-yellow-400' },
  GODLY: { name: 'Godly', color: 'bg-amber-500', glow: 'shadow-[0_0_60px_rgba(245,158,11,1)]', light: 'bg-amber-500', text: 'text-amber-500' },
};

const REWARDS = {
  AURA: [
    { id: 'theme_liquid_gold', type: 'theme', rarity: 'LEGENDARY', name: 'Liquid Gold Aura', icon: <Palette className="w-12 h-12" /> },
    { id: 'theme_midnight_nebula', type: 'theme', rarity: 'EPIC', name: 'Midnight Nebula Aura', icon: <Palette className="w-12 h-12" /> },
    { id: 'badge_diamond', type: 'badge', rarity: 'EPIC', name: 'Spinning Diamond', icon: <Shield className="w-12 h-12" /> },
    { id: 'badge_whale_pulse', type: 'badge', rarity: 'LEGENDARY', name: 'Pulsing Whale', icon: <Shield className="w-12 h-12" /> },
    { id: 'sfx_synthwave', type: 'sfx', rarity: 'EPIC', name: 'Synthwave Bass Drop', icon: <Music className="w-12 h-12" /> },
    { id: 'sfx_apple_pay', type: 'sfx', rarity: 'COMMON', name: 'High-Fidelity Chime', icon: <Music className="w-12 h-12" /> },
    { id: 'key_fragment', type: 'fragment', rarity: 'COMMON', name: 'Key Fragment', icon: <Key className="w-12 h-12" /> },
  ],
  AVATAR: [
    { id: 'avatar_hacker', type: 'avatar', rarity: 'COMMON', name: 'Ghost Hacker', icon: <User className="w-12 h-12" /> },
    { id: 'avatar_cyberpunk', type: 'avatar', rarity: 'COMMON', name: 'Neon Samurai', icon: <Zap className="w-12 h-12" /> },
    { id: 'avatar_reaper', type: 'avatar', rarity: 'EPIC', name: 'Digital Reaper', icon: <Skull className="w-12 h-12" /> },
    { id: 'avatar_king', type: 'avatar', rarity: 'LEGENDARY', name: 'Crypto King', icon: <Crown className="w-12 h-12" /> },
    { id: 'key_fragment', type: 'fragment', rarity: 'COMMON', name: 'Key Fragment', icon: <Key className="w-12 h-12" /> },
  ],
  VFX: [
    { id: 'vfx_matrix', type: 'vfx', rarity: 'EPIC', name: 'Matrix Rain', icon: <Zap className="w-12 h-12" /> },
    { id: 'vfx_gold_dust', type: 'vfx', rarity: 'LEGENDARY', name: 'Gold Dust', icon: <Sparkles className="w-12 h-12" /> },
    { id: 'vfx_cyber_glitch', type: 'vfx', rarity: 'EPIC', name: 'Cyber Glitch', icon: <Zap className="w-12 h-12" /> },
    { id: 'vfx_god_rays', type: 'vfx', rarity: 'GODLY', name: 'God Rays', icon: <Sparkles className="w-12 h-12" /> },
    { id: 'key_fragment', type: 'fragment', rarity: 'COMMON', name: 'Key Fragment', icon: <Key className="w-12 h-12" /> },
  ],
  GOD: [
    { id: 'godAura', type: 'theme', rarity: 'GODLY', name: 'God Aura', icon: <Sparkles className="w-12 h-12" /> },
  ]
};

export default function AuraPackModal({ onClose, onReward, pityTimer, packType = 'AURA' }: AuraPackModalProps) {
  const [step, setStep] = useState<'idle' | 'zipping' | 'opening' | 'card' | 'revealed'>('idle');
  const [rarity, setRarity] = useState<keyof typeof RARITIES>('COMMON');
  const [reward, setReward] = useState<any>(null);
  const [isShattered, setIsShattered] = useState(false);
  
  const dragY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(300);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [step]);

  // Calculate progress: map dragY to 0-1 (dragging UP, so dragY will be negative)
  const maxTravel = Math.max(100, containerHeight - 64);
  const progress = useTransform(dragY, [0, -maxTravel], [0, 1]);
  
  // Light leak intensity based on progress
  const lightOpacity = useTransform(progress, [0.4, 0.9], [0, 1]);
  const lightScale = useTransform(progress, [0.4, 0.9], [0.8, 1.5]);

  useEffect(() => {
    let selectedRarity: keyof typeof RARITIES = 'COMMON';
    const rand = Math.random();
    
    if (packType === 'GOD') {
      selectedRarity = 'GODLY';
    } else if (pityTimer >= 4) {
      selectedRarity = rand < 0.33 ? 'LEGENDARY' : 'EPIC';
    } else {
      if (rand < 0.10) selectedRarity = 'LEGENDARY';
      else if (rand < 0.30) selectedRarity = 'EPIC';
      else selectedRarity = 'COMMON';
    }
    
    setRarity(selectedRarity);
    const possibleRewards = REWARDS[packType].filter(r => r.rarity === selectedRarity);
    const selectedReward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
    setReward(selectedReward);
  }, []);

  const handleDragEnd = () => {
    if (progress.get() > 0.85) {
      setStep('opening');
      playSpin();
      
      setTimeout(() => {
        setStep('card');
        if (rarity === 'LEGENDARY' || rarity === 'GODLY') {
          playWin();
        } else {
          playCoin();
        }
      }, 1000);
    } else {
      dragY.set(0);
      setStep('idle');
    }
  };

  const handleShatter = () => {
    if (isShattered) return;
    setIsShattered(true);
    playVFXSound('shatter');
    if (rarity === 'GODLY') playVFXSound('explosion');
    setTimeout(() => {
      setStep('revealed');
      onReward({ ...reward, rarity });
    }, 400);
  };

  const packColors = {
    AURA: 'from-purple-600 to-pink-600',
    AVATAR: 'from-blue-600 to-cyan-600',
    VFX: 'from-emerald-600 to-teal-600',
    GOD: 'from-amber-400 via-orange-500 to-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/95 backdrop-blur-2xl p-4 overflow-hidden"
    >
      {/* Background Particles (Floating Prisms) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, 1000],
              x: Math.random() * 1000,
              rotate: 360,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className={`absolute w-2 h-2 ${RARITIES[rarity].color} blur-sm`}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {step === 'revealed' && (
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors z-50">
          <X className="w-8 h-8" />
        </button>
      )}

      <div className="relative w-full max-w-md flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {step === 'idle' || step === 'zipping' || step === 'opening' ? (
            <motion.div
              key="cube"
              exit={{ scale: 2, opacity: 0, filter: 'blur(40px)' }}
              transition={{ duration: 0.8, ease: "circIn" }}
              className="relative w-64 h-64 mb-12"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className={`absolute inset-0 bg-gradient-to-br ${packColors[packType]} opacity-20 blur-3xl rounded-3xl`}
              />
              
              <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden">
                {packType === 'AURA' && <Sparkles className="w-16 h-16 text-zinc-700" />}
                {packType === 'AVATAR' && <User className="w-16 h-16 text-zinc-700" />}
                {packType === 'VFX' && <Zap className="w-16 h-16 text-zinc-700" />}
                {packType === 'GOD' && <Crown className="w-16 h-16 text-amber-500/50 animate-pulse" />}
                
                {/* Light Leaks */}
                <motion.div 
                  style={{ opacity: lightOpacity, scale: lightScale }}
                  className={`absolute inset-0 ${RARITIES[rarity].light} mix-blend-screen blur-3xl`}
                />
                
                {/* Rays */}
                <AnimatePresence>
                  {step === 'zipping' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          style={{ rotate: i * 45 }}
                          animate={{ scaleX: [1, 2, 1], opacity: [0.2, 0.5, 0.2] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className={`absolute w-full h-1 ${RARITIES[rarity].light} blur-md origin-center`}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : step === 'card' ? (
            <motion.div
              key="card"
              initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              className="relative w-64 h-96 cursor-pointer group"
              onClick={handleShatter}
            >
              {/* Holographic Glass Card */}
              <motion.div 
                animate={isShattered ? { scale: 1.5, opacity: 0 } : {}}
                className="absolute inset-0 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                <div className="text-zinc-500 font-black text-xs tracking-widest uppercase mb-4 opacity-50">Locked Reward</div>
                <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center border border-white/10">
                  <Key className="w-8 h-8 text-zinc-600 animate-pulse" />
                </div>
                <div className="mt-8 text-white/30 text-[10px] font-mono uppercase tracking-tighter">Tap to Shatter</div>
                
                {/* Shine Effect */}
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                />
              </motion.div>

              {/* Shatter Particles */}
              {isShattered && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 400, 
                        y: (Math.random() - 0.5) * 400, 
                        opacity: 0,
                        rotate: 360
                      }}
                      className="absolute w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rotate-45"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reward"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              {/* Legendary Explosion Background */}
              {(rarity === 'LEGENDARY' || rarity === 'GODLY') && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 4, opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1 }}
                  className={`absolute w-64 h-64 ${RARITIES[rarity].light} rounded-full blur-3xl`}
                />
              )}

              <motion.div 
                animate={(rarity === 'LEGENDARY' || rarity === 'GODLY') ? { y: [0, -15, 0], rotate: [0, 2, -2, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3 }}
                className={`w-40 h-40 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border-2 border-white/10 flex items-center justify-center mb-8 relative ${RARITIES[rarity].glow}`}
              >
                <div className={`absolute inset-0 opacity-20 ${RARITIES[rarity].color} rounded-3xl blur-xl`} />
                <div className={RARITIES[rarity].text}>
                  {React.cloneElement(reward?.icon as React.ReactElement, { className: "w-20 h-20" })}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className={`text-sm font-black tracking-widest uppercase mb-2 ${RARITIES[rarity].text}`}>
                  {RARITIES[rarity].name}
                </h3>
                <h2 className="text-4xl font-black text-white mb-6 drop-shadow-2xl">
                  {reward?.name}
                </h2>
                
                <button
                  onClick={onClose}
                  className="px-12 py-4 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                  COLLECT
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Vertical Zipper */}
        {(step === 'idle' || step === 'zipping') && (
          <div className="w-full max-w-[100px] mt-12" ref={containerRef}>
            <p className="text-center text-zinc-500 text-[10px] font-mono mb-4 uppercase tracking-[0.3em] vertical-text">Pull Up</p>
            <div className="w-16 h-64 bg-zinc-950 rounded-full border border-white/10 relative overflow-hidden shadow-inner flex flex-col items-center py-2 mx-auto">
              {/* Track background */}
              <motion.div 
                style={{ scaleY: progress, transformOrigin: 'bottom' }}
                className={`absolute left-0 right-0 bottom-0 w-full ${RARITIES[rarity].color} opacity-20`}
              />
              
              <motion.div
                drag="y"
                dragConstraints={{ top: -maxTravel, bottom: 0 }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragStart={() => {
                  playHover();
                  setStep('zipping');
                }}
                onDragEnd={handleDragEnd}
                style={{ y: dragY }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
              >
                <div className="w-4 h-4 rounded-full bg-zinc-900" />
              </motion.div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
