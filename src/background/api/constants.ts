const AUTH_REST_API_PATH = "/auth/accounts/";
const BALANCE_REST_API_PATH = "/bank/balances/";
const STATUS_RPC_API_PATH = "/status";
const NODE_INFO_REST_API_PATH = "/node_info";
const PUBLIC_KEY_TYPE = "tendermint/PubKeySecp256k1";
const QUERY_TYPE = "cosmos-sdk/Account";
const ROUTE = "api";
const STATUS_ERROR = "HTTP status code doesn't equal 200";
const REGISTER_CUSTOM_ENDPOINT_URL_ERROR_RPC_ID =
  "settings.custom.endpoint.url.error.rpc";
const REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_ID =
  "settings.custom.endpoint.url.error.rest";
const REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_AND_RPC_ID =
  "settings.custom.endpoint.url.error.rest-and-rpc";

export {
  STATUS_ERROR,
  NODE_INFO_REST_API_PATH,
  REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_AND_RPC_ID,
  REGISTER_CUSTOM_ENDPOINT_URL_ERROR_RPC_ID,
  REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_ID,
  STATUS_RPC_API_PATH,
  AUTH_REST_API_PATH,
  BALANCE_REST_API_PATH,
  PUBLIC_KEY_TYPE,
  QUERY_TYPE,
  ROUTE
};
