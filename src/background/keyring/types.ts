import {EncryptedKeyStructure} from "./crypto";
import {PrivKey} from "@everett-protocol/cosmosjs/crypto";

export interface TxBuilderConfigPrimitive {
  accountNumber?: string; // bigInteger.BigNumber;
  sequence?: string; // bigInteger.BigNumber;
  gas: string; // bigInteger.BigNumber;
  gasAdjustment?: number;
  memo: string;
  fee: string; // Coin[] | Coin;
  gasPrice?: number;
}

export interface AddressBookItem {
    address: number;
    encryptedKeyStructure?: EncryptedKeyStructure;
    publicKeyHex: string;
    privateKey?: PrivKey;
    hdWallet: boolean;
    mneumonicAssociated: boolean;
}

export interface AddressBook extends Array<AddressBookItem>{}



export interface TxBuilderConfigPrimitiveWithChainId
  extends TxBuilderConfigPrimitive {
  chainId: string;
}
