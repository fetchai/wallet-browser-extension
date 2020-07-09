import React, { FunctionComponent, useEffect, useState } from "react";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { getCurrencyFromMinimalDenom } from "../../../../common/currency";

import styleDetailsTab from "./details-tab.module.scss";
import classnames from "classnames";

import { MessageObj, renderMessage } from "./messages";
import { useIntl } from "react-intl";
import { divideByDecimals } from "../../../../common/utils/divide-decimals";
import { formatDollarString } from "../../../../common/utils/formatDollarStringFee";
import LedgerNano from "../../other/ledger-nano";

export const DetailsTab: FunctionComponent<{
  message: string;
  hardwareErrorMessage: string;
  resolveError: () => void;
}> = observer(({ message, hardwareErrorMessage, resolveError }) => {
  const { priceStore } = useStore();

  const intl = useIntl();
  const [fee, setFee] = useState<Coin[]>([]);
  const [feeFiat, setFeeFiat] = useState(new Dec(0));
  const [memo, setMemo] = useState("");
  const [msgs, setMsgs] = useState<MessageObj[]>([]);
  const [hardwareErrorMsg, setHardwareErrorMsg] = useState("");
  const [hardwareErrorResolved, sethardwareErrorResolved] = useState(false);

  const checkNanoIsReady = async () => {
    let hardwareError = false;
    let errorMessage = "";
    let ledger;
    try {
      ledger = await LedgerNano.getInstance();
      await ledger.isCosmosAppOpen();
    } catch (error) {
      errorMessage = error.message;
    }

    if (errorMessage) {
      hardwareError = true;
      setHardwareErrorMsg(errorMessage);
    }

    if (!hardwareError) {
      sethardwareErrorResolved(true);
      resolveError();
    }
  };

  useEffect(() => {
    if (hardwareErrorMessage && hardwareErrorMessage !== hardwareErrorMsg) {
      setHardwareErrorMsg(hardwareErrorMessage);
    }
  }, [hardwareErrorMessage]);

  useEffect(() => {
    if (message) {
      const msgObj: {
        fee: {
          amount: [{ amount: string; denom: string }];
          gas: string;
        };
        memo: string;
        msgs: MessageObj[];
      } = JSON.parse(message);

      setMemo(msgObj.memo);
      setMsgs(msgObj.msgs);

      const coinObjs = msgObj.fee.amount;
      const fees: Coin[] = [];
      for (const coinObj of coinObjs) {
        fees.push(new Coin(coinObj.denom, coinObj.amount));
      }
      setFee(fees);
    }
  }, [message]);

  useEffect(() => {
    let price = new Dec(0);
    for (const coin of fee) {
      const currency = getCurrencyFromMinimalDenom(coin.denom);
      if (currency) {
        const value = priceStore.getValue("usd", currency.coinGeckoId);
        const amount = divideByDecimals(
          coin.amount.toString(),
          currency.coinDecimals
        );
        if (value) {
          price = price.add(new Dec(amount).mul(value.value));
        }
      }
    }

    setFeeFiat(price);
  }, [fee, priceStore]);

  return (
    <div className={styleDetailsTab.container}>
      <div
        className={classnames(
          styleDetailsTab.section,
          styleDetailsTab.messages
        )}
      >
        <div className={styleDetailsTab.title}>
          {intl.formatMessage({
            id: "sign.list.messages.label"
          })}
        </div>
        {msgs
          .filter(msg => {
            return typeof msg !== "undefined";
          })
          .map((msg, i) => {
            const msgContent = renderMessage(msg, intl) as any;
            return (
              <React.Fragment key={i.toString()}>
                <Msg icon={msgContent.icon} title={msgContent.title}>
                  {msgContent.content}
                </Msg>
                <hr />
              </React.Fragment>
            );
          })}
      </div>
      {!hardwareErrorMessage && !hardwareErrorResolved ? (
        <div className={styleDetailsTab.section}>
          <div className={styleDetailsTab.title}>
            {intl.formatMessage({
              id: "sign.info.fee"
            })}
          </div>
          <div className={styleDetailsTab.fee}>
            <div>
              {fee
                .map(fee => {
                  return `${fee.amount.toString()} ${fee.denom}`;
                })
                .join(",")}
            </div>
            <div className={styleDetailsTab.fiat}>
              {formatDollarString(feeFiat.toString())}
            </div>
          </div>
        </div>
      ) : null}
      {memo ? (
        <div className={styleDetailsTab.section}>
          <div className={styleDetailsTab.title}>
            {intl.formatMessage({
              id: "sign.info.memo"
            })}
          </div>
          <div className={styleDetailsTab.memo}>{memo}</div>
        </div>
      ) : null}
      {hardwareErrorMessage && !hardwareErrorResolved ? (
        <div className={styleDetailsTab.section}>
          <div className={styleDetailsTab.title}>
            {intl.formatMessage({
              id: "sign.info.error"
            })}
          </div>
          <div className={styleDetailsTab.error}>{hardwareErrorMessage}</div>
          <button className={classnames("green", styleDetailsTab.errorButton)} onClick={checkNanoIsReady}>
            resolved
          </button>
        </div>
      ) : null}
    </div>
  );
});

const Msg: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      <div className={styleDetailsTab.icon}>
        <div style={{ flex: 1 }} />
        <i className={icon} />
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleDetailsTab.contentContainer}>
        <div className={styleDetailsTab.contentTitle}>{title}</div>
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};
