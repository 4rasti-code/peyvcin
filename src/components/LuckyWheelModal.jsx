import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/haptics';
import { playBackSfx, playChestOpenSfx, playWheelSpinSfx } from '../utils/audio';
import { toKuDigits } from '../utils/formatters';
import LuckyWheelIcon, { LuckyWheelInner, LuckyWheelFrame } from './LuckyWheelIcon';
import { WHEEL_REWARDS } from '../constants/wheelRewards';
import CoinAnimation from './CoinAnimation';
import { FilsIcon, HintIcon, DerhemIcon, SkipIcon, MagnetIcon, DinarIcon, SpinTicketIcon } from './CurrencyIcon';
import MysteryBoxIcon from './MysteryBoxIcon';

export default function LuckyWheelModal({ isOpen, onClose }) {
  const { user, syncProfile } = useUser();
  const { updateInventory, spinTicketCount } = useGame();

  const [canSpin, setCanSpin] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const spinRotationMotion = useMotionValue(0);
  const [showReward, setShowReward] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const checkSpinStatus = async () => {
      if (!user) return;

      // === TEST MODE ===
      // Disabled for production to enforce once-a-day limit
      const isTestMode = false;
      if (isTestMode) {
        setCanSpin(true);
        setLoadingCheck(false);
        return;
      }
      // =================

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('last_spin_date')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!data.last_spin_date) {
          setCanSpin(true);
        } else {
          const lastSpin = new Date(data.last_spin_date);
          const now = new Date();
          const diffMs = now - lastSpin;
          const hours24 = 24 * 60 * 60 * 1000;

          if (diffMs >= hours24) {
            setCanSpin(true);
          } else {
            setCanSpin(false);
            startCountdown(hours24 - diffMs);
          }
        }
      } catch (err) {
        console.error("Failed to check spin status:", err);
      } finally {
        setLoadingCheck(false);
      }
    };

    checkSpinStatus();

    // Reset state on open
    setShowReward(false);
    setWonReward(null);
    setIsClaiming(false);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, user]);



  const startCountdown = (initialDiffMs) => {
    const updateTimer = (diff) => {
      if (diff <= 0) {
        setCanSpin(true);
        setTimeLeftStr('');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      const sStr = s.toString().padStart(2, '0');

      setTimeLeftStr(toKuDigits(`${hStr}:${mStr}:${sStr}`));
    };

    let currentDiff = initialDiffMs;
    updateTimer(currentDiff);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      currentDiff -= 1000;
      updateTimer(currentDiff);
      if (currentDiff <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  };

  const isTicketAvailable = spinTicketCount > 0;
  const canActuallySpin = canSpin || isTicketAvailable;

  const handleSpin = async () => {
    if (isSpinning || !canActuallySpin) return;

    // Determine if we are using a ticket or a free spin
    const usingTicket = !canSpin && isTicketAvailable;

    triggerHaptic(15);
    setIsSpinning(true);
    if (!usingTicket) setCanSpin(false); // Only disable normal spin if we didn't use a ticket
    playWheelSpinSfx();

    if (usingTicket) {
      updateInventory({ spinTicketCount: -1 }, true, true);
    }

    // Random reward based on weight (only from winnable ones)
    const winnableRewards = WHEEL_REWARDS.filter(r => r.winnable);
    const totalWeight = winnableRewards.reduce((sum, r) => sum + (r.weight || 1), 0);
    let randomNum = Math.random() * totalWeight;
    let reward = winnableRewards[0];

    for (const r of winnableRewards) {
      const weight = r.weight || 1;
      if (randomNum < weight) {
        reward = r;
        break;
      }
      randomNum -= weight;
    }

    // Store selected reward
    setWonReward(reward);

    // Calculate final rotation
    const numSegments = WHEEL_REWARDS.length;
    const segmentAngle = 360 / numSegments;
    const rewardIndex = WHEEL_REWARDS.findIndex(r => r.id === reward.id);
    const extraSpins = 360 * 5;

    const currentRot = spinRotationMotion.get();
    const currentMod = currentRot % 360;
    const targetAbsolute = 360 - (rewardIndex * segmentAngle);
    let rotationDiff = targetAbsolute - currentMod;
    if (rotationDiff <= 0) rotationDiff += 360;

    const targetRotation = currentRot + extraSpins + rotationDiff;

    animate(spinRotationMotion, targetRotation, {
      duration: 6.8,
      ease: [0.2, 0.8, 0.2, 1], // Custom cubic-bezier to precisely match audio mechanical friction
    });

    setWonReward(reward);

    // Wait for animation to finish
    setTimeout(async () => {
      triggerHaptic(50);
      playChestOpenSfx();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });

      setShowReward(true);
      setIsSpinning(false);

      // Update Database only if using a free spin
      if (!usingTicket) {
        try {
          await supabase
            .from('profiles')
            .update({ last_spin_date: new Date().toISOString() })
            .eq('id', user.id);
          syncProfile(user.id, null, true);
        } catch (err) {
          console.error("Failed to update spin date:", err);
        }
      }

    }, 6800);
  };

  const handleClaim = () => {
    if (!wonReward) return;

    // Hide the modal visually
    setIsClaiming(true);

    // Trigger flying animation
    setShowCoinAnim(true);
    triggerHaptic(50);

    // Signal TopAppBar to defer visual wallet updates until coins fly
    window.isAnimatingReward = true;

    // Update inventory instantly in the background
    if (wonReward.type === 'fils') updateInventory({ fils: wonReward.amount }, true, true);
    if (wonReward.type === 'derhem') updateInventory({ derhem: wonReward.amount }, true, true);
    if (wonReward.type === 'dinar') updateInventory({ dinar: wonReward.amount }, true, true);
    if (wonReward.type === 'hint') updateInventory({ hintCount: wonReward.amount }, true, true);
    if (wonReward.type === 'skip') updateInventory({ skipCount: wonReward.amount }, true, true);
    if (wonReward.type === 'magnet') updateInventory({ magnetCount: wonReward.amount }, true, true);
    if (wonReward.type === 'mystery_box') {
      const fetchAndAddBox = async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('mystery_boxes_count').eq('id', user.id).single();
          if (error) throw error;

          const newCount = (data?.mystery_boxes_count || 0) + wonReward.amount;
          const { error: updateError } = await supabase.from('profiles').update({ mystery_boxes_count: newCount }).eq('id', user.id);
          if (updateError) throw updateError;
        } catch (err) {
          console.error("Failed to safely save mystery box:", err);
        }
      };
      fetchAndAddBox();
    }

    // Close reward overlay internally
    setShowReward(false);

    // Completely unmount modal after animation finishes
    setTimeout(() => {
      setShowCoinAnim(false);
      setIsClaiming(false);
      window.isAnimatingReward = false; // Reset after animation
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="lucky-wheel-modal">
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isClaiming ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-mono-100/70 dark:bg-black/80 backdrop-blur-md"
            style={{ pointerEvents: isClaiming ? 'none' : 'auto' }}
          >
            {/* Close Button Top Right */}
            {!isSpinning && (
              <button onClick={() => { playBackSfx(); onClose(); }} className="fixed top-[calc(env(safe-area-inset-top)+24px)] right-6 w-11 h-11 rounded-md bg-mono-100 dark:bg-white/10 backdrop-blur-md border border-mono-200 dark:border-white/10 flex items-center justify-center text-mono-500 dark:text-white/80 hover:text-mono-800 dark:hover:text-white hover:bg-mono-200 dark:hover:bg-white/20 hover:scale-105 active:scale-95 transition-all z-50 shadow-xl">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}

            {/* Spin Ticket Pill Counter */}
            <div className="fixed top-[calc(env(safe-area-inset-top)+24px)] left-6 flex items-center gap-2 h-11 bg-mono-100 dark:bg-white/10 backdrop-blur-md rounded-md px-4 shadow-xl border border-mono-200 dark:border-white/10 z-50">
              <span className="text-[19px] font-black text-mono-900 dark:text-white font-sans mt-px">
                {toKuDigits(spinTicketCount || 0)}
              </span>
              <div className="w-[1.5px] h-4 bg-mono-300 dark:bg-white/20 rounded-full" />
              <SpinTicketIcon size={24} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            </div>

            <Motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm relative p-6 flex flex-col items-center"
            >


              {/* Ambient Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)' }} />

              <h2 className={`text-3xl font-black text-mono-900 dark:text-white ${!canSpin && !loadingCheck && timeLeftStr ? 'mb-1' : 'mb-6'} relative z-10 drop-shadow-md uppercase`}>چەرخێ بەختی</h2>
              {!canSpin && !loadingCheck && timeLeftStr && (
                <span className="font-black text-xl text-amber-500 font-sans tracking-normal mb-6 relative z-10 tabular-nums" dir="ltr">{timeLeftStr}</span>
              )}



              {/* Wheel Container with Dimming Effect (Optimized for GPU safety) */}
              <Motion.div
                initial={false}
                animate={showReward ? { scale: 0.9, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative w-64 h-64 mb-8 mt-6 flex items-center justify-center z-10"
              >

                {/* Static Outer Frame with Pointer */}
                <LuckyWheelFrame rotation={spinRotationMotion} className="absolute inset-0 w-full h-full z-20 pointer-events-none drop-shadow-lg" />

                {/* The Spinning Inner Wheel */}
                <Motion.div
                  style={{
                    rotate: spinRotationMotion,
                    willChange: 'transform',
                    WebkitTransform: 'translateZ(0)',
                    transform: 'translateZ(0)'
                  }}
                  className="absolute inset-0 w-full h-full z-10 flex items-center justify-center"
                >
                  <LuckyWheelInner className="w-full h-full" />
                </Motion.div>

                {/* Center Spin Button (Flat Blue) */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || (!canActuallySpin && !loadingCheck)}
                  className={`absolute z-30 w-[50px] h-[50px] rounded-full bg-linear-to-b from-yellow-200 via-amber-400 to-orange-500 text-amber-950 text-[13px] font-black shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3),0_2px_5px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all border border-yellow-200 ${(!isSpinning && canActuallySpin) ? 'hover:scale-105 hover:brightness-110 cursor-pointer' : 'opacity-80 grayscale-50 cursor-not-allowed'}`}
                >
                  {isSpinning ? '...' : (!canActuallySpin && !loadingCheck ? <span className="material-symbols-outlined text-[20px] opacity-70">lock</span> : 'بزڤڕینە')}
                </button>
              </Motion.div>

              {/* Reward Overlay */}
              <AnimatePresence mode="wait">
                {showReward && wonReward && (
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-120 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden"
                  >
                    {/* Safe Static Glow VFX (Replaces heavy rotating SVG) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-yellow-500/40 blur-[80px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

                    {/* Floating Reward Container */}
                    <Motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: "backOut" }}
                      className="relative flex flex-col items-center justify-center z-10"
                      style={{ WebkitTransform: 'translateZ(0)' }}
                    >
                      {/* Icon */}
                      <div className="relative flex justify-center items-center">
                        <wonReward.Icon
                          size={100}
                          className={`filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${wonReward.type === 'mystery_box' ? 'w-[120px] h-[120px]' : ''}`}
                        />
                      </div>

                      {/* Reward Amount Text */}
                      <p className="text-5xl font-black text-yellow-400 drop-shadow-[0_5px_15px_rgba(0,0,0,1)] mt-4 mb-8">
                        + {wonReward.type === 'mystery_box' ? `${toKuDigits(wonReward.amount)} ${wonReward.label}` : wonReward.label}
                      </p>
                    </Motion.div>

                    {/* Premium Claim Button */}
                    <Motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                      onClick={handleClaim}
                      className="w-40 py-2.5 rounded-md mx-auto bg-linear-to-b from-yellow-300 via-amber-500 to-orange-600 text-amber-950 font-black text-lg uppercase hover:scale-105 active:scale-95 transition-all shadow-md border border-yellow-300/50 flex items-center justify-center"
                    >
                      وەرگرتن
                    </Motion.button>
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>
          </Motion.div>
          <CoinAnimation trigger={showCoinAnim} amount={wonReward?.amount} type={wonReward?.type} />
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
