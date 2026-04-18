import React from 'react';
import { toKuDigits } from '../utils/formatters';

export default function InventoryBar({ 
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
}) {
  const Item = ({ icon, color, count, onClick, disabled, glowColor, hideCount = false }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 group transition-all ${disabled ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-90'} ${isShop ? 'cursor-default' : ''}`}
    >
      <span 
        className={`material-symbols-outlined text-[24px] ${color} drop-shadow-[0_0_8px_${glowColor}]`} 
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      {!hideCount && (
        <>
          <span className="w-1.5 h-1.5 bg-white/10 rounded-full shrink-0" />
          <span className={`text-[13px] font-black  pt-0.5 ${disabled ? 'text-white/20' : 'text-white/60'}`}>
            {toKuDigits(count || 0)}
          </span>
        </>
      )}
    </button>
  );

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 px-7 py-3.5 rounded-[2.5rem] flex items-center gap-7 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        
        {/* Hint (Bulb) */}
        <div className="relative group/hint">
          <Item 
            icon="lightbulb" 
            color={hintTaps >= hintLimit ? "text-slate-500" : "text-amber-500"} 
            glowColor={hintTaps >= hintLimit ? "transparent" : "rgba(245,158,11,0.5)"}
            count={hintCount}
            onClick={onHint}
            disabled={!isShop && (hintTaps >= hintLimit || hintLimit === 0)}
          />
          {!isShop && hintLimit > 0 && (
            <div className={`absolute -top-11 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg text-[11px] font-black tabular-nums transition-all border shadow-2xl backdrop-blur-2xl flex items-center justify-center whitespace-nowrap min-w-[36px] ${
              hintTaps >= hintLimit 
                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
            }`}>
              <span className="opacity-80 scale-90 mr-1">💡</span>
              <span className="px-1">{toKuDigits(hintTaps)}</span>
              <span className="opacity-30">/</span>
              <span className="px-1">{toKuDigits(hintLimit)}</span>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-white/5" />

        {/* Magnet (Magic Wand) */}
        <Item 
          icon="magic_button" 
          color="text-purple-500" 
          glowColor="rgba(168,85,247,0.5)"
          count={magnetCount}
          onClick={onMagnet}
          disabled={!isShop && magnetUsedInRound}
        />

        <div className="w-px h-5 bg-white/5" />

        {/* Skip (Fast Forward) */}
        <Item 
          icon="fast_forward" 
          color="text-blue-500" 
          glowColor="rgba(59,130,246,0.5)"
          count={skipCount}
          onClick={onSkip}
          hideCount={!isShop}
        />

      </div>
    </div>
  );
}
