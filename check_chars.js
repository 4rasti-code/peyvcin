import { wordList } from './src/data/wordList.js';

function checkWord(word) {
  console.log(`Word: ${word}`);
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    const hex = code.toString(16).toUpperCase().padStart(4, '0');
    console.log(`  ${word[i]} : U+${hex} (${code})`);
  }
}

console.log("Checking 'پشیک' from wordList:");
const pshik = wordList["ئاژەل"].find(w => w.word.includes("پشیک")).word;
checkWord(pshik);

console.log("\nChecking 'وو' from wordList (if any):");
// Find a word with 'uu'
const speedWords = wordList["Speed_Mode_Pool"];
const uuWord = speedWords.find(w => w.word.includes("وو"));
if (uuWord) checkWord(uuWord.word);
