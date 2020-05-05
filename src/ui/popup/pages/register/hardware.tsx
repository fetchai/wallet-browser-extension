import React, { FunctionComponent, useState } from "react";
import style from "./style.module.scss";
import { Label } from "reactstrap";
import classnames from "classnames";
import { strongPassword } from "../../../../common/strong-password";
import { observer } from "mobx-react";
import { useIntl } from "react-intl";
import flushPromises from "flush-promises";
import Ledger from "@lunie/cosmos-ledger/lib/cosmos-ledger";

export const Hardware: FunctionComponent = observer(() => {
  const intl = useIntl();
  const [password, setPassword] = useState("");
  const [hardwareErrorMessage, setHardwareErrorMessage] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [
    passwordConfirmErrorMessage,
    setPasswordConfirmErrorMessage
  ] = useState("");

  const handleSubmit = async () => {
    wipeFormErrors();
    await flushPromises();
    if (!validPassword()) return;
    if (!passwordConfirmValidate()) return;
  };

  const wipeFormErrors = () => {
    setPasswordErrorMessage("");
    setPasswordConfirmErrorMessage("");
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

  const validPassword = () => {
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

  const getAddressFromHardwareWallet = async () => {
    const ledger = new Ledger();

    let error = false;
    await ledger.connect().catch(err => {
      debugger;
      error = true;
      setHardwareErrorMessage(err.message);
    });

    if (error) return false;

    const publicKey = await ledger.getPubKey().catch(err => {
      debugger;
      error = true;
      setHardwareErrorMessage(err.message);
    });
debugger;


    return error ? false : true;
  };

  return (
    <div id="my-extension-root-inner">
      <div className={style.hardwareTitle}>Recover</div>
      <form id="form" className={style.recoveryForm}>
        <output></output>
        <Label for="password" className={style.label} style={{ width: "100%" }}>
          Password
        </Label>
        <input
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
        <input
          type="password"
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
            Upload
          </button>
        </div>
      </form>
    </div>
  );
});
