import { Crypto, EncryptedKeyStructure } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";
import { PrivKey, PubKeySecp256k1 } from "@everett-protocol/cosmosjs/crypto";
import { KVStore } from "../../common/kvstore";
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
const ACTIVE_KEY = "active-key";

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private loaded: boolean;

  public lastSignedHardwareMessage: Uint8Array | undefined;

  // in the wallet we have one active address at any time, the one for which data is shown.
  // the active address is the address currently displayed in the wallet, which is then used for balance, sending , downloading ect.
  public activeAddress: string | undefined;

  //todo refactor this from being potentially null since neccesetates tooo many as statements.
  private addressBook: AddressBook = [];

  private unlocked: boolean = false;

  constructor(private readonly kvStore: KVStore) {
    this.loaded = false;
  }

  /**
   * The active address is the address currently displayed in the wallet, which is then used for balance, sending ect.
   * This method finds its index in the address book
   *
   */
  private activeAddressAddressBookIndex(): number | null {
    if (typeof this.activeAddress === "undefined" || !this.addressBook.length) {
      return null;
    }

    const index = this.addressBook.findIndex(
      el => el.address === this.activeAddress
    );

    // if not found just say it is index 0
    if (index === -1) return 0;
    else return index;
  }

  public isActiveAddressHardwareAssociated() {
    const activeAddress = this.getActiveAddressItem();
    return activeAddress && activeAddress.hdWallet ? true : false;
  }

  public getEveryAddress(): Array<string> {
    return this.addressBook.map(el => el.address);
  }

  private getActiveAddressItem(): HardwareAddressItem | RegularAddressItem {
    const index = this.activeAddressAddressBookIndex() || 0;
    return this.addressBook[index];
  }

  public async deleteAddress(address: string): Promise<boolean> {
    // if wallet has only 1 address we cannot delete through this method. You should instead
    // clear entire account which also deletes the other preferences as when you
    // have 0 addresses you cannot use this wallet
    if (this.addressBook.length === 1) {
      return false;
    }

    // if active address is current address then set active address to 0;
    const active = this.getActiveAddressItem();

    if (active.address === address) {
      this.setActiveAddress(this.addressBook[0].address);
    }

    const index = this.addressBook.findIndex(el => el.address === address);
    this.addressBook.splice(index, 1);
    await this.save();
    return true;
  }

  public async setActiveAddress(address: string) {
    this.activeAddress = address;
  }

  public getActiveAddress(): string {
    return this.activeAddress || this.addressBook[0].address;
  }

  /**
   * it gets the key file for the currently active key, else null if currently active key is hardware associated (eg from nano X or S)
   */
  public get getCurrentKeyFile(): EncryptedKeyStructure | null {
    const index = this.activeAddressAddressBookIndex();

    // if there is no active key(
    if (!index || this.addressBook[index].hdWallet) return null;
    return (this.addressBook[index] as RegularAddressItem)
      .encryptedKeyStructure;
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this.addressBook.length) {
      return KeyRingStatus.EMPTY;
    } else if (this.unlocked) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  /**
   * This one gets various properties of the active key and was required by the wallet provider
   *
   * @param path
   */
  public getKey(): Key {
    return this.loadKey();
  }

  public async addNewRegularKey(
    mnemonic: string,
    password: string,
    active: boolean = true
  ) {
    const regularAddressItem = await this.createRegularAddressBookItem(
      mnemonic,
      password
    );

    this.addressBook.push(regularAddressItem);
    if (active) this.activeAddress = regularAddressItem.address;
  }

  private async createRegularAddressBookItem(
    mnemonic: string,
    password: string
  ): Promise<RegularAddressItem> {
    const encryptedKeyStructure = await Crypto.encrypt(mnemonic, password);
    const privateKey = generateWalletFromMnemonic(mnemonic);

    return {
      address: privateKey
        .toPubKey()
        .toAddress()
        .toBech32("cosmos"),
      hdWallet: false,
      encryptedKeyStructure: encryptedKeyStructure,
      mnemonic: mnemonic,
      privateKey: privateKey
    };
  }

  /**
   * If user signs in with hardware wallet we store their public key and a salted hash of password instead
   * of hash of mnemonic
   *
   * @param publicKeyHex
   * @param password
   */
  public async addNewHardwareKey(
    publicKeyHex: string,
    password: string,
    active: boolean = true
  ) {
    const hardwareAddressItem = await this.createHardwareAddressBookItem(
      publicKeyHex,
      password
    );
    this.addressBook.push(hardwareAddressItem);
    if (active) this.activeAddress = hardwareAddressItem.address;
  }

  private async createHardwareAddressBookItem(
    publicKeyHex: string,
    password: string
  ): Promise<HardwareAddressItem> {
    const buff = Buffer.from(publicKeyHex + password);
    const hash = Crypto.sha256(buff).toString("hex");
    return {
      address: this.addressFromPublicKeyHex(publicKeyHex),
      hdWallet: true,
      hash: hash,
      publicKeyHex: publicKeyHex
    };
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
   * @param password
   */
  public async unlock(password: string) {
    if (!this.addressBook) {
      throw new Error("Key ring not initialized");
    }

    // first lets just check if pwd is correct.
    if (!(await this.verifyPassword(password))) return false;

    this.unlocked = true;
    // if it is we iterate over address key and get the mnemonic and private key if it is a non-hardware associated one.
    // the promise.all is since map takes async function we must wait for them all to finish to get the result: its a common pattern with async
    // function within a map.
    this.addressBook = await Promise.all(
      this.addressBook.map(async el => {
        if (el.hdWallet) return el;
        else {
          const [, mnemonic] = await this.decryptKeyFile(
            password,
            el.encryptedKeyStructure
          );
          el.mnemonic = mnemonic as string;
          el.privateKey = generateWalletFromMnemonic(mnemonic as string);
          return el;
        }
      })
    );

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
    // If password is invalid, error will be thrown else mmnemonic will be set, and they will have been logged in through regular login.
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

    let addressBookItem;
    // we iterate over all the keys, and we re-encrypt with the new password, which is different if the address is hardware associated (eg from ledger Nano s/X or not)
    for (let i = 0; i < this.addressBook.length; i++) {
      if (this.addressBook[i].hdWallet) {
        addressBookItem = await this.createHardwareAddressBookItem(
          (this.addressBook[i] as HardwareAddressItem).publicKeyHex,
          newPassword
        );
        this.addressBook[i] = addressBookItem;
      } else {
        addressBookItem = await this.createRegularAddressBookItem(
          (this.addressBook[i] as RegularAddressItem).mnemonic as string,
          newPassword
        );
        this.addressBook[i] = addressBookItem;
      }
    }

    await this.save();
    return true;
  }

  public async save() {
    // // we don't save the private jeys or mnemonics to local storage.
    const addressBook = this.deletePrivateKeys(this.addressBook, true);
    await this.kvStore.set<AddressBook>(ADDRESS_BOOK_KEY, addressBook);

    if (typeof this.activeAddress !== "undefined") {
      await this.kvStore.set<string>(ACTIVE_KEY, this.activeAddress);
    }
  }

  /**
   * when logged in each regular address has its private key and mnemonic saved in the address book, but this method deletes this, as when
   */
  private deletePrivateKeys(
    addressBook: AddressBook,
    leaveMnemonic: boolean = false
  ): AddressBook {
    return addressBook.map(el => {
      if (el.hdWallet === false) {
        if (!leaveMnemonic) {
          delete el.mnemonic;
        }
        delete el.privateKey;
      }
      return el;
    });
  }

  public async restore() {
    await this.restoreWallet();
    this.loaded = true;
  }

  private async restoreWallet() {
    let addressBook = await this.kvStore.get<any>(ADDRESS_BOOK_KEY);
    this.activeAddress = await this.kvStore.get<string>(ACTIVE_KEY);

    if (!addressBook) {
      this.addressBook = [];
    } else {
      addressBook = addressBook.map((el: any) => {
        if (!el.hdWallet) {
          // const uint8array = new TextEncoder("utf-8").encode(el.privateKey);
          el.privateKey = generateWalletFromMnemonic(el.mnemonic);
        }
        return el;
      });

      this.addressBook = addressBook;
    }
  }

  /**
   * This will clear all key ring data.
   * Make sure to use this only in development env for testing.
   */
  public async clear() {
    this.addressBook = [];
    this.activeAddress = undefined;
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

  private loadKey(): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const activeAddressBookItem = this.getActiveAddressItem();

    if (activeAddressBookItem === null) throw new Error("no active address");

    let pubKey;

    if (activeAddressBookItem.hdWallet) {
      pubKey = new PubKeySecp256k1(
        Buffer.from(activeAddressBookItem.publicKeyHex, "hex")
      );
    } else {
      const activeKey = this.getActiveAddressItem() as RegularAddressItem;
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      pubKey = activeKey.privateKey.toPubKey();
    }

    return {
      algo: "secp256k1",
      pubKey: pubKey.serialize(),
      address: pubKey.toAddress().toBytes()
    };
  }

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

    if (index === null) {
      throw new Error("no active key");
    }

    // sign with a non-hardware associated key ( eg
    if (this.addressBook[index].hdWallet === true) {
      throw new Error(
        "this sign cannot be called when active address is hardwre associated"
      );
    }

    const regularAddressItem = this.addressBook[index] as RegularAddressItem;
    return (regularAddressItem.privateKey as PrivKey).sign(message);
  }
}
