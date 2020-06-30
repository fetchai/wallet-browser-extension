import { setLightMode as setLightModeModule } from "../../light-mode";
import { Button, ButtonGroup } from "reactstrap";
import classnames from "classnames";
import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";
import React from "react";

/**
 * This is for the two buttons that are used to toggle between  light mode and not.
 *
 * @param props
 * @constructor
 */
function ToggleLightMode(props: { lightMode: boolean; setLightMode: any }) {
  const turnOff = () => {
    props.setLightMode(false);
    setLightModeModule(false, true, true);
  };

  const turnOn = () => {
    props.setLightMode(true);
    setLightModeModule(true, true);
  };

  return (
    <ButtonGroup
      className={classnames(style.pillGroup, style.expandable)}
      style={{ marginBottom: "4px" }}
    >
      <Button
        type="button"
        id={props.lightMode ? "green-solid" : ""}
        className={props.lightMode ? style.pill : ""}
        onClick={turnOn}
      >
        <FormattedMessage id="settings.light-mode.pill.light" />
      </Button>
      <Button
        type="button"
        id={props.lightMode ? "" : "green-solid"}
        className={props.lightMode ? "" : style.pill}
        onClick={turnOff}
      >
        <FormattedMessage id="settings.light-mode.pill.dark" />
      </Button>
    </ButtonGroup>
  );
}
export { ToggleLightMode }