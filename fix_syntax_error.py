import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if '{/* Fixed Docks Wrapper (Does not scroll with cards) */}' in line:
        start_idx = i
        break

end_idx = -1
for i in range(start_idx, len(lines)):
    if '{/* Main Layout: Centered Cards */}' in lines[i]:
        end_idx = i
        break

print(f"Deleting broken wrapper from {start_idx} to {end_idx}")
del lines[start_idx:end_idx+1]

left_start = -1
for i, line in enumerate(lines):
    if '{/* Left Column (Icons) - Fixed to Edge */}' in line:
        left_start = i
        break

right_start = -1
for i, line in enumerate(lines):
    if '{/* Right Column (Icons) - Fixed to Edge */}' in line:
        right_start = i
        break

middle_start = -1
for i, line in enumerate(lines):
    if '{/* Middle Column (Cards)' in line:
        middle_start = i
        break

print(f"Extracting docks: Left starts at {left_start}, Right starts at {right_start}, Middle starts at {middle_start}")
left_end = right_start
right_end = middle_start

left_block = "".join(lines[left_start:left_end])
right_block = "".join(lines[right_start:right_end])

del lines[left_start:right_end]

left_block = left_block.replace('absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col', 'absolute -left-4 top-[35%] md:top-1/2 -translate-y-1/2 flex flex-col pointer-events-auto')
right_block = right_block.replace('absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col', 'absolute -right-4 top-[35%] md:top-1/2 -translate-y-1/2 flex flex-col pointer-events-auto')

fixed_wrapper = f'''        {{/* Fixed Docks Wrapper (Does not scroll with cards) */}}
        <div className="fixed inset-y-0 w-full max-w-screen-sm md:max-w-240 left-1/2 -translate-x-1/2 pointer-events-none z-50">
{left_block}{right_block}        </div>\n'''

main_layout_idx = -1
for i, line in enumerate(lines):
    if '<div className="relative z-10 w-full mt-12 sm:mt-16 md:mt-24 mb-12">' in line:
        main_layout_idx = i
        break

if main_layout_idx != -1:
    lines.insert(main_layout_idx, fixed_wrapper)
    with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully fixed LobbyView!")
else:
    print("Error: Could not find main layout wrapper")

