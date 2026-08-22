const fs = require('fs');
const lines = fs.readFileSync('C:/Users/RYZEN5950X/.gemini/antigravity-ide/brain/fef128af-59c5-408f-ad64-4b6fd5e0e5ab/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
let bestMatch = null;
let maxLength = 0;

for (let line of lines) {
  if (line.includes('HowToPlayModal.jsx') && line.includes('replace_file_content')) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (let tc of obj.tool_calls) {
          if (tc.name === 'default_api:replace_file_content' || tc.name === 'default_api:multi_replace_file_content') {
            const contentStr = JSON.stringify(tc.arguments);
            if (contentStr.length > maxLength && contentStr.includes('Multiplayer')) {
              maxLength = contentStr.length;
              bestMatch = contentStr;
            }
          }
        }
      }
    } catch(e) {}
  }
}
if (bestMatch) {
  fs.writeFileSync('d:/Peyvok_App/best_match.txt', bestMatch, 'utf8');
  console.log('Found best match with length:', maxLength);
} else {
  console.log('Not found');
}
