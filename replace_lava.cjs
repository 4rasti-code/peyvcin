const fs = require('fs');
let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

const overlay = `      {/* LAVA CRACKS OVERLAY (Flowing Fire) */}
      {!disabled && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-20 pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="lava-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF4500" />
              <stop offset="50%" stopColor="#FF8C00" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
          </defs>

          <g style={{ filter: 'drop-shadow(0 0 4px #FF4500)' }}>
            {[
              "M 35 26 L 38 21 L 42 16", "M 38 21 L 32 18 L 28 15", "M 28 35 L 33 30 L 35 26",
              "M 33 30 L 25 25 L 20 23", "M 24 45 L 28 40 L 28 35",
              "M 65 26 L 62 21 L 58 16", "M 62 21 L 68 18 L 72 15", "M 72 35 L 67 30 L 65 26",
              "M 67 30 L 75 25 L 80 23", "M 76 45 L 72 40 L 72 35",
              "M 72 55 L 72 60 L 76 65", "M 72 60 L 67 65 L 65 70", "M 65 70 L 62 75 L 58 80",
              "M 67 65 L 75 70 L 80 72", "M 55 75 L 58 70 L 65 70",
              "M 28 55 L 28 60 L 24 65", "M 28 60 L 33 65 L 35 70", "M 35 70 L 38 75 L 42 80",
              "M 33 65 L 25 70 L 20 72", "M 45 75 L 42 70 L 35 70",
              "M 35 26 Q 45 22 50 21 Q 55 22 65 26",
              "M 65 26 Q 72 35 74 45 Q 75 50 72 55",
              "M 72 55 Q 65 65 55 72 Q 50 75 45 75",
              "M 45 75 Q 35 72 28 65 Q 26 55 28 55",
              "M 28 55 Q 25 45 28 35 Q 32 30 35 26"
            ].map((d, i) => (
              <Motion.path
                key={\`lava-\${i}\`}
                d={d}
                fill="none"
                stroke="url(#lava-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{ 
                  pathLength: [0, 1, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ 
                  duration: 3 + (i % 3) * 0.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: (i % 5) * 0.2
                }}
              />
            ))}
          </g>
        </svg>
      )}`;

let fixed = c.replace(/\{\/\* MAGMA OVERLAY & EMBERS IN FRONT OF IMAGE \*\/\}[\s\S]*?<\/svg>\s*\)\}/, overlay);
fs.writeFileSync('src/components/CurrencyIcon.jsx', fixed);
console.log('Replaced successfully.');
