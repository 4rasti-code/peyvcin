import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_close = r"""                </button>
              )}
            </>
          )}

          {currentView === 'game'"""

new_close = r"""                </button>
              )}
            </div>
          )}

          {currentView === 'game'"""

code = code.replace(old_close, new_close)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
