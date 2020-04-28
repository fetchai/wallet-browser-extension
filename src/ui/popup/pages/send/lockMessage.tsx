import { Msg } from "../../../../../../cosmosjs/src/core/tx";
import { Coin } from "../../../../../../cosmosjs/src/common/coin";
import { Int } from "../../../../../../cosmosjs/src/common/int";
import {AccAddress} from "@everett-protocol/cosmosjs/common/address";

export class LockMsg extends Msg {
  public readonly ethereumChainID: string;
  public readonly amount: Coin[];
  public readonly ethereumReceiver: string;
  public readonly tokenContract: string;
  public readonly cosmosSender: AccAddress;

  constructor(
    ethereumChainID: string,
    tokenContract: string,
    cosmosSender: AccAddress,
    ethereumReceiver: string,
    amount: Coin[]
  ) {
    super();
    this.amount = amount;
    this.ethereumReceiver = ethereumReceiver;
    this.ethereumChainID = ethereumChainID;
    this.tokenContract = tokenContract;
    this.cosmosSender = cosmosSender;
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
