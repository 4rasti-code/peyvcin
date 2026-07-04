const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = '<img src={pushNotification.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${pushNotification.title}`} alt="avatar" className="w-full h-full object-cover" />';
const replaceStr = '<Avatar src={pushNotification.avatar || \'default\'} size="full" border={false} className="object-cover w-full h-full" />';

app = app.replace(targetStr, replaceStr);

const targetDiv = '<div className="w-12 h-12 rounded-full overflow-hidden bg-mono-800 dark:bg-mono-200 shrink-0">';
const replaceDiv = '<div className="w-12 h-12 rounded-full overflow-hidden bg-mono-800 dark:bg-mono-200 shrink-0 flex items-center justify-center">';

app = app.replace(targetDiv, replaceDiv);

fs.writeFileSync('src/App.jsx', app, 'utf8');
