const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setRecoveryStep(1)')) {
        let block = [];
        for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 10); j++) {
            block.push(lines[j]);
        }
        console.log(block.join('\n'));
        break;
    }
}
