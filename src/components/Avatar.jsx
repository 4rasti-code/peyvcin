import React from 'react';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';

/**
 * Avatar Component
 * Handles dual-source logic: local assets vs Supabase Storage URLs.
 * Implements smart versioning (?v=) for remote images to bypass cache.
 */
export default function Avatar({ 
  src, 
  symbol, 
  updatedAt, 
  lastActive, // Timestamp to check online status
  showStatus = false,
  className = "", 
  size = "md", // 'sm', 'md', 'lg', 'xl', '2xl'
  border = true
}) {
  const isRemote = typeof src === 'string' && src.startsWith('http');
  const avatarData = AVATARS.find(a => a.id === src);
  
  // Calculate online status (if provided & within 3 minutes)
  const isOnline = showStatus && lastActive && (new Date() - new Date(lastActive)) < 3 * 60 * 1000;
  
  // Asset vs. Storage Logic: ONLY apply versioning if it's a remote URL
  let displaySrc = avatarData?.img || (isRemote ? src : null);
  
  if (isRemote && updatedAt) {
    try {
      const timestamp = new Date(updatedAt).getTime();
      if (!isNaN(timestamp)) {
        displaySrc = `${src}${src.includes('?') ? '&' : '?'}v=${timestamp}`;
      }
    } catch (e) {
      console.warn("Avatar timestamp error:", e);
    }
  }

  const hasImage = !!displaySrc;
  
  // Standardised sizes based on existing UI
  const sizeClasses = {
    'xs': 'w-8 h-8 text-xs',
    'sm': 'w-10 h-10 text-lg',
    'md': 'w-12 h-12 text-xl',
    'lg': 'w-14 h-14 text-2xl',
    'xl': 'w-20 h-20 text-4xl',
    '2xl': 'w-28 h-28 text-5xl',
    'full': 'w-full h-full text-3xl'
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses['md'];

  return (
    <div className={`relative shrink-0 rounded-full overflow-hidden ${selectedSizeClass} ${border ? 'border border-white/10' : ''} ${className}`}>
      <div className="w-full h-full flex items-center justify-center relative">
        {hasImage ? (
          <img 
            src={displaySrc} 
            alt="User Avatar" 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className={`w-full h-full flex items-center justify-center bg-slate-800 ${hasImage ? 'hidden' : ''}`}
        >
          <span className="select-none leading-none drop-shadow-md flex items-center justify-center">
             {symbol || avatarData?.symbol || (src && src !== 'default' && !isRemote ? '👤' : DEFAULT_AVATAR.symbol)}
          </span>
        </div>

        {showStatus && isOnline && (
          <div className="absolute inset-0 border-2 border-emerald-500/50 pointer-events-none animate-pulse z-10" />
        )}
      </div>
      
      {/* STATUS INDICATORS - Outside overflow-hidden */}
      {showStatus && (
        <div className={`absolute bottom-0 right-0 ${size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-3.5 h-3.5'} ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-600'} border-2 border-slate-900 rounded-full z-20 transition-all duration-300`} />
      )}
    </div>
  );
}
