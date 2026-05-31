import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'src', 'data');

const additions = {
    'bodyPartsList.js': [
        { word: 'تەنشت', hint: 'پشکا تەنیشتێ یا لەشی', category: 'ئەندامێ لەشی' },
        { word: 'ریڤیک', hint: 'بۆرییێن درێژ یێن ناڤ زکی بۆ ڤەگوھاستنا پاشمایێن خوارنێ', category: 'ئەندامێ لەشی' },
        { word: 'میلاک', hint: 'ئەندامەکێ گرنگە د ناڤ زکیدا (جەگەر)', category: 'ئەندامێ لەشی' }
    ],
    'foodList.js': [
        { word: 'لەفە', hint: 'خوارنەکا ب لەزە کو د ناڤ نانی دا دهێتە پێچان', category: 'خوارن' }
    ],
    'humanNamesList.js': [
        { word: 'مرۆڤ', hint: 'کەس، بەنیئادەم', category: 'ناڤێ مرۆڤان' }
    ]
};

for (const [file, words] of Object.entries(additions)) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    const insertionPoint = content.lastIndexOf('];');
    if (insertionPoint === -1) {
        console.error(`Could not find closing bracket in ${file}`);
        continue;
    }
    
    // Check if we need to add a comma
    const textBefore = content.substring(0, insertionPoint).trim();
    const needsComma = !textBefore.endsWith(',');
    
    const wordsStr = words.map(w => `  {\n    "word": "${w.word}",\n    "hint": "${w.hint}",\n    "category": "${w.category}"\n  }`).join(',\n');
    
    const newContent = content.substring(0, insertionPoint) + (needsComma ? ',\n' : '\n') + wordsStr + '\n];\n';
    
    fs.writeFileSync(filePath, newContent);
    console.log(`Added words to ${file}`);
}
