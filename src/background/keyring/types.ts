import { EncryptedKeyStructure } from "./crypto";
import { PrivKey } from "@everett-protocol/cosmosjs/crypto";

export type WalletTuple = [boolean, string | null];

export interface TxBuilderConfigPrimitive {
  accountNumber?: string; // bigInteger.BigNumber;
  sequence?: string; // bigInteger.BigNumber;
  gas: string; // bigInteger.BigNumber;
  gasAdjustment?: number;
  memo: string;
  fee: string; // Coin[] | Coin;
  gasPrice?: number;
}

export interface RegularAddressItem {
  address: string;
  encryptedKeyStructure: EncryptedKeyStructure;
  privateKey?: PrivKey;
  mnemonic?: string;
  hdWallet: false;
}

export interface HardwareAddressItem {
  address: string;
  publicKeyHex: string;
  hash: string;
  hdWallet: true;
}

/**
 * all addresses are either regular or hardware keys, and the hdwallet flag is used to determine which of these two types it is at runtime.
 *
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AddressBook extends Array<HardwareAddressItem | RegularAddressItem>{}

export interface TxBuilderConfigPrimitiveWithChainId
  extends TxBuilderConfigPrimitive {
  chainId: string;
}
