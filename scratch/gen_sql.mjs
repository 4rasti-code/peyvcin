import { allWordsMaster } from '../src/data/wordList.js';
import { mamakWords } from '../src/data/mamakList.js';
import fs from 'fs';

// Combine master pool and riddles (mamak)
const combinedWords = [
  ...allWordsMaster,
  ...mamakWords
];

// Deduplicate words based on the combination of word + category
const uniqueWordsMap = new Map();
combinedWords.forEach(w => {
  if (w && w.word && w.category) {
    const key = `${w.word.trim().toLowerCase()}|${w.category.trim().toLowerCase()}`;
    if (!uniqueWordsMap.has(key)) {
      uniqueWordsMap.set(key, w);
    } else {
      const existing = uniqueWordsMap.get(key);
      if (w.hint && w.hint.length > (existing.hint || '').length) {
        uniqueWordsMap.set(key, w);
      }
    }
  }
});

const wordList = Array.from(uniqueWordsMap.values());

let sql = `-- Sync all words from local files to Supabase (Dynamic Synchronization Script)
-- Total Unique Words: ${wordList.length}
-- Created At: ${new Date().toISOString()}

-- 1. Clear existing words to prevent duplicates and handle category changes
TRUNCATE TABLE words;

-- 2. Insert all words
INSERT INTO words (word, hint, category)
VALUES
`;

const values = wordList.map(w => {
  const word = w.word.replace(/'/g, "''").trim();
  const hint = (w.hint || '').replace(/'/g, "''").trim();
  const category = (w.category || 'هەمەجۆر').replace(/'/g, "''").trim();
  return `('${word}', '${hint}', '${category}')`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('./sync_all_words_to_supabase.sql', sql, 'utf8');
console.log('Successfully generated sync_all_words_to_supabase.sql');
console.log('Total words exported:', values.length);
