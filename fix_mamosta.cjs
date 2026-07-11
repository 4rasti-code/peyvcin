const fs = require('fs');

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

const startStr = `export const MamostaBookIcon = ({ className = "w-6 h-6", size = 24, disabled = false, isUnclaimed = false }) => {
  const isActive = isUnclaimed && !disabled;
  return (`;

const replaceStr = `export const MamostaBookIcon = ({ className = "w-6 h-6", size = 24, disabled = false, isUnclaimed = false }) => {
  const isActive = isUnclaimed && !disabled;
  const uid = React.useId();
  return (`;

c = c.replace(startStr, replaceStr);

c = c.replace(/id="magical-teal-grad"/g, 'id={`magical-teal-grad-${uid}`}');
c = c.replace(/url\(#magical-teal-grad\)/g, 'url(`#magical-teal-grad-${uid}`)');

c = c.replace(/id="expert-spine-clip"/g, 'id={`expert-spine-clip-${uid}`}');
c = c.replace(/url\(#expert-spine-clip\)/g, 'url(`#expert-spine-clip-${uid}`)');

// Let's also make it distinctly blue
c = c.replace('<stop offset="0%" stopColor="#286A8C" />', '<stop offset="0%" stopColor="#0284C7" />');
c = c.replace('<stop offset="70%" stopColor="#1C5173" />', '<stop offset="70%" stopColor="#0369A1" />');
c = c.replace('<stop offset="100%" stopColor="#0F334A" />', '<stop offset="100%" stopColor="#075985" />');

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Fixed MamostaBookIcon IDs and colors.');
