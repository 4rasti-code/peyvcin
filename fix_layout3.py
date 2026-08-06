import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will rewrite the entire block from {/* Main 3-Column Layout */} down to <AnimatePresence>

new_layout = '''        {/* Main Layout: Absolute Flanking Icons & Centered Cards */}
        <div className="relative z-10 w-full mt-4 mb-4">
          
          {/* Left Column (Icons) - Absolute Positioned */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 z-20">
            
            {/* Lucky Wheel */}
            <Motion.button
              id="nav-lucky-wheel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                playDailyOpenSfx();
                setShowLuckyWheel(true);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer relative"
            >
              <div className="relative flex items-center justify-center w-10 h-10">
                <LuckyWheelIcon isIdleAnimated={isLuckyWheelAvailable} className={w-9 h-9 } />
                {!isLuckyWheelAvailable && <CooldownTimerOverlay targetDate={profileData?.last_spin_date} />}
              </div>
              <span className="text-[9px] font-black font-heading text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">چەرخ</span>
            </Motion.button>

            {/* Daily Tasks */}
            <Motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                onDailyRewardClick?.();
              }}
              className="flex flex-col items-center gap-1 cursor-pointer relative"
            >
              <div className="relative flex items-center justify-center w-10 h-10">
                <ClipboardIcon className={w-9 h-9 } />
                {!isDailyAvailable && <CooldownTimerOverlay targetDate={lastRewardClaimedAt} isMidnightReset={true} />}
              </div>
              <span className="text-[9px] font-black font-heading text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">ئەرک</span>
            </Motion.button>

            {/* Tutorial */}
            <Motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(10); if(onOpenHowToPlay) onOpenHowToPlay(); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-b from-indigo-400 to-indigo-600 border border-white/20 shadow-md flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px] drop-shadow-sm">menu_book</span>
              </div>
              <span className="text-[9px] font-black font-heading text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">فێرکاری</span>
            </Motion.button>

          </div>

          {/* Right Column (Icons) - Absolute Positioned */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 z-20">
            
            {/* Mystery Box */}
            <Motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                playDailyOpenSfx();
                setShowMysteryBox(true);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer relative"
            >
              <div className="relative flex items-center justify-center w-10 h-10">
                <MysteryBoxIcon isIdleAnimated={isMysteryBoxAvailable} className={w-10 h-10 } />
                {!isMysteryBoxAvailable && <CooldownTimerOverlay targetDate={profileData?.last_mystery_box_date} />}
              </div>
              <span className="text-[9px] font-black font-heading text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">خەڵات</span>
            </Motion.button>

            {/* Download */}
            <Motion.button
              id="btn-download-game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(10); setIsInstallModalOpen(true); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-b from-sky-400 to-sky-600 border border-white/20 shadow-md flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px] drop-shadow-sm">download</span>
              </div>
              <span className="text-[9px] font-black font-heading text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">داگرتن</span>
            </Motion.button>

            {/* Report */}
            <Motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(10); setIsReportModalOpen(true); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-linear-to-b from-amber-400 to-amber-600 border border-white/20 shadow-md flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px] drop-shadow-sm">campaign</span>
              </div>
              <span className="text-[9px] font-black font-heading text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">پێشنیار</span>
            </Motion.button>

          </div>

          {/* Middle Column (Cards) - Restored to Original Full Size */}
          <div className="w-full max-w-sm mx-auto px-8 sm:px-12 relative z-10">'''

# I will replace from {/* Main 3-Column Layout */} up to <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
start_marker = '        {/* Main 3-Column Layout */}'
end_marker = '            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">'

pattern = re.compile(re.escape(start_marker) + r'.*?' + re.escape(end_marker), re.DOTALL)
content = pattern.sub(new_layout + '\n              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">', content)

# I also need to fix the closing tags at the end of the cards grid.
# Previously it was:
#            </div>
#          </div>
#
#          {/* Right Column (Icons) */}
#          <div className="flex flex-col items-center gap-6 shrink-0 w-[60px]">
# ...
#          </div>
#        </div>
#      </div>
#      <AnimatePresence>

# I need to change that to:
#              </div>
#            </div>
#          </div>
#        </div>
#      <AnimatePresence>

end_fix_start = r'              <AdBanner />\n            </div>\n          </div>\n\n          \{/\* Right Column \(Icons\) \*/\}.*?        </div>\n      </div>\n\n      <AnimatePresence>'
end_fix_replacement = r'''              <AdBanner />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>'''

content = re.sub(end_fix_start, end_fix_replacement, content, flags=re.DOTALL)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Layout fixed perfectly!")
