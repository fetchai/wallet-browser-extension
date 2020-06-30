import { Message, MessageSender } from "../../common/message";
import { ROUTE } from "./constants";

export class RequestBackgroundTxMsg extends Message<{}> {
  public static type() {
    return "request-background-tx";
  }

  /**
   * @param txBytes Hex encoded bytes for tx
   * @param mode Broadcast mode
   */
  public static create(
    txBytes: string,
    mode: "sync" | "async" | "commit" = "commit",
    origin: string
  ): RequestBackgroundTxMsg {
    const msg = new RequestBackgroundTxMsg();
    msg.txBytes = txBytes;
    msg.mode = mode;
    msg.origin = origin;
    return msg;
  }

  public txBytes: string = "";
  public mode?: "sync" | "async" | "commit";
  public origin: string = "";

  validateBasic(): void {

    if (!this.txBytes) {
      throw new Error("tx bytes is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "commit")
    ) {
      throw new Error("invalid mode");
    }
  }

  // Approve external approves sending message if they submit their origin correctly.
  // Keeper or handler must check that this origin has right permission.
  approveExternal(sender: MessageSender): boolean {
    const isInternal = super.approveExternal(sender);
    if (isInternal) {
      return true;
    }

    // TODO: When is a url undefined?
    if (!sender.url) {
      throw new Error("url is empty");
    }

    if (!this.origin) {
      throw new Error("origin is empty");
    }

    const url = new URL(sender.url);
    return url.origin === this.origin;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestBackgroundTxMsg.type();
  }
}
