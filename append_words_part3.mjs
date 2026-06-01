import fs from 'fs';

const additions = {
  'verbsList.js': {
    varName: 'verbsWords',
    items: [
      { word: "بەردەستبوون", hint: "دەمێ تشتەک یێ حازرە ل دەف تە و تو دشێی بکار بهینی." },
      { word: "بەردان", hint: "دەمێ تو دەستێ خوە ڤەدکەی و تشتەک ژ دەستێ تە دکەڤیتە خوارێ." },
      { word: "بەرزەبوون", hint: "دەمێ تشتەک یان کەسەک ل بەر چاڤان نامینیت ." },
      { word: "لبەرکرن", hint: "دەمێ تو جلان ل خوە دکەی." },
      { word: "بەرھەڤکرن", hint: "دروستکرن و حازرکرنا خوارنێ یان جلوبەرگانە بەریا دەمێ پێدڤی." },
      { word: "بەزاندن", hint: "دەمێ تو د پێشبڕکێ یان شەڕی دا ب سەرکەڤی و بەرامبەری خوە بشکێنی." }
    ]
  },
  'clothingList.js': {
    varName: 'clothingWords',
    items: [
      { word: "بەردەستک", hint: "د دەمێ خوارنچێکرنێ دا تو ل بەر خوە دکەی، دا جلێن تە پیس نەبن." },
      { word: "بەریک", hint: "د ناڤ پانتۆل یان قەمیسێ تە دا یە، تو پارە و مۆبایلێ تێدا دپارێزی." }
    ]
  },
  'adjectivesList.js': {
    varName: 'adjectivesWords',
    items: [
      { word: "بەردەست", hint: "ئەو کەسێ دگەل هۆستای کار دکەت و هاریکارە، یان تشتێ حازر." },
      { word: "بەرزە", hint: "تشتەکێ تە هنداکری، و چەند لێ دگەڕێیی چاڤێن تە نابینن." },
      { word: "بەرشیر", hint: "زارۆکەکێ گەلەک ساڤایە، هێشتا نان نەخوارییە و بتنێ شیری ڤەدخۆت." },
      { word: "بەرفرە", hint: "جهەکێ گەلەک مەزنە، و نە تەنگە." },
      { word: "بەرکەتی", hint: "تشتەک یان کەسەکێ بمفا یە." },
      { word: "بەرھنگار", hint: "کەسێ کو خوە ددەتە بەر شولان یان ئاریشان، و دژی وان ڕادوەستیت بێ ترس." },
      { word: "بەرھەڤ", hint: "تشتێ حازر، دەمێ هەمی کار ب دوماهی هاتیین و ل هیڤییا بکارئینانێ یە." },
      { word: "بەژنزراڤ", hint: "کەسەکێ لاوازە، گەلەک قەلەو نینە و لەشەکێ جوان هەیە." },
      { word: "بەژنکورت", hint: "کەسێ کو بەژنا وی نە درێژە." },
      { word: "بەژنبلند", hint: "کەسێ کو بەژنا وی درێژە، ب ساناهی دەستێ وی دگەهیتە تشتێن بلند." },
      { word: "بەڵاڤ", hint: "تشتەکێ کو ل هەمی جهان هەی، نە یێ کۆمکرییە." },
      { word: "بەڵاڤە", hint: "دەمێ خەلک یان تشت ل ئێک جھ نەبن و هەر ئێک ل جهەکێ بیت." }
    ]
  },
  'natureList.js': {
    varName: 'natureWords',
    items: [
      { word: "بەڕی", hint: "دارەکە کو ل چیایان شین دبیت ." },
      { word: "بەفر", hint: "وەکی پەمبی یا سپییە و یا سارە." }
    ]
  },
  'generalWordsList.js': {
    varName: 'generalWords',
    items: [
      { word: "بەرسڤ", hint: "دەمێ کەسەک پرسیارەکێ ژ تە دکەت و تو ڤێ ددەیێ." },
      { word: "بەروڤاژی", hint: "دەمێ ئاراستەیا تشتەکێ دژایەتییا تشتەکێ دی دکەت یان پێچەوانە دبیت." },
      { word: "بەرمایک", hint: "ئەو خوارنا کو پشتی تێربوونێ د سێنیێ دا دمینیت." },
      { word: "بەرھەم", hint: "ئەو فێقییە کو دار ددەت، یان ئەو تشتێ ژ کار و وەستیانا تە پەیدا دبیت." },
      { word: "بەش", hint: "پارچەیەکە ژ تشتەکێ مەزنتر." },
      { word: "بەلا", hint: "ڕوودانەکا نەخۆشە یان موصیبەتەکە کو بسەرێ مرۆڤی دا دهێت بێی حەزا وی." },
      { word: "بەلاش", hint: "دەمێ تو تشتەکی وەردگری بێی کو چ پاران بدەی." },
      { word: "بەلاڤۆک", hint: "کاغەزەکە گەلەک زانیاری ل سەرن و ل ناڤ خەلکی دهێتە بەلاڤکرن." }
    ]
  },
  'bodyPartsList.js': {
    varName: 'bodyPartsWords',
    items: [
      { word: "بەرسنگ", hint: "دکەڤیتە پێشیا مرۆڤی و د بن ستووی دا، جهێ لێدانا دلییە." },
      { word: "بەژن", hint: "درێژاهی و قەبارەیێ مرۆڤییە ژ پێیان هەتا سەری." }
    ]
  },
  'feelingsList.js': {
    varName: 'feelingsWords',
    items: [
      { word: "بەرسۆژ", hint: "دەمێ زکێ تە دئێشیت و دسوژیت، پشتی خوارنا تشتێن ترش پەیدا دبیت." }
    ]
  },
  'timeList.js': {
    varName: 'timeWords',
    items: [
      { word: "بەروەخت", hint: "کرنا کارەکێ یە بەریا دەمێ وی یێ دروست بهێت." },
      { word: "بەروار", hint: "هژمارا ڕۆژ و هەیڤ و سالانە کو مێژوویا تشتان نیشان ددەت." },
      { word: "بەرێ", hint: "دەمێ بۆری یە، بەروڤاژییا نوکە یان پاشەڕۆژێ یە." }
    ]
  },
  'placesList.js': {
    varName: 'placesWords',
    items: [
      { word: "بەڕۆژ", hint: "ئەو لایێ چیا یان خانییە کو هەردەم تیشکا ڕۆژێ لێ ددەت و گەرمترە." }
    ]
  },
  'householdList.js': {
    varName: 'householdWords',
    items: [
      { word: "بەلەم", hint: "ل سەر ئاڤێ ب ڕێڤە دچیت." }
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
