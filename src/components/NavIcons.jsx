import React from 'react';

const svgProps = { 
  viewBox: "0 0 100 100", 
  xmlns: "http://www.w3.org/2000/svg",
  style: { overflow: 'visible' }
};

const IconWrapper = ({ children, isActive, className }) => (
  <svg {...svgProps} className={`${className} transition-all duration-300 ${!isActive ? 'opacity-95 dark:opacity-70 scale-[0.90]' : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] scale-110 -translate-y-1'}`}>
    {children}
  </svg>
);

export function NavProfileIcon({ className = "w-10 h-10", isActive = false, avatarUrl }) {
  // If the user has a custom avatar, display it inside a circle
  if (avatarUrl) {
    return (
      <div className={`${className} transition-all duration-300 rounded-full overflow-hidden border-[3px] ${isActive ? 'border-emerald-500 scale-110 -translate-y-1 shadow-[0_4px_12px_rgba(16,185,129,0.3)] dark:shadow-[0_4px_12px_rgba(16,185,129,0.4)]' : 'border-mono-400 dark:border-mono-500 opacity-100 scale-95'}`}>
         <img src={avatarUrl} className="w-full h-full object-cover" alt="Profile" />
      </div>
    );
  }

  // Premium, sleek default user profile SVG fallback
  return (
    <IconWrapper isActive={isActive} className={className}>
      <defs>
        <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="userGlare" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '50% 50%' }}>
        {/* Soft shadow */}
        <ellipse cx="50" cy="85" rx="35" ry="8" className="fill-blue-900/20 dark:fill-blue-900/40" />
        
        {/* User Body (Smooth Shoulders) */}
        <path d="M 15 85 C 15 65, 30 55, 50 55 C 70 55, 85 65, 85 85 Z" fill="url(#userGrad)" />
        <path d="M 15 85 C 15 65, 30 55, 50 55 C 70 55, 85 65, 85 85 Z" fill="url(#userGlare)" />
        
        {/* User Head (Perfect Circle with overlap) */}
        <circle cx="50" cy="35" r="20" fill="url(#userGrad)" />
        <circle cx="50" cy="35" r="20" fill="url(#userGlare)" />
        
        {/* Head shadow on body */}
        <path d="M 36 55 C 44 60, 56 60, 64 55 C 60 52, 40 52, 36 55 Z" fill="#000000" opacity="0.15" />
        
        {/* Glossy Edge / Highlight for premium feel */}
        <path d="M 15 85 C 15 65, 30 55, 50 55 C 70 55, 85 65, 85 85 Z" className="stroke-white/30" fill="none" strokeWidth="2" />
        <circle cx="50" cy="35" r="20" className="stroke-white/30" fill="none" strokeWidth="2" />
      </g>
    </IconWrapper>
  );
}

export function NavLeaderboardIcon({ className = "w-10 h-10", isActive = false }) {
  // Premium, sleek Trophy (Redesigned for better shape and brighter gold)
  return (
    <IconWrapper isActive={isActive} className={className}>
      <defs>
        <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="trophyGlare" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '50% 50%' }}>
        {/* Soft shadow */}
        <ellipse cx="50" cy="88" rx="28" ry="5" fill="rgba(0,0,0,0.2)" />
        
        {/* Base */}
        <path d="M 30 85 L 70 85 C 72 85, 73 83, 72 81 L 65 73 L 35 73 L 28 81 C 27 83, 28 85, 30 85 Z" fill="url(#trophyGrad)" />
        
        {/* Stem */}
        <rect x="42" y="65" width="16" height="8" fill="url(#trophyGrad)" />
        
        {/* Handles */}
        <path d="M 28 35 C 5 35, 10 60, 35 55" fill="none" stroke="url(#trophyGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 72 35 C 95 35, 90 60, 65 55" fill="none" stroke="url(#trophyGrad)" strokeWidth="6" strokeLinecap="round" />
        
        {/* Cup Body */}
        <path d="M 20 25 L 80 25 C 80 55, 68 65, 50 65 C 32 65, 20 55, 20 25 Z" fill="url(#trophyGrad)" />
        
        {/* Inner Glass Edge */}
        <path d="M 23 27 C 23 53, 34 62, 50 62 C 66 62, 77 53, 77 27" fill="none" stroke="url(#trophyGlare)" strokeWidth="2" />
        
        {/* Cup Top / Bowl */}
        <ellipse cx="50" cy="25" rx="30" ry="6" fill="#78350f" />
        <ellipse cx="50" cy="25" rx="30" ry="6" fill="none" stroke="url(#trophyGrad)" strokeWidth="2" />
        
        {/* Star */}
        <path d="M 50 36 L 52.5 42 L 59 42 L 54 46.5 L 56 53 L 50 49 L 44 53 L 46 46.5 L 41 42 L 47.5 42 Z" fill="#ffffff" opacity="0.95" />
      </g>
    </IconWrapper>
  );
}

