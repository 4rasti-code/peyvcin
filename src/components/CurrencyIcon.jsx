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
export const Level10Icon = ({ className = "w-6 h-6", size = 24, disabled = false, isShining = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer Shield Shadow/Bevel */}
    <path d="M 15 18 L 85 18 C 85 58 65 93 50 100 C 35 93 15 58 15 18 Z" fill={disabled ? "#374151" : "#451A03"} />
    {/* Outer Shield Main */}
    <path d="M 15 14 L 85 14 C 85 54 65 89 50 96 C 35 89 15 54 15 14 Z" fill={disabled ? "#4B5563" : "#78350F"} />

    {/* Inner Shield Shadow/Bevel */}
    <path d="M 23 25 L 77 25 C 77 57 62 84 50 92 C 38 84 23 57 23 25 Z" fill={disabled ? "#4B5563" : "#92400E"} />
    {/* Inner Shield Main */}
    <path d="M 23 21 L 77 21 C 77 53 62 80 50 88 C 38 80 23 53 23 21 Z" fill={disabled ? "#6B7280" : "#B45309"} />

      {/* 3D Star Group */}
      <g className={isShining ? "origin-[50px_55px] animate-pulse drop-shadow-[0_0_15px_rgba(253,224,71,0.9)]" : ""}>
        {/* 3D Star Outline/Drop Shadow */}
        <path d="M 50 28 L 57 48 L 79 49 L 61 62 L 68 82 L 50 70 L 32 82 L 39 62 L 21 49 L 43 48 Z" fill="none" stroke={disabled ? "#4B5563" : "#D97706"} strokeWidth="6" strokeLinejoin="round" />
    
        {/* 3D Star Bright Base */}
        <path d="M 50 28 L 57 48 L 79 49 L 61 62 L 68 82 L 50 70 L 32 82 L 39 62 L 21 49 L 43 48 Z" fill={disabled ? "#9CA3AF" : "#FDE047"} />
    
        {/* 3D Star Dark Facets (Origami Fold Effect) */}
        <g fill={disabled ? "#6B7280" : "#F59E0B"}>
          <path d="M 50 55 L 50 28 L 57 48 Z" /> {/* Top Right */}
          <path d="M 50 55 L 79 49 L 61 62 Z" /> {/* Right Bottom */}
          <path d="M 50 55 L 61 62 L 68 82 Z" /> {/* Bottom Right Right */}
          <path d="M 50 55 L 50 70 L 32 82 Z" /> {/* Bottom Left Right */}
          <path d="M 50 55 L 39 62 L 21 49 Z" /> {/* Left Bottom */}
        </g>
      </g>
  </svg>
);

export const KawaHammerIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Flames Rendered Behind the Hammer */}
    <g transform="translate(15, 26) scale(0.7)">
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

    {/* Glowing Aura */}
    <circle cx="50" cy="50" r="45" fill={disabled ? "#4B5563" : "#FEF08A"} opacity="0.15" />

    {/* --- GRADUATION CAP --- */}

    {/* Base of the Cap (Skullcap) */}
    <path d="M 32 40 V 60 C 32 75, 68 75, 68 60 V 40 Z" fill={disabled ? "#374151" : "#1F2937"} />
    {/* Base 3D Shadow (Left side darker) */}
    <path d="M 32 40 V 60 C 32 75, 50 75, 50 60 V 40 Z" fill={disabled ? "#1F2937" : "#111827"} />

    {/* Diamond Top - 3D Edges */}
    <path d="M 8 40 L 50 55 V 63 L 8 48 Z" fill={disabled ? "#111827" : "#111827"} /> {/* Left Edge */}
    <path d="M 50 55 L 92 40 V 48 L 50 63 Z" fill={disabled ? "#1F2937" : "#1F2937"} /> {/* Right Edge */}

    {/* Diamond Top - Main Surface */}
    <path d="M 50 25 L 92 40 L 50 55 L 8 40 Z" fill={disabled ? "#4B5563" : "#374151"} />

    {/* Diamond Top - Inner Highlight */}
    <path d="M 50 27 L 88 40 L 50 53 L 12 40 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.1" />

    {/* Golden Button in Center */}
    <ellipse cx="50" cy="40" rx="5" ry="2.5" fill={disabled ? "#9CA3AF" : "#FBBF24"} />
    <path d="M 45 40 V 43 C 45 44.5, 55 44.5, 55 43 V 40 Z" fill={disabled ? "#6B7280" : "#D97706"} />

    {/* Golden Tassel Draping over the right side */}
    <path d="M 50 40 Q 75 40, 78 60" fill="none" stroke={disabled ? "#D1D5DB" : "#FDE047"} strokeWidth="2.5" />

    {/* Tassel Knot */}
    <rect x="75" y="60" width="6" height="4" rx="1" fill={disabled ? "#9CA3AF" : "#D97706"} />
    {/* Tassel Brush */}
    <path d="M 75 64 L 70 85 H 86 L 81 64 Z" fill={disabled ? "#D1D5DB" : "#FBBF24"} />

    {/* Tassel Threads */}
    <g stroke={disabled ? "#9CA3AF" : "#D97706"} strokeWidth="1">
      <line x1="74" y1="64" x2="72" y2="85" />
      <line x1="76" y1="64" x2="75" y2="85" />
      <line x1="78" y1="64" x2="78" y2="85" />
      <line x1="80" y1="64" x2="81" y2="85" />
      <line x1="82" y1="64" x2="84" y2="85" />
    </g>

  </svg>
);

