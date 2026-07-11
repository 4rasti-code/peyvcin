const fs = require('fs');
let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

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
        src="/icons/Pahlawan.svg"
        alt="Pahlawan"
        className="z-10 relative"
        style={{ 
          width: '90%', 
          height: '90%',
          filter: disabled ? 'grayscale(100%) opacity(50%)' : 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))'
        }}
      />

      {/* Orbiting Energy Beam Overlay */}
      {!disabled && (
        <svg viewBox="0 0 500 500" className="absolute z-20 pointer-events-none" style={{ width: '90%', height: '90%', overflow: 'visible' }}>
          <g style={{ filter: "drop-shadow(0 0 12px #FBBF24)" }}>
            {/* Orbiting Solid Line */}
            <path
              d="M98,25h300l30,20v100l-30,20H288v230l5,40l-45,40l-45-40l5-40V165H98l-30-20V45L98,25z"
              fill="none" stroke="#FDE047" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"
              pathLength="100" strokeDasharray="20 80" style={{ opacity: 1 }}
            >
              <animate attributeName="stroke-dashoffset" from="20" to="-80" dur="4s" repeatCount="indefinite" />
            </path>

            {/* Orbiting White Hot Tip */}
            <path
              d="M98,25h300l30,20v100l-30,20H288v230l5,40l-45,40l-45-40l5-40V165H98l-30-20V45L98,25z"
              fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              pathLength="100" strokeDasharray="1 99" style={{ opacity: 1 }}
            >
              <animate attributeName="stroke-dashoffset" from="1" to="-99" dur="4s" repeatCount="indefinite" />
            </path>

            {/* Scraping Sparks Trail */}
            <g strokeLinecap="round">
              {[
                { o: 1.2, c: "#FFFFFF", w: 5.0, x: 12, y: -9, d: 0.20 },
                { o: 1.4, c: "#FDE047", w: 4.0, x: -9, y: 9, d: 0.25 },
                { o: 1.6, c: "#F59E0B", w: 2.5, x: 9, y: 15, d: 0.15 },
                { o: 1.8, c: "#FFFFFF", w: 4.0, x: -12, y: -12, d: 0.30 },
                { o: 2.0, c: "#FDE047", w: 5.0, x: 15, y: 6, d: 0.22 },
                { o: 2.2, c: "#F59E0B", w: 2.5, x: -6, y: -15, d: 0.18 },
              ].map((spark, i) => (
                <path key={i} d="M98,25h300l30,20v100l-30,20H288v230l5,40l-45,40l-45-40l5-40V165H98l-30-20V45L98,25z"
                  fill="none" stroke={spark.c} strokeWidth={spark.w} pathLength="100" strokeDasharray="0.1 99.9">
                  <animate attributeName="stroke-dashoffset" from={spark.o} to={spark.o - 100} dur="4s" repeatCount="indefinite" />
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

let fixed = c.replace(/export const PahlawanIcon = \(\{ className = "w-6 h-6", size = 24, disabled = false \}\) => \{[\s\S]*?export const SharezaCompassIcon =/m, replacement + '\n\nexport const SharezaCompassIcon =');
fs.writeFileSync('src/components/CurrencyIcon.jsx', fixed);
console.log('Replaced successfully.');
