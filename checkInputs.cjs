const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<FloatingInput')) {
        let block = [];
        for (let j = i; j < i + 10; j++) {
            block.push(lines[j].trim());
            if (lines[j].includes('/>')) break;
        }
        console.log(block.join(' '));
    }
}
