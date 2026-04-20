import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

function SettingsModal({ 
   isOpen, 
   onClose, 
   currentTheme, 
   onThemeChange, 
   appSfxVolume, 
   onAppSfxVolumeChange,
   bgMusicVolume,
   onBgMusicVolumeChange,
   hapticEnabled,
   onHapticToggle,
   user,
   onLogout,
   onPlaySound
 }) {
   if (!isOpen) return null;

   // Rasasi / Emerald Palette
   const palette = {
      bg: '#020617',      // Deep Nocturnal Blue
      card: 'rgb(203, 213, 225)', // Light Slate / Blue-Gray
      accent: '#10b981',  // Emerald Green
      dark: '#1e293b',    // Slate 800
      text: '#ffffff',    // White for headers
      labels: '#0f172a'   // Deep Slate for card text
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-[#020617]/90 backdrop-blur-xl p-4"
               onClick={onClose}
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 30 }}
                  style={{ backgroundColor: palette.bg }}
                  className="w-full max-w-[360px] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden relative font-rabar"
                  onClick={e => e.stopPropagation()}
               >
                  {/* Rasasi Header */}
                  <div className="p-5 border-b border-white/5 flex items-center justify-between relative z-10">
                     <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-sm bg-[#1e293b] flex items-center justify-center text-[#10b981] hover:brightness-125 transition-all shadow-lg active:scale-90 border border-white/10"
                     >
                        <span className="material-symbols-outlined text-lg font-black">close</span>
                     </button>
                     <div className="flex flex-col items-end">
                        <span className="material-symbols-outlined text-[#10b981] text-xl mb-0.5">settings</span>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none" style={{ color: palette.card }}>ڕێکخستن</h2>
                     </div>
                  </div>

                  <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar relative z-10">
                    
                    {/* Audio Section */}
                    <div className="space-y-3">
                       {/* App Sounds Card */}
                       <div 
                          style={{ backgroundColor: palette.card }}
                          className="rounded-sm p-3.5 shadow-sm border border-white/20"
                       >
                          <div className="flex items-center justify-between mb-1.5">
                             <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg font-black" style={{ color: palette.accent }}>
                                   {appSfxVolume > 0 ? 'volume_up' : 'volume_off'}
                                </span>
                                <span className="text-xs font-black uppercase tracking-tight" style={{ color: palette.labels }}>دەنگێن ئەپی</span>
                             </div>
                             <span className="text-[10px] font-black px-2 py-0.5 rounded-sm bg-[#1e293b] text-white tabular-nums shadow-sm">{appSfxVolume}%</span>
                          </div>
                          <input 
                             type="range" 
                             min="0" 
                             max="100" 
                             value={appSfxVolume} 
                             onChange={(e) => onAppSfxVolumeChange(parseInt(e.target.value))}
                             className="w-full h-1.5 rounded-none appearance-none cursor-pointer focus:outline-none"
                             style={{
                                background: `linear-gradient(to left, ${palette.accent} 0%, ${palette.accent} ${appSfxVolume}%, #94a3b8 ${appSfxVolume}%, #94a3b8 100%)`
                             }}
                          />
                       </div>

                       {/* Music Card */}
                       <div 
                          style={{ backgroundColor: palette.card }}
                          className="rounded-sm p-3.5 shadow-sm border border-white/20"
                       >
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg font-black" style={{ color: palette.accent }}>
                                   {bgMusicVolume > 0 ? 'music_note' : 'music_off'}
                                </span>
                                <span className="text-xs font-black uppercase tracking-tight" style={{ color: palette.labels }}>دەنگێ مۆزیکێ</span>
                             </div>
                             
                             <button 
                                onClick={() => onBgMusicVolumeChange(bgMusicVolume > 0 ? 0 : 10)}
                                className={`w-12 h-7 rounded-sm p-1 transition-all duration-300 relative shrink-0 shadow-inner ${
                                   bgMusicVolume > 0 ? 'bg-[#1e293b]' : 'bg-red-500/10'
                                }`}
                             >
                                <motion.div 
                                   animate={{ x: bgMusicVolume > 0 ? -20 : 0 }}
                                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                   className={`w-5 h-5 rounded-sm shadow-md flex items-center justify-center ${
                                      bgMusicVolume > 0 ? 'bg-[#10b981]' : 'bg-red-500'
                                   }`}
                                >
                                   {bgMusicVolume > 0 && <div className="w-1 h-1 rounded-full bg-emerald-950" />}
                                </motion.div>
                             </button>
                          </div>
                       </div>

                       {/* Haptic Row */}
                       <div 
                          style={{ backgroundColor: palette.card }}
                          className="rounded-sm p-2.5 px-4 flex items-center justify-between border border-white/20 shadow-sm"
                       >
                          <div className="flex items-center gap-2.5">
                             <div className="w-8 h-8 rounded-sm bg-slate-100/50 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-lg font-black" style={{ color: palette.accent }}>vibration</span>
                             </div>
                             <span className="text-xs font-black uppercase tracking-tight" style={{ color: palette.labels }}>لەرزینا ئەپی</span>
                          </div>
                          <button 
                             onClick={onHapticToggle}
                             className={`w-12 h-7 rounded-sm p-1 transition-all duration-300 relative shrink-0 shadow-inner ${
                                hapticEnabled ? 'bg-[#1e293b]' : 'bg-red-500/10'
                             }`}
                          >
                             <motion.div 
                                animate={{ x: hapticEnabled ? -20 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`w-5 h-5 rounded-sm shadow-md flex items-center justify-center ${
                                   hapticEnabled ? 'bg-[#10b981]' : 'bg-red-500'
                                }`}
                             >
                                {hapticEnabled && <div className="w-1 h-1 rounded-full bg-emerald-950" />}
                             </motion.div>
                          </button>
                       </div>
                    </div>

                    {/* Theme Section */}
                    <div className="space-y-3 pt-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 opacity-40 italic" style={{ color: palette.card }}>ڕووکار</span>
                       <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { id: 'default', name: 'سادە', color: '#1e293b' },
                            { id: 'zakho_nights', name: 'زاخۆ', color: '#1a1c2c' }
                          ].map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => { triggerHaptic(10); onPlaySound?.(); onThemeChange(theme.id); }}
                              style={{ 
                                 backgroundColor: currentTheme === theme.id ? palette.dark : palette.card,
                                 borderColor: currentTheme === theme.id ? palette.accent : 'transparent'
                              }}
                              className={`p-3 rounded-sm border-2 transition-all duration-300 flex flex-col items-center gap-1.5 group shadow-sm hover:scale-[1.02] ${
                                 currentTheme === theme.id ? 'z-20' : 'z-10'
                              }`}
                            >
                              <div 
                                 style={{ backgroundColor: theme.color }}
                                 className="w-7 h-7 rounded-sm mb-0.5 shadow-inner border border-white/10 transition-transform group-hover:rotate-6" 
                              />
                              <span className={`text-[9px] font-black uppercase tracking-widest ${
                                 currentTheme === theme.id ? 'text-white' : 'text-slate-900'
                              }`}>
                                {theme.name}
                              </span>
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Logout Bar */}
                    <button
                      onClick={() => { onPlaySound?.(); onLogout(); }}
                      className="w-full h-14 rounded-sm font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-lg mt-1 border border-white/10 font-heading"
                      style={{ backgroundColor: palette.dark, color: '#ef4444' }}
                    >
                       <span className="material-symbols-outlined font-black text-lg">logout</span>
                       دەرکەفتن ژ ھەژمارێ
                    </button>

                    <p className="text-center text-[8px] font-black tracking-[0.4em] uppercase opacity-20 pt-1 italic" style={{ color: palette.card }}>Peyvçîn v2.0</p>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
}

export default SettingsModal;
