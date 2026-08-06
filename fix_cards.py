import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 2. Grid styling
content = content.replace('<div className="grid grid-cols-2 md:grid-cols-4 gap-4">', '<div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 sm:px-12">')

# 3. Multiplayer Card
content = content.replace('className="w-full relative h-24 rounded-md border-none mb-1 group bg-transparent"', 'className="w-full block relative h-20 rounded-md border-none group bg-transparent"')
content = content.replace('className="absolute inset-0 rounded-md translate-y-1.25"', 'className="absolute inset-0 rounded-md translate-y-[5px]"')
content = content.replace('<h3 className="text-3xl font-black font-heading text-white drop-shadow-md">ھەڤڕکی</h3>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">ھەڤڕکی</h3>')

# 4. Classic Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#ffcc00] shadow-[0_5px_0_#cc9900] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#ffcc00] shadow-[0_5px_0_#cc9900] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-amber-950">پەیڤۆک</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-amber-900/80 leading-none">کلاسیک</span>', '<h3 className="text-2xl font-black font-heading text-amber-950 drop-shadow-md">پەیڤۆک</h3>', content)

# 5. Mamak Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#22c55e] shadow-[0_5px_0_#16a34a] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#22c55e] shadow-[0_5px_0_#16a34a] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-white">مامک</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-white/50 leading-none">پەیدا بکە</span>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">مامک</h3>', content)

# 6. Hard Words Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#ef4444] shadow-[0_5px_0_#dc2626] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#ef4444] shadow-[0_5px_0_#dc2626] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-white">پەیڤێن دژوار</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-white/50 leading-none">بۆ شارەزایان</span>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">پەیڤێن دژوار</h3>', content)

# 7. Word Fever Card
content = content.replace('className="w-full relative h-24 rounded-md overflow-hidden bg-[#0ea5e9] shadow-[0_5px_0_#0284c7] border-none mb-1"', 'className="w-full block relative h-20 rounded-md overflow-hidden bg-[#0ea5e9] shadow-[0_5px_0_#0284c7] border-none"')
content = re.sub(r'<h3 className="text-xl font-black font-heading text-white">تایا پەیڤان</h3>\s*<span className="text-\[9px\] font-medium font-rabar uppercase  text-white/50 leading-none">بەرھەڤ بە</span>', '<h3 className="text-2xl font-black font-heading text-white drop-shadow-md">تایا پەیڤان</h3>', content)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done card replacements!')
