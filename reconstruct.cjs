const fs = require('fs');

const part1 = `renderMultiplayerTutorial = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      
      {/* 1. Main Objective */}
      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5">
          <span className="text-xl">🎯</span> ئارمانجا سەرەکی یا یاریێ
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed text-justify">
          مۆدێ ھەڤڕکی یارییەکا ب لەز و سەرھێلە دگەل یاریزانەکێ دی. ئارمانجا تە ئەوە کو بەری یاریزانێ بەرامبەر، پەیڤا ڤەشارتی د ناڤ کێمترین بزاڤان دا ببینی.
        </p>
      </div>

      

      {/* 2. Escalating Difficulty */}
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

      {/* 3. Attempts Constraint */}
      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5 mt-4">
          <span className="text-xl">⚠️</span> ھەژمارا بزاڤان
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed text-justify bg-red-50 p-3 rounded-lg border border-red-100">
          سەرەڕای ھندێ کو پەیڤ درێژتر و گرانتر دبن، بەلێ یاسا گەلەک دژوارە: ھەر یاریزانەک تنێ <strong className="text-red-600">{toKuDigits(3)} بزاڤ</strong> ھەنە د ھەر گەڕەکێ دا! ئەگەر تە ھەر سێ بزاڤێن خوە ب کار ئینان و پەیڤ نەدیت، تو ئێکسەر سەرناکەڤی، بەلکو دێ چاڤەڕێی یاریزانێ بەرامبەر کەی. ئەگەر وی پەیڤ دیت، خاڵ بۆ وی دچیت. ئەگەر وی ژی د ھەر سێ بزاڤان دا پەیڤ نەدیت (یان دەمێ وی ب دوماھی ھات)، ل وی دەمی دێ چنە گەڕەکا دی و چ کەس خالێ وەرناگریت (گەڕ یاکسان دەرباز دبیت).
        </p>
      </div>

      {/* Tabbable Grid Examples */}
      <div className="w-full max-w-55 mx-auto flex flex-col items-center justify-center my-4 shrink-0 bg-slate-50 py-3 px-2 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-[11px] font-bold text-slate-500 mb-3 font-rabar text-center px-2">
          نموونەیا بزاڤان بۆ گەڕێن جودا (تنێ {toKuDigits(3)} بزاڤ بۆ ھەر گەڕەکێ):
        </span>
        
        {/* Tabs for Grid */}
        <div className="flex gap-2 mb-3 bg-slate-200 p-1 rounded-lg w-full">
          {[
            { id: '3', label: \`\${toKuDigits(3)} پیتی\` },
            { id: '4', label: \`\${toKuDigits(4)} پیتی\` },
            { id: '5', label: \`\${toKuDigits(5)} پیتی\` },
            { id: '6', label: \`\${toKuDigits(6)} پیتی\` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMpExampleTab(tab.id)}
              className={\`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all \${
                mpExampleTab === tab.id 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }\`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Grid */}
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
                <GameResultRenderer 
                  text={\`ھەڤڕکی\\nش🟨 ا🟩 د⬛\\nپ⬛ ا🟩 ک⬛\\nب🟩 ا🟩 ش🟩\`} 
                />
              )}
              {mpExampleTab === '4' && (
                <GameResultRenderer 
                  text={\`ھەڤڕکی\\nخ⬛ ر⬛ ا🟨 ب⬛\\nس🟨 و⬛ ی⬛ ر⬛\\nڕ🟩 ا🟩 س🟩 ت🟩\`} 
                />
              )}
              {mpExampleTab === '5' && (
                <GameResultRenderer 
                  text={\`ھەڤڕکی\\nچ🟨 ە⬛ پ⬛ ە⬛ ر⬛\\nب🟩 ا⬛ ز⬛ ا⬛ ڕ⬛\\nب🟩 چ🟩 و🟩 ی🟩 ک🟩\`} 
                />
              )}
              {mpExampleTab === '6' && (
                <GameResultRenderer 
                  text={\`ھەڤڕکی\\nئ⬛ ە🟨 ر⬛ ز⬛ ا⬛ ن🟨\\nب🟩 ێ🟩 ڕ⬛ ە🟩 ن🟩 گ🟩\\nب🟩 ێ🟩 د🟩 ە🟩 ن🟩 گ🟩\`} 
                />
              )}
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Dynamic Explanations */}
      {mpExampleTab === '3' && (
        <div className="space-y-2 mt-4 bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-sm">
          <div className="flex flex-col gap-1 pb-2 border-b border-dashed border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#4a5568] leading-relaxed">
              <span className="text-[#1e86ff] font-black">بزاڤا ١:</span> یاریزان دنڤیسیت "شاد". پیتا <span className="text-[#f59e0b] font-black">(ش)</span> زەرە چونکی د پەیڤێ دا ھەیە لێ ل جھێ شاشە. پیتا <span className="text-[#22c55e] font-black">(ا)</span> کەسکە.
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

      {/* 4. Winning and Drawing Rules */}
      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5 mt-4">
          <span className="text-xl">🏆</span> یاسایێن سەرکەفتن و سەرنەکەفتنێ
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed">
          سیستەمێ خاڵان ب شێوەیێ "جوداھییا خالان" کار دکەت نەک تنێ برنا پترترین گەڕان.
        </p>
        <div className="space-y-2.5 mt-2">
          <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[13px] font-black text-blue-700">سەرکەفتن:</span>
            </div>
            <p className="text-[11px] font-bold text-blue-900/80 leading-relaxed text-justify">
              بۆ ھندێ تو د یاریێ دا ب تەمامی سەربکەڤی، پێدڤییە ب جوداھییا {toKuDigits(2)} خالان ل پێشییا ھەڤڕکێ خوە بی. (بۆ نموونە ئەنجام ببیتە {toKuDigits(2)}-{toKuDigits(0)} یان {toKuDigits(3)}-{toKuDigits(1)}). ھەر دەمێ ئەڤ جوداھییە دروست بوو، یاری ئێکسەر ب دوماھیک دھێت بێی چاڤەڕێکرنا گەڕێن مایی.
            </p>
          </div>
          <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[13px] font-black text-slate-700">یاکسانبوون:</span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-justify">
              ئەگەر ھەردوو یاریزان گەھشتنە دوماھییا گەڕا {toKuDigits(5)} و یاری ب دوماھی ھات، و چ کەسەک نەشیا جوداھییا {toKuDigits(2)} خالان دروست بکەت (بۆ نموونە ئەنجام بوو {toKuDigits(1)}-{toKuDigits(0)}، یان {toKuDigits(2)}-{toKuDigits(1)}، یان {toKuDigits(3)}-{toKuDigits(2)})، ل وی دەمی ئەنجامێ یاریێ دێ بیتە یاکسانبوون و کەس ژ وە سەرناکەڤیت.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Live Interaction */}
      <div className="space-y-2">
        <h4 className="text-[13px] font-black font-rabar text-[#181a20] flex items-center gap-1.5 mt-4">
          <span className="text-xl">⚡</span> پەیوەندی و کارڤەدانێن سەرھێل
        </h4>
        <p className="text-[12px] font-bold text-[#4a5568] leading-relaxed text-justify">
          تو دشێی بزاڤێن یاریزانێ بەرامبەر د ھەمان دەم دا ببینی، لێ بێی ئاشکراکرنا پیتان و تنێ ب ڕێکا دیتنا ڕەنگان (🟩 🟨 ⬛). ئەڤ چەندە دێ وەکەت تو بزانی کا ھەڤڕکێ تە چەند یێ نێزیکە ژ دیتنا پەیڤێ. ھەروەسا بۆ خوەشترکرنا یاریێ، ھوین دشێن د ھەمان دەم دا ئیمۆجی (Reactions) و نامەیێن کورت یێن ئامادەکری بۆ ئێکودوو بنێرن.
        </p>
      </div>

    </div>
  );
`;

