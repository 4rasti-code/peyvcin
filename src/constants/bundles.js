export const BUNDLES = {
  'default': {
    id: 'default',
    name: 'ئاسایی',
    price: 0,
    currency: 'fils',
    textStyle: 'text-mono-900 dark:text-mono-50', // Default text style will be handled by Leaderboard specific logic (Rank 1/2/3 colors) if this is 'default', but this is a generic fallback
    cardBg: '', 
    avatarRing: 'border-mono-200 dark:border-white/10', // Default leaderboard ring
    fontKurdish: '',
    fontEnglish: '',
    previewTextStyle: 'text-mono-900 dark:text-mono-50',
  },
  'neon-purple': {
    id: 'neon-purple',
    name: 'مۆرا گەش',
    price: 250,
    currency: 'dinar',
    // Yellow to Cyan gradient text (always). Uses custom CSS .neon-purple-text for multiple backgrounds (dark pill + text gradient) and LED glow.
    textStyle: 'neon-purple-text font-black tracking-wider inline-block',
    previewTextStyle: 'neon-purple-text font-black tracking-wider inline-block',
    // Deep purple linear gradient background (matching the user's reference)
    cardBg: 'bg-gradient-to-br from-[#581c87] via-[#3b0764] to-[#1e1b4b] border border-[#d946ef]/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]',
    // Bright pink/fuchsia glowing ring for the avatar
    avatarRing: 'border-2 border-[#d946ef] shadow-[0_0_10px_#d946ef]',
    // Font stack handles both English (Bangers) and Kurdish (Rabar_013) gracefully via CSS fallback
    fontKurdish: 'font-neon-bundle', // Bold kurdish font
    fontEnglish: 'font-black uppercase'
  }
};
