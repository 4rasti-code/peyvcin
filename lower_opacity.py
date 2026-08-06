import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('bg-white/40 dark:bg-black/40', 'bg-white/20 dark:bg-black/20')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Lowered background opacity of docks!")
