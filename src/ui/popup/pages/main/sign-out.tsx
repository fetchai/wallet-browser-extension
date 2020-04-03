import React, { FunctionComponent, useCallback, useState } from "react";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { Tooltip } from "reactstrap";
import { FormattedMessage } from "react-intl";

export const SignOutButton: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = useCallback(() => {
    setTooltipOpen(!tooltipOpen);
  }, [tooltipOpen]);

  return (
    <div className={style.right}>
      <div style={{ flex: 1 }} />
      <div className={style.signOut}>
        <i
          id="btn-sign-out"
          className="fas fa-sign-out-alt"
          onClick={() => {
            keyRingStore.lock();
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
      <div style={{ flex: 1 }} />
    </div>
  );
});
