import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { Codec, Type, Amino } from "@node-a-team/ts-amino";
import { Uint8ArrayFromHex } from "../../../../../src/common/utils/buffer-convert";
import { sortJSON } from "@everett-protocol/cosmosjs/utils/sortJson";
//import { Web3 } from "web3/types";

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
    ethereumReceiver: string | Uint8Array | Buffer,
    tokenContract: string | Uint8Array | Buffer
  ) {
    super();
    this.amount = amount;
    this.cosmosSender = cosmosSender;
    this.ethereumChainID = ethereumChainID;
    this.ethereumReceiver = Uint8ArrayFromHex(ethereumReceiver);
    this.tokenContract = Uint8ArrayFromHex(tokenContract);
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

  public getSignBytes(codec: Codec): Uint8Array {
    function toHex(arr: Uint8Array): string {
      const str = new TextDecoder().decode(arr);
      let result = '';
      for (let i=0; i<str.length; i++) {
        result += str.charCodeAt(i).toString(16);
      }
      return "0x" + result;
    }

    const retval = super.getSignBytes(codec);
    const jsonStr = new TextDecoder().decode(retval);
    let json_des = JSON.parse(jsonStr);
    let json = json_des.value;
    json.ethereum_chain_id = this.ethereumChainID;
    json.ethereum_receiver = toHex(this.ethereumReceiver);
    json.token_contract_address = toHex(this.tokenContract);
    //let w = Web3();
    //w.utils.toChecksumAddress()
    const r = Buffer.from(sortJSON(JSON.stringify(json)), "utf8");
    return r;
    //return `{"amount":[{"amount":"${this.amount}","denom":"ufet"}],"cosmos_sender":"cosmos1ddak2pu23dwaa7lfwkn4yj7676e2ukhz3cpavw","ethereum_chain_id":4,"ethereum_receiver":"0x11111111262B236c9AC9A9A8C8e4276B5Cf6b2C9","token_contract_address":"0x1D287CC25dAD7cCaF76a26bc660c5F7C8E2a05BD"}`;
    //return retval;
  }
}

//@DefineStruct()
//export class LockMessageSorSigning extends Msg {
//  @Field.Defined(0, {
//    jsonName: "cosmos_sender"
//  })
//  public cosmosSender: AccAddress;
//
//  @Field.Slice(
//    1,
//    {
//      type: Type.Defined
//    },
//    {
//      jsonName: "amount"
//    }
//  )
//  public amount: Coin[];
//
//  @Field.Uint32(2, {
//    jsonName: "ethereum_chain_id"
//  })
//  public ethereumChainID: number;
//
//  @Field.String(3, {
//    jsonName: "token_contract_address"
//  })
//  public tokenContract: string;
//
//  @Field.String(4, {
//    jsonName: "ethereum_receiver"
//  })
//  public ethereumReceiver: string;
//
//  constructor(msg: LockMessage) {
//    super();
//    this.amount = msg.amount;
//    this.cosmosSender = msg.cosmosSender;
//    this.ethereumChainID = msg.ethereumChainID;
//    this.ethereumReceiver = HexFromUint8Array(msg.ethereumReceiver);
//    this.tokenContract = HexFromUint8Array(msg.tokenContract);
//  }
//
//  public getSigners(): AccAddress[] {
//    return [this.cosmosSender];
//  }
//
//  public validateBasic(): void {
//    //   for (const coin of this.amount) {
//    //     if (coin.amount.lte(new Int(0))) {
//    //       throw new Error("Send amount is invalid");
//    //     }
//    //   }
//  }
//
//  public getSignBytes(codec: Codec): Uint8Array {
//    const retval = super.getSignBytes(codec);
//    const jsonStr = new TextDecoder().decode(retval);
//    return retval;
//  }
//}

// export class LockMessage extends TransferMsg {}
//
// export class BurnMessage extends TransferMsg {}

export function registerLockCodec(codec: Codec) {
  codec.registerConcrete("ethbridge/MsgLock", LockMessage.prototype);
}

// export function registerBurnCodec(codec: Codec) {
//   codec.registerConcrete("cosmos-sdk/burn", BurnMessage.prototype);
// }
