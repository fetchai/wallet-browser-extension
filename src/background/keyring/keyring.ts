import { Crypto, HardwareStore, EncryptedKeyStructure } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";
import {
  Address,
  PrivKey,
  PubKeySecp256k1
} from "@everett-protocol/cosmosjs/crypto";
import { KVStore } from "../../common/kvstore";
import LedgerNano from "../ledger-nano/keeper";
import {
  AddressBook,
  HardwareAddressItem,
  RegularAddressItem,
  WalletTuple
} from "./types";

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
  // the active address is the address currently displayed in the wallet, which is then used for balance, sending , downloading ect.
  public activeAddress: string | null;

  //todo refactor this from being potentially null since neccesetates tooo many as statements.
  private addressBook: AddressBook = [];

  private unlocked: boolean = false;

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

  /**
   * The active address is the address currently displayed in the wallet, which is then used for balance, sending ect.
   * This method finds its index in the address book
   *
   */
  private activeAddressAddressBookIndex(): number {
    if (this.activeAddress === null || this.addressBook === null) {
      return null;
    }

    return this.addressBook.findIndex(el => el.address === this.activeAddress);
  }

  public get keyStore(): EncryptedKeyStructure | null {
    return this._keyStore;
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this.addressBook) {
      return KeyRingStatus.EMPTY;
    } else if (this.unlocked) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public getKey(path: string): Key {
    return this.loadKey(path);
  }

  public async addNewRegularKey(mnemonic: string, password: string) {

     const encryptedKeyStructure = await Crypto.encrypt(this.mnemonic, password);

        this.addressBook.push({
      address:
      hdWallet: false,
        encryptedKeyStructure: encryptedKeyStructure,
  })



  }

  /**
   * If user signs in with hardware wallet we store their public key and a salted hash of password instead
   * of hash of mneumonic
   *
   * @param publicKeyHex
   * @param password
   */
  public async addNewHardwareKey(publicKeyHex: string, password: string) {
    const buff = Buffer.from(publicKeyHex + password);
    const hash = Crypto.sha256(buff).toString("hex");
    this.addressBook.push({
      address: this.addressFromPublicKeyHex(publicKeyHex),
      hdWallet: true,
      hash: hash,
      publicKeyHex: publicKeyHex
    });
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.unlocked = false;
  }

  /**
   *
   *
   *
   * @param password
   */
  public async unlock(password: string) {
    if (!this.addressBook) {
      throw new Error("Key ring not initialized");
    }

    // first lets just check if pwd is correct.
    if (!(await this.verifyPassword(password))) return false;

    this.unlocked = true;
    // if it is we iterate over address key and get the mneumonic and private key if it is a non-hardware associated one.
    this.addressBook = this.addressBook.map(async el => {
      if (el.hdWallet) return el;
      else {
        const [, mnemonic] = await this.decryptKeyFile(
          password,
          el.encryptedKeyStructure
        );
        el.mneumonic = mnemonic as string;
        el.privateKey = generateWalletFromMnemonic(mnemonic as string);
        return el;
      }
    });

    return true;
  }

  /**
   * We have a hash stored with each hardware key which can be used to check if the password is correct.
   *
   * @param password
   */
  private async canDecryptHardwareHash(
    password: string,
    hardwareAddressItem: HardwareAddressItem
  ): Promise<boolean> {
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

  public async decryptKeyFile(
    password: string,
    keyFile: EncryptedKeyStructure
  ): Promise<WalletTuple> {
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

  public async verifyPassword(password: string): Promise<boolean> {
    if (this.addressBook === null) return false;

    // just test for the first address in address book since if we can decrypt one then password is correct
    const first = this.addressBook[0];

    // we call different decryption methods based on wether the address file is a hardware one or a regular one
    if (first.hdWallet) return this.canDecryptHardwareHash(password, first);
    else {
      const [success] = await this.decryptKeyFile(
        password,
        (first as RegularAddressItem).encryptedKeyStructure
      );
      return success;
    }
  }

  public async updatePassword(
    password: string,
    newPassword: string
  ): Promise<boolean> {
    if (!(await this.verifyPassword(password))) {
      return false;
    }

    if (this._publicKeyHex) {
      this.addNewHardwareKey(this._publicKeyHex, newPassword);
    }

    if (this.mnemonic) {
      this._keyStore = await Crypto.encrypt(this.mnemonic, newPassword);
    }

    this;

    await this.save();
    return true;
  }

  public async save() {
    if (this.addressBook === null) return;

    this.addressBook.forEach(el => {
      if (el.hdWallet === false) {
        delete el.privateKey;
        delete el.mneumonic;
      }
    });

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

  /**
   * returne betch 32 address
   *
   * @param publicKeyHex
   */
  private addressFromPublicKeyHex(publicKeyHex: string): string {
    const pubKey = new PubKeySecp256k1(Buffer.from(publicKeyHex, "hex"));
    // todo  get prefix ffrom chaininfo as per // keeper.getChainInfo(getKeyMsg.chainId).bech32Config.bech32PrefixAccAddr
    return pubKey.toAddress().toBech32("cosmos");
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

  private loadPrivKey(mnemonic: string): PrivKey {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    return generateWalletFromMnemonic(mnemonic);
  }

  /**
   * if every address in the wallet is from hardware (nano x or s currently)
   */
  private allAddressesAreHardwareAssociated(): boolean {
    return (
      this.addressBook !== null && this.addressBook.every(item => item.hdWallet)
    );
  }

  public async triggerHardwareSigning(
    message: Uint8Array
  ): Promise<Uint8Array> {}

  /**
   * Sign message with private key. Only call if active key is not from hardware wallet (eg nano x or s) or it will throw.
   *
   * @param message
   */

  public async sign(message: Uint8Array): Promise<Uint8Array> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const index = this.activeAddressAddressBookIndex();
    // sign with a non-hardware associated key ( eg
    if ((this.addressBook as AddressBook)[index].hdWallet === true) {
      throw new Error();
    }

    const regularAddressItem = (this.addressBook as AddressBook)[
      index
    ] as RegularAddressItem;
    const privKey = this.loadPrivKey(regularAddressItem.mneumonic as string);
    return privKey.sign(message);
  }
}
