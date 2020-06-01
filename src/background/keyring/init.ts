import { MessageManager } from "../../common/message";
import {
  EnableKeyRingMsg,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  CreateHardwareKeyMsg,
  SetPathMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  makeMnemonicMsg,
  UpdatePasswordMsg,
  GetRequestedMessage,
  RequestSignMsg,
  ApproveTxBuilderConfigMsg,
  RejectTxBuilderConfigMsg,
  ApproveSignMsg,
  RejectSignMsg,
  GetRegisteredChainMsg,
  GetKeyRingStatusMsg,
  LockKeyRingMsg,
  ClearKeyRingMsg,
  RequestTxBuilderConfigMsg,
  GetRequestedTxBuilderConfigMsg,
  GetKeyFileMsg,
  IsHardwareLinkedMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: KeyRingKeeper
): void {
  messageManager.registerMessage(EnableKeyRingMsg);
  messageManager.registerMessage(GetRegisteredChainMsg);
  messageManager.registerMessage(GetKeyRingStatusMsg);
  messageManager.registerMessage(RestoreKeyRingMsg);
  messageManager.registerMessage(SaveKeyRingMsg);
  messageManager.registerMessage(ClearKeyRingMsg);
  messageManager.registerMessage(IsHardwareLinkedMsg);
  messageManager.registerMessage(CreateKeyMsg);
  messageManager.registerMessage(CreateHardwareKeyMsg);
  messageManager.registerMessage(LockKeyRingMsg);
  messageManager.registerMessage(UnlockKeyRingMsg);
  messageManager.registerMessage(makeMnemonicMsg);
  messageManager.registerMessage(GetKeyFileMsg);
  messageManager.registerMessage(UpdatePasswordMsg);
  messageManager.registerMessage(SetPathMsg);
  messageManager.registerMessage(GetKeyMsg);
  messageManager.registerMessage(RequestTxBuilderConfigMsg);
  messageManager.registerMessage(GetRequestedTxBuilderConfigMsg);
  messageManager.registerMessage(ApproveTxBuilderConfigMsg);
  messageManager.registerMessage(RejectTxBuilderConfigMsg);
  messageManager.registerMessage(RequestSignMsg);
  messageManager.registerMessage(GetRequestedMessage);
  messageManager.registerMessage(ApproveSignMsg);
  messageManager.registerMessage(RejectSignMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
