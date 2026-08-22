import React, { useEffect, useState } from 'react';
import { Share, MoreHorizontal, ChevronDown, PlusSquare, X, Bookmark, Copy, MoreVertical, History, MonitorDown, Star, Globe, Home, Lock, Settings2, RotateCw, Monitor, ChevronLeft, RotateCcw } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/AuthContext';

// --- Custom iOS Icons ---
const IosShareIcon = ({ className, strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const IosSafariReadingIcon = ({ className, strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="5" width="16" height="10" rx="2" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <line x1="4" y1="22" x2="12" y2="22" />
  </svg>
);

// --- Step 1 Illustration: 3 Dots ---
const Step1Illustration = () => (
  <div className="flex flex-col gap-3 mb-6">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">١</div>
      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">ل سەر سێ خالان (...) ل خوارێ شاشەیێ ل لایێ ڕاستێ کلیک بکە.</p>
    </div>
    <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-8 flex flex-col items-center justify-center gap-5 text-mono-900 dark:text-white min-h-40" dir="ltr">
      <div className="flex items-center gap-1.5 w-full justify-center max-w-85">
        {/* Left Button */}
        <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1a1a1a] border-[1.5px] border-mono-200 dark:border-white/20 flex items-center justify-center shrink-0">
          <ChevronLeft className="w-5.5 h-5.5 text-mono-800 dark:text-white" strokeWidth={1.5} />
        </div>

        {/* Center Pill */}
        <div className="flex-1 h-11 px-4 rounded-[22px] bg-white dark:bg-[#1a1a1a] border-[1.5px] border-mono-200 dark:border-white/20 flex items-center gap-3 text-mono-800 dark:text-white">
          <RotateCcw className="w-4.5 h-4.5 shrink-0" strokeWidth={1.75} />
          <span className="text-[15px] font-sans font-medium flex-1 truncate text-center">peyvokgame.com</span>
          <IosSafariReadingIcon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.75} />
        </div>

        {/* Right Button */}
        <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1a1a1a] border-[1.5px] border-mono-200 dark:border-white/20 flex items-center justify-center shrink-0">
          <MoreHorizontal className="w-6 h-6 text-mono-800 dark:text-white" strokeWidth={1.5} />
        </div>
      </div>
      <div className="px-5 py-2.5 rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 border border-mono-200 dark:border-white/20 shadow-sm text-[13px] font-medium text-mono-700 dark:text-mono-200 mt-2" dir="rtl">
        ل سەر وان هەر سێ خالێن ل لایێ ڕاستێ(...) کلیک بکە
      </div>
    </div>
  </div>
);

// --- Step 2 Illustration: Share (upward arrow) ---
const Step2Illustration = () => (
  <div className="flex flex-col gap-3 mb-6">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">٢</div>
      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">هەڵبژاردەیا (Share) هەڵبژێرە.</p>
    </div>
    <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-8 flex flex-col items-center justify-center gap-6 text-mono-900 dark:text-white min-h-40" dir="ltr">
      <div className="flex items-center gap-4">
        <IosShareIcon className="w-10 h-10" strokeWidth={2} />
        <span className="text-[34px] font-sans font-semibold tracking-wide">Share</span>
      </div>
      <div className="px-6 py-2.5 rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 border border-mono-300 dark:border-white/20 shadow-sm text-[13px] font-medium text-mono-700 dark:text-mono-200 w-full max-w-70 text-center mt-2" dir="rtl">
        هەڵبژارتنا (شەیر) هەڵبژێرە
      </div>
    </div>
  </div>
);

