import React, { memo, useState, useEffect, useLayoutEffect } from 'react';
import { STATUS } from '../data/constants';
import { motion } from 'framer-motion';

const Tile = memo(({ char, isCurrent, status, wordLength, isRevealed, isNewHint, isFocused, isSecretMode, isMobile, hideLetters = false, flipDelay = 0 }) => {
  
  let bgColor = 'bg-[#0f172a] border-2 border-white/10 shadow-2xl';
  let textColor = 'text-white';
  let extraClasses = '';

  const showStatus = (!isCurrent && status !== STATUS.NONE) || isRevealed;
  
  // SPECIAL: If we have a status but no char (Live Masked Mode), treat it as showStatus
  const isMaskedLive = isCurrent && hideLetters && status !== STATUS.NONE;
  const isFlipped = showStatus && !isMaskedLive;

  if ((showStatus || isMaskedLive) && (status === STATUS.CORRECT || isRevealed)) {
    bgColor = 'bg-[#10b981] border-none shadow-[0_8px_20px_rgba(16,185,129,0.4)]';
    textColor = 'text-white';
  } else if ((showStatus || isMaskedLive) && (status === STATUS.WRONG_POS)) {
    bgColor = 'bg-[#f59e0b] border-none shadow-[0_8px_20px_rgba(245,158,11,0.4)]';
    textColor = 'text-white';
  } else if ((showStatus || isMaskedLive) && status === STATUS.INCORRECT) {
    bgColor = 'bg-[#334155] border-none opacity-40 grayscale';
    textColor = 'text-white/30';
  } else if (isFocused) {
    bgColor = 'bg-[#1e293b] border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.4)]';
    extraClasses = 'z-20 scale-105 border-[3px]';
    textColor = 'text-white';
  } else if (char && isCurrent) {
    bgColor = 'bg-[#0f172a] border-2 border-white/20 z-10 shadow-2xl';
    textColor = 'text-white';
  }
  
  if (isNewHint) extraClasses += ' animate-hint-glow';

  const shouldHideText = (isSecretMode || hideLetters) && !showStatus;

  return (
    <motion.div 
      initial={false}
      animate={isFlipped ? { rotateY: 360 } : {}}
      transition={{ duration: 0.6, delay: flipDelay / 1000 }}
      className={`${bgColor} ${extraClasses} forced-tile rounded-[4px] transition-[transform,background-color,border-color] duration-150 transform relative overflow-hidden items-center justify-center`}
    >
      <span 
        className={`font-bold font-heading ${textColor} select-none leading-none block ${(shouldHideText || hideLetters) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ 
          fontSize: 'clamp(1.2rem, 4.5vw, 2.5rem)',
          lineHeight: 1
        }}
      >
        {char}
      </span>
      {shouldHideText && (char || isMaskedLive) && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-pulse" />
         </div>
      )}
    </motion.div>
  );
}, (prev, next) => {
  return prev.char === next.char &&
         prev.status === next.status &&
         prev.isFocused === next.isFocused &&
         prev.isCurrent === next.isCurrent &&
         prev.isRevealed === next.isRevealed &&
         prev.isNewHint === next.isNewHint &&
         prev.isSecretMode === next.isSecretMode &&
         prev.hideLetters === next.hideLetters;
});

const Row = memo(({ guess, wordLength, getLetterStatus = () => '', isCurrent, revealedIndices, lastHintIndex, isMobile, isShaking, isSecretMode, hideLetters = false, forcedStatuses = null, gap = '8px', forcedFocusIndex = null }) => {
  const activeClass = isCurrent ? 'ring-2 ring-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] bg-primary/5' : '';

  // PRE-CALCULATE CONSTANTS for the row maps
  const guessArr = Array.isArray(guess) ? guess : (typeof guess === 'string' ? guess.split('') : []);
  const firstEmptyIndex = guessArr.findIndex(c => c === '');
  const actualFocusIndex = forcedFocusIndex !== null ? forcedFocusIndex : (firstEmptyIndex === -1 ? wordLength - 1 : firstEmptyIndex);

  return (
    <div 
      className={`transition-all duration-300 ${activeClass} ${isShaking ? 'shake-anim' : ''} flex items-center justify-center`}
      dir="rtl"
      style={{ 
        gap: 'clamp(4px, 1vw, 8px)',
        width: 'auto',
        overflowX: 'auto',
        direction: 'rtl'
      }}
    >
      {Array.from({ length: wordLength }).map((_, i) => {
        let char = guessArr[i] || '';
        let status = STATUS.NONE;
        let isRevealed = (revealedIndices || []).includes(i);
        let isNewHint = i === lastHintIndex;
        
        const isFocused = isCurrent && i === actualFocusIndex;

        if (forcedStatuses) {
          status = forcedStatuses[i] || STATUS.NONE;
        } else if (!isCurrent && guessArr.length > 0) {
          // Only calculate status for SUBMITTED rows (prevents lag during typing)
          status = getLetterStatus(guess, i);
        }

        return (
          <Tile 
            key={i} 
            char={char} 
            isCurrent={isCurrent}
            status={status}
            wordLength={wordLength}
            isRevealed={isRevealed}
            isNewHint={isNewHint}
            isFocused={isFocused}
            isMobile={isMobile}
            isSecretMode={isSecretMode}
            hideLetters={hideLetters}
            flipDelay={isCurrent ? 0 : i * 60}
          />
        );
      })}
    </div>
  );
}, (prev, next) => {
  const prevStr = Array.isArray(prev.guess) ? prev.guess.join('') : prev.guess;
  const nextStr = Array.isArray(next.guess) ? next.guess.join('') : next.guess;

  return prevStr === nextStr &&
         prev.isCurrent === next.isCurrent &&
         prev.isShaking === next.isShaking &&
         prev.isSecretMode === next.isSecretMode &&
         prev.wordLength === next.wordLength &&
         prev.forcedFocusIndex === next.forcedFocusIndex &&
         JSON.stringify(prev.forcedStatuses) === JSON.stringify(next.forcedStatuses) &&
         prev.revealedIndices?.length === next.revealedIndices?.length &&
         prev.lastHintIndex === next.lastHintIndex;
});

const Grid = memo(({ guesses = [], currentGuess = [], wordLength = 0, getLetterStatus, revealedIndices = [], lastHintIndex = -1, maxRows = 6, isSecretMode = false, comboGlow = false, isShaking = false, hideLetters = false, opponentStatuses = [], compact = false, activeRowIndex = null, opponentLiveStatuses = [], opponentLiveCursor = null }) => {
  if (wordLength === 0) return null;

  const rows = [...guesses];
  while (rows.length < maxRows) {
    rows.push(null);
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // AGGRESSIVE SCALING LOGIC: Fit 6 rows of 58px tiles into any viewport height
  const [gridScale, setGridScale] = useState(1);
  useLayoutEffect(() => {
    const calculateScale = () => {
      if (!isMobile) return 1;
      
      const horizontalSpace = window.innerWidth - 32;
      const verticalSpace = window.innerHeight * 0.38; // Account for floating keyboard margins
      
      const contentWidth = (wordLength * 58) + ((wordLength - 1) * 8);
      const contentHeight = (maxRows * 58) + ((maxRows - 1) * 8);
      
      const hScale = horizontalSpace / contentWidth;
      const vScale = verticalSpace / contentHeight;
      
      setGridScale(Math.min(1, hScale, vScale));
    };
    
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [wordLength, maxRows, isMobile]);

  const finalGap = compact ? '6px' : (isMobile ? '8px' : '12px');
  const tileSize = compact ? 'clamp(38px, 9vw, 42px)' : 'clamp(45px, 12vw, 60px)';

  return (
    <div className={`w-full flex-1 min-h-0 flex flex-col items-center justify-center py-1 sm:py-2 overflow- relative`} dir="rtl">
      <style>
        {`
          .forced-tile {
            width: ${tileSize} !important;
            height: ${tileSize} !important;
            min-width: ${compact ? '38px' : '45px'} !important;
            min-height: ${compact ? '38px' : '45px'} !important;
            aspect-ratio: 1 / 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }
        `}
      </style>
      <div 
        className={`p-1 sm:p-2 mx-auto animate-in zoom-in-95 duration-700 transition-all origin-center ${comboGlow ? 'shadow-[0_0_40px_rgba(168,85,247,0.3)]' : ''}`} 
        style={{ 
          width: 'auto',
          transform: `scale(${gridScale})`,
          maxHeight: compact ? '22vh' : '45vh',
          display: 'grid',
          gridTemplateRows: `repeat(${maxRows}, auto)`, 
          gap: finalGap,
          justifyContent: 'center',
          alignContent: 'center',
          justifyItems: 'center',
          alignItems: 'center',
          padding: compact ? '4px' : '8px'
        }}
      >
          {rows.map((guess, i) => {
            const isCurrent = activeRowIndex !== null ? i === activeRowIndex : i === guesses.length;
            if (i >= maxRows) return null;

            // Map numeric statuses to STATUS constants if this is the live row
            let forcedStatuses = opponentStatuses[i] || null;
            if (isCurrent && opponentLiveStatuses && opponentLiveStatuses.length > 0) {
              forcedStatuses = opponentLiveStatuses.map(code => {
                if (code === 1) return STATUS.CORRECT;
                if (code === 2) return STATUS.WRONG_POS;
                if (code === 3) return STATUS.INCORRECT;
                return STATUS.NONE;
              });
            }
            
            return (
              <Row 
                key={i} 
                guess={isCurrent ? currentGuess : (guess || '')} 
                wordLength={wordLength}
                getLetterStatus={getLetterStatus}
                isCurrent={isCurrent}
                revealedIndices={isCurrent ? revealedIndices : []}
                lastHintIndex={lastHintIndex}
                isMobile={isMobile}
                isShaking={isCurrent && isShaking}
                isSecretMode={isSecretMode}
                hideLetters={hideLetters}
                forcedStatuses={forcedStatuses}
                forcedFocusIndex={isCurrent ? opponentLiveCursor : null}
                gap={finalGap}
              />
            );
          })}
      </div>
    </div>
  );
});

export default Grid;

