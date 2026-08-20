import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_game_start = r"""          {currentView === 'game' && gameMode !== 'multiplayer' && !['playing', 'game_over', 'syncing', 'match_starting'].includes(multiplayerState) && (
            <div className="flex-1 flex flex-col overflow-hidden relative h-full">"""

new_game_start = r"""          <div className={currentView === 'game' && gameMode !== 'multiplayer' && !['playing', 'game_over', 'syncing', 'match_starting'].includes(multiplayerState) ? "flex-1 flex flex-col overflow-hidden relative h-full" : "hidden"}>"""

code = code.replace(old_game_start, new_game_start)

old_game_end = r"""                  keyboardSoundEnabled={appSoundsEnabled}
                />
              </div>
            </div>
          )}"""

new_game_end = r"""                  keyboardSoundEnabled={appSoundsEnabled}
                />
              </div>
          </div>"""

code = code.replace(old_game_end, new_game_end)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
