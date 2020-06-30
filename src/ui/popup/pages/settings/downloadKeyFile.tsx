import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react";
import classnames from "classnames";
import { useIntl } from "react-intl";
import style from "./style.module.scss";

interface DownloadKeyFileProps {
  keyFileProps: string;
}

export const DownloadKeyFile: FunctionComponent<DownloadKeyFileProps> = observer(
  ({ keyFileProps }) => {
    const [keyFile] = useState(keyFileProps);
    const intl = useIntl();

    const downloadKeyFile = async () => {
      if (!keyFile) return;

      const element = document.createElement("a");
      const file = new Blob([keyFile], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = intl.formatMessage({
        id: "settings.download.key.name"
      });
      document.body.appendChild(element);
      element.click();
    };

    return keyFile !== null ? (
      <button
        type="button"
        className={classnames("green", style.button, style.expandable)}
        onClick={downloadKeyFile}
      >
        {intl.formatMessage({
          id: "settings.update-password.button.download"
        })}
      </button>
    ) : null;
  }
);
