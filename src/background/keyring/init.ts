import { MessageManager } from "../../common/message";
import {
  EnableKeyRingMsg,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  SetLastActiveMsg,
  CreateKeyMsg,
  CreateHardwareKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  VerifyPasswordKeyRingMsg,
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
  IsHardwareLinkedMsg,
  FetchEveryAddressMsg,
  SetActiveAddressMsg,
  GetActiveAddressMsg,
  GetDeleteAddressMsg, SubmitSignedLedgerMessage
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: KeyRingKeeper
): void {
  messageManager.registerMessage(EnableKeyRingMsg);
  messageManager.registerMessage(GetActiveAddressMsg);
  messageManager.registerMessage(SetActiveAddressMsg);
  messageManager.registerMessage(GetRegisteredChainMsg);
  messageManager.registerMessage(GetKeyRingStatusMsg);
  messageManager.registerMessage(RestoreKeyRingMsg);
  messageManager.registerMessage(SaveKeyRingMsg);
  messageManager.registerMessage(SetLastActiveMsg);
  messageManager.registerMessage(ClearKeyRingMsg);
  messageManager.registerMessage(IsHardwareLinkedMsg);
  messageManager.registerMessage(CreateKeyMsg);
  messageManager.registerMessage(CreateHardwareKeyMsg);
  messageManager.registerMessage(LockKeyRingMsg);
  messageManager.registerMessage(UnlockKeyRingMsg);
  messageManager.registerMessage(VerifyPasswordKeyRingMsg);
  messageManager.registerMessage(makeMnemonicMsg);
  messageManager.registerMessage(GetKeyFileMsg);
  messageManager.registerMessage(UpdatePasswordMsg);
  messageManager.registerMessage(FetchEveryAddressMsg);
  messageManager.registerMessage(GetKeyMsg);
  messageManager.registerMessage(RequestTxBuilderConfigMsg);
  messageManager.registerMessage(GetRequestedTxBuilderConfigMsg);
  messageManager.registerMessage(ApproveTxBuilderConfigMsg);
  messageManager.registerMessage(RejectTxBuilderConfigMsg);
  messageManager.registerMessage(RequestSignMsg);
  messageManager.registerMessage(GetRequestedMessage);
  messageManager.registerMessage(GetDeleteAddressMsg);
  messageManager.registerMessage(SubmitSignedLedgerMessage);
  messageManager.registerMessage(ApproveSignMsg);
  messageManager.registerMessage(RejectSignMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
