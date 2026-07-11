const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

// Level10Icon
c = c.replace(
  '{(isUnclaimed || isShining) && !disabled && (',
  '{!disabled && ('
);

// SharezaCompassIcon, KurdishShieldIcon, MamostaBookIcon
c = c.replace(/const isActive = isUnclaimed && !disabled;/g, 'const isActive = !disabled;');

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Fixed animations so they play when unlocked, matching the Hammer.');
