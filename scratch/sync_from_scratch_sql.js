import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlFilePath = path.join(__dirname, '../scratch/sync_all_words_to_supabase.sql');
const dataDir = path.join(__dirname, '../src/data');

const categoryMap = {
  "کار (چاوگ)": { file: "verbsList.js", variable: "verbsWords" },
  "وەسف (هەڤالناڤ)": { file: "adjectivesList.js", variable: "adjectivesWords" },
  "ناڤێ مرۆڤان": { file: "humanNamesList.js", variable: "humanNames" },
  "باژێڕ": { file: "cityList.js", variable: "cityWords" },
  "گیانەوەر": { file: "animalsList.js", variable: "animalsWords" },
  "کەلوپەل": { file: "householdList.js", variable: "householdWords" },
  "جلوبەرگ": { file: "clothingList.js", variable: "clothingWords" },
  "ئەندامێ لەشی": { file: "bodyPartsList.js", variable: "bodyPartsWords" },
  "دەم": { file: "timeList.js", variable: "timeWords" },
  "پیشە": { file: "jobsList.js", variable: "jobsWords" },
  "خوارن": { file: "foodList.js", variable: "foodWords" },
  "سرۆشت": { file: "natureList.js", variable: "natureWords" },
  "هەست": { file: "feelingsList.js", variable: "feelingsWords" },
  "خێزان": { file: "familyList.js", variable: "familyWords" },
  "وەلات": { file: "countryWordsList.js", variable: "countryWords" },
  "وەرزش": { file: "sportsList.js", variable: "sportsWords" },
  "جهـ": { file: "placesList.js", variable: "placesWords" },
  "میوە": { file: "fruitList.js", variable: "fruitWords" },
  "زەرزەوات": { file: "vegetablesList.js", variable: "vegetablesWords" },
  "مامک": { file: "mamakList.js", variable: "mamakWords" }
};

// Word-specific overrides for categories that don't match the strict whitelisted list
const wordOverrides = {
  "پیانو": "کەلوپەل",
  "گویز": "میوە",
  "بەلگ": "سرۆشت",
  "دەڤ": "ئەندامێ لەشی",
  "تزبی": "کەلوپەل",
  "زمان": "ئەندامێ لەشی",
  "هونار": "وەسف (هەڤالناڤ)",
  "مشک": "گیانەوەر",
  "سۆپە": "کەلوپەل",
  "گێزک": "کەلوپەل",
  "تەنیر": "کەلوپەل",
  "سێل": "کەلوپەل",
  "چیا": "سرۆشت",
  "دل": "ئەندامێ لەشی",
  "ماسی": "گیانەوەر",
  "قایش": "جلوبەرگ",
  "خەو": "هەست",
  "بەفر": "سرۆشت",
  "ناڤ": "وەسف (هەڤالناڤ)",
  "دەنگ": "هەست",
  "مەمک": "ئەندامێ لەشی",
  "ئەسمان": "سرۆشت",
  "مەنجەل": "کەلوپەل",
  "هاڤین": "دەم",
  "زارۆک": "خێزان",
  "ستێنگ": "کەلوپەل",
  "فانۆس": "کەلوپەل",
  "نەخشە": "کەلوپەل",
  "کولاڤ": "جلوبەرگ",
  "پێلاڤ": "جلوبەرگ",
  "زەبەش": "میوە",
  "سیبەر": "سرۆشت",
  "پیڤاز": "زەرزەوات",
  "مشار": "کەلوپەل",
  "تڤەنگ": "کەلوپەل",
  "دستار": "کەلوپەل",
  "تبل": "ئەندامێ لەشی",
  "گەنم": "سرۆشت",
  "تەشی": "کەلوپەل",
  "تەڵھە": "کەلوپەل",
  "مووخەل": "کەلوپەل",
  "تەڕازی": "کەلوپەل",
  "دووپشک": "گیانەوەر",
  "گویزان": "کەلوپەل",
  "کەزوان": "میوە",
  "سیتاڤک": "کەلوپەل",
  "کیسەلە": "گیانەوەر",
  "گۆڕستان": "جهـ",
  "دەمژمێر": "کەلوپەل",
  "کێڤریشک": "گیانەوەر",
  "دووگیانی": "وەسف (هەڤالناڤ)",
  "پانتەڕۆن": "جلوبەرگ",
  "قەشقەلانک": "گیانەوەر",
  "مێشھنگڤین": "گیانەوەر",
  "خەم": "هەست",
  "ژوژی": "گیانەوەر",
  "ستران": "کەلوپەل"
};

function parseAndSync() {
  console.log('Reading scratch/sync_all_words_to_supabase.sql...');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`File not found: ${sqlFilePath}`);
    return;
  }

  const content = fs.readFileSync(sqlFilePath, 'utf8');
  const lines = content.split('\n');
  
  const grouped = {};
  Object.keys(categoryMap).forEach(cat => {
    grouped[cat] = [];
  });

  // Regex to match: ('word', 'category', 'hint')
  const valueRegex = /^\s*\(\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*\)\s*,?\s*$/;

  let rawCount = 0;
  const uniqueWords = new Set();

  lines.forEach(line => {
    const match = line.match(valueRegex);
    if (match) {
      let word = match[1].replace(/''/g, "'").trim();
      let category = match[2].replace(/''/g, "'").trim();
      let hint = match[3].replace(/''/g, "'").trim();

      // Skip gloves word completely as requested by the user
      if (word === 'دەتگۆرک' || word === 'دەستگۆرک') {
        return;
      }

      // 1. Check word overrides for unmatched categories
      if (wordOverrides[word]) {
        category = wordOverrides[word];
      }

      // 2. Map standard categories
      let matchedCat = Object.keys(categoryMap).find(cat => cat.trim().toLowerCase() === category.toLowerCase());
      if (!matchedCat) {
        if (category === 'ڕەنگ') {
          matchedCat = 'وەسف (هەڤالناڤ)';
        } else if (category === 'کات') {
          matchedCat = 'دەم';
        } else if (category.includes('کار')) {
          matchedCat = 'کار (چاوگ)';
        } else if (category.includes('وەسف')) {
          matchedCat = 'وەسف (هەڤالناڤ)';
        } else {
          matchedCat = category;
        }
      }

      if (grouped[matchedCat]) {
        // Deduplicate using combination of word + category
        const uniqueKey = `${word.toLowerCase()}|${matchedCat.toLowerCase()}`;
        if (!uniqueWords.has(uniqueKey)) {
          uniqueWords.add(uniqueKey);
          grouped[matchedCat].push({ word, hint, category: matchedCat });
          rawCount++;
        }
      } else {
        console.warn(`Warning: Word "${word}" has unmatched category "${category}"`);
      }
    }
  });

  console.log(`Parsed and deduplicated ${rawCount} unique words from scratch SQL file.`);

  // Write to local files
  for (const [cat, wordEntries] of Object.entries(grouped)) {
    const mapping = categoryMap[cat];
    if (!mapping) continue;

    // Sort alphabetically by Kurdish word
    wordEntries.sort((a, b) => a.word.localeCompare(b.word, 'ku'));

    const filePath = path.join(dataDir, mapping.file);
    const fileContent = `export const ${mapping.variable} = ${JSON.stringify(wordEntries, null, 2)};\n`;

    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`Updated ${mapping.file} with ${wordEntries.length} words.`);
  }

  console.log('Local synchronization complete!');
}

parseAndSync();
