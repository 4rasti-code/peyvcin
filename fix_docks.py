import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract Left Column and Right Column blocks
pattern = r'(          {/\* Left Column \(Icons\) - Fixed to Edge \*/}.*?          </div>)\n\n          {/\* Right Column \(Icons\) - Fixed to Edge \*/}.*?          </div>'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("Could not find the docks block.")
    exit(1)

docks_block = match.group(0)

# 2. Remove the docks block from its current location
content = content.replace(docks_block + '\n\n', '')

# 3. Modify the docks block for fixed wrapper
# Make them higher on mobile, keep them centered on desktop
# Add pointer-events-auto because the fixed wrapper has pointer-events-none
docks_block = docks_block.replace('absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col', 'absolute -left-4 top-[35%] md:top-1/2 -translate-y-1/2 flex flex-col pointer-events-auto')
docks_block = docks_block.replace('absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col', 'absolute -right-4 top-[35%] md:top-1/2 -translate-y-1/2 flex flex-col pointer-events-auto')

# 4. Create the fixed wrapper
fixed_wrapper = f'''
        {{/* Fixed Docks Wrapper (Does not scroll with cards) */}}
        <div className="fixed inset-y-0 w-full max-w-screen-sm md:max-w-240 left-1/2 -translate-x-1/2 pointer-events-none z-50">
{docks_block}
        </div>
'''

# 5. Insert the fixed wrapper just before Main Layout
content = content.replace('        {/* Main Layout: Absolute Flanking Icons & Centered Cards */}', fixed_wrapper + '\n        {/* Main Layout: Centered Cards */} ')

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Extracted docks into a fixed wrapper successfully!")
