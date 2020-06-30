/**
 *
 * used to produce formated dollar amount  for display with fees.
 *
 * @param s
 */

export const formatDollarString = (s: string) => {
  if (parseFloat(s) < 0.01) return "< $.01";

  return (
    "$" +
    parseFloat(s)
      .toFixed(2)
      .toLocaleString()
  );
};
