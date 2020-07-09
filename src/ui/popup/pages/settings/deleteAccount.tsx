import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react";
import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { STORAGE_KEY } from "../../../components/light-mode/light-mode";

import style from "./style.module.scss";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import OutsideClickHandler from "react-outside-click-handler";

export interface DeleteAccountProps {
  hasKeyFile: boolean;
  history: any;
}

/**
 * This deletes entire account in wallet and clears all history
 */
export const DeleteAccount: FunctionComponent<DeleteAccountProps> = observer(
  ({ history, hasKeyFile }) => {
    const intl = useIntl();
    const { keyRingStore } = useStore();
    const [showDeleteConfirmation, setshowDeleteConfirmation] = useState(false);

    const handleDelete = async () => {
      if (showDeleteConfirmation) {
        await keyRingStore.clear();
        await browser.storage.sync.remove(STORAGE_KEY);
        history.goBack();
      }
      setshowDeleteConfirmation(true);
    };

    const getStorageClearanceWarningMessage = () => {
      if (!showDeleteConfirmation) return null;
      // if there is a key file then it cannot be hardware-linked
      if (hasKeyFile)
        return intl.formatMessage({
          id: "settings.update-password.button.delete-confirmation-message"
        });
      else
        return intl.formatMessage({
          id:
            "settings.update-password.button.delete-confirmation-message-hardware-linked"
        });
    };

    return (
      <OutsideClickHandler
        onOutsideClick={() => {
          setshowDeleteConfirmation(false);
        }}
      >
        <div className={style.warningWrapper}>
          <span className={style.warning}>
            {getStorageClearanceWarningMessage()}
          </span>
        </div>
        <button
          type="submit"
          className={`blue ${style.button}`}
          onClick={handleDelete}
        >
          {showDeleteConfirmation
            ? intl.formatMessage({
                id: "settings.update-password.button.delete"
              })
            : intl.formatMessage({
                id: "settings.update-password.button.delete-confirm"
              })}
        </button>
      </OutsideClickHandler>
    );
  }
);
