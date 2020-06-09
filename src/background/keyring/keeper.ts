import { Key, KeyRing, KeyRingStatus } from "./keyring";

import {
  AccessOrigin,
  ChainInfo,
  ExtensionAccessOrigins,
  NativeChainInfos
} from "../../chain-info";
import { Address } from "@everett-protocol/cosmosjs/crypto";
import { AsyncApprover } from "../../common/async-approver";
import {
  TxBuilderConfigPrimitive,
  TxBuilderConfigPrimitiveWithChainId
} from "./types";

import { KVStore } from "../../common/kvstore";

import { openWindow } from "../../common/window";
import { EncryptedKeyStructure } from "./crypto";

export interface KeyHex {
  algo: string;
  pubKeyHex: string;
  addressHex: string;
  bech32Address: string;
}

interface SignMessage {
  chainId: string;
  message: Uint8Array;
}

export class KeyRingKeeper {
  private readonly keyRing: KeyRing;
  private path = "";

  private readonly unlockApprover = new AsyncApprover({
    defaultTimeout: 3 * 60 * 1000
  });

  private readonly txBuilderApprover = new AsyncApprover<
    TxBuilderConfigPrimitiveWithChainId,
    TxBuilderConfigPrimitive
  >({
    defaultTimeout: 3 * 60 * 1000
  });

  private readonly signApprover = new AsyncApprover<SignMessage>({
    defaultTimeout: 3 * 60 * 1000
  });

  constructor(kvStore: KVStore) {
    this.keyRing = new KeyRing(kvStore);
  }

  async enable(): Promise<KeyRingStatus> {
    if (this.keyRing.status === KeyRingStatus.EMPTY) {
      throw new Error("key doesn't exist");
    }

    if (this.keyRing.status === KeyRingStatus.NOTLOADED) {
      await this.keyRing.restore();
    }

    if (this.keyRing.status === KeyRingStatus.LOCKED) {
      openWindow(browser.runtime.getURL("popup.html#/?external=true"));
      await this.unlockApprover.request("unlock");
      return this.keyRing.status;
    }

    return this.keyRing.status;
  }

  getKeyRingStatus(): KeyRingStatus {
    return this.keyRing.status;
  }

  getRegisteredChains(): ChainInfo[] {
    return NativeChainInfos;
  }

  getChainInfo(chainId: string): ChainInfo {
    const chainInfo = this.getRegisteredChains().find(chainInfo => {
      return chainInfo.chainId === chainId;
    });

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chainInfo;
  }

  getAccessOrigins(): AccessOrigin[] {
    return ExtensionAccessOrigins;
  }

  getAccessOrigin(chainId: string): string[] {
    const accessOrigins = this.getAccessOrigins();
    const accessOrigin = accessOrigins.find(accessOrigin => {
      return accessOrigin.chainId == chainId;
    });

    if (!accessOrigin) {
      throw new Error(`There is no access origins for ${chainId}`);
    }

    return accessOrigin.origins;
  }

  checkAccessOrigin(chainId: string, origin: string) {
    if (origin === new URL(browser.runtime.getURL("/")).origin) {
      return;
    }

    const accessOrigin = this.getAccessOrigin(chainId);
    if (accessOrigin.indexOf(origin) <= -1) {
      throw new Error("This origin is not approved");
    }
  }

  async checkBech32Address(chainId: string, bech32Address: string) {
    const key = await this.getKey();
    if (
      bech32Address !==
      new Address(key.address).toBech32(
        this.getChainInfo(chainId).bech32Config.bech32PrefixAccAddr
      )
    ) {
      throw new Error("Invalid bech32 address");
    }
  }

  async restore(): Promise<KeyRingStatus> {
    await this.keyRing.restore();
    return this.keyRing.status;
  }

  async save(): Promise<void> {
    await this.keyRing.save();
  }

  /**
   * Of all addresses in addressbook we set one as active
   *
   * @param address
   */
  public async setActiveAddress(address: string): Promise<void> {
    await this.keyRing.setActiveAddress(address);
  }

   public getActiveAddress(): string {
    return this.keyRing.getActiveAddress();
  }

  /**
   * This will clear all key ring data.
   */
  async clear(): Promise<KeyRingStatus> {
    await this.keyRing.clear();
    return this.keyRing.status;
  }

