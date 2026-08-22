const fs = require('fs');
const path = require('path');
const os = require('os');

const historyDir = path.join(os.homedir(), 'AppData/Roaming/Code/User/History');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        if (stat.size > 20000 && stat.size < 50000) {
          results.push({ path: fullPath, time: stat.mtimeMs, size: stat.size });
        }
      }
    });
  } catch(e) {}
  return results;
}

const files = walk(historyDir);
files.sort((a, b) => b.time - a.time);

let foundCount = 0;
for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const content = fs.readFileSync(f.path, 'utf8');
  if (content.includes('HowToPlayModal') && content.includes('mpExampleTab') && content.includes('renderMultiplayerTutorial')) {
    console.log(`Found match: ${f.path} (Size: ${f.size}) - Time: ${new Date(f.time).toISOString()}`);
    fs.writeFileSync(`d:/Peyvok_App/backup_candidate_${foundCount}.jsx`, content, 'utf8');
    foundCount++;
    if (foundCount > 5) break;
  }
}
