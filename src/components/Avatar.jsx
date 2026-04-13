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
  className = "", 
  size = "md", // 'sm', 'md', 'lg', 'xl', '2xl'
  border = true
}) {
  const isRemote = typeof src === 'string' && src.startsWith('http');
  const avatarData = AVATARS.find(a => a.id === src);
  
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
    'xs': 'w-8 h-8 text-sm',
    'sm': 'w-10 h-10 text-xl',
    'md': 'w-12 h-12 text-2xl',
    'lg': 'w-14 h-14 text-2xl',
    'xl': 'w-20 h-20 text-4xl',
    '2xl': 'w-28 h-28 text-5xl'
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses['md'];

  return (
    <div className={`rounded-full flex items-center justify-center overflow-hidden shrink-0 relative ${selectedSizeClass} ${border ? 'border border-white/10' : ''} ${className}`}>
      {hasImage ? (
        <img 
          src={displaySrc} 
          alt="User Avatar" 
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // If the image fails to load, fallback to symbol
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      <div 
        className={`w-full h-full items-center justify-center bg-slate-800 ${hasImage ? 'hidden' : 'flex'}`}
      >
        <span className="select-none leading-none drop-shadow-md">
           {symbol || avatarData?.symbol || (src && src !== 'default' && !isRemote ? '👤' : DEFAULT_AVATAR.symbol)}
        </span>
      </div>
    </div>
  );
}
