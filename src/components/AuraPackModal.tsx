import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { X, Sparkles, Key, Music, Palette, Shield } from 'lucide-react';
import { playClick, playHover, playCoin, playWin, playSpin } from '../audio';

interface AuraPackModalProps {
  onClose: () => void;
  onReward: (reward: any) => void;
  pityTimer: number;
}

const RARITIES = {
  COMMON: { name: 'Common', color: 'bg-zinc-400', glow: 'shadow-[0_0_30px_rgba(161,161,170,0.8)]', light: 'bg-zinc-400', text: 'text-zinc-400' },
  EPIC: { name: 'Epic', color: 'bg-purple-500', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.8)]', light: 'bg-purple-500', text: 'text-purple-400' },
  LEGENDARY: { name: 'Legendary', color: 'bg-yellow-400', glow: 'shadow-[0_0_50px_rgba(250,204,21,0.8)]', light: 'bg-yellow-400', text: 'text-yellow-400' },
};

const REWARDS = [
  { id: 'theme_liquid_gold', type: 'theme', rarity: 'LEGENDARY', name: 'Liquid Gold Aura', icon: <Palette className="w-12 h-12" /> },
  { id: 'theme_midnight_nebula', type: 'theme', rarity: 'EPIC', name: 'Midnight Nebula Aura', icon: <Palette className="w-12 h-12" /> },
  { id: 'badge_diamond', type: 'badge', rarity: 'EPIC', name: 'Spinning Diamond', icon: <Shield className="w-12 h-12" /> },
  { id: 'badge_whale_pulse', type: 'badge', rarity: 'LEGENDARY', name: 'Pulsing Whale', icon: <Shield className="w-12 h-12" /> },
  { id: 'sfx_synthwave', type: 'sfx', rarity: 'EPIC', name: 'Synthwave Bass Drop', icon: <Music className="w-12 h-12" /> },
  { id: 'sfx_apple_pay', type: 'sfx', rarity: 'COMMON', name: 'High-Fidelity Chime', icon: <Music className="w-12 h-12" /> },
  { id: 'key_fragment', type: 'fragment', rarity: 'COMMON', name: 'Key Fragment', icon: <Key className="w-12 h-12" /> },
];

export default function AuraPackModal({ onClose, onReward, pityTimer }: AuraPackModalProps) {
  const [step, setStep] = useState<'idle' | 'zipping' | 'opening' | 'revealed'>('idle');
  const [rarity, setRarity] = useState<keyof typeof RARITIES>('COMMON');
  const [reward, setReward] = useState<any>(null);
  
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [step]); // Re-run if step changes to ensure measurement is correct when zipper appears

  // Calculate progress: map dragX to 0-1
  // The handle is 48px (w-12), container has px-2 (16px total)
  // Max travel is containerWidth - 48 - 16
  const maxTravel = Math.max(100, containerWidth - 64);
  const progress = useTransform(dragX, [0, maxTravel], [0, 1]);
  
  // Light leak intensity based on progress
  const lightOpacity = useTransform(progress, [0.4, 0.9], [0, 1]);
  const lightScale = useTransform(progress, [0.4, 0.9], [0.8, 1.5]);

  useEffect(() => {
    // Determine rarity when component mounts
    let selectedRarity: keyof typeof RARITIES = 'COMMON';
    const rand = Math.random();
    
    if (pityTimer >= 4) {
      // Guaranteed Epic or Legendary
      selectedRarity = rand < 0.33 ? 'LEGENDARY' : 'EPIC';
    } else {
      if (rand < 0.10) selectedRarity = 'LEGENDARY';
      else if (rand < 0.30) selectedRarity = 'EPIC';
      else selectedRarity = 'COMMON';
    }
    
    setRarity(selectedRarity);

    // Select a reward based on rarity
    const possibleRewards = REWARDS.filter(r => r.rarity === selectedRarity);
    const selectedReward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
    setReward(selectedReward);
  }, []); // Only run once on mount

  const handleDragEnd = () => {
    if (progress.get() > 0.85) {
      // Successfully zipped
      setStep('opening');
      playSpin(); // Play a build-up sound
      
      setTimeout(() => {
        setStep('revealed');
        if (rarity === 'LEGENDARY') {
          playWin(); // Big win sound
        } else {
          playCoin();
        }
        onReward({ ...reward, rarity });
      }, 1500);
    } else {
      // Snap back
      dragX.set(0);
      setStep('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-4"
    >
      {step === 'revealed' && (
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors z-50">
          <X className="w-8 h-8" />
        </button>
      )}

      <div className="relative w-full max-w-md flex flex-col items-center">
        
        {/* The Cube */}
        <AnimatePresence mode="wait">
          {step !== 'revealed' ? (
            <motion.div
              key="cube"
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
              transition={{ duration: 0.5 }}
              className="relative w-64 h-64 mb-12"
            >
              {/* Hover Pulse Effect */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-zinc-800 rounded-3xl blur-2xl"
              />
              
              {/* The Box itself */}
              <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-3xl shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden">
                <Sparkles className="w-16 h-16 text-zinc-700" />
                
                {/* Light Leak */}
                <motion.div 
                  style={{ opacity: lightOpacity, scale: lightScale }}
                  className={`absolute inset-0 ${RARITIES[rarity].light} mix-blend-screen blur-xl`}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reward"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                animate={rarity === 'LEGENDARY' ? { y: [0, -10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-32 h-32 rounded-2xl bg-zinc-900 border-2 border-white/10 flex items-center justify-center mb-6 relative ${RARITIES[rarity].glow}`}
              >
                <div className={`absolute inset-0 opacity-20 ${RARITIES[rarity].color} rounded-2xl blur-md`} />
                <div className={RARITIES[rarity].text}>
                  {reward?.icon}
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
                <h2 className="text-3xl font-black text-white mb-4 drop-shadow-lg">
                  {reward?.name}
                </h2>
                
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-white text-black font-black hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  COLLECT
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Zipper */}
        {(step === 'idle' || step === 'zipping') && (
          <div className="w-full max-w-xs" ref={containerRef}>
            <p className="text-center text-zinc-500 text-xs font-mono mb-4 uppercase tracking-widest">Pull to Open</p>
            <div className="h-16 bg-zinc-950 rounded-full border border-white/10 relative overflow-hidden shadow-inner flex items-center px-2">
              {/* Track background that fills as you pull */}
              <motion.div 
                style={{ scaleX: progress, transformOrigin: 'left' }}
                className={`absolute left-0 top-0 bottom-0 w-full ${RARITIES[rarity].color} opacity-20`}
              />
              
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: maxTravel }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragStart={() => {
                  playHover();
                  setStep('zipping');
                }}
                onDragEnd={handleDragEnd}
                style={{ x: dragX }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
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
