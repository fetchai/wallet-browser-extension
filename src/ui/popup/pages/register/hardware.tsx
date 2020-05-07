import React, { FunctionComponent, useEffect, useState } from "react";
import style from "./style.module.scss";
import { Label } from "reactstrap";
import classnames from "classnames";
import { strongPassword } from "../../../../common/strong-password";
import { observer } from "mobx-react";
import { useIntl } from "react-intl";
import flushPromises from "flush-promises";
import Ledger from "@lunie/cosmos-ledger/lib/cosmos-ledger";
import { PubKeySecp256k1 } from "@everett-protocol/cosmosjs/crypto";

export interface Props {
  onRegister: (publicKeyHex: string, password: string) => void;
}

export const Hardware: FunctionComponent<Props> = observer(({ onRegister }) => {
  let connectToHardwareWalletInterval: NodeJS.Timeout;
  let getPublicKeyFromConnectedHardwareWalletInterval: NodeJS.Timeout;

  const ledger = new Ledger();
  const intl = useIntl();
  const [password, setPassword] = useState("");
  const [hardwareErrorMessage, setHardwareErrorMessage] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [publicKeyHex, setPublicKeyHex] = useState();
  const [address, setAddress] = useState("");
  const [
    passwordConfirmErrorMessage,
    setPasswordConfirmErrorMessage
  ] = useState("");

  const handleSubmit = async () => {
    wipeFormErrors();
    await flushPromises();
    if (!validPassword()) return;
    if (!passwordConfirmValidate()) return;
    onRegister(publicKeyHex, password);
  };

  //on mount
  useEffect(() => {
    connectToHardwareWalletInterval = setInterval(
      connectToHardwareWallet,
      1000
    );
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

  const getPublicKeyFromConnectedHardwareWallet = async () => {
    let error = false;

    const publicKey = await ledger.getPubKey().catch(err => {
      error = true;
      setHardwareErrorMessage(err.message);
    });

    if (!error) {
      wipeFormErrors();
      await flushPromises();
      setHardwareErrorMessage("");
      clearInterval(getPublicKeyFromConnectedHardwareWalletInterval);
      const pubKeySecp256k1 = new PubKeySecp256k1(publicKey);
      setPublicKeyHex(pubKeySecp256k1.toString('hex'));
      setAddress(pubKeySecp256k1.toAddress().toBech32("cosmos"));
    }
  };

  const connectToHardwareWallet = async () => {
    let error = false;
    await ledger.connect().catch(err => {
      error = true;
      setHardwareErrorMessage(err.message);
    });

    if (!error) {
      // lets start trying to get the public key now.
      clearInterval(connectToHardwareWalletInterval);
      getPublicKeyFromConnectedHardwareWalletInterval = setInterval(
        getPublicKeyFromConnectedHardwareWallet,
        1000
      );
    }
  };

  return (
    <div id="my-extension-root-inner">
      <div className={style.hardwareTitle}>
        Login with Ledger Nano Running Cosmos Application
      </div>
      <form id="form" className={style.recoveryForm}>
        {address.length ? (
          <>
            <span>Address: </span>
            <output>{address}</output>
          </>
        ) : (
          ""
        )}
        <Label for="password" className={style.label} style={{ width: "100%" }}>
          Password
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
});
