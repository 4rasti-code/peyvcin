import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the container to give it much more width.
content = content.replace('<div className="w-full max-w-lg mx-auto px-8 sm:px-16 md:px-24 relative z-10">', '<div className="w-full max-w-xl mx-auto px-10 md:px-12 relative z-10">')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cards container to max-w-xl to allow cards to grow significantly larger on desktop!")
