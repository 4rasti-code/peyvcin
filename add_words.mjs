import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'src', 'data');

const additions = {
    'timeList.js': [
        { word: 'ئەڤرۆ', hint: 'ڕۆژا نۆکە کو ئەم تێداینە', category: 'دەم' }
    ]
};

for (const [file, words] of Object.entries(additions)) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if the array closes with ];
    const insertionPoint = content.lastIndexOf('];');
    if (insertionPoint === -1) {
        console.error(`Could not find closing bracket in ${file}`);
        continue;
    }
    
    const wordsStr = words.map(w => `  {\n    "word": "${w.word}",\n    "hint": "${w.hint}",\n    "category": "${w.category}"\n  }`).join(',\n');
    
    const newContent = content.substring(0, insertionPoint) + ',\n' + wordsStr + '\n];\n';
    
    fs.writeFileSync(filePath, newContent);
    console.log(`Added words to ${file}`);
}
