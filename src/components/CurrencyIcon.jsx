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
    <circle cx="50" cy="50" r="38" fill="none" stroke="#CD7F32" strokeWidth="1" strokeDasharray="3 4" opacity="0.4"/>
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
    <circle cx="25" cy="35" r="1.5" fill="#3E2711" opacity="0.3"/>
    <circle cx="75" cy="65" r="2" fill="#3E2711" opacity="0.2"/>
  </svg>
);

export const DerhemIcon = ({ className = "w-5 h-5", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <HammeredBase fill="#A0A0A0" stroke="#2D2D2D" />
    {/* Beaded Inner Rim (Hand-punched look) */}
    <circle cx="50" cy="50" r="38" fill="none" stroke="#2D2D2D" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.4"/>
    
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
    <circle cx="50" cy="50" r="42" stroke="#FFD700" strokeWidth="2" opacity="0.8"/>
    <circle cx="50" cy="50" r="30" stroke="#FFD700" strokeWidth="3" opacity="0.9"/>
    <circle cx="50" cy="50" r="12" stroke="#FFD700" strokeWidth="4"/>
    {/* Calligraphic Symbols/Scribbles */}
    <path d="M42 50H58M50 42V58" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 50Q25 25 50 25Q75 25 78 50M22 50Q25 75 50 75Q75 75 78 50" stroke="#FFD700" strokeWidth="1" strokeDasharray="2 4" opacity="0.5"/>
    {/* Rim lettering markers */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
      <rect key={a} x="48" y="8" width="4" height="2" fill="#FFD700" transform={`rotate(${a} 50 50)`} opacity="0.7"/>
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
    <path d="M30 10L40 40L60 40L70 10Z" fill={disabled ? "#6B7280" : "#EAB308"} />
    <path d="M40 10L45 40L55 40L60 10Z" fill={disabled ? "#4B5563" : "#CA8A04"} />
    <circle cx="50" cy="65" r="25" fill={disabled ? "#4B5563" : "#FBBF24"} />
    <circle cx="50" cy="65" r="20" fill={disabled ? "#374151" : "#F59E0B"} />
    <path d="M50 48L54 58H65L56 65L59 76L50 69L41 76L44 65L35 58H46L50 48Z" fill={disabled ? "#9CA3AF" : "#FEF08A"} />
  </svg>
);

export const KawaHammerIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Flames Rendered Behind the Hammer */}
    <g>
      <circle cx="50" cy="80" r="20" fill={disabled ? "#4B5563" : "#EF4444"} opacity="0.6" />
      <path d="M 50 95 C 20 95 15 75 25 60 C 35 80 40 70 45 55 C 50 35 60 50 60 65 C 65 50 75 45 80 60 C 90 75 80 95 50 95 Z" fill={disabled ? "#4B5563" : "#EF4444"} />
      <path d="M 50 95 C 30 95 25 80 32 70 C 40 85 45 75 50 65 C 55 50 60 60 60 70 C 65 60 70 55 75 70 C 80 80 70 95 50 95 Z" fill={disabled ? "#6B7280" : "#F97316"} />
      <path d="M 50 95 C 38 95 35 85 40 78 C 45 88 48 82 50 75 C 52 65 55 72 55 80 C 58 75 62 72 65 80 C 68 85 62 95 50 95 Z" fill={disabled ? "#9CA3AF" : "#FBBF24"} />
    </g>

    {/* Thick Wooden Handle */}
    <rect x="40" y="30" width="20" height="65" rx="4" fill={disabled ? "#374151" : "#92400E"} />
    <rect x="42" y="30" width="6" height="65" rx="2" fill={disabled ? "#4B5563" : "#B45309"} opacity="0.5" /> {/* Handle Highlight */}
    
    {/* Handle Leather Grip */}
    <rect x="39" y="55" width="22" height="30" rx="3" fill={disabled ? "#4B5563" : "#78350F"} />
    <path d="M 39 60 H 61 M 39 68 H 61 M 39 76 H 61 M 39 82 H 61" stroke={disabled ? "#374151" : "#451A03"} strokeWidth="2.5" />

    {/* Massive Iron Hammer Head */}
    <rect x="15" y="10" width="70" height="28" rx="5" fill={disabled ? "#6B7280" : "#475569"} />
    <rect x="17" y="12" width="66" height="5" fill={disabled ? "#9CA3AF" : "#94A3B8"} opacity="0.6" />
    <rect x="17" y="33" width="66" height="4" fill={disabled ? "#374151" : "#1E293B"} opacity="0.6" />
    
    {/* Iron Striking Faces */}
    <rect x="10" y="12" width="12" height="24" rx="2" fill={disabled ? "#4B5563" : "#334155"} />
    <rect x="78" y="12" width="12" height="24" rx="2" fill={disabled ? "#4B5563" : "#334155"} />

    {/* Center Iron Band */}
    <rect x="36" y="8" width="28" height="32" rx="4" fill={disabled ? "#9CA3AF" : "#64748B"} />
    <circle cx="50" cy="24" r="6" fill={disabled ? "#4B5563" : "#0F172A"} />

    {/* Sparks/Embers Rendered in Front */}
    <circle cx="25" cy="45" r="2.5" fill={disabled ? "#9CA3AF" : "#FBBF24"} />
    <circle cx="75" cy="35" r="3" fill={disabled ? "#9CA3AF" : "#F97316"} />
    <circle cx="45" cy="55" r="2" fill={disabled ? "#9CA3AF" : "#FCD34D"} />
    <circle cx="65" cy="65" r="2" fill={disabled ? "#9CA3AF" : "#FBBF24"} />
    <circle cx="35" cy="65" r="2.5" fill={disabled ? "#9CA3AF" : "#F87171"} />
  </svg>
);

