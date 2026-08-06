import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Floating Menu
menu_old = r'''<div className="flex flex-col items-center z-10 w-full px-5 mt-2 mb-4">.*?<div className="w-px h-8 bg-mono-200 dark:bg-white/10 mx-1"></div>.*?<div className="relative flex items-center justify-center w-14\.5 h-14\.5">.*?<MysteryBoxIcon[^>]+>.*?</div>.*?</div>'''
menu_new = '''{/* Premium Floating Side Menu (Rewards) */}
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
          </div>'''

content = re.sub(menu_old, menu_new, content, flags=re.DOTALL)

# 2. Grid styling
content = content.replace('<div className="grid grid-cols-2 md:grid-cols-4 gap-4">', '<div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 sm:px-12">')

# 3. Multiplayer Card
content = content.replace('className="w-full relative h-24 rounded-md border-none mb-1 group bg-transparent"', 'className="w-full block relative h-20 rounded-md border-none group bg-transparent"')
content = content.replace('className="absolute inset-0 rounded-md translate-y-1.25"', 'className="absolute inset-0 rounded-md translate-y-[5px]"')
content = content.replace('<h3 className="text-3xl font-black font-heading text-white drop-shadow-md">ھەڤڕکی</h3>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">ھەڤڕکی</h3>')

# 4. Classic Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#ffcc00] shadow-[0_5px_0_#cc9900] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#ffcc00] shadow-[0_5px_0_#cc9900] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-amber-950">پەیڤۆک</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-amber-900/80 leading-none">کلاسیک</span>', '<h3 className="text-2xl font-black font-heading text-amber-950 drop-shadow-md">پەیڤۆک</h3>', content)

# 5. Mamak Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#22c55e] shadow-[0_5px_0_#16a34a] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#22c55e] shadow-[0_5px_0_#16a34a] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-white">مامک</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-white/50 leading-none">پەیدا بکە</span>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">مامک</h3>', content)

# 6. Hard Words Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#ef4444] shadow-[0_5px_0_#dc2626] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#ef4444] shadow-[0_5px_0_#dc2626] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-white">پەیڤێن دژوار</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-white/50 leading-none">بۆ شارەزایان</span>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">پەیڤێن دژوار</h3>', content)

# 7. Word Fever Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#0ea5e9] shadow-[0_5px_0_#0284c7] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#0ea5e9] shadow-[0_5px_0_#0284c7] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-white">تایا پەیڤان</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-white/50 leading-none">بەرھەڤ بە</span>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">تایا پەیڤان</h3>', content)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
