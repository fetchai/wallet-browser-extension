import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useState
} from "react";

import style from "./form.module.scss";
import styleFeeButtons from "./fee-buttons.module.scss";
import { Currency } from "../../../chain-info";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { CoinUtils } from "../../../common/coin-utils";
import { useFormContext } from "react-hook-form";
import { DecUtils } from "../../../common/dec-utils";
import {
  Button,
  ButtonGroup,
  FormFeedback,
  FormGroup,
  Label
} from "reactstrap";

import classnames from "classnames";

export type GasPriceStep = {
  low: Dec;
  average: Dec;
  high: Dec;
};

export const DefaultGasPriceStep: GasPriceStep = {
  low: new Dec("0.01"),
  average: new Dec("0.025"),
  high: new Dec("0.04")
};

export interface FeeButtonsProps {
  className?: string;
  label?: string;
  feeSelectLabels?: {
    low: string;
    average: string;
    high: string;
  };
  error?: string;

  // TODO: handle muliple fees.
  currency: Currency;
  price: Dec;
  gas: number;
  gasPriceStep: GasPriceStep;
  coinDenom: string;
  coinMinimalDenom: string;
  name: string;
}

enum FeeSelect {
  LOW,
  AVERAGE,
  HIGH
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = ({
  label,
  feeSelectLabels = { low: "Low", average: "Average", high: "High" },
  error,
  gas,
  gasPriceStep,
  name,
  coinDenom,
  coinMinimalDenom
}) => {
  const { setValue } = useFormContext();

  const [feeSelect, setFeeSelect] = useState(FeeSelect.AVERAGE);
  const [feeLow, setFeeLow] = useState<Coin | undefined>();
  const [feeAverage, setFeeAverage] = useState<Coin | undefined>();
  const [feeHigh, setFeeHigh] = useState<Coin | undefined>();

  useEffect(() => {
    const feeLow = new Coin(
      coinMinimalDenom,
      gasPriceStep.low.mul(new Dec(gas.toString())).truncate()
    );
    setFeeLow(feeLow);

    const feeAverage = new Coin(
      coinMinimalDenom,
      gasPriceStep.average.mul(new Dec(gas.toString())).truncate()
    );
    setFeeAverage(feeAverage);

    const feeHigh = new Coin(
      coinMinimalDenom,
      gasPriceStep.high.mul(new Dec(gas.toString())).truncate()
    );
    setFeeHigh(feeHigh);
  }, [
    coinMinimalDenom,
    gas,
    gasPriceStep.average,
    gasPriceStep.high,
    gasPriceStep.low
  ]);

  useEffect(() => {
    if (feeSelect === FeeSelect.LOW) {
      setValue(name, feeLow);
    } else if (feeSelect === FeeSelect.AVERAGE) {
      setValue(name, feeAverage);
    } else if (feeSelect === FeeSelect.HIGH) {
      setValue(name, feeHigh);
    } else {
      throw new Error("Invalid fee select");
    }
  }, [feeAverage, feeHigh, feeLow, feeSelect, name, setValue]);

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <FormGroup>
      {label ? (
        <Label for={inputId} className={style.formControlLabel}>
          {label}
        </Label>
      ) : null}
      <ButtonGroup id={inputId} className={styleFeeButtons.buttons}>
        <Button
          type="button"
          id={feeSelect === FeeSelect.LOW ? "green-solid" : ""}
          className={styleFeeButtons.button}
          onClick={useCallback((e: MouseEvent) => {
            setFeeSelect(FeeSelect.LOW);
            e.preventDefault();
          }, [])}
        >
          <div className={styleFeeButtons.title}>{feeSelectLabels.low}</div>
          <div
            className={classnames(styleFeeButtons.fiat, {
              "text-muted": feeSelect !== FeeSelect.LOW
            })}
          ></div>
          <div
            className={classnames(styleFeeButtons.coin, {
              "text-muted": feeSelect !== FeeSelect.LOW
            })}
          >
            {feeLow
              ? `${DecUtils.removeTrailingZerosFromDecStr(
                  CoinUtils.parseDecAndDenomFromCoin(feeLow).amount
                )}${coinDenom}`
              : "loading"}
          </div>
        </Button>
        <Button
          type="button"
          id={feeSelect === FeeSelect.AVERAGE ? "green-solid" : ""}
          className={styleFeeButtons.button}
          color={feeSelect === FeeSelect.AVERAGE ? "primary" : undefined}
          onClick={useCallback((e: MouseEvent) => {
            setFeeSelect(FeeSelect.AVERAGE);
            e.preventDefault();
          }, [])}
        >
          <div className={styleFeeButtons.title}>{feeSelectLabels.average}</div>
          <div
            className={classnames(styleFeeButtons.fiat, {
              "text-muted": feeSelect !== FeeSelect.AVERAGE
            })}
          ></div>
          <div
            className={classnames(styleFeeButtons.coin, {
              "text-muted": feeSelect !== FeeSelect.AVERAGE
            })}
          >
            {feeAverage
              ? `${DecUtils.removeTrailingZerosFromDecStr(
                  CoinUtils.parseDecAndDenomFromCoin(feeAverage).amount
                )}${coinDenom}`
              : "loading"}
          </div>
        </Button>
        <Button
          type="button"
          className={styleFeeButtons.button}
          id={feeSelect === FeeSelect.HIGH ? "green-solid" : ""}
          onClick={useCallback((e: MouseEvent) => {
            setFeeSelect(FeeSelect.HIGH);
            e.preventDefault();
          }, [])}
        >
          <div className={styleFeeButtons.title}>{feeSelectLabels.high}</div>
          <div
            className={classnames(styleFeeButtons.fiat, {
              "text-muted": feeSelect !== FeeSelect.HIGH
            })}
          ></div>
          <div
            className={classnames(styleFeeButtons.coin, {
              "text-muted": feeSelect !== FeeSelect.HIGH
            })}
          >
            {feeHigh
              ? `${DecUtils.removeTrailingZerosFromDecStr(
                  CoinUtils.parseDecAndDenomFromCoin(feeHigh).amount
                )}${coinDenom}`
              : "loading"}
          </div>
        </Button>
      </ButtonGroup>
      {error ? (
        <FormFeedback style={{ display: "block" }}>{error}</FormFeedback>
      ) : null}
    </FormGroup>
  );
};
