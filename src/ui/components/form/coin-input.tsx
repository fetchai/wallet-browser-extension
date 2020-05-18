import React, { FunctionComponent, useEffect, useState } from "react";

import { Currency } from "../../../chain-info";
import classnames from "classnames";
import styleCoinInput from "./coin-input.module.scss";
import style from "./form.module.scss";

import { getCurrency, getCurrencyFromDenom } from "../../../common/currency";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { ElementLike } from "react-hook-form/dist/types";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { FormFeedback, FormGroup, Input, InputGroup, Label } from "reactstrap";
import { useStore } from "../../popup/stores";
import { useIntl } from "react-intl";

export interface CoinInputProps {
  currencies: Currency[];
  isCosmosBeingSent: boolean;
  balances?: Coin[];
  balanceText?: string;
  clearError?: any;
  className?: string;
  label?: string;
  error?: string;

  input: {
    name: string;
    ref: React.RefObject<HTMLInputElement> | ElementLike | null;
  };

  select: {
    name: string;
    ref: React.RefObject<HTMLSelectElement> | ElementLike | null;
    callBack: any;
  };

  onChangeAllBanace?: (allBalance: boolean) => void;
}

interface DecCoin {
  dec: Dec;
  decimals: number;
  denom: string;
}

export const CoinInput: FunctionComponent<CoinInputProps> = props => {
  const {
    isCosmosBeingSent,
    currencies,
    balances,
    balanceText,
    className,
    label,
    error,
    input,
    select,
    onChangeAllBanace,
    clearError
  } = props;

  const { chainStore, accountStore } = useStore();
  const intl = useIntl();
  const [currency, setCurrency] = useState<Currency | undefined>();
  const [step, setStep] = useState<string | undefined>();
  const [balance, setBalance] = useState<DecCoin | undefined>();

  const [allBalance, setAllBalance] = useState(false);
  const [isCosmosBeingSentProp, setIsCosmosBeingSentProp] = useState(
    isCosmosBeingSent
  );

  const nativeCurrency = getCurrency(
    chainStore.chainInfo.nativeCurrency
  ) as Currency;

  const [selectedCurrency, setSelectedCurrency] = useState(
    nativeCurrency.coinDenom
  );

  useEffect(() => {
    // If curreny currency is undefined, or new currencies don't have the matched current currency,
    // set currency as the first of new currencies.
    if (!currency) {
      if (currencies.length > 0) {
        setCurrency(currencies[0]);
      }
    } else {
      const find = currencies.find(c => {
        return c.coinMinimalDenom === currency.coinMinimalDenom;
      });
      if (!find) {
        if (currencies.length > 0) {
          setCurrency(currencies[0]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencies]);

  useEffect(() => {
    setIsCosmosBeingSentProp(isCosmosBeingSent);
  }, [isCosmosBeingSent]);

  useEffect(() => {
    if (balances && currency) {
      const decCoin: DecCoin = {
        dec: new Dec(0),
        decimals: currency.coinDecimals,
        denom: currency.coinDenom
      };

      for (const coin of balances) {
        if (coin.denom === currency.coinMinimalDenom) {
          let precision = new Dec(1);
          for (let i = 0; i < currency.coinDecimals; i++) {
            precision = precision.mul(new Dec(10));
          }

          let dec = new Dec(coin.amount);
          dec = dec.quoTruncate(precision);

          decCoin.dec = dec;
          break;
        }
      }

      setBalance(decCoin);
    }
  }, [currency, balances]);

  useEffect(() => {
    if (currency) {
      let dec = new Dec(1);
      for (let i = 0; i < currency.coinDecimals; i++) {
        dec = dec.quoTruncate(new Dec(10));
      }
      setStep(dec.toString(currency.coinDecimals));
    } else {
      setStep(undefined);
    }
  }, [currency]);

  const currencyChange = (event: any) => {
    const selectedCurency = event.target.value;
    const currency = getCurrencyFromDenom(selectedCurency);
    setCurrency(currency);
    setSelectedCurrency(selectedCurency);
    select.callBack(selectedCurency);
  };

  const canAllBalance =
    onChangeAllBanace && balance && balance.dec.gt(new Dec(0));

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  const getDropDownOptions = () => {
    const options = [];
    for (const coins of accountStore.assets) {
      if (coins.denom !== nativeCurrency.coinDenom) {
        options.push(coins.denom);
      }
    }

    return options.map((value, index) => {
      return (
        <option key={index + 1} value={value}>
          {value}
        </option>
      );
    });
  };

  /**
   * If we have more than one currency we will show the dropdown.
   */
  const showDropDown = () => {
    return accountStore.assets.length > 1;
  };

  const getSelect = () => {
    // if we are not sending cosmos then we are sending ethereum via peggy, in which case it is always the
    // ethereum as the currency the recipient is sending, so always show that regardless.
    if (!isCosmosBeingSentProp) {
      return (
        <span className={styleCoinInput.singleCurrency}>
          {intl.formatMessage({
            id: "send.recipient.currency.ethereum"
          })}
        </span>
      );
    }

    // if we have multiple currencies in our asset store then we can select any of them to send.
    if (showDropDown()) {
      return (
        <select
          value={selectedCurrency}
          id="currency"
          name="denom"
          className={styleCoinInput.select}
          onChange={currencyChange}
        >
          <option key={1} value={nativeCurrency.coinDenom}>
            {nativeCurrency.coinDenom}
          </option>
          {getDropDownOptions()}
        </select>
      );
    }
    // we have only one currency available to send (native) so we just show that currency.
    return (
      <span className={styleCoinInput.singleCurrency}>
        {nativeCurrency.coinDenom}
      </span>
    );
  };

  return (
    <FormGroup className={className}>
      {label ? (
        <Label
          for={inputId}
          className={style.formControlLabel}
          style={{ width: "100%" }}
        >
          {label}
          {balances ? (
            <div
              className={classnames(styleCoinInput.balance, {
                [styleCoinInput.clickable]: canAllBalance,
                [styleCoinInput.clicked]: allBalance
              })}
              onClick={() => {
                if (canAllBalance && onChangeAllBanace) {
                  const prev = allBalance;
                  setAllBalance(!prev);
                  onChangeAllBanace(!prev);
                }
              }}
            >
              {balance
                ? balanceText
                  ? // TODO: Can use api in react-intl?
                    `${balanceText}: 
                        ${balance.dec.toString(balance.decimals)} ${
                      balance.denom
                    }`
                  : `Balance: ${balance.dec.toString(balance.decimals)} ${
                      balance.denom
                    }`
                : "?"}
            </div>
          ) : null}
        </Label>
      ) : null}
      <InputGroup
        id={inputId}
        className={classnames(
          style.formControlOverride,
          style.whiteBorder,
          error ? style.red : false,
          {
            disabled: allBalance
          }
        )}
      >
        <Input
          id={styleCoinInput.formControlOverride}
          className={classnames(
            "form-control-alternative",
            styleCoinInput.input,
            error ? style.red : false
          )}
          onChange={() => {
            clearError("amount");
          }}
          type="number"
          step={step}
          name={input.name}
          innerRef={input.ref as any}
          disabled={allBalance}
          autoComplete="off"
        />

        {getSelect()}
      </InputGroup>
      {error ? (
        <FormFeedback style={{ display: "block" }}>{error}</FormFeedback>
      ) : null}
    </FormGroup>
  );
};
