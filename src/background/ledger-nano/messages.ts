import { METHODS, ROUTE } from "./constants";
import { Message } from "../../common/message";

export class LedgerNanoMsg extends Message<{
  result: string | undefined;
  errorMessage: string | undefined;
}> {
  public method: METHODS | undefined;

  public static type() {
    return "get-ledger-nano";
  }

  /**
   * Rather than have an individual message for each method in just have one, but the RPCCall
   * is a switch used to signify which of the methods of the ledger nano class will be invoked by the message
   *
   * @param RPCCall
   * @param bech32Address
   */
  public static create(method: METHODS): LedgerNanoMsg {
    const msg = new LedgerNanoMsg();
    msg.method = method;
    return msg;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {
    if (!this.method) {
      throw new Error("method not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LedgerNanoMsg.type();
  }
}
