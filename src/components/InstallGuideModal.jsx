import React, { useEffect, useState } from 'react';
import { Share, MoreHorizontal, ChevronDown, PlusSquare, X, Bookmark, Copy } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

// SVG for the share icon (upward arrow in box) used as a standalone or in menus.
const ShareIconSvg = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3.33333V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3.33333L6.66667 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3.33333L13.3333 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.1667 9.16667H15C16.1046 9.16667 17 10.0621 17 11.1667V15.8333C17 16.9379 16.1046 17.8333 15 17.8333H5C3.89543 17.8333 3 16.9379 3 15.8333V11.1667C3 10.0621 3.89543 9.16667 5 9.16667H5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// SVG for the 'v' chevron down icon, highlighted in Step 3.
const ChevronDownSvg = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Step 1 Illustration: 3 Dots ---
const Step1Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-800 text-sm w-full max-w-sm mx-auto">
      <span className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
        peyvokgame.com
      </span>
      <button className="flex items-center justify-center p-2 rounded-full border-2 border-red-500 bg-red-100/50 text-red-600 focus:outline-none shadow-md">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed font-rabar font-bold">
      ل سەر ئایکۆنا سێ خالان (...) کلیک بکە.
    </p>
  </div>
);

// --- Step 2 Illustration: Share (upward arrow) ---
const Step2Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      {/* Mock Menu */}
      <div className="p-2 space-y-1">
        {/* Unhighlighted item */}
        <div className="flex items-center gap-3 p-3 text-gray-500 rounded-md">
          <Bookmark className="w-5 h-5" />
          <span className="text-sm font-medium">Add to Bookmarks</span>
        </div>
        {/* Highlighted item - Share icon [↑] */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md border-2 border-red-300">
          <ShareIconSvg />
          <span className="text-sm font-semibold">Share</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed font-rabar font-bold">
      هەڵبژاردەیا (Share) هەڵبژێرە.
    </p>
  </div>
);

// --- Step 3 Illustration: View More (down chevron) ---
const Step3Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      {/* Mock Menu, Step 2 Share and Step 3 View More shown together for context */}
      <div className="p-2 space-y-1">
        {/* Step 2 item: Share icon [↑] - already selected context */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md">
          <ShareIconSvg />
          <span className="text-sm font-semibold">Share</span>
        </div>
        {/* Step 3 item - Downward Chevron [v] */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md border-2 border-red-300 shadow-md">
          <ChevronDownSvg />
          <span className="text-sm font-semibold">View More</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed font-rabar font-bold">
      لێ بگەڕە و ل سەر (View More) کلیک بکە.
    </p>
  </div>
);

// --- Step 4 Illustration: Add to Home Screen (plus in square) ---
const Step4Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      {/* Mock Menu */}
      <div className="p-2 space-y-1">
        {/* Highlighted item - Plus icon [+] */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md border-2 border-red-300">
          <PlusSquare className="w-6 h-6" />
          <span className="text-sm font-semibold">Add to Home Screen</span>
        </div>
        {/* Dummy unhighlighted item */}
        <div className="flex items-center gap-3 p-3 text-gray-500 rounded-md">
          <Copy className="w-5 h-5" />
          <span className="text-sm font-medium">Copy Link</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed font-rabar font-bold">
      هەڵبژاردەیا (Add to Home Screen) هەڵبژێرە.
    </p>
  </div>
);

const InstallGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'ios';
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      return 'ios';
    } else if (/android/i.test(ua)) {
      return 'android';
    }
    return 'pc';
  });

  useEffect(() => {
    if (isOpen) {
      triggerHaptic(50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 pt-12">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-mono-200 dark:bg-white/10 text-mono-500 hover:text-mono-800 dark:text-white/60 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <h2 className="text-lg font-bold font-rabar text-mono-900 dark:text-white flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-blue-500">download</span>
              دابەزاندنا یاریێ
            </h2>
            <p className="text-[13px] text-mono-500 dark:text-mono-400 mt-1 font-medium">بۆ باشترین ئەزموون ل سەر ئامێرێ خوە دابەزینە</p>
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
                    تێبینی: دا کو یاری وەکو ئەپلکەیشنەکێ ل سەر شاشا مۆبایلا تە دیار بیت، لینکێ یاریێ د براوەسەرێ سەفاری دا ڤەکە. و خال ب خال ل خوارێ جیبەجێ بکە.
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
                    تێبینی: بۆ زێدەکرنا یاریێ، پێدڤییە تو ب ڕێکا وێبگەڕێ (Google Chrome) یاریێ ڤەکەی. لینکێ یاریێ (peyvokgame.com) کۆپی بکە و ل کرۆم ڤەکە.
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-[12px]">١</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">ل سەرەوەیێ شاشەیێ، ل سەر سێ خالان (⋮) کلیک بکە.</p>
                    </div>
                    <img 
                      src="/guides/android-step1.jpg" 
                      alt="Android Step 1" 
                      className="w-full h-auto object-contain bg-mono-200 dark:bg-mono-800 rounded-xl min-h-[150px] shadow-sm border border-mono-200 dark:border-white/10" 
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-[12px]">٢</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">دوگمەیا <span className="text-green-500 dark:text-green-400">Install App</span> یان Add to Home screen هەڵبژێرە.</p>
                    </div>
                    <img 
                      src="/guides/android-step2.jpg" 
                      alt="Android Step 2" 
                      className="w-full h-auto object-contain bg-mono-200 dark:bg-mono-800 rounded-xl min-h-[150px] shadow-sm border border-mono-200 dark:border-white/10" 
                    />
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
                    تێبینی: بۆ باشترین ئەزموون، یاریێ ب ڕێکا (Google Chrome) یان (Edge) ڤەکە ل سەر لینکێ (peyvokgame.com).
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[12px]">١</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">ل سەر ئایکۆنا دابەزاندنێ ل تەنیشت ناونیشانێ سایتێ کلیک بکە.</p>
                    </div>
                    <img 
                      src="/guides/pc-step1.jpg" 
                      alt="PC Step 1" 
                      className="w-full h-auto object-contain bg-mono-200 dark:bg-mono-800 rounded-xl min-h-[150px] shadow-sm border border-mono-200 dark:border-white/10" 
                    />
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Footer Footer */}
          <div className="p-4 border-t border-mono-100 dark:border-mono-800 bg-white dark:bg-mono-900 shrink-0">
            <button 
              onClick={onClose}
              className="w-full h-12 bg-mono-100 hover:bg-mono-200 dark:bg-mono-800 dark:hover:bg-mono-700 text-mono-800 dark:text-white rounded-xl font-bold font-rabar text-[15px] transition-colors"
            >
              تێگەهشتیم، داخستن
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstallGuideModal;
