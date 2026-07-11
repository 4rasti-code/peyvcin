const fs = require('fs');

const hammerPath = "M98,25h300l30,20v100l-30,20H288v230l5,40l-45,40l-45-40l5-40V165H98l-30-20V45L98,25z";

const runes = [
  { d: "M354.1,73.1c5.8-5.8,12.4-8.2,17.6-3c1.7,1.7,3,3.7,3.8,6.3l-1.2,0.5c-0.8-1.6-1.7-2.9-2.6-3.8c-4.2-4.2-10.2-1.8-15.5,3.5c-2.5,2.5-4.5,5.2-6.3,8.1c-0.7,1.2-1.4,2.4-1.9,3.6c-0.1,0.2,0,0.4,0,0.4c1,1,4.1,2,7.3,3.1c0.4,1.4,0.7,2.7,0.8,4l-0.1,0.1c-2.7-0.7-6.4-2.2-8.5-4.3c-1.6-1.6-2-3-2.4-4.6C345.9,84,349.9,77.3,354.1,73.1z M347.5,66.5c1.7,0,3.1-0.1,4.6-0.3c0.2,1.3,0.3,2.6,0.3,3.7c-1.5,0.2-2.9,0.2-4.6,0.1C347.6,68.6,347.5,67.6,347.5,66.5z M340.4,65.3c1.7,0,3.1-0.1,4.6-0.3c0.2,1.3,0.3,2.6,0.3,3.7c-1.5,0.2-2.9,0.2-4.6,0.1C340.5,67.4,340.4,66.4,340.4,65.3z M343.7,70.8c1.7,0,3.1-0.1,4.6-0.3c0.2,1.3,0.3,2.6,0.3,3.7c-1.5,0.2-2.9,0.2-4.6,0.1C343.8,72.9,343.7,72,343.7,70.8z", times: [0, 0.30, 0.35, 0.45, 1], op: [0, 0, 1, 0, 0] },
  { d: "M421.6,63.2c1.1-1.8,1.3-3,0.8-3.5c-0.8-0.8-2.3-1.3-4-1.5c-1.7-0.2-3.3-0.1-3.9,0.5c-1.5,1.5,3.1,5.8,3.4,8c0,0.9-0.2,1.7-1.2,2.7c-0.9,0.9-3.1,1.8-4.6,1.8c-3.3-0.1-7.2-1.5-9.5-3.8c-4-4-3.3-8.7,0.4-12.3c1.6-1.6,3.3-2.6,5.2-3.3l0.4,0.9c-1.5,0.8-2.7,1.6-3.6,2.5c-3.3,3.3-2.8,7.2,0.1,10.1c1.1,1.1,3.3,2.5,6.1,3.2c1.8,0.4,3.6,0.7,3.9,0.4c0.5-0.5-0.3-2.2-1.6-3.8c-1.3-1.7-2.2-3.3-2.1-4.2c0-0.8,0.2-1.5,0.9-2.2c1.7-1.7,4-2.5,6.4-2.5c2.5,0,5.5,0.6,6.7,1.8c0.6,0.6,0.7,1.2,0.3,2.2c-0.3,0.9-0.7,1.6-1.2,2c-0.4,0.4-1.7,0.9-2.6,1.2L421.6,63.2z", times: [0, 0.33, 0.38, 0.48, 1], op: [0, 0, 1, 0, 0] },
  { d: "M416.1,127.7c-1.4-1.4-2.1-2.9-1.6-4.2c0.1-0.4,0.4-0.7,0.7-1.1c0.9-0.9,2.1-1.5,3.3-1.5c1,0,1.8,0.2,2.4,0.8c1,1,0.9,2.6-0.1,4.7c-0.5,1.1-1.2,2.2-2.4,3.4c-0.8,0.8-1.4,1.2-2.3,1.3c-1.5-0.3-2.5-0.9-3.6-1.5c-1.8-1-4-2.5-5.5-4c-1.7-1.7-2.8-3.4-3.2-5.1c-0.4-1.8,0-3.6,1.5-5.1c1-1,2.2-1.8,3.7-2.2l0.3,0.7c-0.9,0.5-1.7,1-2.2,1.5c-1.1,1.1-1.5,2.7-1.1,4.3c0.4,1.6,1.6,3.1,3.1,4.7c1.4,1.4,3,2.6,4.7,3.6c0.7,0.4,1.4,0.8,2.2,1.1c0.4,0.2,1.2,0.5,1.4,0.3c0.1-0.1,0.2-0.2,0.2-0.3C417,128.6,416.6,128.2,416.1,127.7z M419,123c-0.8-0.8-2.1-0.8-2.5-0.4c-1,1,0.3,2.8,2.2,4.8C419.6,126,420,124,419,123z M420.2,119.7c0-1-0.1-1.8-0.2-2.7c0.8-0.1,1.5-0.2,2.1-0.2c0.1,0.9,0.1,1.7,0.1,2.7C421.4,119.6,420.9,119.7,420.2,119.7z M422.7,121.9c0-1-0.1-1.8-0.2-2.7c0.8-0.1,1.5-0.2,2.1-0.2c0.1,0.9,0.1,1.7,0.1,2.7C423.9,121.8,423.4,121.9,422.7,121.9z M423.4,117.8c0-1-0.1-1.8-0.2-2.7c0.8-0.1,1.5-0.2,2.1-0.2c0.1,0.9,0.1,1.7,0.1,2.7C424.7,117.7,424.1,117.8,423.4,117.8z", times: [0, 0.37, 0.42, 0.52, 1], op: [0, 0, 1, 0, 0] },
  { d: "M142.1,91c3.3,3.3,4.6,7.6,0.8,11.4c-1.8,1.8-4.1,2.7-6.6,3c-2.7,0.1-5-0.4-6.3-1.7c-1.6-1.6-2-4.3-1.1-7.4c0.9-3,2.8-6.4,5.9-9.5c2.6-2.6,5.7-4.4,9.5-5.2c6.3-1.3,10.2-0.4,12.5,1.9c2.6,2.6,4.4,6.1,5.3,10.8l-1.3,0.5c-0.7-2.1-1.8-3.7-3.1-5c-2.8-2.8-7.1-4.2-12.5-3.9c-2.6,0.1-5.4,0.6-7.3,2C139.4,88.7,140.8,89.7,142.1,91z M134.5,101.1c1.3,1.3,4.6,1.7,5.6,0.6c1.7-1.7,0.5-5.4-1.8-7.7c-1.1-1.1-2.3-2-3.5-2.8C132.7,94.8,132.1,98.7,134.5,101.1z M115.2,110.9c5.5-0.4,8.7-0.9,10.1-1.7l0.8,0.3c-0.8,1.1-1.1,4.4-0.6,10.3l-3.4,2.1l-0.2-0.2c0-4.7,0.2-7.7,0.6-9.2l-0.1-0.1c-1.8,0.6-4.6,1.1-8.8,1.3C114.1,112.8,114.6,111.8,115.2,110.9z", times: [0, 0.85, 0.90, 0.98, 1], op: [0, 0, 1, 0, 0] },
  { d: "M76.1,104.3c0.9,1.2,3,2.1,6.2,2.8c-0.1,0.8-0.2,1.6-0.3,2.5c3,2.7,5.8,5.5,8.6,8.2c1.2,1.2,2.7,4,3,6.1c-0.9,4-3.4,7.6-5.6,9.8c-2.6,2.6-5,3.5-7.3,3.3c-2-0.2-3.6-1.2-4.9-2.5c-1.7-1.7-2.8-3.5-3.4-5.5l0.9-0.4c0.5,1.1,1.1,2.1,2,3c1.8,1.8,3.6,2.5,5.7,1.9c1.8-0.4,3.3-1.5,4.6-2.8c2-2,3.9-4.6,5.1-8.3c0.3-0.8-0.1-1.3-2.2-3.4c-2.2-2.2-5.4-5-8.6-7.9c-1.2-1.1-2.3-1.9-3-2.5c-0.9-0.9-1.2-1.6-1.2-2.4c0-0.7,0-1.4,0.1-2L76.1,104.3z M76.5,116.5l-0.3,0.1c-0.7,1.6-0.8,3-0.2,4.1l1.6-1.6c1.4-1.4,2.6-1.4,3.5-0.5c2,2,1,4.8-0.8,6.5c-0.5,0.5-0.9,0.9-1.4,1.2l-2.1,0.5l-0.1-0.1c2.5-2.6,4.4-5.9,3.6-6.7c-0.2-0.2-0.7,0.3-2,1.6c-1.2,1.2-1.8,1.8-2,1.5l-0.8-0.8c-0.8-0.8-1.3-2.2-1.5-4c-0.1-1.7,0.1-3.3,0.6-3.8c0.3-0.3,0.6-0.3,0.9,0C75.9,114.9,76.2,115.7,76.5,116.5L76.5,116.5z", times: [0, 0.89, 0.94, 0.99, 1], op: [0, 0, 1, 0, 0] },
  { d: "M94.1,54.7l0.6,0.3c0.1,4,2.6,14.3-0.1,19.2c-1,1.9-2,3-3.3,4.3c-2.1,2-5.7,4.2-8.1,4.4c-4.3,0.1-7.6-1.4-10.1-3.9c-1.7-1.7-2.7-3.4-3-5.1c-0.8-3.9,0.7-7.7,4-11c2.3-2.3,5.8-3.7,8.5-4.4c2.1-0.6,4.5-0.9,7.6-0.9C91.5,56.6,92.8,55.7,94.1,54.7z M76.9,64.6c-2.5,2.5-1.8,7.3,1.1,10.2c2,2,4.3,3,7.1,3.4c1.9,0.3,3,0,3.7-0.7c1.1-1.2,1.6-3.4,1.9-5.5c0.3-3.1-0.2-6.7-1-9.8C83.8,61.6,79.4,62.1,76.9,64.6z", times: [0, 0.08, 0.93, 0.98, 1], op: [0.5, 0, 0, 1, 0.5] }
];

