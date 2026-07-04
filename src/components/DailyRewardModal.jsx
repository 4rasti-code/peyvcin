import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import { playBackSfx } from '../utils/audio';
import { FilsIcon, DerhemIcon, DinarIcon, HintIcon, MagnetIcon, SkipIcon, SpinTicketIcon } from './CurrencyIcon';
import CoinAnimation from './CoinAnimation';
import ClipboardIcon from './ClipboardIcon';
import MysteryBoxIcon from './MysteryBoxIcon';

const REWARDS_CONFIG = [
  { day: 1, label: '١٠٠ فلس', type: 'fils', reward: { fils: 100 }, color: '#CD7F32' },
  { day: 2, label: '١ ھاریکاری', icon: 'lightbulb', reward: { hintCount: 1 }, color: '#f97316' },
  { day: 3, label: '١ پلێتا چەرخی', type: 'spinTicket', reward: { spinTicketCount: 1 }, color: '#10b981' },
  { day: 4, label: '٣ دەرھەم', type: 'derhem', reward: { derhem: 3 }, color: '#A0A0A0' },
  { day: 5, label: '١ موگناتیس', icon: 'auto_fix_high', reward: { magnetCount: 1 }, color: '#f43f5e' },
  { day: 6, label: '١ سندۆقا نەدیار', type: 'mystery_box', reward: { mystery_boxes_count: 1 }, color: '#8b5cf6' },
  { day: 7, label: '١ سکیپ + ١ دینار', type: 'grand', reward: { skipCount: 1, dinar: 1, fils: 200 }, color: '#FFD700', isGrand: true }
];

