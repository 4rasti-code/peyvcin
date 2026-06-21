import React from 'react';

export default function ClipboardIcon({ className = "w-16 h-16" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>
        {`
          @keyframes clipboard-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-3px) rotate(1deg); }
          }
          @keyframes pencil-write {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10%, 30%, 50%, 70% { transform: translate(-2px, -1px) rotate(-3deg); }
            20%, 40%, 60%, 80% { transform: translate(2px, 1px) rotate(1deg); }
          }
          @keyframes star-burst {
             0%, 86% { transform: scale(0) rotate(0deg); opacity: 0; }
             88% { transform: scale(1.5) rotate(45deg); opacity: 1; }
             95% { transform: scale(0.5) rotate(120deg); opacity: 0; }
             100% { opacity: 0; }
           }
        `}
      </style>
      
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.3)] overflow-visible absolute inset-0 z-10" xmlns="http://www.w3.org/2000/svg">
        {/* Main Group with Float Animation */}
        <g style={{ animation: 'clipboard-float 5s infinite ease-in-out', transformOrigin: '50px 50px' }}>
          
          {/* --- Board --- */}
          {/* Shadow/Base Layer */}
          <rect x="18" y="15" width="56" height="74" rx="8" fill="#b45309" />
          {/* Top Layer */}
          <rect x="15" y="12" width="56" height="74" rx="8" fill="#f59e0b" />
          
          {/* --- Paper --- */}
          {/* Paper Shadow */}
          <rect x="23" y="27" width="40" height="52" rx="3" fill="#e5e7eb" />
          {/* Paper Face */}
          <rect x="21" y="25" width="40" height="52" rx="3" fill="#fef3c7" />

          {/* Paper Lines */}
          <line x1="26" y1="35" x2="56" y2="35" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="43" x2="56" y2="43" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="51" x2="48" y2="51" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="59" x2="52" y2="59" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />

          {/* --- Clip Mechanism --- */}
          {/* Clip Shadow */}
          <path d="M 33 5 L 53 5 Q 58 5 58 10 L 58 20 Q 58 25 53 25 L 33 25 Q 28 25 28 20 L 28 10 Q 28 5 33 5 Z" fill="#374151" />
          {/* Clip Face */}
          <path d="M 31 3 L 51 3 Q 56 3 56 8 L 56 18 Q 56 23 51 23 L 31 23 Q 26 23 26 18 L 26 8 Q 26 3 31 3 Z" fill="#4b5563" />
          {/* Clip Hole */}
          <circle cx="43" cy="11" r="3" fill="#1f2937" />
          <circle cx="42" cy="10" r="3" fill="#111827" />
          <circle cx="42" cy="10" r="1.5" fill="#374151" />

          {/* --- Animated Pencil --- */}
          <g style={{ animation: 'pencil-write 4s infinite ease-in-out 1s', transformOrigin: '80px 80px' }}>
             {/* Pencil Drop Shadow */}
             <g filter="drop-shadow(3px 5px 4px rgba(0,0,0,0.4))">
                {/* Position and rotate the pencil diagonally */}
                <g transform="translate(52, 22) rotate(35)">
                  
                  {/* Eraser */}
                  <path d="M 0 0 L 14 0 L 14 10 L 0 10 Z" fill="#ef4444" />
                  <path d="M 0 0 L 6 0 L 6 10 L 0 10 Z" fill="#f87171" /> {/* Eraser Highlight */}
                  
                  {/* Metal band */}
                  <path d="M 0 10 L 14 10 L 14 16 L 0 16 Z" fill="#9ca3af" />
                  <path d="M 0 12 L 14 12 L 14 14 L 0 14 Z" fill="#6b7280" />
                  <path d="M 0 10 L 4 10 L 4 16 L 0 16 Z" fill="#d1d5db" /> {/* Metal Highlight */}
                  
                  {/* Wood body */}
                  <path d="M 0 16 L 14 16 L 14 55 L 0 55 Z" fill="#f59e0b" />
                  <path d="M 0 16 L 5 16 L 5 55 L 0 55 Z" fill="#fbbf24" /> {/* Body Highlight */}
                  <path d="M 11 16 L 14 16 L 14 55 L 11 55 Z" fill="#d97706" /> {/* Body Shadow */}
                  
                  {/* Cone / Sharpened wood */}
                  <path d="M 0 55 L 14 55 L 7 70 Z" fill="#fcd34d" />
                  <path d="M 2 55 L 12 55 L 7 66 Z" fill="#fde68a" />
                  
                  {/* Lead tip */}
                  <path d="M 4.5 64.5 L 9.5 64.5 L 7 70 Z" fill="#1f2937" />
                  
                </g>
             </g>
          </g>

          {/* --- Golden Stars bursting from the pencil --- */}
          <g transform="translate(18, 70)" style={{ animation: 'star-burst 4s infinite 1.5s ease-out', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
            <path d="M 0 -6 L 1.5 -2 L 6 -2 L 2.5 1 L 4 5.5 L 0 3 L -4 5.5 L -2.5 1 L -6 -2 L -1.5 -2 Z" fill="#fde047" />
          </g>
          <g transform="translate(28, 80)" style={{ animation: 'star-burst 4s infinite 2.5s ease-out', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
            <path d="M 0 -4 L 1 -1.5 L 4 -1.5 L 1.5 0.5 L 2.5 3.5 L 0 2 L -2.5 3.5 L -1.5 0.5 L -4 -1.5 L -1 -1.5 Z" fill="#fcd34d" />
          </g>
          <g transform="translate(12, 85)" style={{ animation: 'star-burst 4s infinite 3.5s ease-out', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
            <path d="M 0 -3 L 0.8 -1 L 3 -1 L 1.2 0.5 L 2 2.5 L 0 1.2 L -2 2.5 L -1.2 0.5 L -3 -1 L -0.8 -1 Z" fill="#fde047" />
          </g>

        </g>
      </svg>
    </div>
  );
}
