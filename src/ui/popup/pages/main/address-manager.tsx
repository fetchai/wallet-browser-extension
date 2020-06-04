import React, { FunctionComponent } from "react";
import { observer } from "mobx-react";
import style from "./style.module.scss";
import { useHistory } from "react-router";

export interface Props {
  lightMode: boolean;
}

export const AddressManager: FunctionComponent<Props> = observer(
  ({ lightMode }) => {
    const history = useHistory();

    return (
      <div className={style.accountManagerButtonWrapper}>
        <img
          src={
            lightMode
              ? require("../../public/assets/account-icon-black.svg")
              : require("../../public/assets/account-icon.svg")
          }
          id="btn-account-manager"
          className={`fas fa-sign-out-alt ${style.buttonImage}`}
          onClick={() => {
            history.push("/account-manager");
          }}
        ></img>
      </div>
    );
  }
);
