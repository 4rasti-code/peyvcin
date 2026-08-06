import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('absolute left-0', 'absolute left-1 md:left-2')
content = content.replace('absolute right-0', 'absolute right-1 md:right-2')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Moved docks slightly away from the edge!")
