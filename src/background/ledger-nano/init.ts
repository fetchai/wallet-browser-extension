import { MessageManager } from "../../common/message/manager";
import { LedgerNanoMsg } from "./messages";
import { ROUTE } from "../ledger-nano/constants";
import { getHandler } from "../ledger-nano/handler";

export function init(messageManager: MessageManager): void {
  messageManager.registerMessage(LedgerNanoMsg);
  messageManager.addHandler(ROUTE, getHandler());
}
