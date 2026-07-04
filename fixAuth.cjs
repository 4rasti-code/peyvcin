const fs = require('fs');
let code = fs.readFileSync('src/components/AuthView.jsx', 'utf8');

// 1. Add agreedToTerms state
code = code.replace("const [confirmNewPassword, setConfirmNewPassword] = useState('');", "const [confirmNewPassword, setConfirmNewPassword] = useState('');\n    const [agreedToTerms, setAgreedToTerms] = useState(false);");

// 2. In handleAuth for signup, check for agreedToTerms
const validationOld = `if (nameAvailability !== 'available' || passwordError || confirmError || !password || !confirmPassword) {`;
const validationNew = `if (!agreedToTerms && !isLogin && !isRecovering) {\n                      playAlertSfx();\n                      setError('پێویستە ڕازی بیت بە مەرجەکانی بەکارهێنان');\n                      setLoading(false);\n                      return;\n                  }\n                  if (nameAvailability !== 'available' || passwordError || confirmError || !password || !confirmPassword) {`;
code = code.replace(validationOld, validationNew);

// 3. Add the checkbox in the UI right before the sign up button.
const uiOld = `</AnimatePresence>
                                    <button type="submit" disabled={loading} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-bold font-rabar text-sm transition-all flex items-center justify-center gap-2 mt-2">`;
const uiNew = `</AnimatePresence>
                                      {!isLogin && !isRecovering && (
                                        <label className="flex items-center gap-2 mt-2 mb-2 cursor-pointer bg-mono-100 dark:bg-white/5 p-2 rounded-md">
                                          <input 
                                            type="checkbox" 
                                            checked={agreedToTerms} 
                                            onChange={(e) => { triggerHaptic(5); setAgreedToTerms(e.target.checked); }} 
                                            className="w-4 h-4 rounded-sm accent-primary cursor-pointer shrink-0"
                                          />
                                          <span className="text-mono-600 dark:text-mono-300 text-[10px] font-bold">
                                            بە دروستکردنی هەژمار، تۆ ڕازیت بە <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }} className="text-primary hover:underline">مەرجەکانی بەکارهێنان</button> و <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }} className="text-primary hover:underline">سیاسەتی تایبەتێتی</button>
                                          </span>
                                        </label>
                                      )}
                                    <button type="submit" disabled={loading} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-bold font-rabar text-sm transition-all flex items-center justify-center gap-2 mt-2">`;
code = code.replace(uiOld, uiNew);

fs.writeFileSync('src/components/AuthView.jsx', code, 'utf8');
