import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_game_end = r"""                  hapticEnabled={hapticEnabled}
                />
              </div>
            </div>
          )}"""

new_game_end = r"""                  hapticEnabled={hapticEnabled}
                />
              </div>
          </div>"""

code = code.replace(old_game_end, new_game_end)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
