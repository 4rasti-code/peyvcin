const fs = require('fs');
let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

c = c.replace(
  /export const MamostaBookIcon = \(\{.*?\}\) => \{\s*const isActive = isUnclaimed && !disabled;/,
  `export const MamostaBookIcon = ({ className = "w-6 h-6", size = 24, disabled = false, isUnclaimed = false }) => {
  const isActive = isUnclaimed && !disabled;
  const uid = React.useId();`
);

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Added uid to MamostaBookIcon');
