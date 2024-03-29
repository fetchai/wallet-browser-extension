import { Handler, InternalHandler, Message } from "../../common/message";
import {
  EnableKeyRingMsg,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  SetActiveAddressMsg,
  CreateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  FetchEveryAddressMsg,
  RequestSignMsg,
  ApproveSignMsg,
  RejectSignMsg,
  GetRequestedMessage,
  GetDeleteAddressMsg,
  GetRegisteredChainMsg,
  LockKeyRingMsg,
  ClearKeyRingMsg,
  RequestTxBuilderConfigMsg,
  GetRequestedTxBuilderConfigMsg,
  ApproveTxBuilderConfigMsg,
  RejectTxBuilderConfigMsg,
  VerifyPasswordKeyRingMsg,
  UpdatePasswordMsg,
  GetKeyFileMsg,
  makeMnemonicMsg,
  CreateHardwareKeyMsg,
  IsHardwareLinkedMsg,
  GetKeyRingStatusMsg,
  GetActiveAddressMsg,
  SubmitSignedLedgerMessage
} from "./messages";
import { KeyRingKeeper } from "./keeper";
import { Address } from "@everett-protocol/cosmosjs/crypto";
import {FETCH_PREFIX} from "../../chain-info";

const Buffer = require("buffer/").Buffer;

