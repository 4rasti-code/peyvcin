import React from 'react';

export default function DailyStampIcon({ className = "w-16 h-16" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>
        {`
          @keyframes stamp-bounce {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            50% { transform: translateY(-3px) rotate(-1deg) scale(1.02); }
          }
          @keyframes check-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.6)); }
          }
          @keyframes paper-curl {
            0%, 100% { transform: skewY(0deg) translateY(0); }
            50% { transform: skewY(-2deg) translateY(-1px); }
          }
        `}
      </style>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)] overflow-visible absolute inset-0 z-10" xmlns="http://www.w3.org/2000/svg">
        
        {/* Animated Group */}
        <g style={{ animation: 'stamp-bounce 4s infinite ease-in-out', transformOrigin: '50px 50px' }}>
          
          {/* --- Calendar Paper Stack (Bottom) --- */}
          <g transform="translate(0, 10)">
            {/* Shadows and bottom pages */}
            <path d="M 20 70 L 75 80 L 85 65 L 28 55 Z" fill="#475569" />
            <path d="M 18 68 L 73 78 L 84 63 L 27 53 Z" fill="#64748b" />
            <path d="M 16 66 L 71 76 L 83 61 L 26 51 Z" fill="#94a3b8" />
            <path d="M 14 64 L 69 74 L 82 59 L 25 49 Z" fill="#cbd5e1" />
            <path d="M 12 62 L 67 72 L 81 57 L 24 47 Z" fill="#e2e8f0" />
            
            {/* --- Main Paper (Curled up at bottom right) --- */}
            <path d="M 10 25 L 10 60 L 60 70 Q 80 70 80 50 L 80 25 Z" fill="#f8fafc" />
            
            {/* Curl shadow and highlight */}
            <path d="M 60 70 Q 80 70 80 50 Q 80 60 65 62 Q 55 63 60 70 Z" fill="#cbd5e1" opacity="0.6" />
            
            {/* The Checkmark Symbol on the paper */}
            <g transform="translate(42, 45) scale(0.9)" style={{ animation: 'check-pulse 2.5s infinite ease-in-out', transformOrigin: '0px 0px' }}>
               {/* Dark Circle */}
               <circle cx="0" cy="0" r="14" fill="none" stroke="#475569" strokeWidth="4" />
               {/* Blue Checkmark */}
               <path d="M -7 0 L -2 5 L 8 -7" fill="none" stroke="#0ea5e9" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
               <path d="M -7 0 L -2 5 L 8 -7" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* --- Calendar Binding (Top Blue Header) --- */}
          {/* Back/shadow of binding */}
          <path d="M 12 32 L 82 32 L 82 22 L 12 22 Z" fill="#0369a1" />
          
          {/* Main Blue Header */}
          <path d="M 8 28 L 78 28 L 78 16 C 78 14, 76 12, 74 12 L 12 12 C 10 12, 8 14, 8 16 Z" fill="#0ea5e9" />
          
          {/* Blue Header Highlight */}
          <path d="M 8 18 L 78 18 L 78 16 C 78 14, 76 12, 74 12 L 12 12 C 10 12, 8 14, 8 16 Z" fill="#38bdf8" />
          
          {/* Binding Holes/Rings */}
          <path d="M 16 10 L 16 16 M 31 10 L 31 16 M 46 10 L 46 16 M 61 10 L 61 16 M 76 10 L 76 16" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

        </g>

        {/* Floating Sparkles around it to make it look rewarding */}
        <g transform="translate(15, 10)" style={{ animation: 'check-pulse 3s infinite 0.5s ease-in-out', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
          <path d="M 0 -4 L 1 -1.5 L 4 -1.5 L 1.5 0.5 L 2.5 3.5 L 0 2 L -2.5 3.5 L -1.5 0.5 L -4 -1.5 L -1 -1.5 Z" fill="#fcd34d" />
        </g>
        <g transform="translate(85, 30)" style={{ animation: 'check-pulse 3s infinite 1.5s ease-in-out', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
          <path d="M 0 -4 L 1 -1.5 L 4 -1.5 L 1.5 0.5 L 2.5 3.5 L 0 2 L -2.5 3.5 L -1.5 0.5 L -4 -1.5 L -1 -1.5 Z" fill="#38bdf8" />
        </g>

      </svg>
    </div>
  );
}
