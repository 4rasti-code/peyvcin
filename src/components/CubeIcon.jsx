import React from 'react';

const darkColors = Array(9).fill('#1f2937');

const Square = ({ color, letter }) => (
  <div 
    className="w-full h-full flex items-center justify-center box-border" 
    style={{ 
      backgroundColor: color,
      border: '0.5px solid rgba(0,0,0,0.15)'
    }}
  >
    {letter && (
      <span 
        className="font-sans font-black text-[11px]" 
        style={{ color: '#ffffff', textShadow: '0px 1px 2px rgba(0,0,0,0.4)' }}
      >
        {letter}
      </span>
    )}
  </div>
);

const g = '#10b981'; // Green
const y = '#eab308'; // Yellow
const r = '#6b7280'; // Grey

// SVG Top corresponds to CSS Top
const topColors = [y, r, g, g, y, r, r, g, y];
const topLetters = ['پ', 'ە', 'ی', 'ڤ', 'ۆ', 'ک', 'د', 'ژ', 'و'];

// SVG Left corresponds to CSS Left
const leftColors = [r, g, y, y, r, g, g, y, r];
const leftLetters = ['ش', 'ا', 'ر', 'ە', 'ز', 'ا', 'ی', 'ا', 'ن'];

// SVG Right corresponds to CSS Front
const frontColors = [g, y, r, r, g, y, y, r, g];
const frontLetters = ['ه', 'ز', 'ر', 'ب', 'ک', 'ە', 'ت', 'م', 'ن'];

// New faces for the back/right (invisible until spun)
const backColors = [y, g, r, r, y, g, g, r, y];
const backLetters = ['ز', 'ی', 'ر', 'ە', 'ک', 'ی', 'ب', 'ک', 'ە'];

const rightColors = [r, y, g, g, r, y, y, g, r];
const rightLetters = ['د', 'ە', 'س', 'ت', 'خ', 'ۆ', 'ش', 'ی', 'ن'];

const renderGrid = (colors, letters, isSlice, sliceIndex) => {
  if (isSlice) {
    const start = sliceIndex * 3;
    const sliceColors = colors.slice(start, start + 3);
    const sliceLetters = letters.slice(start, start + 3);
    return sliceColors.map((c, i) => <Square key={i} color={c} letter={sliceLetters[i]} />);
  }
  return colors.map((c, i) => <Square key={i} color={c} letter={letters[i]} />);
};

const Slice = ({ yOffset, sliceIndex, animationName }) => (
  <div 
    className="absolute top-0 left-0 w-full h-full" 
    style={{ 
      transformStyle: 'preserve-3d', 
      transform: `translateY(${yOffset}px)`,
      animation: animationName,
      willChange: 'transform'
    }}
  >
    {/* Front Face */}
    <div className="absolute flex" style={{ width: '60px', height: '20px', transform: 'translateZ(30px)' }}>
      {renderGrid(frontColors, frontLetters, true, sliceIndex)}
    </div>
    {/* Right Face */}
    <div className="absolute flex" style={{ width: '60px', height: '20px', transform: 'rotateY(90deg) translateZ(30px)' }}>
      {renderGrid(rightColors, rightLetters, true, sliceIndex)}
    </div>
    {/* Back Face */}
    <div className="absolute flex" style={{ width: '60px', height: '20px', transform: 'rotateY(180deg) translateZ(30px)' }}>
      {renderGrid(backColors, backLetters, true, sliceIndex)}
    </div>
    {/* Left Face */}
    <div className="absolute flex" style={{ width: '60px', height: '20px', transform: 'rotateY(-90deg) translateZ(30px)' }}>
      {renderGrid(leftColors, leftLetters, true, sliceIndex)}
    </div>
    {/* Top Face */}
    <div className="absolute grid grid-cols-3 grid-rows-3" style={{ width: '60px', height: '60px', transform: 'rotateX(90deg) translateZ(10px)' }}>
      {sliceIndex === 0 ? renderGrid(topColors, topLetters, false) : renderGrid(darkColors, Array(9).fill(''), false)}
    </div>
    {/* Bottom Face */}
    <div className="absolute grid grid-cols-3 grid-rows-3" style={{ width: '60px', height: '60px', transform: 'rotateX(-90deg) translateZ(10px)' }}>
      {sliceIndex === 2 ? renderGrid(topColors, Array(9).fill(''), false) : renderGrid(darkColors, Array(9).fill(''), false)}
    </div>
  </div>
);

export default function CubeIcon({ className = "w-16 h-16" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>
        {`
          @keyframes spark-fade {
            0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
          }
          @keyframes slice-0-spin {
            0%, 20% { transform: translateY(-20px) rotateY(0deg); }
            25%, 45% { transform: translateY(-20px) rotateY(-90deg); }
            50%, 70% { transform: translateY(-20px) rotateY(-180deg); }
            75%, 95% { transform: translateY(-20px) rotateY(-270deg); }
            100% { transform: translateY(-20px) rotateY(-360deg); }
          }
          @keyframes slice-2-spin {
            0%, 20% { transform: translateY(20px) rotateY(0deg); }
            25%, 45% { transform: translateY(20px) rotateY(90deg); }
            50%, 70% { transform: translateY(20px) rotateY(180deg); }
            75%, 95% { transform: translateY(20px) rotateY(270deg); }
            100% { transform: translateY(20px) rotateY(360deg); }
          }
        `}
      </style>

      {/* 3D World container */}
      <div 
        className="relative z-10" 
        style={{ 
          width: '60px', height: '60px', 
          perspective: '1200px'
        }}
      >
        {/* Forward-facing 3D Cube Rotator */}
        <div 
          className="absolute w-full h-full" 
          style={{ 
            transformStyle: 'preserve-3d', 
            transform: 'translateY(18px) scale(0.7) rotateX(0deg) rotateY(0deg)',
            filter: 'drop-shadow(0px 15px 15px rgba(0,0,0,0.5))'
          }}
        >
          {/* Slices */}
          <Slice yOffset={-20} sliceIndex={0} animationName="slice-0-spin 12s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55)" />
          <Slice yOffset={0} sliceIndex={1} animationName="none" />
          <Slice yOffset={20} sliceIndex={2} animationName="slice-2-spin 12s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55) 1.5s" />
        </div>
      </div>
    </div>
  );
}
