import React, { FunctionComponent, useEffect, useState } from "react";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import {Currencies, Currency} from "../../../../chain-info";
import { getCurrency } from "../../../../common/currency";

import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../../components/tooltip";
import { lightModeEnabled } from "../../light-mode";
import {Coin} from "@everett-protocol/cosmosjs/common/coin";

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

  const [selectedCurrency, setSelectedCurrency] = useState(nativeCurrency.coinDenom);

  const coinAmount = CoinUtils.amountOf(
    accountStore.assets,
    nativeCurrency.coinMinimalDenom
  );


 const currencyChange = (event: any) => {
     debugger;
         const selectedCurency = event.target.value
     setSelectedCurrency(selectedCurency)
  }



  const getAmount = (denom) => {
      for (const coins of accountStore.assets) {
          if (coins.denom === denom) return coins.amount;
      }
      return undefined;
    }


  const getDecimalsFromDenom = (coinDenom) => {
        debugger;
      for (const currency in Currencies) {
        debugger;
          if(typeof currency[coinDenom] !== "undefined"){
              return currency.coinDecimals
          }
      }
       return undefined;
    }



 const getCurrencyAmount = () => {

     const selected = selectedCurrency
    const amount = getAmount(selected);
   const decimals = getDecimalsFromDenom(selected);

   // if the asset is specified in the configs can shrink else we just return raw.
     return (typeof decimals !== "undefined")?
    CoinUtils.shrinkDecimals(
                amount,
                decimals,
                0,
                6
              ) : amount;
 }


  const getDropDownOptions = () => {
       const options = [];
  for (const coins: Coin of accountStore.assets) {
            if (coins.denom !== nativeCurrency.coinDenom) {
                options.push(coins.denom)
            }
          }

return options.map((value, index) => {
         let k = index + 1;
       return (<option key={k} value={value}>{value}</option>);
  })
  }

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
      <div className={styleAsset.fiat}>
        {selectedCurrency === nativeCurrency &&
        fiat &&
        !fiat.value.equals(new Dec(0))
          ? "$" +
            parseFloat(
              fiat.value
                .mul(new Dec(coinAmount, nativeCurrency.coinDecimals))
                .toString()
            ).toLocaleString()
          : "?"}
      </div>
      {/* TODO: Show the information that account is fetching. */}
      <div className={styleAsset.amount}>
        <div>
          {!(accountStore.assets.length === 0) ?
          getCurrencyAmount()
            : "0"}{" "}
          {accountStore.assets.length > 1 ? (
          <select id="currency" name="cars" onChange={currencyChange}>
            <option key = {1} value={nativeCurrency.coinDenom}>{nativeCurrency.coinDenom}</option>
              {getDropDownOptions()}
          </select> : nativeCurrency.coinDenom}
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
