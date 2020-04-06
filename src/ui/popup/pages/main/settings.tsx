import React, { FunctionComponent, useCallback, useState } from "react";
import { observer } from "mobx-react";
import style from "./style.module.scss";
import { Tooltip } from "reactstrap";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import { ToolTip } from "../../../components/tooltip";
import classnames from "classnames";
import { shortenAddress } from "../../../../common/address";

export const SettingsButton: FunctionComponent = observer(() => {
  const history = useHistory();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = useCallback(() => {
    setTooltipOpen(!tooltipOpen);
  }, [tooltipOpen]);

  return (
    <div className={style.wrapper}>
      <ToolTip
        show={true}
        trigger="static"
        options={{ placement: "bottom" }}
        tooltip={
          <div
            className={classnames(style.toolTip)}
            style={{ fontSize: "10px" }}
          >
            <FormattedMessage id="main.menu.settings" />
          </div>
        }
      >
        <img
          src={require("../../public/assets/settings-icon.svg")}
          id="btn-settings"
          className={`fas fa-sign-out-alt ${style.settingsImage}`}
          onClick={() => {
            history.push("/settings");
          }}
        ></img>
      </ToolTip>

      {/*<Tooltip*/}
      {/*  placement="bottom"*/}
      {/*  isOpen={tooltipOpen}*/}
      {/*  target="btn-settings"*/}
      {/*  toggle={toggleTooltip}*/}
      {/*  innerClassName={style.toolTip}*/}
      {/*  arrowClassName={style.toolTipArrow}*/}
      {/*  fade*/}
      {/*>*/}
      {/*  <FormattedMessage id="main.menu.settings" />*/}
      {/*</Tooltip>*/}
    </div>
  );
});
