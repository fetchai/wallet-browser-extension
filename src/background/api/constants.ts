const AUTH_REST_API_PATH = "/auth/accounts/";
const BALANCE_REST_API_PATH = "/bank/balances/";
const STATUS_RPC_API_PATH = "/status";
const PUBLIC_KEY_TYPE = "tendermint/PubKeySecp256k1";
const QUERY_TYPE = "cosmos-sdk/Account";
const ROUTE = "api";
const STATUS_ERROR = "HTTP status code doesn't equal 200";
const MALFORMED_RESPONSE = "malformed response";

export {
  MALFORMED_RESPONSE,
  STATUS_RPC_API_PATH,
  AUTH_REST_API_PATH,
  BALANCE_REST_API_PATH,
  PUBLIC_KEY_TYPE,
  QUERY_TYPE,
  ROUTE,
  STATUS_ERROR
};
