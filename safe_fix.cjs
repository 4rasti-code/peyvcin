const fs = require('fs');
fs.copyFileSync('src/components/CurrencyIcon_Backup.jsx', 'src/components/CurrencyIcon.jsx');
let content = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

// NORMALIZE LINE ENDINGS TO \n TO PREVENT WINDOWS \r\n ISSUES
content = content.replace(/\r\n/g, '\n');

function fixIcon(iconName, ids) {
    const searchString = `export const ${iconName} = ({ className = "w-6 h-6", size = 24, disabled = false, isUnclaimed = false }) => {\n  const isActive = isUnclaimed && !disabled;`;
    if (content.includes(searchString)) {
        content = content.replace(searchString, searchString + `\n  const uid = React.useId().replace(/:/g, "");`);
    } else {
        console.log("Could not find", iconName);
    }

    ids.forEach(id => {
        content = content.split(`id="${id}"`).join(`id={\`${id}-\${uid}\`}`);
        content = content.split(`="url(#${id})"`).join(`={\`url(#${id}-\${uid})\`}`);
    });
}

fixIcon('SharezaCompassIcon', [
  'rimGold', 'rimHighlight', 'craterBevel', 'stoneFace', 'softGlass', 
  'shadowHeavy', 'shadowNeedle', 'smokeBlur4', 'smokeBlur2', 'smokeBlur1'
]);

fixIcon('GlobeIcon', [
  'core-glow', 'gold-dark', 'gold-bright', 'pe-glow', 
  'shadow-heavy', 'shadow-light', 'inner-bevel', 'inset-shadow'
]);

fixIcon('MamostaBookIcon', [
  'magical-teal-grad', 'expert-spine-clip'
]);

fixIcon('KurdishShieldIcon', [
  'carpet-clip'
]);

const emberSearch = `<Motion.circle\n                key={\`ember-\${i}\`}\n                cx={ember.x}\n                r={ember.size}`;
const emberReplace = `<Motion.circle\n                key={\`ember-\${i}\`}\n                cx={ember.x}\n                cy={94}\n                r={ember.size}`;

if (content.includes(emberSearch)) {
    content = content.replace(emberSearch, emberReplace);
} else {
    console.log("Could not find ember circle to replace!");
}

fs.writeFileSync('src/components/CurrencyIcon.jsx', content);
console.log("ALL DONE");
