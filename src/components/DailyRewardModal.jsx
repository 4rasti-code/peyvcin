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

const AdvancedSparkle = ({ className, delaySec }) => (
  <Motion.div
    className={`absolute pointer-events-none z-50 ${className}`}
    initial={{ scale: 0, opacity: 0, rotate: -20 }}
    animate={{
      scale: [0, 1.3, 0],
      opacity: [0, 1, 0],
      rotate: [-20, 70]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delaySec,
      ease: "easeInOut"
    }}
  >
    <svg viewBox="-20 -20 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
      <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" fill="#FDE047" />
      <path d="M50 20C50 36.568 36.568 50 20 50C36.568 50 50 63.431 50 80C50 63.431 63.431 50 80 50C63.431 50 50 36.568 50 20Z" fill="#FFFFFF" />
    </svg>
  </Motion.div>
);

const REWARDS_CONFIG = [
  { day: 1, label: '١٠٠ فلس', type: 'fils', reward: { fils: 100 }, color: '#CD7F32' },
  { day: 2, label: '١ هاریکاری', icon: 'lightbulb', reward: { hintCount: 1 }, color: '#f97316' },
  { day: 3, label: '١ بلیتێ سپینێ', type: 'spinTicket', reward: { spinTicketCount: 1 }, color: '#10b981' },
  { day: 4, label: '٣ دەرهەم', type: 'derhem', reward: { derhem: 3 }, color: '#A0A0A0' },
  { day: 5, label: '١ مۆگناتیس', icon: 'auto_fix_high', reward: { magnetCount: 1 }, color: '#f43f5e' },
  { day: 6, label: '١ سندۆقا نەدیار', type: 'mystery_box', reward: { mystery_boxes_count: 1 }, color: '#8b5cf6' },
  { day: 7, label: '٢٠٠ فلس + ١ سکیپ + ١ دینار', type: 'grand', reward: { skipCount: 1, dinar: 1, fils: 200 }, color: '#FFD700', isGrand: true }
];

