const fs = require('fs');

let c = fs.readFileSync('src/components/BottomNav.jsx', 'utf8');

c = c.replace(
  'hasSilentGlobal = false, pendingFriendsCount = 0 }',
  'hasSilentGlobal = false, pendingFriendsCount = 0, hasUnclaimedRewards = false }'
);

const redDotLogic = `
                {tab.id === 'profile' && pendingFriendsCount === 0 && hasUnclaimedRewards && (
                  <Motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-mono-white dark:border-mono-950 z-20 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                  />
                )}`;

c = c.replace(
  '{tab.id === \'social_hub\' && hasSilentGlobal && chatBadgeCount === 0 && (',
  redDotLogic + '\n\n                {tab.id === \'social_hub\' && hasSilentGlobal && chatBadgeCount === 0 && ('
);

fs.writeFileSync('src/components/BottomNav.jsx', c);
console.log('Added unclaimed rewards red dot to BottomNav.jsx');
