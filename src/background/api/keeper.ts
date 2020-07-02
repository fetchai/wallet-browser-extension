import Axios, { AxiosRequestConfig, AxiosResponse, CancelToken } from "axios";
import { AccountData, BaseAccountConstructor } from "./types";
import {
  AUTH_REST_API_PATH,
  BALANCE_REST_API_PATH,
  NODE_INFO_REST_API_PATH,
  PUBLIC_KEY_TYPE,
  QUERY_TYPE,
  REGISTER_CUSTOM_ENDPOINT_URL_ERROR_RPC_ID,
  STATUS_ERROR,
  STATUS_RPC_API_PATH
} from "./constants";

/**
 * since we cannot serialize and deserialize a Coin object to send between threads we send the params and construct the Coin from this
 * on the non-background thread.
 */

export interface CoinParams {
  denom: string;
  amount: string;
}

export class APIKeeper {
  /**
   * Gets the chain id of a network via the rpc status endpoint
   *
   * either throws an error or else the chain id is returned
   *
   * @param rpc
   */
  static async getChainId(rpc: string): Promise<string> {
    const url = `${rpc}${STATUS_RPC_API_PATH}`;
    let error = false;
    let resp;
    try {
      resp = await Axios.get(url, {});
    } catch (err) {
      error = true;
    }

    if (
      error ||
      (resp as AxiosResponse).status !== 200 ||
      !resp?.data?.result?.node_info?.network
    ) {
      throw new Error(REGISTER_CUSTOM_ENDPOINT_URL_ERROR_RPC_ID);
    }

    return resp.data.result.node_info.network;
  }

  /**
   * We check that the rest url is online by looking for any response but 500
   *
   * returns boolean
   *
   * @param rpc
   */
  static async isRestURLOnline(rest: string): Promise<boolean> {
    const url = `${rest}${NODE_INFO_REST_API_PATH}`;
    let error = false;
    let resp;
    try {
      resp = await Axios.get(url);
    } catch (err) {
      error = true;
    }

    if (error || (resp as AxiosResponse).status === 500) {
      return false;
    }
    return true;
  }

  /**
   * Gets balance of an account
   *
   * @param rpc
   * @param bech32Address
   * @param cancelToken
   */
  static async getBalance(
    rest: string,
    bech32Address: string,
    cancelToken: CancelToken | null = null
  ): Promise<CoinParams[]> {
    const url = `${rest}${BALANCE_REST_API_PATH}${bech32Address}`;
    const coins: CoinParams[] = [];

    const config: AxiosRequestConfig = {};

    if (cancelToken !== null) {
      config.cancelToken = cancelToken;
    }

    const resp = await Axios.get(url, config);
    if (resp.status !== 200) {
      throw new Error(STATUS_ERROR);
    }

    resp.data.result.forEach((el: any) => {
      coins.push({ denom: el.denom, amount: el.amount.toString() });
    });

    return coins;
  }

  static async getAccount(
    rest: string,
    bech32Address: string,
    cancelToken: CancelToken | null = null
  ): Promise<AccountData> {
    const url = `${rest}${AUTH_REST_API_PATH}${bech32Address}`;

    const config: AxiosRequestConfig = {};

    if (cancelToken !== null) {
      config.cancelToken = cancelToken;
    }

    const resp = (await Axios.get(url, config)) as {
      status: number;
      data: {
        result: {
          value: AccountData;
        };
      };
    };

    if (resp.status !== 200) {
      throw new Error(STATUS_ERROR);
    }

    return resp.data.result.value;
  }

  /**
   *  Same contract as method of cosmosjs of same name,  which did not work
   *  with fetch.ai testnet, because path it relied on "custom/acc/account" does not exist on
   *  our testnet.
   *
   */
  static async queryAccount(
    rest: string,
    bech32Address: string
    // walletProvider: WalletProvider,
    // context: Context
  ): Promise<BaseAccountConstructor> {
    // const keys = await walletProvider.getKeys(context);
    // const bech32Address = keys[0].bech32Address;

    const [balance, account] = await Promise.all([
      APIKeeper.getBalance(rest, bech32Address),
      APIKeeper.getAccount(rest, bech32Address)
    ]).catch(error => {
      throw new Error(error.message);
    });

    // We take data from the above two api requests and use it to
    // make the object used to construct
    const base: any = {};
    base.type = QUERY_TYPE;

    const coins: {
      denom: string;
      amount: string;
    }[] = [];

    balance.forEach((coin: CoinParams) => {
      coins.push({ denom: coin.denom, amount: coin.amount });
    });

    base.value = {
      address: bech32Address,
      coins: coins
    };

    const base64 = btoa(account.public_key);
    // suppressed because the caseing are not defined by us us
    // eslint-disable-next-line @typescript-eslint/camelcase
    base.value.public_key = {
      type: PUBLIC_KEY_TYPE,
      value: base64
    };
    // suppressed because the caseing are not defined by us us
    // eslint-disable-next-line @typescript-eslint/camelcase
    base.value.account_number = account.account_number;
    base.value.sequence = account.sequence;
    // return BaseAccount.fromJSON(base as BaseAccountConstructor);
    return base;
  }
}
