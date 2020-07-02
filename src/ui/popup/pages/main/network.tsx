import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { observer } from "mobx-react";
import ActiveEndpoint from "../../../../common/utils/active-endpoint";
import style from "./network.module.scss";
import { ToolTip } from "../../../components/tooltip";
import { useStore } from "../../stores";

/**
 * Small component showing which network we are currently connected to.
 *
 */
export const Network: FunctionComponent = observer(() => {
  const { accountStore } = useStore();
  const intl = useIntl();

  // active network which the wallet curently displays data for of list.
  const [activeNetwork, setActiveNetwork] = useState<string>("");

  useEffect(() => {
    // on mount we get active endpoint so we can display it correctly.
    const findActiveEndpoint = async () => {
      const network = await ActiveEndpoint.getActiveEndpoint();
      debugger;
      setActiveNetwork(network.name);
    };

    findActiveEndpoint();
  }, []);

  return (
    <div className={style.network}>
      {accountStore.lastAssetFetchingError
        ? intl.formatMessage({
            id: "main.network.error-connect-to"
          })
        : intl.formatMessage({
            id: "main.network.connect-to"
          })}{" "}
      <span className={style.networkName}>{activeNetwork}</span>
      {accountStore.lastAssetFetchingError ? (
        <>
          {" "}
          <ToolTip
            tooltip={
              accountStore.lastAssetFetchingError.message ??
              accountStore.lastAssetFetchingError.toString()
            }
            theme="dark"
            trigger="hover"
            options={{
              placement: "top"
            }}
          >
            <i className="fas fa-exclamation-triangle text-danger" />
          </ToolTip>
        </>
      ) : null}
    </div>
  );
});
