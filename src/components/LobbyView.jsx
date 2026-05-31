import React, { useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { DerhemIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';


const LobbyView = React.memo(({
  onStartClassic,
  onStartMamak,
  onStartHardWords,
  onStartWordFever,
  onStartMultiplayer, // Handle matchmaking
  _onDailyRewardClick,
  _dailyStreak,
  onViewChange,
  _notificationCount = 0,
  onOpenHowToPlay
}) => {
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
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  return (
    <Motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onClick={handleBackgroundClick}
      className="flex-1 w-full max-w-full px-4 pt-4 pb-4 overflow-x-hidden bg-mono-white dark:bg-black relative h-full bg-trigger-zone transition-colors duration-500"
    >


      <div className="relative z-10">
        {/* Header (Simplified) */}
        <div className="flex flex-col mb-8 px-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {/* Stats Button */}
              {/* Stats Button */}
              <Motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { triggerHaptic(15); onViewChange('stats'); }}
                className="w-10 h-10 flex items-center justify-center group transition-all"
              >
                <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[24px] group-hover:text-mono-900 dark:group-hover:text-white transition-colors">
                  bar_chart
                </span>
              </Motion.button>

              {/* Achievement/Trophy Button */}
              <Motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { triggerHaptic(15); onViewChange('achievements'); }}
                className="w-10 h-10 flex items-center justify-center group transition-all"
              >
                <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[24px] group-hover:text-mono-900 dark:group-hover:text-white transition-colors">
                  emoji_events
                </span>
              </Motion.button>

              {/* Dictionary Button */}
              <Motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { triggerHaptic(15); onViewChange('dictionary'); }}
                className="w-10 h-10 flex items-center justify-center group transition-all"
              >
                <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[24px] group-hover:text-mono-900 dark:group-hover:text-white transition-colors">
                  menu_book
                </span>
              </Motion.button>

              <div className="w-px h-6 bg-mono-200 dark:bg-white/10 mx-1" />

              {/* Help Button */}
              <Motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { triggerHaptic(10); onOpenHowToPlay?.(); }}
                className="w-10 h-10 flex items-center justify-center group transition-all"
              >
                <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[24px] group-hover:text-mono-900 dark:group-hover:text-white transition-colors">
                  help
                </span>
              </Motion.button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* ONLINE MULTIPLAYER */}
          <div className="col-span-2 md:col-span-4 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(15); onStartMultiplayer(); }}
              {...bentoMotionProps}
              className="w-full relative h-28 rounded-[6px] overflow-hidden bg-linear-to-r from-emerald-500 to-teal-600 shadow-[0_5px_0_#0f766e] border-none mb-1"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-2xl font-black font-heading text-white">ھەڤڕکی</h3>
                  <span className="text-[11px] font-black font-noto-sans-arabic text-emerald-100/70 leading-none">سەرهێڵ</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                </div>
              </div>
            </Motion.button>
          </div>

          {/* CLASSIC MODE */}
          <div className="col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartClassic(); }}
              {...bentoMotionProps}
              className="w-full relative h-24 rounded-[6px] overflow-hidden bg-[#ffcc00] shadow-[0_5px_0_#cc9900] border-none mb-1"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-amber-950">پەیڤۆک</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-amber-900/80 leading-none">کلاسیک</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-amber-950" style={{ fontVariationSettings: "'FILL' 1" }}>videogame_asset</span>
                </div>
              </div>
            </Motion.button>
          </div>

          {/* MAMAK MODE */}
          <div className="col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartMamak(); }}
              {...bentoMotionProps}
              className="w-full relative h-24 rounded-[6px] overflow-hidden bg-[#22c55e] shadow-[0_5px_0_#16a34a] border-none mb-1"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-white">مامک</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 leading-none">پەیدا بکە</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
                </div>
              </div>
            </Motion.button>
          </div>

          {/* HARD MODE */}
          <div className="col-span-1 md:col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartHardWords(); }}
              {...bentoMotionProps}
              className="w-full relative h-36 md:h-24 rounded-[6px] overflow-hidden bg-[#ef4444] shadow-[0_5px_0_#dc2626] border-none mb-1"
            >
              {/* Mobile View */}
              <div className="relative z-10 flex md:hidden flex-col items-center justify-center h-full gap-3 text-center">
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-black font-heading text-white leading-none">پەیڤێن دژوار</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 mt-1 leading-none">بۆ شارەزایان</span>
                </div>
              </div>

              {/* Desktop View */}
              <div className="relative z-10 hidden md:flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-white">پەیڤێن دژوار</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 leading-none">بۆ شارەزایان</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
              </div>
            </Motion.button>
          </div>

          {/* WORD FEVER MODE */}
          <div className="col-span-1 md:col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartWordFever(); }}
              {...bentoMotionProps}
              className="w-full relative h-36 md:h-24 rounded-[6px] overflow-hidden bg-[#0ea5e9] shadow-[0_5px_0_#0284c7] border-none mb-1"
            >
              {/* Mobile View */}
              <div className="relative z-10 flex md:hidden flex-col items-center justify-center h-full gap-3 text-center">
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-black font-heading text-white leading-none">تایا پەیڤان</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 mt-1 leading-none">بەرھەڤ بە</span>
                </div>
              </div>

              {/* Desktop View */}
              <div className="relative z-10 hidden md:flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-white">تایا پەیڤان</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 leading-none">بەرھەڤ بە</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                </div>
              </div>
            </Motion.button>
          </div>

        </div>
      </div>
    </Motion.div>
  );
});

export default LobbyView;