  /**
   * Is the active address of the wallet linked to a hardware device eg nano
   */
  isHardwareLinked(): boolean {
    return this.keyRing.isActiveAddressHardwareAssociated();
  }

  async createKey(mnemonic: string, password: string): Promise<KeyRingStatus> {
    // TODO: Check mnemonic checksum.
    await this.keyRing.addNewRegularKey(mnemonic, password);
    return this.keyRing.status;
  }

  async createHardwareKey(
    publicKeyHex: string,
    password: string
  ): Promise<KeyRingStatus> {
    await this.keyRing.addNewHardwareKey(publicKeyHex, password);
    return this.keyRing.status;
  }

  lock(): KeyRingStatus {
    this.keyRing.lock();
    return this.keyRing.status;
  }

  async unlock(password: string): Promise<KeyRingStatus> {
    await this.keyRing.unlock(password);
    try {
      this.unlockApprover.approve("unlock");
    } catch {
      // noop
    }
    return this.keyRing.status;
  }

  async verifyPassword(
    password: string,
    keyFile: EncryptedKeyStructure | null = null
  ): Promise<boolean> {
    let res;
    if (keyFile === null) {
      res = await this.keyRing.verifyPassword(password);
    } else {
      [res] = await this.keyRing.decryptKeyFile(password, keyFile);
    }

    return res;
  }

  public getEveryAddress(){
    return this.keyRing.getEveryAddress();
  }

  async makeMnemonicgMsg(
    password: string,
    keyFile: EncryptedKeyStructure
  ): Promise<string | null> {
    //todo check the change of negative return from false to null doesn't cause bug
    const [, res] = await this.keyRing.decryptKeyFile(password, keyFile);
    return res;
  }

  async updatePassword(password: string, newPassword: string) {
    return await this.keyRing.updatePassword(password, newPassword);
  }

  async handleGetKeyFile(): Promise<EncryptedKeyStructure | null> {
    return this.keyRing.getCurrentKeyFile as EncryptedKeyStructure;
  }

  setPath(chainId: string, account: number, index: number) {
    this.path = this.getChainInfo(chainId).bip44.pathString(account, index);
  }

  async getKey(): Promise<Key> {
    return this.keyRing.getKey();
  }

  async requestTxBuilderConfig(
    config: TxBuilderConfigPrimitiveWithChainId,
    id: string,
    openPopup: boolean
  ): Promise<TxBuilderConfigPrimitive> {
    if (openPopup) {
      // Open fee window with hash to let the fee page to know that window is requested newly.
      openWindow(browser.runtime.getURL(`popup.html#/fee/${id}?external=true`));
    }

    const result = await this.txBuilderApprover.request(id, config);
    if (!result) {
      throw new Error("config is approved, but result config is null");
    }
    return result;
  }

  getRequestedTxConfig(id: string): TxBuilderConfigPrimitiveWithChainId {
    const config = this.txBuilderApprover.getData(id);
    if (!config) {
      throw new Error("Unknown config request id");
    }

    return config;
  }

  approveTxBuilderConfig(id: string, config: TxBuilderConfigPrimitive) {
    this.txBuilderApprover.approve(id, config);
  }

  rejectTxBuilderConfig(id: string): void {
    this.txBuilderApprover.reject(id);
  }

  async requestSign(
    chainId: string,
    message: Uint8Array,
    id: string,
    openPopup: boolean
  ): Promise<Uint8Array> {
    if (openPopup) {
      openWindow(
        browser.runtime.getURL(`popup.html#/sign/${id}?external=true`)
      );
    }
    // this waits until it approval message before going to next line below.
    await this.signApprover.request(id, { chainId, message });

    if (this.keyRing.isActiveAddressHardwareAssociated()) {
      return await this.keyRing.triggerHardwareSigning(message);
    } else {
      return await this.keyRing.sign(message);
    }
  }

  getRequestedMessage(id: string): SignMessage {
    const message = this.signApprover.getData(id);
    if (!message) {
      throw new Error("Unknown sign request id");
    }

    return message;
  }

  approveSign(id: string): void {
    this.signApprover.approve(id);
  }

  rejectSign(id: string): void {
    this.signApprover.reject(id);
  }
}
