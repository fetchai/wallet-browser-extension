import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { Codec, Type, Amino } from "@node-a-team/ts-amino";
import { hexEthAddressToUint8Array } from "../../../../../src/common/utils/buffer-convert";
import Web3 from "web3";
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
  private web3 = new Web3();

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

  public validateBasic(): void {
    //   for (const coin of this.amount) {
    //     if (coin.amount.lte(new Int(0))) {
    //       throw new Error("Send amount is invalid");
    //     }
    //   }
  }

  // public getSignBytes(codec: Codec): Uint8Array {
  //   const retval = super.getSignBytes(codec);
  //   const jsonStr = new TextDecoder().decode(retval);
  //   let json_des = JSON.parse(jsonStr);
  //   let json = json_des.value;
  //   json.ethereum_chain_id = this.ethereumChainID;
  //   json.ethereum_receiver = uint8ArrayToChecksumEthAddress(this.ethereumReceiver, this.ethereumChainID, this.web3);
  //   json.token_contract_address = uint8ArrayToChecksumEthAddress(this.tokenContract, this.ethereumChainID, this.web3);
  //   return Buffer.from(sortJSON(JSON.stringify(json)), "utf8");
  // }
}
@DefineStruct()
export class BurnMessage extends LockMessage {}

export function registerPeggyCodecs(codec: Codec) {
  codec.registerConcrete("ethbridge/MsgLock", LockMessage.prototype);
  codec.registerConcrete("ethbridge/MsgBurn", BurnMessage.prototype);
}
