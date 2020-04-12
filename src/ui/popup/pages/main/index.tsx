import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "../../layouts";
import { Card, CardBody } from "reactstrap";
import style from "./style.module.scss";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import classnames from "classnames";
import { SignOutButton } from "./sign-out";
import { SettingsButton } from "./settings";
import { lightModeEnabled } from "../../light-mode";

export const MainPage: FunctionComponent = () => {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    //https://medium.com/javascript-in-plain-english/how-to-use-async-function-in-react-hook-useeffect-typescript-js-6204a788a435
    const isEnabled = async () => {
      const enabled = await lightModeEnabled();
      setLightMode(enabled);
    };
    isEnabled();
  }, [lightMode, setLightMode]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      menuRenderer={undefined}
      fetchIcon={true}
      lightMode={lightMode}
      rightRenderer={
        <>
          <SettingsButton lightMode={lightMode} />
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
