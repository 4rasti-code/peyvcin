import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits, getLocalDateString, isYesterday } from '../utils/formatters';
import { playBackSfx } from '../utils/audio';
import { FilsIcon, DerhemIcon, DinarIcon } from './CurrencyIcon';

const REWARDS_CONFIG = [
  { day: 1, label: '١٠٠ فلس', type: 'fils', reward: { fils: 100 }, color: '#CD7F32' },
  { day: 2, label: '١ موگناتیس', icon: 'auto_fix_high', reward: { magnetCount: 1 }, color: '#8b5cf6' },
  { day: 3, label: '٥ دەرھەم', type: 'derhem', reward: { derhem: 5 }, color: '#A0A0A0' },
  { day: 4, label: '١ ھاریکاری', icon: 'lightbulb', reward: { hintCount: 1 }, color: '#f97316' },
  { day: 5, label: '٥ دینار', type: 'dinar', reward: { dinar: 5 }, color: '#B8860B' },
  { day: 6, label: '١ دەربازبوون', icon: 'fast_forward', reward: { skipCount: 1 }, color: '#0ea5e9' },
  { day: 7, label: '٢٠٠٠ فلس + دیاری', type: 'fils', reward: { fils: 2000, magnetCount: 1, hintCount: 1, skipCount: 1 }, color: '#FFD700', isGrand: true }
];