export const GraduationCapIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 20L90 40L50 60L10 40L50 20Z" fill={disabled ? "#4B5563" : "#1E3A8A"} />
    <path d="M25 48V70C25 80 75 80 75 70V48Z" fill={disabled ? "#374151" : "#1E40AF"} />
    <path d="M50 40L80 55V75" stroke={disabled ? "#9CA3AF" : "#FBBF24"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="80" cy="80" r="5" fill={disabled ? "#6B7280" : "#F59E0B"} />
    <path d="M75 80L72 95H88L85 80Z" fill={disabled ? "#6B7280" : "#F59E0B"} />
  </svg>
);

export const KurdishShieldIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Circular Emblem Clip */}
    <clipPath id="kurdistan-emblem-clip">
      <circle cx="50" cy="50" r="45" />
    </clipPath>
    
    <g clipPath="url(#kurdistan-emblem-clip)">
      {/* Red Band */}
      <rect x="0" y="0" width="100" height="33.3" fill={disabled ? "#6B7280" : "#EF4444"} />
      
      {/* White Band */}
      <rect x="0" y="33.3" width="100" height="33.4" fill={disabled ? "#9CA3AF" : "#FFFFFF"} />
      
      {/* Green Band (Mountains Base) */}
      <rect x="0" y="66.7" width="100" height="33.3" fill={disabled ? "#4B5563" : "#059669"} />
      
      {/* Mountain silhouettes overlapping the green/white border */}
      <path d="M -10 100 L 20 60 L 50 100 Z" fill={disabled ? "#4B5563" : "#10B981"} />
      <path d="M 50 100 L 80 60 L 110 100 Z" fill={disabled ? "#4B5563" : "#10B981"} />
      <path d="M 20 100 L 50 68 L 80 100 Z" fill={disabled ? "#374151" : "#047857"} />

      {/* Snow Caps for the mountains */}
      <path d="M 20 60 L 26 68 L 20 70 L 14 68 Z" fill={disabled ? "#D1D5DB" : "#FFFFFF"} opacity="0.9" />
      <path d="M 80 60 L 86 68 L 80 70 L 74 68 Z" fill={disabled ? "#D1D5DB" : "#FFFFFF"} opacity="0.9" />

      {/* The 21-ray Golden Sun (Centered perfectly at 50, 50 in the white band) */}
      <circle cx="50" cy="50" r="10" fill={disabled ? "#374151" : "#EAB308"} />
      {[...Array(21)].map((_, i) => (
        <path key={i} d="M48.5 40H51.5L50 34Z" fill={disabled ? "#374151" : "#EAB308"} transform={`rotate(${i * (360 / 21)} 50 50)`} />
      ))}
    </g>

    {/* Elegant Golden Border */}
    <circle cx="50" cy="50" r="45" stroke={disabled ? "#4B5563" : "#FBBF24"} strokeWidth="6" />
    <circle cx="50" cy="50" r="41" stroke={disabled ? "#6B7280" : "#F59E0B"} strokeWidth="2" opacity="0.5" />
  </svg>
);

export const GlobeIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="40" fill={disabled ? "#4B5563" : "#3B82F6"} />
    <path d="M30 25C40 20 50 30 45 45C40 60 25 50 20 40C15 30 20 30 30 25Z" fill={disabled ? "#6B7280" : "#10B981"} />
    <path d="M60 40C75 35 85 50 80 70C75 90 55 80 50 65C45 50 45 45 60 40Z" fill={disabled ? "#6B7280" : "#10B981"} />
    <circle cx="50" cy="50" r="40" stroke={disabled ? "#374151" : "#2563EB"} strokeWidth="4" />
    <path d="M50 10C30 30 30 70 50 90" stroke={disabled ? "#374151" : "#60A5FA"} strokeWidth="2" strokeDasharray="4 4" />
    <path d="M50 10C70 30 70 70 50 90" stroke={disabled ? "#374151" : "#60A5FA"} strokeWidth="2" strokeDasharray="4 4" />
    <path d="M10 50H90" stroke={disabled ? "#374151" : "#60A5FA"} strokeWidth="2" strokeDasharray="4 4" />
  </svg>
);
