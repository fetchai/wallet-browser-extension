import React, { FunctionComponent, useState, useEffect } from "react";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { useIntl } from "react-intl";
import { lightModeEnabled } from "../../light-mode";
import classnames from "classnames";
import style from "./style.module.scss";
import { Button } from "reactstrap";
import { GetDeleteAddressMsg } from "../../../../background/keyring";
import { sendMessage } from "../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

interface DeleteAccountProps {
  addressToDelete: string;
  accountNumberOfAddressToDelete: string;
  history: any;
}

export const DeleteAccount: FunctionComponent<DeleteAccountProps> = observer(
  ({ history, addressToDelete, accountNumberOfAddressToDelete }) => {
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
              history.back();
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
            <h3>
              {" "}
              {intl.formatMessage({
                id: "address-delete-subheading"
              })}
              <span className={style.accountNumber}>
                {intl.formatMessage({
                  id: "address-delete-subheading-account"
                })}
                {accountNumberOfAddressToDelete}
              </span>
              ?
            </h3>
          </div>
          <Button
            id="blue"
            className={classnames(style.deleteButton, "blue")}
            outline
            onClick={async () => {
              const fetchEveryAddressMsg = GetDeleteAddressMsg.create(
                addressToDelete
              );
              await sendMessage(BACKGROUND_PORT, fetchEveryAddressMsg);
              history.back();
            }}
          >
            {intl.formatMessage({
              id: "address-delete-delete"
            })}
          </Button>
          <Button
            id="green"
            className={classnames(style.cancelButton, "green")}
            outline
            onClick={() => {
              history.back();
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
