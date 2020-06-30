// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import removeTrailingZeros from "remove-trailing-zeros";

/**
 * For converting from minimal denom to  denom.
 *
 * We do the calculation as a string just moving the decimal point into the string at the right spot and padding the string if required.
 *
 * we then remove any trailing zeros
 *
 * @param amount
 * @param decimals
 */

export const divideByDecimals = (amount: string, decimals: number) : string => {
  // padd to length if short of single actual fet
  amount = amount.padStart(decimals + 1, "0");
  // insert the decimal at the correct position
  const output = [
    amount.slice(0, -decimals),
    ".",
    amount.slice(-decimals)
  ].join("");

  return removeTrailingZeros(output) as string;
};
