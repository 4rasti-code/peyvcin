import fs from 'fs';

const additions = {
  'natureList.js': {
    varName: 'natureWords',
    items: [
      { word: "ئاخ", hint: "هەمی تشت ل سەر پشتا من شین دبن و دژین، ل دوماهیێ هەمی دزڤڕنە دەف من." },
      { word: "ئار", hint: "ئەگەر برسی بیت هەمی تشتان دخۆت، ئەگەر تە ئاڤ دایێ دێ مریت." },
      { word: "ئەسمان", hint: "خانییەکێ مەزن و بێ ستوینە، ب ڕۆژێ شینە و ب شەڤێ یێ پڕی چرایە." },
      { word: "ئاڤ", hint: "نە ڕەنگ هەیە نە تام هەیە، لێ ژیان بێی وێ نابیت." },
      { word: "ستری", hint: "دگەل گولێ شین دبم، یێ تیژم و دەستێ تە دبریندار کەم." },
      { word: "ستێر", hint: "ب شەڤێ وەک ئەڵماسان، ب ڕۆژێ ژی بەرزە دبن." },
      { word: "ئەرد", hint: "ئەز د بن پێیاندامە و مرۆڤ ل سەر من دژین." },
      { word: "عەور", hint: "پارچەیێن سپی یان ڕەشن ل ئاسمانی." },
      { word: "با", hint: "ئەز دێ هێم و چم، تو من نابینی لێ تو هەست ب من دکەی." },
      { word: "باھۆز", hint: "بایەکێ گەلەک بهێزە، توزا تاری دگەل خوە دئینیت." }
    ]
  },
  'verbsList.js': {
    varName: 'verbsWords',
    items: [
      { word: "ئاخفتن", hint: "نە دهێتە دیتن و نە دهێتە گرتن، لێ دکەڤیتە د گوھان دا." },
      { word: "ئازادکرن", hint: "دانا ژیانەکا نوویە ب بالندەیەکێ یان مرۆڤەکێ گرتی." },
      { word: "ئاڤڕابوون", hint: "دەمێ ئاڤ ڕادبیت و هار دبیت." }
    ]
  },
  'jobsList.js': {
    varName: 'jobsWords',
    items: [
      { word: "ئاشڤان", hint: "کارێ من ل سەر ئاڤێ و بەرانە، ئەز گەنمی دکەمە ئار." }
    ]
  },
  'humanNamesList.js': {
    varName: 'humanNames',
    items: [
      { word: "ئاغا", hint: "د ناڤ گوندی دا خودان دەسەڵاتە، دیوان مالا وی یا مەزنە." }
    ]
  },
  'placesList.js': {
    varName: 'placesWords',
    items: [
      { word: "ئاڤاھی", hint: "ژ ئاخ و بەر و چیمەنتۆیێ چێدبیت، مرۆڤ تێدا دژین یان کار دکەن." },
      { word: "ئاڤدەست", hint: "بچویکترین ژوورا مالێ یە، کو مرۆڤ خوە تێدا پاقژ دکەت." },
      { word: "ئۆدە", hint: "پارچەیەکا مالێ یە، چوار دیوار و دەرگەهەک هەنە." }
    ]
  },
  'bodyPartsList.js': {
    varName: 'bodyPartsWords',
    items: [
      { word: "ئاقل", hint: "د ناڤ سەرێ مرۆڤیدا یە، بێی وی مرۆڤ تشتان نزانیت ناکەت." },
      { word: "ئەنیشک", hint: "پرا د ناڤبەرا مل و دەستی دا، بێی من تو نەشێی دەستێ خۆ بچەمێنی." },
      { word: "ئەزمان", hint: "پارچەیەکا گۆشتییە د ناڤ دەڤی دا، تاما تشتان دکەت و پەیڤان دبێژیت." }
    ]
  },
  'householdList.js': {
    varName: 'householdWords',
    items: [
      { word: "ئاگردانک", hint: "جهێ من د ناڤ مالێ دایە، زڤستانان خەلک ل دۆر من دکۆم دبن دا گەرم ببن." },
      { word: "ئالا", hint: "پارچە قوماشەکێ ڕەنگینە، نیشانا سەربەخۆیی و ناسنامەیا وەڵاتانە" },
      { word: "ئالاڤ", hint: "ئەز هاریکارییا تە دکەم بۆ چێکرنا تشتان، وەک چەکۆچ و بڤری." },
      { word: "ئامیر", hint: "ئامرازەکێ کارەبایی یان ئاسنی یە، کارێن ب زەحمەت سڤک دکەت." },
      { word: "بالەفڕ", hint: "بالندەیەکێ ئاسنی یە، مرۆڤان دکەتە د زکێ خوە دا." },
      { word: "بالیفک", hint: "دکەڤیتە بن سەرێ تە، خەوێ ل تە خۆش دکەت." },
      { word: "بلویر", hint: "پارچە دارەکا کون کونە، شڤان ئاوازێن خەمگین دژەنیت." }
    ]
  },
  'cityList.js': {
    varName: 'cityWords',
    items: [
      { word: "ئامەد", hint: "باژێڕەکێ مەزن یێ باکوورێ کوردستانێیە، دیوارێن وێ یێن ڕەش و دێرینن." },
      { word: "باژێڕ", hint: "مالێن زۆر و جاددەیێن مەزن تێدا هەنە، خەلکەکێ زۆر تێدا دژین." }
    ]
  },
  'feelingsList.js': {
    varName: 'feelingsWords',
    items: [
      { word: "باوەری", hint: "تشتەکێ نەدیتتی یە د دلی دا." }
    ]
  },
  'adjectivesList.js': {
    varName: 'adjectivesWords',
    items: [
      { word: "بچویک", hint: "تشتێ کێم قەبارە یان زارۆکێ کو هێشتا مەزن نەبووی." }
    ]
  },
  'familyList.js': {
    varName: 'familyWords',
    items: [
      { word: "برازا", hint: "خوینا تە یە، لێ نە زارۆکێ تە یە." }
    ]
  },
  'animalsList.js': {
    varName: 'animalsWords',
    items: [
      { word: "بلبل", hint: "دەنگخۆشترین بالندەیە، حەز ژ گولان دکەت" }
    ]
  }
};

for (const [filename, data] of Object.entries(additions)) {
  const path = `src/data/${filename}`;
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Convert items to string format
    const newItemsStr = data.items.map(item => `  {\n    "word": "${item.word}",\n    "hint": "${item.hint}"\n  }`).join(',\n');
    
    // Find the last array closing bracket
    const lastBracketIndex = content.lastIndexOf('];');
    if (lastBracketIndex !== -1) {
      // Check if there's already items
      const beforeBracket = content.substring(0, lastBracketIndex).trimEnd();
      const hasTrailingComma = beforeBracket.endsWith(',');
      const isArrayEmpty = beforeBracket.endsWith('[');
      
      let insertion = '';
      if (!isArrayEmpty && !hasTrailingComma) {
        insertion = ',\n';
      }
      insertion += newItemsStr + '\n';
      
      const newContent = content.substring(0, lastBracketIndex) + insertion + '];\n';
      fs.writeFileSync(path, newContent);
      console.log(`Updated ${filename}`);
    }
  } else {
    console.log(`File not found: ${path}`);
  }
}
