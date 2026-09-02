const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Simple regex approach: find all occurrences of className="..."
            // Inside that, if we find font-rabar or font-heading, replace tracking-wide(r/st) with tracking-normal
            const classNameRegex = /className=(?:\{`|'|")([^`'"]+)(?:`\}|'|")/g;
            
            content = content.replace(classNameRegex, (match, classList) => {
                if (classList.includes('font-rabar') || classList.includes('font-heading') || classList.includes('font-noto-sans-arabic')) {
                    if (/tracking-(wide|wider|widest)/.test(classList)) {
                        modified = true;
                        const newClassList = classList.replace(/tracking-(wide|wider|widest)/g, 'tracking-normal');
                        return match.replace(classList, newClassList);
                    }
                }
                return match;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed tracking in ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Done.');
