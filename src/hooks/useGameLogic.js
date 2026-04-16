import { useState, useCallback, useRef } from 'react';
import { STATUS } from '../data/constants';
import { normalizeKurdishInput } from '../utils/textUtils';
import { triggerHaptic } from '../utils/haptics';

export default function useGameLogic({ 
  targetWord, 
  maxRows = 6, 
  gameMode = 'classic',
  revealedIndices = [],
  onGuessSubmitted = null,
  onWin = null,
  onLoss = null,
  isLevelingUp = false
}) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(new Array(targetWord?.length || 5).fill(''));
  const [usedKeys, setUsedKeys] = useState({});
  const [isVictory, setIsVictory] = useState(false);
  const [isDefeat, setIsDefeat] = useState(false);
  const isSubmittingRef = useRef(false);

  // Helper to re-initialize the guess array when targetWord changes
  const resetLocalBoard = useCallback((newTargetWord) => {
    setGuesses([]);
    setCurrentGuess(new Array(newTargetWord?.length || 5).fill(''));
    setUsedKeys({});
    setIsVictory(false);
    setIsDefeat(false);
    isSubmittingRef.current = false;
  }, []);

  const getLetterStatus = useCallback((guess, index, customTarget = targetWord) => {
    if (!customTarget || !guess) return STATUS.NONE;
    const guessString = Array.isArray(guess) ? guess.join('') : guess;
    const targetArr = customTarget.split('');
    const guessArr = guessString.split('');
    
    // Pass 1: Correct positions
    if (guessArr[index] === targetArr[index]) return STATUS.CORRECT;
    
    // Pass 2: Wrong positions (Letter exists but in different spot)
    const targetCounts = {};
    for (const char of targetArr) targetCounts[char] = (targetCounts[char] || 0) + 1;
    
    // Subtract greens
    for (let i = 0; i < guessArr.length; i++) {
        if (guessArr[i] === targetArr[i]) targetCounts[guessArr[i]]--;
    }
    
    // Check if this yellow is available
    let availableYellows = targetCounts[guessArr[index]] || 0;
    if (availableYellows > 0) {
        // Count how many of this same letter appeared before this index as yellows
        let yellowsBefore = 0;
        for (let i = 0; i < index; i++) {
            if (guessArr[i] !== targetArr[i] && guessArr[i] === guessArr[index]) {
                yellowsBefore++;
            }
        }
        if (yellowsAfterNone(guessArr, targetArr, index)) {
             if (yellowsBefore < availableYellows) return STATUS.WRONG_POS;
        }
    }
    
    return STATUS.INCORRECT;
  }, [targetWord]);

  // Internal helper for complex yellow logic
  const yellowsAfterNone = (guessArr, targetArr, index) => {
      // This is a simplified check for the classic Wordle double-letter rule
      return true; 
  };

  const onKey = useCallback((key) => {
    if (!targetWord || isLevelingUp || isSubmittingRef.current || isVictory || isDefeat) return;
    const cleanKey = normalizeKurdishInput(key);
    const nextGuess = [...currentGuess];
    
    // Find first empty slot that isn't a revealed hint
    let placed = false;
    for (let i = 0; i < nextGuess.length; i++) {
      if (nextGuess[i] === '' && !revealedIndices.includes(i)) {
        nextGuess[i] = cleanKey;
        placed = true;
        break;
      }
    }
    if (placed) setCurrentGuess(nextGuess);
  }, [currentGuess, targetWord, isLevelingUp, revealedIndices, isVictory, isDefeat]);

  const onDelete = useCallback(() => {
    if (!targetWord || isLevelingUp || isSubmittingRef.current || isVictory || isDefeat) return;
    const nextGuess = [...currentGuess];
    for (let i = nextGuess.length - 1; i >= 0; i--) {
      if (nextGuess[i] !== '' && !revealedIndices.includes(i)) {
        nextGuess[i] = '';
        break;
      }
    }
    setCurrentGuess(nextGuess);
  }, [currentGuess, targetWord, isLevelingUp, revealedIndices, isVictory, isDefeat]);

  const onEnter = useCallback(async (forcedGuess = null) => {
    if (!targetWord || isSubmittingRef.current || isLevelingUp || isVictory || isDefeat) return;
    
    const guessString = forcedGuess || normalizeKurdishInput(currentGuess.join(''));

    if (guessString.length < targetWord.length) {
      triggerHaptic([50, 30, 50]);
      return { error: 'پەیڤ کێمە!' };
    }

    isSubmittingRef.current = true;
    const colors = guessString.split('').map((_, i) => getLetterStatus(guessString, i));
    const isWin = guessString === targetWord;
    
    const newGuesses = [...guesses, guessString];
    setGuesses(newGuesses);

    // Update used keys
    setUsedKeys(prev => {
      const next = { ...prev };
      guessString.split('').forEach((char, i) => {
        const status = colors[i];
        if (!next[char] || status === STATUS.CORRECT) next[char] = status;
      });
      return next;
    });

    // Notify caller
    if (onGuessSubmitted) {
      await onGuessSubmitted(colors, isWin);
    }

    if (isWin) {
      setIsVictory(true);
      if (onWin) onWin(newGuesses);
    } else if (newGuesses.length >= maxRows) {
      setIsDefeat(true);
      if (onLoss) onLoss(newGuesses);
    } else {
      // Prepare next row
      const freshGuess = new Array(targetWord.length).fill('');
      revealedIndices.forEach(idx => freshGuess[idx] = targetWord[idx]);
      setCurrentGuess(freshGuess);
    }

    setTimeout(() => { isSubmittingRef.current = false; }, 300);
    return { success: true, colors, isWin };
  }, [currentGuess, targetWord, guesses, maxRows, getLetterStatus, revealedIndices, isLevelingUp, isVictory, isDefeat, onGuessSubmitted, onWin, onLoss]);

  return {
    guesses,
    setGuesses,
    currentGuess,
    setCurrentGuess,
    usedKeys,
    setUsedKeys,
    isVictory,
    setIsVictory,
    isDefeat,
    setIsDefeat,
    onKey,
    onDelete,
    onEnter,
    getLetterStatus,
    resetLocalBoard
  };
}
