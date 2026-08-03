import { verbsWords } from './verbsList.js';
import { adjectivesWords } from './adjectivesList.js';
import { humanNames } from './humanNamesList.js';
import { cityWords } from './cityList.js';
import { animalsWords } from './animalsList.js';
import { householdWords } from './householdList.js';
import { clothingWords } from './clothingList.js';
import { bodyPartsWords } from './bodyPartsList.js';
import { jobsWords } from './jobsList.js';
import { foodWords } from './foodList.js';
import { natureWords } from './natureList.js';
import { feelingsWords } from './feelingsList.js';
import { familyWords } from './familyList.js';
import { countryWords } from './countryWordsList.js';
import { sportsWords } from './sportsList.js';
import { placesWords } from './placesList.js';
import { mamakWords } from './mamakList.js';
import { fruitWords } from './fruitList.js';
import { vegetablesWords } from './vegetablesList.js';
import { timeWords } from './timeList.js';
import { generalWords } from './generalWordsList.js';
import { colorsWords } from './colorsList.js';

// --- Category Name to List Mapping ---
export const catMap = {
  "کار (چاوگ)": verbsWords,
  "وەسف (هەڤالناڤ)": adjectivesWords,
  "ناڤێ مرۆڤان": humanNames,
  "باژێڕ": cityWords,
  "گیانەوەر": animalsWords,
  "کەلوپەل": householdWords,
  "جلوبەرگ": clothingWords,
  "ئەندامێ لەشی": bodyPartsWords,
  "پیشە": jobsWords,
  "خوارن": foodWords,
  "سرۆشت": natureWords,
  "هەست": feelingsWords,
  "خێزان": familyWords,
  "وەلات": countryWords,
  "وەرزش": sportsWords,
  "جهـ": placesWords,
  "میوە": fruitWords,
  "زەرزەوات": vegetablesWords,
  "ڕەنگ": colorsWords,
  "دەم": timeWords
};

// --- Master Pool (Excluding Riddles/Mamak) ---
// Dynamically inject the "category" property into every word
export const allWordsMaster = Object.entries(catMap).flatMap(([catName, wordList]) =>
  wordList.map(w => ({ ...w, category: catName }))
);

// --- Specialized Export for Logic ---
export const officialWordList = {
  verbs: verbsWords,
  adjectives: adjectivesWords,
  names: humanNames,
  cities: cityWords,
  animals: animalsWords,
  household: householdWords,
  clothing: clothingWords,
  bodyParts: bodyPartsWords,
  time: timeWords,
  jobs: jobsWords,
  food: foodWords,
  nature: natureWords,
  feelings: feelingsWords,
  family: familyWords,
  countries: countryWords,
  sports: sportsWords,
  places: placesWords,
  fruit: fruitWords,
  vegetables: vegetablesWords,
  mamak: mamakWords,
  "پەیڤێن گشتی": generalWords
};

// --- Category Whitelist ---
export const OFFICIAL_CATEGORIES = [
  "دەم", "خێزان", "هەستێن دەروونی", "هەست", "پیشە", "ناڤێ مرۆڤان",
  "وەسف (هەڤالناڤ)", "کار (چاوگ)", "کەلوپەل", "گیانەوەر", "میوە",
  "زەرزەوات", "ڕەنگ", "وەلات", "باژێڕ", "ئەندامێ لەشی", "جلوبەرگ",
  "سرۆشت", "خوارن", "وەرزش", "جهـ", "مامک", "پەیڤێن گشتی"
];

export const categories = OFFICIAL_CATEGORIES;
export const gameWordLists = officialWordList;
export const allWordsWithCategories = allWordsMaster;


/**
 * Gets a random word based on the mode rules:
 * - classic: 2-5 letters
 * - hard_words: 6+ letters
 * - word_fever: exactly 5 letters
 * - secret_word: 2+ letters
 * - battle: exactly 5 letters
 * - mamak: category 'مامک', 2-15 letters
 */
export const getRandomWordFromCategory = (category, level, solvedWords = [], mode = 'classic') => {
  let pool = [];

  if (mode === 'mamak') {
    pool = mamakWords;
  } else if (category && category !== 'ھەموو' && category !== 'generalWordPool') {
    // Filter the master pool which now correctly contains the category property
    pool = allWordsMaster.filter(w => w.category === category);
    if (pool.length === 0) {
      pool = allWordsMaster;
    }
  } else {
    pool = allWordsMaster;
  }

  // Filter pool by mode rules (Letter Count)
  let filtered = pool.filter(w => {
    const len = w.word.length;
    if (mode === 'classic') return len >= 2 && len <= 5;
    if (mode === 'hard_words') return len >= 6;
    if (mode === 'word_fever') return len === 5;
    if (mode === 'battle') return len === 5;
    if (mode === 'mamak') return len >= 2 && len <= 15;
    return true;
  });

  // Exclude solved words if possible
  const unsolved = filtered.filter(w => !solvedWords.includes(w.word));
  const finalPool = unsolved.length > 0 ? unsolved : filtered;

  if (finalPool.length === 0) return null;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
};

/**
 * Gets a set of random words for multiplayer matches.
 * Defaults to 5 words of length 5.
 */
export const getUnifiedWords = (count = 5, length = 5) => {
  const fullPool = allWordsMaster.filter(w => w.word.length === length);
  
  // 1. Get recently used words from local storage
  let recentWords = [];
  try {
    const saved = localStorage.getItem('recentBattleWords');
    if (saved) recentWords = JSON.parse(saved);
  } catch (_e) {
    // ignore
  }

  // 2. Filter out recently used words
  let availablePool = fullPool.filter(w => !recentWords.includes(w.word));
  
  // 3. Reset if we don't have enough words left
  if (availablePool.length < count) {
    recentWords = [];
    availablePool = fullPool;
  }
  
  // 4. Shuffle and select
  const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, count);
  
  // 5. Update history
  recentWords = [...recentWords, ...selectedWords.map(w => w.word)];
  
  // 6. Keep memory limited to half the total pool size to ensure long rotation without exhausting the pool
  const maxLock = Math.max(10, Math.floor(fullPool.length / 1.5));
  if (recentWords.length > maxLock) {
    recentWords = recentWords.slice(recentWords.length - maxLock);
  }

  // 7. Save back to local storage
  try {
    localStorage.setItem('recentBattleWords', JSON.stringify(recentWords));
  } catch (_e) {
    // ignore
  }

  return selectedWords.map(w => ({
    word: w.word,
    hint: w.hint,
    category: w.category
  }));
};