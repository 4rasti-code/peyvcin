const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

if (!c.includes('import RewardClaimAnimation')) {
  c = c.replace(
    `import { MEDALS } from '../constants/medals';`,
    `import { MEDALS } from '../constants/medals';\nimport RewardClaimAnimation from './RewardClaimAnimation';`
  );
}

const renderComponent = `
         {/* Reward Claim Cinematic Popup */}
         {claimingMedal && (
           <RewardClaimAnimation
             medal={MEDALS.find(m => m.id === claimingMedal)}
             onClose={() => setClaimingMedal(null)}
           />
         )}
`;

if (!c.includes('RewardClaimAnimation medal={MEDALS')) {
  c = c.replace(
    `{/* Friends Modal Inline`,
    renderComponent + `\n         {/* Friends Modal Inline`
  );
}

// Ensure the claimingMedal timeout is 4000ms instead of 2500ms to match the animation length
c = c.replace(
  `setTimeout(() => setClaimingMedal(null), 2500);`,
  `setTimeout(() => setClaimingMedal(null), 4000);`
);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Successfully injected RewardClaimAnimation!');
