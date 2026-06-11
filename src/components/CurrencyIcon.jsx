import React from 'react';

/**
 * High-Fidelity Kurdish & Ayyubid Historical Currency Icons
 * Refined to match real medieval hammered coin references.
 * 
 * 1. Fils (Bronze - Marwanid Eagle)
 * 2. Derhem (Silver - Square-in-Circle Seljuk style)
 * 3. Dinar (Gold - Ayyubid Concentric Dinar)
 */

// Shared "Hammered" coin base with irregular hand-struck edges
const HammeredBase = ({ fill, stroke, opacity = 1 }) => (
  <path
    d="M50 4.5C28 3.5 6 12 5 35C4 58 13 88 40 95C67 102 96 87 95 60C94 33 82 5.5 50 4.5Z"
    fill={fill}
    stroke={stroke}
    strokeWidth="3"
    fillOpacity={opacity}
  />
);

export const FilsIcon = ({ className = "w-5 h-5", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <HammeredBase fill="#5D3A1A" stroke="#3E2711" />
    {/* Beaded Inner Border */}
    <circle cx="50" cy="50" r="38" fill="none" stroke="#CD7F32" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
    {/* Marwanid Double-Headed Eagle (Artuqid style "Y" silhouette) */}
    <path
      d="M50 42L42 22L30 30M50 42L58 22L70 30M50 42V82M35 55L45 50M65 55L55 50M40 75L50 68L60 75"
      stroke="#CD7F32"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M48 85H52M38 45Q50 35 62 45M45 42L55 42"
      stroke="#CD7F32"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Surface Imperfections */}
    <circle cx="25" cy="35" r="1.5" fill="#3E2711" opacity="0.3" />
    <circle cx="75" cy="65" r="2" fill="#3E2711" opacity="0.2" />
  </svg>
);

