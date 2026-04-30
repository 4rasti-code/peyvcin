import { useState, useEffect } from 'react';

export default function useThemeDetector() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Check initial system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkTheme(mediaQuery.matches);

    // Listen for real-time changes
    const handler = (e) => setIsDarkTheme(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDarkTheme;
}
