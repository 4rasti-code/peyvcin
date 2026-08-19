const fs = require('fs');

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <!-- Ultra subtle contrast to prevent the "stripe" illusion -->
    <linearGradient id="tile1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1d42" />
      <stop offset="100%" stop-color="#091a3d" />
    </linearGradient>
    
    <linearGradient id="tile2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#091b3d" />
      <stop offset="100%" stop-color="#081736" />
    </linearGradient>

    <!-- Barely visible edge bevels to give subtle depth, but no harsh lines -->
    <linearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.03)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.0)" />
    </linearGradient>
    
    <linearGradient id="shadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.08)" />
    </linearGradient>

    <!-- DIAMOND SHAPE -->
    <g id="diamond1">
      <path d="M 64 0 L 128 64 L 64 128 L 0 64 Z" fill="url(#tile1)" />
      <path d="M 64 0 L 128 64 L 124 64 L 64 4 L 4 64 L 0 64 Z" fill="url(#highlight)" />
      <path d="M 128 64 L 64 128 L 0 64 L 4 64 L 64 124 L 124 64 Z" fill="url(#shadow)" />
    </g>
  </defs>

  <!-- Base background (Tile 2) -->
  <rect width="128" height="128" fill="url(#tile2)" />
  
  <use href="#diamond1" x="0" y="0" />
  
  <use href="#diamond1" x="-64" y="-64" />
  <use href="#diamond1" x="64" y="-64" />
  <use href="#diamond1" x="-64" y="64" />
  <use href="#diamond1" x="64" y="64" />
</svg>
`;

fs.writeFileSync('d:/Peyvok_App/public/assets/peyvok_clash_pattern.svg', svgContent.trim());
console.log("SVG created with ultra subtle contrast");
