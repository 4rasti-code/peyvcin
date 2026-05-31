const fs = require('fs');
const words = JSON.parse(fs.readFileSync('missing_words.json', 'utf8'));

let content = 'پەیڤ | کەتەگۆری | پێناسەیا پێشنیارکری (لێرە دەستکاری بکە)\n';
content += '---|---|---\n';

for(const w of words) {
  let proposed = '';
  if (w.category === 'ناڤێ مرۆڤان') {
    proposed = 'ناڤەکێ کوردی یە بۆ کەسان، ب ڕامانا ...';
  } else if (w.category === 'گیانەوەر') {
    proposed = 'جۆرەکێ گیانەوەرانە ...';
  } else {
    proposed = '...';
  }
  content += `${w.word} | ${w.category} | ${proposed}\n`;
}

fs.writeFileSync('definitions_to_review.md', content);
console.log('Saved to definitions_to_review.md');
