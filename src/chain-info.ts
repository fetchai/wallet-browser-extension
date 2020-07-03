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
  testfet: {
    coinDenom: "testfet",
    coinMinimalDenom: "atestfet",
    coinDecimals: 18,
    coinGeckoId: "fetch-ai"
  }
};

/**
 * Currently just put an array of endpoints in this variable, and
 * this is used for drop down for users to select from different endpoints,
 *
 *
 * The default endpoint selects which of these endpoints is the default one if user doesn't change things in settings.
 */

export interface EndpointData {
  readonly rpc: string;
  readonly name: string;
  readonly rest: string;
  readonly chainId: string;
}

export interface ChainInfo {
  readonly endpoints: Array<EndpointData>;
  readonly defaultEndpoint: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly nativeCurrency: string;
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

/**
 * ensure default endpoint is name of one of endpoints
 */
export const NativeChainInfos: ChainInfo[] = [
  {
    endpoints: [
      {
        name: "agent-land-sandbox",
        rpc: "http://rpc-agent-land.sandbox.fetch-ai.com:26657",
        rest: "http://rest-agent-land.sandbox.fetch-ai.com:1317",
        chainId: "agent-land"
      },
      {
        name: "agent-land",
        rpc: " https://rpc-agent-land.prod.fetch-ai.com:443",
        rest: " https://rest-agent-land.prod.fetch-ai.com:443",
        chainId: "agent-land"
      }
    ],
    defaultEndpoint: "agent-land",
    nativeCurrency: "testfet",
    bip44: new BIP44(44, 118, 0),
    bech32Config: defaultBech32Config("cosmos"),
    currencies: ["testfet"],
    feeCurrencies: ["testfet"],
    coinType: 118
  }
];
