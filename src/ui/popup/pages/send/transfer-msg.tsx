import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { Codec, Type, Amino } from "@node-a-team/ts-amino";
const { DefineStruct, Field } = Amino;

@DefineStruct()
export class LockMessage extends Msg {
  @Field.Defined(0, {
    jsonName: "cosmos_sender"
  })
  public cosmosSender: AccAddress;

  @Field.Slice(
    1,
    {
      type: Type.Defined
    },
    {
      jsonName: "amount"
    }
  )
  public amount: Coin[];

  @Field.String(2, {
    jsonName: "ethereum_chain_id"
  })
  public ethereumChainID: string;

  @Field.String(3, {
    jsonName: "ethereum_receiver"
  })
  public ethereumReceiver: string;

  @Field.String(4, {
    jsonName: "token_contract_address"
  })
  public tokenContract: string;

  constructor(
    cosmosSender: AccAddress,
    amount: Coin[],
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
    //   for (const coin of this.amount) {
    //     if (coin.amount.lte(new Int(0))) {
    //       throw new Error("Send amount is invalid");
    //     }
    //   }
  }
}

// export class LockMessage extends TransferMsg {}
//
// export class BurnMessage extends TransferMsg {}

export function registerLockCodec(codec: Codec) {
  codec.registerConcrete("cosmos-sdk/MsgLock", LockMessage.prototype);
}

// export function registerBurnCodec(codec: Codec) {
//   codec.registerConcrete("cosmos-sdk/burn", BurnMessage.prototype);
// }
