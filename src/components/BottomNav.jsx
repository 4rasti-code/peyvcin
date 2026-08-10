import React from 'react';
import { motion as Motion } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { NavProfileIcon, NavLeaderboardIcon, NavLobbyIcon, NavStoreIcon, NavChatIcon } from './NavIcons';

export default function BottomNav({ currentView, setCurrentView, onSettingsToggle, onTabClickSound, chatBadgeCount = 0, hasSilentGlobal = false, pendingFriendsCount = 0, hasUnclaimedRewards = false, userAvatarUrl }) {
  const tabs = [
    { id: 'profile', Icon: NavProfileIcon, label: 'بەرپەڕ' },
    { id: 'leaderboard', Icon: NavLeaderboardIcon, label: 'ڕێزبەندی' },
    { id: 'lobby', Icon: NavLobbyIcon, label: 'سەرەکی' },
    { id: 'store', Icon: NavStoreIcon, label: 'بازاڕ' },
    { id: 'social_hub', Icon: NavChatIcon, label: 'چات' }
  ];
  const isChat = currentView === 'social_hub';

  return (
    <nav className={`mt-auto shrink-0 relative w-full z-40 pb-[env(safe-area-inset-bottom)] ${isChat ? 'bg-mono-100 dark:bg-mono-900' : 'bg-white/10 dark:bg-white/5'} backdrop-blur-2xl border-t border-mono-200/50 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]`} dir="rtl">
      <div className="h-24 flex justify-between items-end px-3 pt-3 pb-4 gap-2.5 w-full">
        {tabs.map((tab, index) => {
          const isActive = currentView === tab.id;
          const isSettings = tab.id === 'settings';
          const Icon = tab.Icon;

          return (
            <React.Fragment key={tab.id}>
              <button
                id={`nav-${tab.id}`}
                onClick={() => {
                  if (tab.id !== 'store') triggerHaptic(10);
                  if (onTabClickSound) onTabClickSound();
                  if (isSettings) onSettingsToggle();
                  else setCurrentView(tab.id);
                }}
                className={`group relative flex-1 flex flex-col items-center justify-center rounded-[14px] select-none outline-none focus:outline-none focus-visible:outline-none transition-all duration-200 ease-out ${isActive
                    ? '-translate-y-1'
                    : 'bg-transparent hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95'
                  }`}
                style={{
                  height: isActive ? '68px' : '62px'
                }}
              >
                <div className="relative flex justify-center items-center">
                  {/* Badges and Notifications */}
                  {tab.id === 'social_hub' && chatBadgeCount > 0 && (
                    <Motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-black font-sans rounded-full flex items-center justify-center border-2 border-mono-100 dark:border-mono-900 z-20 shadow-sm"
                    >
                      {chatBadgeCount > 99 ? '99+' : chatBadgeCount}
                    </Motion.div>
                  )}

                  {tab.id === 'profile' && pendingFriendsCount > 0 && (
                    <Motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-black font-sans rounded-full flex items-center justify-center border-2 border-mono-100 dark:border-mono-900 z-20 shadow-sm"
                    >
                      {pendingFriendsCount > 99 ? '99+' : pendingFriendsCount}
                    </Motion.div>
                  )}

                  {tab.id === 'profile' && pendingFriendsCount === 0 && hasUnclaimedRewards && (
                    <Motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute -top-0.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-mono-100 dark:border-mono-900 z-20 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                    />
                  )}

                  {tab.id === 'social_hub' && hasSilentGlobal && chatBadgeCount === 0 && (
                    <Motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute -top-0.5 -right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-mono-100 dark:border-mono-900 z-20 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    />
                  )}

                  <Icon
                    className={`w-10 h-10 ${isActive ? 'mb-1' : 'mb-0.5'} pointer-events-none`}
                    isActive={isActive}
                    avatarUrl={userAvatarUrl}
                  />
                </div>

                {/* Text Label */}
                <span
                  className={`text-[10px] font-black font-rabar whitespace-nowrap uppercase transition-colors duration-150 pointer-events-none ${isActive ? 'text-mono-900 dark:text-white dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : 'text-mono-400 dark:text-mono-500'
                    }`}
                >
                  {tab.label}
                </span>

              </button>

              {/* Vertical Divider */}
              {index < tabs.length - 1 && (
                <div className="w-0.5 h-8 bg-mono-300 dark:bg-mono-600 self-center rounded-full mb-3" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}