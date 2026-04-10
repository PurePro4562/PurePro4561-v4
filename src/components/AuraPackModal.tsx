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
  upgradeTrigger?: number;
}

const RARITIES = {
  COMMON: { name: 'Common', color: 'bg-zinc-400', glow: 'shadow-[0_0_30px_rgba(161,161,170,0.8)]', light: 'bg-zinc-400', text: 'text-zinc-400', core: 'white' },
  EPIC: { name: 'Epic', color: 'bg-purple-500', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.8)]', light: 'bg-purple-500', text: 'text-purple-400', core: 'violet' },
  LEGENDARY: { name: 'Legendary', color: 'bg-yellow-400', glow: 'shadow-[0_0_50_rgba(250,204,21,0.8)]', light: 'bg-yellow-400', text: 'text-yellow-400', core: 'gold' },
  GODLY: { name: 'Godly', color: 'bg-amber-500', glow: 'shadow-[0_0_60px_rgba(245,158,11,1)]', light: 'bg-amber-500', text: 'text-amber-500', core: 'amber' },
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

const RARITY_COLORS = {
  COMMON: '#a1a1aa',
  EPIC: '#a855f7',
  LEGENDARY: '#eab308',
  GODLY: '#f59e0b'
};

export default function AuraPackModal({ onClose, onReward, pityTimer, packType = 'AURA', upgradeTrigger = 0 }: AuraPackModalProps) {
  const [step, setStep] = useState<'idle' | 'squeezing' | 'breaching' | 'core_glow' | 'revealed'>('idle');
  const [rarity, setRarity] = useState<keyof typeof RARITIES>('COMMON');
  const [reward, setReward] = useState<any>(null);
  const [isShattered, setIsShattered] = useState(false);
  const [polishIntensity, setPolishIntensity] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const squeezeValue = useMotionValue(1);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  const pressurePathLength = useTransform(squeezeValue, [1, 0.7], [0, 1]);
  const pressureOpacity = useTransform(squeezeValue, [1, 0.75], [0, 0.5]);
  
  const fracturePathLength = useTransform(squeezeValue, [1, 0.7], [0, 1]);
  const fractureOpacity = useTransform(squeezeValue, [1, 0.8], [0, 0.5]);

  const gaugeHeight = useTransform(squeezeValue, [1, 0.7], ['0%', '100%']);
  const gaugeOpacity = useTransform(squeezeValue, [1, 0.7], [0, 0.3]);

  const cardReflectionX = useTransform(mouseX, [-300, 300], [100, -100]);
  const cardReflectionY = useTransform(mouseY, [-300, 300], [100, -100]);
  
  const appleEasing = [0, 0, 0, 1];

  const rollReward = (forceEpic = false) => {
    let selectedRarity: keyof typeof RARITIES = 'COMMON';
    const rand = Math.random();
    
    if (forceEpic) {
      selectedRarity = 'EPIC';
    } else if (packType === 'GOD') {
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
    return selectedReward;
  };

  useEffect(() => {
    rollReward();
    const hintTimer = setTimeout(() => setShowHint(true), 3000);
    
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(hintTimer);
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (upgradeTrigger > 0) {
      const newReward = rollReward(true);
      setStep('core_glow');
      setPolishIntensity(0);
      playVFXSound('shimmer');
      
      setTimeout(() => {
        setStep('revealed');
        onReward(newReward);
      }, 2000);
    }
  }, [upgradeTrigger]);

  const handleSqueezeStart = () => {
    setStep('squeezing');
    playVFXSound('slide');
  };

  const handleSqueezeEnd = () => {
    if (squeezeValue.get() < 0.75) {
      triggerBreach();
    } else {
      setStep('idle');
      squeezeValue.set(1);
    }
  };

  const triggerBreach = () => {
    setStep('breaching');
    playVFXSound('hiss');
    
    setTimeout(() => {
      setStep('core_glow');
      playVFXSound('thud');
      if (rarity === 'LEGENDARY' || rarity === 'GODLY') {
        playVFXSound('chime');
      }
      
      setTimeout(() => {
        setStep('revealed');
        onReward({ ...reward, rarity });
      }, 2000);
    }, 1200);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);

    if (step === 'revealed') {
      setPolishIntensity(prev => Math.min(prev + 0.05, 1));
      if (Math.random() > 0.8) playVFXSound('spark');
    }
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
      className={`fixed inset-0 z-[120] flex items-center justify-center transition-colors duration-1000 ${step === 'breaching' || step === 'core_glow' ? 'bg-black' : 'bg-zinc-950/95'} backdrop-blur-2xl p-4 overflow-hidden touch-none`}
      onMouseMove={handleMouseMove}
    >
      {/* Digital Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

      {/* Background Dimming for Ritual */}
      {(step === 'breaching' || step === 'core_glow') && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          className="absolute inset-0 bg-black z-0"
        />
      )}

      <div className="relative w-full max-w-2xl flex flex-col items-center z-[130]">
        
        <AnimatePresence>
          {step === 'idle' || step === 'squeezing' ? (
            <motion.div
              key="cube-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
              transition={{ duration: 0.8, ease: appleEasing }}
              className="relative perspective-[1000px]"
            >
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragStart={handleSqueezeStart}
                onDragEnd={handleSqueezeEnd}
                onUpdate={(latest) => {
                  const y = typeof latest.y === 'number' ? latest.y : 0;
                  // Extreme sensitivity: 80px for full effect to prevent scroll conflict
                  const squeeze = 1 - Math.abs(y) / 80;
                  squeezeValue.set(Math.max(0.5, squeeze));
                }}
                style={{ 
                  scale: squeezeValue,
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d'
                }}
                className="w-64 h-64 cursor-grab active:cursor-grabbing relative group touch-none"
              >
                {/* 3D Glass Cube Faces */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${packColors[packType]} opacity-10`} />
                  
                  {/* Pressure Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <motion.circle
                      cx="128"
                      cy="128"
                      r="110"
                      stroke="white"
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray="690"
                      style={{ 
                        pathLength: pressurePathLength,
                        opacity: pressureOpacity
                      }}
                    />
                  </svg>

                  {/* Light Fractures */}
                  {step === 'squeezing' && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <motion.path
                        d="M 32 32 L 128 128 M 224 32 L 128 128 M 32 224 L 128 128 M 224 224 L 128 128"
                        stroke={RARITY_COLORS[rarity]}
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 - squeezeValue.get() }}
                        className="opacity-50"
                      />
                    </svg>
                  )}

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 relative overflow-hidden">
                      {/* Pressure Gauge Fill */}
                      <motion.div 
                        style={{ 
                          height: gaugeHeight,
                          opacity: gaugeOpacity
                        }}
                        className={`absolute bottom-0 left-0 right-0 ${RARITIES[rarity].color}`}
                      />
                      {packType === 'AURA' && <Sparkles className="w-8 h-8 text-white/50 relative z-10" />}
                      {packType === 'AVATAR' && <User className="w-8 h-8 text-white/50 relative z-10" />}
                      {packType === 'VFX' && <Zap className="w-8 h-8 text-white/50 relative z-10" />}
                      {packType === 'GOD' && <Crown className="w-8 h-8 text-amber-500/50 animate-pulse relative z-10" />}
                    </div>
                    <motion.span 
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: squeezeValue.get() < 0.75 ? 1.1 : 1
                      }}
                      className={`text-[10px] font-black tracking-[0.4em] uppercase transition-colors ${squeezeValue.get() < 0.75 ? 'text-white' : 'text-white/30'}`}
                    >
                      {squeezeValue.get() < 0.75 ? 'Release to Breach' : 'Squeeze to Breach'}
                    </motion.span>
                  </div>
                </div>

                {/* Vibration Effect */}
                {step === 'squeezing' && (
                  <motion.div
                    animate={{ x: [-2, 2, -2], y: [1, -1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.05 }}
                    className="absolute inset-0 pointer-events-none"
                  />
                )}

                {/* Interaction Hint */}
                <AnimatePresence>
                  {showHint && step === 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                    >
                      <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1"
                      >
                        <div className="w-1 h-2 bg-white/50 rounded-full" />
                      </motion.div>
                      <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">Drag Down</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : step === 'breaching' ? (
            <motion.div
              key="breach"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex items-center justify-center"
            >
              <motion.div 
                animate={{ scale: [1, 4], opacity: [0.8, 0] }}
                transition={{ duration: 1, ease: "easeOut", repeat: Infinity }}
                className={`absolute w-64 h-64 rounded-full border-4 border-white blur-3xl`}
                style={{ backgroundColor: RARITY_COLORS[rarity] || '#ffffff' }}
              />
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="relative z-10 text-white font-black text-4xl tracking-[0.8em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              >
                Breaching
              </motion.div>
            </motion.div>
          ) : step === 'core_glow' ? (
            <motion.div
              key="core"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-96 h-96 flex items-center justify-center"
            >
              {/* Core Glow Variants */}
              {rarity === 'COMMON' && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-32 h-32 bg-white rounded-full blur-3xl"
                />
              )}
              {rarity === 'EPIC' && (
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    className="absolute inset-0 bg-indigo-500/30 rounded-full blur-3xl"
                  />
                </div>
              )}
              {(rarity === 'LEGENDARY' || rarity === 'GODLY') && (
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="w-64 h-64 bg-yellow-400/40 rounded-full blur-[100px]"
                  />
                  {/* Light Leaks */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, rotate: i * 60 }}
                      animate={{ opacity: [0, 0.4, 0], scaleX: [1, 5] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                      className="absolute top-1/2 left-1/2 w-full h-1 bg-white/50 blur-xl origin-left"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reward-ritual"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="flex flex-col items-center text-center"
            >
              {/* Glass Card with Parallax */}
              <motion.div
                style={{ 
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d'
                }}
                className="relative w-72 h-[450px] group mb-12"
              >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8">
                  {/* Polish Shine Overlay */}
                  <motion.div 
                    style={{ opacity: polishIntensity }}
                    className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/20 pointer-events-none"
                  />
                  
                  {/* Card Content */}
                  <div className={`w-32 h-32 rounded-3xl bg-zinc-900/50 flex items-center justify-center mb-8 relative ${RARITIES[rarity].glow}`}>
                    <div className={`absolute inset-0 opacity-20 ${RARITIES[rarity].color} rounded-3xl blur-xl`} />
                    <div className={RARITIES[rarity].text}>
                      {React.cloneElement(reward?.icon as React.ReactElement, { className: "w-16 h-16" })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-[10px] font-black tracking-[0.5em] uppercase ${RARITIES[rarity].text}`}>
                      {RARITIES[rarity].name}
                    </h3>
                    <h2 className="text-3xl font-black text-white leading-tight">
                      {reward?.name}
                    </h2>
                  </div>

                  <div className="mt-auto pt-8 w-full">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${polishIntensity * 100}%` }}
                        className={`h-full ${RARITIES[rarity].color}`}
                      />
                    </div>
                    <p className="text-[8px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">Rub to Polish</p>
                  </div>
                </div>

                {/* Parallax Light Reflection */}
                <motion.div 
                  style={{ 
                    x: cardReflectionX,
                    y: cardReflectionY
                  }}
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"
                />
              </motion.div>
              
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); onClose(); }}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg hover:bg-zinc-200 transition-all shadow-2xl hover:scale-[1.02] active:scale-95"
                >
                  COLLECT REWARD
                </button>

                {/* Removed ad upgrade button */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-white/20"
                />
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}

