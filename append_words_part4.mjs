import fs from 'fs';

const additions = {
  'humanNamesList.js': {
    varName: 'humanNames',
    items: [
      { word: "بەندە", hint: "ئەو کەسێ کو هەر کارەک ژێ بهێتە خواستن دڤێت بکەت." },
      { word: "بیرھات", hint: "تشتەک یان ڕوودانەکە کو د مێشکێ تە دا مایە و تو هەردەم ببیرا خوە دئینیڤە." }
    ]
  },
  'placesList.js': {
    varName: 'placesWords',
    items: [
      { word: "بەنداڤ", hint: "دیوارەکێ مەزنە ل پێشیا ئاڤێ دهێتە چێکرن دا کو ئاڤ کۆم ببیت." },
      { word: "بانک", hint: "جهێ پارە تێدا دهێنە پاراستن." }
    ]
  },
  'adjectivesList.js': {
    varName: 'adjectivesWords',
    items: [
      { word: "بەندەوار", hint: "کەسێ کو چاڤەڕێی هاتنا تشتەکی یان کەسەکی بیت." },
      { word: "بەنگین", hint: "کەسێ کو دلێ وی گەلەک ب کەسەکێ یان تشتەکی ڤە هاتبیتە گرێدان و ئاشق بیت." },
      { word: "بەھرەمەند", hint: "ئەو کەسێ کو ژێهاتییە و شارەزایە د کارەکێ تایبەت دا ژبەر شیانێن خوە یێن سروشتی." },
      { word: "بیانی", hint: "کەسێ کو خەلکێ وەلاتێ تە نەبیت و ژ دەرڤە هاتبیت." },
      { word: "بێعار", hint: "ئەو کەسێ کو شەرم ژ چ تشتی ناکەت، باخڤیت یان بکەت بێی کو خەمێ بخۆت." },
      { word: "بێباب", hint: "زارۆکێ کو بابێ وی چوویە بەر دلۆڤانییا خودێ یان یێ بێ خودان." },
      { word: "بێتام", hint: "خوارنەکا کو چ خۆشی تێدا نەبیت، نە یا سویرە، نە یا شرینە و نە یا ترشە." },
      { word: "بێچارە", hint: "ئەو کەسێ کو هیچ چارەسەری و ڕێکەک د دەستی دا نەمایە د دەمێ نەخۆشیێ یان ئاریشەیێ دا." },
      { word: "بێحال", hint: "ئەو کەسێ کو چ هێز و شیان تێدا نەماینە ژ وەستیانێ یان نەخۆشیێ." },
      { word: "بێخیرەت", hint: "کەسێ کو چ غیرەت نینە بەرگریێ ژ خوە یان مافێ خوە بکەت، و هەردەم دترسیت." },
      { word: "بێخێر", hint: "تشت یان کەسەکێ کو چ مفا بۆ تە و خەلکی ژێ نەهێت." },
      { word: "بێخەم", hint: "ئەو کەسێ کو د دنیاێ دا خەمێ ژ چ تشتان ناخۆت." },
      { word: "بێدل", hint: "دەمێ تو کارەکی دکەی لێ حەزا تە ل سەر نینە و ب زۆری دکەی." },
      { word: "بێدین", hint: "کەسێ کو باوەری ب چ ئایین و خودایان نەبیت." },
      { word: "بێدەنگ", hint: "ئەو کەسێ یان ئەو جهێ کو چ دەنگ تێدا نەهێت و یێ ئارام بیت." },
      { word: "بێڕوح", hint: "ئەو کەسێ کو چ دلۆڤانی د دلێ وی دا نەبیت ل بەرامبەر نەخۆشیا خەلکی." },
      { word: "بێزار", hint: "دەمێ مێشک و دلێ تە ژ بارودۆخەکی یان کەسەکی تژی دبیت و حەز ب گۆهۆڕینێ دکەی." },
      { word: "بێزراڤ", hint: "کەسێ کو زویکا دترسیت." },
      { word: "بێمراد", hint: "ئەو کەسێ کو چاڤەڕێی تشتەکی بوویە، لێ ب دەست نەکەفتی و هیڤییا وی بڕی." },
      { word: "بێوار", hint: "کەسێ کو مال و وار و جھ نینن لێ بژیت و یێ بەرزەیە." },
      { word: "بێمەژی", hint: "کەسێ کو ئەقلی بکار نائینیت و کارێن شاش و بێ هزر دکەت." }
    ]
  },
  'foodList.js': {
    varName: 'foodWords',
    items: [
      { word: "بەنیشت", hint: "مرۆڤ دکەتە د دەڤێ خوە دا و دجویت." }
    ]
  },
  'generalWordsList.js': {
    varName: 'generalWords',
    items: [
      { word: "بەھرە", hint: "شیانەکا تایبەتە کو خودێ ددەتە مرۆڤی، وەک دەنگخۆشی." },
      { word: "بەھی", hint: "دەمێ کەسەک دچیتە بەر دلۆڤانییا خودێ، کەس و کار کۆم دبن." },
      { word: "بیاڤ", hint: "بابەتەکێ تایبەت، بۆ نموونە وەکی زانست یان وەرزش." },
      { word: "بیر", hint: "پەرتووکا مێشکێ تە یە، هەر تشتێ تە د ژیانا خوە دا دیتبیت یان زانیبیت تێدا دهێتە هەلگرتن." },
      { word: "بیرۆڤ", hint: "نەخۆشییەکا پیستی یە، دێ پیستێ تە سوژیت و دخوریت." },
      { word: "بێخیرەتی", hint: "ئەو سیفەتە دەمێ مرۆڤ خوە ل بەر باج و ئەرکان نەگریت و ترسەک د دلی دا هەبیت." }
    ]
  },
  'vegetablesList.js': {
    varName: 'vegetablesWords',
    items: [
      { word: "بیبەر", hint: "کەسکە، زەرە یان سۆرە، ئەگەر یا تیژ بیت دێ دەڤێ تە سوژیت." }
    ]
  },
  'verbsList.js': {
    varName: 'verbsWords',
    items: [
      { word: "بیرچوون", hint: "دەمێ تشتەک ژ مێشکێ تە دەردکەڤیت و تو چەند هزر دکەی ناهێتە بیرا تە." },
      { word: "بیرھاتن", hint: "دەمێ تشتەک دهێتە بیرا تە پشتی کو تە بۆ دەمەکێ ژبیرکربوو." }
    ]
  },
  'natureList.js': {
    varName: 'natureWords',
    items: [
      { word: "بیڤەلەرز", hint: "دەمێ ئەرد دبن پێیێن تە دا دهەژیت و خانی دکەڤنە لەرزینێ." }
    ]
  },
  'clothingList.js': {
    varName: 'clothingWords',
    items: [
      { word: "بیجامە", hint: "جلێن مالێ نە، نەرم و خۆشن بۆ دەمێ نڤستنێ." }
    ]
  },
  'feelingsList.js': {
    varName: 'feelingsWords',
    items: [
      { word: "بێری", hint: "دەمێ دلێ تە بۆ کەسەکێ یان جهەکێ دویر دسوژیت." }
    ]
  },
  'jobsList.js': {
    varName: 'jobsWords',
    items: [
      { word: "بێریڤان", hint: "ئافرەتا کو ل گوندی بەرێ خوە ددەتە پەزی و شیری ددۆشیت." },
      { word: "بێژەر", hint: "کەسێ کو ل ڕادیۆ یان تەلەڤزیۆنێ نووچە و بەرنامەیان پێشکێش دکەت." }
    ]
  },
  'householdList.js': {
    varName: 'householdWords',
    items: [
      { word: "بێژینگ", hint: "ئامانەکێ بن کونە، ئاریدکەنە تێدا، داکو پاقژ بکەن ژ پیساتیێ." }
    ]
  }
};

for (const [filename, data] of Object.entries(additions)) {
  const path = `src/data/${filename}`;
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    const newItemsStr = data.items.map(item => `  {\n    "word": "${item.word}",\n    "hint": "${item.hint}"\n  }`).join(',\n');
    
    const lastBracketIndex = content.lastIndexOf('];');
    if (lastBracketIndex !== -1) {
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
