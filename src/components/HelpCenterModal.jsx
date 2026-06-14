import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const HELP_TOPICS = [
  {
    id: 'how-to-play',
    icon: 'sports_esports',
    title: 'چاوا دێ یاریێ کەی؟',
    desc: 'فێرکاری و مۆدێن یاریێ',
    faqs: [
      { q: 'بەشێ فێرکاری ل کیڤەیە؟', a: 'تو دشێی ل سەر شاشەیا سەرەکی (لۆبی) یان ژی د ناڤ یاریێ بخوە دا ل سەر ئایکۆنا پرسیارێ (؟) کلیک بکەی بۆ دیتنا فێرکاریێ بۆ هەر مۆدەکێ.' },
      { q: 'تایبەتمەندیێن مۆدێ کلاسیک چنە؟', a: 'د مۆدێ کلاسیک دا تە ٦ بزاڤ هەنە بۆ دیتنا پەیڤێن کو ژ ٢ تا ٥ پیتان پێکدهێن. ب دیتنا پەیڤێ تو دێ ٥٠ XP ب دەستڤە ئینی.' },
      { q: 'تایبەتمەندیێن مۆدێ هەڤڕکی (Multiplayer) چنە؟', a: 'هەڤڕکی ل سەر پەیڤێن ٥ پیتی یە ب ٣ بزاڤان دژی یاریزانەکێ دی یێ سەرهێل (Online). یاریزانێ کو ٢ خالان ژ هەڤڕکێ خوە پێشکەڤیت دێ یاریێ بەت و ١٠٠ XP وەرگریت. ئەگەر خال بوونە ٣-٣، یاری ب یاکسانبوون ب دوماهیک دهێت و تو ١٠ XP وەردگری.' },
      { q: 'تایبەتمەندیێن مۆدێ مامک چنە؟', a: 'د مامکان دا پەیڤ ژ ٢ پیتان تا بێسنوور پێکدهێن. تە ٦ بزاڤ هەنە کو پەیڤێ د ناڤ ڕێزکێن مامکێ دا ببینی.' },
      { q: 'تایبەتمەندیێن مۆدێ تایا پەیڤان (Word Fever) چنە؟', a: 'یارییەکا بلەزە ل سەر پەیڤێن ٥ پیتی ب ٣ بزاڤان، و پێدڤییە د ماوێ ٣٠ چرکەیان دا پەیڤێ ببینی.' },
      { q: 'تایبەتمەندیێن مۆدێ پەیڤێن دژوار چنە؟', a: 'د ڤی مۆدی دا، پەیڤێن درێژ یێن کو ژ ٦ پیتان تا بێسنوور پێکدهێن دێ هێنە بەرامبەر تە ب ٦ بزاڤان بۆ دیتنێ.' }
    ]
  },
  {
    id: 'settings',
    icon: 'settings',
    title: 'ڕێکخستن',
    desc: 'دەنگ، مۆزیک و لەرزین',
    faqs: [
      { q: 'دەنگێ یاریێ (SFX) چییە؟', a: 'ئەڤە دەنگێ کارتێکەرێن یاریێ یە (وەکی دەنگێ کلیککرنا پیتان یان دەنگێ سەرکەفتنێ).' },
      { q: 'مۆزیکا باکگراوەندی چییە؟', a: 'ئەڤە ئەو مۆزیکە یا کو د دەمێ یاریێ و لۆبیێ دا ب نەرمی ل پشتەڤە دهێتە لێدان بۆ ئارامکرنا مێشکی.' },
      { q: 'دەنگکێش و لەرزین چ کار دکەن؟', a: 'دەنگکێش (Voice) تایبەتە ب ئاخافتنێ دگەل هەڤڕکێ تە د مۆدێ هەڤڕکی (Multiplayer) دا. لەرزین (Haptics) ژی هەستێ دەستلێدانێ ل کاتی کلیککرنێ یان دیتنا پەیڤێ ددەتە تەلەفۆنێ.' }
    ]
  },
  {
    id: 'account',
    icon: 'manage_accounts',
    title: 'هەژمارا کەسی',
    desc: 'ناسناڤ و وەڵات',
    faqs: [
      { q: 'چەوا ناسناڤێ خوە بگوهۆڕم و ئەرێ سنور هەیە؟', a: 'تو دشێی د بەشێ هەژمارا کەسی ناسناڤێ خوە بگوهۆڕی، لێ ئاگاداربە پشتی گوهۆڕینێ، تو نەشێی بۆ ماوێ ١٤ ڕۆژان جارەکا دی ناسناڤێ خوە بگوهۆڕی.' },
      { q: 'ئەرێ دشێم وەڵاتێ خوە بگوهۆڕم؟', a: 'بەلێ، د بەشێ هەژمارا کەسی دا دشێی ل سەر ئالایێ وەڵاتی کلیک بکەی و وەڵاتەکێ دی هەلبژێری.' }
    ]
  },
  {
    id: 'shop',
    icon: 'storefront',
    title: 'بازاڕ و هاریکاری (Powerups)',
    desc: 'فلس، درهەم، دینار و هاریکاریان',
    faqs: [
      { q: 'دراڤێن یاریێ چنە؟', a: 'یاری سێ دراڤێن خەیالی یێن مێژوویی بکاردهینیت: فلس (برۆنز)، درهەم (زیڤ)، و دینار (زێڕ).' },
      { q: 'هاریکاری (Hint) چ دکەت؟', a: 'ب ٢٥٠ فلسان، هاریکاری پیتەکا ڕاست ل جهێ وێ یێ دروست د ناڤ پەیڤێ دا بۆ تە ئاشکرا دکەت.' },
      { q: 'موگناتیس (Magnet) چ دکەت؟', a: 'ب ٥٠٠ فلسان، موگناتیس هندەک ژ وان پیتان ژ کیبۆردی ڕادکەت یێن کو د ناڤ پەیڤا ڤەشارتی دا نینن، دا کو یاری بۆ تە ب ساناتر بکەڤیت.' },
      { q: 'دەربازبوون (Full Skip) چ دکەت؟', a: 'ب ١٠٠٠ فلسان، ئەڤ هاریکارییە دێ یاریێ بۆ تە دەرباز کەت و پەیڤێ ب تەمامی ئاشکرا کەت بێی کو زیان ب زنجیرەیا سەرکەفتنێن تە بگەهیت.' }
    ]
  },
  {
    id: 'daily',
    icon: 'redeem',
    title: 'خەلاتێن ڕۆژانە',
    desc: 'خەلاتێن بەردەوام و خەلاتێ مەزن',
    faqs: [
      { q: 'خەلاتێن ڕۆژانە چەوا کار دکەن؟', a: 'بۆ ماوێ ٧ ڕۆژان ل سەر یەک، هەڕ ڕۆژ خەلاتەکێ نووی بۆ تە هەیە. پێدڤییە هەر ڕۆژ بچیە د ناڤ یاریێ دا و کلیکێ ل سەر خەلاتی بکەی.' },
      { q: 'ئەگەر ڕۆژەکێ ژبیر بکەم چ د قەومیت؟', a: 'ئەگەر تو بۆ ماوێ ڕۆژەکێ خەلاتێ خوە وەرنەگری، زنجیرەیا خەلاتێن تە دێ شکێت و دێ جارەکا دی ژ ڕۆژا ئێکێ دەست پێ کەتەڤە.' },
      { q: 'خەلاتێ مەزن یێ ڕۆژا ٧ چییە؟', a: 'ل ڕۆژا حەفتێ، تو دێ خەلاتەکێ مەزنتر وەرگری کو پێکدهێت ژ ٢٠٠٠ فلسان و ١ دینارێ زێڕین.' }
    ]
  },
  {
    id: 'xp-streak',
    icon: 'bolt',
    title: 'ئێکسپی (XP) و ڵێڤڵ',
    desc: 'کۆمکرنا ئێکسپی و گوهۆڕینا ڕەنگان',
    faqs: [
      { q: 'ڕەنگێن ڵێڤڵان چەوا دهێنە گوهۆڕین؟', a: 'هەرچەند تو ئێکسپی وەردگری و ڵێڤڵێ تە بلند دبیت، هەر ٥ ڵێڤڵان جارەکێ ڕەنگێ خانەیا ڵێڤڵێ تە (Tier) دێ هێتە گوهۆڕین. وەکی برۆنزی، زیڤی، زێڕی، زمروتی، و هتد.' },
      { q: 'ئاستێ ئەڵماسی چییە؟', a: 'گاڤا تو دگەهییە ڵێڤڵ ١٠٠ و بەرەڤ ژۆر، ڕەنگێ تە دێ بیتە ئەڵماسی یێ ئەفسانەیی (Legendary Diamond) و دێ جوداتر ل بەر چاڤان دیار بیت.' }
    ]
  },
  {
    id: 'achievements',
    icon: 'military_tech',
    title: 'نازناڤ و مەدالیا',
    desc: 'ئاستێن یاریکەران و دەستکەفت',
    faqs: [
      { q: 'سەرەتایی چییە؟', a: 'گەهشتن ب ڵێڤڵ ١٠.' },
      { q: 'شارەزا چییە؟', a: 'گەهشتن ب ڵێڤڵ ٥٠.' },
      { q: 'پەهلەوان چییە؟', a: 'سەرکەفتن د ١٠٠ یاریان دا.' },
      { q: 'مامۆستا چییە؟', a: 'گەهشتن ب زنجیرەیەکا ڕۆژانە یا ٢٠٠ یاریان ل سەر یەک.' },
      { q: 'شانازیا کوردستانێ چییە؟', a: 'دیتنا ١٠٠٠ پەیڤێن کوردی.' },
      { q: 'شانازیا جیھانی چییە؟', a: 'دیتنا ١٠٠٠ پەیڤان بێی چ هاریکاری.' }
    ]
  },
  {
    id: 'chat',
    icon: 'chat',
    title: 'بەشێ چات و پەیوەندیان',
    desc: 'چاتا جیهانی، نامە و هەڤال',
    faqs: [
      { q: 'بەشێ جیهانی (Global Chat) چییە؟', a: 'ئەڤە ژوورەکا گشتی یە کو هەمی یاریزانێن یاریێ دشێن تێدا باخڤن، پەیامان بۆ ئێک و دوو بنێرن، و کەسێن نووی بنیاسن.' },
      { q: 'بەشێ نامە (Private Chat) چییە؟', a: 'ئەڤە تایبەتە بۆ نامە گۆڕینەوەیێ دگەل هەڤالێن تە یێن کو تە زێدەکرین د ناڤ یاریێ دا ب شێوەیەکێ تایبەت.' },
      { q: 'چەوا کەسەکێ کەمە هەڤالێ خوە؟', a: 'ل هەر جهەکێ د یاریێ دا (ل ڕێزبەندیێ یان د چاتا جیهانی دا) ل سەر وێنەیێ کەسەکێ کلیک بکە، پرۆفایلێ وی دێ ڤەبیت، پاشان کلیک ل سەر دوکمەیا "زێدەکرن وەک هەڤال" بکە بۆ ناردنا داخوازنامەیێ.' },
      { q: 'چەوا داخوازنامەیا هەڤالینیێ وەرگرم؟', a: 'گاڤا کەسەک داخوازنامەیەکێ بۆ تە دنێریت، دێ د بەشێ نۆتیفیکەیشن (ئاگاداری) دا یان د بەشێ هەڤالان دا بۆ تە دیار بیت، تو دشێی ل وێرێ وەرگری یان ڕەت بکەی.' },
      { q: 'چەوا کەسێ بێزارکەر بلۆک بکەم؟', a: 'هەر وەکی زێدەکرنا هەڤالان، ل سەر پرۆفایلێ وی کەسی کلیک بکە و دوکمەیا "بلۆککرن" هەلبژێرە.' }
    ]
  },
  {
    id: 'leaderboard',
    icon: 'leaderboard',
    title: 'ڕێزبەندی و گەڕیان',
    desc: 'هەڤال، لێگەڕیان و ڕێزبەندیا یاریزانان',
    faqs: [
      { q: 'ڕێزبەندی چەوا کار دکەت؟', a: 'ڕێزبەندی نیشانا باشترین یاریزانان ددەت ل سەر ئاستێ حەفتیانە و هەمی دەمان. ڕێزبەندی ل دووڤ وێ کۆژما ئێکسپی (XP) دهێتە هەژمارتن کو تە د وێ ماوەیێ دا کۆمکرین.' },
      { q: 'بەشێ هەڤالان د ڕێزبەندیێ دا چییە؟', a: 'د ناڤ ڕێزبەندیێ دا تو دشێی ل سەر تابی "هەڤال" کلیک بکەی بۆ دیتنا ڕێزبەندیا تە د ناڤبەرا هەڤالێن تە بخوە دا.' },
      { q: 'چەوا ل هەڤالەکێ خوە بگەڕێم؟', a: 'تو دشێی د ناڤ لیستا هەڤالان یان ڕێزبەندیێ دا ب ڕێیا بەشێ لێگەڕیانێ (Search) ناڤێ هەر کەسەکێ بنڤیسی بۆ دیتنا پرۆفایلێ وی.' }
    ]
  }
];

