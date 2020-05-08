import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import {
  Bech32Config,
  defaultBech32Config
} from "@everett-protocol/cosmosjs/core/bech32Config";

export interface Currency {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  /**
   * This is used to stakech asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  coinGeckoId?: string;

}

/**
 * Currencis include the currency information for matched coin.
 *
 * Note: do not allow two coins with Minimal denom of same name.
 */
export const Currencies: {
  readonly [currency: string]: Currency;
} = {
  stake: {
    coinDenom: "stake",
    coinMinimalDenom: "ustake",
    coinDecimals: 6,
    coinGeckoId: "fetch-ai"
  },
  testers: {
    coinDenom: "testers",
    coinMinimalDenom: "testers",
    coinDecimals: 0
  }
};

export interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly nativeCurrency: string;
  readonly walletUrl: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly bech32Config: Bech32Config;
  readonly currencies: string[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: string[];
  /**
   * This is the coin type in slip-044.
   * This is used for fetching address from ENS if this field is set.
   */
  readonly coinType?: number;
}

export const NativeChainInfos: ChainInfo[] = [
  {
    rpc: "http://0.0.0.0:26657",
    rest: "http://0.0.0.0:1317",
    chainId: "gaiadrb-sandbox",
    chainName: "gaiadrb-sandbox",
    nativeCurrency: "stake",
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://127.0.0.1:1317/#/cosmoshub-3",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub-3"
        : "http://127.0.0.1:1317/#/cosmoshub-3",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["stake"],
    feeCurrencies: ["stake"],
    coinType: 118
  }
];

export interface AccessOrigin {
  chainId: string;
  origins: string[];
}

/**
 * This declares which origins can access extension without explicit approval.
 */
export const ExtensionAccessOrigins: AccessOrigin[] = [
  {
    chainId: "gaiadrb-sandbox",
    origins:
      process.env.NODE_ENV === "production"
        ? ["https://wallet.keplr.app"]
        : ["http://localhost:8081"]
  }
];
