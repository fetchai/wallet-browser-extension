import React, { FunctionComponent } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";
import classnames from "classnames";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { isFirefox } from "../../../../common/utils/is-firefox";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  return (
    <div className={styleAccount.containerAccount}>
      <div style={{ flex: 1 }} />
      <div className={classnames(styleAccount.address, isFirefox() ? styleAccount.firefox: "")}>
        <Address maxCharacters={28} lineBreakBeforePrefix={false} dotNumber={9} bech32Address={accountStore.bech32Address}>
          {accountStore.isAddressFetching ? "..." : accountStore.bech32Address}
        </Address>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
});
