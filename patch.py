import re

with open('src/components/BottomNav.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_bg = '{/* Background fill for safe area */}\n      <div className="absolute inset-x-0 bottom-0 h-[env(safe-area-inset-bottom)] bg-[#1a9bf0] w-full max-w-screen-sm md:max-w-240 mx-auto -z-10 pointer-events-auto" />'
new_bg = '{/* Background fill for safe area - match tab colors */}\n      <div className="absolute inset-x-0 bottom-0 h-[calc(env(safe-area-inset-bottom)+1px)] w-full max-w-screen-sm md:max-w-240 mx-auto -z-10 flex pointer-events-auto">\n        {tabs.map((tab) => (\n          <div key={safe-fill-} className={lex-1 h-full } />\n        ))}\n      </div>'
code = code.replace(old_bg, new_bg)

old_btn = 'className={group relative flex-1 h-24 flex flex-col items-center justify-start select-none outline-none focus:outline-none focus-visible:outline-none rounded-t-[10px]'
new_btn = 'className={group relative flex-1 h-24 flex flex-col items-center justify-start select-none outline-none focus:outline-none focus-visible:outline-none rounded-t-[10px] border-none appearance-none'
code = code.replace(old_btn, new_btn)

with open('src/components/BottomNav.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
