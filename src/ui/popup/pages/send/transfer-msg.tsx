import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { Codec, Type } from "@node-a-team/ts-amino";
import { DefineStruct, Field } from "@node-a-team/ts-amino/dist/amino";

@DefineStruct()
export class LockMessage extends Msg {
  @Field.Slice(
    1,
    { type: Type.Defined },
    {
      jsonName: "amount"
    }
  )
  @Field.Defined(4, {
    jsonName: "cosmos_sender"
  })
  @Field.Defined(0, {
    jsonName: "ethereum_chain_id"
  })
  @Field.Defined(2, {
    jsonName: "token_contract_address"
  })
  @Field.Defined(3, {
    jsonName: "token_contract"
  })
  public readonly amount: Coin[];
  public readonly cosmosSender: AccAddress;
  public readonly ethereumChainID: string;
  public readonly ethereumReceiver: string;
  public readonly tokenContract: string;

  constructor(
    amount: Coin[],
    cosmosSender: AccAddress,
    ethereumChainID: string,
    ethereumReceiver: string,
    tokenContract: string
  ) {
    super();
    this.amount = amount;
    this.cosmosSender = cosmosSender;
    this.ethereumChainID = ethereumChainID;
    this.ethereumReceiver = ethereumReceiver;
    this.tokenContract = tokenContract;
  }

  public getSigners(): AccAddress[] {
    return [this.cosmosSender];
  }

  public validateBasic(): void {
    for (const coin of this.amount) {
      if (coin.amount.lte(new Int(0))) {
        throw new Error("Send amount is invalid");
      }
    }
  }
}

// export class LockMessage extends TransferMsg {}
//
// export class BurnMessage extends TransferMsg {}

export function registerLockCodec(codec: Codec) {
  codec.registerConcrete("cosmos-sdk/lock", LockMessage.prototype);
}

// export function registerBurnCodec(codec: Codec) {
//   codec.registerConcrete("cosmos-sdk/burn", BurnMessage.prototype);
// }
