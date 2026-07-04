const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let formEnd = content.indexOf('</form>');
let oldSocialStart = content.indexOf('<div className="mt-4">', formEnd);
let oldSocialEnd = content.indexOf('</>', oldSocialStart);

if (oldSocialStart > 0 && oldSocialEnd > oldSocialStart) {
    let oldBlock = content.substring(oldSocialStart, oldSocialEnd);
    content = content.replace(oldBlock, "                                </div>\n                                )}\n                            ");
    fs.writeFileSync(file, content, 'utf8');
    console.log("Old social block removed successfully!");
} else {
    console.log("Could not find boundaries", {oldSocialStart, oldSocialEnd});
}
