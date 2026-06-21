import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import { playBackSfx } from '../utils/audio';
import { FilsIcon, DerhemIcon, DinarIcon, HintIcon, MagnetIcon, SkipIcon } from './CurrencyIcon';
import CoinAnimation from './CoinAnimation';
import DailyStampIcon from './DailyStampIcon';

const REWARDS_CONFIG = [
  { day: 1, label: '٢٠٠ فلس', type: 'fils', reward: { fils: 200 }, color: '#CD7F32' },
  { day: 2, label: '١ ھاریکاری', icon: 'lightbulb', reward: { hintCount: 1 }, color: '#f97316' },
  { day: 3, label: '٥ دەرھەم', type: 'derhem', reward: { derhem: 5 }, color: '#A0A0A0' },
  { day: 4, label: '١ موگناتیس', icon: 'auto_fix_high', reward: { magnetCount: 1 }, color: '#f43f5e' },
  { day: 5, label: '١٥ دەرھەم', type: 'derhem', reward: { derhem: 15 }, color: '#A0A0A0' },
  { day: 6, label: '١ دەربازبوون', icon: 'fast_forward', reward: { skipCount: 1 }, color: '#0ea5e9' },
  { day: 7, label: '٢٠٠٠ فلس + ١ دینار', type: 'fils', reward: { fils: 2000, dinar: 1 }, color: '#FFD700', isGrand: true }
];

// COLOR MAP FOR DAYS
const DAY_COLORS = {
  1: "bg-violet-500 text-white shadow-[0_4px_0_#6d28d9] border-none",
  2: "bg-amber-500 text-white shadow-[0_4px_0_#b45309] border-none",
  3: "bg-rose-500 text-white shadow-[0_4px_0_#be123c] border-none",
  4: "bg-emerald-500 text-white shadow-[0_4px_0_#047857] border-none",
  5: "bg-cyan-500 text-white shadow-[0_4px_0_#0e7490] border-none",
  6: "bg-fuchsia-500 text-white shadow-[0_4px_0_#a21caf] border-none",
  7: "bg-yellow-500 text-white shadow-[0_5px_0_#ca8a04] border-none",
};

const DAY_STYLES = {
  available: "ring-2 ring-white dark:ring-black outline outline-4 outline-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)] z-20 cursor-pointer scale-105 brightness-110",
  claimed: "opacity-60 translate-y-[4px] !shadow-none border-none",
};

