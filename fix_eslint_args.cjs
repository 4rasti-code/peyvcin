const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

c = c.replace(/isShining = false/g, '_isShining = false');
c = c.replace(/isUnclaimed = false/g, '_isUnclaimed = false');

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Fixed ESLint unused args in CurrencyIcon.jsx');
