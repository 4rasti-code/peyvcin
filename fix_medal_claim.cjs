const fs = require('fs');
let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

c = c.replace(/const \{\s*currentXP, level, dailyStreak, lastStreakAt,\s*userRank, progressPercent, solvedWords\s*\} = useGame\(\);/, `const {\n      currentXP, level, dailyStreak, lastStreakAt,\n      userRank, progressPercent, solvedWords,\n      updateInventory, addXP\n   } = useGame();`);

const oldMapRegex = /\{medals\.map\(\(m\) => \{\s*const isUnlocked = m\.condition\(displayData\);\s*return \([\s\S]*?\}\)\}\s*<\/div>/;

const newMap = `{medals.map((m) => {
                        const isUnlocked = m.condition(displayData);
                        const isClaimed = (profileData?.claimed_medals || []).includes(m.id);
                        const isClaimable = isUnlocked && !isClaimed;
                        const isClaiming = claimingMedal === m.id;

                        return (
                           <div
                              key={m.id}
                              onClick={() => handleClaimMedal(m)}
                              className={\`flex flex-col items-center justify-start py-3 transition-all duration-300 w-[30%] min-w-[90px] 
                                 \${!isUnlocked ? 'opacity-50 grayscale' : ''} 
                                 \${isClaimable ? 'cursor-pointer hover:bg-mono-100 dark:hover:bg-mono-900 rounded-xl border border-dashed border-amber-500' : ''}
                                 \${isClaiming ? 'animate-pulse scale-110' : ''}
                              \`}
                           >
                              <div className="h-10 mb-2 flex items-center justify-center relative">
                                 <m.IconComponent className={\`w-9 h-9 transition-all \${isClaimable ? 'animate-bounce' : 'hover:scale-110'} \${isUnlocked ? '' : 'text-slate-500'}\`} disabled={!isUnlocked} isUnclaimed={isClaimable} />
                                 {isClaimable && !isClaiming && (
                                    <span className="absolute -top-2 -right-2 flex h-3 w-3">
                                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                       <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                 )}
                              </div>
                              <span className={\`text-[11px] font-black font-rabar mb-0.5 text-center drop-shadow-sm \${isUnlocked ? m.color : 'text-mono-500 dark:text-mono-400'}\`}>
                                 {m.name}
                              </span>
                              
                              {isClaiming ? (
                                 <span className="text-[10px] font-bold text-green-500 text-center leading-tight px-1">
                                    + {m.reward?.xp} XP
                                 </span>
                              ) : isClaimable ? (
                                 <span className="text-[10px] font-bold text-amber-500 animate-pulse text-center leading-tight px-1">
                                    وەربگرە!
                                 </span>
                              ) : (
                                 <span className="text-[8px] font-bold text-mono-400 dark:text-mono-500 text-center leading-tight px-1">
                                    {m.tooltip}
                                 </span>
                              )}
                           </div>
                        );
                     })}
                  </div>`;

c = c.replace(oldMapRegex, newMap);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Fixed imports and map replacement!');
