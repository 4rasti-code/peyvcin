import re

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Left Column Wrapper
old_left_wrapper = '          {/* Left Column (Icons) - Absolute Positioned */}\n          <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 z-20">'
new_left_wrapper = '          {/* Left Column (Icons) - Absolute Positioned */}\n          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full py-4 px-1 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">'
content = content.replace(old_left_wrapper, new_left_wrapper)

# Replace Right Column Wrapper
old_right_wrapper = '          {/* Right Column (Icons) - Absolute Positioned */}\n          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 z-20">'
new_right_wrapper = '          {/* Right Column (Icons) - Absolute Positioned */}\n          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full py-4 px-1 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">'
content = content.replace(old_right_wrapper, new_right_wrapper)

with open('d:\\Peyvok_App\\src\\components\\LobbyView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Wrappers updated successfully!")
