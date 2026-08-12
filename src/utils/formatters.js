/**
 * Returns a YYYY-MM-DD string in the user's local timezone.
 * Avoids UTC boundary issues.
 * @param {Date} date - Optional date object, defaults to now.
 */
export const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if comparisonDateStr (YYYY-MM-DD) was the calendar day immediately preceding relativeToDate.
 */
export const isYesterday = (comparisonDateStr, relativeToDate = new Date()) => {
  if (!comparisonDateStr) return false;
  
  const yesterday = new Date(relativeToDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  return comparisonDateStr === yesterdayStr;
};

/**
 * Converts English digits (0-9) to Kurdish/Eastern Arabic digits (٠-٩).
 */
export const toKuDigits = (val) => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  return str.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};

/**
 * Formats large numbers compactly (e.g., 1500 -> ١.٥K, 1200000 -> ١.٢M).
 */
export const formatCompactNumber = (val) => {
  if (val === undefined || val === null) return '';
  const num = Number(val);
  if (isNaN(num)) return toKuDigits(val);
  
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(1).replace(/\.0$/, '').replace('.', '،');
    return toKuDigits(formatted) + ' م';
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1).replace(/\.0$/, '').replace('.', '،');
    return toKuDigits(formatted) + ' هـ';
  }
  return toKuDigits(num);
};

/**
 * Detects whether the provided nickname uses Kurdish/Arabic script or English/Latin.
 * Returns 'kurdish' if it contains Kurdish/Arabic characters, otherwise 'english'.
 */
export const detectNameLanguage = (nickname) => {
  if (!nickname) return 'kurdish'; // Default
  const kurdishArabicRegex = /[\u0600-\u06FF]/;
  return kurdishArabicRegex.test(nickname) ? 'kurdish' : 'english';
};
