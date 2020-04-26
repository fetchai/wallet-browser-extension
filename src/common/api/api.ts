import Axios, { AxiosRequestConfig, CancelToken } from "axios";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { BaseAccount } from "@everett-protocol/cosmosjs/common/baseAccount";
import { Account } from "@everett-protocol/cosmosjs/core/account";
import { WalletProvider } from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";

export interface AccountData {
  address: string;
  public_key: string;
  account_number: string;
  sequence: string;
}

export interface BaseAccountConstructor {
  type: "cosmos-sdk/Account";
  public_key: { readonly type: "tendermint/PubKeySecp256k1"; value: string };
  value: {
    address: string;
    coins: {
      denom: string;
      amount: string;
    }[];
    public_key: {
      readonly type: "tendermint/PubKeySecp256k1";
      value: string;
    };
    account_number: string;
    sequence: string;
  };
}

export class API {
  /**
   * Gets balance of an account
   *
   * @param rpc
   * @param bech32Address
   * @param cancelToken
   */
  static async getBalance(
    rpc: string,
    bech32Address: string,
    cancelToken: CancelToken | null = null
  ): Promise<Coin[]> {
    const url = `${rpc}/bank/balances/${bech32Address}`;
    const coins: Coin[] = [];

    const config: AxiosRequestConfig = {};

    if (cancelToken !== null) {
      config.cancelToken = cancelToken;
    }

    const resp = await Axios.get(url, config);
    if (resp.status !== 200) throw new Error();

    resp.data.result.forEach((el: any) => {
      coins.push(new Coin(el.denom, el.amount));
    });

    return coins;
  }

  static async getAccount(
    rest: string,
    bech32Address: string,
    cancelToken: CancelToken | null = null
  ): Promise<AccountData> {
    debugger;
    const url = `${rest}/auth/accounts/${bech32Address}`;

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
      throw new Error("HTTP status code doesn't equal 200");
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
    walletProvider: WalletProvider,
    context: Context
  ): Promise<Account> {
    const keys = await walletProvider.getKeys(context);
    const bech32Address = keys[0].bech32Address;

    const [balance, account] = await Promise.all([
      API.getBalance(rest, bech32Address),
      API.getAccount(rest, bech32Address)
    ]).catch(error => {
      throw new Error(error.message);
    });

    // construct Object of the type required by the BaseAccount constructor with
    const base: any = {};
    base.type = "cosmos-sdk/Account";

    const coins: {
      denom: string;
      amount: string;
    }[] = [];

    balance.forEach((coin: Coin) => {
      coins.push({ denom: coin.denom, amount: coin.amount.toString() });
    });

    base.value = {
      address: bech32Address,
      coins: coins
    };

    const base64 = btoa(account.public_key);
    debugger;
    base.value.public_key = {
      type: "tendermint/PubKeySecp256k1",
      value: base64
    };

    base.value.account_number = account.account_number;
    base.value.sequence = account.sequence;
    debugger;
    return BaseAccount.fromJSON(base as BaseAccountConstructor);
  }
}
