import React from 'react';
import { motion } from 'framer-motion';
import { DerhemIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';

export default function LobbyView({ 
  onStartClassic, 
  onStartMamak,
  onStartHardWords, 
  onStartSecretWord, 
  onStartWordFever, 
  onSocialClick, 
  onMissionsClick,
  dailyWinsCount, 
  dailyStreak,
  onViewChange,
  notificationCount = 0,
  mamakLevel = 1,
  hardWordsLevel = 1,
  wordFeverLevel = 1,
  secretWordLevel = 1,
  winsTowardsSecret = 0
}) {
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
      className="flex-1 w-full max-w-full px-4 pt-4 pb-4 overflow-x-hidden"
    >
      <div className="grid grid-cols-2 gap-4">
        
        {/* DAILY MISSIONS BENTO TILE */}
        <motion.button 
          variants={itemVariants}
          onClick={() => { triggerHaptic(20); onMissionsClick(); }}
          {...bentoMotionProps}
          className="col-span-2 relative h-24 rounded-[40px] overflow-hidden bg-slate-900 border border-white/10 shadow-xl group border-none"
        >
           {/* Animated Mesh Gradient Background */}
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-slate-900 pointer-events-none" />
           
           <div className="relative z-10 flex items-center justify-between px-8 h-full">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-amber-400/20 flex items-center justify-center border border-amber-400/30 group-hover:rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-3xl text-amber-400">stars</span>
                 </div>
                 <div className="flex flex-col items-start translate-y-[-2px]">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none mb-1">ئەرکێن نۆکە</span>
                    <h3 className="text-2xl font-black text-white/90 leading-none uppercase">Daily Missions</h3>
                 </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full w-[60%] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                    </div>
                 </div>
                 <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Rewards Ready</span>
              </div>
           </div>
        </motion.button>

        {/* CLASSIC MODE */}
        <motion.button 
          variants={itemVariants}
          onClick={() => { triggerHaptic(10); onStartClassic(); }}
          {...bentoMotionProps}
          className="col-span-2 relative h-36 rounded-[40px] overflow-hidden bg-[#ffcc00] shadow-xl group border-none"
        >
          <div className="relative z-10 flex items-center justify-between px-10 h-full">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-2xl font-black font-heading text-amber-950">پەیڤچن</h3>
              <span className="text-[10px] font-medium font-rabar uppercase tracking-[0.2em] text-amber-900/80 leading-none">کلاسیک</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl text-amber-950">videogame_asset</span>
            </div>
          </div>
        </motion.button>

        {/* MAMAK MODE */}
        <motion.button 
          variants={itemVariants}
          onClick={() => { triggerHaptic(10); onStartMamak(); }}
          {...bentoMotionProps}
          className="col-span-2 relative h-36 rounded-[40px] overflow-hidden bg-[#22c55e] shadow-xl group border-none"
        >
          <div className="relative z-10 flex items-center justify-between px-10 h-full">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-2xl font-black font-heading text-white">مامک</h3>
              <span className="text-[10px] font-medium font-rabar uppercase tracking-[0.2em] text-white/80 leading-none">ئاستێ {mamakLevel}</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl text-white">emoji_objects</span>
            </div>
          </div>
        </motion.button>

        {/* HARD MODE */}
        <motion.button 
          variants={itemVariants}
          onClick={() => { triggerHaptic(10); onStartHardWords(); }}
          {...bentoMotionProps}
          className="col-span-1 relative h-44 rounded-[40px] overflow-hidden bg-[#ef4444] shadow-xl group border-none"
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 group-hover:rotate-12 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-3xl text-white">workspace_premium</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-xl font-black font-heading text-white">پەیڤێن دژوار</h3>
              <span className="text-[10px] font-medium font-rabar uppercase tracking-wider text-white/80 mt-1 leading-none">ئاستێ {hardWordsLevel}</span>
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/20 mt-1">
                <DerhemIcon className="w-3 h-3 saturate-[0] brightness-[100]" />
                <span className="text-xs font-black text-white font-ui">{dailyStreak}</span>
              </div>
            </div>
          </div>
        </motion.button>

        {/* WORD FEVER MODE */}
        <motion.button 
          variants={itemVariants}
          onClick={() => { triggerHaptic(10); onStartWordFever(); }}
          {...bentoMotionProps}
          className="col-span-1 relative h-44 rounded-[40px] overflow-hidden bg-[#0ea5e9] shadow-xl group border-none"
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-3xl text-white">electric_bolt</span>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-black font-heading text-white">تایا پەیڤان</h3>
              <span className="text-[10px] font-medium font-rabar uppercase tracking-widest text-white/80 mt-1 leading-none">ئاستێ {wordFeverLevel}</span>
            </div>
          </div>
        </motion.button>

        {/* SECRET MODE - Progressive Unlock */}
        <motion.button 
          variants={itemVariants}
          disabled={!isSecretUnlocked}
          onClick={() => { triggerHaptic(10); if (isSecretUnlocked) onStartSecretWord(); }}
          {...(isSecretUnlocked ? bentoMotionProps : {})}
          className={`col-span-2 relative h-36 rounded-[40px] overflow-hidden transition-all duration-500 shadow-xl border-none ${
            isSecretUnlocked 
              ? 'bg-gradient-to-br from-[#2e1065] to-[#4c1d95] border-2 border-yellow-400/50 shadow-[0_0_40px_rgba(0,0,0,0.8)]' 
              : 'bg-white/5 border border-white/10 backdrop-blur-md opacity-80'
          }`}
        >
          <div className="relative z-10 flex items-center justify-between px-8 h-full">
            <div className="flex flex-col items-start gap-1 text-left rtl:text-right">
              <h3 className={`text-2xl font-black font-heading ${isSecretUnlocked ? 'text-white' : 'text-white/40'}`}>پەیڤا نھێنی</h3>
              
              {/* Unlock Progress Dots */}
              <div className="flex items-center gap-1.5 mt-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                {[1, 2, 3].map((dot) => (
                  <div 
                    key={dot}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      dot <= winsTowardsSecret 
                        ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                        : 'bg-white/10'
                    }`}
                  />
                ))}
                {!isSecretUnlocked && (
                  <span className="text-[10px] font-bold text-white/30 mr-2 uppercase tracking-widest">
                    {winsTowardsSecret}/٣ سەرکەفتن
                  </span>
                )}
              </div>
            </div>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
              isSecretUnlocked 
                ? 'bg-yellow-400/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-pulse' 
                : 'bg-white/5 border-white/10'
            }`}>
              <span className={`material-symbols-outlined text-3xl transition-all ${
                isSecretUnlocked ? 'text-yellow-400 scale-110' : 'text-white/20'
              }`}>
                {isSecretUnlocked ? 'vpn_key' : 'lock'}
              </span>
            </div>
          </div>

          {/* Golden Key Glow Background for Unlocked state */}
          {isSecretUnlocked && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent pointer-events-none" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
