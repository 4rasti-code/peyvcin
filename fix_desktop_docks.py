import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace fixed with absolute for the docks
content = content.replace('className="fixed left-0 top-1/2 -translate-y-1/2', 'className="absolute left-0 top-1/2 -translate-y-1/2')
content = content.replace('className="fixed right-0 top-1/2 -translate-y-1/2', 'className="absolute right-0 top-1/2 -translate-y-1/2')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Changed fixed to absolute for side docks!")
