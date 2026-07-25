import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  <div className="bg-blue-900/30 text-blue-200 border border-blue-700 p-3 rounded-lg text-[13px] mb-4 text-right leading-relaxed font-rabar">
                    تێبینی: بۆ زێدەکرنا یاریێ، پێدڤییە تو ب ڕێکا وێبگەڕێ (Safari) یاریێ ڤەکەی. ئەگەر تو نۆکە د ناڤ تیکتۆک یان ئینستاگرامێ دا یی، لینکێ یاریێ (peyvok.com) کۆپی بکە و ل سەفاری ڤەکە.
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px]">١</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">د ناڤ سەفاری دا، ل خوارێ شاشەیێ ل سەر ئایکۆنا (Share) کلیک بکە.</p>
                    </div>
                    <img 
                      src="/guides/ios-step1.jpg" 
                      alt="iOS Step 1" 
                      className="w-full h-auto object-contain bg-mono-200 dark:bg-mono-800 rounded-xl min-h-[150px] shadow-sm border border-mono-200 dark:border-white/10" 
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[12px]">٢</div>
                      <p className="text-[14px] font-bold text-mono-800 dark:text-mono-200">لێ بگەڕە و هەڵبژاردەیا <span className="text-blue-500 dark:text-blue-400">Add to Home Screen</span> هەڵبژێرە.</p>
                    </div>
                    <img 
                      src="/guides/ios-step2.jpg" 
                      alt="iOS Step 2" 
                      className="w-full h-auto object-contain bg-mono-200 dark:bg-mono-800 rounded-xl min-h-[150px] shadow-sm border border-mono-200 dark:border-white/10" 
                    />
                  </div>
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
                  <div className="bg-blue-900/30 text-blue-200 border border-blue-700 p-3 rounded-lg text-[13px] mb-4 text-right leading-relaxed font-rabar">
                    تێبینی: بۆ زێدەکرنا یاریێ، پێدڤییە تو ب ڕێکا وێبگەڕێ (Google Chrome) یاریێ ڤەکەی. لینکێ یاریێ (peyvok.com) کۆپی بکە و ل کرۆم ڤەکە.
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
                  <div className="bg-blue-900/30 text-blue-200 border border-blue-700 p-3 rounded-lg text-[13px] mb-4 text-right leading-relaxed font-rabar">
                    تێبینی: بۆ باشترین ئەزموون، یاریێ ب ڕێکا (Google Chrome) یان (Edge) ڤەکە ل سەر لینکێ (peyvok.com).
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
