const fs = require('fs');
let file = 'src/components/PublicProfileModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the block modal
let startIndex = content.indexOf('Block Confirmation Modal');
if (startIndex !== -1) {
    let endIndex = content.indexOf('</AnimatePresence>', startIndex);
    console.log(content.substring(startIndex, endIndex + 20));
} else {
    // maybe just search for 'بلۆک'
    let blockIndex = content.indexOf('بلۆک');
    if (blockIndex !== -1) {
        console.log(content.substring(blockIndex - 300, blockIndex + 300));
    }
}
