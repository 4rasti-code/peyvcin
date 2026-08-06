import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Increase heights
content = content.replace('relative h-20 rounded-md', 'relative h-20 md:h-[110px] rounded-md')

# 2. Increase font sizes for the titles
content = content.replace('text-2xl font-black font-heading', 'text-2xl md:text-[34px] font-black font-heading')

# 3. Increase icon sizes
content = content.replace('ClashingSwords className="w-14 h-14', 'ClashingSwords className="w-14 h-14 md:w-20 md:h-20')
content = content.replace('ClassicIcon className="w-32 h-10"', 'ClassicIcon className="w-32 h-10 md:w-[180px] md:h-[56px]"')
content = content.replace('MamakIcon className="w-16 h-16"', 'MamakIcon className="w-16 h-16 md:w-[84px] md:h-[84px]"')
content = content.replace('CubeIcon className="w-16 h-16"', 'CubeIcon className="w-16 h-16 md:w-[84px] md:h-[84px]"')
content = content.replace('HourglassIcon className="w-16 h-16"', 'HourglassIcon className="w-16 h-16 md:w-[84px] md:h-[84px]"')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cards sizes for desktop/iPad!")
