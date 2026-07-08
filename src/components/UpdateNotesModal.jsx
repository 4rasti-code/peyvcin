import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';

const UPDATE_VERSION = 'v2.3.0'; // Change this string to force the modal to show again for all users

const UpdateNotesModal = () => {
   const [isVisible, setIsVisible] = useState(false);
   const { playPopSound } = useAudio();

   useEffect(() => {
      const hasSeenUpdate = localStorage.getItem(`update_seen_${UPDATE_VERSION}`);
      if (!hasSeenUpdate) {
         // Add a small delay so it doesn't instantly jump scare the user on load
         const timer = setTimeout(() => {
            setIsVisible(true);
            try { playPopSound(); } catch(_e) { /* ignore */ }
         }, 1500);
         return () => clearTimeout(timer);
      }
   }, [playPopSound]);

   const handleClose = () => {
      try { playPopSound(); } catch(_e) { /* ignore */ }
      setIsVisible(false);
      localStorage.setItem(`update_seen_${UPDATE_VERSION}`, 'true');
   };

   return (
      <AnimatePresence>
         {isVisible && (
            <Motion.div
               key="update-modal-overlay"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-rabar"
               dir="rtl"
            >
               <Motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="w-full max-w-sm relative flex flex-col items-center"
               >
                  {/* Decorative Header */}
                  <div className="absolute -top-12 z-10 bg-amber-500 w-24 h-24 rounded-xl flex items-center justify-center border-4 border-mono-white dark:border-mono-900 transition-colors duration-500">
                     <span className="material-symbols-outlined text-[48px] text-white">campaign</span>
                  </div>

                  {/* Main Card */}
                  <div className="bg-mono-white dark:bg-mono-900 rounded-xl w-full border border-mono-200 dark:border-white/10 shadow-xl pt-16 pb-6 px-6 overflow-hidden flex flex-col relative transition-colors duration-500">
                     
                     {/* Title */}
                     <h2 className="text-xl font-black text-center text-mono-900 dark:text-white mb-1 transition-colors">
                        وەشانا نوی گەهشت!
                     </h2>
                     <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-bold mb-6 transition-colors">
                        ڤێرژنا {UPDATE_VERSION}
                     </p>

                     {/* Scrollable Content */}
                     <ul className="flex-1 overflow-y-auto custom-scrollbar pr-4 pl-1 max-h-[75vh] space-y-3 list-disc marker:text-amber-500 dark:marker:text-amber-400">
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           <strong className="text-mono-900 dark:text-white transition-colors">🏅 سیستەمێ پلەیان (Rank):</strong> مەرجان بجهبینە و گەلەک پلە و باجێن تایبەت ب دەستڤە بینە!
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           <strong className="text-mono-900 dark:text-white transition-colors">🏆 پشکا تایبەت یا پلەیان:</strong> شاشەیەکا نوی بۆ دیتنا هەمی مەدالیا و دەستکەڤتێن تە ب ڕەنگەکێ جوان.
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           <strong className="text-mono-900 dark:text-white transition-colors">🎬 ئەنیمەیشنێ سینەمایی:</strong> ئەنیمەیشنێ 3D و لڤینا مۆبایلێ دەمێ تو مەدالیایەکا نوی وەردگری.
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           <strong className="text-mono-900 dark:text-white transition-colors">✨ نیشانێن نوی و دەنگێن تایبەت:</strong> چێکرنا باجێن ب کوالێتیەکا بلند (وەکی سەرەتایی، پەهلەوان، شارەزا، مامۆستا، شانازیا کوردستانێ، شاهێ پەیڤان) دگەل دەنگەکێ تایبەت و جیاواز بۆ هەر ئێک ژ وان دەمێ وەردگری!
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           <strong className="text-mono-900 dark:text-white transition-colors">👀 دیارکرنا پلەیێ:</strong> ژ نۆکە و پێڤە، مەزنترین مەدالیایا تە دێ ل سەر پرۆفایلێ تە یێ گشتی دیار بیت!
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           <strong className="text-mono-900 dark:text-white transition-colors">⚡ بلەزکرنا ئەپی:</strong> چارەسەرکرنا هندەک ئاریشەیێن بچویک و ڕێکخستنا بەرپەڕێ پرۆفایلی.
                        </li>
                     </ul>

                     {/* Action Button */}
                     <div className="mt-6 pt-4 border-t border-mono-200 dark:border-white/10 flex justify-center transition-colors duration-500">
                        <button
                           onClick={handleClose}
                           className="bg-mono-900 hover:bg-mono-800 dark:bg-white dark:hover:bg-mono-200 text-white dark:text-mono-900 font-black text-[15px] py-3 px-12 rounded-md active:scale-95 transition-all w-full flex items-center justify-center gap-2"
                        >
                           <span>گەلەک باشە</span>
                           <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </button>
                     </div>

                  </div>
               </Motion.div>
            </Motion.div>
         )}
      </AnimatePresence>
   );
};

export default UpdateNotesModal;
