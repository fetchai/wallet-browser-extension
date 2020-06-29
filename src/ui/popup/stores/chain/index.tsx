import { observable, action } from "mobx";
import { actionAsync, task } from "mobx-utils";
import { ChainInfo, NativeChainInfos } from "../../../../chain-info";
import { GetRegisteredChainMsg } from "../../../../background/keyring";
import { sendMessage } from "../../../../common/message";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;



  constructor() {
    this.setChainList(NativeChainInfos);
    this.chainInfo = this.chainList[0];
  }

  @actionAsync
  public async init() {
    await task(this.getChainInfosFromBackground());
  }

  @actionAsync
  private async getChainInfosFromBackground() {
    const msg = GetRegisteredChainMsg.create();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    const chainInfos: ChainInfo[] = result.chainInfos.map(
      (chainInfo: Writeable<ChainInfo>) => {
        chainInfo.bip44 = Object.setPrototypeOf(
          chainInfo.bip44,
          BIP44.prototype
        );
        return chainInfo;
      }
    );
    this.setChainList(chainInfos);
  }

  @action
  public setChainList(chainList: ChainInfo[]) {
    this.chainList = chainList;
  }
}
