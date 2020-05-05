import { generateSeed } from "@everett-protocol/cosmosjs/utils/key";

import { ChainInfo } from "../../../../chain-info";

import { sendMessage } from "../../../../common/message";
import { action, observable } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { RootStore } from "../root";

  @observable
  public status!: boolean;

  constructor(private rootStore: RootStore) {}

  // This will be called by chain store.
  @action
  public setChainInfo(info: ChainInfo) {
    this.chainInfo = info;
  }

  @action
  private setStatus(status: KeyRingStatus) {
    this.status = status;
    this.rootStore.setKeyRingStatus(status);
  }

  @actionAsync
  public async createKey(mnemonic: string, password: string) {
    const msg = CreateKeyMsg.create(mnemonic, password);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async lock() {
    const msg = LockKeyRingMsg.create();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async unlock(password: string) {
    const msg = UnlockKeyRingMsg.create(password);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async verifyPassword(
    password: string,
    keyFile: KeyStore | null = null
  ) {
    const msg = VerifyPasswordKeyRingMsg.create(password, keyFile);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    return result.success;
  }

  @actionAsync
  public async getMneumonic(
    password: string,
    keyFile: KeyStore
  ) {
    const msg = GetMneumonicMsg.create(password, keyFile);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    return result.mneumonic;
  }

  @actionAsync
  public async updatePassword(password: string, newPassword: string) {
    const msg = UpdatePasswordMsg.create(password, newPassword);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    return result.success;
  }

  @actionAsync
  public async getKeyFile() {
    const msg = GetKeyFileMsg.create();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    return result.file;
  }

  @actionAsync
  public async restore() {
    const msg = RestoreKeyRingMsg.create();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async save() {
    const msg = SaveKeyRingMsg.create();
    await task(sendMessage(BACKGROUND_PORT, msg));
  }

  /**
   * Clear key ring data.
   * This will throw unless you are in a development env.
   */
  @actionAsync
  public async clear() {
    const msg = ClearKeyRingMsg.create();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }
}
