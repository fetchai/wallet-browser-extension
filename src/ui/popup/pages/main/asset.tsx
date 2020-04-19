import React, { FunctionComponent, useEffect, useState } from "react";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Currencies, Currency } from "../../../../chain-info";
import { getCurrency } from "../../../../common/currency";

import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../../components/tooltip";
import { lightModeEnabled } from "../../light-mode";
import { Int } from "@everett-protocol/cosmosjs/common/int";

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

  const coinAmount = CoinUtils.amountOf(
    accountStore.assets,
    nativeCurrency.coinMinimalDenom
  );

  const getCurrencyInDollars = () => {
    if (!fiat || selectedCurrency !== chainStore.chainInfo.nativeCurrency)
      return "";
    else
      return !fiat.value.equals(new Dec(0))
        ? "$" +
            parseFloat(
              fiat.value
                .mul(new Dec(coinAmount, nativeCurrency.coinDecimals))
                .toString()
            ).toLocaleString()
        : "?";
  };

  const currencyChange = (event: any) => {
    const selectedCurency = event.target.value;
    setSelectedCurrency(selectedCurency);
  };

  const getAmount = denom => {
    for (const coin of accountStore.assets) {
      if (typeof coin !== "undefined" && coin.denom === denom)
        return coin.amount;
    }
    return undefined;
  };

  const getDecimalsFromDenom = (coinDenom: string) => {
    for (const currency in Currencies) {
      if (Currencies[currency].coinDenom === coinDenom) {
        return Currencies[currency].coinDecimals;
      }
    }
    return undefined;
  };

  const getCurrencyAmount = () => {
    const selected = selectedCurrency;
    debugger;
    const amount = getAmount(selected);

    if (typeof amount === "undefined") {
      return "0";
    }

    const decimals = getDecimalsFromDenom(selected);

    if (typeof decimals === "undefined") {
      return amount.toString();
    }
    // if the asset is specified in the configs can shrink else we just return raw.
    return CoinUtils.shrinkDecimals(amount as Int, decimals as number, 0, 6);
  };

  const getDropDownOptions = () => {
    const options = [];
    for (const coins of accountStore.assets) {
      if (coins.denom !== nativeCurrency.coinDenom) {
        options.push(coins.denom);
      }
    }

    return options.map((value, index) => {
      let k = index + 1;
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
      <div className={styleAsset.fiat}>{getCurrencyInDollars()}</div>
      {/* TODO: Show the information that account is fetching. */}
      <div className={styleAsset.amount}>
        <div>
          {!(accountStore.assets.length === 0) ? getCurrencyAmount() : "0"}{" "}
          {accountStore.assets.length > 1 ? (
            <select id="currency" onChange={currencyChange}>
              <option key={1} value={nativeCurrency.coinDenom}>
                {nativeCurrency.coinDenom}
              </option>
              {getDropDownOptions()}
            </select>
          ) : (
            nativeCurrency.coinDenom
          )}
        </div>
        <div className={styleAsset.indicatorIcon}>
          {accountStore.isAssetFetching ? (
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
