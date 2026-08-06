import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract Left Column
left_col_match = re.search(r'(          {/\* Left Column \*/}.*?)          {/\* Right Column \*/}', content, re.DOTALL)
left_col = left_col_match.group(1)

# 2. Extract Right Column
right_col_match = re.search(r'(          {/\* Right Column \*/}.*?)        </div>\n\n        <div className="grid', content, re.DOTALL)
right_col = right_col_match.group(1)

# 3. Extract Cards Grid
cards_match = re.search(r'(        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 sm:px-12">.*?)\n        </div>\n\n        {/\* Modals \*/}', content, re.DOTALL)
cards = cards_match.group(1)
# Remove the old padding from the cards grid to fit perfectly inside the new flex-1 container
cards = cards.replace('className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 sm:px-12"', 'className="grid grid-cols-2 md:grid-cols-4 gap-4"')


# 4. Construct the new layout
new_layout = f'''        {{/* Main 3-Column Layout */}}
        <div className="flex w-full justify-between items-center px-1 mt-4 relative z-10 gap-2">
          
{left_col}

          {{/* Middle Column (Cards) */}}
          <div className="flex-1 w-full max-w-[280px] mx-auto">
{cards}
          </div>

{right_col}

        </div>

'''

# 5. Replace everything from the start of Flanking Icons to the end of Cards Grid
start_marker = '        {/* Flanking Action & Reward Icons (Ludo Master Style) */}'
end_marker = '        {/* Modals */}'
pattern = re.compile(re.escape(start_marker) + r'.*?(?=        {/\* Modals \*/})', re.DOTALL)
content = pattern.sub(new_layout, content)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Layout rearranged successfully!")
