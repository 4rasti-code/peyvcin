const fs = require('fs');
const file = 'd:/Peyvok_App/src/components/InstallGuideModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace specific background colors with gray-300
content = content.replace(/bg-\[#f6f7f9\]/g, 'bg-gray-300');
content = content.replace(/bg-gray-100/g, 'bg-gray-300'); // for Android step 1 which used mono-100 -> gray-100

fs.writeFileSync(file, content);
