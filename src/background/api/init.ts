import { MessageManager } from "../../common/message/manager";
import { GetBalanceMsg, GetChainIdMsg, QueryAccountMsg } from "./messages";
import { ROUTE } from "../api/constants";
import { getHandler } from "../api/handler";
import { APIKeeper } from "./keeper";

export function init(messageManager: MessageManager, keeper: APIKeeper): void {
  messageManager.registerMessage(QueryAccountMsg);
  messageManager.registerMessage(GetBalanceMsg);
  messageManager.registerMessage(GetChainIdMsg);
  messageManager.addHandler(ROUTE, getHandler(keeper));
}
