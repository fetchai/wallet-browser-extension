import { Message, MessageSender } from "../../common/message";
import { ROUTE } from "./constants";
import { ChainInfo } from "../../chain-info";
import { KeyRingStatus } from "./keyring";
import { KeyHex } from "./keeper";
import {
  TxBuilderConfigPrimitive
} from "./types";
import { AsyncApprover } from "../../common/async-approver";
import { EncryptedKeyStructure } from "./crypto";

export class EnableKeyRingMsg extends Message<{
  status: KeyRingStatus;
}> {
  public static type() {
    return "enable-keyring";
  }

  public static create(origin: string): EnableKeyRingMsg {
    const msg = new EnableKeyRingMsg();
    msg.origin = origin;
    return msg;
  }

  public origin: string = "";

  validateBasic(): void {}

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
    return EnableKeyRingMsg.type();
  }
}

export class GetRegisteredChainMsg extends Message<{
  // Need to set prototype for elements of array manually.
  chainInfos: ChainInfo[];
}> {
  public static type() {
    return "get-registered-chain-infos";
  }

  public static create(): GetRegisteredChainMsg {
    return new GetRegisteredChainMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRegisteredChainMsg.type();
  }
}

export class GetKeyRingStatusMsg extends Message<{
  // Need to set prototype for elements of array manually.
  keyRingStatus: KeyRingStatus;
}> {
  public static type() {
    return "get-key-ring-status";
  }

  public static create(): GetKeyRingStatusMsg {
    return new GetKeyRingStatusMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyRingStatusMsg.type();
  }
}

export class RestoreKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "restore-keyring";
  }

  public static create(): RestoreKeyRingMsg {
    return new RestoreKeyRingMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RestoreKeyRingMsg.type();
  }
}

export class SaveKeyRingMsg extends Message<{ success: boolean }> {
  public static type() {
    return "save-keyring";
  }

  public static create(): SaveKeyRingMsg {
    return new SaveKeyRingMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SaveKeyRingMsg.type();
  }
}

export class ClearKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "clear-keyring";
  }

  public static create(): ClearKeyRingMsg {
    return new ClearKeyRingMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ClearKeyRingMsg.type();
  }
}
export class IsHardwareLinkedMsg extends Message<{ result: boolean }> {
  public static type() {
    return "is-hardware-linked";
  }

  public static create(): IsHardwareLinkedMsg {
    return new IsHardwareLinkedMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return IsHardwareLinkedMsg.type();
  }
}

export class CreateKeyMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "create-key";
  }

  public static create(mnemonic: string, password: string): CreateKeyMsg {
    const msg = new CreateKeyMsg();
    msg.mnemonic = mnemonic;
    msg.password = password;
    return msg;
  }

  public mnemonic = "";
  public password = "";

  validateBasic(): void {
    if (!this.mnemonic) {
      throw new Error("mnemonic not set");
    }

    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateKeyMsg.type();
  }
}

export class CreateHardwareKeyMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "create-hardware-key";
  }

  public static create(
    publicKeyHex: string,
    password: string
  ): CreateHardwareKeyMsg {
    const msg = new CreateHardwareKeyMsg();
    msg.publicKeyHex = publicKeyHex;
    msg.password = password;
    return msg;
  }

  public publicKeyHex = "";
  public password = "";

  validateBasic(): void {
    if (!this.publicKeyHex) {
      throw new Error("hex public key not set");
    }

    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateHardwareKeyMsg.type();
  }
}

export class LockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "lock-keyring";
  }

  public static create(): LockKeyRingMsg {
    return new LockKeyRingMsg();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LockKeyRingMsg.type();
  }
}

