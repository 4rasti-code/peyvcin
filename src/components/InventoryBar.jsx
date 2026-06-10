import React from 'react';
import { toKuDigits } from '../utils/formatters';
import { HintIcon, MagnetIcon, SkipIcon } from './CurrencyIcon';

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
  className = ""
}) => {
  const countColor = "text-mono-950 dark:text-mono-100";
  const sepColor = "bg-mono-200 dark:bg-white/10";

  return (
    <div className={`flex items-center justify-center h-[52px] ${className}`}>
      <div className="flex items-center gap-10 py-1 px-4 h-full">
        
        {/* Hint Item */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onHint}
            disabled={!isShop && (hintTaps >= hintLimit || hintLimit === 0 || (hintCount || 0) <= 0)}
            className="flex items-center gap-2 group transition-all active:scale-90"
            id="btn-hint"
            name="btn-hint"
            aria-label="Use Hint"
          >
            <HintIcon 
              disabled={isShop ? (hintCount || 0) <= 0 : (hintTaps >= hintLimit || (hintCount || 0) <= 0)}
              className={`w-6 h-6 transition-all ${isShop ? ((hintCount || 0) <= 0 ? 'opacity-50' : 'drop-shadow-md') : ((hintTaps >= hintLimit || (hintCount || 0) <= 0) ? 'opacity-50' : 'drop-shadow-md')}`} 
            />
            
            <div className="flex flex-col leading-none">
              {isShop && (
                <span className={`text-[15px] font-black ${countColor}`}>
                  {toKuDigits(hintCount || 0)}
                </span>
              )}
              {!isShop && hintLimit > 0 && (
                <span className={`text-[15px] font-black ${(hintTaps >= hintLimit || (hintCount || 0) <= 0) ? 'text-red-400/50' : countColor}`}>
                  {toKuDigits(Math.max(0, (hintCount || 0) <= 0 ? 0 : hintLimit - hintTaps))}
                </span>
              )}
            </div>
          </button>
        </div>

        <div className={`w-px h-4 ${sepColor}`} />

        {/* Magnet Item */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMagnet}
            disabled={!isShop && (magnetUsedInRound || (magnetCount || 0) <= 0)}
            className="flex items-center gap-2 group transition-all active:scale-90"
            id="btn-magnet"
            name="btn-magnet"
            aria-label="Use Magnet"
          >
            <MagnetIcon 
              disabled={isShop ? (magnetCount || 0) <= 0 : (magnetUsedInRound || (magnetCount || 0) <= 0)}
              className={`w-6 h-6 transition-all ${isShop ? ((magnetCount || 0) <= 0 ? 'opacity-50' : 'drop-shadow-md') : ((magnetUsedInRound || (magnetCount || 0) <= 0) ? 'opacity-50' : 'drop-shadow-md')}`} 
            />
            
            <div className="flex flex-col leading-none">
              {isShop && (
                <span className={`text-[15px] font-black ${countColor}`}>
                  {toKuDigits(magnetCount || 0)}
                </span>
              )}
              {!isShop && (
                <span className={`text-[15px] font-black ${(magnetUsedInRound || (magnetCount || 0) <= 0) ? 'text-red-400/50' : countColor}`}>
                  {toKuDigits((magnetUsedInRound || (magnetCount || 0) <= 0) ? 0 : 1)}
                </span>
              )}
            </div>
          </button>
        </div>

        <div className={`w-px h-4 ${sepColor}`} />

        {/* Skip Item */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onSkip}
            disabled={!isShop && (skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0)}
            className="flex items-center gap-2 group transition-all active:scale-90"
            id="btn-skip"
            name="btn-skip"
            aria-label="Use Skip"
          >
            <SkipIcon 
              disabled={isShop ? (skipCount || 0) <= 0 : (skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0)}
              className={`w-6 h-6 transition-all ${isShop ? ((skipCount || 0) <= 0 ? 'opacity-50' : 'drop-shadow-md') : ((skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0) ? 'opacity-50' : 'drop-shadow-md')}`} 
            />
            
            <div className="flex flex-col leading-none">
              {isShop && (
                <span className={`text-[15px] font-black ${countColor}`}>
                  {toKuDigits(skipCount || 0)}
                </span>
              )}
              {!isShop && skipLimit > 0 && (
                <span className={`text-[15px] font-black ${(skipsUsedInRound >= skipLimit || (skipCount || 0) <= 0) ? 'text-red-400/50' : countColor}`}>
                  {toKuDigits(Math.max(0, (skipCount || 0) <= 0 ? 0 : skipLimit - skipsUsedInRound))}
                </span>
              )}
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(InventoryBar);
