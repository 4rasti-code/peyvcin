import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root
const envPath = path.join(__dirname, '../.env');
const envData = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envData.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim()?.replace(/['"\r]/g, '');
const supabaseAnonKey = envData.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim()?.replace(/['"\r]/g, '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials not found in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function pullWords() {
  console.log('Fetching words from Supabase using official client...');
  try {
    let allWords = [];
    let page = 0;
    const pageSize = 1000;
    let keepFetching = true;

    while (keepFetching) {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        keepFetching = false;
      } else {
        allWords = allWords.concat(data);
        console.log(`Fetched page ${page + 1} (${data.length} entries).`);
        if (data.length < pageSize) {
          keepFetching = false;
        } else {
          page++;
        }
      }
    }

    console.log(`Successfully fetched ${allWords.length} words from Supabase.`);

    // Group words by their category
    const grouped = {};
    Object.keys(categoryMap).forEach(cat => {
      grouped[cat] = [];
    });

    allWords.forEach(w => {
      if (!w.word) return;
      
      const cleaned = {
        word: w.word.trim(),
        hint: (w.hint || w.definition || '').trim(),
        category: (w.category || 'هەمەجۆر').trim()
      };
      
      // Normalize category names
      let matchedCat = Object.keys(categoryMap).find(cat => cat.trim().toLowerCase() === cleaned.category.toLowerCase());
      if (!matchedCat) {
        if (cleaned.category.includes('کار')) matchedCat = 'کار (چاوگ)';
        else if (cleaned.category.includes('وەسف')) matchedCat = 'وەسف (هەڤالناڤ)';
        else matchedCat = cleaned.category;
      }

      if (grouped[matchedCat]) {
        grouped[matchedCat].push(cleaned);
      } else {
        console.warn(`Unknown category: ${cleaned.category} for word: ${cleaned.word}`);
      }
    });

    // Write back to local JS files
    const dataDir = path.join(__dirname, '../src/data');
    for (const [cat, wordEntries] of Object.entries(grouped)) {
      const mapping = categoryMap[cat];
      if (!mapping) continue;

      // Sort words alphabetically by Kurdish word
      wordEntries.sort((a, b) => a.word.localeCompare(b.word, 'ku'));

      const filePath = path.join(dataDir, mapping.file);
      const fileContent = `export const ${mapping.variable} = ${JSON.stringify(wordEntries, null, 2)};\n`;

      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`Updated ${mapping.file} with ${wordEntries.length} words.`);
    }

    console.log('Synchronization complete!');
  } catch (error) {
    console.error('Failed to sync words:', error.message || error);
  }
}

pullWords();
