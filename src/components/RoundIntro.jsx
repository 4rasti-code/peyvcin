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
          key="tekken-round-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.6 } }}
          className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* 1. THE CINEMATIC SPLIT PANELS (Torn Open Effect) */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ 
              x: '-110%', 
              skewX: -15,
              transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } 
            }}
            style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }}
            className="absolute inset-y-0 left-0 w-[58%] bg-[#020617] z-10 border-r-2 border-emerald-500/40 shadow-[30px_0_60px_rgba(16,185,129,0.2)]"
          >
            {/* Moving Gradient Surface */}
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1], x: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"
            />
          </motion.div>

          <motion.div
            initial={{ x: 0 }}
            exit={{ 
              x: '110%', 
              skewX: 15,
              transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } 
            }}
            style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)' }}
            className="absolute inset-y-0 right-0 w-[58%] bg-[#020617] z-10 border-l-2 border-red-600/40 shadow-[-30px_0_60px_rgba(220,38,38,0.2)]"
          >
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1], x: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-l from-red-600/10 to-transparent"
            />
          </motion.div>

          {/* 2. BACKGROUND VISUALS (Moving Void & Particles) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
             {/* Moving Dark Gradient */}
             <motion.div 
               animate={{ y: [0, -50, 0], opacity: [0.2, 0.4, 0.2] }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]"
             />
             
             {/* HEAVILY POLISHED PARTICLE SYSTEM (Floating Embers) */}
             {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: window.innerHeight + 10,
                    opacity: Math.random() * 0.5 + 0.1
                  }}
                  animate={{ 
                    y: -100, 
                    x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 100}px)`,
                    opacity: [0, 1, 0] 
                  }}
                  transition={{ 
                    duration: Math.random() * 3 + 2, 
                    repeat: Infinity, 
                    delay: Math.random() * 5 
                  }}
                  className={`absolute w-${Math.random() > 0.5 ? '1' : '0.5'} h-${Math.random() > 0.5 ? '1' : '0.5'} rounded-full blur-[1px] ${Math.random() > 0.5 ? 'bg-emerald-400' : 'bg-red-400'}`}
                />
             ))}
          </div>

          {/* 3. CENTER SLAM CONTENT */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center gap-12 sm:gap-20">
            
            {/* AVATAR CLASH (Centered closer) */}
            <div className="flex items-center justify-center gap-6 sm:gap-20 w-full">
              
              {/* YOU */}
              <motion.div
                initial={{ x: -400, opacity: 0, scale: 0.2 }}
                animate={{ x: 0, opacity: 1, scale: 0.65 }}
                exit={{ x: -600, opacity: 0, transition: { duration: 0.5 } }}
                transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-[30px]" 
                  />
                  <Avatar 
                    src={userAvatar} 
                    size="2xl" 
                    className="relative border-[8px] border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.5)] z-10" 
                    border={false} 
                  />
                </div>
                <span className="text-emerald-400 font-black text-2xl tracking-[0.2em] drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] font-rabar">
                  {userNickname}
                </span>
              </motion.div>

              {/* VS TEXT (Tekken Slam) */}
              <motion.div
                initial={{ scale: 15, opacity: 0, filter: 'blur(20px)' }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  filter: 'blur(0px)',
                  rotate: [0, -5, 5, 0],
                }}
                exit={{ scale: 0.2, opacity: 0, transition: { duration: 0.3 } }}
                onAnimationStart={() => {
                  setTimeout(() => {
                    playSwordComboSfx();
                    triggerHaptic([100, 100, 100]); // Ultra strong impact
                  }, 300);
                }}
                transition={{ 
                  scale: { duration: 0.45, ease: "easeIn", delay: 0.35 },
                  rotate: { duration: 0.2, delay: 0.4 }
                }}
                className="relative"
              >
                <span className="text-7xl sm:text-9xl font-black italic select-none bg-gradient-to-b from-white via-red-200 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(255,50,50,0.8)] px-4">
                  VS
                </span>
                {/* Impact Ring */}
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 4, opacity: [0, 0.8, 0] }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="absolute inset-0 border-4 border-white/40 rounded-full blur-[8px]"
                />
              </motion.div>

              {/* OPPONENT */}
              <motion.div
                initial={{ x: 400, opacity: 0, scale: 0.2 }}
                animate={{ x: 0, opacity: 1, scale: 0.65 }}
                exit={{ x: 600, opacity: 0, transition: { duration: 0.5 } }}
                transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-4 bg-red-600/20 rounded-full blur-[30px]" 
                  />
                  <Avatar 
                    src={opponent?.avatar_url} 
                    size="2xl" 
                    className="relative border-[8px] border-red-600 shadow-[0_0_80px_rgba(220,38,38,0.5)] z-10" 
                    border={false} 
                  />
                </div>
                <span className="text-red-500 font-black text-2xl tracking-[0.2em] drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] font-rabar">
                  {opponent?.nickname || 'هەڤڕک'}
                </span>
              </motion.div>
            </div>

            {/* 4. ROUND TEXT (Zoom & Pulse) */}
            <motion.div
              initial={{ scale: 0, opacity: 0, letterSpacing: '40px' }}
              animate={{ 
                scale: [0, 1.2, 1], 
                opacity: 1, 
                letterSpacing: ['40px', '2px', '4px'],
              }}
              exit={{ scale: 3, opacity: 0, transition: { duration: 0.4 } }}
              transition={{ 
                scale: { duration: 0.6, delay: 0.8, ease: "circOut" },
                letterSpacing: { duration: 2, delay: 1.4, repeat: Infinity, repeatType: "reverse" }
              }}
              className="flex flex-col items-center pointer-events-none"
            >
              <h2 className="text-4xl sm:text-7xl font-black text-white text-center font-rabar uppercase tracking-widest bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                گەڕا {getRoundOrdinal(currentRound)} دەستپێکر
              </h2>
              {/* Pulsing Glow Bar under text */}
              <motion.div 
                animate={{ width: ['40%', '100%', '40%'], opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent mt-4"
              />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
