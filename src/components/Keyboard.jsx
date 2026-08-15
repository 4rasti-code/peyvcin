import React, { useCallback, memo } from 'react';
import { STATUS } from '../data/constants';
import { motion as Motion } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { playKeyClickSfx } from '../utils/audio';
import InventoryBar from './InventoryBar';

// Kurdish Alphabet: 33 Characters iOS layout
const ROWS = [
   ['پ', 'ۆ', 'ی', 'ێ', 'ئ', 'ت', 'ڕ', 'ر', 'ە', 'و', 'ق'],
   ['ڵ', 'ل', 'ژ', 'ھ', 'ک', 'گ', 'ف', 'د', 'ش', 'س', 'ا'],
   ['غ', 'ع', 'ح', 'م', 'ن', 'ب', 'ڤ', 'چ', 'ج', 'خ', 'ز'],
   []
];

const SPECIAL_KEYS = {
   ENTER: 'تەمام',
   DELETE: 'backspace'
};




const Key = memo(({ k, status, onKeyPress, isDisabled, isDark = true }) => {
   const getKeyStyle = () => {
      if (isDisabled) {
         return isDark
            ? 'bg-[#334155]/20 text-white/10 border-transparent cursor-not-allowed shadow-[0_4px_0_rgba(51,65,85,0.4)]'
            : 'bg-slate-300/30 text-slate-400/20 border-transparent cursor-not-allowed shadow-[0_4px_0_rgba(203,213,225,0.5)]';
      }

      if (isDark) {
         if (status === STATUS.CORRECT) return 'bg-[#538d4e] text-white border-transparent shadow-[0_4px_0_#3b6b37]';
         if (status === STATUS.WRONG_POS) return 'bg-[#b59f3b] text-white border-transparent shadow-[0_4px_0_#8b7929]';
         if (status === STATUS.INCORRECT) return 'bg-[#262626] text-white opacity-50 shadow-[0_4px_0_#171717]';
         return 'bg-[#525252] text-white border-transparent shadow-[0_4px_0_#333333]';
      } else {
         if (status === STATUS.CORRECT) return 'bg-[#6aaa64] text-white border-transparent shadow-[0_4px_0_#4e8a49]';
         if (status === STATUS.WRONG_POS) return 'bg-[#c9b458] text-white border-transparent shadow-[0_4px_0_#a89542]';
         if (status === STATUS.INCORRECT) return 'bg-[#D4D4D4] text-white opacity-50 shadow-[0_4px_0_#A3A3A3]';
         return 'bg-[#E5E5E5] text-black border-transparent shadow-[0_4px_0_#C5C5C5]';
      }
   };

   const getTextTranslateY = () => {
      const highKeys = ['و', 'ۆ', 'ر', 'ڕ', 'ز', 'ژ', 'خ', 'چ', 'ج', 'ح', 'ع', 'غ', 'س', 'ش', 'ی', 'ێ', 'ن', 'م'];
      const lowKeys = ['گ', 'ف', 'ڤ', 'ک', 'ڵ', 'ل', 'ق'];

      if (highKeys.includes(k)) return '-translate-y-[3px]';
      if (lowKeys.includes(k)) return 'translate-y-[3px]';
      return '-translate-y-[1px]';
   };

   return (
      <Motion.button
         variants={{
            initial: { y: 3 },
            animate: {
               y: 0,
               transition: { type: "spring", stiffness: 120, damping: 25 }
            }
         }}
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.92 }}
         transition={{ type: "spring", stiffness: 400, damping: 17 }}
         onPointerDown={(e) => { e.preventDefault(); !isDisabled && onKeyPress(k); }}
         className={`flex-1 h-[clamp(34px,5.2vh,48px)] rounded-md flex items-center justify-center font-heading font-light transition-[transform,background-color,border-color] border ${getKeyStyle()}`}
      >
         <span className={`text-[clamp(1.3rem,4.5vw,1.9rem)] ${getTextTranslateY()}`}>{k}</span>
      </Motion.button>
   );
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
   hideSkip = false,
   hintTaps = 0,
   hintLimit = 0,
   hidePowerups = false,
   isDark = true
}) => {

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
      <div className={`flex flex-col gap-2.5 w-full px-1.5 box-border select-none touch-manipulation relative z-10 transition-all duration-500 ${gameState !== 'playing' ? 'opacity-50 pointer-events-none grayscale' : ''}`} dir="rtl">

         {!hidePowerups && (
            <div className="md:hidden">
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
                  hideSkip={hideSkip}
                  className="mb-1"
                  isDark={isDark}
               />
               <div className={`w-[40%] h-px ${isDark ? 'bg-white/5' : 'bg-slate-200'} mx-auto mb-3`} />
            </div>
         )}

         {ROWS.map((row, rowIndex) => (
            <Motion.div
               key={`kbd-row-${rowIndex}`}
               className={`flex ${rowIndex === 3 ? 'gap-6' : 'gap-1.5'} w-full justify-center`}
               initial="initial"
               animate="animate"
               variants={{
                  animate: {
                     transition: {
                        staggerChildren: 0.04,
                        delayChildren: rowIndex * 0.08
                     }
                  }
               }}
            >
               {rowIndex === 3 && (
                  <Motion.button
                     variants={{
                        initial: { y: 3 },
                        animate: {
                           y: 0,
                           transition: { type: "spring", stiffness: 120, damping: 25 }
                        }
                     }}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 400, damping: 17 }}
                     onPointerDown={(e) => { e.preventDefault(); handleKeyPress(SPECIAL_KEYS.DELETE, true); }}
                     className="flex-1 h-[clamp(34px,5.2vh,48px)] rounded-md bg-error text-white border border-white/10 flex items-center justify-center transition-all active:scale-95 shadow-[0_4px_0_#be123c]"
                  >
                     <span className="material-symbols-outlined text-[20px]">backspace</span>
                  </Motion.button>
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
                  <Motion.button
                     variants={{
                        initial: { y: 3 },
                        animate: {
                           y: 0,
                           transition: { type: "spring", stiffness: 120, damping: 25 }
                        }
                     }}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 400, damping: 17 }}
                     onPointerDown={(e) => { e.preventDefault(); handleKeyPress(SPECIAL_KEYS.ENTER, true); }}
                     className="flex-1 h-[clamp(34px,5.2vh,48px)] rounded-md bg-primary text-white font-bold text-sm uppercase flex items-center justify-center transition-all active:scale-95 border border-white/10 shadow-[0_4px_0_#047857]"
                  >
                     <span className="font-rabar font-light text-lg">{SPECIAL_KEYS.ENTER}</span>
                  </Motion.button>
               )}


            </Motion.div>
         ))}
      </div>
   );
});

export default Keyboard;

