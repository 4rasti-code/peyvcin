const fs = require('fs');
let file = 'src/components/SettingsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [isBlockedModalOpen')) {
    content = content.replace('const [isHelpCenterOpen', 'const [isBlockedModalOpen, setIsBlockedModalOpen] = React.useState(false);\n   const [isHelpCenterOpen');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Restored isBlockedModalOpen');
} else {
    console.log('Already has isBlockedModalOpen');
}
