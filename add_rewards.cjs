const fs = require('fs');

let c = fs.readFileSync('src/constants/medals.js', 'utf8');

const newMedals = `export const MEDALS = [
  { id: 'nobera', name: 'سەرەتایی', condition: (d) => (d.level || 1) >= 10, color: 'text-slate-300', glow: '', IconComponent: Level10Icon, tooltip: 'ئاستێ ١٠ ب دەستڤە بینە', reward: { xp: 100, fils: 100 } },
  { id: 'palawan', name: 'پەهلەوان', condition: (d) => (d.games_won || 0) >= 100, color: 'text-yellow-400', glow: '', IconComponent: PahlawanIcon, tooltip: '١٠٠ یارییان ببە دا ببیە پەهلەوان!', reward: { xp: 500, derhem: 5 } },
  { id: 'expert', name: 'شارەزا', condition: (d) => (d.level || 1) >= 50, color: 'text-emerald-400', glow: '', IconComponent: SharezaCompassIcon, tooltip: 'ئاستێ ٥٠ ب دەستڤە بینە', reward: { xp: 1000, dinar: 1 } },
  { id: 'mamosta', name: 'مامۆستا', condition: (d) => (d.daily_streak || 0) >= 200, color: 'text-cyan-400', glow: '', IconComponent: MamostaBookIcon, tooltip: 'زنجیرەیا ڕۆژانە بگەهینە ٢٠٠ ڕۆژان', reward: { xp: 2000, dinar: 5 } },
  { id: 'shanazi_kurdistan', name: 'شانازیا کوردستانێ', condition: (d) => (d.kurdish_words_completed || 0) >= 1000, color: 'text-red-500', glow: '', IconComponent: KurdishShieldIcon, tooltip: '١٠٠٠ پەیڤێن کوردی دیتین', reward: { xp: 5000, dinar: 10 } },
  { id: 'shanazi_jihani', name: 'شاهێ پەیڤان', condition: (d) => (d.words_without_hints || 0) >= 1000, color: 'text-purple-400', glow: '', IconComponent: GlobeIcon, tooltip: '١٠٠٠ پەیڤان بێی هاریکاری بینە', reward: { xp: 10000, dinar: 20 } },
];`;

c = c.replace(/export const MEDALS = \[[\s\S]*?\];/, newMedals);

fs.writeFileSync('src/constants/medals.js', c);
console.log('Added rewards to medals.js');
