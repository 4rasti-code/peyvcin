import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

export default function BottomNav({ currentView, setCurrentView, onSettingsToggle, onTabClickSound }) {
  const tabs = [
    { id: 'stats', icon: 'person', label: 'بەرپەڕ' },
    { id: 'leaderboard', icon: 'workspace_premium', label: 'ڕێزبەندی' },
    { id: 'lobby', icon: 'grid_view', label: 'سەرەکی' },
    { id: 'store', icon: 'shopping_bag', label: 'بازاڕ' },
    { id: 'social_hub', icon: 'public', label: 'جڤاکی' }
  ];

  return (
    <LayoutGroup>
    <nav className="sticky bottom-0 w-full z-40 min-h-[80px] pb-[env(safe-area-inset-bottom)] pt-2 bg-slate-950 backdrop-blur-md border-t border-white/5 flex justify-evenly items-center px-2 leading-none" dir="rtl">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        const isSettings = tab.id === 'settings';

        return (
          <motion.button 
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { 
                // Don't trigger haptic when opening the store to prevent 'automatic' feeling vibration
                if (tab.id !== 'store') triggerHaptic(10);
                if (onTabClickSound) onTabClickSound();
                if (isSettings) onSettingsToggle(); 
                else setCurrentView(tab.id); 
            }}
            className="group flex flex-col items-center justify-center gap-1 transition-all py-3 px-2 rounded-[20px] relative w-[72px] select-none"
          >
            {/* The Slidable Background Pill */}
            {isActive && (
              <motion.div 
                 layoutId="active-nav-bg"
                 transition={{ type: "spring", stiffness: 450, damping: 35 }}
                 className="absolute inset-0 bg-white/5 border border-white/10 rounded-[20px] shadow-inner z-0" 
              />
            )}

            {/* The Slidable Glowing Line (Top) */}
            {isActive && (
              <motion.div 
                 layoutId="active-nav-line"
                 transition={{ type: "spring", stiffness: 450, damping: 35 }}
                 className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.8)] rounded-b-full z-10" 
              />
            )}

            {/* Icon Wrapper */}
            <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-[#facc15]' : 'text-slate-500 group-hover:text-white/80'}`}>
                <motion.span 
                  animate={{ 
                     y: isActive ? -2 : 0, 
                     scale: isActive ? 1.15 : 1 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="material-symbols-outlined text-[28px] font-bold" 
                  style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                >
                {tab.icon}
                </motion.span>
            </div>

            {/* Text Label */}
            <motion.span 
              animate={{ 
                 y: isActive ? -1 : 0, 
                 opacity: isActive ? 1 : 0.6
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`text-[10px] font-black font-rabar whitespace-nowrap uppercase tracking-wider relative z-10 transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]' : 'text-slate-600'}`}
            >
              {tab.label}
            </motion.span>
          </motion.button>
        );
      })}
    </nav>
    </LayoutGroup>
  );
}
