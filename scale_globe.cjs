const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

c = c.replace(/width:\s*'85%',\s*height:\s*'85%'/g, "width: '145%', height: '145%', maxWidth: '145%'");
c = c.replace(/className="absolute inset-0 w-full h-full z-0 pointer-events-none"/g, 'className="absolute w-[145%] h-[145%] z-0 pointer-events-none"');
c = c.replace(/className="absolute inset-0 w-full h-full z-20 pointer-events-none"/g, 'className="absolute w-[145%] h-[145%] z-20 pointer-events-none"');

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Fixed GlobeIcon using regex!');
