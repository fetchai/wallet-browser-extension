export interface AccountData {
  address: string;
  public_key: string;
  account_number: string;
  sequence: string;
}

export interface BaseAccountConstructor {
  type: "cosmos-sdk/Account";
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
