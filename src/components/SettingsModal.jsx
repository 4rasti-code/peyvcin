import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SettingsModal({ 
   isOpen, 
   onClose, 
   currentTheme, 
   onThemeChange, 
   appSoundsEnabled, 
   onAppSoundsToggle,
   hapticEnabled,
   onHapticToggle,
   user,
   onLogout
 }) {
   if (!isOpen) return null;

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm p-4"
               onClick={onClose}
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden relative"
                  onClick={e => e.stopPropagation()}
               >
                  {/* Header */}
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                     <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all shadow-lg active:scale-95"
                     >
                        <span className="material-symbols-outlined text-2xl font-bold">close</span>
                     </button>
                     <h2 className="text-3xl font-black font-heading text-white tracking-tight">ڕێکخستن</h2>
                  </div>

                  <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Audio & Haptic Section */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-white/30 uppercase tracking-[0.2em]">دەنگ و لەرزین</span>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-white/5 to-transparent mr-6" />
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* Master Sound Toggle */}
                        <div className="bg-white/5 border-2 border-white/5 rounded-[32px] p-6 flex items-center justify-between gap-4">
                           <div className="flex items-center gap-4 text-right">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                                 <span className="material-symbols-outlined text-2xl font-bold">
                                    {appSoundsEnabled ? 'volume_up' : 'volume_off'}
                                 </span>
                              </div>
                              <span className="text-xl font-black font-heading text-white whitespace-nowrap">دەنگێن ئەپی</span>
                           </div>
                           
                           <button 
                              onClick={onAppSoundsToggle}
                              className={`w-16 h-10 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                                 appSoundsEnabled ? 'bg-[#facc15]' : 'bg-white/10'
                              }`}
                           >
                              <motion.div 
                                 animate={{ x: appSoundsEnabled ? -24 : 0 }}
                                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                 className={`w-8 h-8 rounded-full shadow-lg ${
                                    appSoundsEnabled ? 'bg-amber-950' : 'bg-white/40'
                                 }`}
                              />
                           </button>
                        </div>

                        {/* Haptic Toggle */}
                        <div className="bg-white/5 border-2 border-white/5 rounded-[32px] p-6 flex items-center justify-between gap-4">
                           <div className="flex items-center gap-4 text-right">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                                 <span className="material-symbols-outlined text-2xl font-bold">
                                    {hapticEnabled ? 'vibration' : 'mobile_off'}
                                 </span>
                              </div>
                              <span className="text-xl font-black font-heading text-white whitespace-nowrap">لەرزینا ئەپی</span>
                           </div>
                           
                           <button 
                              onClick={onHapticToggle}
                              className={`w-16 h-10 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                                 hapticEnabled ? 'bg-[#facc15]' : 'bg-white/10'
                              }`}
                           >
                              <motion.div 
                                 animate={{ x: hapticEnabled ? -24 : 0 }}
                                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                 className={`w-8 h-8 rounded-full shadow-lg ${
                                    hapticEnabled ? 'bg-amber-950' : 'bg-white/40'
                                 }`}
                              />
                           </button>
                        </div>
                      </div>
                    </section>

                    {/* Theme Section */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-white/30 uppercase tracking-[0.2em]">ڕووکار</span>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-white/5 to-transparent mr-6" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'default', name: 'سادە', color: 'bg-slate-800' },
                          { id: 'zakho_nights', name: 'شەڤێن زاخۆ', color: 'bg-indigo-900' }
                        ].map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => onThemeChange(theme.id)}
                            className={`p-6 rounded-[32px] border-2 transition-all duration-300 ${
                              currentTheme === theme.id 
                                ? 'border-[#facc15] bg-[#facc15]/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
                                : 'border-white/5 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl ${theme.color} mb-4 mx-auto shadow-inner`} />
                            <span className={`block text-center font-bold ${currentTheme === theme.id ? 'text-[#facc15]' : 'text-white/60'}`}>
                              {theme.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Logout Section */}
                    <div className="pt-6">
                      <button
                        onClick={onLogout}
                        className="w-full bg-red-500/10 border-2 border-red-500/20 text-red-500 h-20 rounded-[32px] font-black text-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                      >
                         <span className="material-symbols-outlined font-bold">logout</span>
                         دەرکەفتن ژ هەژمارێ
                      </button>
                    </div>

                    <div className="text-center pb-4">
                      <p className="text-white/20 text-sm font-bold tracking-widest uppercase">Peyvçîn v2.0</p>
                    </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
}

export default SettingsModal;