export function NavLobbyIcon({ className = "w-10 h-10", isActive = false }) {
  // Premium Gamepad (Flawless Geometric Primitives - 100% Sleek & Beautiful)
  return (
    <IconWrapper isActive={isActive} className={className}>
      <g style={{ transformOrigin: '50% 50%' }}>
        {/* Soft shadow */}
        <ellipse cx="50" cy="85" rx="40" ry="6" className="fill-mono-900/20 dark:fill-black/40" />
        
        {/* Triggers (Only two, slightly shorter) */}
        <rect x="18" y="24" width="14" height="10" rx="3" className="fill-mono-900 dark:fill-mono-200" />
        <rect x="68" y="24" width="14" height="10" rx="3" className="fill-mono-900 dark:fill-mono-200" />
        
        {/* Main Body (Flawless Geometric Primitives merged into a beautiful silhouette) */}
        <g className="fill-mono-900 dark:fill-mono-200">
          {/* Grips (Flaring outwards perfectly) */}
          <rect x="12" y="35" width="24" height="42" rx="12" transform="rotate(20 24 35)" />
          <rect x="64" y="35" width="24" height="42" rx="12" transform="rotate(-20 76 35)" />
          
          {/* Top Body (Smooth rounded rectangle) */}
          <path d="M 26 30 L 74 30 A 12 12 0 0 1 86 42 L 86 50 L 14 50 L 14 42 A 12 12 0 0 1 26 30 Z" />
          
          {/* Joystick Bulges (Smooth bottom curves) */}
          <circle cx="35" cy="55" r="16" />
          <circle cx="65" cy="55" r="16" />
          
          {/* Center fill (to prevent any gaps) */}
          <rect x="30" y="45" width="40" height="10" />
        </g>
        
        {/* D-Pad (4 Distinct Thick Blocks) - Left side */}
        <g className="fill-mono-100 dark:fill-mono-800">
          <rect x="21" y="34" width="4" height="6" rx="1" /> {/* Top */}
          <rect x="21" y="46" width="4" height="6" rx="1" /> {/* Bottom */}
          <rect x="14" y="41" width="6" height="4" rx="1" /> {/* Left */}
          <rect x="26" y="41" width="6" height="4" rx="1" /> {/* Right */}
        </g>
        
        {/* Action Buttons (SNES Colors) - Right side */}
        <circle cx="77" cy="37" r="3.5" fill="#eab308" /> {/* Top / Yellow */}
        <circle cx="84" cy="44" r="3.5" fill="#ef4444" /> {/* Right / Red */}
        <circle cx="77" cy="51" r="3.5" fill="#38bdf8" /> {/* Bottom / Blue */}
        <circle cx="70" cy="44" r="3.5" fill="#22c55e" /> {/* Left / Green */}
        
        {/* Select / Start / Analog Buttons */}
        <rect x="41" y="40" width="6" height="2" rx="1" className="fill-mono-100 dark:fill-mono-800" /> {/* Select */}
        <path d="M 55 39 L 59 41 L 55 43 Z" className="fill-mono-100 dark:fill-mono-800" /> {/* Start */}
        <rect x="48" y="48" width="4" height="2" rx="1" fill="#ef4444" /> {/* Analog Light */}
        
        {/* Joysticks (Solid analog sticks, dark gray, sitting perfectly on the bottom bulges) */}
        {/* Base shadow */}
        <circle cx="35" cy="59" r="8" className="fill-mono-950/40 dark:fill-black/40" />
        <circle cx="65" cy="59" r="8" className="fill-mono-950/40 dark:fill-black/40" />
        
        {/* Joysticks */}
        <circle cx="35" cy="58" r="8" className="fill-mono-700 dark:fill-mono-400" />
        <circle cx="35" cy="58" r="4" className="fill-mono-900 dark:fill-mono-200" />
        
        <circle cx="65" cy="58" r="8" className="fill-mono-700 dark:fill-mono-400" />
        <circle cx="65" cy="58" r="4" className="fill-mono-900 dark:fill-mono-200" />
      </g>
    </IconWrapper>
  );
}

