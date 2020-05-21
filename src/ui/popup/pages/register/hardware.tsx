import React, { FunctionComponent, useEffect, useState } from "react";
import style from "./style.module.scss";
import { Label } from "reactstrap";
import classnames from "classnames";
import { strongPassword } from "../../../../common/strong-password";
import { observer } from "mobx-react";
import { useIntl } from "react-intl";
import flushPromises from "flush-promises";
import { LedgerNanoMsg } from "../../../../background/ledger-nano";
import { METHODS } from "../../../../background/ledger-nano/constants";
import { sendMessage } from "../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

export interface Props {
  onRegister: (publicKeyHex: string, password: string) => void;
  propsAddress: string;
}

export const Hardware: FunctionComponent<Props> = observer(
  ({ onRegister, propsAddress = "" }) => {
    let connectToHardwareWalletInterval: NodeJS.Timeout;
    let getPublicKeyFromConnectedHardwareWalletInterval: NodeJS.Timeout;
    const intl = useIntl();
    const [password, setPassword] = useState("");
    const [hardwareErrorMessage, setHardwareErrorMessage] = useState("");
    const [showRetryButton, setShowRetryButton] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [publicKeyHex, setPublicKeyHex] = useState("");
    debugger;
    const [address, setAddress] = useState(propsAddress);
    const [
      passwordConfirmErrorMessage,
      setPasswordConfirmErrorMessage
    ] = useState("");

    const handleSubmit = async () => {
      wipeFormErrors();
      await flushPromises();
      if (!validatePassword()) return;
      if (!passwordConfirmValidate()) return;
      onRegister(publicKeyHex, password);
    };

    //on mount
    useEffect(() => {
      connectToHardwareWallet();
    }, []);

    //on unmount clear intervals
    useEffect(
      () => () => {
        clearInterval(connectToHardwareWalletInterval);
        clearInterval(getPublicKeyFromConnectedHardwareWalletInterval);
      },
      []
    );

    const wipeFormErrors = () => {
      setPasswordErrorMessage("");
      setPasswordConfirmErrorMessage("");
      setShowRetryButton(false);
      setHardwareErrorMessage("");
    };

    const hasError = () => {
      return passwordConfirmErrorMessage.length || passwordErrorMessage.length;
    };

    const passwordConfirmValidate = () => {
      if (!password.length || !passwordConfirm.length) return false;

      if (password !== passwordConfirm) {
        setPasswordConfirmErrorMessage(
          intl.formatMessage({
            id: "register.create.input.confirm-password.error.unmatched"
          })
        );
        return false;
      }
      return true;
    };

    const validatePassword = () => {
      if (password === "" || password.length === 0) {
        setPasswordErrorMessage(
          intl.formatMessage({
            id: "register.create.input.password.error.required"
          })
        );
        return false;
      }

      const strong = strongPassword(password);
      if (strong !== true) {
        setPasswordErrorMessage(
          intl.formatMessage({
            id: strong
          })
        );
        return false;
      }
      return true;
    };

    const getPublicKeyFromConnectedHardwareWallet = async () => {
      let error = false;

      let msg = LedgerNanoMsg.create(METHODS.getCosmosAddress);

      const address = await sendMessage(BACKGROUND_PORT, msg);

      if (typeof address.errorMessage !== "undefined") {
        error = true;
        setHardwareErrorMessage(address.errorMessage);
      }

      msg = LedgerNanoMsg.create(METHODS.getPubKeyHex);

      const publicKeyHex = await sendMessage(BACKGROUND_PORT, msg);

      if (typeof publicKeyHex.errorMessage !== "undefined") {
        error = true;
        setHardwareErrorMessage(publicKeyHex.errorMessage as string);
      }

      if (!error) {
        wipeFormErrors();
        await flushPromises();
        clearInterval(getPublicKeyFromConnectedHardwareWalletInterval);
        setAddress(address.result as string);
        setPublicKeyHex(publicKeyHex.result as string);
      }
    };

    async function connectToHardwareWallet() {
      let error = false;
      let msg = LedgerNanoMsg.create(METHODS.isSupportedVersion);
      let result = await sendMessage(BACKGROUND_PORT, msg);

      if (typeof result.errorMessage !== "undefined") {
        error = true;
        setHardwareErrorMessage(result.errorMessage);
      }

      if (error) {
        setShowRetryButton(true);
        clearInterval(connectToHardwareWalletInterval);
        return;
      }

      msg = LedgerNanoMsg.create(METHODS.isCosmosAppOpen);
      result = await sendMessage(BACKGROUND_PORT, msg);

      if (typeof result.errorMessage !== "undefined") {
        error = true;
        setHardwareErrorMessage(result.errorMessage);
      }

      if (error) {
        setShowRetryButton(false);
        connectToHardwareWalletInterval = setInterval(
          connectToHardwareWallet,
          5000
        );
      } else if (!error) {
        // lets start trying to get the public key now.
        clearInterval(connectToHardwareWalletInterval);
        getPublicKeyFromConnectedHardwareWalletInterval = setInterval(
          getPublicKeyFromConnectedHardwareWallet,
          1000
        );
      }
    }

    return (
      <div id="my-extension-root-inner">
        <div className={style.hardwareTitle}>
          Login using a Ledger Nano X or S
        </div>
        <form id="form" className={style.recoveryForm}>
          <span className={style.hardwareSubheading}>
            Login using a Ledger Nano running Cosmos Application Address:{" "}
          </span>
          <span className={style.address}>
            {address.length ? (
              <span>
                {address.substring(0, 30)} <br></br> {address.substring(30)}
              </span>
            ) : (
              ""
            )}
          </span>
          <span className={style.error}>{hardwareErrorMessage}</span>
          {showRetryButton ? (
            <button onClick={connectToHardwareWallet}>retry</button>
          ) : (
            ""
          )}
          <Label
            for="password"
            className={style.label}
            style={{ width: "100%" }}
          >
            Create Account Password
          </Label>
          <input
            disabled={hardwareErrorMessage.length !== 0}
            type="password"
            className={classnames(
              style.recoverInput,
              passwordErrorMessage.length !== 0 ? "red" : false
            )}
            id="password"
            name="password"
            value={password}
            onChange={(event: {
              target: { value: React.SetStateAction<string> };
            }) => {
              wipeFormErrors();
              setPassword(event.target.value);
            }}
          ></input>
          <output
            className={classnames(style.output, hasError() ? "red" : "")}
            id="output"
          >
            {passwordErrorMessage}
          </output>
          <Label
            for="passwordConfirm"
            className={style.label}
            style={{ width: "100%" }}
          >
            Confirm Password
          </Label>
          <input
            type="password"
            disabled={hardwareErrorMessage.length !== 0}
            className={classnames(
              style.recoverInput,
              passwordConfirmErrorMessage.length !== 0 ? "red" : false
            )}
            id="passwordConfirm"
            name="passwordConfirm"
            value={passwordConfirm}
            onChange={(event: {
              target: { value: React.SetStateAction<string> };
            }) => {
              wipeFormErrors();
              setPasswordConfirm(event.target.value);
            }}
          ></input>
          <output
            className={classnames(style.output, hasError() ? "red" : "")}
            id="output"
          >
            {passwordConfirmErrorMessage}
          </output>
          <div className={style.output}>
            <button
              type="submit"
              className={classnames(style.recoverButton, "green")}
              onClick={event => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              {intl.formatMessage({
                id: "register.intro.button.recover-choice.hardware.submit"
              })}
            </button>
          </div>
        </form>
      </div>
    );
  }
);
