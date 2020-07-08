import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { Button } from "reactstrap";
import { RouteComponentProps } from "react-router";
import { HeaderLayout } from "../../layouts";
import style from "./style.module.scss";
import queryString from "query-string";
import { useStore } from "../../stores";
import { useSignature } from "../../../hooks";
import classnames from "classnames";
import { DataTab } from "./data-tab";
import { DetailsTab } from "./details-tab";
import { useIntl } from "react-intl";
import {
  disableScroll,
  enableScroll,
  fitWindow
} from "../../../../common/window";
import {lightModeEnabled} from "../../../components/light-mode/light-mode";
import { LedgerNanoMsg } from "../../../../background/ledger-nano";
import { METHODS } from "../../../../background/ledger-nano/constants";
import { sendMessage } from "../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

enum Tab {
  Details,
  Data
}

export const SignPage: FunctionComponent<RouteComponentProps<{
  id: string;
}>> = ({ history, match, location }) => {
  const query = queryString.parse(location.search);
  const external = query.external ?? false;
  const [lightMode, setLightMode] = useState(false);
  const [hardwareErrorMessage, setHardwareErrorMessage] = useState("");
  // if we require a ledger nano but it is unavailable then we set this variable to disable the sending of transaction
  const [
    isNanoUnavailableAndRequired,
    setIsNanoUnavailableAndRequired
  ] = useState(false);

  useEffect(() => {
    if (external) {
      fitWindow();
      disableScroll();
    } else {
      enableScroll();
    }

    const isEnabled = async () => {
      const enabled = await lightModeEnabled();
      setLightMode(enabled);
    };
    isEnabled();
  }, [external, lightMode, setLightMode]);

  // on mount we check if it is hardware linked wallet and if it is then we show an info message staying the issue.
  useEffect(() => {
    (async () => {
      const hardwareLinked: boolean = await keyRingStore.isHardwareLinked();
      if (hardwareLinked) {
        let hardwareError = false;

        const msg = LedgerNanoMsg.create(METHODS.isCosmosAppOpen);
        const result = await sendMessage(BACKGROUND_PORT, msg);

        if (typeof result.errorMessage !== "undefined") {
          setHardwareErrorMessage(result.errorMessage);
          setIsNanoUnavailableAndRequired(true);
          hardwareError = true;
          return;
        }

        if (!hardwareError) {
          setHardwareErrorMessage("");
        }
      }
    })();
  }, []);

  const id = match.params.id;

  const [tab, setTab] = useState<Tab>(Tab.Details);

  const intl = useIntl();

  const { keyRingStore } = useStore();

  const signing = useSignature(id);

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (!signing.loading && external && signing.reject) {
        await signing.reject();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [signing, external]);

  useEffect(() => {
    return () => {
      // If id is changed, just reject the prior one.
      if (external && signing.reject) {
        signing.reject();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signing.reject, signing.id, external]);

  const resolveError = () => {
    setIsNanoUnavailableAndRequired(false);
  };

  const onApproveClick = useCallback(async () => {
    const hardwareLinked: boolean = await keyRingStore.isHardwareLinked();
    if (hardwareLinked) {
      const hardwareError = false;

      // try {
      //   await LedgerNano.testDevice();
      // } catch (error) {
      //   setHardwareErrorMessage(error.message);
      //   hardwareError = true;
      //   return;
      // }

      if (!hardwareError) {
        setHardwareErrorMessage("");
      }
    }

    if (signing.approve) {
      await signing.approve();
    }

    // If this is called by injected wallet provider. Just close.
    if (external) {
      window.close();
    }
  }, [signing, external]);

  const onRejectClick = useCallback(async () => {
    if (signing.reject) {
      await signing.reject();
    }

    // If this is called by injected wallet provider. Just close.
    if (external) {
      window.close();
    }
  }, [signing, external]);

  return (
    <HeaderLayout
      canChangeChainInfo={false}
      onBackButton={
        !external
          ? () => {
              history.goBack();
            }
          : undefined
      }
      style={{ background: "none" }}
      lightMode={lightMode}
    >
      <div className={style.container}>
        <div className={classnames(style.tabs)}>
          <ul>
            <li className={classnames({ active: tab === Tab.Details })}>
              <a
                className={style.tab}
                onClick={() => {
                  setTab(Tab.Details);
                }}
              >
                {intl.formatMessage({
                  id: "sign.tab.details"
                })}
              </a>
            </li>
            <li className={classnames({ active: tab === Tab.Data })}>
              <a
                className={style.tab}
                onClick={() => {
                  setTab(Tab.Data);
                }}
              >
                {intl.formatMessage({
                  id: "sign.tab.data"
                })}
              </a>
            </li>
          </ul>
        </div>
        <div className={classnames(style.tabContainer, "custom-scrollbar")}>
          {tab === Tab.Data ? <DataTab message={signing.message} /> : null}
          {tab === Tab.Details ? (
            <DetailsTab
              message={signing.message}
              hardwareErrorMessage={hardwareErrorMessage}
              resolveError={resolveError}
            />
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
        <div className={style.buttons}>
          <Button
            className={classnames(style.button, "blue")}
            color="danger"
            disabled={
              signing.message == null ||
              signing.message === "" ||
              signing.initializing
            }
            data-loading={signing.requested}
            onClick={onRejectClick}
            outline
          >
            {intl.formatMessage({
              id: "sign.button.cancel"
            })}
          </Button>
          <Button
            className={classnames(style.button, "green")}
            color="primary"
            disabled={
              signing.message == null ||
              signing.message === "" ||
              signing.initializing ||
              isNanoUnavailableAndRequired
            }
            data-loading={signing.requested}
            onClick={onApproveClick}
          >
            {intl.formatMessage({
              id: "sign.button.approve"
            })}
          </Button>
        </div>
      </div>
    </HeaderLayout>
  );
};
