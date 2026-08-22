const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
    const fileStream = fs.createReadStream('C:\\Users\\RYZEN5950X\\.gemini\\antigravity-ide\\brain\\fef128af-59c5-408f-ad64-4b6fd5e0e5ab\\.system_generated\\logs\\transcript_full.jsonl');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let content = "";
    let replaces = [];

    for await (const line of rl) {
        try {
            const obj = JSON.parse(line);
            if (obj.type === 'PLANNER_RESPONSE' && obj.tool_calls) {
                for (const call of obj.tool_calls) {
                    if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('HowToPlayModal.jsx')) {
                        content = call.args.CodeContent;
                        replaces = [];
                    } else if (call.name === 'replace_file_content' && call.args && call.args.TargetFile && call.args.TargetFile.includes('HowToPlayModal.jsx')) {
                        replaces.push({
                            target: call.args.TargetContent,
                            replacement: call.args.ReplacementContent
                        });
                    } else if (call.name === 'multi_replace_file_content' && call.args && call.args.TargetFile && call.args.TargetFile.includes('HowToPlayModal.jsx')) {
                        for (const chunk of call.args.ReplacementChunks) {
                            replaces.push({
                                target: chunk.TargetContent,
                                replacement: chunk.ReplacementContent
                            });
                        }
                    }
                }
            }
        } catch (e) { }
    }

    // Apply replaces
    for (const r of replaces) {
        if (content.includes(r.target)) {
            content = content.replace(r.target, r.replacement);
        } else {
            console.log('Target not found (multi):', r.target.substring(0, 50));
        }
    }

    fs.writeFileSync('d:/Peyvok_App/src/components/HowToPlayModal_recovered3.jsx', content);
    console.log('Recovered file with length:', content.length);
}

processLineByLine();
