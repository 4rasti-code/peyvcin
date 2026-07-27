import React from 'react';
import { motion as Motion, LayoutGroup } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

export default function BottomNav({ currentView, setCurrentView, onSettingsToggle, onTabClickSound, chatBadgeCount = 0, hasSilentGlobal = false, pendingFriendsCount = 0, hasUnclaimedRewards = false }) {
  const tabs = [
    { id: 'profile', icon: 'person', label: 'بەرپەڕ' },
    { id: 'leaderboard', icon: 'workspace_premium', label: 'ڕێزبەندی' },
    { id: 'lobby', icon: 'grid_view', label: 'سەرەکی' },
    { id: 'store', icon: 'shopping_bag', label: 'بازاڕ' },
    { id: 'social_hub', icon: 'chat', label: 'چات' }
  ];

  return (
    <LayoutGroup>
      {/* 🚨 THE FIX IS HERE: Reverted back to the stable 'sticky min-h-[80px]' layout from 2 months ago 🚨 */}
      <nav className="sticky bottom-0 w-full z-40 min-h-20 pb-[env(safe-area-inset-bottom)] pt-2 bg-mono-white dark:bg-black border-t border-mono-200 dark:border-white/5 flex justify-evenly items-center px-2 leading-none" dir="rtl">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const isSettings = tab.id === 'settings';

          return (
            <Motion.button
              key={tab.id}
              id={`nav-${tab.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (tab.id !== 'store') triggerHaptic(10);
                if (onTabClickSound) onTabClickSound();
                if (isSettings) onSettingsToggle();
                else setCurrentView(tab.id);
              }}
              className="group flex flex-col items-center justify-center gap-1 transition-all py-1.5 px-2 rounded-md relative w-18 select-none"
            >
              {/* The Slidable Background Pill */}
              {isActive && (
                <Motion.div
                  layoutId="active-nav-bg"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-mono-100 dark:bg-white/5 border border-mono-200 dark:border-white/10 rounded-md shadow-inner z-0"
                />
              )}

              {/* The Slidable Glowing Line (Top) */}
              {isActive && (
                <Motion.div
                  layoutId="active-nav-line"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black dark:bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] rounded-none z-10"
                />
              )}

              {/* Icon Wrapper */}
              <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-black dark:text-white' : 'text-mono-500 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white/80'}`}>

                {/* Badges and Notifications (Preserved from your new code) */}
                {tab.id === 'social_hub' && chatBadgeCount > 0 && (
                  <Motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-black font-sans rounded-full flex items-center justify-center border-2 border-mono-white dark:border-black z-20 shadow-md"
                  >
                    {chatBadgeCount > 99 ? '99+' : chatBadgeCount}
                  </Motion.div>
                )}

                {tab.id === 'profile' && pendingFriendsCount > 0 && (
                  <Motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-black font-sans rounded-full flex items-center justify-center border-2 border-mono-white dark:border-black z-20 shadow-md"
                  >
                    {pendingFriendsCount > 99 ? '99+' : pendingFriendsCount}
                  </Motion.div>
                )}

                {tab.id === 'profile' && pendingFriendsCount === 0 && hasUnclaimedRewards && (
                  <Motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-mono-white dark:border-mono-950 z-20 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                  />
                )}

                {tab.id === 'social_hub' && hasSilentGlobal && chatBadgeCount === 0 && (
                  <Motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-mono-white dark:border-mono-950 z-20 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  />
                )}

                <Motion.span
                  animate={{
                    y: isActive ? -2 : 0,
                    scale: isActive ? 1.15 : 1
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="material-symbols-outlined text-[28px] font-bold"
                  style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                >
                  {tab.icon}
                </Motion.span>
              </div>

              {/* Text Label */}
              <Motion.span
                animate={{
                  y: isActive ? -1 : 0,
                  opacity: isActive ? 1 : 0.6
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`text-[10px] font-black font-rabar whitespace-nowrap uppercase relative z-10 transition-colors duration-300 ${isActive ? 'text-mono-900 dark:text-white' : 'text-mono-500'}`}
              >
                {tab.label}
              </Motion.span>
            </Motion.button>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}