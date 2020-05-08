import Ledger from "@lunie/cosmos-ledger/lib/cosmos-ledger";
import { REQUIRED_COSMOS_APP_VERSION } from "../../config";
import flushPromises from "flush-promises";
import { PubKeySecp256k1 } from "@everett-protocol/cosmosjs/crypto";

export default class LedgerNano {
  private ledger: Ledger;

  /**
   * in-lei of constructor since constructor cannot be async.
   */
  public async connect() {
    // singleton
    if (this.ledger) return;

    const ledger = new Ledger();
    await ledger.connect();
    this.ledger = ledger;
  }

  async getPubKeyHex() {
       await this.connect();
    const publicKey = await this.ledger.getPubKey();
    const pubKeySecp256k1 = new PubKeySecp256k1(publicKey);
    return pubKeySecp256k1.toString("hex");
  }
  async getCosmosAddress() {
       await this.connect();
    const publicKey = await this.ledger.getPubKey();
    const pubKeySecp256k1 = new PubKeySecp256k1(publicKey);
    return pubKeySecp256k1.toAddress().toBech32("cosmos");
  }

  async isCosmosAppOpen() {
    await this.connect();
    await this.ledger.isCosmosAppOpen();
    this.checkLedgerErrors(response);
    const { appName } = response;

    if (appName.toLowerCase() !== `cosmos`) {
      throw new Error(`Close ${appName} and open the Cosmos app`);
    }
  }

  public async sign(message: Uint8Array): Promise<Buffer> {
    const utf8Decoder = new TextDecoder();
    const messageUTF = utf8Decoder.decode(message);
    this.connect();
    return await this.ledger.sign(messageUTF);
  }

  async getCosmosAppVersion() {
    await this.connect();
    const response = await this.ledger.getCosmosAppVersion();
    this.checkLedgerErrors(response);
    const { major, minor, patch, test_mode } = response;
    checkAppMode(this.testModeAllowed, test_mode);
    const version = versionString({ major, minor, patch });
    return version;
  }

  checkLedgerErrors(
    { error_message: errorMessage, device_locked },
    {
      timeoutMessag = "Connection timed out. Please try again.",
      rejectionMessage = "User rejected the transaction"
    } = {}
  ) {
    if (device_locked) {
      throw new Error(`Ledger's screensaver mode is on`);
    }
    switch (errorMessage) {
      case `U2F: Timeout`:
        throw new Error(timeoutMessag);
      case `Cosmos app does not seem to be open`:
        throw new Error(`Cosmos app is not open`);
      case `Command not allowed`:
        throw new Error(`Transaction rejected`);
      case `Transaction rejected`:
        throw new Error(rejectionMessage);
      case `Unknown error code`:
        throw new Error(`Ledger's screensaver mode is on`);
      case `Instruction not supported`:
        throw new Error(
          `Your Cosmos Ledger App is not up to date. ` +
            `Please update to version ${REQUIRED_COSMOS_APP_VERSION}.`
        );
      case `No errors`:
        break;
      default:
        throw new Error(errorMessage);
    }
  }
}
