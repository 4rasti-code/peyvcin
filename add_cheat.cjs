const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

if (!c.includes('import { supabase }')) {
  c = c.replace(`import { getCroppedImg }`, `import { supabase } from '../supabaseClient';\nimport { getCroppedImg }`);
}

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
         if (!error) alert('✅ ئامارەکان زیادکران بۆ وەرگرتنی مەدالیاکان! تکایە لە پڕۆفایل بچۆ دەرەوە و بگەڕێوە بۆ ئەوەی تازە ببێتەوە.');
      } catch (e) { console.error(e); }
   };
`;

if (!c.includes('unlockAllAchievements')) {
  c = c.replace(`const handleClaimMedal = async`, functionToAdd + `\n   const handleClaimMedal = async`);
}

// Add the button
const targetHtml = `<span className="px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase bg-mono-900 border border-slate-700/50 rounded-full py-1.5 shadow-sm shadow-black/50 relative text-center whitespace-nowrap">دەستکەفتێن تە</span>`;
const newHtml = `<span className="px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase bg-mono-900 border border-slate-700/50 rounded-full py-1.5 shadow-sm shadow-black/50 relative text-center whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors" onClick={unlockAllAchievements} title="تایبەت بە تاقیکردنەوە: کلیک بکە بۆ تەواوکردنی مەرجەکان">دەستکەفتێن تە 🔓</span>`;

c = c.replace(targetHtml, newHtml);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Added secret unlock button!');