// --- Step 3 Illustration: View More (down chevron) ---
const Step3Illustration = () => (
  <div className="flex flex-col gap-3 mb-6">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">٣</div>
      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">لێ بگەڕە و ل سەر (View More) کلیک بکە.</p>
    </div>
    <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-8 flex flex-col items-center justify-center gap-4 text-mono-900 dark:text-white min-h-40" dir="ltr">
      <div className="flex flex-col items-center gap-3">
        <div className="w-13 h-13 rounded-full border-[1.5px] border-mono-300 dark:border-white/30 flex items-center justify-center">
          <ChevronDown className="w-7 h-7 opacity-90" strokeWidth={1.5} />
        </div>
        <span className="text-[17px] font-sans font-light tracking-wide text-mono-800 dark:text-mono-200">View More</span>
      </div>
      <div className="px-6 py-2.5 rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 border border-mono-300 dark:border-white/20 shadow-sm text-[13px] font-medium text-mono-700 dark:text-mono-200 w-full max-w-70 text-center mt-2" dir="rtl">
        هەڵبژارتنا (ڤیۆ مۆر) هەڵبژێرە
      </div>
    </div>
  </div>
);

// --- Step 4 Illustration: Add to Home Screen (plus in square) ---
const Step4Illustration = () => (
  <div className="flex flex-col gap-3 mb-6">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">٤</div>
      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">هەڵبژاردەیا (Add to Home Screen) هەڵبژێرە.</p>
    </div>
    <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-6 flex flex-col items-center justify-center gap-5 text-mono-900 dark:text-white min-h-40" dir="ltr">
      <div className="flex items-center gap-3">
        <PlusSquare className="w-8 h-8" strokeWidth={1.5} />
        <span className="text-[22px] font-sans font-medium">Add to Home Screen</span>
      </div>
      <div className="px-5 py-2 rounded-full bg-white dark:bg-[#1a1a1a] border border-mono-200 dark:border-white/10 shadow-sm text-[12px] font-medium text-mono-700 dark:text-mono-300 mt-1" dir="rtl">
        هەڵبژاردەیا (Add to Home Screen) هەڵبژێرە
      </div>
    </div>
  </div>
);

// --- Android Step 1 Illustration: Chrome Address Bar ---
const AndroidStep1Illustration = () => (
  <div className="w-full bg-mono-100 dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-4">
    <div className="bg-[#4882c8] dark:bg-[#1a1a1a] px-3 py-2.5 rounded-sm shadow-md w-full flex items-center justify-between gap-3 text-white border border-[#3b72b5] dark:border-white/10" dir="ltr">
      <Home className="w-5.5 h-5.5 shrink-0 opacity-90 stroke-[2.5]" />
      <div className="flex-1 flex items-center gap-2 bg-white/15 dark:bg-white/10 border border-white/5 rounded-full px-3 py-1.25 min-w-0 shadow-sm">
        <Lock className="w-3.5 h-3.5 shrink-0 opacity-90 stroke-[2.5]" />
        <span className="font-sans text-[14px] truncate pb-px">
          peyvokgame.com
        </span>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-5 h-5 border-2 border-white/90 rounded-[5px] flex items-center justify-center ml-1">
          <span className="text-[12px] font-sans font-bold pb-px">1</span>
        </div>
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/25 dark:bg-white/15 border border-white/40 dark:border-white/20 shadow-sm">
          <MoreVertical className="w-5 h-5 opacity-100 stroke-[2.5]" />
        </div>
      </div>
    </div>
  </div>
);

// --- Android Step 2 Illustration: Chrome Menu (Install App) ---
const AndroidStep2Illustration = () => (
  <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-6 flex justify-center items-center" dir="ltr">
    <div className="w-55 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      <div className="p-2 flex flex-col gap-0.5">
        <div className="flex items-center gap-3.5 px-3.5 py-2.5 text-blue-600 dark:text-blue-400 bg-[#f0f4ff] dark:bg-blue-500/10 rounded-lg border border-[#d6e4ff] dark:border-blue-500/30 shadow-sm relative">
          <MonitorDown className="w-4.5 h-4.5" strokeWidth={2} />
          <span className="text-[14px] font-sans font-medium">Install app</span>
        </div>
      </div>
    </div>
  </div>
);

