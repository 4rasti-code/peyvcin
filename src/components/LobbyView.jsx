import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { DerhemIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import FloatingLetterBackground from './FloatingLetterBackground';

export default function LobbyView({ 
  onStartClassic, 
  onStartMamak,
  onStartHardWords, 
  onStartSecretWord, 
  onStartWordFever, 
  onStartMultiplayer, // Handle matchmaking
  onSocialClick, 
  onDailyRewardClick,
  dailyStreak,
  onViewChange,
  notificationCount = 0,
  winsTowardsSecret = 0
}) {
  const bgRef = useRef(null);
  
  const handleBackgroundClick = (e) => {
    // Only trigger if clicking the direct container to avoid button double-triggers
    if (e.target === e.currentTarget || e.target.classList.contains('bg-trigger-zone')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      bgRef.current?.pulse(x, y);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };

  const bentoMotionProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  const isSecretUnlocked = winsTowardsSecret >= 3;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onClick={handleBackgroundClick}
      className="flex-1 w-full max-w-full px-4 pt-4 pb-4 overflow-x-hidden bg-[#020617] relative h-full bg-trigger-zone"
    >
      <FloatingLetterBackground ref={bgRef} />

      <div className="relative z-10">
        <div className="grid grid-cols-2 gap-4">
          
          {/* ONLINE MULTIPLAYER (NEW) */}
          <motion.button 
            variants={itemVariants}
            onClick={() => { triggerHaptic(15); onStartMultiplayer(); }}
            {...bentoMotionProps}
            className="col-span-2 relative h-28 rounded-md overflow-hidden bg-linear-to-r from-emerald-500 to-teal-600 shadow-xl group border-none"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
            <div className="relative z-10 flex items-center justify-between px-8 h-full">
              <div className="flex flex-col items-start">
                <h3 className="text-2xl font-black font-heading text-white">ھەڤڕکی</h3>
                <span className="text-[10px] font-medium font-rabar uppercase tracking-[0.2em] text-emerald-100/70 leading-none">BATTLE (ONLINE)</span>
              </div>
              <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-all duration-300">
                <span className="material-symbols-outlined text-4xl text-white">groups</span>
              </div>
            </div>
            
            {/* Animated Pulse Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-4 border-white/10 rounded-md animate-pulse pointer-events-none" />
          </motion.button>


          {/* CLASSIC MODE */}
          <motion.button 
            variants={itemVariants}
            onClick={() => { triggerHaptic(10); onStartClassic(); }}
            {...bentoMotionProps}
            className="col-span-2 relative h-24 rounded-md overflow-hidden bg-[#ffcc00] shadow-xl group border-none"
          >
            <div className="relative z-10 flex items-center justify-between px-8 h-full">
              <div className="flex flex-col items-start">
                <h3 className="text-xl font-black font-heading text-amber-950">پەیڤچن</h3>
                <span className="text-[9px] font-medium font-rabar uppercase text-amber-900/80 leading-none">کلاسیک</span>
              </div>
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center border border-white/30 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-3xl text-amber-950">videogame_asset</span>
              </div>
            </div>
          </motion.button>

          {/* MAMAK MODE */}
          <motion.button 
            variants={itemVariants}
            onClick={() => { triggerHaptic(10); onStartMamak(); }}
            {...bentoMotionProps}
            className="col-span-2 relative h-24 rounded-md overflow-hidden bg-[#22c55e] shadow-xl group border-none"
          >
            <div className="relative z-10 flex items-center justify-between px-8 h-full">
              <div className="flex flex-col items-start">
                <h3 className="text-xl font-black font-heading text-white">مامک</h3>
                <span className="text-[9px] font-medium font-rabar uppercase text-white/50 leading-none">پەیدا بکە</span>
              </div>
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center border border-white/30 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-3xl text-white">emoji_objects</span>
              </div>
            </div>
          </motion.button>

          {/* HARD MODE */}
          <motion.button 
            variants={itemVariants}
            onClick={() => { triggerHaptic(10); onStartHardWords(); }}
            {...bentoMotionProps}
            className="col-span-1 relative h-36 rounded-md overflow-hidden bg-[#ef4444] shadow-xl group border-none"
          >
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="w-11 h-11 rounded-md bg-white/20 flex items-center justify-center border border-white/30 group-hover:rotate-6 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl text-white">workspace_premium</span>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-black font-heading text-white">پەیڤێن دژوار</h3>
                <span className="text-[9px] font-medium font-rabar uppercase text-white/50 mt-1 leading-none">بۆ شارەزایان</span>
              </div>
            </div>
          </motion.button>

          {/* WORD FEVER MODE */}
          <motion.button 
            variants={itemVariants}
            onClick={() => { triggerHaptic(10); onStartWordFever(); }}
            {...bentoMotionProps}
            className="col-span-1 relative h-36 rounded-md overflow-hidden bg-[#0ea5e9] shadow-xl group border-none"
          >
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="w-11 h-11 rounded-md bg-white/20 flex items-center justify-center border border-white/30 group-hover:scale-105 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl text-white">electric_bolt</span>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-black font-heading text-white">تایا پەیڤان</h3>
                <span className="text-[9px] font-medium font-rabar uppercase text-white/50 mt-1 leading-none">بەرھەڤ بە</span>
              </div>
            </div>
          </motion.button>

          {/* SECRET MODE - Progressive Unlock */}
          <motion.button 
            variants={itemVariants}
            disabled={!isSecretUnlocked}
            onClick={() => { triggerHaptic(10); if (isSecretUnlocked) onStartSecretWord(); }}
            {...(isSecretUnlocked ? bentoMotionProps : {})}
            className={`col-span-2 relative h-24 rounded-md overflow-hidden transition-all duration-500 shadow-xl border-none ${
              isSecretUnlocked 
                ? 'bg-linear-to-br from-[#2e1065] to-[#4c1d95] border-2 border-yellow-400/50 shadow-[0_0_40px_rgba(0,0,0,0.8)]' 
                : 'bg-white/5 border border-white/10 backdrop-blur-md opacity-80'
            }`}
          >
            <div className="relative z-10 flex items-center justify-between px-8 h-full">
              <div className="flex flex-col items-start text-right">
                <h3 className={`text-xl font-black font-heading ${isSecretUnlocked ? 'text-white' : 'text-white/40'}`}>پەیڤا نھێنی</h3>
                
                {/* Unlock Progress Dots */}
                <div className="flex items-center gap-1.5 mt-1 bg-black/20 px-2.5 py-1 rounded-full border border-white/10">
                  {[1, 2, 3].map((dot) => (
                    <div 
                      key={dot}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                        dot <= winsTowardsSecret 
                          ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                  {!isSecretUnlocked && (
                    <span className="text-[8px] font-bold text-white/30 mr-2 uppercase">
                      {winsTowardsSecret}/٣
                    </span>
                  )}
                </div>
              </div>

              <div className={`w-11 h-11 rounded-md flex items-center justify-center border transition-all duration-500 ${
                isSecretUnlocked 
                  ? 'bg-yellow-400/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-pulse' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <span className={`material-symbols-outlined text-2xl transition-all ${
                  isSecretUnlocked ? 'text-yellow-400 scale-110' : 'text-white/20'
                }`}>
                  {isSecretUnlocked ? 'vpn_key' : 'lock'}
                </span>
              </div>
            </div>

            {/* Golden Key Glow Background for Unlocked state */}
            {isSecretUnlocked && (
              <div className="absolute inset-0 bg-linear-to-r from-yellow-400/5 to-transparent pointer-events-none" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
