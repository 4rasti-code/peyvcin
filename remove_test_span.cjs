const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

c = c.replace(
  `<div className="w-full flex items-center justify-center mb-4">
                     <span onClick={unlockAllAchievements} className="cursor-pointer hover:text-white transition-colors text-sm font-black text-mono-400 dark:text-mono-500 uppercase text-center whitespace-nowrap" title="کلیک بکە بۆ کردنەوەی مەدالیاکان">دەستکەفتێن تە 🔓</span>
                  </div>`,
  `<div className="w-full flex items-center justify-center mb-4">
                     <span className="text-sm font-black text-mono-400 dark:text-mono-500 uppercase text-center whitespace-nowrap">دەستکەفتێن تە</span>
                  </div>`
);

c = c.replace(
  `const {
      currentXP, level, dailyStreak, setDailyStreak, lastStreakAt,
      userRank, progressPercent, solvedWords,
      updateInventory, addXP
   } = useGame();`,
  `const {
      currentXP, level, dailyStreak, lastStreakAt,
      userRank, progressPercent, solvedWords,
      updateInventory, addXP
   } = useGame();`
);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Fixed ProfileView!');
