export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice = "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min
// ensure that this version is same as manifest version
export const VERSION = "1.0.0";
export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec
export const ETHEREUM_CHAIN_ID = 4;
export const TOKEN_CONTRACT = "0x1d287cc25dad7ccaf76a26bc660c5f7c8e2a05bd"
// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  "https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341";
export const REQUIRED_COSMOS_APP_VERSION = "1.5.0";


/**
 * Since we have been running it against changing versions of cosmos sdk this allows us to quickly move between 37 and 38.
 */

export const COSMOS_SDK_VERSION = 38;


