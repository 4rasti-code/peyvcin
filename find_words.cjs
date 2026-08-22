const fs = require('fs');
const files = fs.readdirSync('d:/Peyvok_App/src/data').filter(f => f.endsWith('.js'));
let allWords = [];
for (const file of files) {
  const content = fs.readFileSync('d:/Peyvok_App/src/data/' + file, 'utf8');
  const regex = /"word":\s*"(.*?)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    allWords.push(match[1]);
  }
}
console.log('3-letter:', allWords.filter(w => w.length === 3).slice(0, 5));
console.log('4-letter:', allWords.filter(w => w.length === 4).slice(0, 5));
console.log('5-letter:', allWords.filter(w => w.length === 5).slice(0, 5));
console.log('6-letter:', allWords.filter(w => w.length === 6).slice(0, 5));
