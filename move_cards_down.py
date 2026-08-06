import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the top margin of the main wrapper
content = content.replace('<div className="relative z-10 w-full mt-4 mb-4">', '<div className="relative z-10 w-full mt-12 sm:mt-16 md:mt-24 mb-12">')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Increased top margin to move cards lower on all screens!")
