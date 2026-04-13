import fs from 'fs';
const path = './src/data/wordList.js';

try {
  let content = fs.readFileSync(path, 'utf8');
  
  // Remove BOM if it exists (\uFEFF)
  if (content.charCodeAt(0) === 0xFEFF) {
    console.log("BOM detected, removing...");
    content = content.slice(1);
  }
  
  // Normalize Kurdish characters: Arabic Kaf -> Kurdish Keheh, Arabic Ya -> Kurdish Ya
  // WordList audit
  content = content.replace(/\u0643/g, '\u06A9'); // Kaf -> Keheh
  content = content.replace(/\u064A/g, '\u06CC'); // Arabic Ya (with dots) -> Kurdish Ya (no dots below in some fonts, but U+06CC is standard)
  content = content.replace(/\u0649/g, '\u06CC'); // Alif Maksura -> Kurdish Ya
  
  fs.writeFileSync(path, content, 'utf8');
  console.log("Sanitization complete.");
} catch (err) {
  console.error("Error sanitizing file:", err);
}
