const fs = require('fs');

let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(/const MedalsPreview = lazyWithRetry\(\(\) => import\('\.\/components\/MedalsPreview'\)\);\n?/, '');
c = c.replace(/const \[showMedalsPreview, setShowMedalsPreview\] = useState\(true\);\n?/, '');
c = c.replace(/\{showMedalsPreview && \(\s*<MedalsPreview onClose=\{\(\) => setShowMedalsPreview\(false\)\} \/>\s*\)\}/, '');

fs.writeFileSync('src/App.jsx', c);
console.log('Removed MedalsPreview from App.jsx');
