import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';

const UPDATE_VERSION = 'v2.5.0'; // Change this string to force the modal to show again for all users

const UPDATE_RELEASE_DATE = new Date('2026-08-01T00:00:00Z');

const UpdateNotesModal = ({ user }) => {
   const [isVisible, setIsVisible] = useState(false);
   const { playPopSound } = useAudio();

   useEffect(() => {
      const hasSeenUpdate = localStorage.getItem(`update_seen_${UPDATE_VERSION}`);
      
      if (!hasSeenUpdate) {
         // Check if the user is a new user (registered after the update release)
         if (user?.created_at && new Date(user.created_at) > UPDATE_RELEASE_DATE) {
            // New user: mark as seen silently so they never see it
            localStorage.setItem(`update_seen_${UPDATE_VERSION}`, 'true');
            return;
         }

         // Old user: show the modal with a small delay
         const timer = setTimeout(() => {
            setIsVisible(true);
            try { playPopSound(); } catch (_e) { /* ignore */ }
         }, 1500);
         return () => clearTimeout(timer);
      }
   }, [playPopSound, user]);

   const handleClose = () => {
      try { playPopSound(); } catch (_e) { /* ignore */ }
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
                           🌟 <b className="text-mono-900 dark:text-white">سیستەمێ ڕاپۆرتان:</b> نۆکە ل ناڤ لۆبیێ، تو دشێی ب ساناهی گازندە و پێشنیارێن خۆ ڕاستەوخۆ بۆ مە بهنێری ل گەل هەلبژارتنا ٥ وێنەیان ب ئێکجار!
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           💬 <b className="text-mono-900 dark:text-white">ئاریشەیا چاتێ:</b> ئەو ئاریشەیا کو نامەیێن کەڤن یێن چاتێ پشتی ژێبرنێ ڤەدگەڕیان، ب تەمامی هاتە چارەسەرکرن.
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           ✍️ <b className="text-mono-900 dark:text-white">ئاریشەیا فۆنتێ:</b> ئەو پەیڤێن کو پیتێن وان ل هندەک شاشەیان پچڕ پچڕ و ژێکڤەبووی دیار دبوون، هاتنە دروستکرن.
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           📱 <b className="text-mono-900 dark:text-white">دیزاینا شاشەیان:</b> دیزاین و دوکمەیێن یاریێ نۆکە ب دروستی ل گەل شاشەیێن هەمی مۆبایلان دگونجن، بێی کو شاشە ل سەر مۆبایلێن بچیک بلڤیت و تە بێزار بکەت.
                        </li>
                        <li className="text-[12px] font-bold text-mono-600 dark:text-mono-300 leading-relaxed transition-colors">
                           🛠️ <b className="text-mono-900 dark:text-white">باشترکرنا یاریێ:</b> ل گەل چەندین چارەسەریێن دی یێن بچیک بۆ نەهێلانا گیربوونان و خێراترکرنا کارکرنا یاریێ ب گشتی!
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
