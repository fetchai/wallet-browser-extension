import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { observer } from "mobx-react";
import ActiveEndpoint from "../../../../common/utils/active-endpoint";
import style from "./network.module.scss";

/**
 * Small component showing which network we are currently connected to.
 *
 */
export const Network: FunctionComponent = observer(() => {
  const intl = useIntl();

  // active network which the wallet currently displays data for of list.
  const [activeNetwork, setActiveNetwork] = useState<string>("");

  useEffect(() => {
    // on mount we get active endpoint so we can display it correctly.
    const findActiveEndpoint = async () => {
      const network = await ActiveEndpoint.getActiveEndpoint();
      setActiveNetwork(network.name);
    };

    findActiveEndpoint();
  }, []);

  return (
    <div className={style.network}>
      {intl.formatMessage({
        id: "main.network.connect-to"
      })}{" "}
      {activeNetwork}
    </div>
  );
});
