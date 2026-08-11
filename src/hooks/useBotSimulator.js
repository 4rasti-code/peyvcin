import { useEffect, useRef } from 'react';
import { getUnifiedWords } from "../data/wordList";
import { STATUS } from "../data/constants";

// Helper to evaluate colors exactly like Wordle
function evaluateGuess(guessString, targetString) {
  const guess = guessString.split('');
  const target = targetString.split('');
  const colors = Array(5).fill(STATUS.INCORRECT); 
  const statuses = Array(5).fill(3); // 3 = absent
  const targetLetterCount = {};

  target.forEach(l => {
    targetLetterCount[l] = (targetLetterCount[l] || 0) + 1;
  });

  // First pass: Correct (Green)
  guess.forEach((letter, i) => {
    if (letter === target[i]) {
      colors[i] = STATUS.CORRECT; 
      statuses[i] = 1; // Correct
      targetLetterCount[letter] -= 1;
    }
  });

  // Second pass: Wrong Position (Yellow)
  guess.forEach((letter, i) => {
    if (colors[i] !== STATUS.CORRECT && targetLetterCount[letter] > 0) {
      colors[i] = STATUS.WRONG_POS; 
      statuses[i] = 2; // Wrong Pos
      targetLetterCount[letter] -= 1;
    }
  });

  return { colors, statuses };
}

export default function useBotSimulator({
  isBot,
  multiplayerState,
  targetWord,
  userLevel,
  setOpponentGuesses,
  setOpponentLiveStatuses,
  opponentLiveCursor,
  setActiveMatchGuarded,
  activeMatch,
  setWinnerNickname,
  opponentGuessesLength
}) {
  const dictionaryRef = useRef([]);
  const guessCountRef = useRef(0);
  const isTypingRef = useRef(false);
  const roundIndexRef = useRef(-1);
  const currentTimeoutRef = useRef(null);

  // Load dictionary once
  useEffect(() => {
    if (isBot && dictionaryRef.current.length === 0) {
      const words = getUnifiedWords().filter(w => w.word && w.word.length === 5);
      dictionaryRef.current = words.map(w => w.word);
    }
  }, [isBot]);

  // Reset bot state when round advances
  useEffect(() => {
    if (activeMatch && activeMatch.current_word_index !== roundIndexRef.current) {
      roundIndexRef.current = activeMatch.current_word_index;
      guessCountRef.current = 0;
      isTypingRef.current = false;
      setOpponentLiveStatuses([]);
      opponentLiveCursor?.set(0);
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
      }
    }
  }, [activeMatch, opponentLiveCursor, setOpponentLiveStatuses]);

  useEffect(() => {
    if (!isBot || multiplayerState !== 'playing' || !targetWord || isTypingRef.current) return;
    
    // Check if game is over for this round (only stop if the bot itself has failed)
    if (activeMatch?.p2_failed) return;

    // Difficulty scaling based on userLevel (e.g. level 1 to 50)
    const normalizedLevel = Math.min(Math.max(userLevel || 1, 1), 50);
    
    // Typing delay between guesses (faster if higher level)
    const baseDelay = Math.max(1500, 5000 - (normalizedLevel * 60)); // 5s to 2s
    const typingDelay = Math.random() * 1000 + baseDelay; // Add 0-1s jitter

    currentTimeoutRef.current = setTimeout(() => {
      if (multiplayerState !== 'playing') return;
      isTypingRef.current = true;
      
      const currentAttempt = guessCountRef.current + 1;
      let pickedWord = '';
      
      // Bot Strategy:
      // Attempts 1-3: Random words
      // Attempts 4-6: Calculate a chance to win
      const winChance = 0.05 + (normalizedLevel * 0.002); // 5% base + 0.2% per level (up to ~15%)
      
      if (currentAttempt >= 4 && Math.random() < winChance) {
         pickedWord = targetWord;
      } else {
         const dict = dictionaryRef.current;
         if (dict.length > 0) {
           pickedWord = dict[Math.floor(Math.random() * dict.length)];
         } else {
           pickedWord = "سڵاوە"; // Failsafe fallback
         }
      }

      const { colors } = evaluateGuess(pickedWord, targetWord);

      // Typing animation simulation
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex < 5) {
          // Move cursor forward
          opponentLiveCursor?.set(charIndex + 1 > 4 ? 4 : charIndex + 1);
          charIndex++;
        } else {
          clearInterval(typeInterval);
          
          // Submit guess
          setOpponentLiveStatuses([]);
          opponentLiveCursor?.set(0);
          setOpponentGuesses(prev => [...prev, colors]);
          
          const isWin = pickedWord === targetWord;
          if (isWin) {
            setWinnerNickname('Opponent');
            setTimeout(() => setWinnerNickname(''), 3000);

            setActiveMatchGuarded(prev => {
              if (!prev) return prev;
              return {
                 ...prev,
                 p2_score: (prev.p2_score || 0) + 1,
                 current_word_index: (prev.current_word_index || 0) + 1
              };
            });
          } else {
             guessCountRef.current += 1;
             if (guessCountRef.current >= 3) {
                // Bot failed 3 times
                setActiveMatchGuarded(prev => {
                  if (!prev) return prev;
                  if (prev.p1_failed) {
                     return { ...prev, p1_failed: false, p2_failed: false, current_word_index: (prev.current_word_index || 0) + 1 };
                  }
                  return { ...prev, p2_failed: true };
                });
             }
          }
          isTypingRef.current = false;
        }
      }, 400); // 400ms per letter keystroke

    }, typingDelay);

    return () => {
      if (currentTimeoutRef.current) clearTimeout(currentTimeoutRef.current);
    };
  }, [
    isBot, multiplayerState, targetWord, userLevel, activeMatch, 
    opponentLiveCursor, setActiveMatchGuarded, setOpponentGuesses, setOpponentLiveStatuses,
    setWinnerNickname, opponentGuessesLength
  ]);
}
