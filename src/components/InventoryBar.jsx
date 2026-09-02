import React from 'react';
import { motion as Motion } from 'framer-motion';
import { toKuDigits } from '../utils/formatters';
import { HintIcon, MagnetIcon, SkipIcon } from './CurrencyIcon';

const PowerUpButton = ({ 
  icon, 
  count, 
  disabled, 
  onClick, 
  colorTheme, 
  ariaLabel, 
  id 
}) => {
  const themes = {
    green: "bg-[#bd5ef8] border-[#a047d8] w-14 h-14 rounded-full", // Purple target (Magnet)
    blue: "bg-[#f49341] border-[#d87c31] w-14 h-14 rounded-full", // Orange magnifying glass (Hint)
    yellow: "bg-[#54bbf8] border-[#449dd3] w-[80px] h-12 rounded-full" // Light blue wide pill (Skip)
  };

  const Icon = icon;

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`relative flex items-center justify-center border-b-[5px] transition-all duration-150 outline-none ${themes[colorTheme]} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'active:translate-y-1 active:border-b-0 hover:brightness-110 shadow-md'}`}
    >
      <Icon className="w-8 h-8 drop-shadow-md z-10" disabled={disabled} />

      {count !== null && (
        <div className="absolute -bottom-1 -right-1 min-w-5.5 h-5.5 px-1 rounded-full bg-red-500 border-2 border-white dark:border-mono-900 flex items-center justify-center text-[12px] leading-none font-bold text-white shadow-sm z-10">
          {count}
        </div>
      )}
      
      {/* Light Reflection (shiny) */}
      <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/20 rounded-md blur-[1px]" />
    </button>
  );
};

const InventoryBar = ({ 
  magnetCount, 
  hintCount, 
  skipCount, 
  onHint, 
  onMagnet, 
  onSkip,
  hintTaps = 0,
  hintLimit = 3,
  magnetUsedInRound = false,
  skipsUsedInRound = 0,
  skipLimit = 1,
  isShop = false,
  hideSkip = false,
  isTutorialFocus = false,
  tutorialHighlightItem = null,
  className = ""
}) => {
  const getAnimate = (itemType) => {
    if (!isTutorialFocus) return {};
    if (tutorialHighlightItem === 'main') return { opacity: 1, scale: 1, y: 0 };
    if (tutorialHighlightItem === itemType) return { opacity: 1, scale: 1.2, y: -5 };
    return { opacity: 0.3, scale: 0.8, y: 0 };
  };

  const getTransition = (delay) => {
    if (tutorialHighlightItem === 'main') return { type: 'spring', bounce: 0.6, delay: delay };
    return { type: 'spring', bounce: 0.5 };
  };

  const displayHintCount = isShop 
    ? toKuDigits(hintCount || 0)
    : (hintLimit > 0 ? toKuDigits(Math.max(0, (hintCount || 0) <= 0 ? 0 : hintLimit - hintTaps)) : null);

  const displayMagnetCount = isShop
    ? toKuDigits(magnetCount || 0)
    : toKuDigits((magnetUsedInRound || (magnetCount || 0) <= 0) ? 0 : 1);

  const displaySkipCount = isShop
    ? toKuDigits(skipCount || 0)
    : (skipLimit > 0 ? toKuDigits(Math.max(0, (skipCount || 0) <= 0 ? 0 : skipLimit - skipsUsedInRound)) : null);

  const isHintDisabled = !isShop && (hintTaps >= hintLimit || hintLimit === 0 || (hintCount || 0) <= 0);
  const isMagnetDisabled = !isShop && (magnetUsedInRound || (magnetCount || 0) <= 0);
  const isSkipDisabled = !isShop && (skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0);

  return (
    <div className={`flex items-center justify-center min-h-14 py-2 w-full ${className}`}>
      <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 py-1 px-1 sm:px-4 h-auto">
        
        {/* Hint Item */}
        <Motion.div 
          className="shrink-0"
          initial={isTutorialFocus ? { opacity: 0, scale: 0, y: 20 } : false}
          animate={getAnimate('bulb')}
          transition={getTransition(0.8)}
        >
          <PowerUpButton 
            id="btn-hint"
            icon={HintIcon}
            count={displayHintCount}
            disabled={isHintDisabled}
            onClick={onHint}
            colorTheme="blue"
            ariaLabel="Use Hint"
          />
        </Motion.div>

        {/* Magnet Item */}
        <Motion.div 
          className="shrink-0"
          initial={isTutorialFocus ? { opacity: 0, scale: 0, y: 20 } : false}
          animate={getAnimate('magnet')}
          transition={getTransition(1.6)}
        >
          <PowerUpButton 
            id="btn-magnet"
            icon={MagnetIcon}
            count={displayMagnetCount}
            disabled={isMagnetDisabled}
            onClick={onMagnet}
            colorTheme="green"
            ariaLabel="Use Magnet"
          />
        </Motion.div>

        {!hideSkip && (
          <Motion.div 
            className="shrink-0"
            initial={isTutorialFocus ? { opacity: 0, scale: 0, y: 20 } : false}
            animate={getAnimate('skip')}
            transition={getTransition(2.4)}
          >
            <PowerUpButton 
              id="btn-skip"
              icon={SkipIcon}
              count={displaySkipCount}
              disabled={isSkipDisabled}
              onClick={onSkip}
              colorTheme="yellow"
              ariaLabel="Use Skip"
            />
          </Motion.div>
        )}

      </div>
    </div>
  );
};

export default React.memo(InventoryBar);
