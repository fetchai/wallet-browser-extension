import React, { FunctionComponent } from "react";
import { observer } from "mobx-react";
import style from "./style.module.scss";
import { useHistory } from "react-router";

export interface Props {
  lightMode: boolean;
}

export const AccountButton: FunctionComponent<Props> = observer(
  ({ lightMode }) => {
    const history = useHistory();

    return (
      <div className={style.wrapper}>
        <img
          src={
            lightMode
              ? require("../../public/assets/account-icon-black.svg")
              : require("../../public/assets/account-icon.svg")
          }
          id="btn-settings"
          className={`fas fa-sign-out-alt ${style.settingsImage}`}
          onClick={() => {
            history.push("/settings");
          }}
        ></img>
      </div>
    );
  }
);