const HelpCenterModal = ({ onClose, triggerHaptic }) => {
   const [activePage, setActivePage] = useState(null);

   const handleOpenPage = (id) => {
      if (triggerHaptic) triggerHaptic(10);
      setActivePage(id);
   };

   const handleBack = () => {
      if (triggerHaptic) triggerHaptic(10);
      setActivePage(null);
   };

   const activeTopic = HELP_TOPICS.find(t => t.id === activePage);

   return (
      <Motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-1200 flex flex-col bg-mono-white dark:bg-black transition-colors duration-500 overflow-hidden"
         onClick={onClose}
      >
         <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="w-full px-4 sm:px-12 md:px-24 lg:px-48 mx-auto flex flex-col h-full relative font-rabar transition-colors duration-500"
            onClick={e => e.stopPropagation()}
            dir="rtl"
         >
            <AnimatePresence mode="wait">
               {/* --- MAIN MENU PAGE --- */}
               {!activePage ? (
                  <Motion.div
                     key="main-menu"
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ x: 20, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="flex flex-col h-full w-full"
                  >
                     {/* Compact Header matching SettingsModal */}
                     <div className="p-6 pt-12 sm:pt-8 pb-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">support_agent</span>
                           </div>
                           <div>
                              <h2 className="text-[16px] font-black font-rabar text-mono-900 dark:text-white leading-tight">سەنتەرێ هاریکاریێ</h2>
                              <p className="text-[11px] font-bold font-rabar text-mono-500">پێدڤی ب چ زانیارییان هەیە؟</p>
                           </div>
                        </div>
                        <button
                           onClick={() => { if (triggerHaptic) triggerHaptic(10); onClose(); }}
                           className="w-8 h-8 rounded-md bg-mono-50 dark:bg-white/5 flex items-center justify-center text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-white transition-all active:scale-90 border border-mono-100 dark:border-white/10"
                        >
                           <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                     </div>

                     {/* Content List */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-4">
                        <div className="rounded-md bg-mono-50/50 dark:bg-white/5 border border-mono-100 dark:border-white/5 flex flex-col divide-y divide-mono-100 dark:divide-white/5">
                           {HELP_TOPICS.map((topic) => (
                              <button 
                                 key={topic.id}
                                 onClick={() => handleOpenPage(topic.id)}
                                 className="w-full flex items-center justify-between px-4 py-3 hover:bg-mono-100/50 dark:hover:bg-white/5 transition-all group text-right"
                              >
                                 <div className="flex items-center gap-3.5">
                                    <span className="material-symbols-outlined text-[22px] text-mono-400 dark:text-mono-500 group-hover:text-blue-500 transition-colors">
                                       {topic.icon}
                                    </span>
                                    <div className="flex flex-col gap-0.5">
                                       <span className="text-[13px] font-black font-rabar text-mono-800 dark:text-mono-200 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">
                                          {topic.title}
                                       </span>
                                       <span className="text-[10px] font-bold font-rabar text-mono-500 dark:text-mono-500 truncate max-w-[200px]">
                                          {topic.desc}
                                       </span>
                                    </div>
                                 </div>
                                 <span className="material-symbols-outlined text-[18px] text-mono-300 dark:text-mono-600 group-hover:text-blue-500 group-hover:-translate-x-1 transition-all">
                                    chevron_left
                                 </span>
                              </button>
                           ))}
                        </div>
                        
                        <div className="pt-3 pb-1">
                           <button 
                              onClick={() => { if (triggerHaptic) triggerHaptic(10); window.location.href = 'mailto:support@peyivcin.com'; }}
                              className="w-full flex items-center justify-between p-4 rounded-lg bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-400/20 hover:brightness-110 active:scale-[0.98] transition-all group"
                           >
                              <div className="flex items-center gap-3">
                                 <span className="material-symbols-outlined text-blue-500 text-[22px]">mail</span>
                                 <div className="flex flex-col text-right">
                                    <h3 className="text-[13px] font-black font-rabar text-mono-900 dark:text-white">پەیوەندی کرن ب ئیمەیڵی</h3>
                                    <p className="text-[10px] font-bold font-rabar text-mono-500">پێشنیار یان کێشە هەنە؟</p>
                                 </div>
                              </div>
                              <span className="material-symbols-outlined text-blue-500 text-[18px]">open_in_new</span>
                           </button>
                        </div>
                     </div>
                  </Motion.div>
               ) : (
                  /* --- DETAIL PAGE --- */
                  <Motion.div
                     key="detail-page"
                     initial={{ x: 20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ x: -20, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="flex flex-col h-full w-full"
                  >
                     {/* Header */}
                     <div className="p-6 pt-12 sm:pt-8 pb-4 flex items-center gap-3 shrink-0">
                        <button 
                           onClick={handleBack}
                           className="w-8 h-8 rounded-md bg-mono-50 dark:bg-white/5 flex items-center justify-center text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-white transition-all active:scale-90 border border-mono-100 dark:border-white/10 shrink-0"
                        >
                           <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                        <div className="flex items-center gap-2 overflow-hidden">
                           <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0">
                              {activeTopic?.icon}
                           </span>
                           <h2 className="text-[14px] font-black font-rabar text-mono-900 dark:text-white truncate">
                              {activeTopic?.title}
                           </h2>
                        </div>
                     </div>

                     {/* FAQs List */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-3">
                        {activeTopic?.faqs.map((faq, index) => (
                           <div key={index} className="p-3.5 rounded-lg bg-mono-50 dark:bg-white/5 border border-mono-200 dark:border-white/5 shadow-sm flex flex-col gap-2">
                              <h4 className="text-[13px] font-black font-rabar text-mono-900 dark:text-white flex items-start gap-2.5 leading-snug">
                                 <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                 {faq.q}
                              </h4>
                              <p className="text-[12px] font-bold font-rabar text-mono-600 dark:text-mono-400 leading-relaxed pr-4 border-r-2 border-mono-200 dark:border-mono-700 mr-0.5">
                                 {faq.a}
                              </p>
                           </div>
                        ))}
                     </div>
                  </Motion.div>
               )}
            </AnimatePresence>
         </Motion.div>
      </Motion.div>
   );
};

export default HelpCenterModal;
