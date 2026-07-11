const fs = require('fs');
const path = require('path');

// 1. Rename .js to .jsx
const genDir = 'src/components/generated_icons';
if (fs.existsSync(genDir)) {
    fs.readdirSync(genDir).forEach(file => {
        if (file.endsWith('.js')) {
            fs.renameSync(path.join(genDir, file), path.join(genDir, file + 'x'));
        }
    });
}

// 2. Update CurrencyIcon.jsx
let content = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

const icons = ['FilsIcon', 'DerhemIcon', 'DinarIcon', 'GlobeIcon', 'HintIcon', 'Level10Icon', 'KawaHammerIcon'];

icons.forEach(iconName => {
    const startStr = `export const ${iconName} = `;
    const startIndex = content.indexOf(startStr);
    if (startIndex === -1) {
        console.log("Not found:", iconName);
        return;
    }
    
    let endIndex = content.indexOf('\nexport const ', startIndex + 10);
    if (endIndex === -1) {
        endIndex = content.length;
    }
    
    const slice = content.substring(startIndex, endIndex);
    const lastBrace = slice.lastIndexOf('};\n');
    if (lastBrace !== -1) {
        endIndex = startIndex + lastBrace + 3;
    } else {
        const lastBrace2 = slice.lastIndexOf('};');
        if (lastBrace2 !== -1) {
            endIndex = startIndex + lastBrace2 + 2;
        }
    }
    
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    const replacement = `export const ${iconName} = ({ className = "w-6 h-6", size = 24, disabled = false, isUnclaimed = false }) => {
  return (
    <div className={className} style={{ width: size, height: size, filter: disabled ? "grayscale(100%) opacity(0.6)" : "none", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <${iconName}Raw style={{ width: '100%', height: '100%' }} />
    </div>
  );
};\n`;

    content = before + replacement + after;
});

// Add imports if not already there
const importSpot = "import { motion as Motion } from 'framer-motion';\n";
const importsStr = icons.map(i => `import ${i}Raw from './generated_icons/${i}';`).join('\n') + '\n';
if (!content.includes('import FilsIconRaw')) {
    content = content.replace(importSpot, importSpot + importsStr);
}

fs.writeFileSync('src/components/CurrencyIcon.jsx', content);
console.log("INTEGRATION DONE");