// COLOR MAP FOR DAYS MATCHING SCREENSHOT
const DAY_THEMES = {
  1: { border: 'border-[#2563eb]', banner: 'bg-[#3b82f6]' }, // Blue (Complementary to Bronze/Fils)
  2: { border: 'border-[#7c3aed]', banner: 'bg-[#8b5cf6]' }, // Purple (Complementary to Yellow/Hint)
  3: { border: 'border-[#0284c7]', banner: 'bg-[#0ea5e9]' }, // Sky/Cyan (Complementary to Orange/Ticket)
  4: { border: 'border-[#e11d48]', banner: 'bg-[#f43f5e]' }, // Rose/Pink (Contrast for Silver/Derhem)
  5: { border: 'border-[#059669]', banner: 'bg-[#10b981]' }, // Emerald (Complementary to Red/Magnet)
  6: { border: 'border-[#ea580c]', banner: 'bg-[#f97316]' }, // Orange (Contrast for Wood/Mystery Box)
  7: { border: 'border-[#facc15] bg-[#fef08a]', banner: 'bg-[#f59e0b]' }, // Gold (Grand)
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
        setBoxState('opened');
        setShowSuccess(true);
        
        setTimeout(() => {
          playDailyClaimSfx();
          if (hapticEnabled) triggerHaptic([60, 100, 60]);
          const colors = ['#FFD700', isDark ? '#ffffff' : '#000000', '#ffffff'];
          confetti({ particleCount: 150, spread: 90, origin: { x: 0.5, y: 0.5 }, colors, zIndex: 2000, startVelocity: 45 });
        }, 100);
      } else {
        const errorMsg = result?.error || "خەلات ناهێتە وەرگرتن، دبیت تو یێ ل هیڤیا دەمێ نوی بی.";
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
            animate={{ opacity: animatingReward ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-mono-100/70 dark:bg-black/80 backdrop-blur-md pointer-events-auto"
          >
            {/* Screen-level Close Button */}
            <button 
              onClick={() => { playBackSfx(); handleClose(); }} 
              className="fixed top-[calc(env(safe-area-inset-top)+24px)] right-6 w-11 h-11 rounded-md bg-mono-500/10 dark:bg-white/10 backdrop-blur-md border border-mono-500/10 dark:border-white/10 flex items-center justify-center text-mono-600 dark:text-white/70 hover:text-mono-900 dark:hover:text-white hover:bg-mono-500/20 dark:hover:bg-white/20 transition-all z-110"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

              <div className="flex flex-col items-center mb-8 text-center relative z-10">
                <div className="mb-4 flex items-center justify-center">
                  <ClipboardIcon className="w-20 h-20" />
                </div>
                <h2 className="text-3xl font-black text-mono-900 dark:text-white mb-2">خەلاتێن ڕۆژانە</h2>
                {claimedToday && (
                  <div className="text-mono-500 dark:text-white/50 text-sm font-bold font-sans tracking-widest bg-mono-100 dark:bg-white/5 px-4 py-1 rounded-full border border-mono-200 dark:border-white/10 shadow-sm tabular-nums" dir="ltr">
                    {timeLeftStr}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 relative z-10">
                {REWARDS_CONFIG.map((item) => {
                  const isClaimed = item.day <= effectiveStreak;
                  const isNext = item.day === activeDay;
                  const isDay7 = item.day === 7;

                  // Compute ribbon text
                  const getRibbonText = (r) => {
                    return `x${toKuDigits(r.fils || r.hintCount || r.spinTicketCount || r.derhem || r.magnetCount || r.mystery_boxes_count || r.skipCount || r.dinar || 1)}`;
                  };

                  return (
                    <Motion.div
                      key={item.day}
                      onClick={isNext && !claiming ? handleClaim : undefined}
                      animate={isNext && !isClaimed ? { scale: [1, 1.025, 1] } : { scale: 1 }}
                      transition={isNext && !isClaimed ? { scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } } : { duration: 0.2 }}
                      className={`
                        relative flex flex-col transition-all
                        ${isDay7 ? 'col-span-3 h-auto min-h-32 sm:min-h-36 rounded-[20px] border-[5px]' : 'aspect-square rounded-[20px] border-[5px]'}
                        ${!isDay7 ? 'bg-[#fff9e6]' : ''}
                        ${DAY_THEMES[item.day].border}
                        ${isClaimed ? 'opacity-80 scale-[0.98]' : (isNext ? 'ring-2 ring-[#facc15] shadow-[0_0_15px_3px_rgba(250,204,21,0.9)] scale-[1.025] z-30 cursor-pointer' : 'hover:scale-[1.02]')}
                      `}
                    >
                      {/* Active Day Sparkles */}
                      {isNext && !isClaimed && (
                        <div className="absolute inset-0 pointer-events-none z-40">
                          <AdvancedSparkle className="-top-3 -left-2 w-8 h-8" delaySec={0} />
                          <AdvancedSparkle className="top-8 -right-3 w-6 h-6" delaySec={0.8} />
                          <AdvancedSparkle className="-bottom-2 left-4 w-7 h-7" delaySec={1.5} />
                          <AdvancedSparkle className="-top-1 right-2 w-4 h-4" delaySec={0.4} />
                          <AdvancedSparkle className="bottom-6 -left-2 w-3 h-3 blur-[1px] opacity-80" delaySec={1.1} />
                          <AdvancedSparkle className="-bottom-1 right-5 w-5 h-5 blur-[1px]" delaySec={1.9} />
                          <AdvancedSparkle className="top-1/2 -left-4 w-3 h-3 blur-[1px]" delaySec={0.6} />
                          <AdvancedSparkle className="top-2 right-1/4 w-2 h-2 blur-[1px] opacity-70" delaySec={1.3} />
                          <AdvancedSparkle className="-top-3 left-1/3 w-4 h-4 blur-[2px] opacity-60" delaySec={2.2} />
                          <AdvancedSparkle className="-bottom-4 right-2 w-3 h-3 blur-[1px] opacity-80" delaySec={2.7} />
                          <AdvancedSparkle className="bottom-1/3 -right-3 w-4 h-4 blur-[1px]" delaySec={3.1} />
                        </div>
                      )}

                      {isDay7 && (
                        <div className="absolute inset-0 pointer-events-none rounded-[15px] overflow-hidden z-0">
                          <div className="absolute -inset-4 opacity-50" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.4) 15px, rgba(255,255,255,0.4) 30px)'
                          }} />
                        </div>
                      )}

                      {isDay7 ? (
                        <div className="absolute top-0 left-0 right-0 bottom-8 sm:bottom-10 flex flex-row items-center justify-around px-2 sm:px-4">
                          <div className="relative flex flex-col items-center justify-center pt-2">
                            <SkipIcon className="w-12 h-12 sm:w-14 sm:h-14" />
                            <span className="font-black text-[13px] sm:text-[15px] mt-0.5 sm:mt-1 text-gray-800" dir="ltr">
                              {getRibbonText({ skipCount: 1 })}
                            </span>
                          </div>
                          <div className="relative flex flex-col items-center justify-center pt-2">
                            <DinarIcon className="w-10 h-10 sm:w-14 sm:h-14" />
                            <span className="font-black text-[13px] sm:text-[15px] mt-0.5 sm:mt-1 text-gray-800" dir="ltr">
                              {getRibbonText({ dinar: 1 })}
                            </span>
                          </div>
                          <div className="relative flex flex-col items-center justify-center pt-2">
                            <FilsIcon className="w-10 h-10 sm:w-11 sm:h-11" />
                            <span className="font-black text-[13px] sm:text-[15px] mt-0.5 sm:mt-1 text-gray-800" dir="ltr">
                              {getRibbonText({ fils: 200 })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute top-0 left-0 right-0 bottom-7 sm:bottom-10 flex flex-col items-center justify-center">
                          <div className="relative flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center">
                              {item.type === 'fils' ? <FilsIcon className="w-9 h-9 sm:w-10 sm:h-10" /> :
                               item.type === 'derhem' ? <DerhemIcon className="w-9 h-9 sm:w-10 sm:h-10" /> :
                               item.type === 'spinTicket' ? <SpinTicketIcon className="w-14 h-14 sm:w-16 sm:h-16" /> :
                               item.type === 'mystery_box' ? <MysteryBoxIcon className="w-14 h-14 sm:w-14 sm:h-14" /> :
                               item.icon === 'lightbulb' ? <HintIcon className="w-12 h-12 sm:w-12 sm:h-12" /> :
                               item.icon === 'auto_fix_high' ? <MagnetIcon className="w-12 h-12 sm:w-12 sm:h-12" /> : null}
                            </div>

                            <span className={`font-black text-[13px] sm:text-[15px] ${
                              item.type === 'spinTicket' ? '-mt-3 sm:-mt-5 relative z-10' :
                              item.type === 'derhem' || item.type === 'fils' ? '-mt-0.5 sm:-mt-1 relative z-10' :
                              item.type === 'mystery_box' || item.icon === 'auto_fix_high' ? '-mt-1.5 sm:-mt-2 relative z-10' :
                              '-mt-1 sm:-mt-1.5 relative z-10'
                            } text-gray-800`} dir="ltr">
                              {getRibbonText(item.reward)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Lower Day Label Section */}
                      <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-center text-white font-black z-10 rounded-b-[14px]
                        ${isDay7 ? 'h-8 sm:h-10 text-[14px] sm:text-[16px]' : 'h-7 sm:h-10 text-[12px] sm:text-[14px]'}
                        ${DAY_THEMES[item.day].banner}
                      `}>
                        ڕۆژا {toKuDigits(item.day)}
                      </div>

                      {/* Checkmark overlay */}
                      {isClaimed && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 bg-black/10 rounded-[15px]">
                          <div className="absolute top-2 right-2 w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                            <span className="material-symbols-outlined text-[20px] font-black">check</span>
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
            className="fixed inset-0 z-110 flex items-center justify-center p-6"
          >
            <Motion.div 
              animate={{ opacity: animatingReward ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-mono-100/70 dark:bg-black/80 backdrop-blur-md"
            />
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 flex flex-col items-center relative min-w-[320px] justify-center w-full max-w-md pointer-events-auto"
            >
              {boxState === 'opened' && (
                <Motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex flex-col items-center w-full"
                >
                  <Motion.div 
                    animate={{ opacity: animatingReward ? 0 : 1, scale: animatingReward ? 0.95 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center w-full"
                  >
                    <h3 className="text-5xl font-black mb-3 bg-linear-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">پیرۆزە!</h3>
                    <p className="text-mono-900 dark:text-white/90 text-xl font-medium mb-12">تە خەلاتێ ڕۆژا {toKuDigits(claimedDayInfo?.day || 1)} وەرگرت</p>

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
                          <div className="flex gap-2 sm:gap-4 items-center justify-center mx-auto overflow-visible">
                            <SkipIcon size={100} />
                            <DinarIcon size={120} />
                            <FilsIcon size={100} />
                          </div>
                        ) : claimedDayInfo?.type === 'fils' ? (
                          <FilsIcon size={110} className="block mx-auto overflow-visible" />
                        ) : claimedDayInfo?.type === 'derhem' ? (
                          <DerhemIcon size={110} className="block mx-auto overflow-visible" />
                        ) : claimedDayInfo?.type === 'spinTicket' ? (
                          <SpinTicketIcon size={120} className="block mx-auto overflow-visible" />
                        ) : claimedDayInfo?.type === 'mystery_box' ? (
                          <MysteryBoxIcon size={110} className="block mx-auto overflow-visible" />
                        ) : claimedDayInfo?.icon === 'lightbulb' ? (
                          <HintIcon size={120} animate={true} className="block mx-auto overflow-visible" />
                        ) : claimedDayInfo?.icon === 'auto_fix_high' ? (
                          <MagnetIcon size={120} animate={true} className="block mx-auto overflow-visible" />
                        ) : (
                          <span className="block mx-auto text-center material-symbols-outlined text-[90px]! text-black dark:text-white">
                            {claimedDayInfo?.icon || 'redeem'}
                          </span>
                        )}
                      </Motion.div>
                    </Motion.div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/30 rounded-full blur-[80px] pointer-events-none" />

                    <Motion.div
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
                      className="mt-6 text-mono-900 dark:text-white font-black text-3xl relative z-10"
                    >
                      {claimedDayInfo?.label}
                    </Motion.div>

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
                    className={`w-40 h-11 flex items-center justify-center mx-auto bg-primary text-white rounded-md font-black text-lg shadow-md transition-all hover:brightness-110 ${animatingReward ? 'opacity-50 cursor-not-allowed scale-95' : 'active:scale-95'}`}
                  >
                    وەرگرتن
                  </Motion.button>
                </Motion.div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <CoinAnimation
                    trigger={animatingReward}
                    isDaily={true}
                    type={claimedDayInfo?.type || (claimedDayInfo?.icon === 'lightbulb' ? 'hint' : claimedDayInfo?.icon === 'auto_fix_high' ? 'magnet' : claimedDayInfo?.icon === 'fast_forward' ? 'skip' : 'fils')}
                    amount={claimedDayInfo?.reward?.fils || claimedDayInfo?.reward?.derhem || claimedDayInfo?.reward?.dinar || claimedDayInfo?.reward?.hintCount || claimedDayInfo?.reward?.magnetCount || claimedDayInfo?.reward?.skipCount || 1}
                  />
                </div>
              </Motion.div>
              )}
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


