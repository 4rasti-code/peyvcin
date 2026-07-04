const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the return statement that returns JSX
let returnPos = content.indexOf('return (', content.indexOf('if (showOtpScreen)'));
console.log(content.substring(returnPos, returnPos + 1000));
