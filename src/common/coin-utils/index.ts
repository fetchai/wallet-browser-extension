import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import {
  getCurrencyFromDenom,
  getCurrencyFromMinimalDenom,
  isMinimalDenomOfCurrency
} from "../currency";
// @ts-ignore
import { Currency } from "../../chain-info";

export class CoinUtils {

  /**
   *
   * @param coins
   * @param denom
   */
  static amountOf(coins: Coin[], denom: string): Int {
    const coin = coins.find(coin => {
      return coin.denom === denom;
    });

    if (!coin) {
      return new Int(0);
    } else {
      return coin.amount;
    }
  }

  static exclude(coins: Coin[], demons: string[]): Coin[] {
    return coins.filter(coin => {
      return demons.indexOf(coin.denom) === 0;
    });
  }

  /**
   * converts amount of currency in minimal denom to amount in regular denom
   *
   * @param currency
   * @param amount
   */

  static convertMinimalDenomAmountToDenomAmount(
    currency: Currency,
    amount: Int
  ) {
    if (currency.coinDecimals === 0) return amount;
    if (currency.coinMinimalDenom === currency.coinDenom) return amount;
    // no power method in this , but this is workaround.
    const multiplier = "1" + "0".repeat(currency.coinDecimals);
    const r = amount.div(new Int(multiplier));
    debugger;
    return r;
  }

  /**
   * Takes an array of coins and looks at each to see if they are consisting of the minimal denom of another currency eg
   * if we have 20000000 ufet we convert to 20 fet if decimal points are 6 (specified in the Configs).
   *
   * @param coins
   */

  static convertCoinsFromMinimalDenomAmount(coins: Coin[]): Coin[] {
    coins = coins.map(coin => {
      if (isMinimalDenomOfCurrency(coin)) {
        const curr = getCurrencyFromMinimalDenom(coin.denom) as Currency;
        const amount = CoinUtils.convertMinimalDenomAmountToDenomAmount(
          curr,
          coin.amount
        );

        return new Coin(curr.coinDenom, amount);
      }
      return coin;
    });
    return coins;
  }
  static getCoinFromDecimals(decAmountStr: string, denom: string): Coin {

    const currency = getCurrencyFromDenom(denom);
    if (!currency) {
      throw new Error("Invalid currency");
    }
    let precision = new Dec(1);
    for (let i = 0; i < currency.coinDecimals; i++) {
      precision = precision.mul(new Dec(10));
    }
    let decAmount = new Dec(decAmountStr);
    // decAmount = decAmount.mul(precision);

    if (!new Dec(decAmount.truncate()).equals(decAmount)) {
      throw new Error("Can't divide anymore");
    }

    return new Coin(currency.coinMinimalDenom, decAmount.truncate());
  }

  static parseDecAndDenomFromCoin(
    coin: Coin
  ): { amount: string; denom: string } {
    const currency = getCurrencyFromMinimalDenom(coin.denom);
    if (!currency) {
      throw new Error("Invalid currency");
    }

    const precision = new Dec(1);
    // This is the logic for when we wish to send by minimal denom as when we used ufet in testnet before
    // for (let i = 0; i < currency.coinDecimals; i++) {
    //   precision = precision.mul(new Dec(10));
    // }

    const decAmount = new Dec(coin.amount).quoTruncate(precision);
    return {
      amount: decAmount.toString(currency.coinDecimals),
      denom: currency.coinDenom
    };
  }

  static shrinkDecimals(
    amount: Int,
    baseDecimals: number,
    minDecimals: number,
    maxDecimals: number
  ): string {
    if (amount.equals(new Int(0))) {
      return "0";
    }

    const dec = new Dec(amount, baseDecimals);

    const integer = dec.truncate();
    const fraction = dec.sub(new Dec(integer));

    const decimals = Math.max(
      maxDecimals - integer.toString().length + 1,
      minDecimals
    );

    const fractionStr = fraction.toString(decimals).replace("0.", "");

    // Get dot from locale
    const dot = (1.1).toLocaleString()[1];

    return (
      parseInt(integer.toString()).toLocaleString() +
      (fractionStr.length > 0 ? dot : "") +
      fractionStr
    );
  }
}
