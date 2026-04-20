import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import { triggerHaptic } from '../utils/haptics';
import { FilsIcon, DerhemIcon, DinarIcon } from './CurrencyIcon';

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
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(start + (end - start) * easeProgress));
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }, [value]);

  return <span>{prefix}{displayValue}</span>;
};

export default function MultiplayerResultOverlay({ 
  isVisible, 
  result, 
  scores, 
  rewards,
  opponent, 
  userAvatar, 
  userNickname,
  onPlayAgain, 
  onClose,
  isForfeitWin 
}) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(10);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose(); // Auto-dismiss 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const isVictory = result === 'victory';
  const isDraw = result === 'draw';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl"
      >
        {/* Cinematic Backdrop Glow */}
        <div 
          className={`absolute inset-0 opacity-20 blur-[120px] rounded-full transition-colors duration-1000 ${
            isVictory ? 'bg-emerald-500' : isDraw ? 'bg-indigo-400' : 'bg-red-500'
          }`} 
        />

        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-sm bg-white/5 border border-white/10 rounded-[48px] p-8 shadow-2xl overflow-hidden"
        >
          {/* Header Status */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                isVictory ? 'bg-emerald-500/20 text-emerald-400' : isDraw ? 'bg-slate-500/20 text-slate-300' : 'bg-red-500/20 text-red-500'
              }`}
            >
              <span className="material-symbols-outlined text-6xl">
                {isVictory ? 'workspace_premium' : isDraw ? 'balance' : 'sentiment_very_dissatisfied'}
              </span>
            </motion.div>
            
            <h1 className={`text-4xl font-black font-rabar mb-2 ${
              isVictory ? 'text-emerald-400' : isDraw ? 'text-slate-300' : 'text-red-400'
            }`}>
              {isVictory ? 'سەرکەفتن!' : isDraw ? 'یەکسانبوون!' : 'خوسارەتی!'}
            </h1>

            {isVictory && isForfeitWin && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 text-amber-400 px-4 py-1 rounded-full text-sm font-bold font-rabar mb-3 border border-amber-500/20"
              >
                سەرکەفتن ب دەستژێبەردانا ھەڤڕکی!
              </motion.div>
            )}

            <p className="text-white/40 font-medium">ئەنجامێ دووفاییک یێ یاریێ</p>
          </div>

          {/* Scores Comparison */}
          <div className="flex items-center justify-between gap-4 mb-4 bg-white/5 rounded-3xl p-6 border border-white/5">
            <div className="flex flex-col items-center gap-2 flex-1">
              <Avatar src={userAvatar} size="sm" />
              <span className="text-[10px] font-black text-white/30 uppercase truncate w-full text-center">{userNickname}</span>
              <span className="text-3xl font-black text-white">{scores.p1}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-[2px] bg-white/10 rounded-full mb-1" />
              <span className="text-xs font-black text-white/20 italic">VS</span>
              <div className="w-8 h-[2px] bg-white/10 rounded-full mt-1" />
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <Avatar src={opponent?.avatar_url} size="sm" />
              <span className="text-[10px] font-black text-white/30 uppercase truncate w-full text-center">{opponent?.nickname || 'Hévrk'}</span>
              <span className="text-3xl font-black text-white">{scores.p2}</span>
            </div>
          </div>

          {/* Rewards Section (Only for Victory) */}
          {isVictory && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full space-y-2 mb-8 bg-black/40 p-5 rounded-[2rem] border border-emerald-500/10 shadow-inner"
            >
              <div className="flex justify-between items-center text-md font-black">
                <span className="text-white/60">خەلاتێ تە</span>
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="flex flex-col items-end leading-none">
                    <AnimatedNumber value={rewards?.awards?.amount || 1} prefix="+" />
                    <span className="text-[8px] font-black uppercase tracking-normal opacity-60">
                      {rewards?.awards?.type === 'dinar' ? 'دینار' : rewards?.awards?.type === 'derhem' ? 'دەرهەم' : 'فلس'}
                    </span>
                  </div>
                  {rewards?.awards?.type === 'dinar' ? <DinarIcon size={20} /> : rewards?.awards?.type === 'derhem' ? <DerhemIcon size={20} /> : <FilsIcon size={20} />}
                </div>
              </div>

              <div className="h-px bg-white/5 my-0.5" />

              <div className="flex justify-between items-center text-sm font-black mt-1">
                <span className="text-white/60">خەلاتێ ئێکس پی</span>
                <div className="flex items-center gap-2 text-yellow-500">
                  <div className="flex flex-col items-end leading-none">
                    <AnimatedNumber value={rewards?.xpAdded || 100} prefix="+" />
                    <span className="text-[8px] font-black tracking-tighter opacity-60">XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                triggerHaptic(20);
                onPlayAgain();
              }}
              className="h-16 w-full bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">restart_alt</span>
              دوبارە یاری بکە
            </button>
            
            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="h-16 w-full bg-white/5 text-white/60 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
            >
              ڤەگەڕیان بۆ لۆبی ({countdown}س)
            </button>
          </div>

          {/* Minimal Countdown Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className={`h-full ${isVictory ? 'bg-emerald-500' : isDraw ? 'bg-slate-400' : 'bg-red-500'}`}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
