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
            
            {/* AVATAR CLASH (Centered much closer) */}
            <div className="flex items-center justify-center gap-0 sm:gap-4 w-full relative">
              
              {/* YOU (Player 1 / Right in RTL) */}
              <motion.div
                initial={{ x: 400, opacity: 0, scale: 0.2 }}
                animate={{ x: -40, opacity: 1, scale: 0.8 }}
                exit={{ x: 600, opacity: 0, transition: { duration: 0.4 } }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                className="flex flex-col items-center gap-4 z-20"
              >
                <div className="relative group">
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-6 bg-emerald-500/30 rounded-full blur-[40px]" 
                  />
                  <Avatar 
                    src={userAvatar} 
                    size="2xl" 
                    className="relative border-[10px] border-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.4)] z-10" 
                    border={false} 
                  />
                  <div className="absolute -top-4 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg z-20">تۆ</div>
                </div>
                <span className="text-emerald-400 font-black text-2xl sm:text-3xl tracking-[0.1em] drop-shadow-[0_0_20px_rgba(52,211,153,0.9)] font-rabar">
                  {userNickname}
                </span>
              </motion.div>

              {/* VS TEXT (Tekken Slam) */}
              <motion.div
                initial={{ scale: 20, opacity: 0, filter: 'blur(30px)' }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  filter: 'blur(0px)',
                  rotate: -5
                }}
                exit={{ scale: 0.1, opacity: 0, transition: { duration: 0.3 } }}
                onAnimationStart={() => {
                  setTimeout(() => {
                    playSwordComboSfx();
                    triggerHaptic([100, 100, 100]);
                  }, 300);
                }}
                transition={{ 
                  scale: { duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.35 }
                }}
                className="relative z-30 mx-[-50px] sm:mx-0"
              >
                {/* Background Flare */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 2, 2.5] }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-red-600 via-white to-orange-500 blur-[80px] rounded-full mix-blend-screen opacity-50"
                />

                <div className="relative">
                  <h1 className="text-[7rem] sm:text-[12rem] font-black italic select-none leading-none
                    bg-gradient-to-b from-white via-red-500 to-red-950 bg-clip-text text-transparent 
                    drop-shadow-[0_0_60px_rgba(255,0,0,1)] px-8 py-4 filter contrast-125">
                    VS
                  </h1>
                  
                  <h1 className="absolute inset-0 text-[7rem] sm:text-[12rem] font-black italic select-none leading-none
                    text-white/20 blur-[2px] translate-y-1 translate-x-1 -z-10">
                    VS
                  </h1>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-full h-1 bg-white blur-sm scale-x-[3] rotate-45 opacity-60" />
                    <div className="w-full h-1 bg-white blur-sm scale-x-[3] -rotate-45 opacity-60 ml-[-100%]" />
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 5, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="absolute inset-0 border-8 border-white/60 rounded-full blur-[15px]"
                />
              </motion.div>

              {/* OPPONENT (Player 2 / Left in RTL) */}
              <motion.div
                initial={{ x: -400, opacity: 0, scale: 0.2 }}
                animate={{ x: 40, opacity: 1, scale: 0.8 }}
                exit={{ x: -600, opacity: 0, transition: { duration: 0.4 } }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                className="flex flex-col items-center gap-4 z-20"
              >
                <div className="relative group">
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -inset-6 bg-red-600/30 rounded-full blur-[40px]" 
                  />
                  <Avatar 
                    src={opponent?.avatar_url} 
                    size="2xl" 
                    className="relative border-[10px] border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.4)] z-10" 
                    border={false} 
                  />
                  <div className="absolute -top-4 -left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg z-20">هەڤڕک</div>
                </div>
                <span className="text-red-500 font-black text-2xl sm:text-3xl tracking-[0.1em] drop-shadow-[0_0_20px_rgba(239,68,68,0.9)] font-rabar text-center">
                  {opponent?.nickname || 'هەڤڕک'}
                </span>
              </motion.div>
            </div>

            {/* 4. ROUND TEXT (Zoom & Shine) */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
              }}
              exit={{ scale: 2, opacity: 0, filter: 'blur(20px)', transition: { duration: 0.4 } }}
              transition={{ 
                scale: { type: "spring", stiffness: 300, damping: 20, delay: 0.9 },
                opacity: { duration: 0.5, delay: 0.9 }
              }}
              className="relative flex flex-col items-center pointer-events-none px-6"
            >
              {/* Shimmering Text Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl animate-shimmer" />
              
              <h2 className="text-5xl sm:text-8xl font-black text-white text-center font-rabar uppercase tracking-tight
                bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent 
                drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-10">
                گەڕا {getRoundOrdinal(currentRound)} <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">دەستپێکر</span>
              </h2>

              {/* Cinematic Flare Line */}
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '120%', opacity: [0, 1, 0.5] }}
                transition={{ duration: 1, delay: 1.2 }}
                className="h-[3px] bg-gradient-to-r from-transparent via-red-500 to-transparent mt-6 relative overflow-hidden"
              >
                <motion.div 
                   animate={{ x: ['-100%', '100%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-1/2"
                />
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
