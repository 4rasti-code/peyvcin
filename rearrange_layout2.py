import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract Left Column (the items inside it)
left_col_match = re.search(r'          {/\* Left Column \*/}\n          <div className="flex flex-col items-center gap-4">\n(.*?)          </div>\n\n          {/\* Right Column \*/}', content, re.DOTALL)
left_col = left_col_match.group(1).strip()

# 2. Extract Right Column (the items inside it)
right_col_match = re.search(r'          {/\* Right Column \*/}\n          <div className="flex flex-col items-center gap-4">\n(.*?)          </div>\n\n        </div>\n\n        <div className="grid', content, re.DOTALL)
right_col = right_col_match.group(1).strip()

# 3. Extract Cards Grid (inner content of the grid)
cards_match = re.search(r'        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 sm:px-12">\n(.*?)        </div>\n      </div>\n\n      <AnimatePresence>', content, re.DOTALL)
cards = cards_match.group(1).strip()


# 4. Construct the new layout
new_layout = f'''        {{/* Main 3-Column Layout */}}
        <div className="flex w-full justify-between items-center px-1 mt-6 mb-4 relative z-10 gap-1">
          
          {{/* Left Column (Icons) */}}
          <div className="flex flex-col items-center gap-6 shrink-0 w-[60px]">
{left_col}
          </div>

          {{/* Middle Column (Cards) */}}
          <div className="flex-1 w-full max-w-[280px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
{cards}
            </div>
          </div>

          {{/* Right Column (Icons) */}}
          <div className="flex flex-col items-center gap-6 shrink-0 w-[60px]">
{right_col}
          </div>

        </div>
      </div>

      <AnimatePresence>'''

# 5. Replace everything from Flanking Icons container to the end of the relative z-10 div
start_marker = '        {/* Flanking Action & Reward Icons (Ludo Master Style) */}'
end_marker = '      <AnimatePresence>'
pattern = re.compile(r'        \{/\* Flanking Action & Reward Icons \(Ludo Master Style\) \*/\}.*?      <AnimatePresence>', re.DOTALL)
content = pattern.sub(new_layout, content)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Layout rearranged successfully!")
