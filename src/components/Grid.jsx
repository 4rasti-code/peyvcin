import React, { memo, useState, useEffect, useLayoutEffect } from 'react';
import { STATUS } from '../data/constants';
import { motion, useTransform } from 'framer-motion';

const Tile = memo(({ char, isCurrent, status, wordLength, isRevealed, isNewHint, isFocused, isSecretMode, isMobile, hideLetters = false, flipDelay = 0, isFocusedMV = null, index = 0, isDark = true }) => {
  
  // 🎨 COLORS BASED ON THEME (isDark)
  let bgColor = isDark ? 'bg-white/5 border-2 border-white/10' : 'bg-slate-100 border-2 border-slate-300';
  let textColor = isDark ? 'text-white' : 'text-slate-900';
  let extraClasses = '';

  const showStatus = (!isCurrent && status !== STATUS.NONE) || isRevealed;
  const isMaskedLive = isCurrent && hideLetters && status !== STATUS.NONE;
  const isFlipped = showStatus && !isMaskedLive;

  if (isDark) {
    // 🌙 DARK MODE COLORS
    if ((showStatus || isMaskedLive) && (status === STATUS.CORRECT || isRevealed)) {
      bgColor = 'bg-emerald-500 border-2 border-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)]';
      textColor = 'text-white';
    } else if ((showStatus || isMaskedLive) && (status === STATUS.WRONG_POS)) {
      bgColor = 'bg-amber-500 border-2 border-amber-500 shadow-[0_8px_20px_rgba(245,158,11,0.3)]';
      textColor = 'text-white';
    } else if ((showStatus || isMaskedLive) && status === STATUS.INCORRECT) {
      bgColor = 'bg-white/10 border-2 border-white/5 opacity-40 grayscale';
      textColor = 'text-white/30';
    } else if (isFocused) {
      bgColor = 'bg-white/10 border-2 border-white/30';
      textColor = 'text-white';
    } else if (char && isCurrent) {
      bgColor = 'bg-white/20 border-2 border-white/40 shadow-sm';
      textColor = 'text-white';
    }
  } else {
    // ☀️ LIGHT MODE COLORS
    if ((showStatus || isMaskedLive) && (status === STATUS.CORRECT || isRevealed)) {
      bgColor = 'bg-emerald-500 border-2 border-emerald-500 shadow-md';
      textColor = 'text-white';
    } else if ((showStatus || isMaskedLive) && (status === STATUS.WRONG_POS)) {
      bgColor = 'bg-amber-500 border-2 border-amber-500 shadow-md';
      textColor = 'text-white';
    } else if ((showStatus || isMaskedLive) && status === STATUS.INCORRECT) {
      bgColor = 'bg-slate-300 border-2 border-slate-300';
      textColor = 'text-slate-500';
    } else if (isFocused) {
      bgColor = 'bg-white border-2 border-slate-400';
      textColor = 'text-slate-900';
    } else if (char && isCurrent) {
      bgColor = 'bg-white border-2 border-slate-500 shadow-sm';
      textColor = 'text-slate-900';
    }
  }
  
  if (isNewHint) extraClasses += ' animate-hint-glow';

  const shouldHideText = (isSecretMode || hideLetters) && !showStatus;

  return (
    <motion.div 
      initial={false}
      animate={isFlipped ? { rotateY: 360 } : {}}
      transition={{ duration: 0.6, delay: flipDelay / 1000 }}
      className={`${bgColor} ${extraClasses} forced-tile rounded-none transition-all duration-300 transform relative overflow-hidden items-center justify-center`}
    >
      <span 
        className={`font-bold font-heading ${textColor} select-none leading-none block ${(shouldHideText || hideLetters) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ 
          fontSize: 'clamp(1rem, 4vw, 2.2rem)',
          lineHeight: 1
        }}
      >
        {char}
      </span>

      {/* Focused State Indicator (Neutral) */}
      {isFocusedMV && (
        <motion.div 
          className={`absolute inset-0 border-2 ${isDark ? 'border-white/20' : 'border-slate-300'} z-30 pointer-events-none`}
          style={{ 
            opacity: useTransform(isFocusedMV, (val) => val === index ? 1 : 0)
          }}
        />
      )}

      {shouldHideText && (char || isMaskedLive) && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-white/40' : 'bg-slate-400'} animate-pulse`} />
         </div>
      )}
    </motion.div>
  );
}, (prev, next) => {
  return prev.char === next.char &&
         prev.status === next.status &&
         prev.isFocused === next.isFocused &&
         prev.isFocusedMV === next.isFocusedMV &&
         prev.isCurrent === next.isCurrent &&
         prev.isRevealed === next.isRevealed &&
         prev.isNewHint === next.isNewHint &&
         prev.isSecretMode === next.isSecretMode &&
         prev.isDark === next.isDark &&
         prev.hideLetters === next.hideLetters;
});

