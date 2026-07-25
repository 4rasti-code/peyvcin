import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

const InstallGuideModal = ({ isOpen, onClose }) => {
  const [deviceType] = useState(() => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      return 'ios';
    } else if (/android/i.test(ua)) {
      return 'android';
    }
    return 'desktop';
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
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <Motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-mono-900 rounded-[20px] shadow-xl w-full max-w-sm overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-mono-100 dark:border-mono-800 text-center relative">
            <button 
              onClick={onClose}
              className="absolute right-5 top-5 text-mono-400 hover:text-mono-600 dark:hover:text-mono-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">download</span>
            </div>
            <h2 className="text-lg font-bold font-rabar text-mono-900 dark:text-white">دابەزاندنا یاریێ</h2>
            <p className="text-[13px] text-mono-500 dark:text-mono-400 mt-1">یاریێ ب شێوەیەکێ باشتر و خێراتر ئەزموون بکە</p>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {deviceType === 'ios' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-mono-50 dark:bg-mono-800/50 p-3 rounded-xl border border-mono-100 dark:border-mono-800">
                  <div className="w-8 h-8 shrink-0 bg-white dark:bg-mono-700 rounded-lg shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-blue-500">ios_share</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-mono-800 dark:text-mono-200">پێنگاڤا ١</p>
                    <p className="text-[12px] text-mono-500 dark:text-mono-400 mt-0.5 leading-relaxed">ل خوارێ شاشەیێ، ل سەر ئایکۆنا Share کلیک بکە.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-mono-50 dark:bg-mono-800/50 p-3 rounded-xl border border-mono-100 dark:border-mono-800">
                  <div className="w-8 h-8 shrink-0 bg-white dark:bg-mono-700 rounded-lg shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-mono-800 dark:text-white">add_box</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-mono-800 dark:text-mono-200">پێنگاڤا ٢</p>
                    <p className="text-[12px] text-mono-500 dark:text-mono-400 mt-0.5 leading-relaxed">هەڵبژاردەیێ <span className="font-bold">Add to Home Screen</span> هەڵبژێرە.</p>
                  </div>
                </div>
              </div>
            )}

            {deviceType === 'android' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-mono-50 dark:bg-mono-800/50 p-3 rounded-xl border border-mono-100 dark:border-mono-800">
                  <div className="w-8 h-8 shrink-0 bg-white dark:bg-mono-700 rounded-lg shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-mono-800 dark:text-white">more_vert</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-mono-800 dark:text-mono-200">پێنگاڤا ١</p>
                    <p className="text-[12px] text-mono-500 dark:text-mono-400 mt-0.5 leading-relaxed">ل سەرەوەیێ شاشەیێ، ل سەر سێ خالان (⋮) کلیک بکە.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-mono-50 dark:bg-mono-800/50 p-3 rounded-xl border border-mono-100 dark:border-mono-800">
                  <div className="w-8 h-8 shrink-0 bg-white dark:bg-mono-700 rounded-lg shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-blue-500">install_mobile</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-mono-800 dark:text-mono-200">پێنگاڤا ٢</p>
                    <p className="text-[12px] text-mono-500 dark:text-mono-400 mt-0.5 leading-relaxed">هەڵبژاردەیێ <span className="font-bold">Install App</span> یان <span className="font-bold">Add to Home screen</span> هەڵبژێرە.</p>
                  </div>
                </div>
              </div>
            )}

            {deviceType === 'desktop' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-mono-50 dark:bg-mono-800/50 p-3 rounded-xl border border-mono-100 dark:border-mono-800">
                  <div className="w-8 h-8 shrink-0 bg-white dark:bg-mono-700 rounded-lg shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-mono-800 dark:text-white">laptop_windows</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-mono-800 dark:text-mono-200">بۆ کۆمپیوتەری</p>
                    <p className="text-[12px] text-mono-500 dark:text-mono-400 mt-0.5 leading-relaxed">ل سەر ئایکۆنا دابەزاندنێ د ناڤ لیدگەڕێ (Browser) دا کلیک بکە، ل تەنیشت ناونیشانێ سایتێ.</p>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="w-full h-11 bg-mono-100 hover:bg-mono-200 dark:bg-mono-800 dark:hover:bg-mono-700 text-mono-800 dark:text-white rounded-xl font-bold font-rabar text-[14px] transition-colors mt-2"
            >
              تێگەهشتیم
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstallGuideModal;