// --- Android Step 3 Illustration: Chrome Menu (Add to Home Screen) ---
const AndroidStep3Illustration = () => (
  <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-6 flex justify-center items-center" dir="ltr">
    <div className="w-55 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      <div className="p-2 flex flex-col gap-0.5">
        <div className="flex items-center gap-3.5 px-3.5 py-2.5 text-blue-600 dark:text-blue-400 bg-[#f0f4ff] dark:bg-blue-500/10 rounded-lg border border-[#d6e4ff] dark:border-blue-500/30 shadow-sm relative">
          <PlusSquare className="w-4.5 h-4.5" strokeWidth={2} />
          <span className="text-[14px] font-sans font-medium">Add to Home screen</span>
        </div>
      </div>
    </div>
  </div>
);

// --- Android Step 4 Illustration: Chrome Install Dialog ---
const AndroidStep4Illustration = () => (
  <div className="w-full bg-mono-100 dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-5 flex items-center justify-center min-h-37.5" dir="ltr">
    <div className="w-full max-w-70 bg-white dark:bg-[#1a1a1a] rounded-default shadow-2xl p-5 flex flex-col gap-4 border border-mono-200 dark:border-white/10 relative overflow-hidden">
      <div className="text-[16px] font-sans font-medium text-gray-900 dark:text-gray-100">Install app</div>
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-[10px] bg-mono-900 flex items-center justify-center overflow-hidden border border-white/10 shrink-0 shadow-sm">
          <img src="/Peyvok-logo-02.png" alt="پەیڤۆک" className="w-[70%] h-[70%] object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[14px] font-sans font-medium text-gray-900 dark:text-gray-100 truncate max-w-40 leading-tight mb-0.5">Peyvok Game</span>
          <span className="text-[11px] font-sans text-gray-500 dark:text-gray-400 truncate max-w-40">peyvokgame.com</span>
        </div>
      </div>
      <div className="flex justify-end gap-5 mt-1 pt-1">
        <span className="text-[13px] font-sans font-semibold text-blue-600 dark:text-blue-400 cursor-pointer opacity-80 pt-1">Cancel</span>
        <span className="text-[13px] font-sans font-bold text-blue-700 dark:text-blue-400 cursor-pointer bg-blue-100/50 dark:bg-blue-500/10 px-4 py-1.5 -mr-2 rounded-full border border-blue-200 dark:border-blue-500/30">Install</span>
      </div>
    </div>
  </div>
);

// --- PC Step 1 Illustration: Desktop Address Bar ---
const PcStep1Illustration = () => (
  <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-5 flex justify-center items-center overflow-hidden" dir="ltr">
    <div className="w-full max-w-lg bg-[#f0ecf1] dark:bg-[#2a2a2a] h-11 rounded-full flex items-center justify-between px-3 shadow-inner border border-white/40 dark:border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-white dark:bg-mono-700 flex items-center justify-center shrink-0 shadow-sm">
          <Settings2 className="w-4 h-4 text-gray-700 dark:text-gray-300" strokeWidth={2.5} />
        </div>
        <span className="text-[14px] font-sans text-[#1a5bbb] dark:text-blue-400 font-medium truncate">peyvokgame.com</span>
      </div>
      <div className="flex items-center gap-2 pr-2 shrink-0">
        <div className="p-1.5 bg-black/5 dark:bg-white/10 rounded-full cursor-pointer transition-colors border border-black/5 dark:border-white/5 shadow-sm relative">
          <MonitorDown className="w-4.5 h-4.5 text-gray-800 dark:text-gray-200" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  </div>
);

