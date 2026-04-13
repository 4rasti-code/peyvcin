/**
 * Converts English digits (0-9) to Kurdish/Eastern Arabic digits (٠-٩).
 * This ensures consistency across browsers that may not support the 'ku-IQ' locale correctly.
 * @param {number|string} val - The number or string to convert.
 * @returns {string} - The converted string with Kurdish digits.
 */
export const toKuDigits = (val) => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  return str.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};
