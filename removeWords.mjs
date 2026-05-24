import fs from 'fs';
let txt = fs.readFileSync('src/data/humanNamesList.js', 'utf8');
const wordsToRemove = ['ھەڤاڵ', 'ھونەر', 'ھەڵمەت', 'ھەندرین', 'ھەردی', 'ھاوژین', 'بەھرام'];

wordsToRemove.forEach(w => {
  const regex = new RegExp('.*"word": "' + w + '".*\\n?', 'g');
  txt = txt.replace(regex, '');
});

fs.writeFileSync('src/data/humanNamesList.js', txt);
