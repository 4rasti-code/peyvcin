const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

c = c.replace(/<span onClick=\{unlockAllAchievements\}[^>]*>دەستکەفتێن تە 🔓<\/span>/g, '<span className="text-sm font-black text-mono-400 dark:text-mono-500 uppercase text-center whitespace-nowrap">دەستکەفتێن تە</span>');

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Fixed button using regex!');
