const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

// Remove the unlockAllAchievements function
const fnStart = c.indexOf('const unlockAllAchievements =');
if (fnStart !== -1) {
    let fnEnd = c.indexOf('};', fnStart);
    if (fnEnd !== -1) {
        c = c.substring(0, fnStart) + c.substring(fnEnd + 2);
    }
}

// Remove the button
const btnStart = c.indexOf('<button onClick={unlockAllAchievements}');
if (btnStart !== -1) {
    let btnEnd = c.indexOf('</button>', btnStart);
    if (btnEnd !== -1) {
        c = c.substring(0, btnStart) + c.substring(btnEnd + 9);
    }
}

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Removed test code');
