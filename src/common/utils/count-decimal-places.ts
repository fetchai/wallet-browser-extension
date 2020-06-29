/**
 *
 * taken from top answer https://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
 * @param num
 */
export function countDecimalPlaces(num: string): number {
  const match = num.match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
    return 0;
  }
  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) -
      // Adjust for scientific notation.
      (match[2] ? +match[2] : 0)
  );
}
