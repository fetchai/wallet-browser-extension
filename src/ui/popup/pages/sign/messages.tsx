import React from "react";
import { shortenAddress } from "../../../../common/address";
import { CoinUtils } from "../../../../common/coin-utils";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { IntlShape, FormattedMessage } from "react-intl";

export interface MessageObj {
  type: string;
  value: unknown;
}

interface MsgGeneric {
  type: string
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
): undefined | {
  icon: string | undefined;
  title: string;
  content: React.ReactElement;
} {
  if (MessageType<MsgSend>(msg, "cosmos-sdk/MsgSend")) {
    const receives: { amount: string; denom: string }[] = [];
    for (const coinPrimitive of msg.value.amount) {
      const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
      const parsed = CoinUtils.parseDecAndDenomFromCoin(coin);

      receives.push({
        amount: clearDecimals(parsed.amount),
        denom: parsed.denom
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
      const parsed = CoinUtils.parseDecAndDenomFromCoin(coin);

      receives.push({
        amount: clearDecimals(parsed.amount),
        denom: parsed.denom
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
          values={{
            recipient
            currency: shortenAddress(msg.value.denom, 24),
            amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
          }}
        />
      )
    };
  }

  // we only display for the lock, and don't display for the burn since Peggy requires two messages in the transaction, but showing two messages in the
  // wallet would be bad UI.
  if(MessageType<MsgBurn>(msg, "cosmos-sdk/MsgBurn")){
    return undefined
  }

  if (MessageType<MsgDelegate>(msg, "cosmos-sdk/MsgDelegate")) {
    const parsed = CoinUtils.parseDecAndDenomFromCoin(
      new Coin(msg.value.amount.denom, msg.value.amount.amount)
    );

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
            amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
          }}
        />
      )
    };
  }

  if (MessageType<MsgUndelegate>(msg, "cosmos-sdk/MsgUndelegate")) {
    const parsed = CoinUtils.parseDecAndDenomFromCoin(
      new Coin(msg.value.amount.denom, msg.value.amount.amount)
    );

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
            amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
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
