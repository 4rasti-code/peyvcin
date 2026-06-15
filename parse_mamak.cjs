const fs = require('fs');
const input = fs.readFileSync('C:/Users/RYZEN5950X/Desktop/مامک.txt', 'utf8');

// Parse text format
const textRegex = /مامک:\s*(.*?)\s*بەرسڤ:\s*([^\n\r٠-٩١-٩]+)/g;
const words = [];
const seenWords = new Set();
let match;

while ((match = textRegex.exec(input)) !== null) {
  const word = match[2].trim();
  if (!seenWords.has(word)) {
    words.push({
      word: word,
      hint: match[1].trim(),
      category: 'مامک'
    });
    seenWords.add(word);
  }
}

// Parse JSON format (e.g. { word: "سیبەر", hint: "ل ئاڤێ بدەی تەڕ نابیت...", category: "مامک" })
const jsonRegex = /{.*?word:\s*['"](.*?)['"].*?hint:\s*['"](.*?)['"].*?}/g;
let jsonMatch;
while ((jsonMatch = jsonRegex.exec(input)) !== null) {
  const word = jsonMatch[1].trim();
  if (!seenWords.has(word)) {
    words.push({
      word: word,
      hint: jsonMatch[2].trim(),
      category: 'مامک'
    });
    seenWords.add(word);
  }
}

const content = 'export const mamakWords = ' + JSON.stringify(words, null, 2) + ';\n';
fs.writeFileSync('src/data/mamakList.js', content, 'utf8');
console.log('Successfully combined and extracted', words.length, 'unique riddles!');