const Row = memo(({ guess, wordLength, getLetterStatus = () => '', isCurrent, revealedIndices, lastHintIndex, isMobile, isShaking, isSecretMode, hideLetters = false, forcedStatuses = null, gap = '8px', forcedFocusIndex = null, isDark = true }) => {
  const activeClass = '';

  // PRE-CALCULATE CONSTANTS for the row maps
  const guessArr = Array.isArray(guess) ? guess : (typeof guess === 'string' ? guess.split('') : []);
  const firstEmptyIndex = guessArr.findIndex(c => c === '');
  
  // If forcedFocusIndex is a MotionValue, we'll pass it down differently
  const isMV = forcedFocusIndex && typeof forcedFocusIndex === 'object' && forcedFocusIndex.get;
  const actualFocusIndex = isMV ? null : (forcedFocusIndex !== null ? forcedFocusIndex : (firstEmptyIndex === -1 ? wordLength - 1 : firstEmptyIndex));

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
        
        const isFocused = !isMV && isCurrent && i === actualFocusIndex;
        
        if (forcedStatuses) {
          status = forcedStatuses[i] || STATUS.NONE;
        } else if (!isCurrent && guessArr.length > 0) {
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
            isFocusedMV={isMV ? forcedFocusIndex : null}
            index={i}
            isMobile={isMobile}
            isSecretMode={isSecretMode}
            hideLetters={hideLetters}
            flipDelay={isCurrent ? 0 : i * 60}
            isDark={isDark}
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
         prev.isDark === next.isDark &&
         prev.forcedFocusIndex === next.forcedFocusIndex &&
         JSON.stringify(prev.forcedStatuses) === JSON.stringify(next.forcedStatuses) &&
         prev.revealedIndices?.length === next.revealedIndices?.length &&
         prev.lastHintIndex === next.lastHintIndex;
});

const Grid = memo(({ guesses = [], currentGuess = [], wordLength = 0, getLetterStatus, revealedIndices = [], lastHintIndex = -1, maxRows = 6, isSecretMode = false, comboGlow = false, isShaking = false, hideLetters = false, opponentStatuses = [], compact = false, activeRowIndex = null, opponentLiveStatuses = [], opponentLiveCursor = null, isDark = true }) => {
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

  const finalGap = compact ? '4px' : (wordLength > 7 ? '4px' : (isMobile ? '6px' : '10px'));
  const vwSize = `((92vw - ${(wordLength - 1) * 6}px) / ${wordLength})`;
  
  const tileSize = compact 
    ? `clamp(22px, min(3.8vh, ${vwSize}), 34px)` 
    : `clamp(28px, min(5.5vh, ${vwSize}), 54px)`;

  return (
    <div className={`w-full flex-1 min-h-0 flex flex-col items-center justify-center py-1 relative overflow-visible`} dir="rtl">
      <style>
        {`
          .forced-tile {
            width: ${tileSize} !important;
            height: ${tileSize} !important;
            min-width: ${compact ? '28px' : '36px'} !important;
            min-height: ${compact ? '28px' : '36px'} !important;
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
          maxWidth: '100%',
          maxHeight: '100%',
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
                isDark={isDark}
              />
            );
          })}
      </div>
    </div>
  );
});

export default Grid;
