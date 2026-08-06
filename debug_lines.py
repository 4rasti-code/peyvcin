import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '{/* Fixed Docks Wrapper' in line:
        print(f"Found Fixed Wrapper at {i+1}")
    if '{/* Main Layout: Centered Cards' in line:
        print(f"Found Main Layout 1 at {i+1}")
    if 'Main Layout: Absolute' in line:
        print(f"Found Main Layout 2 at {i+1}")

