const fs = require('fs');
const lines = fs.readFileSync('C:/Users/RYZEN5950X/Desktop/my_words.txt.txt', 'utf8').split('\n');

let changes = {
    typos: 0,
    kelupelMali: 0,
    generalWords: 0
};

for(let i=0; i<lines.length; i++) {
  let l = lines[i];
  let parts = l.split('|');
  if(parts.length > 3) {
    let word = parts[1].trim();
    let cat = parts[2].trim();
    let def = parts[3].trim();
    
    let originalCat = cat;

    // 1. چاککردنی هەڵەی نووسین
    if (cat === 'وەسف(هەڤالناڤ)') cat = 'وەسف (هەڤالناڤ)';
    if (cat === 'کار(چاوگ)') cat = 'کار (چاوگ)';
    if (cat === 'سروشت') cat = 'سرۆشت';
    if (cat === 'جھ') cat = 'جهـ';
    
    if (cat !== originalCat) changes.typos++;

    // 2. یەکلاکردنەوەی کەلوپەلێ مالێ
    if (cat === 'کەلوپەلێ مالێ') {
        let isDevice = def.includes('کارەبایی') || def.includes('ئامیرەکە') || def.includes('ئامیرەکێ') || def.includes('ئامیرێ') || word === 'تەلەفزیۆن' || word === 'سۆپە' || word === 'جلشۆ' || word === 'سەلاجە';
        let isMaterial = def.includes('ماددەیەکە') || def.includes('ماددەیەکێ') || def.includes('ماددەیەکا') || word === 'تایت' || word === 'سابین';
        
        if (isDevice) {
            cat = 'ئامیرە';
        } else if (isMaterial) {
            cat = 'کەرەستە';
        } else {
            cat = 'کەلوپەل';
        }
        changes.kelupelMali++;
    }

    // 3. ڕێکخستنی پەیڤێن گشتی
    if (cat === 'پەیڤێن گشتی') {
        let newCat = cat;
        
        if (def.includes('نەخۆشی') || def.includes('ئێش') || def.includes('پەتا')) {
            newCat = 'نەخۆشی';
        } else if (def.includes('پیرۆز') || def.includes('خودا') || def.includes('خودێ') || def.includes('نڤێژ') || def.includes('ئایین')) {
            newCat = 'ئایین';
        } else if (def.includes('پارە') || word === 'باج' || word === 'بەرتیل' || word === 'بەخشیش' || word === 'کرێ' || def.includes('پارەی')) {
            newCat = 'ئابووری';
        } else if (def.includes('پرسیار') || def.includes('بەرسڤ') || def.includes('زانیاری') || def.includes('نووچە') || def.includes('پەیوەندی') || def.includes('ئاخفتن')) {
            newCat = 'پەیوەندی';
        } else if (def.includes('پیڤەر') || def.includes('پیڤان') || def.includes('کێش') || word === 'بھۆست') {
            newCat = 'پێڤەر';
        } else if (def.includes('ژمارە')) {
            newCat = 'ژمارە';
        } else if (def.includes('پارچە') && (def.includes('مەزنتر') || def.includes('بچویکە')) || def.includes('بەش') || word === 'بناغە' || word === 'بنیات' || word === 'پشک' || word === 'پرت') {
            newCat = 'پێکهاتە';
        }

        if (newCat !== cat) {
            cat = newCat;
            changes.generalWords++;
        }
    }

    // Apply the change
    if (cat !== originalCat) {
        parts[2] = ' ' + cat + ' ';
        lines[i] = parts.join('|');
    }
  }
}

fs.writeFileSync('C:/Users/RYZEN5950X/Desktop/my_words.txt.txt', lines.join('\n'));
console.log('گۆڕانکارییەکان جێبەجێ کران:');
console.log('- چاککردنی فۆرمات و هەڵەی نووسین: ' + changes.typos);
console.log('- ڕێکخستنی کەلوپەلێ مالێ: ' + changes.kelupelMali);
console.log('- دروستکردنی کاتاگۆری نوێ بۆ پەیڤێن گشتی: ' + changes.generalWords);