// --- PC Step 2 Illustration: Install Dialog ---
const PcStep2Illustration = () => (
  <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-5 flex justify-center items-center min-h-40" dir="ltr">
    <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl p-6 border border-gray-100 dark:border-white/10 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <span className="text-[16px] font-sans font-medium text-gray-900 dark:text-gray-100">Install app</span>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-mono-900 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 shadow-sm">
            <img src="/Peyvok-logo-02.png" alt="پەیڤۆک" className="w-[70%] h-[70%] object-contain" />
          </div>
          <div className="flex flex-col justify-center gap-0.5">
            <span className="text-[14px] font-sans text-gray-900 dark:text-gray-100 leading-none">Peyvok</span>
            <span className="text-[12.5px] font-sans text-gray-500 dark:text-gray-400 leading-none mt-1">www.peyvokgame.com</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-2 pr-1">
        <button className="px-5 py-1.5 rounded-full text-[14px] font-sans font-medium bg-[#fed6dc] dark:bg-red-500/20 text-[#8f192b] dark:text-red-300">
          Install
        </button>
        <button className="px-5 py-1.5 rounded-full text-[14px] font-sans font-medium bg-[#7a3b45] text-white outline-2 outline-white dark:outline-[#1e1e1e] ring-2 ring-[#7a3b45]">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// --- Mac Step 1 Illustration: Safari Address Bar ---
const MacStep1Illustration = () => (
  <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-5 flex justify-center items-center overflow-hidden" dir="ltr">
    <div className="w-full max-w-lg bg-white dark:bg-[#2a2a2a] h-10 rounded-md flex items-center justify-between px-2 shadow-sm border border-gray-300 dark:border-white/10">
      <div className="flex items-center gap-2 text-gray-400">
        <ChevronLeft className="w-4.5 h-4.5" strokeWidth={2} />
        <ChevronLeft className="w-4.5 h-4.5 rotate-180" strokeWidth={2} />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <span className="text-[13px] font-sans text-gray-800 dark:text-gray-200 font-medium truncate">peyvokgame.com</span>
      </div>
      <div className="flex items-center gap-2 pr-1">
        <div className="p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative">
          <IosShareIcon className="w-4.5 h-4.5 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
        </div>
        <PlusSquare className="w-4.5 h-4.5 text-gray-400" strokeWidth={1.5} />
      </div>
    </div>
  </div>
);

// --- Mac Step 2 Illustration: Add to Dock Menu ---
const MacStep2Illustration = () => (
  <div className="w-full bg-[#f6f7f9] dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-white/10 p-5 flex justify-center items-center min-h-40" dir="ltr">
    <div className="w-full max-w-55 bg-white/90 dark:bg-[#2a2a2a]/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-white/10 flex flex-col p-1.5">
      <div className="px-3 py-1.5 rounded-md bg-blue-500 text-white flex items-center justify-between text-[13px] cursor-pointer">
        <span className="font-sans font-medium">Add to Dock...</span>
      </div>
      <div className="h-px w-full bg-gray-200 dark:bg-white/10 my-1"></div>
      <div className="px-3 py-1.5 rounded-md flex items-center justify-between text-[13px] text-gray-800 dark:text-gray-200">
        <span className="font-sans font-medium">Share...</span>
        <IosShareIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </div>
    </div>
  </div>
);

const InstallGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('ios');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { user, refreshProfile } = useUser();

  useEffect(() => {
    const checkStandalone = () => {
      const isPwa = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(!!isPwa);
    };
    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  const handleCompleteGuide = async () => {
    if (!user) {
      onClose();
      return;
    }
    try {
      setIsLoading(true);
      triggerHaptic(20);
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_install_guide: true })
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state immediately via AuthContext
      if (refreshProfile) {
        refreshProfile(user.id);
      }

      onClose();
    } catch (error) {
      console.error("Error updating install guide completion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab('ios');
    }
  }

  useEffect(() => {
    if (isOpen) {
      triggerHaptic(50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-999 flex items-center justify-center p-4 pt-12">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <Motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="w-full max-w-md flex flex-col bg-[#636a7c] rounded-[18px] shadow-[inset_0_-8px_0_rgba(0,0,0,0.4),0_15px_35px_rgba(0,0,0,0.6)] relative font-rabar border-4 border-[#121316] overflow-hidden z-50 max-h-[85vh]"
          dir="rtl"
        >
          {/* Inner 3D Highlight Layer (Tapered Top) */}
          <div 
            className="absolute inset-0 rounded-[14px] border-2 border-t-white/80 border-x-transparent border-b-transparent pointer-events-none z-0"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 1%, black 15%, black 85%, transparent 99%)' }}
          ></div>
          
          {/* Inner 3D Shadow Layer (Bottom & Sides) */}
          <div className="absolute inset-0 rounded-[14px] border-2 border-b-black/40 border-x-black/20 border-t-transparent pointer-events-none z-0"></div>

          {/* Glassy Header Highlight (stops at middle of text) */}
          <div className="absolute top-1.5 inset-x-1.5 h-10 bg-[#727888] pointer-events-none z-0 rounded-t-[8px]"></div>

          {/* Header */}
          <div className="pt-5 pb-3 text-center relative shrink-0 z-10 w-full flex items-center justify-center">
            <h2 
               className="text-[20px] font-black text-white leading-none flex items-center justify-center gap-2 relative z-10" 
               style={{ 
                  textShadow: `-2px -2px 0 #1a1c23, -1px -2px 0 #1a1c23, 0 -2px 0 #1a1c23, 1px -2px 0 #1a1c23, 2px -2px 0 #1a1c23, -2px -1px 0 #1a1c23, 2px -1px 0 #1a1c23, -2px 0 0 #1a1c23, 2px 0 0 #1a1c23, -2px 1px 0 #1a1c23, 2px 1px 0 #1a1c23, -2px 2px 0 #1a1c23, -1px 2px 0 #1a1c23, 0 2px 0 #1a1c23, 1px 2px 0 #1a1c23, 2px 2px 0 #1a1c23, -2px 3px 0 #1a1c23, -1px 3px 0 #1a1c23, 0 3px 0 #1a1c23, 1px 3px 0 #1a1c23, 2px 3px 0 #1a1c23, -2px 4px 0 #1a1c23, -1px 4px 0 #1a1c23, 0 4px 0 #1a1c23, 1px 4px 0 #1a1c23, 2px 4px 0 #1a1c23, -2px 5px 0 #1a1c23, -1px 5px 0 #1a1c23, 0 5px 0 #1a1c23, 1px 5px 0 #1a1c23, 2px 5px 0 #1a1c23, 0 5px 10px rgba(0,0,0,0.4)`
               }}
            >
              داگرتنا یاریێ
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex w-full px-3 z-10 relative mt-2 mb-2 shrink-0 gap-2">
            <button
              onClick={() => { triggerHaptic(10); setActiveTab('ios'); }}
              className={`h-8 flex-1 font-black uppercase tracking-wider font-rabar text-[13px] transition-transform duration-100 flex items-center justify-center gap-1.5 outline-none btn-clash-sm ${
                activeTab === 'ios' 
                  ? 'btn-clash-sm-blue text-white z-20' 
                  : 'btn-clash-sm-slate text-white/80 opacity-80 hover:opacity-100 z-10 scale-95'
              }`}
            >
              ئایفۆن
            </button>
            <button
              onClick={() => { triggerHaptic(10); setActiveTab('android'); }}
              className={`h-8 flex-1 font-black uppercase tracking-wider font-rabar text-[13px] transition-transform duration-100 flex items-center justify-center gap-1.5 outline-none btn-clash-sm ${
                activeTab === 'android' 
                  ? 'btn-clash-sm-blue text-white z-20' 
                  : 'btn-clash-sm-slate text-white/80 opacity-80 hover:opacity-100 z-10 scale-95'
              }`}
            >
              ئەندرۆید
            </button>
            <button
              onClick={() => { triggerHaptic(10); setActiveTab('windows'); }}
              className={`h-8 flex-1 font-black uppercase tracking-wider font-rabar text-[13px] transition-transform duration-100 flex items-center justify-center gap-1.5 outline-none btn-clash-sm ${
                activeTab === 'windows' 
                  ? 'btn-clash-sm-blue text-white z-20' 
                  : 'btn-clash-sm-slate text-white/80 opacity-80 hover:opacity-100 z-10 scale-95'
              }`}
            >
              ویندۆز
            </button>
            <button
              onClick={() => { triggerHaptic(10); setActiveTab('mac'); }}
              className={`h-8 flex-1 font-black uppercase tracking-wider font-rabar text-[13px] transition-transform duration-100 flex items-center justify-center gap-1.5 outline-none btn-clash-sm ${
                activeTab === 'mac' 
                  ? 'btn-clash-sm-blue text-white z-20' 
                  : 'btn-clash-sm-slate text-white/80 opacity-80 hover:opacity-100 z-10 scale-95'
              }`}
            >
              ماک
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 self-stretch flex flex-col relative mx-3 sm:mx-4 mb-4 rounded-[8px] bg-[#e6ebf0] shadow-[0_4px_6px_rgba(0,0,0,0.2)] overflow-hidden min-h-0 z-10">
             {/* Inner White Box Highlight */}
             <div className="absolute inset-0 rounded-[8px] border-[2.5px] border-t-white/90 border-l-white/80 border-r-black/5 border-b-transparent pointer-events-none z-10"></div>
             
             {/* Scrollable Body */}
             <div className="p-4 sm:p-5 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 relative z-20">
                <AnimatePresence mode="wait">
                  {activeTab === 'ios' && (
                    <Motion.div
                      key="ios"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="bg-[#d0dbf0] border-2 border-[#a5bce6] text-[#2c4b8b] p-3 rounded-lg text-sm mb-4 text-right leading-relaxed font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)]">
                        تێبینی: بۆ زێدەکرنا یاریێ وەکو ئەپ ل سەر شاشەیا مۆبایلێ، پێدڤیە ئەپێ سەفاری (Safari) ڤەکەی. پاشان ل ناڤ گۆگڵی بنڤیسە (پەیڤۆک) و لێبگەڕە. یان ژی ب ڕێکا لینکێ یاریێ (peyvokgame.com) لێبگەڕە.
                      </div>

                      <Step1Illustration />
                      <Step2Illustration />
                      <Step3Illustration />
                      <Step4Illustration />

                    </Motion.div>
                  )}

                  {activeTab === 'android' && (
                    <Motion.div
                      key="android"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="bg-[#d0dbf0] border-2 border-[#a5bce6] text-[#2c4b8b] p-3 rounded-lg text-sm mb-4 text-right leading-relaxed font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)]">
                        تێبینی: بۆ زێدەکرنا یاریێ وەکو ئەپ ل سەر شاشەیا مۆبایلێ، پێدڤیە ئەپێ گۆگڵ کرۆمی ڤەکەی. پاشان ل ناڤ گۆگڵی بنڤیسە (پەیڤۆک) و لێبگەڕە. یان ژی ب ڕێکا لینکێ یاریێ (peyvokgame.com) لێبگەڕە.
                      </div>
                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">١</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">ل سەر سێ خالان (⋮) ل سەرێ شاشەیێ ل لایێ ڕاستێ کلیک بکە.</p>
                        </div>
                        <AndroidStep1Illustration />
                      </div>

                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">٢</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">هەڵبژاردەیا (Install app) هەڵبژێرە.</p>
                        </div>
                        <AndroidStep2Illustration />
                      </div>

                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">٣</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">ئەگەر هەڵبژاردەیا (Install app) نەبیت، هەڵبژاردەیا (Add to Home screen) هەڵبژێرە.</p>
                        </div>
                        <AndroidStep3Illustration />
                      </div>

                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">٤</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">د پەنجەرەیا نوی دا ل سەر (Install) یان (Add) کلیک بکە.</p>
                        </div>
                        <AndroidStep4Illustration />
                      </div>
                    </Motion.div>
                  )}

                  {activeTab === 'windows' && (
                    <Motion.div
                      key="windows"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="bg-[#d0dbf0] border-2 border-[#a5bce6] text-[#2c4b8b] p-3 rounded-lg text-sm mb-4 text-right leading-relaxed font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)]">
                        تێبینی: بۆ زێدەکرنا یاریێ وەکو ئەپ ل سەر شاشەیا ویندۆزێ (Windows)، پێدڤیە گۆگڵ کرۆم یان ئیدج (Edge) ڤەکەی. پاشان ل ناڤ گۆگڵی بنڤیسە (پەیڤۆک) و لێبگەڕە. یان ژی ب ڕێکا لینکێ یاریێ (peyvokgame.com) لێبگەڕە.
                      </div>
                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">١</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">ل سەر ئایکۆنێ داگرتنێ ب ڕەخ ناڤونیشانێ سایتی ڤە کلیک بکە.</p>
                        </div>
                        <PcStep1Illustration />
                      </div>
                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">٢</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">د پەنجەرەیا نوی دا ل سەر (Install) کلیک بکە.</p>
                        </div>
                        <PcStep2Illustration />
                      </div>
                    </Motion.div>
                  )}

                  {activeTab === 'mac' && (
                    <Motion.div
                      key="mac"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="bg-[#d0dbf0] border-2 border-[#a5bce6] text-[#2c4b8b] p-3 rounded-lg text-sm mb-4 text-right leading-relaxed font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)]">
                        تێبینی: بۆ زێدەکرنا یاریێ وەکو ئەپ ل سەر شاشەیا ماک (Mac)، پێدڤیە سەفاری (Safari) ڤەکەی. پاشان ل ناڤ گۆگڵی بنڤیسە (پەیڤۆک) و لێبگەڕە. یان ژی ب ڕێکا لینکێ یاریێ (peyvokgame.com) لێبگەڕە.
                      </div>
                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">١</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">ل سەر ئایکۆنێ شەیر (Share) ب ڕەخ ناڤونیشانێ سایتی ڤە کلیک بکە، یان ژی ژ مێنیۆیا فایل (File) سەرێ شاشەیێ.</p>
                        </div>
                        <MacStep1Illustration />
                      </div>
                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2c4b8b] flex items-center justify-center font-bold text-[12px] shrink-0">٢</div>
                          <p className="text-[14px] font-bold text-[#3a404a]">پاشان هەڵبژاردەیا (Add to Dock) هەڵبژێرە.</p>
                        </div>
                        <MacStep2Illustration />
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
             </div>
             
             {/* Footer Footer */}
             <div className="p-4 shrink-0 flex flex-col gap-3 relative z-20">
                <button
                onClick={handleCompleteGuide}
                disabled={isLoading}
                className={`relative w-full h-12 rounded-[12px] flex items-center justify-center font-black transition-transform active:scale-95 border-[1.5px] border-[#121316] overflow-hidden bg-[#24a85c]`}
                style={{
                    boxShadow: 'inset 0 2.5px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.15)'
                }}
                >
                <span 
                    className="text-white text-[14.5px] leading-none relative z-10 -translate-y-px tracking-wide font-rabar text-center px-2" 
                    style={{ textShadow: '-1px -1px 0 #121316, 1px -1px 0 #121316, -1px 1px 0 #121316, 1px 1px 0 #121316, 0 1.5px 0 #121316' }}
                >
                    {isLoading ? 'چاڤەڕێ بە...' : (isStandalone ? 'دەستپێکرنا یاریێ' : 'تێگەهشتم، بەردەوام بە')}
                </span>
                </button>
             </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstallGuideModal;
