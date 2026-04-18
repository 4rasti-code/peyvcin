import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FilsIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { playSuccessSfx, playBackSfx } from '../utils/audio';

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

const WordFeverResultOverlay = ({ 
  isVisible, 
  type, // 'win' or 'fail'
  solvedWord,
  breakdown,
  xp,
  onContinue, // Resets timer to 60s + new word
  onRepeat,   // Resets timer to 60s + retry board
  onHome,      // Returns to lobby
  playStartSound
}) => {
  const isWin = type === 'win';
  const hasTriggeredRef = React.useRef(false);

  useEffect(() => {
    if (isVisible && isWin && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const colors = ['#0ea5e9', '#22d3ee', '#3b82f6', '#ffffff'];
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors
      });
      triggerHaptic([30, 50, 30, 50, 60]);
      playSuccessSfx();
    } else if (isVisible && !isWin && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      triggerHaptic(200);
    }

    if (!isVisible) {
      hasTriggeredRef.current = false;
    }

    if (isVisible) {
      const timer = setTimeout(() => {
        onHome();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isWin, onContinue]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-1000 flex items-center justify-center bg-[#0f0f0f]/95 backdrop-blur-2xl p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`w-full max-w-md bg-[#1a1a1a] border-2 rounded-[3.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-8 ${isWin ? 'border-sky-500/30' : 'border-red-500/30'}`}
          >
            {/* Status Icon Hub */}
            <div className="relative flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 
                ${isWin ? 'bg-linear-to-br from-sky-500/20 to-cyan-600/20 text-sky-400 border border-sky-400/30 ring-8 ring-sky-500/5' 
                       : 'bg-linear-to-br from-red-500/20 to-orange-600/20 text-red-500 border border-red-500/30 ring-8 ring-red-500/5'}`}
              >
                <span className={`material-symbols-outlined text-[72px] ${isWin ? 'drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
                  {isWin ? 'electric_bolt' : 'timer_off'}
                </span>
              </motion.div>
              <div className={`absolute inset-0 rounded-full blur-[60px] opacity-40 -z-10 ${isWin ? 'bg-sky-500' : 'bg-red-500'}`} />
            </div>

            {/* Message Area */}
            <div className="text-center space-y-4 w-full">
              <h2 className={`text-4xl font-black font-heading ${isWin ? 'text-sky-400' : 'text-red-500'}`}>
                {isWin ? 'پیرۆزە!' : 'تو سەرنەکەڤتی!'}
              </h2>
              <p className="text-lg font-bold font-body text-white/60 leading-relaxed px-4">
                {isWin ? 'تە پەیڤا دروست دیت و سەرکەفتن ئینا!' : 'تە پەیڤا ڕاست نەدیت، دەستا نەداھێلە!'}
              </p>

              {solvedWord && (
                <div className={`bg-white/5 border border-white/10 px-6 py-4 rounded-3xl mt-2 inline-block ${isWin ? 'ring-1 ring-sky-400/20' : ''}`}>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">پەیڤا دۆزراوە</span>
                  <span className={`text-2xl font-black font-heading tracking-wider ${isWin ? 'text-sky-400' : 'text-red-400'}`}>{solvedWord}</span>
                </div>
              )}

              {/* Stats & Rewards Table */}
              <div className={`w-full space-y-1.5 mt-2 bg-black/40 p-5 rounded-3xl border shadow-inner ${isWin ? 'border-sky-500/10' : 'border-red-500/10'}`}>
                <div className="flex justify-between items-center text-sm font-black group/row">
                  <span className="text-white/80 transition-colors group-hover/row:text-white">
                    {isWin ? 'خەلاتێ سەرکەفتنێ' : 'سزایێ دۆڕاندنێ'}
                  </span>
                  <div className={`flex items-center gap-2 ${isWin ? 'text-sky-400' : 'text-red-500'}`}>
                    <div className="flex flex-col items-end leading-none pt-0.5">
                      <AnimatedNumber value={isWin ? breakdown?.total : 50} prefix={isWin ? "+" : "-"} />
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-60">فلس</span>
                    </div>
                    <FilsIcon size={12} className="opacity-80" />
                  </div>
                </div>

                {/* Detailed Stats Breakdown */}
                <div className="space-y-1 pt-1 opacity-70">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                      <span>پیتا ڕاست</span>
                    </div>
                    <span className="text-white">{breakdown?.greenCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                      <span>ڕاست/جھێ شاش</span>
                    </div>
                    <span className="text-white">{breakdown?.yellowCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>پیتا شاش</span>
                    </div>
                    <span className="text-white">-{breakdown?.grayCount || 0}</span>
                  </div>
                </div>
                
                {isWin && xp > 0 && (
                  <div className="flex justify-between items-center text-sm font-black group/row mt-1 pt-1 border-t border-white/5">
                    <span className="text-white/80 transition-colors group-hover/row:text-white">خەلاتێ XP</span>
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AnimatedNumber value={xp} prefix="+" />
                      <span className="text-[10px] font-black tracking-tighter opacity-80">XP</span>
                    </div>
                  </div>
                )}

                {isWin && (
                  <>
                    <div className="h-px bg-white/5 my-2" />
                    <div className="flex justify-between items-center text-lg font-black font-rabar">
                      <span className="text-white">سەرجەم</span>
                      <div className="flex items-center gap-2 text-sky-400 drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                        <div className="flex flex-col items-end leading-none pt-1">
                          <AnimatedNumber value={breakdown?.total || 0} prefix="+" />
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-70">فلس</span>
                        </div>
                        <FilsIcon size={18} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              {isWin ? (
                <button 
                  onClick={() => { triggerHaptic(10); playStartSound?.(); onContinue(); }}
                  className="w-full bg-linear-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white py-5 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(14,165,233,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  بەردەوام بە
                </button>
              ) : (
                <button 
                  onClick={() => { triggerHaptic(10); playStartSound?.(); onRepeat(); }}
                  className="w-full bg-linear-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white py-5 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                  بەردەوام بە
                </button>
              )}

              <button 
                onClick={() => { triggerHaptic(10); playBackSfx(); onHome(); }}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center gap-3"
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

export default WordFeverResultOverlay;
