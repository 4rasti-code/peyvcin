const fs = require('fs');
let txt = fs.readFileSync('src/data/humanNamesList.js', 'utf8');

// Replace all Arabic Kaf with Kurdish Ke
txt = txt.replace(/ك/g, 'ک');

// Words that have 'ه' as a consonant (keep 'ه' or 'ھ')
const keepH = [
  'هەڤال', 'هاڤین', 'هاوژین', 'شاهین', 'ڤەهێل', 'هۆشەنگ', 'هیوا', 'هونەر',
  'باهۆز', 'گەلهات', 'ئاهەنگ', 'شەهناز', 'ئاهین', 'هێڤیدار', 'ڕەهەند', 'بەهار'
];

txt = txt.replace(/"word":\s*"([^"]+)"/g, (match, p1) => {
  let word = p1;
  let chars = word.split('');
  
  // Manual overrides for specific words with consonant H in the middle
  if (word === 'بهار') return '\"word\": \"بەهار\"';
  if (word === 'شاهین') return '\"word\": \"شاهین\"';
  if (word === 'ڤەهێل') return '\"word\": \"ڤەهێل\"';
  if (word === 'باهۆز') return '\"word\": \"باهۆز\"';
  if (word === 'گەلهات') return '\"word\": \"گەلهات\"';
  if (word === 'ئاهەنگ') return '\"word\": \"ئاهەنگ\"';
  if (word === 'شەهناز') return '\"word\": \"شەهناز\"';
  if (word === 'ئاهین') return '\"word\": \"ئاهین\"';
  if (word === 'ڕەهەند') return '\"word\": \"ڕەهەند\"';
  if (word === 'جەوهەر') return '\"word\": \"جەوهەر\"';
  if (word === 'ئەزهەر') return '\"word\": \"ئەزهەر\"';
  
  for (let i = 1; i < chars.length; i++) {
    if (chars[i] === 'ه') chars[i] = 'ە';
  }
  return '\"word\": \"' + chars.join('') + '\"';
});

fs.writeFileSync('src/data/humanNamesList.js', txt);
