import fs from 'fs';

function extractValues(sqlContent) {
    const regex = /\('([^']|'')+',\s*'([^']|'')+',\s*'([^']|'')+'(?:,\s*ARRAY\[.*?\](?:::TEXT\[\]|::text\[\])?)?\)/g;
    let match;
    const words = [];
    while ((match = regex.exec(sqlContent)) !== null) {
        const fullMatch = match[0];
        
        // A more robust way to parse the tuple:
        // We can just extract strings by finding single quotes
        let inString = false;
        let currentString = '';
        let strings = [];
        
        for (let i = 1; i < fullMatch.length; i++) {
            if (fullMatch[i] === "'" && fullMatch[i+1] === "'") {
                if (inString) currentString += "'";
                i++; // skip escaped quote
            } else if (fullMatch[i] === "'") {
                if (inString) {
                    strings.push(currentString);
                    currentString = '';
                    inString = false;
                } else {
                    inString = true;
                }
            } else {
                if (inString) currentString += fullMatch[i];
            }
        }
        
        if (strings.length >= 3) {
            words.push({
                word: strings[0],
                hint: strings[1],
                category: strings[2]
            });
        }
    }
    return words;
}

try {
    const f1 = fs.existsSync('sync_all_words_to_supabase.sql') ? fs.readFileSync('sync_all_words_to_supabase.sql', 'utf8') : '';
    const f2 = fs.existsSync('sync_mamak_standardization.sql') ? fs.readFileSync('sync_mamak_standardization.sql', 'utf8') : '';
    const f3 = fs.existsSync('add_requested_words.sql') ? fs.readFileSync('add_requested_words.sql', 'utf8') : '';

    const w1 = extractValues(f1);
    const w2 = extractValues(f2);
    const w3 = extractValues(f3);

    const allWordsMap = new Map();

    for (const w of [...w1, ...w2, ...w3]) {
        allWordsMap.set(w.word, w);
    }

    const mamaks = [];
    const nonMamaks = [];

    for (const w of allWordsMap.values()) {
        if (w.category === 'مامک' || w.category === 'مەتەڵ' || w.category === 'پەیڤێن نەھێنی') {
            mamaks.push(w);
        } else {
            nonMamaks.push(w);
        }
    }

    const escapeSql = (str) => str ? str.replace(/'/g, "''") : '';

    let nonMamakSql = `-- Sync all non-Mamak words to Supabase\n`;
    nonMamakSql += `-- Total Words: ${nonMamaks.length}\n`;
    nonMamakSql += `TRUNCATE TABLE words;\n\n`;
    nonMamakSql += `INSERT INTO public.words (word, hint, category) VALUES\n`;
    const nonMamakVals = nonMamaks.map(w => `('${escapeSql(w.word)}', '${escapeSql(w.hint)}', '${escapeSql(w.category)}')`);
    nonMamakSql += nonMamakVals.join(',\n') + ';\n';

    fs.writeFileSync('supabase_all_words_no_mamak.sql', nonMamakSql);

    let mamakSql = `-- Sync ALL Mamak words to Supabase\n`;
    mamakSql += `-- Total Mamaks: ${mamaks.length}\n`;
    mamakSql += `INSERT INTO public.words (word, hint, category, mode_tags) VALUES\n`;
    const mamakVals = mamaks.map(w => `('${escapeSql(w.word)}', '${escapeSql(w.hint)}', '${escapeSql(w.category)}', ARRAY['mamak']::text[])`);
    mamakSql += mamakVals.join(',\n') + '\nON CONFLICT (word) DO UPDATE SET hint = EXCLUDED.hint, category = EXCLUDED.category, mode_tags = EXCLUDED.mode_tags;\n';

    fs.writeFileSync('supabase_all_mamaks_only.sql', mamakSql);

    console.log(`Split complete. nonMamaks: ${nonMamaks.length}, mamaks: ${mamaks.length}`);
} catch (e) {
    console.error(e);
}
