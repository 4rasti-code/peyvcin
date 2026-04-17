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
  const Item = ({ icon, color, count, onClick, disabled, glowColor }) => (
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
      <span className="w-1.5 h-1.5 bg-white/10 rounded-full shrink-0" />
      <span className={`text-[13px] font-black font-ui pt-0.5 ${disabled ? 'text-white/20' : 'text-white/60'}`}>
        {toKuDigits(count || 0)}
      </span>
    </button>
  );

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 px-7 py-3.5 rounded-[2.5rem] flex items-center gap-7 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        
        {/* Hint (Bulb) */}
        <Item 
          icon="lightbulb" 
          color="text-amber-500" 
          glowColor="rgba(245,158,11,0.5)"
          count={hintCount}
          onClick={onHint}
          disabled={!isShop && hintTaps >= hintLimit}
        />

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
        />

      </div>
    </div>
  );
}
