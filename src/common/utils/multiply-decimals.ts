import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

/**
 * This takes a number and moves the decimal rightwards by decimals param number of places.
 *
 * @param amount
 * @param decimals
 */
export const multiplybyDecimals = (amount: Dec, decimals: number): Dec => {
  let precision = new Dec(1);
  for (let i = 0; i < decimals; i++) {
    precision = precision.mul(new Dec(10));
  }
  return amount.mul(precision);
};

