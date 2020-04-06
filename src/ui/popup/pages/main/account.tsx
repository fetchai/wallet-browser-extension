import React, { FunctionComponent } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  return (
    <div className={styleAccount.containerAccount}>
      <div style={{ flex: 1 }} />
      <div className={styleAccount.address}>
        <Address maxCharacters={28} lineBreakBeforePrefix={false} dotNumber={9} bech32Address={accountStore.bech32Address}>
          {accountStore.isAddressFetching ? "..." : accountStore.bech32Address}
        </Address>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
});
