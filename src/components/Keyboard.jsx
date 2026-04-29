import React, { useState, useCallback, memo } from 'react';
import { STATUS } from '../data/constants';
import { useMusic } from './MusicContext';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { playKeyClickSfx } from '../utils/audio';
import InventoryBar from './InventoryBar';

// Kurdish Alphabet: 33 Characters in 4 Rows (9-9-9-6)
const ROWS = [
  ['پ', 'ۆ', 'ح', 'ع', 'ئ', 'ی', 'ێ', 'ت', 'ە'],
  ['ڕ', 'ر', 'و', 'ق', 'ل', 'ڵ', 'ک', 'ژ', 'ھ'],
  ['گ', 'غ', 'م', 'ن', 'ف', 'د', 'س', 'ش', 'ا'],
  ['ب', 'ڤ', 'ج', 'چ', 'خ', 'ز']
];

const SPECIAL_KEYS = {
  ENTER: 'تەمام',
  DELETE: 'backspace'
};

const Key = memo(({ k, status, onKeyPress, isDisabled }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const getKeyStyle = () => {
    if (isDisabled) return 'bg-[#334155]/20 text-white/10 cursor-not-allowed border-transparent';
    if (status === STATUS.CORRECT) return 'bg-[#10b981] text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)]';
    if (status === STATUS.WRONG_POS) return 'bg-[#f59e0b] text-white border-transparent shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    if (status === STATUS.INCORRECT) return 'bg-[#1e293b]/40 text-slate-600 border-white/5 opacity-50 backdrop-blur-sm grayscale';
    return 'bg-white/5 text-white border-white/10 hover:bg-white/10 active:bg-white/15 backdrop-blur-md';
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (isDisabled) return;
    
    // Trigger the popup locally
    setIsPopupVisible(true);
    onKeyPress(k);
    
    // Clear popup after short delay
    setTimeout(() => setIsPopupVisible(false), 150);
  };

  return (
    <div className="relative flex-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onPointerDown={handlePointerDown}
        className={`w-full h-[clamp(38px,6vh,55px)] rounded-md flex items-center justify-center font-heading font-light transition-[transform,background-color,border-color] border ${getKeyStyle()}`}
      >
        <span className="text-[clamp(1.3rem,4.5vw,1.9rem)] -translate-y-px">{k}</span>
      </motion.button>
      
      <AnimatePresence>
        {isPopupVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -70, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 w-14 h-16 bg-[#1a202c] text-white shadow-2xl rounded-2xl flex items-center justify-center border-2 border-white/20 pointer-events-none z-50 backdrop-blur-xl"
          >
            <span className="text-3xl font-light leading-none">{k}</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a202c] rotate-45 border-r border-b border-white/20"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, (prev, next) => {
  return prev.status === next.status && 
         prev.isDisabled === next.isDisabled &&
         prev.onKeyPress === next.onKeyPress;
});

const Keyboard = memo(({ 
  onKey, 
  onDelete, 
  onEnter, 
  usedKeys, 
  gameState = 'playing', 
  keyboardSoundEnabled = true,
  hapticEnabled = true,
  magnetDisabledKeys = [],
  onHint,
  onMagnet,
  onSkip,
  hintCost = 100,
  hintCount = 0,
  magnetCount = 0,
  skipCount = 0,
  fils = 0,
  gameMode = 'classic',
  magnetUsedInRound = false,
  skipsUsedInRound = 0,
  skipLimit = 1,
  hintTaps = 0,
  hintLimit = 0,
  hidePowerups = false
}) => {
  const { playSound } = useMusic();

  const handleKeyPress = useCallback((key, isSpecial = false) => {
    if (gameState !== 'playing') return;
    
    playKeyClickSfx(keyboardSoundEnabled);
    if (hapticEnabled) triggerHaptic(10);

    if (isSpecial) {
      if (key === SPECIAL_KEYS.ENTER) onEnter();
      else if (key === SPECIAL_KEYS.DELETE) onDelete();
    } else {
      onKey(key);
    }
  }, [onKey, onDelete, onEnter, keyboardSoundEnabled, hapticEnabled, gameState]);

  return (
    <div className={`flex flex-col gap-2 w-full px-1.5 box-border select-none touch-manipulation relative z-10 transition-all duration-500 ${gameState !== 'playing' ? 'opacity-50 pointer-events-none grayscale' : ''}`} dir="rtl">
      
      {!hidePowerups && (
        <InventoryBar 
          magnetCount={magnetCount}
          hintCount={hintCount}
          skipCount={skipCount}
          onHint={onHint}
          onMagnet={onMagnet}
          onSkip={onSkip}
          hintTaps={hintTaps}
          hintLimit={hintLimit}
          magnetUsedInRound={magnetUsedInRound}
          skipsUsedInRound={skipsUsedInRound}
          skipLimit={skipLimit}
          className="mb-1"
        />
      )}

      <div className="w-[40%] h-[1px] bg-white/5 mx-auto mb-3" />

      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 w-full justify-center">
          {rowIndex === 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onPointerDown={() => handleKeyPress(SPECIAL_KEYS.DELETE, true)}
              className="flex-[1.2] h-[clamp(32px,4.5vh,48px)] rounded-md bg-red-500 text-white border border-red-500/20 flex items-center justify-center transition-all hover:bg-red-600 active:scale-95 shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </motion.button>
          )}

          {row.map((key) => (
             <Key 
               key={key}
               k={key}
               status={usedKeys[key]}
               isDisabled={(magnetDisabledKeys || []).includes(key)}
               onKeyPress={handleKeyPress}
             />
          ))}

          {rowIndex === 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onPointerDown={() => handleKeyPress(SPECIAL_KEYS.ENTER, true)}
              className="flex-[1.8] h-[clamp(32px,4.5vh,48px)] rounded-md bg-green-500 text-white font-bold text-xs uppercase shadow-lg flex items-center justify-center transition-all hover:bg-green-600 active:scale-95"
            >
              <span className="font-rabar font-light text-lg">{SPECIAL_KEYS.ENTER}</span>
            </motion.button>
          )}

        </div>
      ))}
    </div>
  );
});

export default Keyboard;
