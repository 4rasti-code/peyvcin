import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the grid container
content = content.replace('<div className="grid grid-cols-2 md:grid-cols-4 gap-4">', '<div className="flex flex-col gap-4">')

# Remove col-span classes from all card wrappers
content = content.replace('<div className="col-span-2 md:col-span-4 relative group">', '<div className="relative group w-full">')
content = content.replace('<div className="col-span-2 relative group">', '<div className="relative group w-full">')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Changed cards layout to a vertical stack (flex-col) for all screen sizes!")
