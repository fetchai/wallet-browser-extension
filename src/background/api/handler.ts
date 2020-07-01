import { Handler, InternalHandler, Message } from "../../common/message";
import {
  GetBalanceMsg,
  GetChainIdAndCheckEndPointsAreOnlineMsg,
  QueryAccountMsg
} from "./messages";
import { APIKeeper, CoinParams } from "./keeper";
import {
  REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_AND_RPC_ID,
  REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_ID,
  REGISTER_CUSTOM_ENDPOINT_URL_ERROR_RPC_ID
} from "./constants";

export const getHandler: (keeper: APIKeeper) => Handler = keeper => {
  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetBalanceMsg:
        return handleGetBalanceMsg()(msg as GetBalanceMsg);
      case GetChainIdAndCheckEndPointsAreOnlineMsg:
        return handleGetChainIdAndCheckEndPointsAreOnlineMsg()(
          msg as GetChainIdAndCheckEndPointsAreOnlineMsg
        );
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

/**
 * We check if the rest url is online and fetch and return the chain id from the rpc url and otherwise we return an error message if either fails.
 *
 */

export interface ChainIdCheckResponse {
  chainId?: string;
  errorId?: string;
}
const handleGetChainIdAndCheckEndPointsAreOnlineMsg: () => (
  msg: any
) => Promise<any> = () => {
  return async msg => {
    let chainId;
    debugger;
    let error: boolean | string = false;
    try {
      chainId = await APIKeeper.getChainId(msg.rpc);
    } catch (err) {
      error = REGISTER_CUSTOM_ENDPOINT_URL_ERROR_RPC_ID;
    }

    const res = await APIKeeper.isRestURLOnline(msg.rest);

    // if we have a false rest response and already had an error then we show the message for both failing
    if (res === false && error)
      error = REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_AND_RPC_ID;
    else if (res === false) error = REGISTER_CUSTOM_ENDPOINT_URL_ERROR_REST_ID;

    return error ? { errorId: error } : { chainId: chainId as string };
  };
};

const handleQueryAccountMsg: (
  keeper: APIKeeper
) => InternalHandler<QueryAccountMsg> = () => {
  return async msg => {
    return await APIKeeper.queryAccount(msg.rest, msg.bech32Address);
  };
};
