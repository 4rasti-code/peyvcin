const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

// Change the PahlawanIcon img width and height to 125% to make it appear as big as others
c = c.replace(
  `style={{ \n          width: '90%', \n          height: '90%',`,
  `style={{ \n          width: '125%', \n          height: '125%',\n          maxWidth: '125%',`
);

// Also scale up the glow ring so it doesn't look too small relative to the enlarged hammer
c = c.replace(
  `<svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0 pointer-events-none">`,
  `<svg viewBox="0 0 100 100" className="absolute w-[125%] h-[125%] z-0 pointer-events-none">`
);

// Also scale the runes overlay to match
c = c.replace(
  `<svg viewBox="0 0 500 500" className="absolute z-20 pointer-events-none" style={{ width: '90%', height: '90%', overflow: 'visible' }}>`,
  `<svg viewBox="0 0 500 500" className="absolute z-20 pointer-events-none" style={{ width: '125%', height: '125%', overflow: 'visible' }}>`
);


fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Scaled up PahlawanIcon by 125% to match others.');