export const KurdishShieldIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer 3D Golden Frame */}
    <circle cx="50" cy="52" r="46" fill={disabled ? "#4B5563" : "#B45309"} />
    <circle cx="50" cy="50" r="46" fill={disabled ? "#6B7280" : "#F59E0B"} />
    <circle cx="50" cy="48" r="46" fill={disabled ? "#9CA3AF" : "#FBBF24"} />

    {/* Inner Cutout Area */}
    <circle cx="50" cy="50" r="40" fill={disabled ? "#4B5563" : "#EF4444"} />

    <g clipPath="url(#kurdistan-inner-circle)">
      <defs>
        <clipPath id="kurdistan-inner-circle">
          <circle cx="50" cy="50" r="40" />
        </clipPath>
      </defs>

      {/* Flag Bands */}
      <rect x="0" y="0" width="100" height="33.5" fill={disabled ? "#4B5563" : "#EF4444"} />
      <rect x="0" y="33.5" width="100" height="33.5" fill={disabled ? "#D1D5DB" : "#FFFFFF"} />
      <rect x="0" y="67" width="100" height="33" fill={disabled ? "#4B5563" : "#10B981"} />

      {/* 3D Sun */}
      <circle cx="50" cy="52" r="11" fill={disabled ? "#4B5563" : "#D97706"} />
      <circle cx="50" cy="50" r="11" fill={disabled ? "#9CA3AF" : "#FBBF24"} />
      <circle cx="50" cy="48" r="9" fill={disabled ? "#D1D5DB" : "#FDE047"} />

      {/* 21 Sun Rays */}
      <g stroke={disabled ? "#9CA3AF" : "#FBBF24"} strokeWidth="1.5" strokeLinecap="round">
        {[...Array(21)].map((_, i) => (
          <line key={i} x1="50" y1="39" x2="50" y2="30" transform={`rotate(${i * (360 / 21)} 50 50)`} />
        ))}
      </g>

      {/* 3D Mountains (Left) */}
      <path d="M 0 82 L 25 55 L 50 82 Z" fill={disabled ? "#374151" : "#047857"} />
      <path d="M 0 80 L 25 53 L 50 80 Z" fill={disabled ? "#4B5563" : "#059669"} />
      <path d="M 19 60 L 25 53 L 31 60 L 28 62 L 25 60 L 22 62 Z" fill={disabled ? "#F3F4F6" : "#ECFDF5"} />

      {/* 3D Mountains (Right) */}
      <path d="M 50 82 L 75 55 L 100 82 Z" fill={disabled ? "#374151" : "#047857"} />
      <path d="M 50 80 L 75 53 L 100 80 Z" fill={disabled ? "#4B5563" : "#059669"} />
      <path d="M 69 60 L 75 53 L 81 60 L 78 62 L 75 60 L 72 62 Z" fill={disabled ? "#F3F4F6" : "#ECFDF5"} />

      {/* Center Mountain (Foreground) */}
      <path d="M 25 102 L 50 75 L 75 102 Z" fill={disabled ? "#1F2937" : "#064E3B"} />
      <path d="M 25 100 L 50 73 L 75 100 Z" fill={disabled ? "#374151" : "#047857"} />
      <path d="M 44 80 L 50 73 L 56 80 L 53 82 L 50 80 L 47 82 Z" fill={disabled ? "#E5E7EB" : "#D1FAE5"} />
    </g>

    {/* Inner shadow overlay for depth */}
    <circle cx="50" cy="50" r="40" fill="none" stroke="#000000" strokeWidth="2" opacity="0.2" />
  </svg>
);

