const fs = require('fs');
const lines = fs.readFileSync('C:/Users/RYZEN5950X/.gemini/antigravity-ide/brain/fef128af-59c5-408f-ad64-4b6fd5e0e5ab/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (let line of lines) {
  if (line.includes('چەترێ') || line.includes('چ🟨 ە⬛ ت⬛ ر⬛ ێ⬛')) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (let tc of obj.tool_calls) {
          if (tc.name === 'default_api:write_to_file' || tc.name === 'default_api:replace_file_content' || tc.name === 'default_api:multi_replace_file_content') {
            fs.writeFileSync('d:/Peyvok_App/recovered_from_transcript.txt', JSON.stringify(tc, null, 2), 'utf8');
            console.log('FOUND IT!');
            return;
          }
        }
      }
    } catch(e) {}
  }
}
console.log('Not found');
