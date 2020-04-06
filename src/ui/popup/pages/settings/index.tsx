import React, { FunctionComponent, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
import style from "./style.module.scss";
// @ts-ignore
import Expand from "react-expand-animated";
import { VERSION } from "../../../../config";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
import { strongPassword } from "../../../../common/strong-password";
import flushPromises from "flush-promises";

export const SettingsPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRingStore } = useStore();
    const intl = useIntl();
    const transitions = ["height", "opacity", "background"];

    const [collapsible1, setcollapsible1] = useState(false);
    const [collapsible2, setcollapsible2] = useState(false);
    const [passwordConfirmError, setPasswordConfirmError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [output, setOutput] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    const wipeFormErrors = (clearOutput = false) => {
      if (clearOutput) {
        setOutput("");
        setPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
      }
      setPasswordConfirmError(false);
      setPasswordError(false);
      setNewPasswordError(false);
    };

    const correctPassword = async (): Promise<boolean> => {
      if (!password.length) {
        setPasswordError(true);
        setOutput(
          intl.formatMessage({
            id: "register.create.input.password.error.required"
          })
        );
        return false;
      }

      if (!(await keyRingStore.verifyPassword(password))) {
        setPasswordError(true);
        setOutput(
          intl.formatMessage({
            id: "settings.update-password.new.error.invalid"
          })
        );
        return false;
      }
      return true;
    };

    const passwordConfirmValidate = () => {
      if (!newPassword.length || !newPasswordConfirm.length) return false;

      if (newPassword !== newPasswordConfirm) {
        setPasswordConfirmError(true);
        setOutput(
          intl.formatMessage({
            id: "register.create.input.confirm-password.error.unmatched"
          })
        );
        return false;
      }
      return true;
    };

    const newPasswordValidate = async () => {
      if (!newPassword.length) {
        setNewPasswordError(true);
        setOutput(
          intl.formatMessage({
            id: "settings.update-password.new.error.required"
          })
        );
        return false;
      }

      if (await keyRingStore.verifyPassword(newPassword)) {
        setNewPasswordError(true);
        setOutput(
          intl.formatMessage({
            id: "settings.update-password.new.error.unchanged"
          })
        );
        return false;
      }

      const strong = strongPassword(newPassword);

      if (strong !== true) {
        setNewPasswordError(true);
        setOutput(intl.formatMessage({ id: strong }));
        return false;
      }
      return true;
    };

    const updatePassword = async () => {
      setPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");

      const success = await keyRingStore.updatePassword(password, newPassword);

      if (success) {
        setOutput(
          intl.formatMessage({ id: "settings.update-password.new.success" })
        );
      }
    };

    /**
     * Main controlling logic for updating one's password. Determines if password form is valid and calls update method if true, else we
     * display error message(s).
     *
     * @param event
     * @returns {Promise<void>}
     */
    const handlePasswordUpdate = async (event: any): Promise<void> => {
      event.preventDefault();
      wipeFormErrors();
      await flushPromises();
      if (!(await correctPassword())) return;
      if (!(await newPasswordValidate())) return;
      if (!passwordConfirmValidate()) return;
      await updatePassword();
    };

    const hasError = (): boolean => {
      return passwordConfirmError || passwordError || newPasswordError;
    };

    const toggle = async (index: number): Promise<void> => {
      wipeFormErrors(true);
      // shut the two collapsibles that are not being used.
      if (index === 1) {
        setcollapsible1(prev => !prev);
      } else {
        setcollapsible1(false);
      }
      if (index === 2) {
        setcollapsible2(prev => !prev);
      } else {
        setcollapsible2(false);
      }
    };

    return (
      <HeaderLayout showChainName canChangeChainInfo={false} fetchIcon={true}>
        <div className={style.wrapper}>
          <BackButton
            onClick={() => {
              history.goBack();
            }}
            stroke={4}
            style={{ height: "24px;" }}
            className={style.backButton}
          ></BackButton>
          <div className={style.security} onClick={() => toggle(1)}>
            Security & Privacy
          </div>
          <Expand open={collapsible1} duration={500} transitions={transitions}>
            <form id="form">
              <h3 className={style.subHeading}>Change Password</h3>
              <input
                type="password"
                className={`white-border ${style.input} ${
                  passwordError ? "red" : ""
                }`}
                placeholder={intl.formatMessage({
                  id: "settings.update-password.form.placeholder.original"
                })}
                id="password"
                name="password"
                value={password}
                onChange={event => {
                  wipeFormErrors();
                  setPassword(event.target.value);
                }}
              ></input>
              <input
                type="password"
                className={`white-border  ${style.input} ${
                  newPasswordError ? "red" : ""
                }`}
                placeholder={intl.formatMessage({
                  id: "settings.update-password.form.placeholder.invalid"
                })}
                id="new_password"
                name="new_password"
                value={newPassword}
                onChange={event => {
                  wipeFormErrors();
                  setNewPassword(event.target.value);
                }}
              ></input>
              <input
                type="password"
                className={`white-border  ${style.input} ${
                  passwordConfirmError ? "red" : ""
                }`}
                placeholder={intl.formatMessage({
                  id: "settings.update-password.form.placeholder.confirm"
                })}
                id="new_password_confirm"
                name="new_password_confirm"
                value={newPasswordConfirm}
                onChange={event => {
                  wipeFormErrors();
                  setNewPasswordConfirm(event.target.value);
                }}
              ></input>
              <button
                type="submit"
                className={`green ${style.button}`}
                onClick={handlePasswordUpdate}
              >
                Update
              </button>

              <output
                className={`change_password_error ${hasError() ? "red" : ""} `}
                id="output"
              >
                {output}
              </output>
            </form>
            <h3 className={style.subHeading}>Reset Application</h3>
            <button
              type="submit"
              className={`blue ${style.button}`}
              onClick={async () => {
                await keyRingStore.clear();
                history.goBack();
              }}
            >
              Update
            </button>
          </Expand>
          <div className={style.about} onClick={() => toggle(2)}>
            About
          </div>
          <Expand open={collapsible2} duration={500} transitions={transitions}>
            <p className={style.about}>FET Wallet Version {VERSION}</p>
            <p className={style.about}>
              Developed and Designed by Fetch.ai Cambridge
            </p>
          </Expand>
        </div>
      </HeaderLayout>
    );
  }
);
