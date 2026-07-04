const fs = require('fs');

let code = fs.readFileSync('src/components/DataDeletion.jsx', 'utf8');

// Replace English steps
code = code.replace(
`            steps: [
                "Open your Google or Discord profile and go to 'Settings & Privacy' > 'Settings'.",
                "Look for 'Apps and Websites' and find 'پەیڤۆک'.",
                "Click the 'Remove' button.",
                "Alternatively, you can send an email to support@peyvokgame.com with the subject 'Data Deletion Request' and include your User ID or the email associated with your account."
            ],`,
`            steps: [
                "The fastest way: Go to 'Settings' inside the app and click the 'Delete Account' button at the bottom.",
                "Open your Google or Discord profile and go to 'Settings & Privacy' > 'Settings'.",
                "Look for 'Apps and Websites' and find 'پەیڤۆک'.",
                "Click the 'Remove' button.",
                "Alternatively, you can send an email to support@peyvokgame.com with the subject 'Data Deletion Request' and include your User ID or the email associated with your account."
            ],`
);

// Replace Kurdish steps
code = code.replace(
`            steps: [
                "پرۆفایلێ خوە یێ گۆگڵ یان دیسکۆردی ڤەکە و ھەڕە 'Settings & Privacy' پاشان 'Settings'.",
                "ل 'Apps and Websites' بگەڕی و 'پەیڤۆک' ببينە.",
                "کلیکێ ل سەر دوگمەیا 'Remove' بکە.",
                "یان ژی، تو دشێی ئیمەیلەکی بۆ support@peyvokgame.com بھنێری ب ناڤونیشانێ 'Data Deletion Request' و ناسنامەیا خوە (User ID) یان ئیمەیلا خوە تێدا بنڤیسی."
            ],`,
`            steps: [
                "خێراترین ڕێک: بچە بەشێ 'ڕێکخستن' (Settings) د ناڤ ئەپێ دا و کلیکێ ل دوگمەیا 'ژێبرنا هەژمارێ' بکە ل خوارێ.",
                "پرۆفایلێ خوە یێ گۆگڵ یان دیسکۆردی ڤەکە و ھەڕە 'Settings & Privacy' پاشان 'Settings'.",
                "ل 'Apps and Websites' بگەڕی و 'پەیڤۆک' ببينە.",
                "کلیکێ ل سەر دوگمەیا 'Remove' بکە.",
                "یان ژی، تو دشێی ئیمەیلەکی بۆ support@peyvokgame.com بھنێری ب ناڤونیشانێ 'Data Deletion Request' و ناسنامەیا خوە (User ID) یان ئیمەیلا خوە تێدا بنڤیسی."
            ],`
);

fs.writeFileSync('src/components/DataDeletion.jsx', code, 'utf8');
console.log("SUCCESS");
