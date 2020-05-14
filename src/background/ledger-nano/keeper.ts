import Ledger from "@lunie/cosmos-ledger/lib/cosmos-ledger";
import { REQUIRED_COSMOS_APP_VERSION } from "../../config";
import { PubKeySecp256k1 } from "@everett-protocol/cosmosjs/crypto";
import semver from "semver";
const TIMEOUT = 5;
const TEST_MODE_ALLOWED = false;

/**
 * The reason that this is a singleton is that calling the "ledger.connect"
 * method more than once in quick succession can cause failures because connections sometimes are not properly released.
 */
export default class LedgerNano {
  private static instance: LedgerNano;

  private constructor() {
    this.ledger = new Ledger({ testModeAllowed: TEST_MODE_ALLOWED });
  }

  /**
   * The static method that controls the access to the LedgerNano instance.
   */
  public static async getInstance(): Promise<LedgerNano> {
    if (!LedgerNano.instance) {
      LedgerNano.instance = new LedgerNano();
      await LedgerNano.instance.ledger.connect(TIMEOUT);
    }

    return LedgerNano.instance;
  }

  // represents the connection to the ledger nano
  public ledger: Ledger;


  public async getPubKeyHex() {
    const publicKey = await this.ledger.getPubKey();
    const pubKeySecp256k1 = new PubKeySecp256k1(publicKey);
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return pubKeySecp256k1.toString("hex");
  }

  public async getCosmosAddress() {
    const publicKey = await (this.ledger as Ledger).getPubKey();
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
    const version = await (this.ledger as Ledger).getCosmosAppVersion();
    if (!semver.gte(version, REQUIRED_COSMOS_APP_VERSION)) {
      const msg = `Outdated version: Please update Ledger Cosmos App to the latest version.`;
      throw new Error(msg);
    }
  }

  public async sign(message: Uint8Array): Promise<Buffer> {
    const utf8Decoder = new TextDecoder();
    const messageUTF = utf8Decoder.decode(message);
    return await this.ledger.sign(messageUTF);
  }

  public async confirmLedgerAddress() {
    await this.confirmLedgerAddress();
  }
}
