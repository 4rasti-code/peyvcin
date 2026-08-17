import { useEffect, useRef } from 'react';

import { STATUS } from "../data/constants";

// Helper to evaluate colors exactly like Wordle
function evaluateGuess(guessString, targetString) {
  const guess = guessString.split('');
  const target = targetString.split('');
  const len = targetString.length;
  const colors = Array(len).fill(STATUS.INCORRECT); 
  const statuses = Array(len).fill(3); // 3 = absent
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
  const typeTimeoutRef = useRef(null);
  const currentTimeoutRef = useRef(null);

  // Load dictionary once
  useEffect(() => {
    if (isBot && dictionaryRef.current.length === 0) {
      import('../data/wordList').then(module => {
        if (module.allWordsMaster) {
          dictionaryRef.current = module.allWordsMaster.map(w => w.word);
        }
      });
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
      if (currentTimeoutRef.current) clearTimeout(currentTimeoutRef.current);
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    }
  }, [activeMatch, opponentLiveCursor, setOpponentLiveStatuses]);

  useEffect(() => {
    if (!isBot || multiplayerState !== 'playing' || !targetWord || isTypingRef.current) return;
    if (activeMatch?.p2_failed) return;

    const normalizedLevel = Math.min(Math.max(userLevel || 1, 1), 50);
    
    // Thinking delay decreases as level increases (4s to 1.5s)
    const baseDelay = Math.max(1500, 4000 - (normalizedLevel * 50)); 
    const thinkingDelay = Math.random() * 1000 + baseDelay;

    currentTimeoutRef.current = setTimeout(() => {
      if (multiplayerState !== 'playing') return;
      isTypingRef.current = true;
      
      const currentAttempt = guessCountRef.current + 1;
      let pickedWord = '';
      
      // Dynamic win chance based on attempt and level
      let winChance = 0;
      if (currentAttempt === 2) {
        winChance = 0.10 + (normalizedLevel * 0.005); // Level 1: 10%, Level 50: 35%
      } else if (currentAttempt === 3) {
        winChance = 0.20 + (normalizedLevel * 0.01); // Level 1: 20%, Level 50: 70%
      }
      
      if (currentAttempt > 1 && Math.random() < winChance) {
        pickedWord = targetWord;
      } else {
        const lengthAppropriateDict = dictionaryRef.current.filter(w => w.length === targetWord.length);
        const pool = lengthAppropriateDict.length > 0 ? lengthAppropriateDict : [targetWord];
        
        // Smart guess logic
        let overlapTarget = 0;
        if (normalizedLevel > 10) overlapTarget = 1;
        if (normalizedLevel > 20) overlapTarget = 2;
        if (normalizedLevel > 35) overlapTarget = 3;
        if (normalizedLevel > 45) overlapTarget = 4;
        
        overlapTarget += (Math.random() > 0.5 ? 1 : -1);
        overlapTarget = Math.max(0, Math.min(overlapTarget, targetWord.length));

        let foundWord = null;
        for (let i = 0; i < 30; i++) {
          const candidate = pool[Math.floor(Math.random() * pool.length)];
          let overlap = 0;
          for (const char of targetWord) {
            if (candidate.includes(char)) overlap++;
          }
          if (overlap >= overlapTarget) {
            foundWord = candidate;
            break;
          }
        }
        pickedWord = foundWord || pool[Math.floor(Math.random() * pool.length)];
      }

      const { colors } = evaluateGuess(pickedWord, targetWord);

      // Human-like typing simulation
      let charIndex = 0;
      const liveArr = Array(targetWord.length).fill(3); // 3 = empty

      const typeNextChar = () => {
        if (multiplayerState !== 'playing') {
           isTypingRef.current = false;
           return;
        }

        if (targetWord && charIndex < targetWord.length) {
          // Occasional hesitation (10% chance to pause)
          const hesitation = Math.random() < 0.1 ? 600 : 0;
          
          typeTimeoutRef.current = setTimeout(() => {
            liveArr[charIndex] = 0; // 0 = typed (unconfirmed)
            setOpponentLiveStatuses([...liveArr]);
            opponentLiveCursor?.set(Math.min(charIndex + 1, targetWord.length - 1));
            charIndex++;
            typeNextChar();
          }, (Math.random() * 250 + 150) + hesitation); // 150-400ms per keystroke
        } else {
          // Finished typing, wait slightly before submitting
          typeTimeoutRef.current = setTimeout(() => {
            setOpponentLiveStatuses([]);
            opponentLiveCursor?.set(0);
            setOpponentGuesses(prev => [...prev, colors]);
            
            const isWin = pickedWord === targetWord;
            if (isWin) {
              setWinnerNickname('Opponent');
              setTimeout(() => setWinnerNickname(''), 3000);

              setActiveMatchGuarded(prev => {
                if (!prev) return prev;
                const newP1Score = prev.p1_score || 0;
                const newP2Score = (prev.p2_score || 0) + 1;
                const newIndex = (prev.current_word_index || 0) + 1;
                const totalWords = prev.words?.length || 5;
                const scoreDiff = Math.abs(newP1Score - newP2Score);
                const isMatchEnd = scoreDiff >= 2 || newIndex >= totalWords;

                return {
                   ...prev,
                   p2_score: newP2Score,
                   current_word_index: newIndex,
                   status: isMatchEnd ? 'finished' : prev.status,
                   p1_failed: false,
                   p2_failed: false
                };
              });
            } else {
               guessCountRef.current += 1;
               if (guessCountRef.current >= 3) {
                  // Bot failed 3 times
                  setActiveMatchGuarded(prev => {
                    if (!prev) return prev;
                    if (prev.p1_failed) {
                       const newIndex = (prev.current_word_index || 0) + 1;
                       const totalWords = prev.words?.length || 5;
                       const scoreDiff = Math.abs((prev.p1_score || 0) - (prev.p2_score || 0));
                       const isMatchEnd = scoreDiff >= 2 || newIndex >= totalWords;

                       return { 
                         ...prev, 
                         p1_failed: false, 
                         p2_failed: false, 
                         current_word_index: newIndex,
                         status: isMatchEnd ? 'finished' : prev.status
                       };
                    }
                    return { ...prev, p2_failed: true };
                  });
               }
            }
            isTypingRef.current = false;
          }, Math.random() * 500 + 400); // 400-900ms submission delay
        }
      };

      typeNextChar();

    }, thinkingDelay);

    return () => {
      if (currentTimeoutRef.current) clearTimeout(currentTimeoutRef.current);
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    };
  }, [
    isBot, multiplayerState, targetWord, userLevel, activeMatch, 
    opponentLiveCursor, setActiveMatchGuarded, setOpponentGuesses, setOpponentLiveStatuses,
    setWinnerNickname, opponentGuessesLength
  ]);
}
