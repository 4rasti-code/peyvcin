const fs = require('fs');
let file = 'src/components/PublicProfileModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// Print the main modal container class
let match = content.match(/className="([^"]*)"/g);
if (match && match.length > 0) {
    console.log("Found classes in PublicProfileModal:");
    for(let i = 0; i < Math.min(10, match.length); i++) {
        console.log(match[i]);
    }
}