export function NavStoreIcon({ className = "w-10 h-10", isActive = false }) {
  // Premium 3D Storefront (Perfectly matches the provided image with rich 3D shading)
  return (
    <IconWrapper isActive={isActive} className={className}>
      <defs>
        <linearGradient id="awningRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="awningWhite" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5e5e5" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '50% 50%' }}>
        {/* Soft ground shadow */}
        <ellipse cx="50" cy="85" rx="36" ry="6" className="fill-mono-900/20 dark:fill-black/40" />
        
        {/* Building Base */}
        <rect x="20" y="30" width="60" height="52" rx="6" fill="url(#buildingGrad)" />
        
        {/* Doormat */}
        <rect x="25" y="80" width="22" height="4" rx="2" fill="#94a3b8" />
        
        {/* Door Outer Frame */}
        <rect x="27" y="52" width="18" height="30" rx="2" fill="#0284c7" />
        {/* Inner Door */}
        <rect x="29" y="54" width="14" height="28" rx="1" fill="#38bdf8" />
        {/* Doorknob */}
        <circle cx="40" cy="68" r="1.5" fill="#ffffff" />
        
        {/* Window Outer Frame */}
        <rect x="52" y="52" width="20" height="20" rx="3" fill="#0284c7" />
        {/* Inner Window Glass */}
        <rect x="55" y="55" width="14" height="14" rx="1.5" fill="url(#glassGrad)" />
        {/* Window Glare (Diagonal highlight) */}
        <path d="M 55 64 L 64 55 L 69 55 L 55 69 Z" fill="#ffffff" opacity="0.4" />
        
        {/* Awning Canopy Group with Realistic 3D Drop Shadow */}
        <g className="drop-shadow-[0_4px_3px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_4px_3px_rgba(0,0,0,0.5)]">
          {/* Stripe 1 (Left Red) - Slopes left and has top-left rounded corner */}
          <path d="M 15 45 A 7 7 0 0 1 29 45 L 32 20 L 26 20 C 22 20, 20 22, 20 26 Z" fill="url(#awningRed)" />
          {/* Stripe 2 (White) */}
          <path d="M 29 45 A 7 7 0 0 1 43 45 L 44 20 L 32 20 Z" fill="url(#awningWhite)" />
          {/* Stripe 3 (Red) */}
          <path d="M 43 45 A 7 7 0 0 1 57 45 L 56 20 L 44 20 Z" fill="url(#awningRed)" />
          {/* Stripe 4 (White) */}
          <path d="M 57 45 A 7 7 0 0 1 71 45 L 68 20 L 56 20 Z" fill="url(#awningWhite)" />
          {/* Stripe 5 (Right Red) - Slopes right and has top-right rounded corner */}
          <path d="M 71 45 A 7 7 0 0 1 85 45 L 80 26 C 80 22, 78 20, 74 20 L 68 20 Z" fill="url(#awningRed)" />
        </g>
      </g>
    </IconWrapper>
  );
}

export function NavChatIcon({ className = "w-10 h-10", isActive = false }) {
  // Premium, sleek Global Chat Bubbles (Cyan/Blue standard)
  return (
    <IconWrapper isActive={isActive} className={className}>
      <defs>
        <linearGradient id="chatGlobalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="chatGrey" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="chatGlare" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '50% 50%' }}>
        {/* Soft shadow */}
        <ellipse cx="45" cy="88" rx="32" ry="6" fill="rgba(0,0,0,0.2)" />
        
        {/* Back Bubble (Grey) */}
        <path d="M 38 35 C 38 23, 48 15, 60 15 C 72 15, 82 23, 82 35 C 82 47, 72 55, 60 55 L 45 62 L 48 52 C 42 48, 38 42, 38 35 Z" fill="url(#chatGrey)" />
        <path d="M 40 35 C 40 25, 49 17, 60 17 C 71 17, 80 25, 80 35 C 80 45, 71 53, 60 53 L 49 58 L 51 51 C 45 47, 40 42, 40 35 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
        
        {/* Front Bubble (Blue/Cyan) */}
        <path d="M 20 54 C 20 38, 33 28, 50 28 C 67 28, 80 38, 80 54 C 80 70, 67 80, 50 80 L 28 88 L 33 76 C 25 71, 20 63, 20 54 Z" fill="url(#chatGlobalGrad)" />
        
        {/* Inner Glass Edge */}
        <path d="M 22 54 C 22 40, 34 30, 50 30 C 66 30, 78 40, 78 54 C 78 68, 66 78, 50 78 L 32 84 L 36 74 C 29 70, 22 63, 22 54 Z" fill="none" stroke="url(#chatGlare)" strokeWidth="2" />
        
        {/* Typing Dots */}
        <circle cx="36" cy="54" r="4.5" fill="#ffffff" />
        <circle cx="50" cy="54" r="4.5" fill="#ffffff" />
        <circle cx="64" cy="54" r="4.5" fill="#ffffff" />
      </g>
    </IconWrapper>
  );
}
