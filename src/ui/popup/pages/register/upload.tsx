import React from "react";
import style from "./style.module.scss";
import classnames from "classnames";
import { strongPassword } from "../../../../common/strong-password";
import { validJSONString } from "../../../../common/utils/valid-json-string";
import { EncryptedKeyStructure } from "../../../../background/keyring/crypto";
import { Label } from "reactstrap";

const FILE_REQUIRED_ERROR_MESSAGE = "File required";
const INCORRECT_FILE_TYPE_ERROR_MESSAGE = "Incorrect file type";
const PASSWORD_REQUIRED_ERROR_MESSAGE = "Password required";
const INCORRECT_WALLET_PASSWORD_ERROR_MESSAGE =
  "Incorrect (wallet) Login Password";
const UNREADABLE_FILE_ERROR_MESSAGE = "Unable to read file";
const WEAK_PASSWORD_ERROR_MESSAGE = "Incorrect Password";

type State = {
  file: File | null | string;
  password: string;
  fileName: string;
  errorMessage: string;
  passwordError: boolean;
  fileError: boolean;
  loading: boolean;
  walletPassword: string;
  walletPasswordError: boolean;
};

type Props = {
  onRegister: any;
  verifyPassword: any;
  getMnemonic: any;
  isRegistering: boolean;
};

export default class Upload extends React.Component<Props, State> {
  private onRegister: (
    words: string,
    password: string,
    recovered: boolean
  ) => void;

  private verifyPassword:
    | any
    | ((
        password: string,
        keyFile?: EncryptedKeyStructure | null
      ) => Promise<boolean>)
    | ((
        password: string,
        keyFile?: EncryptedKeyStructure | null
      ) => Promise<boolean>);
  private getMnemonic:
    | any
    | ((
        password: string,
        keyFile: EncryptedKeyStructure
      ) => Promise<string | false>)
    | ((password: string, keyFile: EncryptedKeyStructure) => Promise<string>);

  private isRegistering: boolean;

  constructor(props: any) {
    super(props);
    this.onRegister = props.onRegister;
    this.verifyPassword = props.verifyPassword;
    this.getMnemonic = props.getMnemonic;
    this.isRegistering = props.isRegistering;
  }

  public readonly state: State = {
    file: null,
    password: "",
    fileName: "",
    errorMessage: "",
    passwordError: false,
    fileError: false,
    loading: false,
    walletPassword: "",
    walletPasswordError: false
  };

  async setLoading(loading: boolean) {
    return new Promise(resolve => {
      this.setState(
        {
          loading: loading
        },
        resolve
      );
    });
  }

  async wipeFormErrors() {
    return new Promise(resolve => {
      this.setState(
        {
          fileError: false,
          passwordError: false,
          walletPasswordError: false
        },
        resolve
      );
    });
  }

  hasError = (): boolean => {
    return this.state.fileError || this.state.passwordError;
  };

  openUploadFile = async (event: any) => {
    event.preventDefault();
    await this.wipeFormErrors();
    const el = document.getElementById("file");
    (el as HTMLElement).click();
  };

  readFile = async (file: File): Promise<null | string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
   * This method is only called when you are adding
   *  a new address to an existing wallet. It checks that the password is the correct wallet password.
   *
   */
  async correctPassword() {
    if (
      this.state.walletPassword === "" ||
      this.state.walletPassword.length === 0
    ) {
      this.setState({
        errorMessage: PASSWORD_REQUIRED_ERROR_MESSAGE,
        walletPasswordError: true
      });
      return false;
    }
    const correctPassword = await this.verifyPassword(
      this.state.walletPassword
    );

    if (!correctPassword) {
      this.setState({
        errorMessage: INCORRECT_WALLET_PASSWORD_ERROR_MESSAGE,
        walletPasswordError: true
      });
      return false;
    }
    return true;
  }

  /**
   * Main logic processing of page. Checks if password is correct and file is of correct form and decrypts if true,
   * Setting error message(s) otherwise.
   *
   * @param event
   * @returns {Promise<void>}
   */
  async handleSubmit() {
    debugger;
    await this.setLoading(true);
    let error = false;
    let file;
    if (!this.validPassword()) error = true;

    if (!this.isRegistering && !(await this.correctPassword())) {
      error = true;
    }

    if (!(await this.validFile())) error = true;
    if (!error) {
      file = await this.readFile(this.state.file as File);
      if (
        !(await this.verifyPassword(
          this.state.password,
          JSON.parse(file as string)
        ))
      ) {
        error = true;
        this.setState({
          errorMessage: "Incorrect password",
          passwordError: true
        });
      }
    }

    if (!error) {
      const mnemonic = await this.getMnemonic(
        this.state.password,
        JSON.parse(file as string)
      );
      if (mnemonic === false) {
        this.setState({
          errorMessage: "Error occured"
        });
      }
      debugger;
      // if we are registering we encrypt with password, else if not we encrypt with the walllet password instead
      const password = this.isRegistering
        ? this.state.password
        : this.state.walletPassword;
      debugger;
      await this.onRegister(mnemonic, password, true);
    } else {
      debugger;
      await this.setLoading(false);
    }
  }

  render() {
    return (
      // eslint-disable-next-line react/prop-types
      <div id="my-extension-root-inner">
        <div className={style.recoverTitle}>Recover</div>
        <form id="form" className={style.recoveryForm}>
          <Label for="file" className={style.label} style={{ width: "100%" }}>
            Upload File with Password
          </Label>
          <button
            className={classnames(
              style.recoverInput,
              this.state.fileError ? style.redUploadButton : style.uploadButton
            )}
            onClick={this.openUploadFile}
          >
            {this.state.fileName === "" ? "" : "selected"}
          </button>
          <input
            id="file"
            className={style.hide}
            type="file"
            onChange={this.handleFileChange}
          ></input>
          <Label
            for="password"
            className={style.label}
            style={{ width: "100%" }}
          >
            {this.isRegistering ? "File Password" : "Password"}
          </Label>
          <input
            type="password"
            className={classnames(
              style.recoverInput,
              this.state.passwordError ? "red" : false
            )}
            id="password"
            name="password"
            value={this.state.password}
            onChange={this.handleChange}
          ></input>
          {!this.isRegistering ? (
            <>
              <Label
                for="wallet-password"
                className={style.label}
                style={{ width: "100%" }}
              >
                Your Wallet Password
              </Label>
              <input
                type="password"
                className={classnames(
                  style.recoverInput,
                  this.state.walletPasswordError ? "red" : false
                )}
                id="walletPassword"
                name="walletPassword"
                value={this.state.walletPassword}
                onChange={this.handleChange}
              ></input>
            </>
          ) : null}

          <output
            className={classnames(style.output, this.hasError() ? "red" : "")}
            id="output"
          >
            {this.state.errorMessage}
          </output>
          <div className={style.output}>
            <button
              type="submit"
              data-loading={this.state.loading}
              className={classnames(style.recoverButton, "green")}
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
    );
  }
}
