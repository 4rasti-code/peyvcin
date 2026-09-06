import { gameWordLists } from '../data/wordList';
import { normalizeKurdishInput } from '../utils/textUtils';

// Initialize the dictionary set once when the worker starts
const dictionarySet = new Set();

const initializeDictionary = () => {
  if (dictionarySet.size > 0) return;
  Object.values(gameWordLists).forEach(list => {
    list.forEach(item => {
      if (item.word) {
        dictionarySet.add(normalizeKurdishInput(item.word));
      }
    });
  });
};

// Start initialization immediately
initializeDictionary();

self.onmessage = (e) => {
  const { id, type, payload } = e.data;

  if (type === 'VALIDATE_WORD') {
    const { guess, target } = payload;
    
    // Normalize both inputs using exactly the same logic as before
    const normalizedGuess = normalizeKurdishInput(guess);
    const normalizedTarget = normalizeKurdishInput(target);
    const isWin = normalizedGuess === normalizedTarget;
    
    // In Wordle games, a word is valid if it IS the target word (even if missing from dictionary),
    // OR if it exists in the dictionary.
    const isValid = isWin || dictionarySet.has(normalizedGuess);

    self.postMessage({
      id,
      type: 'VALIDATE_WORD_RESULT',
      payload: { isValid, isWin, normalizedGuess, normalizedTarget }
    });
  }
};
