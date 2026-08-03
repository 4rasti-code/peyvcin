const fs = require('fs');
const file = 'd:/Peyvok App/src/components/ProfileView.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('currentXP, level, dailyStreak,', 'currentXP, level, dailyStreak, lastStreakAt,');

let streakLogic = `
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   let isStreakAtRisk = false;
   if (lastStreakAt) {
      const streakDate = new Date(lastStreakAt);
      streakDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - streakDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 1) isStreakAtRisk = true;
   }
`;

code = code.replace('const [isFlagBoxOpen, setIsFlagBoxOpen] = useState(false);', 'const [isFlagBoxOpen, setIsFlagBoxOpen] = useState(false);' + streakLogic);

code = code.replace('{toKuDigits(dailyStreak || 0)}</span>', '{toKuDigits(dailyStreak || 0)} ڕۆژ</span>');

code = code.replace('🔥', '{isStreakAtRisk ? \'⏳\' : \'🔥\'}');

fs.writeFileSync(file, code);
console.log('Updated ProfileView.jsx');