export class UnlockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "unlock-keyring";
  }

  public static create(password: string): UnlockKeyRingMsg {
    const msg = new UnlockKeyRingMsg();
    msg.password = password;
    return msg;
  }

  public password = "";

  validateBasic(): void {
    if (!this.password) {
      throw new Error("password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UnlockKeyRingMsg.type();
  }
}

export class VerifyPasswordKeyRingMsg extends Message<{
  success: boolean;
}> {
  public static type() {
    return "verify-password-keyring";
  }

  public static create(
    password: string,
    keyFile: EncryptedKeyStructure | null = null
  ): VerifyPasswordKeyRingMsg {
    const msg = new VerifyPasswordKeyRingMsg();
    msg.password = password;
    msg.keyFile = keyFile;
    return msg;
  }

  validateBasic(): void {
    if (!this.password) {
      throw new Error("password not set");
    }
  }

  public password = "";
  public keyFile: EncryptedKeyStructure | null = null;

  route(): string {
    return ROUTE;
  }

  type(): string {
    return VerifyPasswordKeyRingMsg.type();
  }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class makeMnemonicMsg extends Message<{
  mnemonic: string;
}> {
  public static type() {
    return "get mnemonic";
  }

  public static create(
    password: string,
    keyFile: EncryptedKeyStructure
  ): makeMnemonicMsg {
    const msg = new makeMnemonicMsg();
    msg.password = password;
    msg.keyFile = keyFile;
    return msg;
  }

  validateBasic(): void {
    if (!this.password) {
      throw new Error("password not set");
    }

    if (this.keyFile === null) {
      throw new Error("password not set");
    }
  }

  public password = "";
  public keyFile: EncryptedKeyStructure | null = null;

  route(): string {
    return ROUTE;
  }

  type(): string {
    return makeMnemonicMsg.type();
  }
}

export class UpdatePasswordMsg extends Message<{
  success: boolean;
}> {
  public static type() {
    return "update-password-msg";
  }

  public static create(
    password: string,
    newPassword: string
  ): UpdatePasswordMsg {
    const msg = new UpdatePasswordMsg();
    msg.password = password;
    msg.newPassword = newPassword;
    return msg;
  }

  validateBasic(): void {
    if (!this.password) {
      throw new Error("password not set");
    }

    if (!this.newPassword) {
      throw new Error("new password not set");
    }
  }

  public password = "";
  public newPassword = "";

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdatePasswordMsg.type();
  }
}

export class GetKeyFileMsg extends Message<{
  file: any;
}> {
  public static type() {
    return "get-key-file-msg";
  }

  public static create(): GetKeyFileMsg {
    return new GetKeyFileMsg();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyFileMsg.type();
  }
}


export class FetchEveryAddressMsg extends Message<{
  AddressList: Array<string>;
}> {
  public static type() {
    return "fetch-every-address";
  }

  public static create(): FetchEveryAddressMsg {
    return new FetchEveryAddressMsg();
  }

  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return FetchEveryAddressMsg.type();
  }
}

export class SetActiveAddressMsg extends Message<{}> {
  public static type() {
    return "set-active-address";
  }

  public address: string = "";

  public static create(address: string): SetActiveAddressMsg {
    const msg = new SetActiveAddressMsg();
    msg.address = address;
    return msg;
  }

  validateBasic(): void {
    if (!this.address) {
      throw new Error("address not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetActiveAddressMsg.type();
  }
}

export class GetActiveAddressMsg extends Message<{ activeAddress: string }> {
  public static type() {
    return "get-active-address";
  }

  public static create(): GetActiveAddressMsg {
    return new GetActiveAddressMsg();
  }

  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetActiveAddressMsg.type();
  }
}

export class GetKeyMsg extends Message<KeyHex> {
  public static type() {
    return "get-key";
  }

  public static create(origin: string): GetKeyMsg {
    const msg = new GetKeyMsg();
    msg.origin = origin;
    return msg;
  }

  public origin: string = "";

  validateBasic(): void {}

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
    return GetKeyMsg.type();
  }
}

export class RequestTxBuilderConfigMsg extends Message<{
  config: TxBuilderConfigPrimitive;
}> {
  public static type() {
    return "request-tx-builder-config";
  }

  public static create(
    config: TxBuilderConfigPrimitive,
    id: string,
    openPopup: boolean,
    origin: string
  ): RequestTxBuilderConfigMsg {
    const msg = new RequestTxBuilderConfigMsg();
    msg.config = config;
    msg.id = id;
    msg.openPopup = openPopup;
    msg.origin = origin;
    return msg;
  }

  public config?: TxBuilderConfigPrimitive;
  public id: string = "";
  public openPopup: boolean = false;
  public origin: string = "";

  validateBasic(): void {
    if (!this.config) {
      throw new Error("config is null");
    }

    AsyncApprover.isValidId(this.id);
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
    return RequestTxBuilderConfigMsg.type();
  }
}

