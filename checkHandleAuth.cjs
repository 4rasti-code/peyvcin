const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('const handleAuth = async');
if (startIndex !== -1) {
    let endIndex = content.indexOf('const handleVerifyOtp', startIndex);
    console.log(content.substring(startIndex, endIndex));
}
