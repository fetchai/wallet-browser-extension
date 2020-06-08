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
import { Button } from "reactstrap";
import styleTxButton from "../main/tx-button.module.scss";
import { ToolTip } from "../../../components/tooltip";
import { shortenAddress } from "../../../../common/address";

export const AddressBookManagerPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRingStore, accountStore } = useStore();
    const intl = useIntl();
    const transitions = ["height", "opacity", "background"];

    const [lightMode, setLightMode] = useState(false);
    const [addressList, setAddressList] = useState<Array<string>>([]);
    const [activeAddress, setActiveAddress] = useState("");

    // on mount
    useEffect(() => {
      // we fetch all addresses
      const fetchEveryAddress = async () => {
        const everyAddress = await accountStore.fetchEveryAddress();
        setAddressList(everyAddress);
      };
      fetchEveryAddress();

      // and also fetch the active address ie that for which balance/transfers in wallet pertain to.
      const fetchActiveAddress = async () => {
        const activeAddress = await accountStore.getActiveAddress();
        setActiveAddress(activeAddress);
      };
      fetchActiveAddress();

      // also we check if we are in regular or light mode
      const isEnabled = async () => {
        const enabled = await lightModeEnabled();
        setLightMode(enabled);
      };
      isEnabled();
    }, []);

    /**
     * Change our active address
     *
     * The active address is the single address from the address book which the wallet is using as per downloading key files, recieve page, balance and sending ect.
     *
     * @param address
     */
    const changeActiveAddress = async (address: string) => {
      // set active address in this UI
      setActiveAddress(address);
      // set active address in the background script
      await accountStore.setActiveAddress(address);
      // refetch account data eg balance
      await accountStore.fetchAccount();
    };

    const formatAddress = (address: string) => {
      // take first and last 6 chars of address, and put 10 dots in between.
      return (
        address.substring(0, 6) +
        ".".repeat(10) +
        address.substring(address.length - 6)
      );
    };

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
          <ul className={classnames(style.addressList, "custom-scrollbar")}>
            {addressList.map((el, i) => (
              <li key={i}>
                <img
                  src={
                    activeAddress === el
                      ? require("../../public/assets/account-icon-green.svg")
                      : require("../../public/assets/account-icon-light-grey.svg")
                  }
                  className={classnames(style.icon, style.clickable)}
                  onClick={() => changeActiveAddress(el)}
                ></img>
                <div className={style.addressListContent}>
                  Account {i + 1} <br />
                  <span className={style.address}>
                    <ToolTip
                      trigger="hover"
                      options={{ placement: "bottom" }}
                      tooltip={
                        <div
                          className={"tool-tip"}
                          style={{ fontSize: "12px" }}
                        >
                          {el}
                        </div>
                      }
                    >
                        {formatAddress(el)}
                    </ToolTip>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <hr className={style.hr}></hr>
          <div className={classnames(style.actionItem)}>
            <span
              className={classnames(style.actionItemIcon, style.clickable)}
              onClick={() => {
                browser.tabs.create({
                  url: "/popup.html#/add-account/create"
                });
              }}
            >
              <i className="fas fa-2x fa-plus"></i>
            </span>
            <span>Create Account</span>
          </div>
          <br></br>
          <div className={classnames(style.actionItem)}>
            <span
              className={classnames(style.actionItemIcon, style.clickable)}
              onClick={() => {
                browser.tabs.create({
                  url: "/popup.html#/add-account/import"
                });
              }}
            >
              <i className="fas fa-2x fa-download"></i>
            </span>
            <span> Import Account</span>
          </div>
          <Button
            id="green"
            className={classnames(style.logOutButton, "green")}
            outline
            onClick={() => {
              keyRingStore.lock();
              history.goBack();
            }}
          >
            Log out
          </Button>
        </div>
      </HeaderLayout>
    );
  }
);