export class GetRequestedTxBuilderConfigMsg extends Message<{
  config: TxBuilderConfigPrimitive;
}> {
  public static type() {
    return "get-requested-tx-builder-config";
  }

  public static create(id: string): GetRequestedTxBuilderConfigMsg {
    const msg = new GetRequestedTxBuilderConfigMsg();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRequestedTxBuilderConfigMsg.type();
  }
}

export class ApproveTxBuilderConfigMsg extends Message<{}> {
  public static type() {
    return "approve-tx-builder-config";
  }

  public static create(
    id: string,
    config: TxBuilderConfigPrimitive
  ): ApproveTxBuilderConfigMsg {
    const msg = new ApproveTxBuilderConfigMsg();
    msg.id = id;
    msg.config = config;
    return msg;
  }

  public id: string = "";
  public config?: TxBuilderConfigPrimitive;

  validateBasic(): void {
    if (!this.config) {
      throw new Error("config is empty");
    }

    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveTxBuilderConfigMsg.type();
  }
}

export class RejectTxBuilderConfigMsg extends Message<{}> {
  public static type() {
    return "reject-tx-builder-config";
  }

  public static create(id: string): RejectTxBuilderConfigMsg {
    const msg = new RejectTxBuilderConfigMsg();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectTxBuilderConfigMsg.type();
  }
}

export class RequestSignMsg extends Message<{ signatureHex: string }> {
  public static type() {
    return "request-sign";
  }

  public static create(
    id: string,
    bech32Address: string,
    messageHex: string,
    openPopup: boolean,
    origin: string
  ): RequestSignMsg {
    const msg = new RequestSignMsg();
    msg.id = id;
    msg.bech32Address = bech32Address;
    msg.messageHex = messageHex;
    msg.openPopup = openPopup;
    msg.origin = origin;
    return msg;
  }

  public id: string = "";
  public bech32Address: string = "";
  // Hex encoded message.
  public messageHex: string = "";
  public openPopup: boolean = false;
  public origin: string = "";

  validateBasic(): void {

    if (!this.bech32Address) {
      throw new Error("bech32 address not set");
    }

    if (!this.messageHex) {
      throw new Error("message is empty");
    }

    AsyncApprover.isValidId(this.id);
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
    return RequestSignMsg.type();
  }
}

export class GetRequestedMessage extends Message<{
  messageHex: string;
}> {
  public static type() {
    return "get-request-message";
  }

  public static create(id: string): GetRequestedMessage {
    const msg = new GetRequestedMessage();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    if (!this.id) {
      throw new Error("id is empty");
    }

    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRequestedMessage.type();
  }
}
export class ApproveSignMsg extends Message<void> {
  public static type() {
    return "approve-sign";
  }

  public static create(id: string): ApproveSignMsg {
    const msg = new ApproveSignMsg();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveSignMsg.type();
  }
}

export class SubmitSignedLedgerMessage extends Message<void> {
  public static type() {
    return "signed-ledger-message";
  }

  public static create(message: string): SubmitSignedLedgerMessage {
    const msg = new SubmitSignedLedgerMessage();
    msg.message = message;
    return msg;
  }

  public message: string = "";

  validateBasic(): void {
    if (!this.message) {
      throw new Error("message is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitSignedLedgerMessage.type();
  }
}

export class GetDeleteAddressMsg extends Message<void> {
  public static type() {
    return "delete message";
  }

  public static create(address: string): GetDeleteAddressMsg {
    const msg = new GetDeleteAddressMsg();
    msg.address = address;
    return msg;
  }

  public address: string = "";

  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetDeleteAddressMsg.type();
  }
}

export class RejectSignMsg extends Message<void> {
  public static type() {
    return "reject-sign";
  }

  public static create(id: string): RejectSignMsg {
    const msg = new RejectSignMsg();
    msg.id = id;
    return msg;
  }

  public id: string = "";

  validateBasic(): void {
    AsyncApprover.isValidId(this.id);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSignMsg.type();
  }
}
