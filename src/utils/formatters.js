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
