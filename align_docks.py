import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('absolute left-0 top-[35%] md:top-1/2 -translate-y-1/2', 'absolute left-0 top-24 sm:top-28 md:top-40')
content = content.replace('absolute right-0 top-[35%] md:top-1/2 -translate-y-1/2', 'absolute right-0 top-24 sm:top-28 md:top-40')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated dock positioning to align with the top card!")
