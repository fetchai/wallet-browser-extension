import React, { FunctionComponent, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Expand from "react-expand-animated";
import { useStore } from "../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import flushPromises from "flush-promises";
import { lightModeEnabled } from "../../light-mode";
import classnames from "classnames";
import style from "./style.module.scss";

export const AddressBookManagerPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRingStore, accountStore } = useStore();
    const intl = useIntl();
    const transitions = ["height", "opacity", "background"];

    const [lightMode, setLightMode] = useState(false);
    const [addressList, setAddressList] = useState<Array<string>>([]);

    // on mount
    useEffect(() => {
      const fetchEveryAddress = async () => {
        const everyAddress = await accountStore.fetchEveryAddress();
        setAddressList(everyAddress);
      };
      fetchEveryAddress();
    }, []);

    useEffect(() => {
      const isEnabled = async () => {
        const enabled = await lightModeEnabled();
        setLightMode(enabled);
      };
      isEnabled();
    }, [lightMode, setLightMode]);

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
              history.goBack();
            }}
            stroke={4}
            style={{ height: "24px" }}
            className={style.backButton}
            lightMode={lightMode}
          ></BackButton>
          <div className={style.titleWrapper}>
            <h2>
              {intl.formatMessage({
                id: "address-book-manager.heading"
              })}
            </h2>
          </div>
          <ul>
            {addressList.map((el, i) => (
              <li key={i}>
                Address {i} <br /> {el}
              </li>
            ))}
            <hr></hr>
            <div></div>
            <span
              className={classnames("icon", "is-medium", style.icon)}
              onClick={() => {
                browser.tabs.create({
                  url: "/popup.html#/add-account/create"
                });
              }}
            >
              <i className="fas fa-2x fa-plus"></i>
            </span>
            <span
              className={classnames("icon", "is-medium", style.icon)}
              onClick={() => {
                browser.tabs.create({
                  url: "/popup.html#/add-account/import"
                });
              }}
            >
              <i className="fas fa-2x fa-download"></i>
            </span>
          </ul>
        </div>
      </HeaderLayout>
    );
  }
);
