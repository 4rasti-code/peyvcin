const fs = require('fs');

let code = fs.readFileSync('src/components/DataDeletion.jsx', 'utf8');

const targetStr = `                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-surface-container/20 backdrop-blur-3xl p-6 rounded-md border border-outline/10 ">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={handleClose}>
                        <div className="w-12 h-12 rounded-md bg-linear-to-br from-mono-800 to-mono-900 dark:from-mono-100 dark:to-mono-200 flex items-center justify-center ">
                            <span className="material-symbols-outlined text-white text-2xl">delete_sweep</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-linear-to-r from-mono-900 to-mono-500 dark:from-white dark:to-white/60">پەیڤۆک</h1>
                            <p className="text uppercase font-bold tracking text-mono-700 dark:text-mono-300">Data Freedom</p>
                        </div>
                    </div>

                    <div className="flex bg-mono-100 dark:bg-black/40 p-1.5 rounded-md border border-mono-200 dark:border-white/5 backdrop-blur-md">
                        <button
                            onClick={() => { playBackSfx(); setIsKurdish(true); }}
                            className={`px-6 py-2.5 rounded-md text-xs font-bold transition-all duration-500 flex items-center gap-2 ${isKurdish ? 'bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900 scale-105 shadow-md shadow-black/10' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            <div className="w-5 h-3.5 rounded overflow-hidden shadow-sm">
                                <KurdistanFlag />
                            </div>
                            <span>بەهدینی</span>
                        </button>
                        <button
                            onClick={() => { playBackSfx(); setIsKurdish(false); }}
                            className={`px-6 py-2.5 rounded-md text-xs font-bold transition-all duration-500 flex items-center gap-2 ${!isKurdish ? 'bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900 scale-105 shadow-md shadow-black/10' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            <div className="w-5 h-3.5 rounded overflow-hidden shadow-sm">
                                <USFlag />
                            </div>
                            <span>English</span>
                        </button>
                    </div>
                </div>`;

const replacementStr = `                <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-8">
                    <div className="flex items-center gap-6 group cursor-pointer" onClick={handleClose}>
                        <div>
                            <h1 className="text-4xl font-bold text-mono-900 dark:text-white mb-1">پەیڤۆک</h1>
                            <p className="text-mono-500 dark:text-mono-400 text-xs font-bold uppercase tracking">Data Freedom</p>
                        </div>
                    </div>

                    <div className="flex bg-mono-50 dark:bg-mono-900/80 backdrop-blur-xl border border-mono-200 dark:border-white/5 rounded-md p-1.5">
                        <button
                            onClick={() => { playBackSfx(); setIsKurdish(true); }}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-md transition-all duration-300 font-bold text-sm ${isKurdish ? 'bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            <div className="w-5 h-3.5 rounded overflow-hidden">
                                <KurdistanFlag />
                            </div>
                            <span>بەهدینی</span>
                        </button>
                        <button
                            onClick={() => { playBackSfx(); setIsKurdish(false); }}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-md transition-all duration-300 font-bold text-sm ${!isKurdish ? 'bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            <div className="w-5 h-3.5 rounded overflow-hidden">
                                <USFlag />
                            </div>
                            <span>English</span>
                        </button>
                    </div>
                </div>`;

if (code.includes('flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-surface-container/20 backdrop-blur-3xl p-6')) {
    // We'll do a regex replace to catch any slight whitespace variations
    const regex = /<div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    code = code.replace(regex, replacementStr);
    fs.writeFileSync('src/components/DataDeletion.jsx', code, 'utf8');
    console.log("SUCCESS");
} else {
    // If exact doesn't work, just use the regex directly
    const regex = /<div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    if(regex.test(code)) {
        code = code.replace(regex, replacementStr);
        fs.writeFileSync('src/components/DataDeletion.jsx', code, 'utf8');
        console.log("SUCCESS WITH REGEX");
    } else {
        console.log("NOT FOUND AT ALL");
    }
}
