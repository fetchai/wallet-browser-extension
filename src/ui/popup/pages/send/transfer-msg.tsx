import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { Codec, Type, Amino } from "@node-a-team/ts-amino";
import { hexEthAddressToUint8Array } from "../../../../../src/common/utils/buffer-convert";
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
      type: Type.Uint
    },
    {
      jsonName: "amount"
    }
  )
  public amount: Coin[];

  @Field.Uint(2, {
    jsonName: "ethereum_chain_id"
  })
  public ethereumChainID: number;

  @Field.Array(
    3,
    {
      type: Type.Uint8
    },
    {
      jsonName: "token_contract_address"
    }
  )
  public tokenContract: Uint8Array;

  @Field.Array(
    4,
    {
      type: Type.Uint8
    },
    {
      jsonName: "ethereum_receiver"
    }
  )
  public ethereumReceiver: Uint8Array;

  constructor(
    cosmosSender: AccAddress,
    amount: Coin[],
    ethereumChainID: number,
    ethereumReceiver: string,
    tokenContract: string
  ) {
    super();
    this.amount = amount;
    this.cosmosSender = cosmosSender;
    this.ethereumChainID = ethereumChainID;
    this.ethereumReceiver = hexEthAddressToUint8Array(
      ethereumReceiver /*, this.web3, ethereumChainID*/
    );
    this.tokenContract = hexEthAddressToUint8Array(
      tokenContract /*, this.web3, ethereumChainID*/
    );
  }

  public getSigners(): AccAddress[] {
    return [this.cosmosSender];
  }

  public validateBasic(): void {}

}
@DefineStruct()
export class BurnMessage extends LockMessage {}

export function registerPeggyCodecs(codec: Codec) {
  codec.registerConcrete("ethbridge/MsgLock", LockMessage.prototype);
  codec.registerConcrete("ethbridge/MsgBurn", BurnMessage.prototype);
}
