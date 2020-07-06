import { Handler, Message } from "../../common/message";
import { LedgerNanoMsg } from "./messages";
import LedgerNano from "./keeper";
import { METHODS } from "./constants";

export const getHandler: () => Handler = () => {
  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case LedgerNanoMsg:
        return handleLedgerNanoMsg()(msg as LedgerNanoMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleLedgerNanoMsg: () => (
  msg: LedgerNanoMsg
) => Promise<{
  result: string | undefined;
  errorMessage: string | undefined;
}> = () => {
  return async (msg: LedgerNanoMsg) => {
    let res;
    let errorMessage;
    /**
     * This differs from the other background messages in that we have one message and several different
     */
    try {
      debugger;
      const ledger = await LedgerNano.getInstance();

      switch (msg.method) {
        case METHODS.getCosmosAddress:
          res = await ledger.getCosmosAddress();
          break;
        case METHODS.getPubKeyHex:
          res = await ledger.getPubKeyHex();
          break;
        case METHODS.isSupportedVersion:
          await ledger.isSupportedVersion();
          break;
        case METHODS.isCosmosAppOpen:
          await ledger.isCosmosAppOpen();
          break;
        default:
          throw new Error("Unknown msg type");
      }
    } catch (error) {
<<<<<<< HEAD
=======
      debugger;
>>>>>>> b6b9c378723716e1b7137d9813d09ef5eb92defd

      errorMessage = error.message;
    }

    return {
      result: res,
      errorMessage: errorMessage
    };
  };
};