export default function DailyRewardModal({ isOpen, onClose }) {
  const {
    rewardStreak,
    lastRewardClaimedAt,
    claimDailyReward,
    playDailyOpenSfx,
    playDailyClaimSfx,
    hapticEnabled
  } = useGame();

  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedDay, setClaimedDay] = useState(null);

  useEffect(() => {
    if (isOpen) {
      playDailyOpenSfx();
      if (hapticEnabled) triggerHaptic(10);
    }
  }, [isOpen, playDailyOpenSfx, hapticEnabled]);

  const todayStr = getLocalDateString();
  const lastClaimDate = lastRewardClaimedAt ? (lastRewardClaimedAt.includes('T') ? lastRewardClaimedAt.split('T')[0] : lastRewardClaimedAt) : null;
  const isAvailableToday = lastClaimDate !== todayStr;

  let nextDay = 1;
  let isStreakBroken = false;

  if (lastClaimDate) {
    if (isYesterday(lastClaimDate)) {
      nextDay = (rewardStreak % 7) + 1;
    } else if (lastClaimDate !== todayStr) {
      isStreakBroken = true;
      nextDay = 1;
    } else {
      nextDay = rewardStreak; // They already claimed today
    }
  }

  const activeDay = isAvailableToday ? nextDay : -1;

  const handleClaim = async () => {
    if (claiming || !isAvailableToday) return;
    setClaiming(true);

    playDailyClaimSfx();
    if (hapticEnabled) triggerHaptic([30, 50]);

    const result = await claimDailyReward();
    if (result.success) {
      setClaimedDay(result.streak);
      setShowSuccess(true);

      if (result.streak === 7) {
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#10b981', '#ffffff']
        });
      }

      setTimeout(() => {
        setClaiming(false);
      }, 2000);
    } else {
      setClaiming(false);
    }
  };

  if (!isOpen && !showSuccess) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="daily-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              key="daily-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-linear-to-br from-[#0a1425] via-[#0e1b35] to-[#0a1425] border border-white/10 rounded-md shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />

              {/* Header */}
              <div className="flex flex-col items-center mb-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-md bg-emerald-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                  <span className="material-symbols-outlined text-4xl">redeem</span>
                </div>
                <h2 className="text-3xl font-black font-heading text-white tracking-tight">خەلاتێن ڕۆژانە</h2>
                <p className="text-white/50 text-sm font-medium mt-1">٧ ڕۆژ - خەلاتێن بەردەوام و نایاب</p>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-3 gap-3 relative z-10 w-full">
                {REWARDS_CONFIG.map((item) => {
                  const visualClaimed = isStreakBroken ? false : (
                    !isAvailableToday ? item.day <= rewardStreak : item.day < activeDay
                  );
                  const isNext = item.day === activeDay;
                  const isDay7 = item.day === 7;
                  const isFuture = !visualClaimed && !isNext;
                  
                  return (
                    <motion.div
                      key={`reward-card-${item.day}`}
                      onClick={isNext && !claiming ? handleClaim : undefined}
                      animate={isNext ? { 
                        opacity: 1, 
                        scale: [1, 1.02, 1],
                        rotate: [0, -1, 1, -1, 1, 0],
                      } : { opacity: isFuture ? 0.7 : 1, scale: 1 }}
                      transition={isNext ? {
                        rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
                        scale: { duration: 2, repeat: Infinity }
                      } : {}}
                      className={`
                        relative p-3 rounded-md border flex flex-col items-center justify-center gap-1.5 transition-all
                        ${isDay7 ? 'col-span-3 h-28 flex-row justify-between px-8 overflow-hidden' : 'aspect-square'}
                        ${visualClaimed ? 'bg-slate-50/50 border-slate-100 grayscale' : ''}
                        ${isFuture && !isDay7 ? 'bg-slate-50 border-slate-100 opacity-50' : ''}
                        ${isDay7 && !visualClaimed ? 'bg-linear-to-r from-indigo-700 via-purple-700 to-indigo-900 border-purple-500/50 shadow-xl shadow-purple-500/10' : ''}
                        ${isNext && !isDay7 ? 'bg-white border-emerald-500/50 shadow-lg shadow-emerald-500/10 cursor-pointer z-10' : ''}
                        ${!isDay7 && !isNext && !visualClaimed && !isFuture ? 'bg-white border-slate-100 shadow-sm' : ''}
                      `}
                    >
                      {isDay7 && !visualClaimed && (
                        <>
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2)_0%,transparent_60%)] pointer-events-none" />
                          <motion.div 
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -right-4 -top-8 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"
                          />
                        </>
                      )}

                      <div className={`flex flex-col relative z-10 ${isDay7 ? 'items-start' : 'items-center'}`}>
                        <span className={`font-black text-[10px] uppercase tracking-widest ${isDay7 ? 'text-purple-200/60' : isNext ? 'text-emerald-600' : 'text-slate-400'}`}>
                          ڕۆژا {toKuDigits(item.day)}
                        </span>
                        {isDay7 && (
                          <span className={`text-2xl font-black italic tracking-tighter ${visualClaimed ? 'text-slate-600' : 'text-white text-shadow-sm'}`}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      <div className={`relative flex items-center justify-center ${isDay7 ? 'w-24' : 'flex-1 w-full min-h-0'}`}>
                         {isDay7 ? (
                            <DinarIcon size={70} /> 
                         ) : item.type === 'fils' ? (
                           <FilsIcon size={36} />
                         ) : item.type === 'derhem' ? (
                           <DerhemIcon size={36} />
                         ) : item.type === 'dinar' ? (
                           <DinarIcon size={36} />
                         ) : (
                           <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                             <span className="material-symbols-outlined text-2xl" style={{ color: item.color }}>
                                {item.icon}
                             </span>
                           </div>
                         )}
                        
                        {visualClaimed && (
                          <div className="absolute inset-0 flex items-center justify-center pt-2">
                             <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                             </div>
                          </div>
                        )}

                        {isFuture && (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                             <span className="material-symbols-outlined text-[20px]">lock</span>
                          </div>
                        )}
                      </div>

                      {!isDay7 && (
                        <div className="w-full text-center px-0.5">
                          <span className={`font-black uppercase tracking-tight text-[11px] leading-tight block truncate ${isFuture ? 'text-slate-400' : 'text-slate-900'}`}>
                            {item.label}
                          </span>
                        </div>
                      )}

                      {isNext && (
                        <div className="absolute -top-1 -left-1">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 flex flex-col gap-3 items-center w-full">
                {isAvailableToday ? (
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full h-14 bg-emerald-500 text-white rounded-md font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {claiming ? 'چاوەڕێ ببە...' : 'خەلاتێ خۆ وەرگرە'}
                  </button>
                ) : null}

                <button 
                  onClick={() => { playBackSfx(); onClose(); }}
                  className="w-full h-12 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  ڤەگەڕیان
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="daily-success-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6"
            onClick={() => { setShowSuccess(false); onClose(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center w-full max-w-sm bg-[#0a1425] border border-white/10 rounded-md shadow-2xl p-10 flex flex-col items-center relative overflow-hidden"
            >
              {/* Celebration Glow */}
              <div className="absolute inset-0 bg-linear-to-b from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

              {(() => {
                const claimedItem = REWARDS_CONFIG.find(r => r.day === claimedDay) || REWARDS_CONFIG[0];
                return (
                  <>
                    <h3 className="text-4xl font-black text-white mb-2 tracking-tight">پیرۆزە!</h3>
                    <p className="text-white/50 text-lg font-medium mb-8">تە خەلاتێ ڕۆژا {toKuDigits(claimedItem.day)} وەرگرت</p>

                    <div className="flex flex-col items-center justify-center mb-10 relative">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative flex flex-col items-center justify-center"
                      >
                        {claimedItem.day === 7 ? (
                          <DinarIcon size={120} />
                        ) : claimedItem.type === 'fils' ? (
                          <FilsIcon size={100} />
                        ) : claimedItem.type === 'derhem' ? (
                          <DerhemIcon size={100} />
                        ) : claimedItem.type === 'dinar' ? (
                          <DinarIcon size={100} />
                        ) : (
                          <div className="w-32 h-32 rounded-md bg-emerald-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[80px]" style={{ color: claimedItem.color }}>
                              {claimedItem.icon}
                            </span>
                          </div>
                        )}
                        <div className="mt-4 px-6 py-2 bg-emerald-500 rounded-md text-white font-black text-xl shadow-lg shadow-emerald-500/20">
                          + {claimedItem.label}
                        </div>
                      </motion.div>
                    </div>
                  </>
                );
              })()}
              <button
                onClick={() => { setShowSuccess(false); onClose(); }}
                className="w-full h-14 bg-white text-[#0a1425] rounded-md font-black text-lg shadow-xl active:scale-95 transition-all"
              >
                بەردەوام بە
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
