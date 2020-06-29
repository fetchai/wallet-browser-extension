import { observable, action } from "mobx";
import { actionAsync, task } from "mobx-utils";
import { ChainInfo, NativeChainInfos } from "../../../../chain-info";
import { GetRegisteredChainMsg } from "../../../../background/keyring";
import { sendMessage } from "../../../../common/message";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import { RootStore } from "../root";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;
  private isChainSet: boolean;

  constructor(private rootStore: RootStore) {
    this.setChainList(NativeChainInfos);
    this.isChainSet = false;
  }

  @actionAsync
  public async init() {
    await task(this.getChainInfosFromBackground());
    if (!this.isChainSet) {
      this.chainInfo = this.chainList[0];
      this.rootStore.setChainInfo(this.chainInfo);
    }
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
