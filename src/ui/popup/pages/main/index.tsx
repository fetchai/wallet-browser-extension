import React, { FunctionComponent, useCallback, useState } from "react";

import { HeaderLayout } from "../../layouts";

import { Card, CardBody, Tooltip } from "reactstrap";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
// import { StakeView } from "./stake";

import classnames from "classnames";
import { useStore } from "../../stores";
import { observer } from "mobx-react";
import { FormattedMessage } from "react-intl";
import { SignOutButton } from "./sign-out";
import { SettingsButton } from "./settings";

export const MainPage: FunctionComponent = () => {
  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={
        process.env.NODE_ENV === "development" ? <Menu /> : undefined
      }
      rightRenderer={
        <>
          <SettingsButton />
          <SignOutButton />
        </>
      }
    >
      <Card className={classnames(style.card)}>
        <CardBody>
          <div className={style.containerAccountInner}>
            <AccountView />
            <AssetView />
            <TxButtonView />
          </div>
        </CardBody>
      </Card>
    </HeaderLayout>
  );
};
