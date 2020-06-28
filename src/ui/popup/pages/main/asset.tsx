import React, { FunctionComponent, useEffect, useState } from "react";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Currency } from "../../../../chain-info";
import {
  getCurrency,
  getCurrencyFromUnknownDenom
} from "../../../../common/currency";
import classnames from "classnames";
import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../../components/tooltip";
import { lightModeEnabled } from "../../light-mode";
import { autorun } from "mobx";
import { insertCommas } from "../../../../common/utils/insert-commas";
import { Price } from "../../stores/price";
import { BigFloat32 } from "bigfloat";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

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

  // amount of minimal denom user has
  const coinAmountOfMinimalDenom = CoinUtils.amountOf(
    accountStore.assets,
    nativeCurrency.coinMinimalDenom
  );

  // amount of regular denom user has
  const coinAmountMainDenom = CoinUtils.amountOf(
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
    }

    const amount = calculateDollarAmountOfNativeCurrency();

    if (amount > 100) {
      const display = cutOffDecimals(amount.toString());
      return "$" + parseFloat(display).toLocaleString();
    } else {
      return "$" + parseFloat(amount.toString()).toLocaleString();
    }
  };

  /**
   * Balamce can return either
   *
   */
  const calculateDollarAmountOfNativeCurrency = (): number => {
    let dollarAmount: number = 0;
    // we calc the amount in dollars of any amount of minimal demon held
    if (coinAmountOfMinimalDenom) {
      const amount: string = (fiat as Price).value
        .mul(new Dec(coinAmountOfMinimalDenom))
        .toString();
      // if dollar amount is greater than 100 then cut off the cent amount
      const reciprocal = 1 / nativeCurrency.coinDecimals;
      dollarAmount += parseFloat(amount) * reciprocal;
    }
    // we calc the amount in dollars of any amount of minimal demon held
    if (coinAmountMainDenom) {
      const amountMainDenom: string = (fiat as Price).value
        .mul(new Dec(coinAmountMainDenom))
        .toString();
      // if dollar amount is greater than 100 then cut off the cent amount
      dollarAmount += parseFloat(amountMainDenom);
    }

    return dollarAmount;
  };

  const currencyChange = (event: any) => {
    const selectedCurency = event.target.value;
    setSelectedCurrency(selectedCurency);
  };

  const getAmount = (denom: string): string | undefined => {
    const currency = getCurrencyFromUnknownDenom(denom);

    if (typeof currency === "undefined") {
      // it is not a currency about which we store info in the curencies list so cannot associate it with other denom
      // and just return the amount that we have, this may be novel or custom currency not stored in chain-info file
      for (const coin of accountStore.assets) {
        if (typeof coin !== "undefined" && coin.denom === denom)
          return coin.amount.toString();
      }

      return undefined;
    }

    // we find out how much we have of this currency in both the coing denom and minimal denom by loooking through the coins
    // held in the store.
    const denomAmount = accountStore.assets.find(
      el => el.denom === currency.coinDenom
    );
    const minimalDenomAmount = accountStore.assets.find(
      el => el.denom === currency.coinMinimalDenom
    );

    if (!denomAmount && !minimalDenomAmount) return undefined;

    let result = new BigFloat32(0);

    if (typeof minimalDenomAmount !== undefined) {
      // we multiple by reciprocal since no division in this lib
      // we have to work out how many full coins we have of this currency stored in the minimal denom
      const reciprocal = 1 / currency.coinDecimals;

      const dec = new BigFloat32(
        (minimalDenomAmount as Coin).amount.toString()
      ).mul(reciprocal);

      result = result.add(dec);
    }

    if (typeof denomAmount !== undefined) {
      // we also want to determine how many coins we have stored in the main denom
      const dec = new BigFloat32((denomAmount as Coin).amount.toString());

      result = result.add(dec);
    }

    return result.toString();
  };

  const getCurrencyAmount = () => {
    const selected = selectedCurrency;
    const amount = getAmount(selected);
    return typeof amount !== "undefined" ? insertCommas(amount) : "0";
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
      coinAmountMainDenom;
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
