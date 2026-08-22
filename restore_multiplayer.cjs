const fs = require('fs');
let code = fs.readFileSync('src/components/HowToPlayModal.jsx', 'utf8');

const multiStart = code.indexOf('const renderMultiplayerTutorial = () => (');
const mamakStart = code.indexOf('const renderMamakTutorial = () => (');

const before = code.substring(0, multiStart);
const after = code.substring(mamakStart);

const newMulti = `  const renderMultiplayerTutorial = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5">
          <span className="text-xl">🎯</span> ئارمانجا سەرەکی یا یاریێ
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed text-justify">
          مۆدێ ھەڤڕکی یارییەکا ب لەز و سەرھێلە دگەل یاریزانەکێ دی. ئارمانجا تە ئەوە کو بەری یاریزانێ بەرامبەر، پەیڤا ڤەشارتی د ناڤ کێمترین بزاڤان دا ببینی.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5 mt-4">
          <span className="text-xl">📈</span> سیستەمێ گەڕان و درێژییا پەیڤان
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed">
          یاری پترترین سنوور {toKuDigits(5)} گەڕان (Rounds) پێکدھێت. بۆ ھندێ ھەڤڕکی ب شێوەیەکێ سەرنجڕاکێشتر لێ بھێت، درێژییا پەیڤان گەڕ ب گەڕ زێدەتر و گرانتر دبن ب ڤی شێوەیی:
        </p>
        <ul className="space-y-1.5 pl-0 pr-2 border-r-2 border-[#3b82f6]/30">
          <li className="flex gap-2 text-[12px] font-bold text-[#4a5568]">
            <span className="text-[#3b82f6]">🔸</span> گەڕا ١: پەیڤەکا {toKuDigits(3)} پیتی
          </li>
          <li className="flex gap-2 text-[12px] font-bold text-[#4a5568]">
            <span className="text-[#3b82f6]">🔸</span> گەڕا ٢: پەیڤەکا {toKuDigits(4)} پیتی
          </li>
          <li className="flex gap-2 text-[12px] font-bold text-[#4a5568]">
            <span className="text-[#3b82f6]">🔸</span> گەڕا ٣: پەیڤەکا {toKuDigits(5)} پیتی
          </li>
          <li className="flex gap-2 text-[12px] font-bold text-[#4a5568]">
            <span className="text-[#3b82f6]">🔸</span> گەڕا ٤: پەیڤەکا {toKuDigits(5)} پیتی
          </li>
          <li className="flex gap-2 text-[12px] font-bold text-[#4a5568]">
            <span className="text-[#3b82f6]">🔸</span> گەڕا ٥: پەیڤەکا {toKuDigits(6)} پیتی
          </li>
        </ul>
        <p className="text-[11px] font-bold text-[#64748b] bg-slate-100 p-2 rounded-md mt-2 border border-slate-200">
          تێبینی: ھەردوو یاریزان د ھەر گەڕەکێ دا ڕێک ھەمان پەیڤ بۆ دھێت.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5 mt-4">
          <span className="text-xl">⚠️</span> ھەژمارا بزاڤان
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed text-justify bg-red-50 p-3 rounded-lg border border-red-100">
          سەرەڕای ھندێ کو پەیڤ درێژتر و گرانتر دبن، بەلێ یاسا گەلەک دژوارە: ھەر یاریزانەک تنێ <strong className="text-red-600">{toKuDigits(3)} بزاڤ</strong> ھەنە د ھەر گەڕەکێ دا! ئەگەر تە ھەر سێ بزاڤێن خوە ب کار ئینان و پەیڤ نەدیت، تو ئێکسەر سەرناکەڤی، بەلکو دێ چاڤەڕێی یاریزانێ بەرامبەر کەی. ئەگەر وی پەیڤ دیت، خاڵ بۆ وی دچیت. ئەگەر وی ژی د ھەر سێ بزاڤان دا پەیڤ نەدیت (یان دەمێ وی ب دوماھی ھات)، ل وی دەمی دێ چنە گەڕەکا دی و چ کەس خالێ وەرناگریت (گەڕ یاکسان دەرباز دبیت).
        </p>
      </div>

      <div className="w-full max-w-55 mx-auto flex flex-col items-center justify-center my-4 shrink-0 bg-slate-50 py-3 px-2 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-[11px] font-bold text-slate-500 mb-3 font-rabar text-center px-2">
          نموونەیا بزاڤان بۆ گەڕێن جودا (تنێ {toKuDigits(3)} بزاڤ بۆ ھەر گەڕەکێ):
        </span>
        <div className="flex gap-2 mb-3 bg-slate-200 p-1 rounded-lg w-full">
          {[
            { id: '3', label: \`\${toKuDigits(3)} پیتی\` },
            { id: '4', label: \`\${toKuDigits(4)} پیتی\` },
            { id: '5', label: \`\${toKuDigits(5)} پیتی\` },
            { id: '6', label: \`\${toKuDigits(6)} پیتی\` }
          ].map(e => (
            <button
              key={e.id}
              onClick={() => { triggerHaptic(10); setMpExampleTab(e.id); }}
              className={\`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all \${mpExampleTab === e.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="min-h-30 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <Motion.div
              key={mpExampleTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {mpExampleTab === '3' && (
                <GameResultRenderer text={\`ھەڤڕکی\\nش🟨 ا🟩 د⬛\\nپ⬛ ا🟩 ک⬛\\nب🟩 ا🟩 ش🟩\`} />
              )}
              {mpExampleTab === '4' && (
                <GameResultRenderer text={\`ھەڤڕکی\\nخ⬛ ر⬛ ا🟨 ب⬛\\nس🟨 و⬛ ی⬛ ر⬛\\nڕ🟩 ا🟩 س🟩 ت🟩\`} />
              )}
              {mpExampleTab === '5' && (
                <GameResultRenderer text={\`ھەڤڕکی\\nچ🟨 ە⬛ پ⬛ ە⬛ ر⬛\\nب🟩 ا⬛ ز⬛ ا⬛ ڕ⬛\\nب🟩 چ🟩 و🟩 ی🟩 ک🟩\`} />
              )}
              {mpExampleTab === '6' && (
                <GameResultRenderer text={\`ھەڤڕکی\\nئ⬛ ە🟨 ر⬛ ز⬛ ا⬛ ن🟨\\nب🟩 ێ🟩 ڕ⬛ ە🟩 ن🟩 گ🟩\\nب🟩 ێ🟩 د🟩 ە🟩 ن🟩 گ🟩\`} />
              )}
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>

      {mpExampleTab === '3' && (
        <div className="space-y-2 mt-4 bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-sm">
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ١:</span> یاریزان دنڤیسیت "شاک". پیتا <span className="text-[#f59e0b] font-black">(ش)</span> زەرە چونکی د پەیڤێ دا ھەیە لێ ل جھێ شاشە. پیتا <span className="text-[#22c55e] font-black">(ا)</span> کەسکە.
            </p>
          </div>
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٢:</span> یاریزان دنڤیسیت "پاک". پیتا <span className="text-slate-500 font-black">(پ)</span> ڕەساسی یە، و پیتا <span className="text-[#22c55e] font-black">(ا)</span> دیسان کەسکە.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٣:</span> یاریزان دنڤیسیت "باش". ھەمی پیت کەسک دبن و یاریزان پەیڤێ دبینیت!
            </p>
          </div>
        </div>
      )}

      {mpExampleTab === '4' && (
        <div className="space-y-2 mt-4 bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-sm">
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ١:</span> یاریزان دنڤیسیت "خراب". پیتا <span className="text-[#f59e0b] font-black">(ا)</span> زەرە، و پیتێن دی ڕەساسی نە وەکو <span className="text-slate-500 font-black">(خ)</span>.
            </p>
          </div>
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٢:</span> یاریزان دنڤیسیت "سویر". پیتا <span className="text-[#f59e0b] font-black">(س)</span> زەرە چونکی د پەیڤێ دا ھەیە لێ ل جھێ شاشە.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٣:</span> یاریزان دنڤیسیت "ڕاست". ھەمی پیت کەسک دبن و پەیڤا دروست دیار دبیت!
            </p>
          </div>
        </div>
      )}

      {mpExampleTab === '5' && (
        <div className="space-y-2 mt-4 bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-sm">
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ١:</span> یاریزان دنڤیسیت "چەپەر". پیتا <span className="text-[#f59e0b] font-black">(چ)</span> زەرە، و یێن دی ڕەساسی نە وەکو <span className="text-slate-500 font-black">(ە)</span>.
            </p>
          </div>
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٢:</span> یاریزان دنڤیسیت "بازاڕ". پیتا <span className="text-[#22c55e] font-black">(ب)</span> کەسکە چونکی ل جھێ ڕاستە.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٣:</span> یاریزان دنڤیسیت "بچویک". یاریزان ب سەرکەفتیانە پەیڤێ دبینیت!
            </p>
          </div>
        </div>
      )}

      {mpExampleTab === '6' && (
        <div className="space-y-2 mt-4 bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-sm">
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ١:</span> یاریزان دنڤیسیت "ئەرزان". پیتێن <span className="text-[#f59e0b] font-black">(ە، ن)</span> زەرن چونکی ل جھێ شاشن.
            </p>
          </div>
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٢:</span> یاریزان دنڤیسیت "بێڕەنگ". پیتێن <span className="text-[#22c55e] font-black">(ب، ێ، ە، ن، گ)</span> کەسک دبن لێ پیتا <span className="text-slate-500 font-black">(ڕ)</span> ڕەساسی یە.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ٣:</span> یاریزان دنڤیسیت "بێدەنگ". ھەمی پیت کەسک دبن.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5 mt-4">
          <span className="text-xl">🏆</span> یاسایێن سەرکەفتن و سەرنەکەفتنێ
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed">
          سیستەمێ خاڵان ب شێوەیێ (Best of 5) دھێتە ھژمارتن. ئەو یاریزانێ دکاریت بەری یاریزانێ بەرامبەر {toKuDigits(3)} پەیڤان بدۆزیتەوە، دێ بیتە سەرکەفتیێ یاریێ و خاڵێن ڤێ ھەڤڕکیێ ب دەستڤە ئینیت. ئەگەر ھەردوو یاریزان یەکسان بن ل دوماھییا {toKuDigits(5)} گەڕان (بۆ نموونە {toKuDigits(2)}-{toKuDigits(2)} یان {toKuDigits(1)}-{toKuDigits(1)})، ئەنجام ب یەکسانبوون دھێتە ھژمارتن.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5 mt-4">
          <span className="text-xl">🕒</span> دەمێ یاریێ
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed">
          ھەر گەڕەک دەمەکێ دیارکری ھەیە بۆ دیتنا پەیڤێ (بۆ نموونە <strong className="text-[#1e86ff]">٤٥ چرکە</strong>). پێدڤییە بەری دەم ب دوماھی بھێت پەیڤێ بدۆزیەوە، ئەگەر نە، بزاڤا تە نامینیت و دێ گەڕ بۆ یاریزانێ دی ھێتە ھژمارتن.
        </p>
      </div>
    </div>
  );

`;

fs.writeFileSync('src/components/HowToPlayModal.jsx', before + newMulti + after, 'utf8');
console.log('Restored Multiplayer section!');
