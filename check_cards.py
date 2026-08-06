import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract the structure of a card, for example 'Peyvok' (the yellow one) or 'Mamk' (the green one).
match = re.search(r'(<Motion\.button[^>]*>\s*<div[^>]*>.*?<h3[^>]*>.*?</h3>.*?</div>\s*</Motion\.button>)', content, re.DOTALL | re.IGNORECASE)
if match:
    print(match.group(1)[:500])
else:
    print("Not found")