const handleSymbols = [
  { type: 'path', d: "M232.6,199.8l15-15l15,15l-15,15L232.6,199.8z", times: [0, 0.47, 0.50, 0.55, 0.82, 0.85, 0.90, 1], op: [0, 0, 1, 0, 0, 1, 0, 0] },
  { type: 'polyline', pts: "233,242.5 248,257.5 263,242.5", times: [0, 0.51, 0.54, 0.59, 0.78, 0.81, 0.86, 1], op: [0, 0, 1, 0, 0, 1, 0, 0] },
  { type: 'polyline', pts: "233,304.5 248,289.5 263,304.5", times: [0, 0.55, 0.58, 0.63, 0.74, 0.77, 0.82, 1], op: [0, 0, 1, 0, 0, 1, 0, 0] },
  { type: 'path', d: "M233,353.5l15-15l15,15 M233,338.5l30,30", times: [0, 0.59, 0.62, 0.67, 0.70, 0.73, 0.78, 1], op: [0, 0, 1, 0, 0, 1, 0, 0] }
];

const replacement = `export const PahlawanIcon = ({ className = "w-6 h-6", size = 24, disabled = false }) => {
  return (
    <div 
      className={\`relative flex items-center justify-center \${className}\`} 
      style={{ width: size, height: size }}
    >
      {/* GLOW BEHIND THE IMAGE */}
      {!disabled && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <defs>
            <radialGradient id="pahlawan-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="1" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <Motion.circle
            cx="50" cy="50" r="35"
            fill="url(#pahlawan-glow)"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      )}

      <img 
        src="/icons/Pahlawan.svg?v=2"
        alt="Pahlawan"
        className="z-10 relative"
        style={{ 
          width: '90%', 
          height: '90%',
          filter: disabled ? 'grayscale(100%) opacity(50%)' : 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))'
        }}
      />

      {/* Orbiting Energy Beam Overlay & Glowing God of War Runes */}
      {!disabled && (
        <svg viewBox="0 0 500 500" className="absolute z-20 pointer-events-none" style={{ width: '90%', height: '90%', overflow: 'visible' }}>
          
          {/* God of War: Sequentially Glowing Runes */}
          <g fill="#FFFBEB" style={{ filter: "drop-shadow(0 0 10px #FDE047) drop-shadow(0 0 20px #F59E0B)" }}>
            {${JSON.stringify(runes)}.map((r, i) => (
              <Motion.path key={'rune'+i} d={r.d} 
                animate={{ opacity: r.op }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: r.times }} 
              />
            ))}
          </g>

          {/* God of War: Sequentially Glowing Handle Symbols */}
          <g fill="none" stroke="#FFFBEB" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 10px #FDE047) drop-shadow(0 0 20px #F59E0B)" }}>
            {${JSON.stringify(handleSymbols)}.map((s, i) => (
              s.type === 'path' ? (
                <Motion.path key={'handle'+i} d={s.d} animate={{ opacity: s.op }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: s.times }} />
              ) : (
                <Motion.polyline key={'handle'+i} points={s.pts} animate={{ opacity: s.op }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: s.times }} />
              )
            ))}
          </g>

          {/* Orbiting Beam (Comet Tail Style matching Shield) */}
          <g style={{ filter: "drop-shadow(0 0 12px #FBBF24)" }}>
            {/* Base Fading Trailing Glow */}
            <g stroke="#FBBF24" strokeWidth="7.5" strokeLinecap="round" fill="none">
              <path d="${hammerPath}" pathLength="100" strokeDasharray="25 75" opacity="0.15">
                <animate attributeName="stroke-dashoffset" values="23;-77" dur="6s" repeatCount="indefinite" />
              </path>
              <path d="${hammerPath}" pathLength="100" strokeDasharray="17 83" opacity="0.35">
                <animate attributeName="stroke-dashoffset" values="15;-85" dur="6s" repeatCount="indefinite" />
              </path>
              <path d="${hammerPath}" pathLength="100" strokeDasharray="10 90" opacity="0.8">
                <animate attributeName="stroke-dashoffset" values="8;-92" dur="6s" repeatCount="indefinite" />
              </path>
            </g>

            {/* Fading Bright Core Beam */}
            <g stroke="#FDE047" strokeWidth="7.5" strokeLinecap="round" fill="none">
              <path d="${hammerPath}" pathLength="100" strokeDasharray="8 92" opacity="0.2">
                <animate attributeName="stroke-dashoffset" values="6;-94" dur="6s" repeatCount="indefinite" />
              </path>
              <path d="${hammerPath}" pathLength="100" strokeDasharray="5 95" opacity="0.4">
                <animate attributeName="stroke-dashoffset" values="3;-97" dur="6s" repeatCount="indefinite" />
              </path>
              <path d="${hammerPath}" pathLength="100" strokeDasharray="2 98" opacity="1" stroke="#FFFFFF" strokeWidth="5">
                <animate attributeName="stroke-dashoffset" values="0;-100" dur="6s" repeatCount="indefinite" />
              </path>
            </g>

            {/* Scraping Sparks Trail */}
            <g strokeLinecap="round">
              {[
                { o: 0, c: "#FFFFFF", w: 5.0, x: 12, y: -9, d: 0.20 },
                { o: 0.2, c: "#FDE047", w: 4.0, x: -9, y: 9, d: 0.25 },
                { o: 0.4, c: "#F59E0B", w: 2.5, x: 9, y: 15, d: 0.15 },
                { o: 0.6, c: "#FFFFFF", w: 4.0, x: -12, y: -12, d: 0.30 },
                { o: 0.8, c: "#FDE047", w: 5.0, x: 15, y: 6, d: 0.22 },
                { o: 1.0, c: "#F59E0B", w: 2.5, x: -6, y: -15, d: 0.18 },
              ].map((spark, i) => (
                <path key={'spark'+i} d="${hammerPath}"
                  fill="none" stroke={spark.c} strokeWidth={spark.w} pathLength="100" strokeDasharray="0.1 99.9">
                  <animate attributeName="stroke-dashoffset" values={\`\${spark.o}; \${spark.o - 100}\`} dur="6s" repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="translate" values={\`0,0; \${spark.x},\${spark.y}\`} dur={\`\${spark.d}s\`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur={\`\${spark.d}s\`} repeatCount="indefinite" />
                </path>
              ))}
            </g>
          </g>
        </svg>
      )}
    </div>
  );
};`;

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');
let fixed = c.replace(/export const PahlawanIcon = \(\{ className = "w-6 h-6", size = 24, disabled = false \}\) => \{[\s\S]*?export const SharezaCompassIcon =/m, replacement + '\n\nexport const SharezaCompassIcon =');
fs.writeFileSync('src/components/CurrencyIcon.jsx', fixed);
console.log('Replaced successfully.');
