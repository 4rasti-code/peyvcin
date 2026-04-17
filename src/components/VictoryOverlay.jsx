import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import DictionaryView from './DictionaryView';
import { FilsIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { playSuccessSfx } from '../utils/audio';

const AnimatedNumber = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    const duration = 1500; // 1.5s
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(start + (end - start) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return <span>{prefix}{displayValue}</span>;
};

const VictoryOverlay = ({ 
  isVisible, 
  breakdown, 
  solvedWord, 
  xp, 
  onNext, 
  onHome,
  gameMode = 'classic'
}) => {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isVisible && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      triggerHaptic(200);
      playSuccessSfx();
      
      const colors = ['#10b981', '#facc15', '#3b82f6', '#ffffff'];
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors
      });
    }

    if (isVisible) {
      // Auto-exit after 10 seconds
      const timer = setTimeout(() => {
        onNext();
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      // Reset trigger flag when overlay is hidden
      hasTriggeredRef.current = false;
    }
  }, [isVisible, onNext]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0f0f0f]/90 backdrop-blur-2xl p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#1a1a1a] border-2 border-emerald-500/30 rounded-[3.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-8"
          >
            {/* Status Icon Hub */}
            <div className="relative flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.5, rotate: 15 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30 ring-8 ring-emerald-500/5"
              >
                <span className="material-symbols-outlined text-[72px] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  workspace_premium
                </span>
              </motion.div>
              <div className="absolute inset-0 rounded-full blur-[60px] opacity-40 -z-10 bg-emerald-500" />
            </div>

            {/* Message Area */}
            <div className="text-center space-y-4 w-full">
              <h2 className="text-4xl font-black font-heading text-emerald-400">
                 تە سەرکەفتن ئینا!
              </h2>
              <p className="text-lg font-bold font-body text-white/60 leading-relaxed px-4">
                 پیرۆزە! هەوڵەکانت بێ ئەنجام نەبوون و تە پەیڤا دروست دیت.
              </p>

              {solvedWord && (
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl mt-2 inline-block">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">پەیڤا دۆزراوە</span>
                  <span className="text-2xl font-black text-emerald-400 font-heading tracking-wider">{solvedWord}</span>
                </div>
              )}

              {/* Stats & Rewards Table */}
              <div className="w-full space-y-1.5 mt-2 bg-black/40 p-4 rounded-3xl border border-emerald-500/10 shadow-inner">
                <div className="flex justify-between items-center text-sm font-black font-ui group/row">
                  <span className="text-white/80 transition-colors group-hover/row:text-white">خەلاتێ سەرکەفتنێ</span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="flex flex-col items-end leading-none pt-0.5">
                      <AnimatedNumber value={breakdown?.base || 0} prefix="+" />
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-60">فلس</span>
                    </div>
                    <FilsIcon size={12} className="opacity-80" />
                  </div>
                </div>
                
                {breakdown?.mode === 'Multiplayer' && (
                  <div className="flex justify-between items-center text-sm font-black font-ui group/row">
                    <span className="text-white/80 transition-colors group-hover/row:text-white">بۆنوسا هەڤڕکیێ</span>
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AnimatedNumber value={xp || 50} prefix="+" />
                      <span className="text-[10px] font-black tracking-tighter opacity-80">XP</span>
                    </div>
                  </div>
                )}

                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between items-center text-lg font-black font-rabar">
                  <span className="text-white">سەرجەم</span>
                  <div className="flex items-center gap-2 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <div className="flex flex-col items-end leading-none pt-1">
                      <AnimatedNumber value={breakdown?.total || 0} prefix="+" />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">فلس</span>
                    </div>
                    <FilsIcon size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => { triggerHaptic(10); onNext(); }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-5 rounded-3xl font-black font-ui text-xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">arrow_left</span>
                بەردەوام بە
              </button>

              <button 
                onClick={() => { triggerHaptic(10); onHome(); }}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white py-4 rounded-2xl font-bold font-ui text-lg active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">home</span>
                ڤەگەڕیان
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VictoryOverlay;
