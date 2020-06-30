import React, { FunctionComponent, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
import { lightModeEnabled } from "../../light-mode";
import classnames from "classnames";
import style from "./style.module.scss";
import { Button } from "reactstrap";
import { ToolTip } from "../../../components/tooltip";

export const AddressBookManagerPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRingStore, accountStore } = useStore();
    const intl = useIntl();
    const [lightMode, setLightMode] = useState(false);
    const [addressList, setAddressList] = useState<Array<string>>([]);
    const [activeAddress, setActiveAddress] = useState("");

    // indexes of all addresses that have been copied
    const [copiedIndexes, setCopiedIndexes] = useState<Array<number>>([]);

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
      // fetch account data eg balance
      await accountStore.clearAssets(true);
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

    const toolTipText = (index: number) => {
      return copiedIndexes.includes(index) ? "Copied!" : "Copy";
    };

    const getIcon = (el: string) => {
      if (activeAddress === el) {
        return require("../../public/assets/account-icon-green.svg");
      } else if (lightMode) {
        return require("../../public/assets/account-icon-dark-grey.svg");
      } else {
        return require("../../public/assets/account-icon-light-grey.svg");
      }
    };

    return (
      <HeaderLayout
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
            {addressList.map((address, index) => (
              <li key={index}>
                <img
                  src={getIcon(address)}
                  className={classnames(style.icon, style.clickable)}
                  onClick={() => changeActiveAddress(address)}
                ></img>
                <div className={style.addressListContent}>
                  Account {addressList.length > 1 ? index + 1 : ""} <br />
                  <span
                    className={classnames(style.address, style.clickable)}
                    onClick={async () => {
                      await navigator.clipboard.writeText(address);
                      setCopiedIndexes(copiedIndexes => [
                        ...copiedIndexes,
                        index
                      ]);
                    }}
                  >
                    <ToolTip
                      trigger="hover"
                      options={{ placement: "bottom" }}
                      tooltip={
                        <div className={"tool-tip"}>{toolTipText(index)}</div>
                      }
                    >
                      {formatAddress(address)}
                    </ToolTip>
                  </span>
                </div>
                {addressList.length > 1 ? (
                  <span
                    className={classnames(style.closeIcon, style.clickable)}
                    onClick={() => {
                      history.push({
                        pathname: "/address-delete",
                        search: `?address=${address}&accountNumber=${index + 1}`
                      });
                    }}
                  >
                    <i className="fa fa-2x fa-close"></i>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <hr className={style.hr}></hr>
          <div className={classnames(style.actionItem)}>
            <span
              className={classnames(
                style.actionItemIcon,
                style.clickable,
                style.actionItemIconCreate
              )}
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
              className={classnames(
                style.actionItemIcon,
                style.clickable,
                style.actionItemIconImport
              )}
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
