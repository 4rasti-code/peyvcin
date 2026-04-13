const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Replaces prefixes that scale by 4px intervals
const spacingPrefixes = [
  'w', 'h', 'max-w', 'max-h', 'min-w', 'min-h',
  'p', 'pt', 'pb', 'pl', 'pr', 'px', 'py',
  'm', 'mt', 'mb', 'ml', 'mr', 'mx', 'my',
  'gap', 'gap-x', 'gap-y',
  'top', 'bottom', 'left', 'right',
  'translate-x', 'translate-y',
  'space-x', 'space-y'
];

const prefixPattern = spacingPrefixes.join('|');
// Look for negative or positive arbitrary pixel values e.g. w-[40px] or -mt-[12px]
const regex = new RegExp(`(?<![a-zA-Z0-9-])(-?(?:${prefixPattern}))-\\[(-?\\d+)px\\]`, 'g');

let modifiedFilesCount = 0;
let totalReplacements = 0;

function walkSync(dir) {
  let files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkSync(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let replacedCount = 0;
  
  const newContent = content.replace(regex, (match, prefix, pxValue) => {
    const px = parseInt(pxValue, 10);
    // Ignore fractional divisions to prevent unexpected behavior (unless it's .5)
    // Actually, let's keep it extremely safe: ONLY perfectly divisible by 4.
    if (px % 4 === 0) {
      const tailwindUnit = px / 4;
      replacedCount++;
      return `${prefix}-${tailwindUnit}`;
    }
    // Also handle 2px -> 0.5
    if (Math.abs(px) === 2) {
      replacedCount++;
      const sign = px < 0 ? '-' : '';
      return `${prefix}-${sign}0.5`;
    }
    return match; // Leave as arbitrary value if not standard
  });

  if (replacedCount > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    modifiedFilesCount++;
    totalReplacements += replacedCount;
    // console.log(`Fixed ${replacedCount} issues in ${path.basename(filePath)}`);
  }
}

walkSync(srcDir);
console.log(`Successfully fixed ${totalReplacements} arbitrary values across ${modifiedFilesCount} files!`);
