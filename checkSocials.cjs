const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let googleStart = content.indexOf('onClick={() => handleSocialLogin(\'google\')}');
let googleEnd = content.indexOf('</button>', googleStart) + 9;
console.log(content.substring(googleStart - 100, googleEnd));

let discordStart = content.indexOf('onClick={() => handleSocialLogin(\'discord\')}');
let discordEnd = content.indexOf('</button>', discordStart) + 9;
console.log("-------------------");
console.log(content.substring(discordStart - 100, discordEnd));
