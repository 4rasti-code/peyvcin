const fs = require('fs');
let file = 'src/components/SocialHubView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find modals in SocialHubView
let modalClasses = content.match(/className="[^"]*modal[^"]*"/ig) || content.match(/className="[^"]*bg-mono-900[^"]*"/ig);
if (modalClasses) {
    console.log("Classes found in SocialHubView that might be the blocking card:");
    for (let i = 0; i < Math.min(5, modalClasses.length); i++) {
        console.log(modalClasses[i]);
    }
}
