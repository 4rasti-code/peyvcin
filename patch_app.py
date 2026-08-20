import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = r"""          {currentView === 'lobby' && (multiplayerState === 'idle' || multiplayerState === 'private_lobby' || multiplayerState === 'match_starting') && (
            <>
              <LobbyView"""

new_block = r"""          {(multiplayerState === 'idle' || multiplayerState === 'private_lobby' || multiplayerState === 'match_starting') && (
            <div className={currentView === 'lobby' ? 'contents' : 'hidden'}>
              <LobbyView"""

code = code.replace(old_block, new_block)

old_close = r"""                onOpenChat={handleOpenChat}
              />
            </>
          )}"""

new_close = r"""                onOpenChat={handleOpenChat}
              />
            </div>
          )}"""

code = code.replace(old_close, new_close)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
