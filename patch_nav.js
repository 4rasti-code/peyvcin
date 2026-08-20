const fs = require('fs');
let code = fs.readFileSync('src/components/BottomNav.jsx', 'utf8');

// Replace the background fill
code = code.replace(
  '{/* Background fill for safe area */}\n      <div className="absolute inset-x-0 bottom-0 h-[env(safe-area-inset-bottom)] bg-[#1a9bf0] w-full max-w-screen-sm md:max-w-240 mx-auto -z-10 pointer-events-auto" />',
  \{/* Background fill for safe area - using flex to match tab colors and +1px height to cover subpixel gap */}\\n      <div className="absolute inset-x-0 bottom-0 h-[calc(env(safe-area-inset-bottom)+1px)] w-full max-w-screen-sm md:max-w-240 mx-auto -z-10 flex pointer-events-auto">\\n        {tabs.map((tab) => (\\n          <div key={\\\safe-fill-\\\\\\} className={\\\lex-1 h-full \\\\\\} />\\n        ))}\\n      </div>\
);

// Add border-none and appearance-none to buttons just in case
code = code.replace(
  'className={\group relative flex-1 h-24 flex flex-col items-center justify-start select-none outline-none focus:outline-none focus-visible:outline-none rounded-t-[10px]',
  'className={\group relative flex-1 h-24 flex flex-col items-center justify-start select-none outline-none focus:outline-none focus-visible:outline-none rounded-t-[10px] border-none appearance-none'
);

fs.writeFileSync('src/components/BottomNav.jsx', code);