export default function DailyRewardModal({ isOpen, onClose, isDark }) {
  const {
    rewardStreak,
    lastRewardClaimedAt,
    claimDailyReward,
    hapticEnabled
  } = useGame();

  const { playDailyOpenSfx, playDailyClaimSfx } = useAudio();
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [boxState, setBoxState] = useState('unopened'); // 'unopened', 'opening', 'opened'
  const [animatingReward, setAnimatingReward] = useState(false);
  const [claimedDayInfo, setClaimedDayInfo] = useState(null);
  const [serverReportedClaimed, setServerReportedClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playDailyOpenSfx();
      if (hapticEnabled) triggerHaptic(10);
    }
  }, [isOpen, playDailyOpenSfx, hapticEnabled]);

  // --- LOGIC HELPERS ---
  const hasClaimedToday = () => {
    if (!lastRewardClaimedAt) return false;
    
    try {
      // Force calculation using Kurdistan Timezone (Asia/Baghdad)
      const formatter = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Baghdad',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const lastClaimStr = formatter.format(new Date(lastRewardClaimedAt));
      const todayStr = formatter.format(new Date());
      
      return lastClaimStr === todayStr;
    } catch (e) {
      console.warn("[DailyRewardModal] Date formatting error:", e);
      return false;
    }
  };
  
  const claimedToday = hasClaimedToday() || serverReportedClaimed;
  const effectiveStreak = (rewardStreak === 7 && !claimedToday) ? 0 : rewardStreak;
  const activeDay = claimedToday ? -1 : (effectiveStreak % 7) + 1;

  const handleClaim = async () => {
    if (claiming || claimedToday) return;
    console.log('[DailyRewardModal] handleClaim triggered');
    setClaiming(true);

    try {
      const result = await claimDailyReward();
      if (result && result.success) {
        setClaimedDayInfo(REWARDS_CONFIG.find(r => r.day === result.streak));
        setBoxState('unopened');
        setShowSuccess(true);
      } else {
        const errorMsg = result?.error || "خەلات ناهێتە وەرگرتن، دبیت تو یێ ل هیڤیا دەمێ نوو بی.";
        if (errorMsg.toLowerCase().includes('already claimed') || errorMsg.includes('claimed today') || errorMsg.includes('بەری نوکە')) {
          setServerReportedClaimed(true);
        } else {
          alert(errorMsg);
        }
      }
    } catch (err) {
      console.error('[DailyRewardModal] Claim error:', err);
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen && !showSuccess) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-black border border-mono-200 dark:border-white/10 rounded-md shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16" />

              <div className="flex flex-col items-center mb-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-md bg-mono-100 dark:bg-white/5 border border-mono-200 dark:border-white/10 flex items-center justify-center mb-4 shadow-lg">
                  <DailyStampIcon className="w-12 h-12 drop-shadow-md" />
                </div>
                <h2 className="text-3xl font-black text-mono-900 dark:text-white">خەلاتێن ڕۆژانە</h2>
                <p className="text-mono-500 dark:text-white/50 text-sm font-medium mt-1">٧ ڕۆژ - خەلاتێن بەردەوام و نایاب</p>
              </div>

              <div className="grid grid-cols-3 gap-3 relative z-10">
                {REWARDS_CONFIG.map((item) => {
                  const isClaimed = item.day <= effectiveStreak;
                  const isNext = item.day === activeDay;
                  const isFuture = item.day > (claimedToday ? rewardStreak : activeDay);
                  const isDay7 = item.day === 7;
                  
                  return (
                    <Motion.div
                      key={item.day}
                      onClick={isNext && !claiming ? handleClaim : undefined}
                      // STOP ALL ANIMATION IF CLAIMED
                      animate={isNext && !isClaimed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={isNext && !isClaimed ? { scale: { duration: 2, repeat: Infinity } } : { duration: 0.2 }}
                      className={`
                        relative p-3 rounded-md border flex flex-col items-center justify-center gap-1.5 transition-all
                        ${isDay7 ? 'col-span-3 h-28 flex-row justify-between px-8 overflow-hidden' : 'aspect-square'}
                        
                        ${DAY_COLORS[item.day]}
                        ${isClaimed ? DAY_STYLES.claimed : (isNext ? DAY_STYLES.available : 'opacity-90 hover:opacity-100')}
                        ${isFuture && !isClaimed && !isNext ? 'opacity-70' : ''}
                      `}
                    >
                      <div className={`flex flex-col ${isDay7 ? 'items-start' : 'items-center'}`}>
                        <span className={`font-black text-[10px] uppercase tracking-normal ${isNext && !isClaimed ? '' : 'opacity-80'}`}>
                          ڕۆژا {toKuDigits(item.day)}
                        </span>
                        {isDay7 && !isFuture && (
                          <span className={`font-black text-2xl italic mt-1`}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      <div className={`relative flex items-center justify-center ${isDay7 ? 'w-24' : 'flex-1'}`}>
                        {/* ICON LOGIC */}
                        {isFuture && !isClaimed ? (
                          <div className="flex flex-col items-center justify-center opacity-40">
                            <span className={`material-symbols-outlined ${isDay7 ? 'text-[70px]' : 'text-4xl'}!`}>
                              lock
                            </span>
                          </div>
                        ) : isDay7 ? (
                          <DinarIcon size={isDay7 && isNext ? 85 : 70} />
                        ) : isNext && !isClaimed ? (
                          <DailyStampIcon className="w-12 h-12" />
                        ) : (
                          <>
                            {item.type === 'fils' ? (
                              <FilsIcon size={36} />
                            ) : item.type === 'derhem' ? (
                              <DerhemIcon size={36} />
                            ) : item.icon === 'lightbulb' ? (
                              <HintIcon size={40} />
                            ) : item.icon === 'auto_fix_high' ? (
                              <MagnetIcon size={40} />
                            ) : item.icon ? (
                              <span className="material-symbols-outlined text-4xl!">
                                {item.icon}
                              </span>
                            ) : (
                              <DailyStampIcon className="w-12 h-12" />
                            )}
                          </>
                        )}

                        {isClaimed && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black shadow-lg border border-mono-200 dark:border-white/10 scale-110">
                                <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                             </div>
                          </div>
                        )}
                      </div>

                      {!isDay7 && (
                        <div className="w-full text-center">
                          <span className="font-black uppercase tracking-normal text-[11px] leading-tight block truncate">
                            {isFuture ? '' : item.label}
                          </span>
                        </div>
                      )}

                      {isNext && (
                        <div className="absolute -top-1 -left-1">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
                          </span>
                        </div>
                      )}
                    </Motion.div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-3 relative z-10">
                {!claimedToday && (
                  <p className="text-center text-mono-400 dark:text-white/30 text-[10px] font-bold uppercase animate-pulse">
                    کلیک ل سەر دیارییا ئەڤرۆ بکە بۆ وەرگرتنێ
                  </p>
                )}
                
                <button 
                  onClick={() => { playBackSfx(); onClose(); }}
                  className="w-full h-14 flex items-center justify-center rounded-md bg-black dark:bg-white text-white dark:text-black hover:brightness-110 font-black text-sm uppercase transition-all active:scale-95 shadow-lg"
                >
                  داخستن
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-md p-6"
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center bg-white dark:bg-black border border-mono-200 dark:border-white/10 rounded-md shadow-2xl p-10 flex flex-col items-center relative overflow-hidden min-w-[320px] min-h-[350px] justify-center"
            >
              {boxState === 'unopened' && (
                <Motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  <h3 className="text-3xl font-black text-mono-900 dark:text-white mb-2">دیاریەک بۆ تە!</h3>
                  <p className="text-mono-500 dark:text-white/50 text-sm font-medium mb-10 animate-pulse">کلیک ل سەر دیاریێ بکە بۆ ڤەکرنێ</p>
                  
                  <Motion.button
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    onClick={() => {
                       setBoxState('opening');
                       if (hapticEnabled) triggerHaptic([20, 30, 20, 50, 60, 80]);
                       setTimeout(() => {
                         setBoxState('opened');
                         playDailyClaimSfx();
                         if (hapticEnabled) triggerHaptic([60, 100, 60]);
                         const colors = ['#FFD700', isDark ? '#ffffff' : '#000000', '#ffffff'];
                         confetti({ particleCount: 150, spread: 90, origin: { x: 0.5, y: 0.5 }, colors, zIndex: 2000, startVelocity: 45 });
                       }, 1300);
                    }}
                    className="mb-6 hover:scale-110 transition-transform cursor-pointer relative group"
                  >
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/40 transition-all duration-500" />
                    <span className="relative z-10 material-symbols-outlined text-[120px]! text-primary drop-shadow-[0_10px_20px_rgba(var(--color-primary),0.5)]">
                      featured_seasonal_and_gifts
                    </span>
                  </Motion.button>
                </Motion.div>
              )}

              {boxState === 'opening' && (
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-3xl font-black text-mono-900 dark:text-white mb-2 opacity-50">ڤەکرن...</h3>
                  <p className="text-mono-500 dark:text-white/50 text-sm font-medium mb-10 opacity-0">کلیک</p>
                  
                  <Motion.div
                    animate={{ 
                      x: [-10, 10, -15, 15, -8, 8, -5, 5, 0], 
                      scale: [1, 1.05, 1.1, 1.15, 1.25, 1.3],
                      rotate: [-5, 5, -5, 5, -2, 2, 0]
                    }}
                    transition={{ duration: 1.3, ease: "easeInOut" }}
                    className="mb-6"
                  >
                    <span className="material-symbols-outlined text-[120px]! text-primary blur-[1px]">
                      featured_seasonal_and_gifts
                    </span>
                  </Motion.div>
                </div>
              )}

              {boxState === 'opened' && (
                <Motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex flex-col items-center w-full"
                >
                  <h3 className="text-4xl font-black mb-2 bg-linear-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">پیرۆزە!</h3>
                  <p className="text-mono-500 dark:text-white/50 text-lg font-medium mb-8">تە خەلاتێ ڕۆژا {toKuDigits(claimedDayInfo?.day || 1)} وەرگرت</p>
                  
                  <div className="mb-10 relative flex flex-col justify-center items-center w-full">
                    <Motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                      className="relative z-10 flex justify-center"
                    >
                      <Motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {claimedDayInfo?.isGrand ? (
                          <DinarIcon size={120} className="block mx-auto overflow-visible filter drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]" />
                        ) : claimedDayInfo?.type === 'fils' ? (
                          <FilsIcon size={110} className="block mx-auto overflow-visible filter drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]" />
                        ) : claimedDayInfo?.type === 'derhem' ? (
                          <DerhemIcon size={110} className="block mx-auto overflow-visible filter drop-shadow-[0_0_25px_rgba(203,213,225,0.4)]" />
                        ) : claimedDayInfo?.icon === 'lightbulb' ? (
                          <HintIcon size={120} animate={true} className="block mx-auto overflow-visible filter drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]" />
                        ) : claimedDayInfo?.icon === 'auto_fix_high' ? (
                          <MagnetIcon size={120} animate={true} className="block mx-auto overflow-visible filter drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]" />
                        ) : claimedDayInfo?.icon ? (
                          <span className="block mx-auto text-center material-symbols-outlined text-[90px]! text-black dark:text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            {claimedDayInfo.icon}
                          </span>
                        ) : (
                          <div className="flex justify-center items-center">
                             <DailyStampIcon className="w-[120px] h-[120px] drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                          </div>
                        )}
                      </Motion.div>
                    </Motion.div>
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                    <Motion.div 
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
                      className="mt-6 px-8 py-3 bg-linear-to-r from-mono-900 to-black dark:from-white dark:to-mono-100 text-white dark:text-black rounded-xl font-black text-2xl relative z-10 shadow-2xl border border-white/10 dark:border-mono-900/10"
                    >
                      + {claimedDayInfo?.label}
                    </Motion.div>

                    <CoinAnimation 
                      trigger={animatingReward} 
                      isDaily={true} 
                      type={claimedDayInfo?.type || (claimedDayInfo?.icon === 'lightbulb' ? 'hint' : claimedDayInfo?.icon === 'auto_fix_high' ? 'magnet' : claimedDayInfo?.icon === 'fast_forward' ? 'skip' : 'fils')}
                      amount={claimedDayInfo?.reward?.fils || claimedDayInfo?.reward?.derhem || claimedDayInfo?.reward?.dinar || claimedDayInfo?.reward?.hintCount || claimedDayInfo?.reward?.magnetCount || claimedDayInfo?.reward?.skipCount || 1} 
                    />
                  </div>

                  <Motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => { 
                      if (animatingReward) return;
                      setAnimatingReward(true);
                      setTimeout(() => {
                        setShowSuccess(false); 
                        setAnimatingReward(false);
                        onClose(); 
                      }, 2200);
                    }}
                    className={`w-full h-14 bg-primary text-white rounded-md font-black text-lg shadow-xl transition-all hover:brightness-110 ${animatingReward ? 'opacity-50 cursor-not-allowed scale-95' : 'active:scale-95'}`}
                  >
                    بەردەوام بە
                  </Motion.button>
                </Motion.div>
              )}
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


