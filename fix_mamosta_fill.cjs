const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

c = c.replace(
  '"url(`#magical-teal-grad-${uid}`)"', 
  '`url(#magical-teal-grad-${uid})`'
);

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Fixed fill string literal.');
