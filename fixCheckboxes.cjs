const fs = require('fs');
let code = fs.readFileSync('src/components/PublicProfileModal.jsx', 'utf8');

// 1. Change state declaration
code = code.replace('const [reportReason, setReportReason] = useState("");', 'const [reportReasons, setReportReasons] = useState([]);');

// 2. Change handleReport logic
const handleReportOld = `    let finalReason = reportReason;
    if (reportReason === 'یێن دیتر') {
      finalReason = customReason.trim();
      if (!finalReason) return;
    }`;
const handleReportNew = `    let finalReason = reportReasons.filter(r => r !== 'یێن دیتر').join('، ');
    if (reportReasons.includes('یێن دیتر')) {
      finalReason = finalReason ? finalReason + '، ' + customReason.trim() : customReason.trim();
    }
    if (!finalReason) return;`;
code = code.replace(handleReportOld, handleReportNew);

// 3. Update state resets
code = code.replace(/setReportReason\(""\)/g, 'setReportReasons([])');

// 4. Update the render loop
const renderOld = `{['ئاخفتنێن نەجوان', 'ناڤێ نەجوان', 'فێلکرن', 'بێزارکرن', 'یێن دیتر'].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-mono-200 dark:hover:bg-white/5 transition-colors">
                        <input 
                          type="radio" 
                          name="reportReason" 
                          value={reason} 
                          checked={reportReason === reason} 
                          onChange={(e) => { triggerHaptic(5); setReportReason(e.target.value); }} 
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        <span className="text-mono-700 dark:text-mono-300 text-xs font-bold">{reason}</span>
                      </label>
                    ))}`;
const renderNew = `{['ئاخفتنێن نەجوان', 'ناڤێ نەجوان', 'فێلکرن', 'بێزارکرن', 'یێن دیتر'].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-mono-200 dark:hover:bg-white/5 transition-colors">
                        <input 
                          type="checkbox" 
                          name="reportReason" 
                          value={reason} 
                          checked={reportReasons.includes(reason)} 
                          onChange={(e) => {
                            triggerHaptic(5);
                            if (e.target.checked) {
                              setReportReasons([...reportReasons, reason]);
                            } else {
                              setReportReasons(reportReasons.filter(r => r !== reason));
                            }
                          }} 
                          className="w-4 h-4 rounded-sm accent-primary cursor-pointer"
                        />
                        <span className="text-mono-700 dark:text-mono-300 text-xs font-bold">{reason}</span>
                      </label>
                    ))}`;
code = code.replace(renderOld, renderNew);

// 5. Update the text area condition
code = code.replace(/reportReason === 'یێن دیتر'/g, "reportReasons.includes('یێن دیتر')");

// 6. Update the disabled condition for the submit button
const buttonDisabledOld = `disabled={reporting || !reportReason || (reportReason === 'یێن دیتر' && !customReason.trim())}`;
const buttonDisabledNew = `disabled={reporting || reportReasons.length === 0 || (reportReasons.includes('یێن دیتر') && !customReason.trim())}`;
code = code.replace(buttonDisabledOld, buttonDisabledNew);

fs.writeFileSync('src/components/PublicProfileModal.jsx', code, 'utf8');
