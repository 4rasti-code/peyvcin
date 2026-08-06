import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('absolute -left-4', 'absolute left-0')
content = content.replace('absolute -right-4', 'absolute right-0')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed edge dock positioning!")
