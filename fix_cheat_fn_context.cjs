const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

c = c.replace(
  `const {
      currentXP, level, dailyStreak, lastStreakAt,
      userRank, progressPercent, solvedWords,
      updateInventory, addXP
   } = useGame();`,
  `const {
      currentXP, level, dailyStreak, setDailyStreak, lastStreakAt,
      userRank, progressPercent, solvedWords,
      updateInventory, addXP
   } = useGame();`
);

c = c.replace(
  `               xp: Math.max(500000, profileData?.xp || 0),
               daily_streak: Math.max(200, profileData?.daily_streak || 0),
               statistics: {
                  ...(profileData?.statistics || {}),
                  gamesPlayed: Math.max(100, profileData?.statistics?.gamesPlayed || 0),
                  kurdishWordsFound: Math.max(1000, profileData?.statistics?.kurdishWordsFound || 0),
                  helperWordsFound: Math.max(1000, profileData?.statistics?.helperWordsFound || 0)
               }`,
  `               statistics: {
                  ...(profileData?.statistics || {}),
                  gamesPlayed: Math.max(100, profileData?.statistics?.gamesPlayed || 0),
                  kurdishWordsFound: Math.max(1000, profileData?.statistics?.kurdishWordsFound || 0),
                  helperWordsFound: Math.max(1000, profileData?.statistics?.helperWordsFound || 0)
               }`
);

const oldAlert = `         if (!error) {
            alert('✅ ئامارەکان بۆ تاقیکردنەوە زیادکران! تکایە پەڕەکە (ڕیفرێش) بکە بۆ بینینی مەدالیاکان.');
         }`;

const newAlert = `         if (!error) {
            // Update context variables manually for instant unlock
            if (addXP) addXP(500000);
            if (setDailyStreak) setDailyStreak(200);
            alert('✅ ئامارەکان بۆ تاقیکردنەوە زیادکران! تکایە پەڕەکە (ڕیفرێش) بکە بۆ بینینی مەدالیاکان.');
         }`;

c = c.replace(oldAlert, newAlert);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Fixed cheat function to avoid 400 error and update Context correctly!');
