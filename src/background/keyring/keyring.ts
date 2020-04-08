import { Crypto, KeyStore } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";
import { PrivKey } from "@everett-protocol/cosmosjs/crypto";
import { KVStore } from "../../common/kvstore";

const Buffer = require("buffer/").Buffer;

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED
}

export interface Key {
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
}

const KeyStoreKey = "key-store";

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private cached: Map<string, PrivKey> = new Map();

  private loaded: boolean;

  private _mnemonic: string;

  private _keyStore: KeyStore | null;

  constructor(private readonly kvStore: KVStore) {
    this.loaded = false;
    this._mnemonic = "";
    this._keyStore = null;
  }

  private get mnemonic(): string {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string) {
    this._mnemonic = mnemonic;
    this.cached = new Map();
  }

  public get keyStore(): KeyStore | null {
    return this._keyStore;
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this._keyStore) {
      return KeyRingStatus.EMPTY;
    } else if (this.mnemonic) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public getKey(path: string): Key {
    return this.loadKey(path);
  }

  public async createKey(mnemonic: string, password: string) {
    this.mnemonic = mnemonic;
    this._keyStore = await Crypto.encrypt(this.mnemonic, password);
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }
    this.mnemonic = "";
  }

  public async unlock(password: string) {
    if (!this._keyStore) {
      throw new Error("Key ring not initialized");
    }
    // If password is invalid, error will be thrown.
    this.mnemonic = Buffer.from(
      await Crypto.decrypt(this._keyStore, password)
    ).toString();
  }

  public async getMneumonic(
    password: string,
    keyFile: KeyStore
  ): Promise<string | false> {
    // If password is invalid, error will be thrown.
    // verify password is correct before using this.
    try {
      this.mnemonic = Buffer.from(
        await Crypto.decrypt(keyFile, password)
      ).toString();
    } catch (e) {
      return false;
    }
    return this.mnemonic;
  }

  public async verifyPassword (
    password: string,
    keyFile: KeyStore | null = null
  ): Promise<boolean> {
    if (!this._keyStore && keyFile === null) return false;

    const k = keyFile !== null ? keyFile : this._keyStore;

    try {
      // If password is invalid, error will be thrown.
      this.mnemonic = Buffer.from(
        await Crypto.decrypt(k as KeyStore, password)
      ).toString();
      return true;
    } catch (error) {
      return false;
    }
  }

  public async updatePassword(
    password: string,
    newPassword: string
  ): Promise<boolean> {
    if (!(await this.verifyPassword(password))) {
      return false;
    }
    this._keyStore = await Crypto.encrypt(this.mnemonic, newPassword);
    await this.save();
    return true;
  }

  public async save() {
    await this.kvStore.set<KeyStore>(KeyStoreKey, this._keyStore);
  }

  public async restore() {
    const keyStore = await this.kvStore.get<KeyStore>(KeyStoreKey);
    if (!keyStore) {
      this._keyStore = null;
    } else {
      this._keyStore = keyStore;
    }
    this.loaded = true;
  }

  /**
   * This will clear all key ring data.
   * Make sure to use this only in development env for testing.
   */
  public async clear() {
    this._keyStore = null;
    this.mnemonic = "";
    this.cached = new Map();

    await this.save();
  }

  private loadKey(path: string): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const privKey = this.loadPrivKey(path);
    const pubKey = privKey.toPubKey();

    return {
      algo: "secp256k1",
      pubKey: pubKey.serialize(),
      address: pubKey.toAddress().toBytes()
    };
  }

  private loadPrivKey(path: string): PrivKey {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const cachedKey = this.cached.get(path);
    if (cachedKey) {
      return cachedKey;
    }

    const privKey = generateWalletFromMnemonic(this.mnemonic, path);

    this.cached.set(path, privKey);
    return privKey;
  }

  public sign(path: string, message: Uint8Array): Uint8Array {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const privKey = this.loadPrivKey(path);
    return privKey.sign(message);
  }
}
