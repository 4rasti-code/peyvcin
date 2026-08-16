import React, { useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import AccountSettings from './AccountSettings';
import HelpCenterModal from './HelpCenterModal';
import BlockedUsersModal from './BlockedUsersModal';
import { useUser } from '../context/AuthContext';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import DataDeletion from './DataDeletion';
import ReportModal from './ReportModal';
import { playBackSfx } from '../utils/audio';
import { supabase } from '../lib/supabase';

function SettingsModal({
   isOpen,
   onClose,
   appSfxVolume,
   onAppSfxVolumeChange,
   bgMusicVolume,
   onBgMusicVolumeChange,
   hapticEnabled,
   onHapticToggle,
   updateProfile,
   onLogout,
   onPlaySound
}) {

   const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
   const [isHelpCenterOpen, setIsHelpCenterOpen] = React.useState(false);
   const [isBlockedModalOpen, setIsBlockedModalOpen] = React.useState(false);
   const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
   const [activePolicyModal, setActivePolicyModal] = React.useState(null);
   const { user, handleToggleBlock } = useUser();



   const handleDeleteAccount = async () => {
      setShowDeleteConfirm(false);
      triggerHaptic(50);
      try {
         // Call the Supabase RPC to completely delete the auth user
         const { error } = await supabase.rpc('delete_user');
         if (error) {
            console.error("RPC delete_user failed (maybe not created yet?), falling back to profile deletion:", error);
            await supabase.from('profiles').delete().eq('id', user.id);
         }
      } catch (err) {
         console.error("Account deletion error:", err);
      }

      if (onLogout) {
         onLogout();
      }
   };

   return (
      <>
         <AnimatePresence>
            {isOpen && (
               <Motion.div
                  key="settings-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-100 flex flex-col bg-mono-white dark:bg-black transition-colors duration-500 overflow-hidden"
                  onClick={onClose}
               >
                  <Motion.div
                     initial={{ opacity: 0, y: 40 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 40 }}
                     className="w-full px-4 sm:px-12 md:px-24 lg:px-48 mx-auto flex flex-col h-full relative font-rabar transition-colors duration-500"
                     onClick={e => e.stopPropagation()}
                     dir="rtl"
                  >
                     {/* Compact Header */}
                     <div className="p-6 pt-[calc(env(safe-area-inset-top)+16px)] sm:pt-[calc(env(safe-area-inset-top)+16px)] pb-4 flex items-center justify-end shrink-0">
                        <button
                           onClick={onClose}
                           className="w-8 h-8 rounded-md bg-mono-50 dark:bg-white/5 flex items-center justify-center text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-white transition-all active:scale-90 border border-mono-100 dark:border-white/10"
                        >
                           <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                     </div>

                     <div className="p-6 pt-2 pb-12 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                        <AccountSettings updateProfile={updateProfile} onDeleteAccount={() => setShowDeleteConfirm(true)} />

                        <div className="flex items-center w-full pt-4 pb-2">
                           <div className="flex-1 h-px bg-mono-200 dark:bg-white/10"></div>
                           <span className="px-4 text-[13px] font-black font-rabar text-mono-400 dark:text-mono-500">ڕێکخستن</span>
                           <div className="flex-1 h-px bg-mono-200 dark:bg-white/10"></div>
                        </div>
                        {/* 1. AUDIO & HAPTICS */}
                        <div className="px-4 py-2 rounded-md bg-mono-50/50 dark:bg-white/5 border border-mono-100 dark:border-white/5 flex flex-col divide-y divide-mono-100 dark:divide-white/5">

                           {/* SFX Toggle */}
                           <div className="flex items-center justify-between py-3 group">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">
                                    {appSfxVolume > 0 ? 'volume_up' : 'volume_off'}
                                 </span>
                                 <span className="text-[13px] font-bold text-mono-800 dark:text-mono-200">کارتێکەرێن دەنگی</span>
                              </div>
                              <button
                                 onClick={() => { triggerHaptic(10); onAppSfxVolumeChange(appSfxVolume > 0 ? 0 : 100); }}
                                 className={`w-10 h-5 rounded-sm p-1 transition-all duration-300 flex items-center ${appSfxVolume > 0 ? 'bg-green-600/20 justify-end' : 'bg-red-600/20 justify-start'}`}
                              >
                                 <Motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className={`w-3 h-3 rounded-sm ${appSfxVolume > 0 ? 'bg-green-600' : 'bg-red-600'} shadow-sm`}
                                 />
                              </button>
                           </div>

                           {/* Music Toggle */}
                           <div className="flex items-center justify-between py-3 group">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">
                                    {bgMusicVolume > 0 ? 'music_note' : 'music_off'}
                                 </span>
                                 <span className="text-[13px] font-bold text-mono-800 dark:text-mono-200">مۆزیکا پاشبنەمایی</span>
                              </div>
                              <button
                                 onClick={() => { triggerHaptic(10); onBgMusicVolumeChange(bgMusicVolume > 0 ? 0 : 3); }}
                                 className={`w-10 h-5 rounded-sm p-1 transition-all duration-300 flex items-center ${bgMusicVolume > 0 ? 'bg-green-600/20 justify-end' : 'bg-red-600/20 justify-start'}`}
                              >
                                 <Motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className={`w-3 h-3 rounded-sm ${bgMusicVolume > 0 ? 'bg-green-600' : 'bg-red-600'} shadow-sm`}
                                 />
                              </button>
                           </div>

                           {/* Haptic Toggle */}
                           <div className="flex items-center justify-between py-3 group">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">vibration</span>
                                 <span className="text-[13px] font-bold text-mono-800 dark:text-mono-200">لەرزین</span>
                              </div>
                              <button
                                 onClick={() => { triggerHaptic(10); onHapticToggle(); }}
                                 className={`w-10 h-5 rounded-sm p-1 transition-all duration-300 flex items-center ${hapticEnabled ? 'bg-green-600/20 justify-end' : 'bg-red-600/20 justify-start'}`}
                              >
                                 <Motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className={`w-3 h-3 rounded-sm ${hapticEnabled ? 'bg-green-600' : 'bg-red-600'} shadow-sm`}
                                 />
                              </button>
                           </div>
                        </div>

                        {/* HELP & FEEDBACK SECTION */}
                        <div className="px-4 py-2 rounded-md bg-mono-50/50 dark:bg-white/5 border border-mono-100 dark:border-white/5 flex flex-col divide-y divide-mono-100 dark:divide-white/5">
                           <button onClick={() => { triggerHaptic(10); setIsBlockedModalOpen(true); }} className="flex items-center justify-between py-3 w-full group transition-colors">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">block</span>
                                 <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">لیستا بلۆککریان</span>
                              </div>
                              <span className="material-symbols-outlined text-[16px] text-mono-300 dark:text-mono-600">chevron_left</span>
                           </button>
                           <button onClick={() => { triggerHaptic(10); setIsHelpCenterOpen(true); }} className="flex items-center justify-between py-3 w-full group transition-colors">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">help</span>
                                 <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">سەنتەرێ هاریکاریێ</span>
                              </div>
                              <span className="material-symbols-outlined text-[16px] text-mono-300 dark:text-mono-600">chevron_left</span>
                           </button>
                           <button onClick={() => { triggerHaptic(10); setIsReportModalOpen(true); }} className="flex items-center justify-between py-3 w-full group transition-colors">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">feedback</span>
                                 <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">فیدباک</span>
                              </div>
                              <span className="material-symbols-outlined text-[16px] text-mono-300 dark:text-mono-600">chevron_left</span>
                           </button>
                           <button onClick={() => { triggerHaptic(10); setActivePolicyModal('terms'); }} className="flex items-center justify-between py-3 w-full group transition-colors border-t border-mono-100 dark:border-white/5">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">description</span>
                                 <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">مەرجێن خزمەتگوزاریێ</span>
                              </div>
                              <span className="material-symbols-outlined text-[16px] text-mono-300 dark:text-mono-600">chevron_left</span>
                           </button>
                           <button onClick={() => { triggerHaptic(10); setActivePolicyModal('privacy'); }} className="flex items-center justify-between py-3 w-full group transition-colors border-t border-mono-100 dark:border-white/5">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">policy</span>
                                 <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">سیاسەتا تایبەتمەندیێ</span>
                              </div>
                              <span className="material-symbols-outlined text-[16px] text-mono-300 dark:text-mono-600">chevron_left</span>
                           </button>
                           <button onClick={() => { triggerHaptic(10); setActivePolicyModal('deletion'); }} className="flex items-center justify-between py-3 w-full group transition-colors border-t border-mono-100 dark:border-white/5">
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">delete_forever</span>
                                 <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">ژێبرنا داتایان</span>
                              </div>
                              <span className="material-symbols-outlined text-[16px] text-mono-300 dark:text-mono-600">chevron_left</span>
                           </button>
                        </div>

                        {/* Compact Logout Button */}
                        <button
                           onClick={() => { triggerHaptic(15); onPlaySound?.(); onLogout(); }}
                           className="w-full h-11 rounded-md font-black text-[12px] transition-all active:scale-95 flex items-center justify-center gap-2.5 bg-red-500/5 text-red-500 hover:bg-red-500/10 border border-red-500/10 mt-2"
                        >
                           <span className="material-symbols-outlined text-lg">logout</span>
                           دەرکەفتن ژ ھەژمارێ
                        </button>

                        <div className="mt-8 flex flex-col items-center gap-1 opacity-50 pb-8">
                           <p className="text-[8px] font-black tracking-[0.4em] uppercase text-mono-400">Peyvok v2.8.0</p>
                        </div>
                     </div>
                  </Motion.div>
               </Motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isHelpCenterOpen && (
               <HelpCenterModal
                  key="help-center-modal"
                  onClose={() => setIsHelpCenterOpen(false)}
                  triggerHaptic={triggerHaptic}
               />
            )}
         </AnimatePresence>

         <BlockedUsersModal
            isOpen={isBlockedModalOpen}
            onClose={() => setIsBlockedModalOpen(false)}
            user={user}
            handleToggleBlock={handleToggleBlock}
         />
         <PolicyModal
            isOpen={!!activePolicyModal}
            onClose={() => setActivePolicyModal(null)}
            type={activePolicyModal}
            onViewChange={setActivePolicyModal}
         />
         {/* DELETE CONFIRMATION OVERLAY */}
         <AnimatePresence>
            {showDeleteConfirm && (
               <Motion.div
                  key="delete-confirm-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-110 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
               >
                  <Motion.div
                     initial={{ scale: 0.9, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.9, opacity: 0, y: 20 }}
                     className="relative w-full max-w-75 bg-mono-50 dark:bg-mono-900 border border-mono-200 dark:border-white/10 rounded-md p-5 flex flex-col items-center shadow-2xl overflow-hidden"
                     dir="rtl"
                  >
                     <h3 className="text-sm font-bold font-rabar text-mono-900 dark:text-white mb-3 drop-shadow-sm">تو پشتڕاستی ژ ژێبرنا ڤێ هژمارێ؟</h3>
                     <p className="text-[11px] font-bold text-center text-mono-500 dark:text-white/50 mb-5 leading-relaxed">
                        ئەگەر ڤێ کردارێ ئەنجام بدەی, هەمی داتا و پێشکەفتنێن تە دێ ب یەکجاری هێنە ژێبرن و ڤەگەڕاندن تێدا نینە.
                     </p>
                     <div className="flex gap-2.5 w-full">
                        <button
                           onClick={() => { triggerHaptic(10); handleDeleteAccount(); }}
                           className="flex-1 text-white bg-red-500 hover:bg-red-600 py-2.5 rounded-md text-[13px] font-black transition-all active:scale-95 shadow-sm"
                        >
                           بەلێ، ژێببە
                        </button>
                        <button
                           onClick={() => { triggerHaptic(10); setShowDeleteConfirm(false); }}
                           className="flex-1 text-mono-700 dark:text-mono-300 bg-mono-200 hover:bg-mono-300 dark:bg-mono-800 dark:hover:bg-mono-700 py-2.5 rounded-md text-[13px] font-bold transition-colors"
                        >
                           نەخێر
                        </button>
                     </div>
                  </Motion.div>
               </Motion.div>
            )}
         </AnimatePresence>

         {/* Report Bug/Suggestion Modal */}
         <AnimatePresence>
            {isReportModalOpen && (
               <ReportModal
                  isOpen={isReportModalOpen}
                  onClose={() => setIsReportModalOpen(false)}
                  user={user}
               />
            )}
         </AnimatePresence>
      </>
   );
}

const PolicyModal = ({ isOpen, onClose, type, onViewChange }) => {
   const scrollRef = useRef(null);

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = 0;
      }
   }, [type]);

   const renderContent = () => {
      const props = { onViewChange, onClose };
      switch (type) {
         case 'terms': return <TermsOfService {...props} />;
         case 'privacy': return <PrivacyPolicy {...props} />;
         case 'deletion': return <DataDeletion {...props} />;
         default: return null;
      }
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <Motion.div
               ref={scrollRef}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-1000 flex flex-col bg-mono-white dark:bg-black overflow-y-auto"
            >
               {/* Custom Header for Policy Modals */}
               <div className="sticky top-0 z-50 flex items-center justify-end px-6 py-4 pt-safe bg-mono-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-mono-200 dark:border-white/5">
                  <button
                     onClick={() => {
                        playBackSfx();
                        onClose();
                     }}
                     className="w-10 h-10 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-mono-900 dark:text-white"
                  >
                     <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
               </div>

               <div className="flex-1">
                  {renderContent()}
               </div>
            </Motion.div>
         )}
      </AnimatePresence>
   );
}

export default SettingsModal;
