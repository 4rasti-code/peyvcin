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

const InstallGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('ios');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshProfile } = useUser();

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-mono-900 rounded-[20px] shadow-2xl w-full max-w-md relative z-10 flex flex-col max-h-[85vh] overflow-hidden border border-mono-200 dark:border-white/10"
        >
          {/* Header */}
          <div className="p-4 border-b border-mono-100 dark:border-mono-800 text-center relative shrink-0 bg-mono-50 dark:bg-mono-900">

            <h2 className="text-lg font-bold font-rabar text-mono-900 dark:text-white flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-blue-500">download</span>
              داگرتنا یاریێ
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex w-full border-b border-mono-200 dark:border-mono-800 shrink-0 bg-white dark:bg-mono-900">
            <button
              onClick={() => { triggerHaptic(10); setActiveTab('ios'); }}
              className={`flex-1 py-3 text-[14px] font-bold font-rabar transition-colors relative ${activeTab === 'ios' ? 'text-blue-500' : 'text-mono-500 dark:text-mono-400 hover:text-mono-700 dark:hover:text-mono-200'}`}
            >
              ئایفۆن
              {activeTab === 'ios' && (
                <Motion.div layoutId="installTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => { triggerHaptic(10); setActiveTab('android'); }}
              className={`flex-1 py-3 text-[14px] font-bold font-rabar transition-colors relative ${activeTab === 'android' ? 'text-blue-500' : 'text-mono-500 dark:text-mono-400 hover:text-mono-700 dark:hover:text-mono-200'}`}
            >
              ئەندرۆید
              {activeTab === 'android' && (
                <Motion.div layoutId="installTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => { triggerHaptic(10); setActiveTab('pc'); }}
              className={`flex-1 py-3 text-[14px] font-bold font-rabar transition-colors relative ${activeTab === 'pc' ? 'text-blue-500' : 'text-mono-500 dark:text-mono-400 hover:text-mono-700 dark:hover:text-mono-200'}`}
            >
              کۆمپیوتەر
              {activeTab === 'pc' && (
                <Motion.div layoutId="installTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
              )}
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 overflow-y-auto overflow-x-hidden custom-scrollbar bg-mono-50/50 dark:bg-mono-900 flex-1">
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
                  <div className="bg-blue-50 border border-blue-300 text-blue-900 p-3 rounded-lg text-sm mb-4 text-right leading-relaxed font-medium shadow-sm">
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
                  <div className="bg-blue-50 border border-blue-300 text-blue-900 p-3 rounded-lg text-sm mb-4 text-right leading-relaxed font-medium shadow-sm">
                    تێبینی: بۆ زێدەکرنا یاریێ وەکو ئەپ ل سەر شاشەیا مۆبایلێ، پێدڤیە ئەپێ گۆگڵ کرۆمی ڤەکەی. پاشان ل ناڤ گۆگڵی بنڤیسە (پەیڤۆک) و لێبگەڕە. یان ژی ب ڕێکا لینکێ یاریێ (peyvokgame.com) لێبگەڕە.
                  </div>
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">١</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">ل سەر سێ خالان (⋮) ل سەرێ شاشەیێ ل لایێ ڕاستێ کلیک بکە.</p>
                    </div>
                    <AndroidStep1Illustration />
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">٢</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">هەڵبژاردەیا (Install app) هەڵبژێرە.</p>
                    </div>
                    <AndroidStep2Illustration />
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">٣</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">ئەگەر هەڵبژاردەیا (Install app) نەبیت، هەڵبژاردەیا (Add to Home screen) هەڵبژێرە.</p>
                    </div>
                    <AndroidStep3Illustration />
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">٤</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">د پەنجەرەیا نوی دا ل سەر (Install) یان (Add) کلیک بکە.</p>
                    </div>
                    <AndroidStep4Illustration />
                  </div>
                </Motion.div>
              )}

              {activeTab === 'pc' && (
                <Motion.div
                  key="pc"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 border border-blue-300 text-blue-900 p-3 rounded-lg text-sm mb-4 text-right leading-relaxed font-medium shadow-sm">
                    تێبینی: بۆ زێدەکرنا یاریێ وەکو ئەپ ل سەر شاشەیا کۆمپیوتەری، پێدڤیە گۆگڵ کرۆم ڤەکەی. پاشان ل ناڤ گۆگڵی بنڤیسە (پەیڤۆک) و لێبگەڕە. یان ژی ب ڕێکا لینکێ یاریێ (peyvokgame.com) لێبگەڕە.
                  </div>
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">١</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">ل سەر ئایکۆنێ داگرتنێ ب ڕەخ ناڤونیشانێ سایتی ڤە کلیک بکە.</p>
                    </div>
                    <PcStep1Illustration />
                  </div>
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px] shrink-0">٢</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">د پەنجەرەیا نوی دا ل سەر (Install) کلیک بکە.</p>
                    </div>
                    <PcStep2Illustration />
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Footer */}
          <div className="p-4 border-t border-mono-100 dark:border-mono-800 bg-white dark:bg-mono-900 shrink-0 flex flex-col gap-3">
            <button
              onClick={handleCompleteGuide}
              disabled={isLoading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold font-rabar text-[15px] transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'دبارکرن...' : 'تێگەهشتم'}
            </button>

          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstallGuideModal;
