const fs = require('fs');
let code = fs.readFileSync('src/components/TermsOfService.jsx', 'utf8');

// Replace English
code = code.replace(
`                {
                    title: "8. Changes to Terms",
                    text: "We reserve the right to modify these terms at any time. We will notify you of major changes through the application.",
                    email: "support@peyvokgame.com"
                }`,
`                {
                    title: "8. Changes to Terms",
                    text: "We reserve the right to modify these terms at any time. We will notify you of major changes through the application."
                },
                {
                    title: "9. Contact Us",
                    text: "If you have any questions or concerns regarding these terms, you may contact us at:",
                    email: "support@peyvokgame.com"
                }`
);

// Replace Kurdish
code = code.replace(
`                {
                    title: "٨. گوھۆڕینا مەرجان",
                    text: "مە ماف ھەیە ل ھەر دەمەکی ڤان مەرجان بگوھۆڕین. ئەم دێ تە ژ گوھۆڕینێن مەزن ئاگەھدار کەین.",
                    email: "support@peyvokgame.com"
                }`,
`                {
                    title: "٨. گوھۆڕینا مەرجان",
                    text: "مە ماف ھەیە ل ھەر دەمەکی ڤان مەرجان بگوھۆڕین. ئەم دێ تە ژ گوھۆڕینێن مەزن ئاگەھدار کەین."
                },
                {
                    title: "٩. پەیوەندیکرن",
                    text: "ئەگەر تە ھەر پرسیارەک یان تێبینییەک ھەبێت دەربارەی ڤان مەرجان، د شێی ب ڕێیا ڤی ئیمێلێ ل خوارێ پەیوەندیێ ب مە بکەی:",
                    email: "support@peyvokgame.com"
                }`
);

fs.writeFileSync('src/components/TermsOfService.jsx', code, 'utf8');