const content = fs.readFileSync('C:\\Users\\RYZEN5950X\\.gemini\\antigravity-ide\\brain\\fef128af-59c5-408f-ad64-4b6fd5e0e5ab\\how_to_play_redesign.md', 'utf8');
const jsxContent = content.substring(content.indexOf('\nimport'), content.lastIndexOf('\n```'));

let reconstructed = jsxContent;

// Replace the old renderMultiplayerTutorial with the new one we just built
const startMarker = '  const renderMultiplayerTutorial = () => (';
const endMarker = '  const renderMamakTutorial = () => (';

const startIndex = reconstructed.indexOf(startMarker);
const endIndex = reconstructed.indexOf(endMarker);

reconstructed = reconstructed.substring(0, startIndex) + '  const ' + part1 + '\n\n' + reconstructed.substring(endIndex);

// Add state for mpExampleTab
reconstructed = reconstructed.replace('const [activeTab, setActiveTab] = useState(initialMode);', 'const [activeTab, setActiveTab] = useState(initialMode);\n  const [mpExampleTab, setMpExampleTab] = useState(\'3\');');

// Add GameResultRenderer component
const grr = `
const GameResultRenderer = ({ text }) => {
  const lines = text.trim().split('\\n');
  return (
    <div className="flex flex-col gap-1 items-center justify-center">
      {lines.slice(1).map((line, i) => {
        const letters = line.trim().split(' ').map(l => l.trim()).filter(l => l);
        return (
          <div key={i} className="flex gap-1">
            {letters.map((L, j) => {
              const char = L[0];
              const emoji = L.substring(1);
              let color = 'bg-slate-400 border-slate-500'; // black/gray
              if (emoji === '🟩') color = 'bg-[#22c55e] border-[#166534] text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25)] border-b-2';
              if (emoji === '🟨') color = 'bg-[#f59e0b] border-[#b45309] text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.3)] border-b-2';
              if (emoji === '⬛') color = 'bg-slate-400 border-slate-500 text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.2)] border-b-2';
              return (
                <div key={j} className={\`w-6 h-6 flex items-center justify-center rounded-[4px] font-black text-xs border \${color}\`}>
                  {char}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
`;

reconstructed = reconstructed.replace('export default function HowToPlayModal', grr + '\nexport default function HowToPlayModal');

fs.writeFileSync('d:/Peyvok_App/src/components/HowToPlayModal.jsx', reconstructed);
console.log('Successfully reconstructed HowToPlayModal.jsx!');
