import React from 'react';
import { toKuDigits } from '../utils/formatters';

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
  isShop = false,
  className = ""
}) => {
  const Item = ({ icon, color, count, onClick, disabled, glowHex, hideCount = false }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 group transition-all ${disabled ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-90'} ${isShop ? 'cursor-default' : ''}`}
    >
      <span 
        className={`material-symbols-outlined text-[22px] ${color}`} 
        style={{ 
          fontVariationSettings: "'FILL' 1",
          filter: `drop-shadow(0 0 8px ${glowHex})`
        }}
      >
        {icon}
      </span>
      {!hideCount && (
        <span className={`text-[13px] font-black pt-0.5 ${disabled ? 'text-slate-300' : 'text-slate-500'}`}>
          {toKuDigits(count || 0)}
        </span>
      )}
    </button>
  );

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-8 py-2">
        
        {/* Hint (Bulb) */}
        <div className="relative flex items-center gap-1.5">
          <button 
            onClick={onHint}
            disabled={!isShop && (hintTaps >= hintLimit || hintLimit === 0)}
            className={`flex items-center gap-2 group transition-all ${(!isShop && (hintTaps >= hintLimit || hintLimit === 0)) ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-90'}`}
          >
            <span 
              className={`material-symbols-outlined text-[22px] ${hintTaps >= hintLimit ? "text-slate-500" : "text-amber-500"}`} 
              style={{ 
                fontVariationSettings: "'FILL' 1",
                filter: hintTaps >= hintLimit ? 'none' : 'drop-shadow(0 0 8px rgba(245,158,11,0.5))'
              }}
            >
              lightbulb
            </span>
            {isShop ? (
              <span className="text-[13px] font-black pt-0.5 text-slate-500">
                {toKuDigits(hintCount || 0)}
              </span>
            ) : (
              hintLimit > 0 && (
                <span className={`text-[13px] font-black pt-0.5 ${hintTaps >= hintLimit ? 'text-red-400' : 'text-slate-400'}`}>
                  {toKuDigits(hintTaps)}/{toKuDigits(hintLimit)}
                </span>
              )
            )}
          </button>
        </div>

        <div className="w-[1px] h-4 bg-white/10" />

        {/* Magnet (Magic Wand) */}
        <Item 
          icon="auto_fix_high" 
          color="text-purple-500" 
          glowHex="rgba(168,85,247,0.5)"
          count={magnetCount}
          onClick={onMagnet}
          disabled={!isShop && magnetUsedInRound}
        />

        <div className="w-[1px] h-4 bg-white/10" />

        {/* Skip (Fast Forward) */}
        <Item 
          icon="fast_forward" 
          color="text-blue-500" 
          glowHex="rgba(59,130,246,0.5)"
          count={skipCount}
          onClick={onSkip}
          hideCount={!isShop} 
        />

      </div>
    </div>
  );
};

export default React.memo(InventoryBar);
