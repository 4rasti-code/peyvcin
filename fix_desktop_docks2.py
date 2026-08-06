import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace absolute left-0 with absolute -left-4
content = content.replace('className="absolute left-0 top-1/2 -translate-y-1/2', 'className="absolute -left-4 top-1/2 -translate-y-1/2')
content = content.replace('className="absolute right-0 top-1/2 -translate-y-1/2', 'className="absolute -right-4 top-1/2 -translate-y-1/2')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Adjusted absolute positioning to touch the edge inside the desktop container!")
