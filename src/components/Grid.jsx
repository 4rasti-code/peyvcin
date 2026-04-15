import React from 'react';
import { STATUS } from '../data/constants';
import { motion } from 'framer-motion';

function Tile({ char, isCurrent, status, wordLength, isRevealed, isNewHint, isFocused, isSecretMode, isMobile, flipDelay = 0 }) {
  
  let bgColor = 'bg-[#1e293b] border-2 border-white/5 shadow-xl';
  let textColor = 'text-white';
  let extraClasses = '';

  // Hard Mode Overhaul: Do not show status coloring for the active row
  const showStatus = (!isCurrent && status !== STATUS.NONE) || isRevealed;
  const isFlipped = showStatus;

  if (showStatus && (status === STATUS.CORRECT || isRevealed)) {
    bgColor = 'bg-[#10b981] border-none shadow-[0_8px_20px_rgba(16,185,129,0.3)]';
    textColor = 'text-white';
  } else if (showStatus && (status === STATUS.WRONG_POS)) {
    bgColor = 'bg-[#f59e0b] border-none shadow-[0_8px_20px_rgba(245,158,11,0.3)]';
    textColor = 'text-white';
  } else if (showStatus && status === STATUS.INCORRECT) {
    bgColor = 'bg-[#334155] border-none opacity-40 grayscale';
    textColor = 'text-white/30';
  } else if (isFocused) {
    // ACTIVE BOX HIGHLIGHT (STRICTLY GREEN)
    bgColor = 'bg-[#1e293b] border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.4)]';
    extraClasses = 'z-20 scale-105 border-[3px]';
    textColor = 'text-white';
  } else if (char && isCurrent) {
    bgColor = 'bg-[#1e293b] border-white/10 z-10 shadow-lg';
    textColor = 'text-white';
  }
  
  if (isNewHint) extraClasses += ' animate-hint-glow';

  // HIDDEN INPUT LOGIC: Hide text if in Secret Mode and not revealed yet
  const shouldHideText = isSecretMode && !showStatus;

  return (
    <motion.div 
      initial={false}
      animate={isFlipped ? { rotateY: 360 } : {}}
      transition={{ duration: 0.6, delay: flipDelay / 1000 }}
      className={`${bgColor} ${extraClasses} forced-tile rounded-[12px] transition-all duration-200 transform relative overflow-hidden flex items-center justify-center`}
    >
      <span 
        className={`font-bold font-heading ${textColor} select-none leading-none block ${shouldHideText ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ 
          fontSize: 'clamp(1.2rem, 4.5vw, 2.5rem)',
          lineHeight: 1
        }}
      >
        {char}
      </span>
      {shouldHideText && char && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-pulse" />
         </div>
      )}
    </motion.div>
  );
}

function Row({ guess, wordLength, getLetterStatus, isCurrent, revealedIndices, lastHintIndex, targetWord, isMobile, isShaking, isSecretMode }) {
  // DYNAMIC GRID: Columns generated based on any word length
  const gap = isMobile ? (wordLength > 7 ? '4px' : '8px') : (wordLength > 7 ? '8px' : '12px');
  
  // Active Row Glow implementation
  const activeClass = isCurrent ? 'ring-2 ring-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] bg-primary/5' : '';

  return (
    <div 
      className={`transition-all duration-300 ${activeClass} ${isShaking ? 'shake-anim' : ''}`}
      style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${wordLength}, clamp(45px, 12vw, 60px))`,
        gap: 'clamp(4px, 1vw, 8px)',
        justifyContent: 'center',
        width: 'auto',
        overflowX: 'auto'
      }}
    >
      {Array.from({ length: wordLength }).map((_, i) => {
        let char = '';
        let status = STATUS.NONE;
        let isRevealed = revealedIndices.includes(i);
        let isNewHint = i === lastHintIndex;
        
        // Accurate focus: find the first empty slot
        const firstEmptyIndex = Array.isArray(guess) ? guess.findIndex(c => c === '') : -1;
        const isFocused = isCurrent && i === (firstEmptyIndex === -1 ? wordLength - 1 : firstEmptyIndex);

        if (Array.isArray(guess)) {
          char = guess[i];
          status = getLetterStatus(guess, i);
        } else if (typeof guess === 'string') {
          char = guess[i] || '';
          status = getLetterStatus(guess, i);
        }

        const baseDelay = 60;

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
            flipDelay={i * baseDelay}
          />
        );
      })}
    </div>
  );
}

export default function Grid({ guesses = [], currentGuess = [], wordLength = 0, getLetterStatus, revealedIndices = [], lastHintIndex = -1, targetWord = '', maxRows = 6, isSecretMode = false, comboGlow = false, isShaking = false }) {
  if (!targetWord || wordLength === 0) return null;

  const rows = [...guesses];
  while (rows.length < maxRows) {
    rows.push(null);
  }

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // AGGRESSIVE SCALING LOGIC: Fit 6 rows of 58px tiles into any viewport height
  const [gridScale, setGridScale] = React.useState(1);
  React.useLayoutEffect(() => {
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

  return (
    <div className={`w-full flex-1 min-h-0 flex flex-col items-center justify-center py-1 sm:py-2 overflow-hidden relative`}>
      <style>
        {`
          .forced-tile {
            width: clamp(45px, 12vw, 60px) !important;
            height: clamp(45px, 12vw, 60px) !important;
            min-width: 45px !important;
            min-height: 45px !important;
            aspect-ratio: 1 / 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }
        `}
      </style>
      <div 
        className={`p-3 sm:p-6 lg:p-8 mx-auto animate-in zoom-in-95 duration-700 transition-all origin-center ${comboGlow ? 'shadow-[0_0_40px_rgba(168,85,247,0.3)]' : ''}`} 
        style={{ 
          width: 'auto',
          transform: `scale(${gridScale})`,
          maxHeight: '45vh',
          display: 'grid',
          gridTemplateRows: `repeat(${maxRows}, auto)`, 
          gap: '8px',
          justifyContent: 'center',
          alignContent: 'center',
          justifyItems: 'center',
          alignItems: 'center'
        }}
      >
          {rows.map((guess, i) => {
            const isCurrent = i === guesses.length;
            if (i >= maxRows) return null;
            
            return (
              <Row 
                key={i} 
                guess={isCurrent ? currentGuess : (guess || '')} 
                wordLength={wordLength}
                getLetterStatus={getLetterStatus}
                isCurrent={isCurrent}
                revealedIndices={isCurrent ? revealedIndices : []}
                lastHintIndex={lastHintIndex}
                targetWord={targetWord}
                isMobile={isMobile}
                isShaking={isCurrent && isShaking}
              />
            );
          })}
      </div>
    </div>
  );
}

