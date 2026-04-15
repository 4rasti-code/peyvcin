import React, { useEffect, useState } from 'react';
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
  wordList,
  lastSolvedWord,
  guesses = [],
  targetWord = '',
  hintTaps = 0
}) => {
  const [showDictionary, setShowDictionary] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateEmojiGrid = () => {
    if (!targetWord || !guesses.length) return "";
    
    return guesses.map(guess => {
      const targetArr = targetWord.split('');
      const guessArr = guess.split('');
      const statuses = new Array(guessArr.length).fill('⬛');
      const remainingTarget = [...targetArr];

      // Pass 1: Greens
      guessArr.forEach((char, i) => {
        if (char === remainingTarget[i]) {
          statuses[i] = '🟩';
          remainingTarget[i] = null;
        }
      });

      // Pass 2: Yellows
      guessArr.forEach((char, i) => {
        if (statuses[i] !== '🟩') {
          const foundIdx = remainingTarget.indexOf(char);
          if (foundIdx !== -1) {
            statuses[i] = '🟨';
            remainingTarget[foundIdx] = null;
          }
        }
      });

      return statuses.join('');
    }).join('\n');
  };

  const handleShare = async () => {
    triggerHaptic(15);
    const grid = generateEmojiGrid();
    const text = `پەیڤچین 🎮\nپەیڤا ${targetWord.length} پیتی\nب ${guesses.length} جاران هاتە دیتن\n\n${grid}\n\nلێرە یاری بکە: peyvchin.app`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard failed", err);
      }
    }
  };

  const [canInteract, setCanInteract] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCanInteract(false);
      const timer = setTimeout(() => setCanInteract(true), 500);

      // Play Victory Celebration SFX
      playSuccessSfx();

      // High-saturation palette: Emerald, Gold, Royal Blue, White
      const colors = ['#10b981', '#facc15', '#3b82f6', '#ffffff'];
      
      // Main Center Explosion
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors
      });

      // Side Cannons for "Full-Screen" feel
      setTimeout(() => {
        if (!isVisible) return;
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
      }, 200);

      // Unified Triple-Pulse Haptic Burst
      triggerHaptic([30, 50, 30, 50, 60]);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const starVariants = {
    hidden: { scale: 0, rotate: -30, opacity: 0 },
    visible: (i) => ({
      scale: i === 1 ? 1.25 : 1, // Center star is larger
      rotate: 0,
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 15, 
        delay: 0.1 + i * 0.15 
      }
    })
  };

  const safeGuesses = Array.isArray(guesses) ? guesses : [];
  const guessCount = safeGuesses.length;

  // Anti-Gravity: Fair Star Distribution Logic
  // 3 Stars: Solved in 1-2 attempts AND zero hints.
  // 2 Stars: Solved in 3-4 attempts OR (1-2 attempts with 1-2 hints).
  // 1 Star: 5-6 attempts OR win with 3+ hints.
  let starsCount = 1;
  if (guessCount <= 2 && (hintTaps || 0) === 0) {
    starsCount = 3;
  } else if (guessCount <= 4 || (guessCount <= 2 && (hintTaps || 0) <= 2)) {
    starsCount = 2;
  } else {
    starsCount = 1;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="absolute inset-0 z-110 flex items-center justify-center p-4 overflow-hidden">
          <motion.div 
            key="v-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
             key="v-content"
             initial={{ scale: 0.8, opacity: 0, y: 100 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             exit={{ scale: 0.8, opacity: 0, y: 100 }}
             className="relative w-[340px] max-w-[90vw] bg-[#1a202c] rounded-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col"
          >
            {/* Header: Stars & Ribbon */}
            <div className="relative py-8 flex flex-col items-center overflow-visible">
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-50 blur-3xl" 
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)' }}
              />

              <div className="flex items-end justify-center gap-2 mb-6 relative z-10">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={starVariants}
                    initial="hidden"
                    animate="visible"
                    className={i === 1 ? 'pb-2' : 'pb-0'}
                  >
                    <span className={`material-symbols-outlined ${i === 1 ? 'text-6xl' : 'text-5xl'} ${i < starsCount ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]' : 'text-white/10'}`}>
                      star
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.5, type: 'spring' }}
                 className="relative z-20"
              >
                <div className="relative bg-linear-to-r from-purple-800 to-indigo-900 px-8 py-2 rounded-full border border-yellow-500/50 shadow-2xl overflow-visible">
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-4 h-6 bg-purple-900 -z-10 rounded-l-md skew-y-12" />
                  <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-6 bg-purple-900 -z-10 rounded-r-md -skew-y-12" />
                  <h2 className="text-xl font-black font-rabar text-yellow-400 tracking-wider drop-shadow-md">
                     پیرۆزە!
                  </h2>
                </div>
              </motion.div>
            </div>

            <div className="p-6 pt-0 flex flex-col items-center text-center">
              {/* Solved Word */}
              <div className="w-full relative group mb-6">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-md" />
                <div className="relative bg-white/5 rounded-2xl p-4 border border-white/10 shadow-inner overflow-hidden">
                  <motion.div 
                    initial={{ x: '-150%' }}
                    animate={{ x: '150%' }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent w-1/3 skew-x-12"
                  />
                  <span className="text-2xl font-black font-rabar text-white tracking-[0.2em]">{solvedWord}</span>
                </div>
              </div>

              {/* Stats & Rewards Table */}
              <div className="w-full space-y-1.5 mb-4 bg-black/40 p-4 rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex justify-between items-center text-sm font-black font-ui group/row">
                  <span className="text-white/80 transition-colors group-hover/row:text-white">پیتێن ڕاست</span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <AnimatedNumber value={breakdown?.green || 0} prefix="+" />
                    <FilsIcon size={12} className="opacity-80" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-black font-ui group/row">
                  <span className="text-white/80 transition-colors group-hover/row:text-white">پیتێن ل جهێ شاش</span>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AnimatedNumber value={breakdown?.yellow || 0} prefix="+" />
                    <FilsIcon size={12} className="opacity-80" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-black font-ui group/row">
                  <span className="text-white/80 transition-colors group-hover/row:text-white">پیتێن شاش</span>
                  <div className="flex items-center gap-2 text-red-500">
                    <AnimatedNumber value={breakdown?.gray || 0} prefix="-" />
                    <FilsIcon size={12} className="opacity-80" />
                  </div>
                </div>
                {/* XP Reward Row */}
                <div className="flex justify-between items-center text-sm font-black font-ui group/row bg-white/5 -mx-2 px-2 py-1 rounded-lg">
                  <span className="text-white/80">خەلاتێ ئاستی</span>
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <AnimatedNumber value={xp || 0} prefix="+" />
                    <span className="text-[10px] font-black tracking-tighter opacity-80">XP</span>
                  </div>
                </div>
                {breakdown?.isMamak && (
                  <div className="flex justify-between items-center text-xs font-bold font-ui border-t border-white/10 pt-2 mt-2">
                    <div className="flex items-center gap-1.5 text-yellow-400/80 italic">
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      ماماک مولتیپڵایەر
                    </div>
                    <span className="text-yellow-400 font-black">X1.5</span>
                  </div>
                )}
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-center text-lg font-black font-rabar">
                  <span className="text-white">سەرجەم</span>
                  <div className="flex items-center gap-2 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                    <AnimatedNumber value={breakdown?.total || 0} />
                    <FilsIcon size={18} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-4">
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { if (!canInteract) return; triggerHaptic(10); onNext(); }}
                    className="flex-[1.5] py-3 rounded-xl bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    بەردەوام بە
                    <span className="material-symbols-outlined text-lg">arrow_left</span>
                  </button>
                  <button
                    onClick={() => { if (!canInteract) return; triggerHaptic(5); onHome(); }}
                    className="flex-1 py-3 rounded-xl bg-[#334155] text-white/70 font-bold text-[10px] transition-all active:scale-95 hover:bg-[#475569]"
                  >
                    ڤەگەڕیان
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className={`w-full py-1 flex items-center justify-center gap-2 text-xs font-bold transition-all ${isCopied ? 'text-green-500' : 'text-green-500/60 hover:text-green-500'}`}
                >
                  <span className="material-symbols-outlined text-sm">{isCopied ? 'check_circle' : 'share'}</span>
                  {isCopied ? 'هاتە کۆپیکردن!' : 'بەلاڤکرن'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VictoryOverlay;
