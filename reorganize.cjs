const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the current divider
let oldDivider = `<div className="flex items-center gap-4 my-2 text-mono-400 dark:text-white/20">
                                            <div className="flex-1 h-px bg-current"></div>
                                            <span className="text-[10px] font-black font-rabar opacity-60">یان</span>
                                            <div className="flex-1 h-px bg-current"></div>
                                        </div>`;

content = content.replace(oldDivider, '');

// 2. Insert the divider above Guest button
let guestButtonSearch = `<button
                                            type="button"
                                            onClick={handleGuestLogin}`;

let newDividerAndGuest = `<div className="flex items-center gap-4 py-1 text-mono-400 dark:text-white/30">
                                            <div className="flex-1 h-px bg-current"></div>
                                            <span className="text-[10px] font-black font-rabar opacity-60">یان</span>
                                            <div className="flex-1 h-px bg-current"></div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleGuestLogin}`;

content = content.replace(guestButtonSearch, newDividerAndGuest);

// 3. Remove any extra empty lines created
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(file, content, 'utf8');
console.log("Reorganized sections successfully!");
