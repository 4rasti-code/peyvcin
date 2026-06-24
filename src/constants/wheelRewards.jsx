import { FilsIcon, HintIcon, MagnetIcon, DerhemIcon, SkipIcon, DinarIcon } from '../components/CurrencyIcon';
import MysteryBoxIcon from '../components/MysteryBoxIcon';

export const WHEEL_REWARDS = [
  { id: 0, type: 'fils', amount: 50, label: '٥٠', winnable: true, weight: 100, color: '#0EA5E9', Icon: FilsIcon, size: 9 },
  { id: 1, type: 'mystery_box', amount: 1, label: 'سندۆق', winnable: true, weight: 2, color: '#8B5CF6', Icon: MysteryBoxIcon, size: 13 },
  { id: 2, type: 'skip', amount: 1, label: '١', winnable: false, weight: 0, color: '#F97316', Icon: SkipIcon, size: 9 },
  { id: 3, type: 'fils', amount: 100, label: '١٠٠', winnable: true, weight: 70, color: '#10B981', Icon: FilsIcon, size: 9 },
  { id: 4, type: 'dinar', amount: 1, label: '١', winnable: false, weight: 0, color: '#6366F1', Icon: DinarIcon, size: 9 },
  { id: 5, type: 'magnet', amount: 1, label: '١', winnable: true, weight: 20, color: '#84CC16', Icon: MagnetIcon, size: 9 },
  { id: 6, type: 'fils', amount: 150, label: '١٥٠', winnable: true, weight: 50, color: '#A855F7', Icon: FilsIcon, size: 9 },
  { id: 7, type: 'mystery_box', amount: 1, label: 'سندۆق', winnable: true, weight: 2, color: '#06B6D4', Icon: MysteryBoxIcon, size: 13 },
  { id: 8, type: 'derhem', amount: 5, label: '٥', winnable: false, weight: 0, color: '#EF4444', Icon: DerhemIcon, size: 9 },
  { id: 9, type: 'fils', amount: 200, label: '٢٠٠', winnable: true, weight: 30, color: '#D946EF', Icon: FilsIcon, size: 9 },
  { id: 10, type: 'hint', amount: 1, label: '١', winnable: true, weight: 30, color: '#3B82F6', Icon: HintIcon, size: 9 },
  { id: 11, type: 'magnet', amount: 2, label: '٢', winnable: true, weight: 5, color: '#F59E0B', Icon: MagnetIcon, size: 9 },
  { id: 12, type: 'fils', amount: 250, label: '٢٥٠', winnable: true, weight: 15, color: '#14B8A6', Icon: FilsIcon, size: 9 },
  { id: 13, type: 'mystery_box', amount: 1, label: 'سندۆق', winnable: true, weight: 2, color: '#F43F5E', Icon: MysteryBoxIcon, size: 13 },
];
