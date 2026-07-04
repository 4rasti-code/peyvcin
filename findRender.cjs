const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the return statement of AuthView
let match = content.match(/return\s*\(\s*<Motion\.div/s);
if (match) {
    let index = match.index;
    console.log(content.substring(index, index + 3000));
} else {
    console.log("Not found");
}
