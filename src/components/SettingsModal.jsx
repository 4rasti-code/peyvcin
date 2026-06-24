import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import AccountSettings from './AccountSettings';
import HelpCenterModal from './HelpCenterModal';
import BlockedUsersModal from './BlockedUsersModal';
import { useUser } from '../context/AuthContext';


function SettingsModal({
   isOpen,
   onClose,
   appSfxVolume,
   onAppSfxVolumeChange,
   bgMusicVolume,
   onBgMusicVolumeChange,
   hapticEnabled,
   onHapticToggle,
   micEnabled,
   micVolume,
   speakerEnabled,
   voiceVolume,
   updateProfile,
   onLogout,
   onPlaySound
}) {

   const [isHelpCenterOpen, setIsHelpCenterOpen] = React.useState(false);
   const [isBlockedModalOpen, setIsBlockedModalOpen] = React.useState(false);
   const { user, handleToggleBlock } = useUser();

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
                  <div className="p-6 pt-12 sm:pt-8 pb-4 flex items-center justify-end shrink-0">
                     <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-md bg-mono-50 dark:bg-white/5 flex items-center justify-center text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-white transition-all active:scale-90 border border-mono-100 dark:border-white/10"
                     >
                        <span className="material-symbols-outlined text-lg">close</span>
                     </button>
                  </div>

                   <div className="p-6 pt-2 pb-12 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                      <AccountSettings updateProfile={updateProfile} />
                      
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

                         {/* Mic Section */}
                         <div className="flex flex-col py-3 space-y-4">
                            <div className="flex items-center justify-between group">
                               <div className="flex items-center gap-3">
                                  <span className={`material-symbols-outlined text-lg transition-colors ${micEnabled ? 'text-mono-900 dark:text-white' : 'text-mono-400'}`}>
                                     {micEnabled ? 'mic' : 'mic_off'}
                                  </span>
                                  <span className="text-[13px] font-bold text-mono-800 dark:text-mono-200">دەنگکێش</span>
                               </div>
                               <button
                                  onClick={() => { triggerHaptic(10); updateProfile({ mic_enabled: !micEnabled }); }}
                                  className={`w-10 h-5 rounded-sm p-1 transition-all duration-300 flex items-center ${micEnabled ? 'bg-green-600/20 justify-end' : 'bg-red-600/20 justify-start'}`}
                               >
                                  <Motion.div
                                     layout
                                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                     className={`w-3 h-3 rounded-sm ${micEnabled ? 'bg-green-600' : 'bg-red-600'} shadow-sm`}
                                  />
                               </button>
                            </div>
                            {micEnabled && (
                               <div className="px-1 flex items-center gap-3 w-full pb-1">
                                  <input
                                     type="range"
                                     dir="ltr"
                                     min="0"
                                     max="100"
                                     value={micVolume}
                                     onChange={(e) => updateProfile({ mic_volume: parseInt(e.target.value) })}
                                     className="flex-1 h-1 bg-mono-100 dark:bg-white/10 rounded-none appearance-none cursor-pointer accent-mono-900 dark:accent-white transition-all"
                                  />
                                  <span className="text-[10px] font-bold text-mono-400 shrink-0 min-w-[28px] text-center" dir="ltr">{micVolume}%</span>
                               </div>
                            )}
                         </div>

                         {/* Speaker Section */}
                         <div className="flex flex-col py-3 space-y-4">
                            <div className="flex items-center justify-between group">
                               <div className="flex items-center gap-3">
                                  <span className={`material-symbols-outlined text-lg transition-colors ${speakerEnabled ? 'text-mono-900 dark:text-white' : 'text-mono-400'}`}>
                                     {speakerEnabled ? 'volume_up' : 'volume_off'}
                                  </span>
                                  <span className="text-[13px] font-bold text-mono-800 dark:text-mono-200">بلندگۆ</span>
                               </div>
                               <button
                                  onClick={() => { triggerHaptic(10); updateProfile({ speaker_enabled: !speakerEnabled }); }}
                                  className={`w-10 h-5 rounded-sm p-1 transition-all duration-300 relative ${speakerEnabled ? 'bg-green-600/20' : 'bg-red-600/20'}`}
                               >
                                  <Motion.div
                                     animate={{ x: speakerEnabled ? -20 : 0 }}
                                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                     className={`w-3 h-3 rounded-sm ${speakerEnabled ? 'bg-green-600' : 'bg-red-600'} shadow-sm`}
                                  />
                               </button>
                            </div>
                            {speakerEnabled && (
                               <div className="px-1 flex items-center gap-3 w-full pb-1">
                                  <input
                                     type="range"
                                     min="0"
                                     max="100"
                                     value={voiceVolume}
                                     onChange={(e) => updateProfile({ voice_volume: parseInt(e.target.value) })}
                                     className="flex-1 h-1 bg-mono-100 dark:bg-white/10 rounded-none appearance-none cursor-pointer accent-mono-900 dark:accent-white transition-all"
                                  />
                                  <span className="text-[10px] font-bold text-mono-400 shrink-0 min-w-[28px] text-center" dir="ltr">{voiceVolume}%</span>
                               </div>
                            )}
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
                        <button onClick={() => { triggerHaptic(10); window.location.href = 'mailto:support@peyvok.com'; }} className="flex items-center justify-between py-3 w-full group transition-colors">
                           <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">feedback</span>
                              <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">فیدباک</span>
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

                     <div className="pt-2 flex flex-col items-center gap-1 opacity-20">
                        <p className="text-[8px] font-black tracking-[0.4em] uppercase text-mono-400">Peyvok v2.1.0</p>
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
      </>
   );
}

export default SettingsModal;
