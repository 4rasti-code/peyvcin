const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Check what audio functions are imported
let match = content.match(/import\s+{([^}]+)}\s+from\s+'\.\.\/utils\/audio'/);
if (match) {
    console.log("Audio imports:", match[1]);
}

// Find any play.*Sfx() calls
let sounds = content.match(/play[A-Za-z]+Sfx/g);
if (sounds) {
    console.log("Sounds used in AuthView:", [...new Set(sounds)]);
}