export const GlobeIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer Atmosphere Glow */}
    <circle cx="50" cy="50" r="48" fill={disabled ? "#4B5563" : "#60A5FA"} opacity="0.3" />

    {/* Ocean 3D Base */}
    <circle cx="50" cy="52" r="42" fill={disabled ? "#374151" : "#1E3A8A"} />
    <circle cx="50" cy="50" r="42" fill={disabled ? "#4B5563" : "#2563EB"} />

    {/* Longitude / Latitude 3D Grooves */}
    <ellipse cx="50" cy="50" rx="18" ry="42" stroke={disabled ? "#6B7280" : "#1D4ED8"} strokeWidth="3" fill="none" />
    <line x1="8" y1="50" x2="92" y2="50" stroke={disabled ? "#6B7280" : "#1D4ED8"} strokeWidth="3" />

    {/* 3D Continent 1 (Left) */}
    <path d="M 20 42 C 30 32 50 37 45 52 C 40 67 25 62 15 47 C 10 37 15 32 20 42 Z" fill={disabled ? "#4B5563" : "#047857"} />
    <path d="M 20 40 C 30 30 50 35 45 50 C 40 65 25 60 15 45 C 10 35 15 30 20 40 Z" fill={disabled ? "#9CA3AF" : "#10B981"} />

    {/* 3D Continent 2 (Right) */}
    <path d="M 60 52 C 80 42 90 57 80 72 C 70 87 55 82 50 67 C 45 52 50 47 60 52 Z" fill={disabled ? "#4B5563" : "#047857"} />
    <path d="M 60 50 C 80 40 90 55 80 70 C 70 85 55 80 50 65 C 45 50 50 45 60 50 Z" fill={disabled ? "#9CA3AF" : "#10B981"} />

    {/* Polar Ice Caps */}
    <path d="M 30 14 C 40 20 60 20 70 14 C 65 10 58 8 50 8 C 42 8 35 10 30 14 Z" fill={disabled ? "#D1D5DB" : "#E0F2FE"} />
    <path d="M 30 86 C 40 80 60 80 70 86 C 65 90 58 92 50 92 C 42 92 35 90 30 86 Z" fill={disabled ? "#D1D5DB" : "#E0F2FE"} />

    {/* Top-Left Globe Highlight Reflection */}
    <path d="M 18 35 C 20 20 35 12 50 10 C 30 12 15 30 18 35 Z" fill="#FFFFFF" opacity="0.3" />

    {/* Floating Clouds */}
    <rect x="25" y="25" width="12" height="4" rx="2" fill="#FFFFFF" opacity="0.7" />
    <rect x="65" y="35" width="16" height="4" rx="2" fill="#FFFFFF" opacity="0.6" />
    <rect x="75" y="65" width="10" height="4" rx="2" fill="#FFFFFF" opacity="0.8" />
  </svg>
);

export const ExpertDiamondIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>

    {/* Glowing Aura */}
    <circle cx="50" cy="50" r="45" fill={disabled ? "#4B5563" : "#67E8F9"} opacity="0.2" />

    {/* Magical Sparkles */}
    <path d="M 20 25 L 22 15 L 32 13 L 22 11 L 20 1 Z" fill={disabled ? "#9CA3AF" : "#CFFAFE"} transform="scale(0.5) translate(30, 20)" />
    <path d="M 80 30 L 82 20 L 92 18 L 82 16 L 80 6 Z" fill={disabled ? "#9CA3AF" : "#CFFAFE"} transform="scale(0.7) translate(20, -5)" />
    <circle cx="15" cy="45" r="2" fill={disabled ? "#9CA3AF" : "#22D3EE"} />
    <circle cx="85" cy="55" r="1.5" fill={disabled ? "#9CA3AF" : "#22D3EE"} />

    {/* --- 3D DIAMOND FACETS --- */}

    {/* Pavilion (Bottom part) */}
    {/* Far Left Pavilion */}
    <path d="M 10 40 L 25 40 L 50 90 Z" fill={disabled ? "#111827" : "#164E63"} />
    {/* Mid Left Pavilion */}
    <path d="M 25 40 L 50 40 L 50 90 Z" fill={disabled ? "#1F2937" : "#0891B2"} />
    {/* Mid Right Pavilion */}
    <path d="M 50 40 L 75 40 L 50 90 Z" fill={disabled ? "#374151" : "#0E7490"} />
    {/* Far Right Pavilion */}
    <path d="M 75 40 L 90 40 L 50 90 Z" fill={disabled ? "#111827" : "#155E75"} />

    {/* Crown (Top part) */}
    {/* Far Left Crown */}
    <path d="M 10 40 L 35 25 L 25 40 Z" fill={disabled ? "#374151" : "#06B6D4"} />
    {/* Far Right Crown */}
    <path d="M 65 25 L 90 40 L 75 40 Z" fill={disabled ? "#1F2937" : "#22D3EE"} />

    {/* Table (Top Flat Surface) */}
    <path d="M 35 25 L 65 25 L 75 40 L 25 40 Z" fill={disabled ? "#6B7280" : "#67E8F9"} />

    {/* Table Highlight (Glossy reflection) */}
    <path d="M 37 27 L 63 27 L 45 38 Z" fill="#FFFFFF" opacity="0.4" />

    {/* Edge Highlights */}
    <path d="M 25 40 L 50 90 L 50 40 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.2" />
    <path d="M 50 40 L 75 40 L 50 90" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.2" />
    <path d="M 10 40 L 90 40" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />

  </svg>
);
