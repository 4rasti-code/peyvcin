const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

c = c.replace(
  `               statistics: {
                  ...(profileData?.statistics || {}),
                  gamesPlayed: Math.max(100, profileData?.statistics?.gamesPlayed || 0),
                  kurdishWordsFound: Math.max(1000, profileData?.statistics?.kurdishWordsFound || 0),
                  helperWordsFound: Math.max(1000, profileData?.statistics?.helperWordsFound || 0)
               }`,
  `               xp: Math.max(500000, profileData?.xp || 0),
               daily_streak: Math.max(200, profileData?.daily_streak || 0),
               statistics: {
                  ...(profileData?.statistics || {}),
                  gamesPlayed: Math.max(100, profileData?.statistics?.gamesPlayed || 0),
                  kurdishWordsFound: Math.max(1000, profileData?.statistics?.kurdishWordsFound || 0),
                  helperWordsFound: Math.max(1000, profileData?.statistics?.helperWordsFound || 0)
               }`
);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Fixed cheat function to include XP and daily_streak');
