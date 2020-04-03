import React, { FunctionComponent, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
import style from "./style.module.scss";
// @ts-ignore
import Expand from "react-expand-animated";
import { VERSION } from "../../../../config";
import { SignOutButton } from "../main/sign-out";
import {useStore} from "../../stores";

export const SettingsPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    // const intl = useIntl();
    const { keyRingStore } = useStore();

    const [collapsible1, setcollapsible1] = useState(false);
    const [collapsible2, setcollapsible2] = useState(false);
    const [collapsible3, setcollapsible3] = useState(false);

    const [error, setError] = useState({});
    const [password, setpassword] = useState(false);
    const [collapsible3, setcollapsible3] = useState(false);
    const [collapsible3, setcollapsible3] = useState(false);

    const transitions = ["height", "opacity", "background"];


    const correctPassword = async () : Promise<boolean> => {


        try {
            const await
            keyRingStore.verifyPassword(password);
        } catch (e) {
            console.log("Fail to decrypt: " + e.message);
        }
    }


     passwordConfirmValidate () {

    if (!this.state.new_password || !this.state.new_password_confirm)
      return false

    if (this.state.new_password !== this.state.new_password_confirm) {
      this.setState({
        password_confirm_error: true,
        output: PASSWORDS_DONT_MATCH_ERROR_MESSAGE
      })
      return false
    }
    return true
  }

   async newPasswordValidate () {
    if (!this.state.new_password.length) {
      this.setState({ new_password_error: true, output: NEW_PASSWORD_REQUIRED_ERROR_MESSAGE })
      return false
    }

    if (await Authentication.correctPassword(this.state.new_password)) {
      this.setState({ new_password_error: true, output: PASSWORD_NOT_CHANGED_ERROR_MESSAGE })
      return false
    }

    if (!Entity._strong_password(this.state.new_password)) {
      this.setState({
        new_password_error: true,
        output: WEAK_PASSWORD_ERROR_MESSAGE
      })
      return false
    }
    return true
  }

  /**
   * Main controlling logic for updating one's password. Determines if password form is valid and calls update method if true, else we
   * display error message(s).
   *
   * @param event
   * @returns {Promise<void>}
   */
   const handlePasswordUpdate = async (event) => {
    event.preventDefault()
    wipeFormErrors()

    if (!(await correctPassword())) return
    if (!(await this.newPasswordValidate())) return
    if (!this.passwordConfirmValidate()) return

    this.update_password()

  }



  const wipeFormErrors = () => setError({})

    const toggle = (index: number): void => {
      // shut the two collapsibles that are not being used.
      if (index === 1) {
        setcollapsible1(prev => !prev);
      } else {
        setcollapsible1(true);
      }
      if (index === 2) {
        setcollapsible2(prev => !prev);
      } else {
        setcollapsible2(true);
      }
      if (index === 3) {
        setcollapsible3(prev => !prev);
      } else {
        setcollapsible3(true);
      }
    };

    return (
      <HeaderLayout
        showChainName
        canChangeChainInfo={false}
        fetchIcon={true}
        rightRenderer={<SignOutButton />}
      >
        <div className={style.wrapper}>
          <BackButton
            onClick={() => {
              history.goBack();
            }}
            stroke={4}
            style={{ height: "24px;" }}
            className={style.backButton}
          ></BackButton>
          <div className={style.subheading} onClick={() => toggle(1)}>
            General
          </div>
          <Expand
            open={collapsible1}
            duration={5000}
            transitions={transitions}
          ></Expand>
          <div className={style.subheading} onClick={() => toggle(2)}>
            Security & Privacy
          </div>
          <form
            open={collapsible2}
            duration={5000}
            transitions={transitions}
          >
            <form id="form">
<input type="password" className={`${error.password ? 'red_error' : ''}`}}
                     placeholder="Old Password"
                     id="password" name="password" value={password}
                     onChange={event => setpassword(event.target.value)}></input>
              <input type="password"
                     className={` ${error.newPassword ? 'red_error' : ''}`}
                     placeholder="New Password"
                     id="new_password" name="new_password" value={newPassword}
                     onChange={event => setNewPassword(event.target.value)}></input>
              <input type="password"
                     className={`change_password_input ${error.passwordConfirm? 'red_error' : ''}`}
                     placeholder="Confirm New Password"
                     id="new_password_confirm" name="new_password_confirm"
                     data-testid="settings_new_password_confirm"
                     value={newPasswordConfirm}
                     onChange={event => setnewPasswordConfirm(event.target.value)}></input>
              <button type="submit" className="update_button change_password_update_button"
                      data-testid="settings_submit"
                      onClick={handlePasswordUpdate}>Update
              </button>
          </form>
               </Expand>
              <output type="text"
                      data-testid="settings_output"
                      className={`change_password_error ${this.hasError() ? 'red_error' : ''} ${this.state.collapsible_4 ? 'change_password_input change_password_output ' : ''}`}
                      id="output">{this.state.output}</output>
          </Expand>
          <div className={style.subheading} onClick={() => toggle(3)}>
            About
          </div>
          <Expand open={collapsible3} duration={5000} transitions={transitions}>
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
