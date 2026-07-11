const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

c = c.replace('<stop offset="0%" stopColor="#0284C7" />', '<stop offset="0%" stopColor="#286A8C" />');
c = c.replace('<stop offset="70%" stopColor="#0369A1" />', '<stop offset="70%" stopColor="#1C5173" />');
c = c.replace('<stop offset="100%" stopColor="#075985" />', '<stop offset="100%" stopColor="#0F334A" />');

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Restored original slate blue colors.');
