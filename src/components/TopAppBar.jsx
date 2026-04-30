import React, { useState } from 'react';
import { FilsIcon, DerhemIcon, DinarIcon } from './CurrencyIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import CurrencyDecrementEffect from './CurrencyDecrementEffect';
import NotificationsView from './NotificationsView';
import { toKuDigits } from '../utils/formatters';

  const CurrencyStat = ({ value, Icon: IconComponent, color, bg, currency = 'fils', resetKey, isDark = true }) => {
    const currencyName = currency === 'derhem' ? 'دەرهەم' : currency === 'dinar' ? 'دینار' : 'فلس';
    return (
      <CurrencyDecrementEffect value={value} currency={currency} resetKey={resetKey}>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] ${bg || 'bg-transparent'} transition-all duration-300`}>
          <div className={`w-4 h-4 flex items-center justify-center ${color} drop-shadow-sm`}>
            <IconComponent className="w-full h-full" />
          </div>
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[15px] font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>{toKuDigits(value || 0)}</span>
            <span className={`text-[7px] font-black uppercase mt-0.5 ${isDark ? color : 'text-[#CD7F32]'} opacity-60`}>{currencyName}</span>
          </div>
        </div>
      </CurrencyDecrementEffect>
    );
  };

  const InventoryStat = ({ value, icon, color, bg, isDark = true }) => {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-[10px] ${bg || 'bg-white/5'} border border-white/5`}>
        <span className={`material-symbols-outlined text-[18px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <span className={`text-[14px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{toKuDigits(value || 0)}</span>
      </div>
    );
  };

