const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

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

c = c.replace(
  `const handleClaimMedal = (medal) => {`, 
  functionToAdd + `\n   const handleClaimMedal = (medal) => {`
);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Function REALLY added this time!');
