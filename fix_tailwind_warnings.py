import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Tailwind warnings
content = content.replace('md:h-[110px]', 'md:h-27.5')
content = content.replace('md:w-[180px]', 'md:w-45')
content = content.replace('md:h-[56px]', 'md:h-14')
content = content.replace('md:w-[84px]', 'md:w-21')
content = content.replace('md:h-[84px]', 'md:h-21')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed Tailwind arbitrary value warnings in LobbyView.jsx")
