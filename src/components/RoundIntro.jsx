import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import { playSwordComboSfx, playSwordSlashSfx, playWhooshSfx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

export default function RoundIntro({ opponent, userAvatar, userNickname, currentRound, roundMessage }) {
  // Localization helper
  const getRoundOrdinal = (idx) => {
    const ordinals = ['ئێکێ', 'دوویێ', 'سێیێ'];
    return ordinals[idx] || 'نوی';
  };

  // SYNC: Trigger Whoosh exactly when the split starts (roundMessage becomes false)
  useEffect(() => {
    if (!roundMessage) {
      playWhooshSfx();
    }
  }, [roundMessage]);

  return (
    <AnimatePresence>
      {roundMessage && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden"
        >
          {/* SCREEN SPLIT PANELS */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: '-100%', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            className="absolute inset-y-0 left-0 w-1/2 bg-[#020617] z-0 border-r border-emerald-500/20 shadow-[10px_0_30px_rgba(16,185,129,0.1)]"
          />
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            className="absolute inset-y-0 right-0 w-1/2 bg-[#020617] z-0 border-l border-red-600/20 shadow-[-10px_0_30px_rgba(220,38,38,0.1)]"
          />

          {/* BACKGROUND PARTICLES/GLOW */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.15 }}
            className="absolute top-1/2 left-0 w-full h-40 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-transparent to-red-600 blur-[100px] z-0"
          />

          {/* DRAMATIC CONTENT */}
          <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
            
            {/* AVATAR TRASH-TALK CLASH */}
            <div className="flex items-center justify-center gap-4 sm:gap-16 w-full max-w-3xl">
              
              {/* YOU (Green Glow) */}
              <motion.div
                initial={{ x: -200, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, scale: 0.75 }}
                onAnimationStart={() => playSwordSlashSfx()}
                transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                  <Avatar 
                    src={userAvatar} 
                    size="2xl" 
                    className="relative border-[6px] border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]" 
                    border={false} 
                  />
                </div>
                <span className="text-emerald-400 font-black text-xl tracking-widest drop-shadow-[0_0_12px_rgba(52,211,153,0.6)] font-noto-sans-arabic">
                  {userNickname}
                </span>
              </motion.div>

              {/* VS SLAM */}
              <motion.div
                initial={{ scale: 8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  rotate: [0, -5, 5, -5, 0],
                  x: [0, -2, 2, -2, 0]
                }}
                onAnimationStart={() => {
                  // Precise timing for the Slam (Matches scale delay 0.3s)
                  setTimeout(() => {
                    playSwordComboSfx();
                    triggerHaptic([50, 80, 50]);
                  }, 300);
                }}
                transition={{ 
                  scale: { duration: 0.4, type: "spring", stiffness: 300, damping: 20, delay: 0.3 },
                  rotate: { duration: 0.2, delay: 0.35 },
                  x: { duration: 0.2, delay: 0.35 }
                }}
                className="flex flex-col items-center relative"
              >
                <div className="text-6xl sm:text-8xl font-black italic select-none">
                  <span className="bg-gradient-to-b from-white via-red-500 to-red-800 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(220,38,38,0.7)]">
                    VS
                  </span>
                </div>
              </motion.div>

              {/* OPPONENT (Red Glow) */}
              <motion.div
                initial={{ x: 200, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, scale: 0.75 }}
                onAnimationStart={() => playSwordSlashSfx()}
                transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-red-600/30 rounded-full blur-xl animate-pulse" />
                  <Avatar 
                    src={opponent?.avatar_url} 
                    size="2xl" 
                    className="relative border-[6px] border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)]" 
                    border={false} 
                  />
                </div>
                <span className="text-red-500 font-black text-xl tracking-widest drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] font-noto-sans-arabic">
                  {opponent?.nickname || 'هەڤڕک'}
                </span>
              </motion.div>
            </div>

            {/* ROUND DESCRIPTION (RABAR FONT) - Positioned at bottom to keep VS centered */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{ 
                y: 0, 
                opacity: 1, 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                y: { delay: 0.6, duration: 0.5 },
                opacity: { delay: 0.6, duration: 0.5 },
                scale: { delay: 1.1, duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute bottom-20 left-0 right-0 flex flex-col items-center"
            >
              <h2 
                style={{ fontFamily: "'Rabar_013', sans-serif" }} 
                className="text-4xl sm:text-6xl font-bold text-white text-center leading-[1.4] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] bg-gradient-to-b from-white to-white/40 bg-clip-text"
              >
                گەڕا {getRoundOrdinal(currentRound)} دەستپێکر
              </h2>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
