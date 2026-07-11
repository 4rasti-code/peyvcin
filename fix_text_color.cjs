const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

c = c.replace(
  'fill={disabled ? "#9CA3AF" : "#F59E0B"}', 
  'fill={disabled ? "#9CA3AF" : "#D97706"}'
);

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Matched text color with corners.');
