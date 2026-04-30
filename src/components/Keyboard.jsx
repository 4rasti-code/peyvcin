import React, { useState, useCallback, memo } from 'react';
import { STATUS } from '../data/constants';
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

const Key = memo(({ k, status, onKeyPress, isDisabled, isDark = true }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const getKeyStyle = () => {
    if (isDisabled) {
      return isDark 
        ? 'bg-[#334155]/20 text-white/10 border-transparent cursor-not-allowed' 
        : 'bg-slate-300/30 text-slate-400/20 border-transparent cursor-not-allowed';
    }
    
    if (isDark) {
      // 🌙 DARK MODE KEY STYLES
      if (status === STATUS.CORRECT) return 'bg-[#10b981] text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      if (status === STATUS.WRONG_POS) return 'bg-[#f59e0b] text-white border-transparent shadow-[0_0_15px_rgba(245,158,11,0.4)]';
      if (status === STATUS.INCORRECT) return 'bg-[#1e293b]/40 text-slate-600 border-white/5 opacity-50 backdrop-blur-sm grayscale';
      return 'bg-white/5 text-white border-white/10 hover:bg-white/10 active:bg-white/15 backdrop-blur-md';
    } else {
      // ☀️ LIGHT MODE KEY STYLES
      if (status === STATUS.CORRECT) return 'bg-emerald-500 text-white border-transparent shadow-md';
      if (status === STATUS.WRONG_POS) return 'bg-amber-500 text-white border-transparent shadow-md';
      if (status === STATUS.INCORRECT) return 'bg-slate-300 text-slate-500 border-slate-400/20 opacity-60 grayscale';
      return 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 active:bg-slate-400/20';
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (isDisabled) return;
    
    setIsPopupVisible(true);
    onKeyPress(k);
    
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
            className={`absolute left-1/2 -translate-x-1/2 w-14 h-16 ${isDark ? 'bg-[#1a202c] text-white border-white/20' : 'bg-white text-slate-900 border-slate-300'} shadow-2xl rounded-2xl flex items-center justify-center border-2 z-50 backdrop-blur-xl pointer-events-none`}
          >
            <span className="text-3xl font-light leading-none">{k}</span>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 ${isDark ? 'bg-[#1a202c] border-white/20' : 'bg-white border-slate-300'} rotate-45 border-r border-b`}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, (prev, next) => {
  return prev.status === next.status && 
         prev.isDisabled === next.isDisabled &&
         prev.isDark === next.isDark &&
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
  hintCount = 0,
  magnetCount = 0,
  skipCount = 0,
  magnetUsedInRound = false,
  skipsUsedInRound = 0,
  skipLimit = 1,
  hintTaps = 0,
  hintLimit = 0,
  hidePowerups = false,
  isDark = true
}) => {
  // const { playSound } = useMusic(); // Legacy dependency removed

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
          isDark={isDark}
        />
      )}

      <div className={`w-[40%] h-px ${isDark ? 'bg-white/5' : 'bg-slate-200'} mx-auto mb-3`} />

      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 w-full justify-center">
          {rowIndex === 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onPointerDown={() => handleKeyPress(SPECIAL_KEYS.DELETE, true)}
              className={`flex-[1.2] h-[clamp(32px,4.5vh,48px)] rounded-md ${isDark ? 'bg-red-500 border-red-500/20 shadow-red-500/10' : 'bg-red-500 border-red-600/20 shadow-md'} text-white border flex items-center justify-center transition-all hover:bg-red-600 active:scale-95 shadow-lg`}
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
               isDark={isDark}
             />
          ))}

          {rowIndex === 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onPointerDown={() => handleKeyPress(SPECIAL_KEYS.ENTER, true)}
              className={`flex-[1.8] h-[clamp(32px,4.5vh,48px)] rounded-md ${isDark ? 'bg-green-500 border-green-500/20 shadow-green-500/10' : 'bg-green-500 border-green-600/20 shadow-md'} text-white font-bold text-xs uppercase flex items-center justify-center transition-all hover:bg-green-600 active:scale-95`}
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
