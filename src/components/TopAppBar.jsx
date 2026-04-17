import React, { useState } from 'react';
import { FilsIcon, DerhemIcon, ZerIcon } from './CurrencyIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import CurrencyDecrementEffect from './CurrencyDecrementEffect';
import NotificationsView from './NotificationsView';

  const CurrencyStat = ({ value, Icon: IconComponent, color, bg, currency = 'fils' }) => {
    const currencyName = currency === 'derhem' ? 'دەرهەم' : currency === 'zer' ? 'زێڕ' : 'فلس';
    return (
      <CurrencyDecrementEffect value={value} currency={currency}>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[12px] ${bg || 'bg-transparent'} transition-all duration-300`}>
          <div className={`w-5 h-5 flex items-center justify-center ${color} drop-shadow-sm`}>
            <IconComponent className="w-full h-full" />
          </div>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[17px] font-black font-heading text-white">{(value || 0).toLocaleString('ku-IQ')}</span>
            <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${color} opacity-60`}>{currencyName}</span>
          </div>
        </div>
      </CurrencyDecrementEffect>
    );
  };

export default function TopAppBar({ 
  fils = 0, 
  derhem = 0,
  zer = 0,
  level, 
  onOpenSettings, 
  currentView, 
  onForfeit,
  category = 'گشتی',
  notificationCount = 0,
  notifications = [],
  onNotificationAction,
  gameMode = 'classic',
}) {
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const displayCategory = category === 'پەیڤێن دژوار' ? 'پەیڤێن دژوار' 
                        : category === 'تایا پەیڤان' ? 'تایا پەیڤان'
                        : category === 'پەیڤێن نەھێنی' ? 'پەیڤا نھێنی'
                        : category === 'generalWordPool' ? null 
                        : category;

  const isPlaying = currentView === 'game';
  const showStats = currentView === 'lobby' || currentView === 'store' || currentView === 'leaderboard' || currentView === 'stats';
  const isClassic = gameMode === 'classic';

  return (
    <header 
      className="relative top-0 w-full z-100 bg-[#0a0f1b] border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pt-[env(safe-area-inset-top,0px)] transition-all duration-500 overflow-visible" 
      dir="ltr"
    >
      <div className="flex h-16 items-center justify-between px-6 sm:px-12 w-full max-w-425 mx-auto relative gap-4">
      
        {/* Left Section: Close (X) or Settings */}
        <div className="flex items-center justify-start flex-1">
          {isPlaying ? (
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => { triggerHaptic(10); onForfeit(); }}
              className="w-12 h-12 flex items-center justify-center text-[#ef4444] transition-all"
            >
              <span className="material-symbols-outlined text-[32px] font-black">close</span>
            </motion.button>
          ) : (
            currentView !== 'store' && (
             <div className="flex items-center gap-1">
               {currentView === 'stats' && (
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   transition={{ type: "spring", stiffness: 400, damping: 17 }}
                   onClick={() => { triggerHaptic(10); onOpenSettings(); }}
                   className="w-12 h-12 flex items-center justify-center text-[#facc15]/60 transition-all"
                 >
                   <span className="material-symbols-outlined text-[28px] font-black">settings</span>
                 </motion.button>
               )}
             </div>
            )
          )}
        </div>

        {/* Right Section: In-Game Info (Mode Specific) OR Global Stats + Notification */}
        <div className="flex items-center justify-end gap-3 flex-1 relative">
          {isPlaying ? (
            isClassic ? (
              <>
                {/* Center Section: Topic (Category) - Classic Only */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center leading-tight">
                  {displayCategory && (
                    <>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">بابەت</span>
                      <span className="text-sm sm:text-base font-black text-[#facc15] font-noto-sans-arabic">{displayCategory}</span>
                    </>
                  )}
                </div>
                {/* Right Balance */}
                <CurrencyStat value={fils} Icon={FilsIcon} color="text-[#facc15]" />
              </>
            ) : (
              /* Informative Header for Non-Classic Modes */
              <div className="flex items-center gap-3">
                {displayCategory && (
                  <div className="flex flex-col items-end leading-tight ml-2">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">بابەت</span>
                    <span className="text-[13px] font-bold text-primary font-noto-sans-arabic">{displayCategory}</span>
                  </div>
                )}
                {displayCategory && <div className="w-[1.5px] h-6 bg-white/15 mx-1.5 rounded-full" />}
                <CurrencyStat value={fils} Icon={FilsIcon} color="text-[#facc15]" />
              </div>
            )
          ) : (
            showStats && (
              <div className="flex items-center gap-2 sm:gap-4">
                 {currentView === 'store' ? (
                   <>
                     <CurrencyStat value={zer} Icon={ZerIcon} color="text-yellow-400" currency="zer" bg="bg-black/20" />
                     <CurrencyStat value={derhem} Icon={DerhemIcon} color="text-slate-300" currency="derhem" bg="bg-black/20" />
                     <CurrencyStat value={fils} Icon={FilsIcon} color="text-[#facc15]" currency="fils" bg="bg-black/20" />
                   </>
                 ) : (
                   <>
                     {currentView === 'lobby' && (
                       <div className="relative">
                         <motion.button 
                            animate={notificationCount > 0 ? {
                              scale: [1, 1.1, 1],
                              filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                            } : {}}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 2,
                              ease: "easeInOut"
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { triggerHaptic(10); setIsNotifsOpen(!isNotifsOpen); }}
                            className={`w-16 h-16 flex items-center justify-center transition-all relative ${isNotifsOpen || notificationCount > 0 ? 'text-[#facc15]' : 'text-[#facc15]/60'}`}
                         >
                           <span className="material-symbols-outlined text-[54px] font-black">notifications</span>
                           {notificationCount > 0 && (
                             <motion.div 
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-[#0a0f1b] flex items-center justify-center shadow-lg pointer-events-none"
                             >
                               <span className="text-[11px] font-black text-white leading-none">{notificationCount}</span>
                               <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40" />
                             </motion.div>
                           )}
                         </motion.button>

                         <AnimatePresence>
                           {isNotifsOpen && (
                             <NotificationsView 
                               notifications={notifications}
                               onClose={() => setIsNotifsOpen(false)}
                               onAction={(item) => {
                                 setIsNotifsOpen(false);
                                 onNotificationAction(item);
                               }}
                             />
                           )}
                         </AnimatePresence>
                       </div>
                     )}
                     
                     {currentView !== 'lobby' && (
                       <CurrencyStat value={fils} Icon={FilsIcon} color="text-[#facc15]" currency="fils" bg="bg-black/20" />
                     )}
                     
                     <div className="hidden sm:flex items-center bg-[#0ea5e9] rounded-[20px] border-2 border-white/20 p-2 pl-5 gap-3 shadow-xl h-13">
                        <div className="flex flex-col items-start leading-none pt-0.5">
                           <span className="text-[17px] font-black font-heading text-white">{level || 1}</span>
                           <span className="text-[9px] font-black font-rabar text-white/40 uppercase tracking-[0.2em] mt-0.5">ئاست</span>
                        </div>
                        <div className="w-9 h-9 rounded-[14px] bg-white/20 flex items-center justify-center text-white border border-white/30 shadow-inner" style={{ minWidth: '36px' }}>
                           <span className="material-symbols-outlined text-xl font-bold">military_tech</span>
                        </div>
                     </div>
                   </>
                 )}
              </div>
            )
          )}
        </div>

      </div>
    </header>
  );
}
