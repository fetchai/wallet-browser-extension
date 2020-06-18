import React, { FunctionComponent, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
import { lightModeEnabled } from "../../light-mode";
import classnames from "classnames";
import style from "./style.module.scss";
import { Button } from "reactstrap";


interface DeleteAccountProps extends RouteComponentProps {
  addressToDelete: string;
}

export const DeleteAccount: FunctionComponent<DeleteAccountProps> = observer(
  ({ history }) => {
    const { keyRingStore, accountStore } = useStore();
    const intl = useIntl();
    const [lightMode, setLightMode] = useState(false);

    // on mount
    useEffect(() => {
      // also we check if we are in regular or light mode
      const isEnabled = async () => {
        const enabled = await lightModeEnabled();
        setLightMode(enabled);
      };
      isEnabled();
    }, []);


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
                id: "address-delete-title"
              })}
            </h2>
          </div>
          <Button
            id="green"
            className={classnames(style.logOutButton, "green")}
            outline
            onClick={() => {
              history.goBack();
            }}
          >
            {intl.formatMessage({
              id: "address-delete-delete"
            })}
          </Button>
          <Button
            id="green"
            className={classnames(style.logOutButton, "green")}
            outline
            onClick={() => {

                 history.goBack();
            }}
          >
            {intl.formatMessage({
              id: "address-delete-cancel"
            })}
          </Button>
        </div>
      </HeaderLayout>
    );
  }
);
