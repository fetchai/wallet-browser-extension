import { Crypto, HardwareStore, EncryptedKeyStructure } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";
import { PrivKey, PubKeySecp256k1 } from "@everett-protocol/cosmosjs/crypto";
import { KVStore } from "../../common/kvstore";
import LedgerNano from "../ledger-nano/keeper";
import {AddressBook, HardwareAddressItem, RegularAddressItem, WalletTuple} from "./types";

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

const ADDRESS_BOOK_KEY = "address-book-key";

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private cached: Map<string, PrivKey> = new Map();

  private loaded: boolean;

  // in the wallet we have one active address at any time, the one for which data is shown.
  public activeAddress: string | null;

  private addressBook: AddressBook | null;

  constructor(private readonly kvStore: KVStore) {
    this.loaded = false;

  }

  private get mnemonic(): string {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string) {
    this._mnemonic = mnemonic;
    this.cached = new Map();
  }

  public get keyStore(): EncryptedKeyStructure | null {
    return this._keyStore;
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this._keyStore && !this._hardwareStore) {
      return KeyRingStatus.EMPTY;
    } else if (this.mnemonic || this._publicKeyHex) {
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

  /**
   * If user signs in with hardware wallet we store their public key and a salted hash of password instead
   * of hash of mneumonic
   *
   * @param publicKeyHex
   * @param password
   */
  public async createHardwareKey(publicKeyHex: string, password: string) {
    const buff = Buffer.from(publicKeyHex + password);
    const hash = Crypto.sha256(buff).toString("hex");
    this._publicKeyHex = publicKeyHex;
    this._hardwareStore = { hash: hash, publicKeyHex: publicKeyHex };
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }
    this.mnemonic = "";
    this._publicKeyHex = "";
  }

  /**
   * The original way the wallet unlocking worked was storing a hash of thee meumonic, and if this decrypted to the key file with the password then we could unlock the wallet.
   *
   * When hardware wallet support was added we no longer saved the encrypted key or mneumonic so we added the hash of the hex public key and password and compared it to
   * saved hash, using saved public key hex.
   *
   * This method unlocks by one of the two above methods.
   *
   * Previously the flag for being logged in was having the mneumonic set, but this has now been changed to having either the meumonic set or the publicKeyHex set.
   *
   * @param password
   */
  public async unlock(password: string) {
    if (!this.addressBook) {
      throw new Error("Key ring not initialized");
    }

    if (this._hardwareStore) {
      await this.unlockHardwareWallet(password);
    } else {
      await this.unlockRegularWallet(password);
    }
  }

  /**
   * We have a hash stored with each hardware key which can be used to check if the password is correct.
   *
   * @param password
   */
  private async canDecryptHardwareHash(password: string, hardwareAddressItem: HardwareAddressItem): Promise<boolean> {

    const buff = Buffer.from(hardwareAddressItem.publicKeyHex + password);
    const hash = Crypto.sha256(buff).toString("hex");

    if (hash === hardwareAddressItem.hash) {
      return true;
    }
    return false;
  }

  /**
   * used to unlock a regular address which has saved key file structure. if this decrypts to correct mac we return menumonic.
   *
   * @param password
   */


  public async decryptKeyFile(password: string, keyFile: EncryptedKeyStructure): Promise<WalletTuple> {
    // If password is invalid, error will be thrown else mmneumonic will be set, and they will have been logged in through regular login.
    let mnemonic;
    try {
      mnemonic = Buffer.from(
        await Crypto.decrypt(keyFile, password)
      ).toString();
      return [true, mnemonic];
    } catch (error) {
      return [false, null];
    }
  }



  public async verifyPassword(
    password: string,
  ): Promise<boolean> {

    if(this.addressBook === null) return false;

    // if it is hardware-only-assiciated wallet we unlock it this way.
    if (this.allAddressesAreHardwareAssociated()) {
      // just check if first key can be decrypted, since logically all others also then can be
      return await this.canDecryptHardwareHash(password, this.addressBook[0] as HardwareAddressItem);
    }

   const regularAddressItem = this.addressBook.find(el => el.hdWallet === true) as RegularAddressItem

    const [success, ] =  await this.decryptKeyFile(password, regularAddressItem.encryptedKeyStructure);
    return success;
  }

  public async updatePassword(
    password: string,
    newPassword: string
  ): Promise<boolean> {
    if (!(await this.verifyPassword(password))) {
      return false;
    }




    if (this._publicKeyHex) {
      this.createHardwareKey(this._publicKeyHex, newPassword);
    }

    if (this.mnemonic) {
      this._keyStore = await Crypto.encrypt(this.mnemonic, newPassword);
    }

    this

    await this.save();
    return true;
  }

  public async save() {
    await this.kvStore.set<AddressBook>(ADDRESS_BOOK_KEY, this.addressBook);
  }

  public async restore() {
    await this.restoreWallet();
    this.loaded = true;
  }

  private async restoreWallet() {
    const addressBook = await this.kvStore.get<AddressBook>(ADDRESS_BOOK_KEY);
    if (!addressBook) {
      this.addressBook = null;
    } else {
      this.addressBook = addressBook;
    }
  }

  /**
   * This will clear all key ring data.
   * Make sure to use this only in development env for testing.
   */
  public async clear() {
    this.addressBook = null;
    this.cached = new Map();

    await this.save();
  }

  private loadKey(path: string): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    let pubKey;
    if (this._publicKeyHex) {
      pubKey = new PubKeySecp256k1(Buffer.from(this._publicKeyHex, "hex"));
    } else {
      const privKey = this.loadPrivKey(path);
      pubKey = privKey.toPubKey();
    }

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


  private allAddressesAreHardwareAssociated(): boolean { return this.addressBook.every((item) => item.hdWallet) }

  public async sign(path: string, message}: Uint8Array): Promise<Uint8Array> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (this.allKeysOnHardware()) {
      let signedMessage;

      try {
        const ledgerNano = await LedgerNano.getInstance();
        signedMessage = await ledgerNano.sign(message);
      } catch (error) {
        browser.notifications.create({
          type: "basic",
          iconUrl: browser.runtime.getURL("assets/fetch-logo.svg"),
          title: "Signing rejected",
          message: error.message
        });
      }
      return signedMessage as Buffer;
    }

    const privKey = this.loadPrivKey(path);
    return privKey.sign(message);
  }
}
