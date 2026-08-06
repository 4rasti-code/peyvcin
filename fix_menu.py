import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if '<div className="flex items-center justify-center w-full mt-2 mb-2">' in line:
        skip = True
        new_lines.append('''          {/* Premium Floating Side Menu (Rewards) */}
          <div className="fixed left-2 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-black/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                onDailyRewardClick?.();
              }}
              className="relative flex items-center justify-center p-1 cursor-pointer transition-transform hover:scale-110"
            >
              <div className="relative flex items-center justify-center w-12 h-12">
                <ClipboardIcon className={w-11 h-11 } />
                {!isDailyAvailable && <CooldownTimerOverlay targetDate={lastRewardClaimedAt} isMidnightReset={true} />}
              </div>
            </button>
            
            <div className="w-8 h-px bg-mono-200 dark:bg-white/10 my-1 rounded-full"></div>
            
            <button
              id="nav-lucky-wheel"
              onClick={(e) => {
                e.stopPropagation();
                setShowLuckyWheel(true);
              }}
              className="relative flex items-center justify-center p-1 cursor-pointer transition-transform hover:scale-110"
            >
              <div className="relative flex items-center justify-center w-12 h-12">
                <LuckyWheelIcon isIdleAnimated={isLuckyWheelAvailable} className={w-11 h-11 } />
                {!isLuckyWheelAvailable && <CooldownTimerOverlay targetDate={profileData?.last_spin_date} />}
              </div>
            </button>
            
            <div className="w-8 h-px bg-mono-200 dark:bg-white/10 my-1 rounded-full"></div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                setShowMysteryBox(true);
              }}
              className="relative flex items-center justify-center p-1 cursor-pointer transition-transform hover:scale-110"
            >
              <div className="relative flex items-center justify-center w-12 h-12">
                <MysteryBoxIcon isIdleAnimated={isMysteryBoxAvailable} className={w-12 h-12 } />
                {!isMysteryBoxAvailable && <CooldownTimerOverlay targetDate={profileData?.last_mystery_box_date} />}
              </div>
            </button>
          </div>
''')
        continue
    
    if skip and '</div>' in line and '</div>' in lines[i-1] and '</div>' in lines[i-2] and '<div className="grid' in lines[i+2]:
        skip = False
        continue
    
    if not skip:
        new_lines.append(line)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Done floating menu replacement!')
