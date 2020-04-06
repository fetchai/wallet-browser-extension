import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../layouts";
import { Card, CardBody } from "reactstrap";
import style from "./style.module.scss";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import classnames from "classnames";
import { SignOutButton } from "./sign-out";
import { SettingsButton } from "./settings";

export const MainPage: FunctionComponent = () => {
  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={undefined}
      fetchIcon={true}
      rightRenderer={
        <>
          <SettingsButton />
          <SignOutButton />
        </>
      }
    >
      <Card className={classnames(style.card)}>
        <CardBody className={classnames(style.body)}>
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
