import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import { FilsIcon, DerhemIcon, ZerIcon } from './CurrencyIcon';

const REWARDS_CONFIG = [
  { day: 1, label: '١٠٠ فلس', type: 'fils', reward: { fils: 100 }, color: '#CD7F32' },
  { day: 2, label: '١ موگناتیس', icon: 'auto_fix_high', reward: { magnetCount: 1 }, color: '#8b5cf6' },
  { day: 3, label: '٥ دەرهەم', type: 'derhem', reward: { derhem: 5 }, color: '#A0A0A0' },
  { day: 4, label: '١ ھاریکاری', icon: 'lightbulb', reward: { hintCount: 1 }, color: '#f97316' },
  { day: 5, label: '٥ دینار', type: 'zer', reward: { zer: 5 }, color: '#B8860B' },
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

  const todayStr = new Date().toISOString().split('T')[0];
  const lastClaimDate = lastRewardClaimedAt ? new Date(lastRewardClaimedAt).toISOString().split('T')[0] : null;
  const isAvailableToday = lastClaimDate !== todayStr;

  let nextDay = 1;
  let isStreakBroken = false;
  
  if (lastClaimDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastClaimDate === yesterdayStr) {
      nextDay = (rewardStreak % 7) + 1;
    } else if (lastClaimDate !== todayStr) {
      isStreakBroken = true;
      nextDay = 1;
    } else {
      nextDay = rewardStreak; // They already claimed today, so the highest claimed day is currently rewardStreak
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
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-md"
          >
            <motion.div
              key="daily-modal-content"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-lg bg-transparent overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex flex-col items-center mb-6 text-center">
                <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 drop-shadow-lg">redeem</span>
                <h2 className="text-4xl font-black font-rabar tracking-tighter italic uppercase" style={{ color: 'rgb(203, 213, 225)' }}>خەلاتێن ڕۆژانە</h2>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-3 gap-3 px-1">
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
                        scale: 1,
                        rotate: [0, -1.5, 1.5, -1.5, 1.5, 0],
                      } : { opacity: isFuture ? 0.7 : 1, scale: 1 }}
                      transition={isNext ? {
                        rotate: {
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2.5,
                          ease: "easeInOut"
                        },
                        delay: item.day * 0.05
                      } : { delay: item.day * 0.05 }}
                      className={`
                        relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 overflow- transition-all shadow-sm
                        ${isDay7 ? 'col-span-3 py-6' : 'aspect-square'}
                        ${visualClaimed ? 'opacity-40 grayscale-[0.5]' : ''}
                        ${isFuture ? 'grayscale-[0.4] hover:grayscale-[0.2]' : ''}
                        ${isNext ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}
                      `}
                      style={{ 
                        backgroundColor: visualClaimed ? 'rgba(148, 163, 184, 0.1)' : (isFuture ? 'rgba(15, 23, 42, 0.4)' : isDay7 ? '#0f172a' : 'rgb(203, 213, 225)'),
                        borderColor: visualClaimed ? 'rgba(0,0,0,0.05)' : (isFuture ? 'rgba(255,255,255,0.05)' : isDay7 ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
                        boxShadow: isNext ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                    >
                      <span className={`font-black text-[11px] uppercase tracking-widest ${isFuture ? 'text-white/40' : 'text-slate-500 opacity-60'}`}>
                        ڕۆژا {toKuDigits(item.day)}
                      </span>

                      <div className="relative shrink-0 flex items-center justify-center">
                         {isDay7 ? (
                            <ZerIcon size={90} /> 
                         ) : item.type === 'fils' ? (
                           <FilsIcon size={64} />
                         ) : item.type === 'derhem' ? (
                           <DerhemIcon size={64} />
                         ) : item.type === 'zer' ? (
                           <ZerIcon size={64} />
                         ) : (
                           <span className="material-symbols-outlined text-3xl" style={{ color: isFuture ? 'rgba(255,255,255,0.3)' : item.color }}>
                              {item.icon}
                           </span>
                         )}
                        
                        {visualClaimed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                             <span className="material-symbols-outlined text-emerald-600 text-[60px] opacity-70">check</span>
                          </div>
                        )}

                        {isFuture && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#020617]/40 rounded-full backdrop-blur-[1px]">
                             <span className="material-symbols-outlined text-white/50 text-[32px]">lock</span>
                          </div>
                        )}

                        {isNext && (
                           <motion.div 
                              className="absolute -right-3 -top-3 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 z-10"
                              animate={claiming ? { scale: [1, 1.2, 0], opacity: [1, 1, 0], rotate: [0, 15, -15, 0] } : { scale: 1, opacity: 1 }}
                              transition={{ duration: claiming ? 0.5 : 0.2 }}
                           >
                             <span className="material-symbols-outlined text-white text-[20px]">
                                {claiming ? 'lock_open' : 'lock'}
                             </span>
                           </motion.div>
                        )}
                      </div>

                      <span className={`
                        font-black uppercase tracking-tight text-center
                        ${isDay7 ? 'text-2xl mt-2' : 'text-[12px]'}
                        ${isFuture ? 'text-white/40' : isDay7 ? 'text-white' : 'text-slate-900'}
                      `}>
                        {item.label}
                      </span>

                      {isNext && (
                        <motion.div 
                          key="selection-glow"
                          layoutId="reward-selected"
                          className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 flex flex-col gap-3 items-center w-full px-2">
                {isAvailableToday ? (
                  <div className="w-full h-14 bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center rounded-xl animate-pulse">
                     <span className="font-black text-emerald-400 text-[14px]">کلێک لەسەر ڕیواردی ئەمڕۆ بکە</span>
                  </div>
                ) : (
                  <div className="w-full h-14 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl font-black text-slate-500 uppercase tracking-widest italic">
                    سوبەھی وەرە بۆ خەلاتێ دی
                  </div>
                )}

                <button 
                  onClick={onClose}
                  className="w-full h-10 flex items-center justify-center rounded-lg border border-white/5 text-white/40 hover:text-white/60 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  پاشێ (LATER)
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
            className="fixed inset-0 z-110 flex items-center justify-center bg-[#020617]/95 backdrop-blur-3xl p-6"
            onClick={() => { setShowSuccess(false); onClose(); }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: 50, opacity: 0 }}
              className="text-center w-full max-w-xs"
            >
              {(() => {
                const claimedItem = REWARDS_CONFIG.find(r => r.day === claimedDay) || REWARDS_CONFIG[0];
                return (
                  <>
                    <div className="flex flex-col items-center justify-center mx-auto mb-8 relative">
                       <motion.div 
                          animate={{ y: [0, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="relative shrink-0 flex flex-col items-center justify-center drop-shadow-2xl"
                       >
                         {claimedItem.day === 7 ? (
                            <ZerIcon size={160} /> 
                         ) : claimedItem.type === 'fils' ? (
                           <FilsIcon size={130} />
                         ) : claimedItem.type === 'derhem' ? (
                           <DerhemIcon size={130} />
                         ) : claimedItem.type === 'zer' ? (
                           <ZerIcon size={130} />
                         ) : (
                           <span className="material-symbols-outlined text-[130px]" style={{ color: claimedItem.color, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>
                              {claimedItem.icon}
                           </span>
                         )}
                         <h2 className="text-xl font-black mt-3 whitespace-nowrap" style={{ color: claimedItem.color || '#fbbf24', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                           + {claimedItem.label}
                         </h2>
                       </motion.div>
                    </div>
                    <h3 className="text-5xl font-black text-white mb-2 italic tracking-tighter uppercase mt-4">پیرۆزە!</h3>
                    <p className="text-emerald-400 text-lg font-bold mb-10 text-opacity-80">تە خەلاتێ ڕۆژا {toKuDigits(claimedItem.day)} بدەستڤە هینات</p>
                  </>
                );
              })()}
              <button className="w-full h-16 bg-white text-black rounded-xl font-black text-xl shadow-2xl active:scale-95 transition-all">بەردەوام بە</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
