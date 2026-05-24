const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('List.js') || f === 'humanNamesList.js' || f === 'countryWordsList.js');

let sql = `-- Peyvok FULL Vocabulary Synchronization Script
-- This script contains ALL words from the local JS data files.
-- Supports multi-category words using (word, category) unique constraint.

`;

const categoryMap = {
  "verbsList.js": "کار (چاوگ)",
  "adjectivesList.js": "وەسف (هەڤالناڤ)",
  "humanNamesList.js": "ناڤێ مرۆڤان",
  "cityList.js": "باژێڕ",
  "animalsList.js": "گیانەوەر",
  "householdList.js": "کەلوپەل",
  "clothingList.js": "جلوبەرگ",
  "bodyPartsList.js": "ئەندامێ لەشی",
  "timeList.js": "دەم",
  "jobsList.js": "پیشە",
  "foodList.js": "خوارن",
  "natureList.js": "سرۆشت",
  "feelingsList.js": "هەست",
  "familyList.js": "خێزان",
  "countryWordsList.js": "وەلات",
  "sportsList.js": "وەرزش",
  "placesList.js": "جهـ",
  "fruitList.js": "میوە",
  "vegetablesList.js": "زەرزەوات",
  "mamakList.js": "مامک"
};

const processedWords = new Set();
let totalEntries = 0;

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const regex = /\{\s*"word":\s*"([^"]+)",\s*"hint":\s*"([^"]+)",\s*"category":\s*"([^"]+)"\s*\}/g;
  let match;
  const words = [];
  
  const officialCategory = categoryMap[file];
  
  while ((match = regex.exec(content)) !== null) {
    const word = match[1].trim();
    const hint = match[2].trim();
    const category = officialCategory || match[3].trim();
    
    // Even with the new constraint, we should avoid duplicates WITHIN the same file/category
    const key = `${word}|${category}`;
    if (!processedWords.has(key)) {
      words.push({ word, hint, category });
      processedWords.add(key);
      totalEntries++;
    }
  }
  
  if (words.length > 0) {
    sql += `-- Category: ${words[0].category} (${words.length} words)\n`;
    sql += `INSERT INTO public.words (word, hint, category) VALUES\n`;
    
    const values = words.map(w => {
      const escapedWord = w.word.replace(/'/g, "''");
      const escapedHint = w.hint.replace(/'/g, "''");
      const escapedCategory = w.category.replace(/'/g, "''");
      return `('${escapedWord}', '${escapedHint}', '${escapedCategory}')`;
    }).join(',\n');
    
    sql += values + '\n';
    // Now we use (word, category) as the conflict target
    sql += `ON CONFLICT (word, category) DO UPDATE SET hint = EXCLUDED.hint;\n\n`;
  }
});

fs.writeFileSync(path.join(__dirname, '../insert_all_words_grouped.sql'), sql);
console.log(`SQL file generated successfully with ${totalEntries} entries.`);
