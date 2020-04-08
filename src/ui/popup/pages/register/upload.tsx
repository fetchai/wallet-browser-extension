import React, { Component } from "react";
import style from "./style.module.scss";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { strongPassword } from "../../../../common/strong-password";
import { validJSONString } from "../../../../common/utils/valid-json-string";
import { useStore } from "../../stores";
import { RootStore } from "../../stores/root";
import { KeyStore } from "../../../../background/keyring/crypto";

const FILE_REQUIRED_ERROR_MESSAGE = "File required";
const INCORRECT_PASSWORD_OR_ADDRESS_ERROR_MESSAGE =
  "Incorrect Password or Address";
const INCORRECT_FILE_TYPE_ERROR_MESSAGE = "Incorrect file type";
const PASSWORD_REQUIRED_ERROR_MESSAGE = "Password required";
const UNREADABLE_FILE_ERROR_MESSAGE = "Unable to read file";
const WEAK_PASSWORD_ERROR_MESSAGE =
  "Incorrect Password: Password too weak (14 chars including letter, number, special character and uppercase letter";

type State = {
  file: File | Blob | null | string;
  password: string;
  fileName: string;
  collapsible1: boolean;
  collapsible2: boolean;
  errorMessage: string;
  passwordError: boolean;
  fileError: boolean;
};

type Props = {
  onRegister: any;
};

export default class Recover extends React.Component<Props, State> {
  private onRegister: (
    words: string,
    password: string,
    recovered: boolean
  ) => void;
  private keyRingStore: any;

  constructor(props: any) {
    super(props);
    this.onRegister = props.onRegister;
    this.keyRingStore = useStore();
  }

  public readonly state: State = {
    file: null,
    password: "",
    fileName: "",
    collapsible1: true,
    collapsible2: false,
    errorMessage: "",
    passwordError: false,
    fileError: false
  };

  async wipeFormErrors() {
    return new Promise(resolve => {
      this.setState(
        {
          fileError: false,
          passwordError: false
        },
        resolve
      );
    });
  }

  hasError = (): boolean => {
    return this.state.fileError || this.state.passwordError;
  };

  openUploadFile = async (event: Event): Promise<void> => {
    event.preventDefault();
    (document.getElementById("file") as HTMLElement).click();
  };

  readFile = async (file: File): Promise<null | string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        // @ts-ignore
        resolve(evt.target.result as string);
      };
      reader.onerror = function() {
        reject(null);
      };
      reader.readAsText(file, "UTF-8");
    });
  };

  handleChange = async (event: any) => {
    const change: any = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    change[event.target.name] = event.target.value;
    this.setState(change);
    await this.wipeFormErrors();
  };

  handleFileChange = async (event: any) => {
    this.setState({
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      file: event.target.files[0],
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      fileName: event.target.value
    });
    await this.wipeFormErrors();
  };

  /**
   * Check is password is "valid" (not whether correct) ie is not empty, and is "strong"
   *
   * @returns {boolean}
   */
  validPassword = () => {
    if (this.state.password === "" || this.state.password.length === 0) {
      this.setState({
        errorMessage: PASSWORD_REQUIRED_ERROR_MESSAGE,
        passwordError: true
      });
      return false;
    } else if (strongPassword(this.state.password) !== true) {
      this.setState({
        errorMessage: WEAK_PASSWORD_ERROR_MESSAGE,
        passwordError: true
      });
      return false;
    }

    return true;
  };

  /**
   * Check if file exists in state, and if it is valid JSON and returns Promise<boolean>. Side-effect is setting appropriate
   * form error message and if not valid we delete the file from state also.
   *
   * @returns {Promise<boolean>}
   */
  validFile = async () => {
    if (this.state.file === "" || this.state.file === null) {
      // @ts-ignore
      this.setState({
        errorMessage: FILE_REQUIRED_ERROR_MESSAGE,
        fileError: true,
        file: "",
        fileName: ""
      });
      return false;
    }

    let error = false;
    const file = await this.readFile(this.state.file as File).catch(
      () => (error = true)
    );

    if (error || file === null) {
      this.setState({
        errorMessage: UNREADABLE_FILE_ERROR_MESSAGE,
        fileError: true,
        file: "",
        fileName: ""
      });
      return false;
    }

    if (!validJSONString(file as string)) {
      this.setState({
        errorMessage: INCORRECT_FILE_TYPE_ERROR_MESSAGE,
        fileError: true,
        file: "",
        fileName: ""
      });
      return false;
    }

    return true;
  };

  /**
   * Main logic processing of page. Checks if password is correct and file is of correct form and decrypts if true,
   * Setting error message(s) otherwise. If an Address is not provided it does not then log user in but shows dialog
   * to confirm issue regarding decryption without providing an address. If address is provided it checks if file decrypts
   * create private key corresponding to the given address. If this is the case it sets encrypted key_file and address in storage,
   * sets the logged_in flag and then redirects to the account page. If this is not the case then it displays an error message to that effect.
   *
   * @param event
   * @returns {Promise<void>}
   */
  async handleSubmit() {
    let error = false;
    let file;

    if (!this.validPassword()) error = true;
    if (!(await this.validFile())) error = true;
    else {
      file = await this.readFile(this.state.file as File);
      if (
        !(await this.keyRingStore.verifyPassword(this.state.password, file))
      ) {
        error = true;
      }
    }

    if (error) {
      this.setState({
        errorMessage: "Incorrect password",
        passwordError: true
      });
    } else {
      const mneumonic = await this.keyRingStore.getMneumonic(
        this.state.password,
        file
      );
      this.onRegister(mneumonic, this.state.password, true);
    }
  }

  render() {
    return (
      // eslint-disable-next-line react/prop-types
      <div id="my-extension-root-inner" className="OverlayMain">
        <div className="OverlayMainInner">
          <h2>Recover</h2>
          <hr></hr>
          <form id="form" className={"recover-form"}>
            <legend className="recover-legend">
              Upload File with Password
            </legend>
            <button
              className={`recover-input   ${
                this.state.fileError
                  ? style.redUploadButton
                  : style.uploadButton
              }`}
              onClick={this.openUploadFile}
            >
              {this.state.fileName === "" ? "" : "selected"}
            </button>
            <input
              label="file"
              className={style.hide}
              id="file"
              type="file"
              onChange={this.handleFileChange}
            ></input>
            <input
              type="password"
              className={`recover-input ${
                this.state.passwordError ? "red" : ""
              }`}
              placeholder="Password"
              id="password"
              name="password"
              value={this.state.password}
              onChange={this.handleChange.bind(this)}
            ></input>
            <output
              className={`recover-output ${this.hasError() ? "red" : ""}`}
              id="output"
            >
              {this.state.errorMessage}
            </output>
            <div className="small-button-container">
              <button
                type="submit"
                className="recover-upload-button"
                onClick={event => {
                  event.preventDefault();
                  this.handleSubmit();
                }}
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
