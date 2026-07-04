const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

if (content.includes('agreedToTerms')) {
    console.log("agreedToTerms exists!");
} else {
    console.log("agreedToTerms DOES NOT EXIST!");
}
