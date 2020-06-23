import React, { FunctionComponent, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { HeaderLayout } from "../../layouts";
import { BackButton } from "../../layouts";
import { observer } from "mobx-react";
import style from "./style.module.scss";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Expand from "react-expand-animated";
import { VERSION } from "../../../../config";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
import { lightModeEnabled } from "../../light-mode";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import classnames from "classnames";
import { CustomEndpoint } from "./customEndpoint";
import { DownloadKeyFile } from "./downloadKeyFile";
import { ChangePassword } from "./changePassword";
import { DeleteAccount } from "./deleteAccount";
import {ToggleLightMode} from "./toggleLightMode";

export const SettingsPage: FunctionComponent<RouteComponentProps> = observer(
  ({ history }) => {
    const { keyRingStore } = useStore();
    const intl = useIntl();

    const transitions = ["height", "opacity", "background"];

    const [collapsible1, setcollapsible1] = useState(false);
    const [collapsible1a, setcollapsible1a] = useState(false);
    const [collapsible1b, setcollapsible1b] = useState(false);
    const [collapsible1c, setcollapsible1c] = useState(false);
    const [collapsible2, setcollapsible2] = useState(false);
    const [collapsible3, setcollapsible3] = useState(false);
    const [collapsible2a, setcollapsible2a] = useState(false);
    const [collapsible2b, setcollapsible2b] = useState(false);
    const [lightMode, setLightMode] = useState(false);

    const [keyFile, setKeyFile] = useState("");

    useEffect(() => {
      const getFile = async () => {
        const json = await keyRingStore.getKeyFile();

        if (json !== null) {
          setKeyFile(JSON.stringify(json));
        }
      };

      getFile();
    }, []);

    useEffect(() => {
      const isEnabled = async () => {
        const enabled = await lightModeEnabled();
        setLightMode(enabled);
      };
      isEnabled();
    }, [lightMode, setLightMode]);

    /**
     * Collapsibiles are all toggled using this and then their "index" which is their name eg 2 or 2a.
     * They are given a number based on their position in the page and then letters for nesting eg 1a and 1b are
     * within 1 and 1aa would be nested within 1a
     *
     * This function looks very complex but very simple whereby we go through every collapsible on page and if the collapsible was the clicked collasible
     * we toggle it ( this functions top level if clauses)
     * or else in the respective else clauses we close it (unless it is a sub collapsible eg 2b then we don't close 2 but do do'nt change its state).
     *
     * It will toggle one top level collapsible and close all others if called with an index of a top level collapsible.
     *
     * @param index
     */
    const toggle = async (index: number | string): Promise<void> => {
      //todo look at reimplementing this is forwardrefs
      // wait for the expanandables before closing for better UI
      // setTimeout(setshowDeleteConfirmation.bind(null, false), 500);

      if (index === 1) {
        setcollapsible1(prev => !prev);
      } else if (!index.toString().includes("1")) {
        setcollapsible1(false);
      }

      if (index === "1a") {
        setcollapsible1a(prev => !prev);
      } else {
        setcollapsible1a(false);
      }

      if (index === "1b") {
        setcollapsible1b(prev => !prev);
      } else {
        setcollapsible1b(false);
      }

      if (index === "1c") {
        setcollapsible1c(prev => !prev);
      } else {
        setcollapsible1c(false);
      }

      if (index === 2) {
        setcollapsible2(prev => !prev);
      } else if (!index.toString().includes("2")) {
        setcollapsible2(false);
      }

      if (index === "2a") {
        setcollapsible2a(prev => !prev);
      } else {
        setcollapsible2a(false);
      }

      if (index === "2b") {
        setcollapsible2b(prev => !prev);
      } else {
        setcollapsible2b(false);
      }

      if (index === 3) {
        setcollapsible3(prev => !prev);
      } else {
        setcollapsible3(false);
      }
    };


    return (
      <HeaderLayout
        showChainName={false}
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
                id: "settings.heading"
              })}
            </h2>
          </div>
          <div className={style.mainButton} onClick={() => toggle(1)}>
            General
          </div>
          <Expand open={collapsible1} duration={500} transitions={transitions}>
            <h3
              className={classnames("clickable", style.subHeading)}
              onClick={() => toggle("1a")}
            >
              {intl.formatMessage({
                id: "settings.light-mode.pill.title"
              })}
            </h3>

            <Expand
              open={collapsible1a}
              duration={500}
              transitions={transitions}
            >
              <ToggleLightMode
                lightMode={lightMode}
                setLightMode={setLightMode}
              />
            </Expand>

            {keyFile ? (
              <>
                <h3
                  className={classnames("clickable", style.subHeading)}
                  onClick={() => toggle("1b")}
                >
                  {" "}
                  {intl.formatMessage({
                    id: "settings.update-password.heading.download"
                  })}
                </h3>
                <Expand
                  open={collapsible1b}
                  duration={500}
                  transitions={transitions}
                >
                  <DownloadKeyFile keyFileProps={keyFile} />
                </Expand>
              </>
            ) : null}

            <div className="input_container">
              <h3
                className={classnames("clickable", style.subHeading)}
                onClick={() => toggle("1c")}
              >
                {intl.formatMessage({
                  id: "settings.choose-network"
                })}
              </h3>
              <Expand
                open={collapsible1c}
                duration={500}
                transitions={transitions}
              >
                <CustomEndpoint lightMode={lightMode}></CustomEndpoint>
              </Expand>
            </div>
          </Expand>

          <div className={style.mainButton} onClick={() => toggle(2)}>
            Security & Privacy
          </div>
          <Expand open={collapsible2} duration={500} transitions={transitions}>
            <h3
              className={classnames(style.subHeading, style.clickable)}
              onClick={() => toggle("2a")}
            >
              {intl.formatMessage({
                id: "settings.update-password.heading.change-password"
              })}
            </h3>
            <Expand
              open={collapsible2a}
              duration={500}
              transitions={transitions}
            >
              <ChangePassword />
            </Expand>

            <h3
              className={classnames(style.subHeading, style.clickable)}
              onClick={() => toggle("2b")}
            >
              {" "}
              {intl.formatMessage({
                id: "settings.update-password.heading.reset"
              })}
            </h3>
            <Expand
              open={collapsible2b}
              duration={500}
              transitions={transitions}
            >
              <DeleteAccount
                hasKeyFile={keyFile !== null}
                history={history}
              ></DeleteAccount>
            </Expand>
          </Expand>
          <div className={style.mainButton} onClick={() => toggle(3)}>
            About
          </div>
          <Expand open={collapsible3} duration={500} transitions={transitions}>
            <div className={style.aboutSection}>
              <p className={style.about}>FET Wallet Version {VERSION}</p>
              <p className={style.about}>
                Developed and Designed by Fetch.ai Cambridge
              </p>
            </div>
          </Expand>
        </div>
      </HeaderLayout>
    );
  }
);
