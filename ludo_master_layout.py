import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the start and end of the block to replace
start_marker = '{/* Action Buttons Row */}'
end_marker = '        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 sm:px-12">'

replacement = '''{/* Flanking Action & Reward Icons (Ludo Master Style) */}
        <div className="flex justify-between items-start w-full px-4 mb-6 mt-2 relative z-10">
          
          {/* Left Column */}
          <div className="flex flex-col items-center gap-4">
            
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
              <div className="relative flex items-center justify-center w-14 h-14">
                <LuckyWheelIcon isIdleAnimated={isLuckyWheelAvailable} className={w-13 h-13 } />
                {!isLuckyWheelAvailable && <CooldownTimerOverlay targetDate={profileData?.last_spin_date} />}
              </div>
              <span className="text-[11px] font-black font-heading text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">چەرخ</span>
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
              <div className="relative flex items-center justify-center w-14 h-14">
                <ClipboardIcon className={w-12 h-12 } />
                {!isDailyAvailable && <CooldownTimerOverlay targetDate={lastRewardClaimedAt} isMidnightReset={true} />}
              </div>
              <span className="text-[11px] font-black font-heading text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">ئەرک</span>
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
              <div className="w-12 h-12 rounded-full bg-linear-to-b from-indigo-400 to-indigo-600 border-2 border-white/20 shadow-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl drop-shadow-md">menu_book</span>
              </div>
              <span className="text-[11px] font-black font-heading text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">فێرکاری</span>
            </Motion.button>

          </div>

          {/* Right Column */}
          <div className="flex flex-col items-center gap-4">
            
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
              <div className="relative flex items-center justify-center w-14 h-14">
                <MysteryBoxIcon isIdleAnimated={isMysteryBoxAvailable} className={w-14 h-14 } />
                {!isMysteryBoxAvailable && <CooldownTimerOverlay targetDate={profileData?.last_mystery_box_date} />}
              </div>
              <span className="text-[11px] font-black font-heading text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">خەڵات</span>
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
              <div className="w-12 h-12 rounded-full bg-linear-to-b from-sky-400 to-sky-600 border-2 border-white/20 shadow-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl drop-shadow-md">download</span>
              </div>
              <span className="text-[11px] font-black font-heading text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">داگرتن</span>
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
              <div className="w-12 h-12 rounded-full bg-linear-to-b from-amber-400 to-amber-600 border-2 border-white/20 shadow-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl drop-shadow-md">campaign</span>
              </div>
              <span className="text-[11px] font-black font-heading text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">پێشنیار</span>
            </Motion.button>

          </div>

        </div>

''' + end_marker

# Use regex to replace everything between the start and end marker
pattern = re.compile(re.escape(start_marker) + r'.*?' + re.escape(end_marker), re.DOTALL)
content = pattern.sub(replacement, content)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