export const DerhemIcon = ({ className = "w-5 h-5", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <HammeredBase fill="#A0A0A0" stroke="#2D2D2D" />
    {/* Beaded Inner Rim (Hand-punched look) */}
    <circle cx="50" cy="50" r="38" fill="none" stroke="#2D2D2D" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.4" />

    {/* Literal Kufic Script Scribbles (represented by horizontal 'toothy' paths) */}
    <g transform="translate(10, 0)">
      <path
        d="M25 38H65M27 35V41M35 35V42M48 35V41M58 35V42"
        stroke="#2D2D2D"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M22 50H68M25 47V53M38 47V54M52 47V53M62 47V54"
        stroke="#2D2D2D"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M28 62H62M32 59V65M45 59V66M55 59V65"
        stroke="#2D2D2D"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>

    {/* Surface Highlighting to simulate minted metal */}
    <path
      d="M25 38H65"
      stroke="#E8E8E8"
      strokeWidth="1"
      transform="translate(11, -1)"
      opacity="0.6"
    />

    {/* Rim Script Scribbles (Circular arrangement) */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
      <path
        key={a}
        d="M50 12Q55 10 60 12"
        stroke="#2D2D2D"
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${a} 50 50)`}
        opacity="0.5"
      />
    ))}
  </svg>
);

export const DinarIcon = ({ className = "w-5 h-5", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <HammeredBase fill="#B8860B" stroke="#846506" />
    {/* Concentric Ayyubid Rings */}
    <circle cx="50" cy="50" r="42" stroke="#FFD700" strokeWidth="2" opacity="0.8" />
    <circle cx="50" cy="50" r="30" stroke="#FFD700" strokeWidth="3" opacity="0.9" />
    <circle cx="50" cy="50" r="12" stroke="#FFD700" strokeWidth="4" />
    {/* Calligraphic Symbols/Scribbles */}
    <path d="M42 50H58M50 42V58" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 50Q25 25 50 25Q75 25 78 50M22 50Q25 75 50 75Q75 75 78 50" stroke="#FFD700" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
    {/* Rim lettering markers */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
      <rect key={a} x="48" y="8" width="4" height="2" fill="#FFD700" transform={`rotate(${a} 50 50)`} opacity="0.7" />
    ))}
  </svg>
);

// High-Fidelity PowerUp Icons

export const HintIcon = ({ className = "w-5 h-5", size = 24, animate = false, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {animate && (
      <style>
        {`
          .bulb-glass { animation: turnOn 1.5s ease-out forwards; animation-delay: 0.2s; fill: #4B5563; }
          @keyframes turnOn {
            0%, 30% { fill: #4B5563; }
            100% { fill: #FBBF24; filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4)); }
          }
        `}
      </style>
    )}
    <path className={animate ? "bulb-glass" : ""} d="M50 15C33.4 15 20 28.4 20 45C20 58.3 28.6 69.5 40 73V80C40 82.8 42.2 85 45 85H55C57.8 85 60 82.8 60 80V73C71.4 69.5 80 58.3 80 45C80 28.4 66.6 15 50 15Z" fill={disabled ? "#6B7280" : "#FBBF24"} />
    <path d="M42 87H58V94H42V87Z" fill={disabled ? "#4B5563" : "#9CA3AF"} />
  </svg>
);

export const MagnetIcon = ({ className = "w-5 h-5", size = 24, animate = false, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {animate && (
      <style>
        {`
          .zap-flash { animation: zapPulse 2s infinite; opacity: 0; }
          .zap-flash-2 { animation-delay: 0.3s; }
          @keyframes zapPulse {
            0%, 85% { opacity: 0; transform: scale(0.8) translate(5px, 5px); }
            88% { opacity: 1; transform: scale(1.1) translate(0, 0); }
            92% { opacity: 0; transform: scale(0.9) translate(2px, 2px); }
            95% { opacity: 1; transform: scale(1) translate(0, 0); }
            100% { opacity: 0; }
          }
        `}
      </style>
    )}
    <path d="M30 45C30 33.9543 38.9543 25 50 25C61.0457 25 70 33.9543 70 45V75H85V45C85 25.67 69.33 10 50 10C30.67 10 15 25.67 15 45V75H30V45Z" fill={disabled ? "#6B7280" : "#EF4444"} />
    <path d="M15 78H30V90H15V78Z" fill={disabled ? "#4B5563" : "#9CA3AF"} />
    <path d="M70 78H85V90H70V78Z" fill={disabled ? "#4B5563" : "#9CA3AF"} />
    {animate && (
      <>
        <path className="zap-flash" d="M42 84L48 78L45 92L52 84" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path className="zap-flash zap-flash-2" d="M58 84L52 78L55 92L48 84" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

export const SkipIcon = ({ className = "w-5 h-5", size = 24, animate = false, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {animate && (
      <style>
        {`
          .skip-pulse { animation: skipAnim 2s infinite ease-in-out; }
          .skip-pulse-2 { animation-delay: 0.2s; }
          @keyframes skipAnim {
            0%, 100% { transform: translateX(0); opacity: 1; }
            50% { transform: translateX(6px); opacity: 0.5; }
          }
        `}
      </style>
    )}
    <circle cx="50" cy="50" r="45" fill={disabled ? "#6B7280" : "#3B82F6"} />
    <g className={animate ? "skip-pulse" : ""}>
      <path d="M28 30V70L52 50Z" fill={disabled ? "#9CA3AF" : "#FFFFFF"} />
    </g>
    <g className={animate ? "skip-pulse skip-pulse-2" : ""}>
      <path d="M56 30V70L80 50Z" fill={disabled ? "#9CA3AF" : "#FFFFFF"} />
    </g>
  </svg>
);

// Achievement SVGs
export const Level10Icon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className={disabled ? "stroke-gray-500" : "stroke-black dark:stroke-white"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      {/* Amber Circle Badge */}
      <circle cx="50" cy="50" r="42" className={disabled ? "fill-gray-500" : "fill-amber-500 dark:fill-amber-400"} />
      {/* White Shield */}
      <path d="M 50 25 L 30 30 V 50 C 30 65 50 75 50 75 C 50 75 70 65 70 50 V 30 Z" fill={disabled ? "#D1D5DB" : "#FFFFFF"} />
      {/* Small Amber Star */}
      <path d="M 50 38 L 52 44 H 58 L 53 48 L 55 54 L 50 50 L 45 54 L 47 48 L 42 44 H 48 Z" className={disabled ? "fill-gray-400" : "fill-amber-500 dark:fill-amber-400"} />
    </g>
  </svg>
);

export const KawaHammerIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className={disabled ? "stroke-gray-500" : "stroke-black dark:stroke-white"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      {/* Red Hexagon Badge */}
      <path d="M 50 10 L 85 30 V 70 L 50 90 L 15 70 V 30 Z" className={disabled ? "fill-gray-500" : "fill-red-500 dark:fill-red-400"} />
      {/* White Hammer */}
      <rect x="42" y="50" width="16" height="28" rx="2" fill={disabled ? "#D1D5DB" : "#FFFFFF"} />
      <rect x="25" y="30" width="50" height="20" rx="4" fill={disabled ? "#D1D5DB" : "#FFFFFF"} />
      {/* Action Sparks */}
      <path d="M 32 22 L 38 28 M 50 18 L 50 26 M 68 22 L 62 28" />
    </g>
  </svg>
);

export const GraduationCapIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className={disabled ? "stroke-gray-500" : "stroke-black dark:stroke-white"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      {/* Yellow Hexagon Badge */}
      <path d="M 50 10 L 85 30 V 70 L 50 90 L 15 70 V 30 Z" className={disabled ? "fill-gray-500" : "fill-yellow-400 dark:fill-yellow-300"} />
      {/* White Open Book */}
      <path d="M 25 45 L 50 55 L 75 45 V 65 L 50 75 L 25 65 Z" fill={disabled ? "#D1D5DB" : "#FFFFFF"} />
      <path d="M 50 75 V 55" />
      {/* Light Rays */}
      <line x1="50" y1="40" x2="50" y2="25" />
      <line x1="35" y1="35" x2="25" y2="25" />
      <line x1="65" y1="35" x2="75" y2="25" />
    </g>
  </svg>
);

export const KurdishShieldIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <clipPath id="kurdistan-flag-clip">
        <path d="M 50 15 L 15 25 V 55 C 15 80 50 95 50 95 C 50 95 85 80 85 55 V 25 Z" />
      </clipPath>
    </defs>
    
    <g className={disabled ? "stroke-gray-500" : "stroke-black dark:stroke-white"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      {/* Flag Background */}
      <g clipPath="url(#kurdistan-flag-clip)">
        <rect x="0" y="0" width="100" height="40" className={disabled ? "fill-gray-500" : "fill-red-500"} /> {/* Red */}
        <rect x="0" y="40" width="100" height="20" className={disabled ? "fill-gray-400" : "fill-white"} /> {/* White */}
        <rect x="0" y="60" width="100" height="40" className={disabled ? "fill-gray-600" : "fill-emerald-500"} /> {/* Green */}
        
        {/* Stripe separators for sticker style */}
        <line x1="0" y1="40" x2="100" y2="40" />
        <line x1="0" y1="60" x2="100" y2="60" />
      </g>
      
      {/* Outer Shield Border */}
      <path d="M 50 15 L 15 25 V 55 C 15 80 50 95 50 95 C 50 95 85 80 85 55 V 25 Z" fill="none" />
      
      {/* Yellow Sun */}
      <circle cx="50" cy="50" r="10" className={disabled ? "fill-gray-400" : "fill-yellow-400"} />
      {[...Array(8)].map((_, i) => (
        <line key={i} x1="50" y1="40" x2="50" y2="32" transform={`rotate(${i * 45} 50 50)`} />
      ))}
    </g>
  </svg>
);

export const GlobeIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className={disabled ? "stroke-gray-500" : "stroke-black dark:stroke-white"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      {/* Purple Hexagon Badge */}
      <path d="M 50 10 L 85 30 V 70 L 50 90 L 15 70 V 30 Z" className={disabled ? "fill-gray-500" : "fill-purple-500 dark:fill-purple-400"} />
      {/* White Globe */}
      <circle cx="50" cy="50" r="22" fill={disabled ? "#D1D5DB" : "#FFFFFF"} />
      <ellipse cx="50" cy="50" rx="8" ry="22" fill="none" />
      <line x1="28" y1="50" x2="72" y2="50" />
    </g>
  </svg>
);