export default function TopAppBar({ 
  fils = 0, 
  derhem = 0,
  dinar = 0,
  magnetCount = 0,
  hintCount = 0,
  skipCount = 0,
  level, 
  onOpenSettings, 
  currentView, 
  onForfeit,
  category = 'گشتی',
  notificationCount = 0,
  notifications = [],
  onNotificationAction,
  gameMode = 'classic',
  onPlaySound,
  onDailyRewardClick,
  onOpenHowToPlay,
  isDailyAvailable = false,
  isDark = true
}) {
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const isPlaying = currentView === 'game';
  const showStats = ['lobby', 'store', 'leaderboard', 'stats', 'dictionary'].includes(currentView);
  const isClassic = gameMode === 'classic';

  return (
    <header 
      className={`relative top-0 w-full z-100 ${isPlaying ? (isDark ? 'bg-[#020617]' : 'bg-[#f5f5f4]') : 'bg-[#0a0f1b]'} border-b ${isPlaying ? (isDark ? 'border-white/5' : 'border-slate-200') : 'border-white/5'} pt-[env(safe-area-inset-top,0px)] transition-all duration-500 overflow-visible`} 
      dir="ltr"
    >
      <div className="flex h-16 items-center justify-between px-6 sm:px-12 w-full mx-auto relative gap-4">
      
        {/* Left Section: Close (X) or Settings / Daily Reward */}
        <div className="flex items-center justify-start flex-1">
          {isPlaying ? (
            <div className="flex items-center gap-1">
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
              
              <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                onClick={() => { triggerHaptic(10); onOpenHowToPlay(gameMode); }}
                className={`w-12 h-12 flex items-center justify-center ${isDark ? 'text-white/40' : 'text-slate-400'} hover:text-primary transition-all`}
              >
                <span className="material-symbols-outlined text-[28px] font-black">help</span>
              </motion.button>
            </div>
          ) : (
            currentView === 'lobby' ? (
              <div className="flex items-center gap-1">
                <motion.button
                  key="daily-reward-btn"
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: 0,
                    rotate: isDailyAvailable ? [-2, 2, -2, 2, 0] : 0,
                  }}
                  whileHover={isDailyAvailable ? { scale: 1.1 } : {}}
                  whileTap={isDailyAvailable ? { scale: 0.9 } : {}}
                  transition={{
                    rotate: isDailyAvailable ? { repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 3 } : { duration: 0.2 },
                    type: "spring", stiffness: 400, damping: 17
                  }}
                  onClick={() => { triggerHaptic(15); onDailyRewardClick?.(); }}
                  className={`relative w-14 h-14 flex items-center justify-center group ${!isDailyAvailable ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {/* Golden Aura Glow (Only when available) */}
                  {isDailyAvailable && (
                    <motion.div 
                      key="aura-active"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ 
                        scale: { repeat: Infinity, duration: 2 },
                        opacity: { repeat: Infinity, duration: 2 }
                      }}
                      className="absolute inset-2 bg-amber-400/40 rounded-full blur-xl"
                    />
                  )}
                  
                  {/* Colorful Ring (Always visible but brighter when available) */}
                  <div className={`absolute inset-1 rounded-md border-2 border-transparent bg-linear-to-tr from-amber-400 via-emerald-400 to-amber-500 [mask-image:linear-gradient(white,white)] [-webkit-mask-image:linear-gradient(white,white)] transition-all duration-500 ${isDailyAvailable ? 'opacity-80 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`} />

                  <div className={`relative z-10 w-11 h-11 rounded-md flex items-center justify-center transition-all duration-500 
                    ${isDailyAvailable 
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/50' 
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700/50 shadow-none grayscale'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl drop-shadow-md">redeem</span>
                  </div>
                  
                  {/* Notification Dot (Only when available) */}
                  {isDailyAvailable && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#0a0f1b] shadow-lg animate-pulse" />
                  )}
                </motion.button>
              </div>
            ) : (
              currentView !== 'store' && (
                <div className="flex items-center gap-1">
                  {(currentView === 'stats' || currentView === 'lobby' || currentView === 'leaderboard') && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => { triggerHaptic(10); onOpenSettings(); }}
                      className="w-12 h-12 flex items-center justify-center text-[#10b981] transition-all"
                    >
                      <span className="material-symbols-outlined text-[32px] font-black">settings</span>
                    </motion.button>
                  )}
                </div>
              )
            )
          )}
        </div>

        {/* Right Section: In-Game Info (Mode Specific) OR Global Stats + Notification */}
        <div className="flex items-center justify-end gap-3 flex-1 relative">
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <CurrencyStat key="ingame-fils" value={fils} Icon={FilsIcon} color="text-[#facc15]" resetKey={currentView} isDark={isDark} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Helpers Group (Lobby/Store/Leaderboard) */}
              {(currentView === 'store' || currentView === 'lobby' || currentView === 'leaderboard') && (
                <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-xl border border-white/5">
                  <InventoryStat value={hintCount} icon="lightbulb" color="text-amber-500" bg="bg-transparent" isDark={isDark} />
                  <InventoryStat value={magnetCount} icon="auto_fix_high" color="text-purple-400" bg="bg-transparent" isDark={isDark} />
                  <InventoryStat value={skipCount} icon="fast_forward" color="text-blue-400" bg="bg-transparent" isDark={isDark} />
                </div>
              )}

              {/* Currencies Group */}
              <div className="flex items-center gap-1">
                {(currentView === 'store' || currentView === 'leaderboard') && (
                  <>
                    <CurrencyStat key="store-dinar" value={dinar} Icon={DinarIcon} color="text-yellow-400" currency="dinar" bg="bg-black/20" resetKey={currentView} isDark={isDark} />
                    <CurrencyStat key="store-derhem" value={derhem} Icon={DerhemIcon} color="text-slate-300" currency="derhem" bg="bg-black/20" resetKey={currentView} isDark={isDark} />
                  </>
                )}
                {(currentView === 'store' || currentView === 'leaderboard' || currentView === 'stats' || currentView === 'dictionary') && (
                  <CurrencyStat key="store-fils" value={fils} Icon={FilsIcon} color="text-[#facc15]" currency="fils" bg="bg-black/20" resetKey={currentView} isDark={isDark} />
                )}
              </div>

              {/* Notification Button (Lobby Only) */}
              {currentView === 'lobby' && (
                <div className="relative ml-2">
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
                    onClick={() => { triggerHaptic(10); if (onPlaySound) onPlaySound(); setIsNotifsOpen(!isNotifsOpen); }}
                    className={`w-14 h-14 flex items-center justify-center transition-all relative ${isNotifsOpen || notificationCount > 0 ? 'text-[#10b981]' : 'text-[#10b981]/60'}`}
                  >
                    <span className="material-symbols-outlined text-[48px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
                    {notificationCount > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-[#0a0f1b] shadow-lg flex items-center justify-center shadow-lg pointer-events-none"
                      >
                        <span className="text-[11px] font-black text-white leading-none">{toKuDigits(notificationCount)}</span>
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
              
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
