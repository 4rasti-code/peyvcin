export const NAME_FONTS = {
  // KU Fonts (Arabic/Kurdish script)
  'default-ku': {
    id: 'default-ku',
    name: 'ئاسایی',
    style: { fontFamily: 'Vazirmatn, sans-serif' },
    language: 'kurdish',
    price: 0,
    currency: 'fils'
  },
  'unimahan-shadia': {
    id: 'unimahan-shadia',
    name: 'UniMahan Shadia',
    style: { fontFamily: '"UniMahan Shadia", sans-serif' },
    language: 'kurdish',
    price: 5000,
    currency: 'fils'
  },
  'uniqaidar-soz-012': {
    id: 'uniqaidar-soz-012',
    name: 'UniQAIDAR Soz 012',
    style: { fontFamily: '"UniQAIDAR_Soz 012", sans-serif', fontSize: '1.6em', transform: 'translateY(-2px)' },
    language: 'kurdish',
    price: 5000,
    currency: 'fils'
  },
  'aref-ruqaa': {
    id: 'aref-ruqaa',
    name: 'ڕوقعە',
    style: { fontFamily: '"Aref Ruqaa", serif', fontSize: '1.1em', transform: 'translateY(-2px)', lineHeight: '1.4', paddingBottom: '6px' },
    language: 'kurdish',
    price: 5000,
    currency: 'fils'
  },
  'kdigital': {
    id: 'kdigital',
    name: 'KDigital',
    style: { fontFamily: '"KDigital", sans-serif' },
    language: 'kurdish',
    price: 10000,
    currency: 'fils'
  },
  'unimahan-ashkan': {
    id: 'unimahan-ashkan',
    name: 'UniMahan Ashkan',
    style: { fontFamily: '"UniMahan Ashkan", sans-serif' },
    language: 'kurdish',
    price: 10000,
    currency: 'fils'
  },
  'unimahan-randa': {
    id: 'unimahan-randa',
    name: 'UniMahan Randa',
    style: { fontFamily: '"UniMahan Randa", sans-serif' },
    language: 'kurdish',
    price: 10000,
    currency: 'fils'
  },
  'noto-nastaliq': {
    id: 'noto-nastaliq',
    name: 'نەستەعلیق',
    style: { fontFamily: '"Noto Nastaliq Urdu", serif', fontSize: '1.05em', transform: 'translateY(-4px)', lineHeight: '1.6', paddingBottom: '8px' },
    language: 'kurdish',
    price: 10000,
    currency: 'fils'
  },

  // EN Fonts (Latin script)
  'default-en': {
    id: 'default-en',
    name: 'Default',
    style: { fontFamily: 'Vazirmatn, sans-serif' },
    language: 'english',
    price: 0,
    currency: 'fils'
  },
  'cinzel': {
    id: 'cinzel',
    name: 'Cinzel',
    style: { fontFamily: 'Cinzel, serif', fontSize: '1.40em' },
    language: 'english',
    price: 5000,
    currency: 'fils'
  },
  'blackadder': {
    id: 'blackadder',
    name: 'Blackadder',
    style: { fontFamily: '"Jim Nightshade", cursive', fontSize: '1.60em' },
    language: 'english',
    price: 5000,
    currency: 'fils'
  },
  'digiface': {
    id: 'digiface',
    name: 'DigifaceWide',
    style: { fontFamily: '"Audiowide", cursive', fontSize: '1.15em' },
    language: 'english',
    price: 5000,
    currency: 'fils'
  },
  'ruby-script': {
    id: 'ruby-script',
    name: 'RubyScript',
    style: { fontFamily: '"Oleo Script", cursive', fontSize: '1.60em' },
    language: 'english',
    price: 5000,
    currency: 'fils'
  },
  'bangers': {
    id: 'bangers',
    name: 'Bangers',
    style: { fontFamily: 'Bangers, sans-serif', fontSize: '1.40em' },
    language: 'english',
    price: 10000,
    currency: 'fils'
  },
  'press-start-2p': {
    id: 'press-start-2p',
    name: 'Pixel',
    style: { fontFamily: '"Press Start 2P", cursive', fontSize: '1.1em' },
    language: 'english',
    price: 10000,
    currency: 'fils'
  },
  'back-to-black': {
    id: 'back-to-black',
    name: 'Back to Black',
    style: { fontFamily: '"Great Vibes", cursive', fontSize: '1.60em', transform: 'translateY(-1px)' },
    language: 'english',
    price: 10000,
    currency: 'fils'
  },
  'blackletter': {
    id: 'blackletter',
    name: 'Blackletter',
    style: { fontFamily: '"UnifrakturMaguntia", cursive', fontSize: '1.60em' },
    language: 'english',
    price: 10000,
    currency: 'fils'
  },
  'carmine': {
    id: 'carmine',
    name: 'Carmine',
    style: { fontFamily: '"Cinzel Decorative", serif', fontWeight: '700', fontSize: '1.40em' },
    language: 'english',
    price: 10000,
    currency: 'fils'
  }
};

// Fix specific font baselines for the Kurdistan flag
if (NAME_FONTS['default-en']) {
  NAME_FONTS['default-en'].style['--f-r'] = '39%';
  NAME_FONTS['default-en'].style['--f-g'] = '52%';
  NAME_FONTS['default-en'].style['--f-s'] = '45%';
}

if (NAME_FONTS['bangers']) {
  NAME_FONTS['bangers'].style['--f-r'] = '45%';
  NAME_FONTS['bangers'].style['--f-g'] = '55%';
  NAME_FONTS['bangers'].style['--f-s'] = '50%';
}

if (NAME_FONTS['cinzel']) {
  NAME_FONTS['cinzel'].style['--f-r'] = '42%';
  NAME_FONTS['cinzel'].style['--f-g'] = '58%';
  NAME_FONTS['cinzel'].style['--f-s'] = '50%';
}

if (NAME_FONTS['digiface']) {
  NAME_FONTS['digiface'].style['--f-r'] = '52%';
  NAME_FONTS['digiface'].style['--f-g'] = '59%';
  NAME_FONTS['digiface'].style['--f-s'] = '55.5%';
}

if (NAME_FONTS['ruby-script']) {
  NAME_FONTS['ruby-script'].style['--f-r'] = '44%';
  NAME_FONTS['ruby-script'].style['--f-g'] = '56%';
  NAME_FONTS['ruby-script'].style['--f-s'] = '50%';
}

if (NAME_FONTS['blackletter']) {
  NAME_FONTS['blackletter'].style['--f-r'] = '42%';
  NAME_FONTS['blackletter'].style['--f-g'] = '55%';
  NAME_FONTS['blackletter'].style['--f-s'] = '48.5%';
}

if (NAME_FONTS['blackadder']) {
  NAME_FONTS['blackadder'].style['--f-r'] = '38%';
  NAME_FONTS['blackadder'].style['--f-g'] = '53%';
  NAME_FONTS['blackadder'].style['--f-s'] = '45.5%';
}

if (NAME_FONTS['noto-nastaliq']) {
  NAME_FONTS['noto-nastaliq'].style['--f-r'] = '53%';
  NAME_FONTS['noto-nastaliq'].style['--f-g'] = '68%';
  NAME_FONTS['noto-nastaliq'].style['--f-s'] = '60.5%';
}

if (NAME_FONTS['rabar-015']) {
  NAME_FONTS['rabar-015'].style['--f-r'] = '43%';
  NAME_FONTS['rabar-015'].style['--f-g'] = '59%';
  NAME_FONTS['rabar-015'].style['--f-s'] = '51%';
}
