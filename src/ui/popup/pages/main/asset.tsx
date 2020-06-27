import React, { FunctionComponent, useEffect, useState } from "react";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Currency } from "../../../../chain-info";
import { getCurrency } from "../../../../common/currency";
import classnames from "classnames";
import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../../components/tooltip";
import { lightModeEnabled } from "../../light-mode";
import { autorun } from "mobx";
import { insertCommas } from "../../../../common/utils/insert-commas";
import { Price } from "../../stores/price";

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore } = useStore();

  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    const isEnabled = async () => {
      const enabled = await lightModeEnabled();
      setLightMode(enabled);
    };
    isEnabled();
  }, [lightMode, setLightMode]);

  const fiat = priceStore.getValue(
    "usd",
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getCurrency(chainStore.chainInfo.nativeCurrency)!.coinGeckoId
  );

  const nativeCurrency = getCurrency(
    chainStore.chainInfo.nativeCurrency
  ) as Currency;

  const [selectedCurrency, setSelectedCurrency] = useState(
    nativeCurrency.coinDenom
  );

  // correct use of reaction: reacts to length and title changes
  autorun(() => {
    if (accountStore.assets.length === 1) {
      setSelectedCurrency(accountStore.assets[0].denom);
    }
  });

  const coinAmount = CoinUtils.amountOf(
    accountStore.assets,
    nativeCurrency.coinDenom
  );
  const dollarCurrencyIsDisplayed = () => {
    const test =
      fiat &&
      selectedCurrency === chainStore.chainInfo.nativeCurrency &&
      !fiat.value.equals(new Dec(0));
    return test;
  };

  const cutOffDecimals = (s: string): string => {
    return parseFloat(s).toFixed(0);
  };

  const getCurrencyInDollars = () => {
    // if selected from dropdown and selected currency is not the one for which we have dollar price
    if (
      typeof fiat === "undefined" ||
      selectedCurrency !== chainStore.chainInfo.nativeCurrency
    ) {
      return "";
    } else if (
      accountStore.assets.length === 1 &&
      accountStore.assets[0].denom !== nativeCurrency.coinDenom
    ) {
      return "";
    } else if (fiat.value.equals(new Dec(0))) {
      return "0";
    } else if (fiat.value.mul(new Dec(coinAmount)).gt(new Dec(100))) {
      // if dollar amount is greater than 100 then cut off the cent amount
      let amount = fiat.value.mul(new Dec(coinAmount)).toString();
      amount = cutOffDecimals(amount);
      return "$" + parseFloat(amount).toLocaleString();
    } else {
      return (
        "$" +
        parseFloat(
          (fiat as Price).value.mul(new Dec(coinAmount)).toString()
        ).toLocaleString()
      );
    }
  };

  const currencyChange = (event: any) => {
    const selectedCurency = event.target.value;
    setSelectedCurrency(selectedCurency);
  };

  const getAmount = (denom: string) => {
    for (const coin of accountStore.assets) {
      if (typeof coin !== "undefined" && coin.denom === denom)
        return coin.amount;
    }
    return undefined;
  };

  const getCurrencyAmount = () => {
    const selected = selectedCurrency;
    const amount = getAmount(selected);
    return typeof amount !== "undefined"
      ? insertCommas(amount.toString())
      : "0";
  };

  /**
   * If there is just one currency to display (ie only one type of asset)
   * we look through the stored assets and get its name, otherwise we just display
   * the native asset ( which will be none ).
   *
   */

  const getSingleCurrencyDisplay = () => {
    if (accountStore.assets.length === 0) {
      return nativeCurrency.coinDenom;
    }
    return accountStore.assets[0].denom;
  };

  const getDropDownOptions = () => {
    const options = [];
    for (const coins of accountStore.assets) {
      if (coins.denom !== nativeCurrency.coinDenom) {
        options.push(coins.denom);
      }
    }

    return options.map((value, index) => {
      const k = index + 1;
      return (
        <option key={k} value={value}>
          {value}
        </option>
      );
    });
  };

  return (
    <div className={styleAsset.containerAsset}>
      <div className={styleAsset.circularLogo}>
        <img
          src={
            lightMode
              ? require("../../public/assets/fetch-circular-icon-black.svg")
              : require("../../public/assets/fetch-circular-icon.svg")
          }
          alt="Fetch.ai circular icon"
        ></img>
      </div>
      <div className={styleAsset.title}>
        <FormattedMessage id="main.account.message.available-balance" />
      </div>
      <div
        className={classnames(
          styleAsset.fiat,
          dollarCurrencyIsDisplayed() ? "" : styleAsset.hide
        )}
      >
        {getCurrencyInDollars()}
      </div>
      {/* TODO: Show the information that account is fetching. */}
      <div className={styleAsset.amount}>
        <div>
          <span className={dollarCurrencyIsDisplayed() ? "" : styleAsset.block}>
            {!(accountStore.assets.length === 0) ? getCurrencyAmount() : "0"}{" "}
          </span>
          {accountStore.assets.length > 1 ? (
            <select
              id="currency"
              className={styleAsset.select}
              onChange={currencyChange}
            >
              <option key={1} value={nativeCurrency.coinDenom}>
                {nativeCurrency.coinDenom}
              </option>
              {getDropDownOptions()}
            </select>
          ) : (
            getSingleCurrencyDisplay()
          )}
        </div>
        <div className={styleAsset.indicatorIcon}>
          {accountStore.isAssetFetching && !accountStore.assets.length ? (
            <i className="fas fa-spinner fa-spin" />
          ) : accountStore.lastAssetFetchingError ? (
            <ToolTip
              tooltip={
                accountStore.lastAssetFetchingError.message ??
                accountStore.lastAssetFetchingError.toString()
              }
              theme="dark"
              trigger="hover"
              options={{
                placement: "top"
              }}
            >
              <i className="fas fa-exclamation-triangle text-danger" />
            </ToolTip>
          ) : null}
        </div>
      </div>
    </div>
  );
});
