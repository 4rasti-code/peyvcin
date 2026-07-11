const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

// 1. Ensure supabase is imported
if (!c.includes("import { supabase } from '../supabaseClient';")) {
  c = c.replace(
    `import { getCroppedImg } from '../utils/imageUtils';`,
    `import { supabase } from '../supabaseClient';\nimport { getCroppedImg } from '../utils/imageUtils';`
  );
}

// 2. Add unlock function if not there
const functionToAdd = `
   const unlockAllAchievements = async () => {
      try {
         const { error } = await supabase
            .from('profiles')
            .update({
               statistics: {
                  ...(profileData?.statistics || {}),
                  gamesPlayed: Math.max(100, profileData?.statistics?.gamesPlayed || 0),
                  kurdishWordsFound: Math.max(1000, profileData?.statistics?.kurdishWordsFound || 0),
                  helperWordsFound: Math.max(1000, profileData?.statistics?.helperWordsFound || 0)
               }
            })
            .eq('id', user?.id);
         if (!error) {
            alert('✅ ئامارەکان بۆ تاقیکردنەوە زیادکران! تکایە پەڕەکە (ڕیفرێش) بکە بۆ بینینی مەدالیاکان.');
         }
      } catch (e) { console.error(e); }
   };
`;

if (!c.includes('unlockAllAchievements')) {
  c = c.replace(
    `const handleClaimMedal = async (medal) => {`, 
    functionToAdd + `\n   const handleClaimMedal = async (medal) => {`
  );
}

// 3. Replace the span to make it a clickable button
c = c.replace(
  `<span className="text-sm font-black text-mono-400 dark:text-mono-500 uppercase text-center whitespace-nowrap">دەستکەفتێن تە</span>`,
  `<span onClick={unlockAllAchievements} className="cursor-pointer hover:text-white transition-colors text-sm font-black text-mono-400 dark:text-mono-500 uppercase text-center whitespace-nowrap" title="کلیک بکە بۆ کردنەوەی مەدالیاکان">دەستکەفتێن تە 🔓</span>`
);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Successfully injected the unlock cheat button!');
