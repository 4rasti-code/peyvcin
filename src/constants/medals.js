import { 
  Level10Icon, 
  KawaHammerIcon, 
  ExpertDiamondIcon, 
  GraduationCapIcon, 
  KurdishShieldIcon, 
  GlobeIcon 
} from '../components/CurrencyIcon';

export const MEDALS = [
  { id: 'nobera', name: 'سەرەتایی', condition: (d) => (d.level || 1) >= 10, color: 'text-amber-500', glow: '', IconComponent: Level10Icon, tooltip: 'ئاستێ ١٠ ب دەستڤە بینە' },
  { id: 'palawan', name: 'پەهلەوان', condition: (d) => (d.games_won || 0) >= 100, color: 'text-red-500', glow: '', IconComponent: KawaHammerIcon, tooltip: '١٠٠ یارییان ببە دا ببیە پەهلەوان!' },
  { id: 'expert', name: 'شارەزا', condition: (d) => (d.level || 1) >= 50, color: 'text-cyan-400', glow: '', IconComponent: ExpertDiamondIcon, tooltip: 'ئاستێ ٥٠ ب دەستڤە بینە' },
  { id: 'mamosta', name: 'مامۆستا', condition: (d) => (d.daily_streak || 0) >= 200, color: 'text-yellow-400', glow: '', IconComponent: GraduationCapIcon, tooltip: 'زنجیرەیا ڕۆژانە بگەهینە ٢٠٠ ڕۆژان' },
  { id: 'shanazi_kurdistan', name: 'شانازیا کوردستانی', condition: (d) => (d.kurdish_words_completed || 0) >= 1000, color: 'text-emerald-500', glow: '', IconComponent: KurdishShieldIcon, tooltip: '١٠٠٠ پەیڤێن کوردی دیتین' },
  { id: 'shanazi_jihani', name: 'شانازیا جیهانی', condition: (d) => (d.words_without_hints || 0) >= 1000, color: 'text-purple-400', glow: '', IconComponent: GlobeIcon, tooltip: '١٠٠٠ پەیڤان بێی هاریکاری بینە' },
];
