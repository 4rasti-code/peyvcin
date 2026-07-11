const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

c = c.replace(
  `const { playSaveSound, playTabSound } = useAudio();`,
  `const { playSaveSound, playTabSound, playVictorySound } = useAudio();`
);

c = c.replace(
  `setClaimingMedal(medal.id);\n      playSaveSound();`,
  `setClaimingMedal(medal.id);\n      if (playVictorySound) playVictorySound();`
);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Fixed sound to playVictorySound!');
