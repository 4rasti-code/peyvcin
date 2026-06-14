import React, { useState } from 'react';
import { FilsIcon, DerhemIcon, DinarIcon, HintIcon, MagnetIcon, SkipIcon } from './CurrencyIcon';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import CurrencyDecrementEffect from './CurrencyDecrementEffect';
import NotificationsView from './NotificationsView';
import { toKuDigits } from '../utils/formatters';

const CurrencyStat = ({ value, Icon: _IconComponent, color, bg, currency = 'fils', resetKey, isDark = true }) => {
  const currencyName = currency === 'derhem' ? 'دەرهەم' : currency === 'dinar' ? 'دینار' : 'فلس';
  return (
    <CurrencyDecrementEffect value={value} currency={currency} resetKey={resetKey}>
      <div id={`topbar-${currency}`} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] ${bg || 'bg-transparent'} transition-all duration-300`}>
        <div className={`w-4 h-4 flex items-center justify-center ${color}`}>
          <_IconComponent className="w-full h-full" />
        </div>
        <div className="flex flex-col items-center leading-none">
          <span className={`text-[15px] font-black font-heading ${isDark ? 'text-white' : 'text-mono-900'}`}>{toKuDigits(value || 0)}</span>
          <span className={`text-[7px] font-black uppercase mt-0.5 ${isDark ? color : 'text-mono-600'} opacity-60`}>{currencyName}</span>
        </div>
      </div>
    </CurrencyDecrementEffect>
  );
};

const InventoryStat = ({ value, icon, Icon, color, bg, isDark = true, type }) => {
  return (
    <div id={`topbar-${type}`} className={`flex items-center gap-1.5 px-2 py-1 rounded-[10px] ${bg || 'bg-white/5'} border border-white/5`}>
      {Icon ? (
        <Icon className="w-5 h-5 drop-shadow-md" disabled={(value || 0) <= 0} />
      ) : (
        <span className={`material-symbols-outlined text-[18px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      )}
      <span className={`text-[14px] font-black ${isDark ? 'text-white' : 'text-mono-900'}`}>{toKuDigits(value || 0)}</span>
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
  _level,
  onOpenSettings,
  currentView,
  onForfeit,
  _category = 'گشتی',
  notificationCount = 0,
  notifications = [],
  onNotificationAction,
  gameMode = 'classic',
  onPlaySound,
  onDailyRewardClick,
  onOpenHowToPlay,
  onHint,
  onMagnet,
  onSkip,
  hintTaps = 0,
  hintLimit = 3,
  magnetUsedInRound = false,
  skipsUsedInRound = 0,
  skipLimit = 1,
  isDailyAvailable = false,
  isDark = true
}) {
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const isPlaying = currentView === 'game';
  const _showStats = ['lobby', 'store', 'leaderboard', 'stats', 'dictionary'].includes(currentView);
  const _isClassic = gameMode === 'classic';

  return (
    <header
      className={`relative top-0 w-full z-100 bg-mono-white dark:bg-black border-b border-mono-200 dark:border-white/5 pt-[env(safe-area-inset-top,0px)] transition-all duration-500 overflow-visible`}
      dir="ltr"
    >
      <div className="flex h-16 items-center justify-between px-6 sm:px-12 w-full mx-auto relative gap-4">

        {/* Left Section: Close (X) or Settings / Daily Reward */}
        <div className="flex items-center justify-start flex-1 relative">
          {isPlaying ? (
            <div className="flex items-center gap-1 relative">
              <Motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => { triggerHaptic(10); onOpenHowToPlay(gameMode); }}
                className="h-10 px-4 bg-[#8b5cf6] shadow-[0_4px_0_#6d28d9] hover:brightness-110 rounded-[6px] flex items-center justify-center gap-2 group transition-all border-none mb-1"
              >
                <span className="material-symbols-outlined text-white text-[20px] group-hover:scale-110 transition-transform">help</span>
                <span className="text-[13px] font-black font-rabar text-white uppercase mt-0.5 hidden xs:block">فێرکاری</span>
              </Motion.button>
            </div>
          ) : (
            currentView === 'lobby' ? (
              <div className="flex items-center gap-1">
                <Motion.button
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
                  <div className={`relative z-10 w-11 h-11 rounded-md flex items-center justify-center transition-all duration-500 
                    ${isDailyAvailable
                      ? 'bg-emerald-500 text-white border border-emerald-400/50'
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700/50 grayscale'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">redeem</span>
                  </div>

                  {/* Notification Dot (Only when available) */}
                  {isDailyAvailable && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-mono-white dark:border-mono-950" />
                  )}
                </Motion.button>
              </div>
            ) : (
              currentView !== 'store' && (
                <div className="flex items-center gap-1">
                  {(currentView === 'lobby' || currentView === 'leaderboard' || currentView === 'profile') && (
                    <Motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => { triggerHaptic(10); onOpenSettings(); }}
                      className={`flex items-center justify-center text-mono-600 dark:text-mono-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all ${currentView === 'profile' ? 'w-[60px] h-[60px] mt-[12px]' : 'w-12 h-12'}`}
                    >
                      <span className={`material-symbols-outlined font-black ${currentView === 'profile' ? 'text-[60px]' : 'text-[28px]'}`}>settings</span>
                    </Motion.button>
                  )}
                </div>
              )
            )
          )}
        </div>

        <div className="flex items-center justify-center flex-1">
          {isPlaying ? (
            <div className="hidden md:flex items-center gap-8 px-6 py-1 bg-mono-100/50 dark:bg-white/5 rounded-2xl border border-mono-200 dark:border-white/10 transition-all duration-500">
               {/* Skip */}
               <button 
                 onClick={() => { triggerHaptic(10); onSkip?.(); }}
                 disabled={skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0}
                 className="flex items-center gap-2 group transition-all active:scale-90 disabled:opacity-40"
               >
                 <SkipIcon 
                   disabled={skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0}
                   className={`w-6 h-6 transition-all ${skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0 ? 'opacity-50' : 'drop-shadow-md'}`} 
                 />
                 <span className="text-sm font-black text-mono-900 dark:text-mono-100">{toKuDigits(Math.max(0, (skipCount || 0) <= 0 ? 0 : skipLimit - skipsUsedInRound))}</span>
               </button>

               <div className="w-px h-4 bg-mono-200 dark:bg-white/10" />

               {/* Magnet */}
               <button 
                 onClick={() => { triggerHaptic(10); onMagnet?.(); }}
                 disabled={magnetUsedInRound || (magnetCount || 0) <= 0}
                 className="flex items-center gap-2 group transition-all active:scale-90 disabled:opacity-40"
               >
                 <MagnetIcon 
                   disabled={magnetUsedInRound || (magnetCount || 0) <= 0}
                   className={`w-6 h-6 transition-all ${magnetUsedInRound || (magnetCount || 0) <= 0 ? 'opacity-50' : 'drop-shadow-md'}`} 
                 />
                 <span className="text-sm font-black text-mono-900 dark:text-mono-100">{toKuDigits((magnetUsedInRound || (magnetCount || 0) <= 0) ? 0 : 1)}</span>
               </button>

               <div className="w-px h-4 bg-mono-200 dark:bg-white/10" />

               {/* Hint */}
               <button 
                 onClick={() => { triggerHaptic(10); onHint?.(); }}
                 disabled={hintTaps >= hintLimit || (hintCount || 0) <= 0}
                 className="flex items-center gap-2 group transition-all active:scale-90 disabled:opacity-40"
               >
                 <HintIcon 
                   disabled={hintTaps >= hintLimit || (hintCount || 0) <= 0}
                   className={`w-6 h-6 transition-all ${hintTaps >= hintLimit || (hintCount || 0) <= 0 ? 'opacity-50' : 'drop-shadow-md'}`} 
                 />
                 <span className="text-sm font-black text-mono-900 dark:text-mono-100">{toKuDigits(Math.max(0, (hintCount || 0) <= 0 ? 0 : hintLimit - hintTaps))}</span>
               </button>
            </div>
          ) : null}
        </div>

        {/* Right Section: In-Game Info (Mode Specific) OR Global Stats + Notification */}
        <div className="flex items-center justify-end gap-3 flex-1 relative">
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => { triggerHaptic(10); onForfeit(); }}
                  className="w-12 h-12 flex items-center justify-center transition-all text-[#ef4444]"
                >
                  <span className="material-symbols-outlined text-[32px] font-black">close</span>
                </Motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Helpers Group (Lobby/Store/Leaderboard) */}
              {(currentView === 'store' || currentView === 'lobby' || currentView === 'leaderboard') && (
                <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-xl border border-white/5">
                  <InventoryStat value={hintCount} Icon={HintIcon} bg="bg-transparent" isDark={isDark} type="hint" />
                  <InventoryStat value={magnetCount} Icon={MagnetIcon} bg="bg-transparent" isDark={isDark} type="magnet" />
                  <InventoryStat value={skipCount} Icon={SkipIcon} bg="bg-transparent" isDark={isDark} type="skip" />
                </div>
              )}

              {/* Currencies Group */}
              <div className="flex items-center gap-1">
                {(currentView === 'store' || currentView === 'leaderboard' || currentView === 'lobby') && (
                  <>
                    <CurrencyStat key="store-dinar" value={dinar} Icon={DinarIcon} color="text-yellow-400" currency="dinar" bg="bg-black/20" resetKey={currentView} isDark={isDark} />
                    <CurrencyStat key="store-derhem" value={derhem} Icon={DerhemIcon} color="text-slate-300" currency="derhem" bg="bg-black/20" resetKey={currentView} isDark={isDark} />
                    <CurrencyStat key="store-fils" value={fils} Icon={FilsIcon} color="text-[#facc15]" currency="fils" bg="bg-black/20" resetKey={currentView} isDark={isDark} />
                  </>
                )}
              </div>

              {/* Notification Button (Lobby Only) */}
              {currentView === 'lobby' && (
                <div className="relative ml-2">
                  <Motion.button
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
                    className={`w-14 h-14 flex items-center justify-center transition-all relative ${isNotifsOpen || notificationCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-mono-600/60 dark:text-mono-400/60 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                  >
                    <span className="material-symbols-outlined text-[48px] font-black" style={{ fontVariationSettings: notificationCount > 0 ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
                    {notificationCount > 0 && (
                      <Motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-mono-white dark:border-mono-950 flex items-center justify-center pointer-events-none"
                      >
                        <span className="text-[11px] font-black text-white leading-none">{toKuDigits(notificationCount)}</span>
                      </Motion.div>
                    )}
                  </Motion.button>

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

