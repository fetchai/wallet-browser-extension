import React from "react";
import { shortenAddress } from "../../../../common/address";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import removeTrailingZeros from "remove-trailing-zeros";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { IntlShape, FormattedMessage } from "react-intl";
import {
  getCurrencyFromMinimalDenom,
  isMinimalDenom
} from "../../../../common/currency";
import { Currency } from "../../../../chain-info";
import { divideByDecimals } from "../../../../common/utils/divide-decimals";

export interface MessageObj {
  type: string;
  value: unknown;
}

interface MsgGeneric {
  type: string;
  value: {
    amount: [
      {
        amount: string;
        denom: string;
      }
    ];
    from_address: string;
    to_address: string;
  };
}

interface MsgSend extends MsgGeneric {
  type: "cosmos-sdk/MsgSend";
}

interface MsgLock extends MsgGeneric {
  type: "cosmos-sdk/MsgLock";
}

interface MsgBurn extends MsgGeneric {
  type: "cosmos-sdk/MsgBurn";
}

interface MsgDelegate {
  type: "cosmos-sdk/MsgDelegate";
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

interface MsgUndelegate {
  type: "cosmos-sdk/MsgUndelegate";
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

interface MsgWithdrawDelegatorReward {
  type: "cosmos-sdk/MsgWithdrawDelegationReward";
  value: {
    delegator_address: string;
    validator_address: string;
  };
}

type Messages =
  | MsgSend
  | MsgLock
  | MsgBurn
  | MsgDelegate
  | MsgUndelegate
  | MsgWithdrawDelegatorReward;

// Type guard for messages.
function MessageType<T extends Messages>(
  msg: MessageObj,
  type: T["type"]
): msg is T {
  return msg.type === type;
}

/* eslint-disable react/display-name */
export function renderMessage(
  msg: MessageObj,
  intl: IntlShape
): { icon: string | undefined; title: string; content: any } | undefined {
  if (MessageType<MsgSend>(msg, "cosmos-sdk/MsgSend")) {
    const receives: { amount: string; denom: string }[] = [];
    for (const coinPrimitive of msg.value.amount) {
      let amount = coinPrimitive.amount;
      let denom = coinPrimitive.denom;
      // if it is minimal denom lets convert to regular denom to show user

      if (isMinimalDenom(denom)) {
        const currency = getCurrencyFromMinimalDenom(denom) as Currency;
        denom = currency.coinDenom;
        amount = divideByDecimals(amount.toString(), currency.coinDecimals);
      }

      receives.push({
        amount: removeTrailingZeros(amount),
        denom: denom
      });
    }
    return {
      icon: "fas fa-paper-plane",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgSend.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgSend.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            recipient: shortenAddress(msg.value.to_address, 20),
            amount: receives
              .map(coin => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(",")
          }}
        />
      )
    };
  }

  // This page has the display of the messages in the signing tab. Since an ethereum message is comprised of two messages a lock and a burn but a UI showing
  // that two messages are being sent would be poor we only show a message for the lock message associated with a peggy transaction, and show no output for the burn message
  if (MessageType<MsgLock>(msg, "cosmos-sdk/MsgLock")) {
    const receives: { amount: string; denom: string }[] = [];
    for (const coinPrimitive of msg.value.amount) {
      const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);

      receives.push({
        amount: coin.amount.toString(),
        denom: coin.denom
      });
    }

    return {
      icon: "fas fa-paper-plane",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgLock.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgLock.content"
          // assumption that all
          values={{
            recipient: shortenAddress(msg.value.to_address, 24),
            currency: receives[0].denom,
            amount: receives
              .map(coin => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(",")
          }}
        />
      )
    };
  }

  // we only display for the lock, and don't display for the burn since Peggy requires two messages in the transaction, but showing two messages in the
  // wallet would be bad UI.
  if (MessageType<MsgBurn>(msg, "cosmos-sdk/MsgBurn")) {
    return undefined;
  }

  if (MessageType<MsgDelegate>(msg, "cosmos-sdk/MsgDelegate")) {
    return {
      icon: "fas fa-layer-group",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgDelegate.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgDelegate.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            validator: shortenAddress(msg.value.validator_address, 24),
            amount: `${clearDecimals(msg.value.amount.amount)} ${
              msg.value.amount.denom
            }`
          }}
        />
      )
    };
  }

  if (MessageType<MsgUndelegate>(msg, "cosmos-sdk/MsgUndelegate")) {
    return {
      icon: "fas fa-layer-group",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgUndelegate.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgUndelegate.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            validator: shortenAddress(msg.value.validator_address, 24),
            amount: `${clearDecimals(msg.value.amount.amount)} ${
              msg.value.amount.denom
            }`
          }}
        />
      )
    };
  }

  if (
    MessageType<MsgWithdrawDelegatorReward>(
      msg,
      "cosmos-sdk/MsgWithdrawDelegationReward"
    )
  ) {
    return {
      icon: "fas fa-money-bill",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgWithdrawDelegatorReward.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgWithdrawDelegatorReward.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            validator: shortenAddress(msg.value.validator_address, 34)
          }}
        />
      )
    };
  }

  return {
    icon: undefined,
    title: "Unknown",
    content: <b>Check data tab</b>
  };
}
/* eslint-enable react/display-name */

function clearDecimals(dec: string): string {
  for (let i = dec.length - 1; i >= 0; i--) {
    if (dec[i] === "0") {
      dec = dec.slice(0, dec.length - 1);
    } else {
      break;
    }
  }
  if (dec.length > 0 && dec[dec.length - 1] === ".") {
    dec = dec.slice(0, dec.length - 1);
  }

  return dec;
}
