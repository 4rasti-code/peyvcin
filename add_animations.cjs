const fs = require('fs');

const filePath = 'src/components/CurrencyIcon.jsx';
let code = fs.readFileSync(filePath, 'utf8');

const icons = ['FilsIcon', 'DerhemIcon', 'DinarIcon', 'HintIcon', 'Level10Icon', 'KawaHammerIcon'];

icons.forEach(iconName => {
    // Match anything in the props area
    const regexStr = `export const ${iconName} = \\(\\{[^}]+\\}\\) => \\{[\\s\\S]*?<${iconName}Raw[\\s\\S]*?</div>\\s*\\n\\};\\n`;
    const regex = new RegExp(regexStr);
    
    // Check if we can find it
    const match = code.match(regex);
    if (!match) {
        console.log("Could not find regex for", iconName);
        return;
    }

    // Extract default class name
    let defClassName = '"w-6 h-6"';
    if (match[0].includes('"w-5 h-5"')) defClassName = '"w-5 h-5"';

    const isPremium = iconName === 'Level10Icon' || iconName === 'KawaHammerIcon';
    
    const sparkles = isPremium ? `
      {isActive && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible', width: '100%', height: '100%', zIndex: 10 }}>
          <g>
            <Motion.path d="M 20 20 L 22 24 L 26 25 L 22 26 L 20 30 L 18 26 L 14 25 L 18 24 Z" fill="#FBBF24" animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: [0, 90] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} style={{ transformOrigin: "20px 20px" }} />
            <Motion.path d="M 80 80 L 82 84 L 86 85 L 82 86 L 80 90 L 78 86 L 74 85 L 78 84 Z" fill="#FBBF24" animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} style={{ transformOrigin: "80px 80px" }} />
          </g>
        </svg>
      )}` : '';

    const replacement = `export const ${iconName} = ({ className = ${defClassName}, size = 24, disabled = false, isUnclaimed = false }) => {
  const isActive = isUnclaimed && !disabled;
  return (
    <Motion.div 
      className={\`relative \${className}\`} 
      style={{ width: size, height: size, filter: disabled ? "grayscale(100%) opacity(0.6)" : "none", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      whileHover={isActive ? { scale: 1.05 } : {}}
      animate={isActive ? { filter: ["drop-shadow(0px 0px 0px rgba(255,215,0,0))", "drop-shadow(0px 0px 8px rgba(255,215,0,0.6))", "drop-shadow(0px 0px 0px rgba(255,215,0,0))"] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <${iconName}Raw style={{ width: '100%', height: '100%' }} />${sparkles}
    </Motion.div>
  );
};\n`;

    code = code.replace(regex, replacement);
});

fs.writeFileSync(filePath, code);
console.log("ANIMATIONS ADDED");