// COLOR MAP FOR DAYS MATCHING SCREENSHOT
const DAY_THEMES = {
  1: { border: 'border-[#38bdf8]', banner: 'bg-[#0ea5e9]' },
  2: { border: 'border-[#f472b6]', banner: 'bg-[#ec4899]' },
  3: { border: 'border-[#38bdf8]', banner: 'bg-[#0ea5e9]' },
  4: { border: 'border-[#38bdf8]', banner: 'bg-[#0ea5e9]' },
  5: { border: 'border-[#f472b6]', banner: 'bg-[#ec4899]' },
  6: { border: 'border-[#38bdf8]', banner: 'bg-[#0ea5e9]' },
  7: { border: 'border-[#facc15] bg-[#fef08a] dark:bg-yellow-900/40', banner: 'bg-[#f59e0b]' },
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
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    if (isOpen) {
      playDailyOpenSfx();
      if (hapticEnabled) triggerHaptic(10);
    }
  }, [isOpen, playDailyOpenSfx, hapticEnabled]);

  // Reset state when closing
  const handleClose = () => {
    window.isAnimatingReward = false;
    onClose();
  };

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

  useEffect(() => {
    if (!claimedToday) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      // Get current time in Baghdad timezone
      const baghdadTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Baghdad' });
      const baghdadDate = new Date(baghdadTimeStr);
      
      // Calculate midnight of the next day in Baghdad
      const tomorrowBaghdad = new Date(baghdadTimeStr);
      tomorrowBaghdad.setHours(24, 0, 0, 0);

      const diffMs = tomorrowBaghdad - baghdadDate;
      
      if (diffMs <= 0) {
        return toKuDigits('00:00:00');
      }

      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      const sStr = s.toString().padStart(2, '0');

      return toKuDigits(`${hStr}:${mStr}:${sStr}`);
    };

    setTimeLeftStr(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeftStr(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [claimedToday]);

  const handleClaim = async () => {
    if (claiming || claimedToday) return;
    console.log('[DailyRewardModal] handleClaim triggered');
    setClaiming(true);
    
    // Signal TopAppBar to defer visual wallet updates until coins fly
    window.isAnimatingReward = true;

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
        window.isAnimatingReward = false; // Reset on failure
      }
    } catch (err) {
      console.error('[DailyRewardModal] Claim error:', err);
      window.isAnimatingReward = false; // Reset on error
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
                <div className="mb-4 flex items-center justify-center">
                  <ClipboardIcon className="w-20 h-20" />
                </div>
                <h2 className="text-3xl font-black text-mono-900 dark:text-white mb-2">خەلاتێن ڕۆژانە</h2>
                {claimedToday && (
                  <div className="text-mono-500 dark:text-white/50 text-sm font-bold font-sans tracking-widest bg-mono-100 dark:bg-white/5 px-4 py-1 rounded-full border border-mono-200 dark:border-white/10 shadow-sm" dir="ltr">
                    {timeLeftStr}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 relative z-10">
                {REWARDS_CONFIG.map((item) => {
                  const isClaimed = item.day <= effectiveStreak;
                  const isNext = item.day === activeDay;
                  const isFuture = item.day > (claimedToday ? rewardStreak : activeDay);
                  const isDay7 = item.day === 7;
                  
                  // Compute ribbon text
                  const getRibbonText = (r) => {
                    return `x${toKuDigits(r.fils || r.hintCount || r.spinTicketCount || r.derhem || r.magnetCount || r.mystery_boxes_count || r.skipCount || r.dinar || 1)}`;
                  };

                  return (
                    <Motion.div
                      key={item.day}
                      onClick={isNext && !claiming ? handleClaim : undefined}
                      animate={isNext && !isClaimed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={isNext && !isClaimed ? { scale: { duration: 2, repeat: Infinity } } : { duration: 0.2 }}
                      className={`
                        relative flex flex-col transition-all overflow-hidden
                        ${isDay7 ? 'col-span-3 h-28 rounded-[20px] border-[4px]' : 'aspect-square rounded-[24px] border-[4px]'}
                        ${!isDay7 ? 'bg-white dark:bg-mono-900' : ''}
                        ${DAY_THEMES[item.day].border}
                        ${isClaimed ? 'opacity-50 scale-95' : (isNext ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] scale-[1.03] z-20 cursor-pointer' : 'opacity-90 hover:opacity-100')}
                      `}
                    >
                      {/* Upper Icon Section */}
                      {isDay7 ? (
                        <div className="flex-1 w-full flex flex-row items-center justify-around relative px-4 pt-1 pb-2">
                           <div className="relative flex flex-col items-center justify-center">
                             <SkipIcon size={40} />
                             {(!isFuture || isClaimed || isNext) && (
                               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-[#22c55e] text-white rounded-sm text-[10px] font-black shadow-[0_2px_0_#166534] whitespace-nowrap" dir="ltr">
                                 {getRibbonText({skipCount: 1})}
                               </div>
                             )}
                           </div>
                           <div className="relative flex flex-col items-center justify-center">
                             <DinarIcon size={46} />
                             {(!isFuture || isClaimed || isNext) && (
                               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-[#22c55e] text-white rounded-sm text-[10px] font-black shadow-[0_2px_0_#166534] whitespace-nowrap" dir="ltr">
                                 {getRibbonText({dinar: 1})}
                               </div>
                             )}
                           </div>
                           <div className="relative flex flex-col items-center justify-center">
                             <FilsIcon size={40} />
                             {(!isFuture || isClaimed || isNext) && (
                               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-[#22c55e] text-white rounded-sm text-[10px] font-black shadow-[0_2px_0_#166534] whitespace-nowrap" dir="ltr">
                                 {getRibbonText({fils: 200})}
                               </div>
                             )}
                           </div>
                        </div>
                      ) : (
                        <div className="flex-1 w-full flex items-center justify-center relative pt-2 pb-4">
                          {isFuture && !isClaimed ? (
                            <span className="material-symbols-outlined text-4xl! opacity-40">lock</span>
                          ) : isNext && !isClaimed ? (
                            <span className="material-symbols-outlined text-5xl! text-[#0ea5e9] animate-pulse">redeem</span>
                          ) : (
                            <div className="scale-110 drop-shadow-sm">
                              {item.type === 'fils' ? <FilsIcon size={42} /> :
                               item.type === 'derhem' ? <DerhemIcon size={42} /> :
                               item.type === 'spinTicket' ? <SpinTicketIcon size={42} /> :
                               item.type === 'mystery_box' ? <MysteryBoxIcon size={46} /> :
                               item.icon === 'lightbulb' ? <HintIcon size={46} /> :
                               item.icon === 'auto_fix_high' ? <MagnetIcon size={46} /> : null}
                            </div>
                          )}

                          {(!isFuture || isClaimed || isNext) && (!isNext || isClaimed) && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 bg-[#22c55e] text-white rounded-sm text-[11px] font-black shadow-[0_2px_0_#166534] whitespace-nowrap" dir="ltr">
                              {getRibbonText(item.reward)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Lower Day Label Section */}
                      <div className={`w-full h-8 flex items-center justify-center text-white font-black text-xs relative z-0 tracking-wide
                        ${isDay7 ? 'h-9 text-sm' : ''}
                        ${DAY_THEMES[item.day].banner}
                      `}>
                        ڕۆژی {toKuDigits(item.day)}
                      </div>

                      {/* Checkmark overlay */}
                      {isClaimed && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                           <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black shadow-2xl border-2 border-white dark:border-black scale-110 rotate-12">
                              <span className="material-symbols-outlined text-[24px] font-bold">check</span>
                           </div>
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
                  onClick={() => { playBackSfx(); handleClose(); }}
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
                        ) : (
                          <span className="block mx-auto text-center material-symbols-outlined text-[90px]! text-black dark:text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            {claimedDayInfo?.icon || 'redeem'}
                          </span>
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
                        window.isAnimatingReward = false; // Reset after animation completes
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


