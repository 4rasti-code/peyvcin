import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'src', 'data');

const additions = {
    'foodList.js': [
        { word: 'فستەق', hint: 'جۆرەکێ چەرەزاتانە کو د ناڤ قەپغەکێ ڕەق دایە', category: 'خوارن' },
        { word: 'ساڤاڕ', hint: 'ژ گەنمی دهێتە دروستکرن و دگەل گۆشتی دهێتە خوارن', category: 'خوارن' },
        { word: 'گەنم', hint: 'ژێدەرێ سەرەکی یێ ئاردی یە کو نان ژێ دهێتە دروستکرن', category: 'خوارن' }
    ],
    'householdList.js': [
        { word: 'مەسین', hint: 'قاپەکێ ئاڤێ یە بۆ دەستنڤێژێ دهێتە بکارئینان', category: 'کەلوپەل' },
        { word: 'وەریس', hint: 'پەتەکێ ستوورە بۆ گرێدانا تشتان دهێتە بکارئینان', category: 'کەلوپەل' },
        { word: 'گۆڤار', hint: 'پەرتووکەکا دەمکی یە کو بابەتێن هەمەجۆر تێدانە', category: 'کەلوپەل' }
    ],
    'vegetablesList.js': [
        { word: 'باجان', hint: 'زەرزەواتەکێ سۆرە بۆ زەلاتە و خوارنێ دهێتە بکارئینان', category: 'زەرزەوات' }
    ],
    'verbsList.js': [
        { word: 'کەتن', hint: 'دەمێ مرۆڤ ل سەر پیان نەشێت بوەستیت و بکەڤیتە ئەردی', category: 'کار (چاوگ)' }
    ],
    'placesList.js': [
        { word: 'چایخانە', hint: 'جهەکە بۆ ڤەخوارنا چایێ و ڕوودنشتنێ', category: 'جهـ' }
    ],
    'bodyPartsList.js': [
        { word: 'دەمار', hint: 'بۆریەکا بچووکە د لەشی دا کو خوینێ دگۆهێزیت', category: 'ئەندامێ لەشی' }
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
