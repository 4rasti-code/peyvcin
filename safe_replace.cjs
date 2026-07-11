const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const filePath = 'src/components/CurrencyIcon.jsx';
let code = fs.readFileSync(filePath, 'utf8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

const iconsToReplace = ['FilsIcon', 'DerhemIcon', 'DinarIcon', 'GlobeIcon', 'HintIcon', 'Level10Icon', 'KawaHammerIcon'];

let replacements = [];

traverse(ast, {
  VariableDeclarator(path) {
    if (path.node.id.type === 'Identifier' && iconsToReplace.includes(path.node.id.name)) {
      replacements.push({
        name: path.node.id.name,
        start: path.node.init.start,
        end: path.node.init.end
      });
    }
  }
});

// Sort replacements in reverse order so that slicing doesn't affect earlier offsets
replacements.sort((a, b) => b.start - a.start);

for (const rep of replacements) {
  const newBody = `({ className = "w-6 h-6", size = 24, disabled = false }) => {
  return (
    <div className={className} style={{ width: size, height: size, filter: disabled ? "grayscale(100%) opacity(0.6)" : "none", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <${rep.name}Raw style={{ width: '100%', height: '100%' }} />
    </div>
  );
}`;
  code = code.substring(0, rep.start) + newBody + code.substring(rep.end);
}

// Add imports
const imports = iconsToReplace.map(i => `import ${i}Raw from './generated_icons/${i}';`).join('\n');
if (!code.includes('import FilsIconRaw')) {
  code = code.replace("import { motion as Motion } from 'framer-motion';", "import { motion as Motion } from 'framer-motion';\n" + imports);
}

fs.writeFileSync(filePath, code);
console.log("SAFE AST REPLACEMENT DONE");
