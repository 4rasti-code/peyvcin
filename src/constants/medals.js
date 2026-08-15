import {
  Level10Icon,
  PahlawanIcon,
  SharezaCompassIcon,
  MamostaBookIcon,
  KurdishShieldIcon,
  KingOfTheLettersIcon
} from '../components/CurrencyIcon';

export const MEDALS = [
  { id: 'nobera', name: 'سەرەتایی', condition: (d) => (d.level || 1) >= 10, color: 'text-amber-500', glow: '', IconComponent: Level10Icon, tooltip: 'ئاستێ ١٠ ب دەستڤە بینە', rewardAmount: 500 },
  { id: 'palawan', name: 'پەهلەوان', condition: (d) => (d.games_won || 0) >= 100, color: 'text-red-500', glow: '', IconComponent: PahlawanIcon, tooltip: '١٠٠ یارییان ببە دا ببیە پەهلەوان!', rewardAmount: 2000 },
  { id: 'expert', name: 'شارەزا', condition: (d) => (d.level || 1) >= 50, color: 'text-cyan-400', glow: '', IconComponent: SharezaCompassIcon, tooltip: 'ئاستێ ٥٠ ب دەستڤە بینە', rewardAmount: 1500 },
  { id: 'mamosta', name: 'مامۆستا', condition: (d) => (d.daily_streak || 0) >= 200, color: 'text-yellow-400', glow: '', IconComponent: MamostaBookIcon, tooltip: 'زنجیرەیا ڕۆژانە بگەهینە ٢٠٠ ڕۆژان', rewardAmount: 5000 },
  { id: 'shanazi_kurdistan', name: 'شانازیا کوردستانێ', condition: (d) => (d.total_words_found || 0) >= 1000, color: 'text-emerald-500', glow: '', IconComponent: KurdishShieldIcon, tooltip: '١٠٠٠ پەیڤێن کوردی دیتین', rewardAmount: 3000 },
  { id: 'shanazi_jihani', name: 'شاهێ پەیڤان', condition: (d) => (d.flawless_wins || 0) >= 1000, color: 'text-purple-400', glow: '', IconComponent: KingOfTheLettersIcon, tooltip: '١٠٠٠ پەیڤان بێی هاریکاری بینە', rewardAmount: 10000 },
];
