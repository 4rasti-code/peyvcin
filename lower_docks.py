import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('top-24 sm:top-28 md:top-40', 'top-32 sm:top-40 md:top-52')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Lowered the docks!")