export const getHandler: (keeper: KeyRingKeeper) => Handler = (
  keeper: KeyRingKeeper
) => {
  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case EnableKeyRingMsg:
        return handleEnableKeyRingMsg(keeper)(msg as EnableKeyRingMsg);
      case GetRegisteredChainMsg:
        return handleGetRegisteredChainMsg(keeper)(
          msg as GetRegisteredChainMsg
        );
      case GetKeyRingStatusMsg:
        return handleGetKeyRingStatusMsg(keeper)(msg as GetKeyRingStatusMsg);
      case RestoreKeyRingMsg:
        return handleRestoreKeyRingMsg(keeper)(msg as RestoreKeyRingMsg);
      case SaveKeyRingMsg:
        return handleSaveKeyRingMsg(keeper)(msg as SaveKeyRingMsg);
      case ClearKeyRingMsg:
        return handleClearKeyRingMsg(keeper)(msg as ClearKeyRingMsg);
      case IsHardwareLinkedMsg:
        return handleIsHardwareLinkedMsg(keeper)(msg as IsHardwareLinkedMsg);
      case CreateKeyMsg:
        return handleCreateKeyMsg(keeper)(msg as CreateKeyMsg);
      case CreateHardwareKeyMsg:
        return handleCreateHardwareKeyMsg(keeper)(msg as CreateHardwareKeyMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(keeper)(msg as LockKeyRingMsg);
      case VerifyPasswordKeyRingMsg:
        return handleVerifyPasswordKeyRingMsg(keeper)(
          msg as VerifyPasswordKeyRingMsg
        );
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(keeper)(msg as UnlockKeyRingMsg);
      case makeMnemonicMsg:
        return handleMakeMnemonicMsg(keeper)(msg as makeMnemonicMsg);
      case UpdatePasswordMsg:
        return handleUpdatePasswordMsg(keeper)(msg as UpdatePasswordMsg);
      case GetKeyFileMsg:
        return handleGetKeyFileMsg(keeper)(msg as GetKeyFileMsg);
      case FetchEveryAddressMsg:
        return handleFetchEveryAddressMsg(keeper)(msg as FetchEveryAddressMsg);
      case SetActiveAddressMsg:
        return handleSetActiveAddressMsg(keeper)(msg as SetActiveAddressMsg);
      case GetActiveAddressMsg:
        return handleGetActiveAddressMsg(keeper)(msg as GetActiveAddressMsg);
      case GetKeyMsg:
        return handleGetKeyMsg(keeper)(msg as GetKeyMsg);
      case RequestTxBuilderConfigMsg:
        return handleRequestTxBuilderConfigMsg(keeper)(
          msg as RequestTxBuilderConfigMsg
        );
      case GetRequestedTxBuilderConfigMsg:
        return handleGetRequestedTxBuilderConfig(keeper)(
          msg as GetRequestedTxBuilderConfigMsg
        );
      case ApproveTxBuilderConfigMsg:
        return handleApproveTxBuilderConfigMsg(keeper)(
          msg as ApproveTxBuilderConfigMsg
        );
      case RejectTxBuilderConfigMsg:
        return handleRejectTxBuilderConfigMsg(keeper)(
          msg as RejectTxBuilderConfigMsg
        );
      case RequestSignMsg:
        return handleRequestSignMsg(keeper)(msg as RequestSignMsg);
      case GetRequestedMessage:
        return handleGetRequestedMessage(keeper)(msg as GetRequestedMessage);
      case GetDeleteAddressMsg:
        return handleDeleteAddressMsg(keeper)(msg as GetRequestedMessage);
      case SubmitSignedLedgerMessage:
        return handleSubmitSignedLedgerMessage(keeper)(
          msg as SubmitSignedLedgerMessage
        );
      case ApproveSignMsg:
        return handleApproveSignMsg(keeper)(msg as ApproveSignMsg);
      case RejectSignMsg:
        return handleRejectSignMsg(keeper)(msg as RejectSignMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleVerifyPasswordKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<any> = keeper => {
  return async msg => {
    return {
      success: await keeper.verifyPassword(msg.password, msg.keyFile)
    };
  };
};

const handleSubmitSignedLedgerMessage: (
  keeper: KeyRingKeeper
) => InternalHandler<any> = keeper => {
  return async msg => {
    await keeper.setLastSignedHardwareMessage(msg.message);

    return {
      success: true
    };
  };
};

const handleEnableKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<EnableKeyRingMsg> = keeper => {
  return async () => {
    return {
      status: await keeper.enable()
    };
  };
};

const handleGetRegisteredChainMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetRegisteredChainMsg> = keeper => {
  return () => {
    return {
      chainInfos: keeper.getRegisteredChains()
    };
  };
};

const handleGetKeyRingStatusMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetKeyRingStatusMsg> = keeper => {
  return () => {
    return {
      keyRingStatus: keeper.getKeyRingStatus()
    };
  };
};

const handleRestoreKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RestoreKeyRingMsg> = keeper => {
  return async () => {
    return {
      status: await keeper.restore()
    };
  };
};

const handleSaveKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<SaveKeyRingMsg> = keeper => {
  return async () => {
    await keeper.save();
    return {
      success: true
    };
  };
};

const handleSetActiveAddressMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<SetActiveAddressMsg> = keeper => {
  return async msg => {
    await keeper.setActiveAddress(msg.address);
    return {
      success: true
    };
  };
};

const handleGetActiveAddressMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetActiveAddressMsg> = keeper => {
  return async () => {
    return {
      activeAddress: keeper.getActiveAddress()
    };
  };
};

const handleClearKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ClearKeyRingMsg> = keeper => {
  return async () => {
    return {
      status: await keeper.clear()
    };
  };
};

const handleIsHardwareLinkedMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<IsHardwareLinkedMsg> = keeper => {
  return async () => {
    return {
      result: keeper.isHardwareLinked()
    };
  };
};

const handleCreateKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<CreateKeyMsg> = keeper => {
  return async msg => {
    return {
      status: await keeper.createKey(msg.mnemonic, msg.password)
    };
  };
};

const handleCreateHardwareKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<CreateHardwareKeyMsg> = keeper => {
  return async msg => {
    return {
      status: await keeper.createHardwareKey(msg.publicKeyHex, msg.password)
    };
  };
};

const handleLockKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<LockKeyRingMsg> = keeper => {
  return () => {
    return {
      status: keeper.lock()
    };
  };
};

const handleUnlockKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<UnlockKeyRingMsg> = keeper => {
  return async msg => {
    return {
      status: await keeper.unlock(msg.password)
    };
  };
};

const handleMakeMnemonicMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<any> = keeper => {
  return async msg => {
    return {
      mnemonic: await keeper.makeMnemonicgMsg(msg.password, msg.keyFile)
    };
  };
};

const handleUpdatePasswordMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<any> = keeper => {
  return async msg => {
    return {
      success: await keeper.updatePassword(msg.password, msg.newPassword)
    };
  };
};

const handleGetKeyFileMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<any> = keeper => {
  return async () => {
    return {
      file: await keeper.handleGetKeyFile()
    };
  };
};

const handleDeleteAddressMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<any> = keeper => {
  return async msg => {
    success: await keeper.handleDeleteAddress(msg.address);
  };
};

const handleFetchEveryAddressMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<FetchEveryAddressMsg> = keeper => {
  return async () => {
    const addressList = keeper.getEveryAddress();
    return {
      AddressList: addressList
    };
  };
};

const handleGetKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetKeyMsg> = keeper => {
  return async () => {
    const key = await keeper.getKey();
    return {
      algo: "secp256k1",
      pubKeyHex: Buffer.from(key.pubKey).toString("hex"),
      addressHex: Buffer.from(key.address).toString("hex"),
      bech32Address: new Address(key.address).toBech32(FETCH_PREFIX)
    };
  };
};

const handleRequestTxBuilderConfigMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RequestTxBuilderConfigMsg> = keeper => {
  return async msg => {
    const config = await keeper.requestTxBuilderConfig(
      // `config` in msg can't be null because `validateBasic` ensures that `config` is not null.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      msg.config!,
      msg.id,
      msg.openPopup
    );
    return {
      config
    };
  };
};

const handleGetRequestedTxBuilderConfig: (
  keeper: KeyRingKeeper
) => InternalHandler<GetRequestedTxBuilderConfigMsg> = keeper => {
  return async msg => {
    const config = keeper.getRequestedTxConfig(msg.id);

    return {
      config
    };
  };
};

const handleApproveTxBuilderConfigMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ApproveTxBuilderConfigMsg> = keeper => {
  return async msg => {
    // `config` in msg can't be null because `validateBasic` ensures that `config` is not null.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    keeper.approveTxBuilderConfig(msg.id, msg.config!);

    return {};
  };
};

const handleRejectTxBuilderConfigMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RejectTxBuilderConfigMsg> = keeper => {
  return async msg => {
    keeper.rejectTxBuilderConfig(msg.id);

    return {};
  };
};

const handleRequestSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RequestSignMsg> = keeper => {
  return async msg => {
    return {
      signatureHex: Buffer.from(
        await keeper.requestSign(
          new Uint8Array(Buffer.from(msg.messageHex, "hex")),
          msg.id,
          msg.openPopup
        )
      ).toString("hex")
    };
  };
};

const handleGetRequestedMessage: (
  keeper: KeyRingKeeper
) => InternalHandler<GetRequestedMessage> = keeper => {
  return msg => {
    const message = keeper.getRequestedMessage(msg.id);
    return {
      messageHex: Buffer.from(message.message).toString("hex")
    };
  };
};

const handleApproveSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ApproveSignMsg> = keeper => {
  return msg => {
    keeper.approveSign(msg.id);
    return;
  };
};

const handleRejectSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RejectSignMsg> = keeper => {
  return msg => {
    keeper.rejectSign(msg.id);
    return;
  };
};
