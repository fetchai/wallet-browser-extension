import Ledger from "@lunie/cosmos-ledger/lib/cosmos-ledger";
import { REQUIRED_COSMOS_APP_VERSION } from "../../config";
import { PubKeySecp256k1 } from "@everett-protocol/cosmosjs/crypto";
import semver from "semver";

export default class LedgerNano {
  // represents the connection to the ledger nano
  public ledger: Ledger;
  /**
   * in-lei of constructor (since constructor cannot be async)
   *
   */
  public async connect() {
    // singleton
    if (this.ledger) return;
    const ledger = new Ledger();
    await ledger.connect();
    this.ledger = ledger;
  }

  public static async testDevice() {
    const ledger = new Ledger();
    await ledger.testDevice();
  }

  public async getPubKeyHex() {
    await this.connect();
    const publicKey = await this.ledger.getPubKey();
    const pubKeySecp256k1 = new PubKeySecp256k1(publicKey);
    return pubKeySecp256k1.toString("hex");
  }

  public async getCosmosAddress() {
    await this.connect();
    const publicKey = await this.ledger.getPubKey();
    const pubKeySecp256k1 = new PubKeySecp256k1(publicKey);
    return pubKeySecp256k1.toAddress().toBech32("cosmos");
  }

  /**
   * Is cosmos app open and logged in on ledger nano
   *
   * @throws if cosmos cosmosapp is not open
   */
  public async isCosmosAppOpen() {
    await this.ledger.isCosmosAppOpen();
  }

  /**
   *
   *
   * @throws if cosmos app version is not greater than minimum version specified in configs
   */
  public async isSupportedVersion() {
    await this.connect();
    const version = await this.ledger.getCosmosAppVersion();
    if (!semver.gte(version, REQUIRED_COSMOS_APP_VERSION)) {
      const msg = `Outdated version: Please update Ledger Cosmos App to the latest version.`;
      throw new Error(msg);
    }
  }

  public async sign(message: Uint8Array): Promise<Buffer> {
    await this.connect();
    const utf8Decoder = new TextDecoder();
    const messageUTF = utf8Decoder.decode(message);
    return await this.ledger.sign(messageUTF);
  }

  public async confirmLedgerAddress() {
    await this.connect();
    await this.confirmLedgerAddress();
  }
}
