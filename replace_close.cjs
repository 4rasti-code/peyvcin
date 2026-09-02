const fs = require('fs');

const files = [
  'src/components/CategoryModal.jsx',
  'src/components/DailyRewardModal.jsx',
  'src/components/LuckyWheelModal.jsx',
  'src/components/MysteryBoxModal.jsx',
  'src/components/MedalsPreview.jsx',
  'src/components/PublicProfileModal.jsx',
  'src/components/SettingsModal.jsx',
  'src/components/ReportModal.jsx',
  'src/components/PaymentGatewayModal.jsx',
  'src/components/HowToPlayModal.jsx',
  'src/components/ImageEditorModal.jsx',
  'src/components/MultiplayerResultOverlay.jsx',
  'src/components/SocialHubView.jsx',
  'src/components/ProfileView.jsx',
  'src/components/AuthView.jsx',
  'src/components/LobbyView.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Add import if not present
  if (!content.includes('import CloseButton from')) {
    const importStatement = "import CloseButton from './CloseButton';\n";
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
    }
  }

  // Regex to find a <button> ... <span className="material-symbols-outlined ...">close</span> ... </button>
  // We want to capture the onClick handler to pass it to CloseButton.
  // And the className to pass it.
  
  // Actually, I can just write simple replacements for the specific ones.
  // 1. SettingsModal inside <div className="sticky top-0 z-50 flex items-center justify-end px-6 py-4 pt-safe bg-mono-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-mono-200 dark:border-white/5">
  if (file.includes('SettingsModal.jsx')) {
    content = content.replace(
      /<button\s+onClick=\{\(\) => \{\s*playBackSfx\(\);\s*onClose\(\);\s*\}\}\s+className="w-10 h-10 rounded-md bg-black\/5 dark:bg-white\/5 hover:bg-black\/10 dark:hover:bg-white\/10 flex items-center justify-center transition-colors text-mono-900 dark:text-white"\s*>\s*<span className="material-symbols-outlined text-2xl">close<\/span>\s*<\/button>/g,
      '<CloseButton onClick={() => { playBackSfx(); onClose(); }} />'
    );
  }

  if (file.includes('LuckyWheelModal.jsx') || file.includes('MysteryBoxModal.jsx')) {
    content = content.replace(
      /<button\s+onClick=\{\(\) => \{\s*playBackSfx\(\);\s*onClose\(\);\s*\}\}\s+className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white\/10 border border-white\/20 flex items-center justify-center text-white\/60 hover:text-white hover:bg-white\/20 transition-all z-50 shadow-xl"\s*>\s*<span className="material-symbols-outlined text-\[18px\]">close<\/span>\s*<\/button>/g,
      '<CloseButton onClick={() => { playBackSfx(); onClose(); }} className="absolute top-6 right-6 z-50" />'
    );
  }

  if (file.includes('MedalsPreview.jsx')) {
    content = content.replace(
      /<button\s+onClick=\{\(\) => \{\s*triggerHaptic\(10\);\s*onClose\(\);\s*\}\}\s+className="w-10 h-10 rounded-full bg-mono-100 dark:bg-white\/10 border border-mono-200 dark:border-white\/10 flex items-center justify-center text-mono-600 dark:text-white\/60 hover:text-mono-900 dark:hover:text-white transition-all"\s*>\s*<span className="material-symbols-outlined text-\[20px\]">close<\/span>\s*<\/button>/g,
      '<CloseButton onClick={() => { triggerHaptic(10); onClose(); }} />'
    );
  }

  if (file.includes('ReportModal.jsx')) {
    content = content.replace(
      /<button\s+onClick=\{\(\) => \{\s*triggerHaptic\(10\);\s*onClose\(\);\s*\}\}\s+className="w-8 h-8 rounded-full bg-mono-100 dark:bg-white\/10 flex items-center justify-center text-mono-500 dark:text-white\/60 hover:text-mono-900 dark:hover:text-white transition-colors"\s*>\s*<span className="material-symbols-outlined text-\[14px\]">close<\/span>\s*<\/button>/g,
      '<CloseButton onClick={() => { triggerHaptic(10); onClose(); }} />'
    );
  }

  if (file.includes('PaymentGatewayModal.jsx')) {
    content = content.replace(
      /<button\s+onClick=\{\(\) => \{\s*triggerHaptic\(10\);\s*onClose\(\);\s*\}\}\s+className="w-10 h-10 flex items-center justify-center rounded-xl bg-mono-100 dark:bg-mono-800 text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-100 transition-colors"\s*>\s*<span className="material-symbols-outlined">close<\/span>\s*<\/button>/g,
      '<CloseButton onClick={() => { triggerHaptic(10); onClose(); }} />'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log("Done");
