import React, { FunctionComponent } from "react";
import { observer } from "mobx-react";
import style from "./style.module.scss";
import { useHistory } from "react-router";

export interface Props {
  lightMode: boolean;
}

export const SettingsButton: FunctionComponent<Props> = observer(
  ({ lightMode }) => {
    const history = useHistory();

    return (
      <div className={style.settingsButtonWrapper}>
        <img
          src={
            lightMode
              ? require("../../public/assets/settings-icon-black.svg")
              : require("../../public/assets/settings-icon.svg")
          }
          id="btn-settings"
          className={`fas fa-sign-out-alt ${style.buttonImage}`}
          onClick={() => {
            history.push("/settings");
          }}
        ></img>
      </div>
    );
  }
);
