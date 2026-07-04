const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/بەردەوامبوون ب ڕێکا گۆگڵ/g, 'بەردەوامبە ب ڕێکا گۆگڵ');
content = content.replace(/بەردەوامبوون ب ڕێکا دیسکۆرد/g, 'بەردەوامبە ب ڕێکا دیسکۆرد');
content = content.replace(/یاریکردن وەکو مێهڤان/g, 'یاریکرن وەکو مێهڤان');
content = content.replace(/پێشتر هەژمارت هەیە\؟/g, 'تە بەری نوکە هەژمار هەیە؟');

fs.writeFileSync(file, content, 'utf8');
console.log("Texts translated to Bahdini successfully!");
