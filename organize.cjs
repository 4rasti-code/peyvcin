const fs = require('fs');
const lines = fs.readFileSync('C:/Users/RYZEN5950X/Desktop/my_words.txt.txt', 'utf8').split('\n');

let changes = 0;
// تەنها ئەو سێ کاتاگۆریە دەستکاری دەکرێن کە داوات کردووە
const targetCats = ['کەرەستە', 'کەلوپەل', 'ئامیرە']; 

for(let i=0; i<lines.length; i++) {
  let l = lines[i];
  let parts = l.split('|');
  if(parts.length > 3) {
    let word = parts[1].trim();
    let cat = parts[2].trim();
    let def = parts[3].trim();
    
    // ئەگەر لەم سێ کاتاگۆریە نەبێت، دەستکاری ناکرێت
    if(!targetCats.includes(cat)) continue;
    
    let newCat = cat;
    
    // پشکنین بۆ ئامیرە (Device)
    let isDevice = def.includes('کارەبایی') || def.includes('ئامیرەکە') || def.includes('ئامیرەکێ') || def.includes('ئامیرێ') || word === 'ڕادیۆ' || word === 'تڕۆمبێل' || word === 'ئاڤتەزینک' || word === 'بالەفڕ' || word === 'تەلەفزیۆن' || word === 'دیربین' || word === 'سۆپە' || word === 'جلشۆ' || word === 'سەلاجە';
    
    // پشکنین بۆ کەرەستە (Material)
    let isMaterial = def.includes('ماددەیەکە') || def.includes('ماددەیەکێ') || def.includes('ماددەیەکا') || word === 'تایت' || word === 'پانزین' || word === 'نەفت' || word === 'گاز' || word === 'کل' || word === 'خەنا' || word === 'سابین' || word === 'ڕەژی' || word === 'کنف' || word === 'فافۆن' || word === 'چیمەنتۆ' || word === 'قوماش' || def.includes('کانزایەکێ') || def.includes('کانزایەکە');
    
    // پشکنین بۆ کەلوپەل (Equipment/Tools)
    let isEquipment = def.includes('ئامانەکە') || def.includes('ئامانەکێ') || def.includes('دەفر') || def.includes('ئامراز') || def.includes('حەبل') || def.includes('دەزی') || def.includes('سندۆق') || def.includes('ئامانێ') || def.includes('پارچە');

    // دانانی کاتاگۆریە نوێیەکە بەپێی تایبەتمەندی
    if (isDevice) {
        newCat = 'ئامیرە';
    } else if (isMaterial) {
        newCat = 'کەرەستە';
    } else if (isEquipment || cat === 'کەلوپەل') {
        newCat = 'کەلوپەل';
    }

    // گۆڕینی دێڕەکە ئەگەر پێویست بێت
    if(newCat !== cat) {
      parts[2] = ' ' + newCat + ' ';
      lines[i] = parts.join('|');
      changes++;
    }
  }
}

fs.writeFileSync('C:/Users/RYZEN5950X/Desktop/my_words.txt.txt', lines.join('\n'));
console.log('سەرکەوتوو بوو! ' + changes + ' پەیڤ ڕێکخران لەناو ئەو سێ کاتاگۆریەدا.');
