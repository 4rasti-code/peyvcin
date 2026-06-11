const fs = require('fs');
const file = 'C:/Users/RYZEN5950X/Desktop/my_words.txt.txt';
const lines = fs.readFileSync(file, 'utf8').split('\n');

let changes = {
    natureToPlant: 0,
    foodToPlant: 0,
    foodToVegetable: 0,
    foodToFruit: 0,
    generalToPlant: 0
};

const targetCats = ['سرۆشت', 'خوارن', 'زەرزەوات', 'پەیڤێن گشتی', 'میوە'];

for(let i=0; i<lines.length; i++) {
  let l = lines[i];
  let parts = l.split('|');
  if(parts.length > 3) {
    let word = parts[1].trim();
    let cat = parts[2].trim();
    let def = parts[3].trim();
    let originalCat = cat;

    if (!targetCats.includes(cat)) continue;

    // دیاریکردنی ڕووەک (Plants/Trees/Flowers)
    let isPlant = def.includes('ڕووەک') || def.includes('دارەکە') || def.includes('دارێ') || def.includes('درەخت') || def.includes('گیایە') || def.includes('گوڵ') || word === 'ستری' || word === 'دار';
    
    // دیاریکردنی زەرزەوات
    let isVeggie = def.includes('زەرزەوات') || def.includes('سەوزە');

    // دیاریکردنی میوە
    let isFruit = def.includes('میوە') || def.includes('فێقی');

    if (isPlant && !isFruit && !isVeggie) {
        cat = 'ڕووەک';
    } else if (isFruit) {
        cat = 'میوە';
    } else if (isVeggie) {
        cat = 'زەرزەوات';
    }

    if (cat !== originalCat) {
        parts[2] = ' ' + cat + ' ';
        lines[i] = parts.join('|');
        
        if (originalCat === 'سرۆشت' && cat === 'ڕووەک') changes.natureToPlant++;
        if (originalCat === 'خوارن' && cat === 'ڕووەک') changes.foodToPlant++;
        if (originalCat === 'خوارن' && cat === 'زەرزەوات') changes.foodToVegetable++;
        if (originalCat === 'خوارن' && cat === 'میوە') changes.foodToFruit++;
        if (originalCat === 'پەیڤێن گشتی' && cat === 'ڕووەک') changes.generalToPlant++;
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('ئەنجامی ڕێکخستنەوەی کاتاگۆرییەکان:');
console.log('- لە سرۆشت بۆ ڕووەک: ' + changes.natureToPlant);
console.log('- لە خوارن بۆ ڕووەک: ' + changes.foodToPlant);
console.log('- لە خوارن بۆ زەرزەوات: ' + changes.foodToVegetable);
console.log('- لە خوارن بۆ میوە: ' + changes.foodToFruit);
console.log('- لە پەیڤێن گشتی بۆ ڕووەک: ' + changes.generalToPlant);
