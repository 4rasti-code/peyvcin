import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { MEDALS } from '../constants/medals';
import { triggerHaptic } from '../utils/haptics';
import { useAudio } from '../context/AudioContext';
import { useGame } from '../context/GameContext';
import { useUser } from '../context/AuthContext';
import CinematicAchievementOverlay from './CinematicAchievementOverlay';

export default function MedalsView({ onViewChange }) {
   const { playSettingsCloseSound } = useAudio();
   const { profileData } = useUser();
   const { claimedMedals, claimMedal, level, playerStats } = useGame();

   const [activeOverlay, setActiveOverlay] = useState(null);

   const handleClaimMedal = (medal) => {
      setActiveOverlay(medal);
   };

   const container = {
      hidden: { opacity: 0 },
      show: {
         opacity: 1,
         transition: { staggerChildren: 0.1 }
      }
   };

   const item = {
      hidden: { opacity: 0, scale: 0.8 },
      show: { opacity: 1, scale: 1 }
   };

   return (
      <div className="min-h-screen bg-mono-50 dark:bg-[#0a0a0c] flex flex-col items-center safe-top safe-bottom overflow-x-hidden transition-colors duration-500 relative" dir="rtl">
         {/* Background Texture for PUBG Tactical Feel */}
         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-mono-50 to-mono-100 dark:from-[#1a1a24] dark:via-[#0a0a0c] dark:to-mono-black opacity-80 dark:opacity-40" />
         <div className="absolute inset-0 noise-grain opacity-[0.03] dark:opacity-5 pointer-events-none" />

         {/* Header */}
         <div className="w-full flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+8px)] pb-2 sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-mono-200 dark:border-[#2a2a35] shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <button
               onClick={() => { triggerHaptic(10); if (playSettingsCloseSound) playSettingsCloseSound(); onViewChange('profile'); }}
               className="w-10 h-10 rounded-[8px] bg-mono-100 dark:bg-[#1a1a24] border border-mono-200 dark:border-[#2a2a35] flex items-center justify-center text-mono-600 dark:text-mono-400 hover:text-mono-900 dark:hover:text-white hover:bg-mono-200 dark:hover:bg-[#2a2a35] transition-all active:scale-90 shadow-inner"
            >
               <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="flex flex-col items-center">
               <h2 className="text-xl font-black font-rabar text-mono-900 dark:text-white uppercase drop-shadow-sm dark:drop-shadow-md">پلە</h2>
            </div>
            <div className="w-10" />
         </div>

         <div className="w-full overflow-y-auto no-scrollbar pb-40 px-4 sm:px-6 pt-6 relative z-10">
            <Motion.div
               variants={container}
               initial="hidden"
               animate="show"
               className="flex flex-col gap-3"
            >
               {MEDALS.map((m) => {
                  const displayData = { ...(profileData || {}), ...(playerStats || {}), level };
                  const isUnlocked = m.condition(displayData);
                  const isClaimable = isUnlocked && !claimedMedals.includes(m.id);

                  return (
                     <Motion.div
                        key={m.id}
                        variants={item}
                        className={`relative flex flex-row items-center justify-between py-4 px-4 gap-4 transition-all duration-300 border-2 rounded-[12px] bg-linear-to-b from-white to-mono-50 dark:from-[#1a1a24] dark:to-[#0f0f14] overflow-hidden group
                           ${isUnlocked ? 'border-mono-300 dark:border-[#3a3a48] shadow-md dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : 'border-mono-200 dark:border-[#1a1a24] opacity-60 grayscale'}
                           ${isClaimable ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}
                        `}
                     >
                        {/* Tactical Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-mono-500/30 rounded-tl-[10px]" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-mono-500/30 rounded-tr-[10px]" />

                        {/* Glow Background for Unlocked */}
                        {isUnlocked && (
                           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                        )}

                        {/* Icon Container */}
                        <div className="relative flex items-center justify-center min-w-[72px] min-h-[72px] shrink-0 z-10">
                           {isClaimable ? (
                              <div className="relative flex flex-col items-center justify-center w-full h-full">
                                 <m.IconComponent className="w-16 h-16 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform duration-500" size={64} disabled={false} />

                                 <Motion.button
                                    onClick={(e) => { e.stopPropagation(); triggerHaptic(20); handleClaimMedal(m); }}
                                    animate={{
                                       boxShadow: ["0px 0px 5px rgba(245,158,11,0.5)", "0px 0px 20px rgba(245,158,11,1)", "0px 0px 5px rgba(245,158,11,0.5)"]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-sm font-black text-white text-[12px] active:scale-95 transition-transform z-20 whitespace-nowrap border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.8)] clip-path-tactical"
                                    style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
                                 >
                                    وەرگرە
                                 </Motion.button>
                              </div>
                           ) : (
                              <m.IconComponent className="w-16 h-16 drop-shadow-md transition-transform duration-500 group-hover:scale-105" size={64} disabled={!isUnlocked} />
                           )}
                        </div>

                        {/* Text and Condition Container */}
                        <div className="flex flex-col items-start justify-center flex-1 w-full z-10 min-w-0">
                           <span className={`text-[16px] font-black font-rabar mb-1.5 drop-shadow-sm truncate w-full ${isUnlocked ? 'text-mono-900 dark:text-white' : 'text-mono-500 dark:text-mono-500'}`}>
                              {m.name}
                           </span>

                           <div className="w-full bg-mono-100 dark:bg-[#0a0a0c] py-1.5 px-3 rounded-sm border border-mono-200 dark:border-[#2a2a35]">
                              <span className="block text-[11px] font-bold text-mono-500 dark:text-mono-400 leading-tight">
                                 {m.tooltip}
                              </span>
                           </div>
                        </div>
                     </Motion.div>
                  );
               })}
            </Motion.div>
         </div>

         {/* Cinematic Overlay for Claiming */}
         <AnimatePresence>
            {activeOverlay && (
               <CinematicAchievementOverlay
                  Icon={activeOverlay.IconComponent}
                  title={activeOverlay.name}
                  medalId={activeOverlay.id}
                  onContinue={() => {
                     claimMedal(activeOverlay.id, activeOverlay.rewardAmount);
                     setActiveOverlay(null);
                  }}
               />
            )}
         </AnimatePresence>

      </div>
   );
}
