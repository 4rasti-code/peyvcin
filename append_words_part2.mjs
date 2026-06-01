import fs from 'fs';

const additions = {
  'generalWordsList.js': {
    varName: 'generalWords',
    items: [
      { word: "بناغە", hint: "بنێ خانیێ تە یە، ئەگەر ئەز نە بهێز بم خانی دێ ب سەر تە دا هەڕفیت." },
      { word: "بنەجھ", hint: "کەسێ کو مالا وی ل جهەکێ بیت و ژ وێرێ نەچیتە چ جهێن دی." },
      { word: "بنیات", hint: "ڕەھ و ڕیشالێن تشتانە، ئەگەر باش بیت، دوماهی ژی دێ باش بیت." },
      { word: "بھۆست", hint: "پیڤەرەکێ کەڤنە ب دەستی، د ناڤبەرا تبلێن تە یێن ڤەکریدا دهێتە پیڤان." },
      { word: "بەتاڵی", hint: "دەمێ تو ل مال دڕوینی و چ شول نینن تو بکەی کو پارەی پێ پەیدا بکەی." },
      { word: "بەخت", hint: "هندەک دبێژن یێ ڕەشە و هندەک دبێژن یێ سپییە، یێ وی باش بیت هەرتم دێ سەرکەڤیت." },
      { word: "بەخشیش", hint: "پارەیەکێ زێدەیە تو ددەیە کرێکاری." },
      { word: "بەربەست", hint: "دیوار یان ئاستەنگەکە د ڕێکێ دا، نەهێلیت تو ب ساناهی دەرباس ببی." },
      { word: "بەرتیل", hint: "پارەیەکێ نەدروستە ددەیە کەسەکێ دا کو کارەکێ قاچاخ یان نەیاسایی بۆ تە بکەت." }
    ]
  },
  'adjectivesList.js': {
    varName: 'adjectivesWords',
    items: [
      { word: "بلەز", hint: "ئەو کەسێ حەز ژ چاڤەڕێکرنێ نەکەت." },
      { word: "بندەست", hint: "ئەوە یێ ئازادی نەبیت، فەرمان ل سەر دهێتە کرن و دەسەڵات نینە." },
      { word: "بێھنتەنگ", hint: "کەسێ کو زویکا بێزار دبیت و حەزا چاڤەڕێکرنێ نینە." },
      { word: "بەتاڵ", hint: "کەسێ کو کار نینە بکەت، یان ئامانێ کو چ د ناڤ دا نەبیت." },
      { word: "بەتەنی", hint: "پارچەکا ستویرە ژ قوماشی یان هریێ، کو د دەمێ نڤستنێ دا بۆ گەرمبوونێ ل سەر خوە داددەین ." },
      { word: "بەخیل", hint: "دەستێ وی یێ گرێدایە، حەز ژ کۆمکرنا پارەی دکەت و دل نادەت مەزاختنێ بکەت." },
      { word: "بەرتەنگ", hint: "جهەکێ کێم فرەهە، ب زەحمەت مرۆڤ تێدا دەرباس دبیت." }
    ]
  },
  'placesList.js': {
    varName: 'placesWords',
    items: [
      { word: "بنعەرد", hint: "دکەڤیتە بن پێیێن تە، تاریە." },
      { word: "بنگەھ", hint: "جهێ سەرەکییە کو کار لێ دهێتە کرن، یان دەستپێکا تشتەکییە." },
      { word: "بھەشت", hint: "جهێ خێرخوازانە ل ئاخرەتێ، هەمی تشتێن جوان و خۆش تێدا هەنە." },
      { word: "بەرامبەر", hint: "ڕووی ب ڕووی تە یە." },
      { word: "بەراھی", hint: "دەستپێکا ڕێکێ یان ل پێشیا هەمی کەسانە، ئەو جهێ کو زیتر دهێتە دیتن." }
    ]
  },
  'colorsList.js': {
    varName: 'colorsWords',
    items: [
      { word: "بنەفشی", hint: "ڕەنگەکێ جوانە، ژ تێکەلکرنا سۆر و شینی چێدبیت." }
    ]
  },
  'familyList.js': {
    varName: 'familyWords',
    items: [
      { word: "بنەمال", hint: "باب و باپیر و زارۆکێن وان پێکڤە." }
    ]
  },
  'feelingsList.js': {
    varName: 'feelingsWords',
    items: [
      { word: "بێھن", hint: "ب چاڤان ناهێتە دیتن لێ ب دفنێ دهێتە هەستکرن." }
    ]
  },
  'verbsList.js': {
    varName: 'verbsWords',
    items: [
      { word: "بھیستن", hint: "کارێ گوھانە، بێی وێ تو چ تێناگەهی." },
      { word: "بۆرین", hint: "دەرباسبوونا دەمی یان کەسەکییە د ڕێکەکێ ڕا و نەمانا وی ل وی جهی." },
      { word: "بەخشین", hint: "لێخۆشبوونە ژ خەلەتیێن خەلکی، یان دانا تشتەکییە بێی بەرامبەر." },
      { word: "بەرپێک", hint: "دەمێ پیێن خوا ددەینتە بەر پێن تە و تو خوار دبی دا بکەڤی." },
      { word: "بەردەستکرن", hint: "حازرکرن و دانا تشتەکی یە بۆ کەسەکی دا کو ل بەردەستێ وی بیت." }
    ]
  },
  'householdList.js': {
    varName: 'householdWords',
    items: [
      { word: "بۆڕی", hint: "درێژە و د ناڤ دا یا ڤالایە، ئاڤ یان غاز د ناڤ دا دەرباس دبن." },
      { word: "بەرچاڤک", hint: "چاڤان ژ ڕۆژێ دپارێزیت یان دیتنێ باشتر دکەت." }
    ]
  },
  'timeList.js': {
    varName: 'timeWords',
    items: [
      { word: "بەتراپێر", hint: "ڕۆژا بەری دوو ڕۆژانە، بوویە بۆری و چ جاران نازڤڕیت." },
      { word: "بەربانگ", hint: "دەمێ ژبەری ڕۆژهەلاتنێ یە، کو ڕووناهی ل ئەسمانی پەیدا دبیت." }
    ]
  },
  'bodyPartsList.js': {
    varName: 'bodyPartsWords',
    items: [
      { word: "بەدەن", hint: "لەشێ مرۆڤییە ژ سەر هەتا پێیان، کو گیان تێدا دژیت." }
    ]
  },
  'natureList.js': {
    varName: 'natureWords',
    items: [
      { word: "بەر", hint: "ل چیا و دەشتان یێ هەی، یێ ڕەقە." }
    ]
  },
  'animalsList.js': {
    varName: 'animalsWords',
    items: [
      { word: "بەران", hint: "نێرێ پەزی یە، شاخێن وی یێن باداینە." }
    ]
  },
  'humanNamesList.js': {
    varName: 'humanNames',
    items: [
      { word: "بەربژێر", hint: "کەسەکە کو خۆ ل سەر پۆستەکی هەلبژارتییە." }
    ]
  },
  'jobsList.js': {
    varName: 'jobsWords',
    items: [
      { word: "بەرپرس", hint: "خودان دەسەڵاتە ل سەر کارەکی یان کۆمەکا مرۆڤان" },
      { word: "بەردەڤک", hint: "ب ناڤێ کۆمەکێ یان دەزگەهەکێ باخڤیت، و دەنگێ وان دگەهینیتە خەلکی." }
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
