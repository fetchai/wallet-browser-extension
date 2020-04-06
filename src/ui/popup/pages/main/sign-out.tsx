import React, { FunctionComponent, useCallback, useState } from "react";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { Tooltip } from "reactstrap";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import classnames from "classnames";
import style from "./sign-out.module.scss";

export const SignOutButton: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const history = useHistory();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = useCallback(() => {
    setTooltipOpen(!tooltipOpen);
  }, [tooltipOpen]);

  return (
    <div className={style.wrapper}>
      <i
        id="btn-sign-out"
        className={classnames("fas", "fa-sign-out-alt", style.icon)}
        onClick={() => {
          keyRingStore.lock();
          history.goBack();
        }}
      />
      <Tooltip
        placement="bottom"
        isOpen={tooltipOpen}
        target="btn-sign-out"
        toggle={toggleTooltip}
        fade
      >
        <FormattedMessage id="main.menu.sign-out" />
      </Tooltip>
    </div>
  );
});
