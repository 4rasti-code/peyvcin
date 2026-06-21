import React from 'react';

export default function GiftBoxIcon({ className = "w-16 h-16" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>
        {`
          @keyframes gift-bounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-4px) scale(1.05); }
          }
          @keyframes ribbon-flutter {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          @keyframes star-burst {
            0%, 86% { transform: scale(0) rotate(0deg); opacity: 0; }
            88% { transform: scale(1.5) rotate(45deg); opacity: 1; }
            95% { transform: scale(0.5) rotate(120deg); opacity: 0; }
            100% { opacity: 0; }
          }
        `}
      </style>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.4)] overflow-visible absolute inset-0 z-10" xmlns="http://www.w3.org/2000/svg">
        
        {/* Animated Group */}
        <g style={{ animation: 'gift-bounce 3s infinite ease-in-out', transformOrigin: '50px 75px' }}>
          
          {/* --- Box Base --- */}
          {/* Left Face */}
          <polygon points="50,85 20,70 20,40 50,55" fill="#f59e0b" />
          {/* Right Face */}
          <polygon points="50,85 80,70 80,40 50,55" fill="#d97706" />
          {/* Top Face (Inside/shadow) */}
          <polygon points="20,40 50,25 80,40 50,55" fill="#b45309" />

          {/* --- Base Ribbons --- */}
          {/* Left Ribbon */}
          <polygon points="42,81 35,77.5 35,47.5 42,51" fill="#e11d48" />
          <polygon points="35,77.5 28,74 28,44 35,47.5" fill="#be123c" />
          {/* Right Ribbon */}
          <polygon points="58,81 65,77.5 65,47.5 58,51" fill="#be123c" />
          <polygon points="65,77.5 72,74 72,44 65,47.5" fill="#9f1239" />

          {/* --- Box Lid --- */}
          {/* Lid Shadow on Base */}
          <polygon points="18,43 50,59 82,43 50,27" fill="#78350f" opacity="0.4" />
          
          {/* Lid Left Face */}
          <polygon points="50,53 16,36 16,26 50,43" fill="#fbbf24" />
          {/* Lid Right Face */}
          <polygon points="50,53 84,36 84,26 50,43" fill="#f59e0b" />
          {/* Lid Top Face */}
          <polygon points="16,26 50,9 84,26 50,43" fill="#fcd34d" />

          {/* --- Lid Ribbons --- */}
          {/* Lid Left Ribbon */}
          <polygon points="42,49 35,45.5 35,35.5 42,39" fill="#f43f5e" />
          {/* Lid Right Ribbon */}
          <polygon points="58,49 65,45.5 65,35.5 58,39" fill="#e11d48" />
          
          {/* Lid Top Ribbons (Crossing) */}
          <polygon points="35,35.5 65,20.5 58,17 28,32" fill="#fb7185" />
          <polygon points="65,35.5 35,20.5 42,17 72,32" fill="#f43f5e" />

          {/* --- Bow --- */}
          <g style={{ animation: 'ribbon-flutter 3s infinite ease-in-out', transformOrigin: '50px 18px' }}>
            {/* Left Loop */}
            <path d="M 50 18 C 30 -5, 5 25, 50 18 Z" fill="#fb7185" stroke="#f43f5e" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 45 16 C 30 5, 15 20, 45 16 Z" fill="#f43f5e" /> {/* Inner Loop Shadow */}
            
            {/* Right Loop */}
            <path d="M 50 18 C 70 -5, 95 25, 50 18 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 55 16 C 70 5, 85 20, 55 16 Z" fill="#e11d48" /> {/* Inner Loop Shadow */}
            
            {/* Center Knot */}
            <circle cx="50" cy="18" r="6" fill="#fb7185" />
            <circle cx="49" cy="17" r="3" fill="#fda4af" /> {/* Highlight */}
          </g>

          {/* Stars / Magic Sparkles */}
          <g transform="translate(15, 20)" style={{ animation: 'star-burst 4s infinite 0.5s ease-out' }}>
            <path d="M 0 -6 L 1.5 -2 L 6 -2 L 2.5 1 L 4 5.5 L 0 3 L -4 5.5 L -2.5 1 L -6 -2 L -1.5 -2 Z" fill="#fde047" />
          </g>
          <g transform="translate(80, 30)" style={{ animation: 'star-burst 4s infinite 1.5s ease-out' }}>
            <path d="M 0 -4 L 1 -1.5 L 4 -1.5 L 1.5 0.5 L 2.5 3.5 L 0 2 L -2.5 3.5 L -1.5 0.5 L -4 -1.5 L -1 -1.5 Z" fill="#fcd34d" />
          </g>
          <g transform="translate(30, 70)" style={{ animation: 'star-burst 4s infinite 2.5s ease-out' }}>
            <path d="M 0 -5 L 1 -1.5 L 5 -1.5 L 2 1 L 3 5 L 0 2.5 L -3 5 L -2 1 L -5 -1.5 L -1 -1.5 Z" fill="#fef08a" />
          </g>
          <g transform="translate(70, 60)" style={{ animation: 'star-burst 4s infinite 3.5s ease-out' }}>
            <path d="M 0 -3 L 0.8 -1 L 3 -1 L 1.2 0.5 L 2 2.5 L 0 1.2 L -2 2.5 L -1.2 0.5 L -3 -1 L -0.8 -1 Z" fill="#fde047" />
          </g>

        </g>
      </svg>
    </div>
  );
}
