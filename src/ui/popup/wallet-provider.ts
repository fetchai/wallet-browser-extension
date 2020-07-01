import {
  Key,
  WalletProvider
} from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import {
  ApproveSignMsg,
  GetKeyMsg,
  RequestSignMsg,
  RequestTxBuilderConfigMsg
} from "../../background/keyring";
import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import {
  txBuilderConfigFromPrimitive,
  txBuilderConfigToPrimitive
} from "../../background/keyring/utils";

const Buffer = require("buffer/").Buffer;

export interface FeeApprover {
  onRequestTxBuilderConfig: (index: string) => void;
}

export interface AccessApprover {
  onRequestSignature: (index: string) => void;
}

export class PopupWalletProvider implements WalletProvider {
  /**
   * @param feeApprover If this field is null, skip fee approving.
   * @param accessApprover If this field is null, skip sign approving.
   */
  constructor(
    private feeApprover?: FeeApprover,
    private accessApprover?: AccessApprover
  ) {}

  /**
   * Request access to the user's accounts. Wallet can ask the user to approve or deny access. If user deny access, it will throw error.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enable(_: Context): Promise<void> {
    // TODO
    return Promise.resolve();
  }

  /**
   * Get array of keys that includes bech32 address string, address bytes and public key from wallet if user have approved the access.
   */
  async getKeys(): Promise<Key[]> {
    const msg = GetKeyMsg.create(
      // There is no need to set origin because this wallet provider is used in internal.
      ""
    );
    const key = await sendMessage(BACKGROUND_PORT, msg);
    return Promise.resolve([
      {
        algo: key.algo,
        bech32Address: key.bech32Address,
        pubKey: new Uint8Array(Buffer.from(key.pubKeyHex, "hex")),
        address: new Uint8Array(Buffer.from(key.addressHex, "hex"))
      }
    ]);
  }

  /**
   * Request tx builder config from provider.
   * This is optional method.
   * If provider supports this method, tx builder will request tx config with prefered tx config that is defined by developer who uses cosmosjs.
   * Received tx builder config can be changed in the client. The wallet provider must verify that it is the same as the tx builder config sent earlier or warn the user before signing.
   */
  getTxBuilderConfig(
    _context: Context,
    config: TxBuilderConfig
  ): Promise<TxBuilderConfig> {
    if (!this.feeApprover) {
      return Promise.resolve(config);
    }

    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    const requestTxBuilderConfig = RequestTxBuilderConfigMsg.create(
      {
        ...txBuilderConfigToPrimitive(config)
      },
      id,
      false,
      // There is no need to set origin because this wallet provider is used in internal.
      ""
    );

    return new Promise<TxBuilderConfig>((resolve, reject) => {
      sendMessage(BACKGROUND_PORT, requestTxBuilderConfig)
        .then(({ config }) => {
          resolve(txBuilderConfigFromPrimitive(config));
        })
        .catch(e => {
          reject(e);
        });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.feeApprover!.onRequestTxBuilderConfig(id);
    });
  }

  /**
   * Request signature from matched address if user have approved the access.
   */
  sign(
    _context: Context,
    bech32Address: string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    const requestSignMsg = RequestSignMsg.create(
      id,
      bech32Address,
      Buffer.from(message).toString("hex"),
      false,
      // There is no need to set origin because this wallet provider is used in internal.
      ""
    );
    return new Promise<Uint8Array>((resolve, reject) => {
      sendMessage(BACKGROUND_PORT, requestSignMsg)
        .then(({ signatureHex }) => {
          resolve(new Uint8Array(Buffer.from(signatureHex, "hex")));
        })
        .catch(e => {
          reject(e);
        });

      if (this.accessApprover) {
        this.accessApprover.onRequestSignature(id);
      } else {
        sendMessage(BACKGROUND_PORT, ApproveSignMsg.create(id));
      }
    });
  }
}
