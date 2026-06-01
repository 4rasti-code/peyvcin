import fs from 'fs';
import path from 'path';

const dir = 'src/data';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'mamakList.js' && f !== 'wordList.js' && f !== 'constants.js' && f !== 'themes.js' && f !== 'avatars.js');

let changedFiles = [];
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('"category"') || content.includes('category:')) {
    // Regex to remove the category property from objects
    // Handles format like "category": "something" or category: 'something'
    // Also handles the comma before or after it
    let newContent = content.replace(/,\s*\"?category\"?\s*:\s*["'][^"']*["']/g, '');
    newContent = newContent.replace(/\"?category\"?\s*:\s*["'][^"']*["']\s*,?/g, '');
    
    // Fix any dangling commas before closing brace
    const cleaned = newContent.replace(/,\s*\}/g, '\n  }');
    
    if (content !== cleaned) {
        fs.writeFileSync(filePath, cleaned);
        changedFiles.push(file);
    }
  }
}

// Also process newWords_partX.js if they exist
const newWordsDir = 'src/data';
const newFiles = fs.readdirSync(newWordsDir).filter(f => f.startsWith('newWords_part') && f.endsWith('.js'));
for (const file of newFiles) {
  const filePath = path.join(newWordsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('"category"')) {
    let newContent = content.replace(/,\s*\"?category\"?\s*:\s*["'][^"']*["']/g, '');
    newContent = newContent.replace(/\"?category\"?\s*:\s*["'][^"']*["']\s*,?/g, '');
    const cleaned = newContent.replace(/,\s*\}/g, '\n  }');
    fs.writeFileSync(filePath, cleaned);
    changedFiles.push(file);
  }
}

console.log('Files changed:', changedFiles);
