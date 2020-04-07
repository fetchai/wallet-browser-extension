import React, { FunctionComponent } from "react";
import { observer } from "mobx-react";
import style from "./style.module.scss";
import { useHistory } from "react-router";


export const SettingsButton: FunctionComponent = observer(() => {
  const history = useHistory();
  return (
    <div className={style.wrapper}>
      <img
        src={require("../../public/assets/settings-icon.svg")}
        id="btn-settings"
        className={`fas fa-sign-out-alt ${style.settingsImage}`}
        onClick={() => {
          history.push("/settings");
        }}
      ></img>
    </div>
  );
});
