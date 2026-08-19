import React, { useState, useEffect } from 'react';
import { motion as Motion, LayoutGroup } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { NavProfileIcon, NavLeaderboardIcon, NavLobbyIcon, NavStoreIcon, NavChatIcon } from './NavIcons';

export default function BottomNav({ currentView, setCurrentView, onSettingsToggle, onTabClickSound, chatBadgeCount = 0, hasSilentGlobal = false, pendingFriendsCount = 0, hasUnclaimedRewards = false, userAvatarUrl }) {
  const [localActive, setLocalActive] = useState(currentView);

  useEffect(() => {
    setLocalActive(currentView);
  }, [currentView]);

  const tabs = [
    { id: 'profile', Icon: NavProfileIcon, label: 'بەرپەڕ' },
    { id: 'leaderboard', Icon: NavLeaderboardIcon, label: 'ڕێزبەندی' },
    { id: 'lobby', Icon: NavLobbyIcon, label: 'سەرەکی' },
    { id: 'store', Icon: NavStoreIcon, label: 'بازاڕ' },
    { id: 'social_hub', Icon: NavChatIcon, label: 'چات' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none" dir="rtl">
      {/* Background fill for safe area */}
      <div className="absolute inset-x-0 bottom-0 h-[env(safe-area-inset-bottom)] -z-10 pointer-events-auto" />

      <div className="relative h-28 flex items-end justify-center w-full max-w-150 mx-auto pointer-events-auto px-0.5">
        <LayoutGroup>
          {tabs.map((tab) => {
            const isActive = localActive === tab.id;
            const isSettings = tab.id === 'settings';
            const Icon = tab.Icon;

            return (
              <React.Fragment key={tab.id}>
                <Motion.button
                  layout
                  transition={{ type: "spring", bounce: 0.1, duration: 0.2 }}
                  id={`nav-${tab.id}`}
                  onClick={() => {
                    if (tab.id !== 'store') triggerHaptic(10);
                    if (onTabClickSound) onTabClickSound();
                    if (isSettings) onSettingsToggle();
                    else {
                      setLocalActive(tab.id);
                      setTimeout(() => {
                        React.startTransition(() => {
                          setCurrentView(tab.id);
                        });
                      }, 5);
                    }
                  }}
                  className={`group relative flex flex-col items-center justify-start select-none outline-none focus:outline-none focus-visible:outline-none overflow-hidden
                    ${isActive
                      ? 'flex-[1.4] h-27.5 bg-linear-to-b from-[#40bcf7] to-[#1a9bf0] shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2)] rounded-t-[14px] z-20'
                      : 'flex-1 h-24 bg-linear-to-b from-[#2573bd] to-[#155694] shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.2),inset_0_-4px_0_rgba(0,0,0,0.2)] hover:brightness-110 active:scale-95 rounded-t-[10px] z-10'
                    }`}
                >
                  <div className={`relative flex justify-center items-center w-full transition-all duration-300 ${isActive ? 'mt-4' : 'h-full'}`}>
                    {/* Badges and Notifications */}
                    {tab.id === 'social_hub' && chatBadgeCount > 0 && (
                      <Motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-black font-sans rounded-full flex items-center justify-center border-2 border-[#0a203e] z-30 shadow-md"
                      >
                        {chatBadgeCount > 99 ? '99+' : chatBadgeCount}
                      </Motion.div>
                    )}

                    {tab.id === 'profile' && pendingFriendsCount > 0 && (
                      <Motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1 min-w-5 h-5 px-1 bg-amber-500 text-white text-[10px] font-black font-sans rounded-full flex items-center justify-center border-2 border-[#0a203e] z-30 shadow-md"
                      >
                        {pendingFriendsCount > 99 ? '99+' : pendingFriendsCount}
                      </Motion.div>
                    )}

                    {tab.id === 'profile' && pendingFriendsCount === 0 && hasUnclaimedRewards && (
                      <Motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#0a203e] z-30 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      />
                    )}

                    {tab.id === 'social_hub' && hasSilentGlobal && chatBadgeCount === 0 && (
                      <Motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a203e] z-30 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      />
                    )}

                    {/* Spotlight Glow behind active icon */}
                    {isActive && (
                      <Motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#7ae8ff] opacity-60 rounded-full blur-[14px] z-0"
                      />
                    )}

                    <Icon
                      className={`w-12 h-12 pointer-events-none transition-transform duration-300 relative z-10 ${isActive ? 'scale-125 mb-1' : 'scale-90 opacity-80'}`}
                      isActive={isActive}
                      avatarUrl={userAvatarUrl}
                    />
                  </div>

                  {/* Text Label */}
                  {isActive && (
                    <Motion.span
                      initial={{ opacity: 0, y: 10, scale: 0.8, x: '-50%' }}
                      animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-6 left-1/2 text-[14px] sm:text-[15px] font-black font-rabar tracking-wide whitespace-nowrap uppercase pointer-events-none text-white drop-shadow-md"
                    >
                      {tab.label}
                    </Motion.span>
                  )}

                </Motion.button>
              </React.Fragment>
            );
          })}
        </LayoutGroup>
      </div>
    </nav>
  );
}