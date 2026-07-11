const fs = require('fs');

let svg = fs.readFileSync('public/icons/Pahlawan.svg', 'utf8');

// Find the <g> that contains the st14 circle and the group of paths
// 		<circle class="st14" cx="248" cy="95" r="20"/>
// 		<g>
// 			<g>
// 				<g>
// 					<path class="st14" d="M248,52.5...

const sunStart = svg.indexOf('<circle class="st14" cx="248" cy="95" r="20"/>');
const afterSunStart = svg.substring(sunStart);
// The sun is enclosed in a <g> right after the circle.
// Let's find the closing </g> for the paths group.
// It looks like:
// 			<g>
// 				<g>
// 					<path class="st14" d="M235.4,54.4c10.1,13.2,25.3,28.8,38.9,37.2l-27.8-1.3L224.3,107C230.8,92.5,234.5,71,235.4,54.4z"/>
// 				</g>
// 			</g>
// 		</g>

// A safer way is to just grab everything from <circle class="st14" down to the last path's </g></g></g>.

const match = svg.match(/(<circle class="st14".*?<\/g>\s*<\/g>\s*<\/g>\s*<\/g>)/s);

if (match) {
    fs.writeFileSync('extracted_sun.txt', match[1]);
    let newSvg = svg.replace(match[1], ''); // remove from svg
    fs.writeFileSync('public/icons/Pahlawan.svg', newSvg);
    console.log('Sun extracted and removed from SVG.');
} else {
    console.log('Could not match sun.');
}
