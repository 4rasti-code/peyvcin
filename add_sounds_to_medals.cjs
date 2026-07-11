const fs = require('fs');

let c = fs.readFileSync('src/constants/medals.js', 'utf8');

c = c.replace(`reward: { xp: 100, fils: 100 } }`, `reward: { xp: 100, fils: 100 }, soundName: 'Reward' }`);
c = c.replace(`reward: { xp: 500, derhem: 5 } }`, `reward: { xp: 500, derhem: 5 }, soundName: 'Booster' }`);
c = c.replace(`reward: { xp: 1000, dinar: 1 } }`, `reward: { xp: 1000, dinar: 1 }, soundName: 'Reward' }`);
c = c.replace(`reward: { xp: 2000, dinar: 5 } }`, `reward: { xp: 2000, dinar: 5 }, soundName: 'Message' }`);
c = c.replace(`reward: { xp: 5000, dinar: 10 } }`, `reward: { xp: 5000, dinar: 10 }, soundName: 'StartGame' }`);
c = c.replace(`reward: { xp: 10000, dinar: 20 } }`, `reward: { xp: 10000, dinar: 20 }, soundName: 'Victory' }`);

fs.writeFileSync('src/constants/medals.js', c);
console.log('Added soundNames to medals.js');
