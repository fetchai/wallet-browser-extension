import React, { FunctionComponent, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
import style from "./style.module.scss";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Expand from "react-expand-animated";
import { VERSION } from "../../../../config";
import { useStore } from "../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { strongPassword } from "../../../../common/strong-password";
import flushPromises from "flush-promises";
import {
  lightModeEnabled,
  setLightMode as setLightModeModule,
  STORAGE_KEY
} from "../../light-mode";
import { Button, ButtonGroup } from "reactstrap";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import OutsideClickHandler from "react-outside-click-handler";
import classnames from "classnames";
import { CustomEndpoint } from "./customEndpoint";

interface DownloadKeyFileProps {
  setHasKeyFile: any;
}

export const DownloadKeyFile: FunctionComponent<DownloadKeyFileProps> = observer(
  ({ setHasKeyFile }) => {
    const [keyFile, setKeyFile] = useState("");
    const { keyRingStore } = useStore();
    const intl = useIntl();

    useEffect(() => {
      const getFile = async () => {
        const json = await keyRingStore.getKeyFile();
        if (json !== null) {
          setKeyFile(JSON.stringify(json));
          setHasKeyFile(true);
        }
      };

      getFile();
    }, []);

    const downloadKeyFile = async () => {
      if (!keyFile) return;

      const element = document.createElement("a");
      const file = new Blob([keyFile], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = intl.formatMessage({
        id: "settings.download.key.name"
      });
      document.body.appendChild(element);
      element.click();
    };

    return (
      <>
        <h3 className={style.subHeading}>
          {" "}
          {intl.formatMessage({
            id: "settings.update-password.heading.download"
          })}
        </h3>

        <button
          type="button"
          className={`green ${style.button}`}
          onClick={downloadKeyFile}
        >
          {intl.formatMessage({
            id: "settings.update-password.button.download"
          })}
        </button>
      </>
    );
  }
);

export const SettingsPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRingStore } = useStore();
    const intl = useIntl();
    const transitions = ["height", "opacity", "background"];

    const [collapsible1, setcollapsible1] = useState(false);
    const [collapsible2, setcollapsible2] = useState(false);
    const [collapsible3, setcollapsible3] = useState(false);
    const [collapsible2a, setcollapsible2a] = useState(false);
    const [collapsible2b, setcollapsible2b] = useState(false);
    const [lightMode, setLightMode] = useState(false);
    const [passwordConfirmError, setPasswordConfirmError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [output, setOutput] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [showDeleteConfirmation, setshowDeleteConfirmation] = useState(false);
    const [hasKeyFile, setKeyFile] = useState(false);

    useEffect(() => {
      const isEnabled = async () => {
        const enabled = await lightModeEnabled();
        setLightMode(enabled);
      };
      isEnabled();
    }, [lightMode, setLightMode]);

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
      const success = await keyRingStore.updatePassword(password, newPassword);
      setPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");

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

    const handleDelete = async () => {
      if (showDeleteConfirmation) {
        await keyRingStore.clear();
        browser.storage.sync.remove(STORAGE_KEY);
        history.goBack();
      }
      setshowDeleteConfirmation(true);
    };

    const toggle = async (index: number | string): Promise<void> => {
      wipeFormErrors(true);
      // wait for the expanandables before closing for better UI
      setTimeout(setshowDeleteConfirmation.bind(null, false), 500);
      // looks very complex but very simple whereby if the collapsible is clicked we toggle it (if clause)
      // or in else clause we close it (unless it is a sub collapsible eg 2b then we don't close 2 but do nothing with it)
      if (index === 1) {
        setcollapsible1(prev => !prev);
      } else if (!index.toString().includes("1")) {
        setcollapsible1(false);
      }

      if (index === 2) {
        setcollapsible2(prev => !prev);
      } else if (!index.toString().includes("2")) {
        setcollapsible2(false);
      }

      if (index === "2a") {
        setcollapsible2a(prev => !prev);
      } else {
        setcollapsible2a(false);
      }

      if (index === "2b") {
        setcollapsible2b(prev => !prev);
      } else {
        setcollapsible2b(false);
      }

      if (index === 3) {
        setcollapsible3(prev => !prev);
      } else {
        setcollapsible3(false);
      }
    };

    const getStorageClearanceWarningMessage = () => {
      if (!showDeleteConfirmation) return null;
      // if there is a key file then it cannot be hardware-linked
      if (hasKeyFile)
        return intl.formatMessage({
          id: "settings.update-password.button.delete-confirmation-message"
        });
      else
        return intl.formatMessage({
          id:
            "settings.update-password.button.delete-confirmation-message-hardware-linked"
        });
    };

    return (
      <HeaderLayout
        showChainName={false}
        canChangeChainInfo={false}
        fetchIcon={true}
        lightMode={lightMode}
      >
        <div className={style.wrapper}>
          <BackButton
            onClick={() => {
              history.goBack();
            }}
            stroke={4}
            style={{ height: "24px" }}
            className={style.backButton}
            lightMode={lightMode}
          ></BackButton>
          <div className={style.titleWrapper}>
            <h2>
              {intl.formatMessage({
                id: "settings.heading"
              })}
            </h2>
          </div>
          <div className={style.mainButton} onClick={() => toggle(1)}>
            General
          </div>
          <Expand open={collapsible1} duration={500} transitions={transitions}>
            <h3 className={style.subHeading}>
              {" "}
              {intl.formatMessage({
                id: "settings.light-mode.pill.title"
              })}
            </h3>
            <ButtonGroup
              className={style.pillGroup}
              style={{ marginBottom: "4px" }}
            >
              <Button
                type="button"
                id={lightMode ? "green-solid" : ""}
                className={lightMode ? style.pill : ""}
                onClick={() => {
                  setLightMode(true);
                  setLightModeModule(true, true);
                }}
              >
                <FormattedMessage id="settings.light-mode.pill.light" />
              </Button>
              <Button
                type="button"
                id={lightMode ? "" : "green-solid"}
                className={lightMode ? "" : style.pill}
                onClick={() => {
                  setLightMode(false);
                  setLightModeModule(false, true, true);
                }}
              >
                <FormattedMessage id="settings.light-mode.pill.dark" />
              </Button>
            </ButtonGroup>
            {hasKeyFile ? <DownloadKeyFile setHasKeyFile={setKeyFile} /> : null}

            <div className="input_container">
              <h3 className={style.subHeading}>
                {intl.formatMessage({
                  id: "settings.choose-network"
                })}
              </h3>
              <CustomEndpoint lightMode={lightMode}></CustomEndpoint>
            </div>
          </Expand>

          <div className={style.mainButton} onClick={() => toggle(2)}>
            Security & Privacy
          </div>
          <Expand open={collapsible2} duration={500} transitions={transitions}>
            <form id="form">
              <h3
                className={classnames(style.subHeading, style.clickable)}
                onClick={() => toggle("2a")}
              >
                {intl.formatMessage({
                  id: "settings.update-password.heading.change-password"
                })}
              </h3>
              <Expand
                open={collapsible2a}
                duration={500}
                transitions={transitions}
              >
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
              </Expand>
            </form>
            <h3
              className={classnames(style.subHeading, style.clickable)}
              onClick={() => toggle("2b")}
            >
              {" "}
              {intl.formatMessage({
                id: "settings.update-password.heading.reset"
              })}
            </h3>
            <Expand
              open={collapsible2b}
              duration={500}
              transitions={transitions}
            >
              <div className={style.warningWrapper}>
                <span className={style.warning}>
                  {getStorageClearanceWarningMessage()}
                </span>
              </div>
              <OutsideClickHandler
                onOutsideClick={() => {
                  setshowDeleteConfirmation(false);
                }}
              >
                <button
                  type="submit"
                  className={`blue ${style.button}`}
                  onClick={handleDelete}
                >
                  {showDeleteConfirmation
                    ? intl.formatMessage({
                        id: "settings.update-password.button.delete"
                      })
                    : intl.formatMessage({
                        id: "settings.update-password.button.delete-confirm"
                      })}
                </button>
              </OutsideClickHandler>
            </Expand>
          </Expand>
          <div className={style.mainButton} onClick={() => toggle(3)}>
            About
          </div>
          <Expand open={collapsible3} duration={500} transitions={transitions}>
            <div className={style.aboutSection}>
              <p className={style.about}>FET Wallet Version {VERSION}</p>
              <p className={style.about}>
                Developed and Designed by Fetch.ai Cambridge
              </p>
            </div>
          </Expand>
        </div>
      </HeaderLayout>
    );
  }
);
