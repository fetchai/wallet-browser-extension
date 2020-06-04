import { Handler, InternalHandler, Message } from "../../common/message";
import { GetBalanceMsg, QueryAccountMsg } from "./messages";
import { APIKeeper, CoinParams } from "./keeper";

export const getHandler: (keeper: APIKeeper) => Handler = keeper => {
  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetBalanceMsg:
        return handleGetBalanceMsg()(msg as GetBalanceMsg);
      case QueryAccountMsg:
        return handleQueryAccountMsg(keeper)(msg as GetBalanceMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetBalanceMsg: () => (
  msg: any
) => Promise<{ coins: CoinParams[] }> = () => {
  return async msg => {
    return {
      coins: await APIKeeper.getBalance(msg.rest, msg.bech32Address)
    };
  };
};

const handleQueryAccountMsg: (
  keeper: APIKeeper
) => InternalHandler<QueryAccountMsg> = () => {
  return async msg => {
    return await APIKeeper.queryAccount(msg.rest, msg.bech32Address);
  };
};
