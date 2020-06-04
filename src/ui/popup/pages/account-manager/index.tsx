import React, { FunctionComponent, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
import style from "./style.module.scss";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Expand from "react-expand-animated";
import { useStore } from "../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import flushPromises from "flush-promises";
import {
  lightModeEnabled,
  setLightMode as setLightModeModule,
  STORAGE_KEY
} from "../../light-mode";
import { Button, ButtonGroup } from "reactstrap";
import OutsideClickHandler from "react-outside-click-handler";
import classnames from "classnames";

export const AccountManagerPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRingStore } = useStore();
    const intl = useIntl();
    const transitions = ["height", "opacity", "background"];

    const [lightMode, setLightMode] = useState(false);

    // on mount
    useEffect(() => {}, []);

    useEffect(() => {
      const isEnabled = async () => {
        const enabled = await lightModeEnabled();
        setLightMode(enabled);
      };
      isEnabled();
    }, [lightMode, setLightMode]);

    return (
      <HeaderLayout
        showChainName
        canChangeChainInfo={false}
        fetchIcon={true}
        lightMode={lightMode}
      >
        <div className={style.wrapper}>
          <BackButton
            onClick={() => {
              history.goBack();
            }}
            stroke={4}
            style={{ height: "24px" }}
            className={style.backButton}
            lightMode={lightMode}
          ></BackButton>
          <div className={style.titleWrapper}>
            <h2>
              {intl.formatMessage({
                id: "settings.account-manager"
              })}
            </h2>
          </div>

        </div>
      </HeaderLayout>
    );
  }
);
