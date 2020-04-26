import { MessageManager } from "../../common/message/manager";
import { GetBalanceMsg, QueryAccountMsg } from "./messages";
import { ROUTE } from "../keyring/constants";
import { getHandler } from "../api/handler";
import {APIKeeper} from "./keeper";

export function init(messageManager: MessageManager, keeper: APIKeeper): void {
  messageManager.registerMessage(QueryAccountMsg);
  messageManager.registerMessage(GetBalanceMsg);
  messageManager.addHandler(ROUTE, getHandler(keeper));
}
