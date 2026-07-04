const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

if (content.includes('تە بەری نوکە هەژمار هەیە؟')) {
    content = content.replace('تە بەری نوکە هەژمار هەیە؟', 'تە ژبەری نۆکە هژمار دروست کریە؟');
    fs.writeFileSync(file, content, 'utf8');
    console.log("Text updated successfully!");
} else {
    console.log("Could not find the target text.");
}
