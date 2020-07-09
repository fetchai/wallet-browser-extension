export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice = "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min
export const VERSION = "1.0.0";
export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec
export const ETHEREUM_CHAIN_ID = 4;
export const TOKEN_CONTRACT = "0x1d287cc25dad7ccaf76a26bc660c5f7c8e2a05bd";
// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  "https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341";
export const REQUIRED_COSMOS_APP_VERSION = "1.5.0";
// Your web app's Firebase configuration
export const FIREBASECONFIG = {
  apiKey: "AIzaSyDxsMYel6B8PyYWgu4Nd5lZTvbECxaGacU",
  authDomain: "fetch-ai-cosmos-browser-wallet.firebaseapp.com",
  databaseURL: "https://fetch-ai-cosmos-browser-wallet.firebaseio.com",
  projectId: "fetch-ai-cosmos-browser-wallet",
  storageBucket: "fetch-ai-cosmos-browser-wallet.appspot.com",
  messagingSenderId: "744757859479",
  appId: "1:744757859479:web:1cb990c1cdbe693c1505d2",
  measurementId: "G-YWPW90K60D"
};

/**
 * Since we have been running it against changing versions of cosmos sdk this allows us to quickly move between 37 and 38.
 */

export const COSMOS_SDK_VERSION = 38;
