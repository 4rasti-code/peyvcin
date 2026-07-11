const fs = require('fs');
const svg = fs.readFileSync('public/icons/king_of_the_letters.svg', 'utf8');

const colors = new Set([...svg.matchAll(/fill=\"(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}))\"/g)].map(m => m[1].toLowerCase()));
console.log('Fill Colors:', Array.from(colors));

const strokes = new Set([...svg.matchAll(/stroke=\"(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}))\"/g)].map(m => m[1].toLowerCase()));
console.log('Stroke Colors:', Array.from(strokes));
