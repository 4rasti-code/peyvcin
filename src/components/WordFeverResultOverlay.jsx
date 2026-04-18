import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../utils/haptics';

const WordFeverResultOverlay = ({ 
  isVisible, 
  type, // 'win' or 'fail'
  onContinue, // Resets timer to 60s + new word
  onRepeat,   // Resets timer to 60s + retry board
  onHome      // Returns to lobby
}) => {
  const isWin = type === 'win';

  useEffect(() => {
    if (isVisible && isWin) {
      const colors = ['#10b981', '#facc15', '#3b82f6', '#ffffff'];
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
      });
      triggerHaptic([30, 50, 30, 50, 60]);
    } else if (isVisible && !isWin) {
      triggerHaptic(200);
    }
  }, [isVisible, isWin]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-1000 flex items-center justify-center bg-[#0f0f0f]/90 backdrop-blur-2xl p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`w-full max-w-md bg-[#1a1a1a] border-2 rounded-[3.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-8 ${isWin ? 'border-purple-500/30' : 'border-red-500/30'}`}
          >
            {/* Status Icon Hub */}
            <div className="relative flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 
                ${isWin ? 'bg-linear-to-br from-yellow-400/20 to-orange-500/20 text-yellow-500 border border-yellow-500/30 ring-8 ring-yellow-500/5' 
                       : 'bg-linear-to-br from-red-500/20 to-orange-600/20 text-red-500 border border-red-500/30 ring-8 ring-red-500/5'}`}
              >
                <span className="material-symbols-outlined text-[72px] drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  {isWin ? 'emoji_events' : 'timer_off'}
                </span>
              </motion.div>
              <div className={`absolute inset-0 rounded-full blur-[60px] opacity-40 -z-10 ${isWin ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>

            {/* Message Area */}
            <div className="text-center space-y-2">
              <h2 className={`text-4xl font-black font-heading ${isWin ? 'text-purple-400' : 'text-red-500'}`}>
                {isWin ? 'پیرۆزە!' : 'تو سەرنەکەڤتی!'}
              </h2>
              <p className="text-lg font-bold font-body text-white/80 leading-relaxed">
                {isWin ? 'تە پەیڤا دروست دیت.' : 'تە پەیڤا ڕاست نەدیت، دەستا نەداھێلە!'}
              </p>
              {!isWin && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span className="text-white/40 text-sm">سزایێ دەمژمێرێ</span>
                  <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                     <span className="text-red-500 font-black text-xl">-٥٠ فلس</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              {isWin ? (
                <button 
                  onClick={() => { triggerHaptic(10); onContinue(); }}
                  className="w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white py-5 rounded-3xl font-black  text-xl shadow-[0_20px_40px_rgba(168,85,247,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  بەردەوام بە
                </button>
              ) : (
                <button 
                  onClick={() => { triggerHaptic(10); onRepeat(); }}
                  className="w-full bg-linear-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white py-5 rounded-3xl font-black  text-xl shadow-[0_20px_40px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                  بەردەوام بە
                </button>
              )}

              <button 
                onClick={() => { triggerHaptic(10); onHome(); }}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white py-4 rounded-2xl font-bold  text-lg active:scale-95 transition-all flex items-center justify-center gap-3"
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
