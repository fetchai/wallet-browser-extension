import React, { FunctionComponent, useCallback, useState } from "react";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { Tooltip } from "reactstrap";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import classnames from "classnames";
import style from "./style.module.scss";
import signOutStyle from "./sign-out.module.scss";
import {ToolTip} from "../../../components/tooltip";

export const SignOutButton: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const history = useHistory();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = useCallback(() => {
    setTooltipOpen(!tooltipOpen);
  }, [tooltipOpen]);

  return (
    <div className={signOutStyle.wrapper}>


         <ToolTip
        show={true}
        trigger="static"
        options={{ placement: "bottom" }}
        tooltip={
          <div
            className={classnames(style.toolTip)}
            style={{ fontSize: "10px" }}
          >
            <FormattedMessage id="main.menu.sign-out" />
          </div>
        }
      >
            <i
        id="btn-sign-out"
        className={classnames("fas", "fa-sign-out-alt", signOutStyle.icon)}
        onClick={() => {
          keyRingStore.lock();
          history.goBack();
        }}
      />
      </ToolTip>

    </div>
  );
});
