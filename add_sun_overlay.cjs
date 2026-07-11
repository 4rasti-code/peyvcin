const fs = require('fs');

const sunPaths = [
  "M248,52.5c5.8,15.6,15.7,35,26.2,47L248,90l-26.2,9.5C232.3,87.5,242.2,68.1,248,52.5z",
  "M260.5,54.4c0.9,16.6,4.7,38.1,11.1,52.6l-22.2-16.8l-27.8,1.3C235.2,83.2,250.3,67.6,260.5,54.4z",
  "M271.9,59.9c-4,16.2-6.8,37.8-4.9,53.6l-16.3-22.6L223.8,84C239.2,80,258.3,69.5,271.9,59.9z",
  "M281.2,68.5c-8.6,14.3-17.6,34.1-20.4,49.8l-8.9-26.3l-23.7-14.5C244,78.1,265.4,73.7,281.2,68.5z",
  "M287.5,79.5c-12.4,11.1-26.8,27.4-34.2,41.5l-0.7-27.8l-18.4-20.9C249.2,77.7,270.9,79.8,287.5,79.5z",
  "M290.3,91.8c-15.1,6.9-33.7,18.3-44.9,29.6l7.5-26.8l-11.4-25.4C254.3,78.8,274.3,87.2,290.3,91.8z",
  "M289.4,104.5c-16.5,2.2-37.6,7.5-51.7,15l15-23.4l-3.4-27.6C258.8,81.4,275.5,95.3,289.4,104.5z",
  "M284.8,116.2c-16.4-2.8-38.2-3.9-53.8-0.9l21.3-17.9l4.9-27.4C262.3,85.2,274.1,103.4,284.8,116.2z",
  "M276.9,126.2c-14.9-7.5-35.3-15-51.1-16.7l25.6-10.9l12.7-24.7C264.6,89.8,270.5,110.8,276.9,126.2z",
  "M266.4,133.3c-12-11.6-29.3-24.7-44-31l27.7-2.8l19.5-19.9C265.3,95,264.8,116.7,266.4,133.3z",
  "M254.3,137c-8.1-14.6-20.7-32.3-32.9-42.6l27.3,5.5l24.4-13.3C264.6,100.1,257.7,120.7,254.3,137z",
  "M241.6,137c-3.4-16.3-10.3-36.9-18.9-50.4l24.5,13.3l27.3-5.5C262.3,104.8,249.7,122.4,241.6,137z",
  "M229.5,133.3c1.6-16.6,1.1-38.3-3.2-53.7l19.5,19.9l27.7,2.8C258.8,108.6,241.5,121.7,229.5,133.3z",
  "M219.1,126.2c6.4-15.4,12.3-36.3,12.8-52.3l12.7,24.7l25.6,10.9C254.3,111.2,233.9,118.6,219.1,126.2z",
  "M211.2,116.2c10.6-12.8,22.5-31.1,27.6-46.2l4.9,27.4l21.3,17.9C249.3,112.3,227.6,113.5,211.2,116.2z",
  "M206.5,104.5c13.9-9.1,30.6-23.1,40-36l-3.4,27.6l15,23.4C244.1,112,223,106.6,206.5,104.5z",
  "M205.6,91.8c16-4.6,36.1-13,48.8-22.6L243,94.6l7.5,26.8C239.3,110.1,220.7,98.8,205.6,91.8z",
  "M208.4,79.5c16.7,0.3,38.3-1.8,53.3-7.2l-18.4,20.9l-0.7,27.8C235.2,106.9,220.8,90.6,208.4,79.5z",
  "M214.7,68.5c15.8,5.2,37.1,9.6,53.1,8.9l-23.7,14.6l-8.9,26.3C232.3,102.6,223.3,82.8,214.7,68.5z",
  "M224,59.9c13.6,9.6,32.7,20.1,48.1,24.1l-26.9,6.9l-16.3,22.5C230.8,97.6,228,76.1,224,59.9z",
  "M235.4,54.4c10.1,13.2,25.3,28.8,38.9,37.2l-27.8-1.3L224.3,107C230.8,92.5,234.5,71,235.4,54.4z"
];

let c = fs.readFileSync('src/components/CurrencyIcon.jsx', 'utf8');

// Insert the sunPaths array at the top if not exists
if (!c.includes('const sunPaths =')) {
    c = c.replace('const runes = [', `const sunPaths = ${JSON.stringify(sunPaths)};\n\nconst runes = [`);
}

const newSunCode = `          {/* Animated Sun in Center */}
          <g transform="translate(248, 95) scale(0.6) translate(-248, -95)">
            <Motion.g 
              style={{ transformOrigin: "248px 95px" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              {/* Base Sun */}
              <g fill="#FBBF24" opacity={0.4}>
                 <circle cx="248" cy="95" r="20" />
                 {sunPaths.map((d, i) => <path key={'sun'+i} d={d} />)}
              </g>
              {/* Glowing Sun Syncing with God of War Pulse */}
              <Motion.g 
                fill="#FDE047" 
                style={{ filter: "drop-shadow(0 0 15px #FDE047) drop-shadow(0 0 5px #FFFFFF)" }}
                animate={{ opacity: [0, 0, 1, 0, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.40, 0.50, 0.65, 1] }}
              >
                 <circle cx="248" cy="95" r="20" />
                 {sunPaths.map((d, i) => <path key={'glow'+i} d={d} />)}
              </Motion.g>
            </Motion.g>
          </g>

          {/* God of War: Sequentially Glowing Runes */}`;

c = c.replace('{/* God of War: Sequentially Glowing Runes */}', newSunCode);

// Update version string again
c = c.replace('/icons/Pahlawan.svg?v=5', '/icons/Pahlawan.svg?v=6');

fs.writeFileSync('src/components/CurrencyIcon.jsx', c);
console.log('Added rotating glowing sun to overlay.');
