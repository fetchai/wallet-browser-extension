import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {useStore} from "../../stores";
import {useIntl} from "react-intl";
import style from "./style.module.scss";
import classnames from "classnames";
import {strongPassword} from "../../../../common/strong-password";
import flushPromises from "flush-promises";
// @ts-ignore
import OutsideClickHandler from "react-outside-click-handler";


interface ChangePasswordProps {
}

export const ChangePassword: FunctionComponent<ChangePasswordProps> = observer(
  () => {
      const {keyRingStore} = useStore();
      const intl = useIntl();

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
              setOutput(intl.formatMessage({id: strong}));
              return false;
          }
          return true;
      };

      const updatePassword = async () => {
          const success = await keyRingStore.updatePassword(password, newPassword);
          setPassword("");
          setNewPassword("");
          setNewPasswordConfirm("");

          if (success) {
              setOutput(
                  intl.formatMessage({id: "settings.update-password.new.success"})
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


      return (
          <OutsideClickHandler
              onOutsideClick={async () => {
                  wipeFormErrors();
              }}
          >
              <form id="form">
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
                          id: "settings.update-password.form.placeholder.new"
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
                      className={classnames(style.output, hasError() ? "red" : "")}
                      id="output"
                  >
                      {output}
                  </output>
              </form>
          </OutsideClickHandler>
      )

  });