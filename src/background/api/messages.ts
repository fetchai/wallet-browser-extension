import { Message } from "../../common/message";
import { ROUTE } from "../api/constants";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { ChainIdCheckResponse } from "./handler";

export class GetBalanceMsg extends Message<{
  coins: Coin[];
}> {
  public bech32Address: string = "";
  public rest: string = "";

  public static type() {
    return "get-balance";
  }

  public static create(rest: string, bech32Address: string): GetBalanceMsg {
    const msg = new GetBalanceMsg();
    msg.rest = rest;
    msg.bech32Address = bech32Address;
    return msg;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {
    if (!this.rest) {
      throw new Error("rest not set");
    }

    if (!this.bech32Address) {
      throw new Error("bech32Address not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetBalanceMsg.type();
  }
}
export class GetChainIdAndCheckEndPointsAreOnlineMsg extends Message<
  ChainIdCheckResponse
> {
  public rpc: string = "";
  public rest: string = "";

  public static type() {
    return "get-chain-id";
  }

  public static create(
    rpc: string,
    rest: string
  ): GetChainIdAndCheckEndPointsAreOnlineMsg {
    const msg = new GetChainIdAndCheckEndPointsAreOnlineMsg();
    msg.rpc = rpc;
    msg.rest = rest;
    return msg;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {
    if (!this.rpc) {
      throw new Error("rpc url not set");
    }
    if (!this.rest) {
      throw new Error("rest url not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainIdAndCheckEndPointsAreOnlineMsg.type();
  }
}

export class QueryAccountMsg extends Message<{}> {
  public bech32Address: string = "";
  public rest: string = "";

  public static type() {
    return "get-account";
  }

  public static create(rest: string, bech32Address: string): QueryAccountMsg {
    const msg = new QueryAccountMsg();
    msg.rest = rest;
    msg.bech32Address = bech32Address;
    return msg;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {
    if (!this.rest) {
      throw new Error("rest url not set");
    }

    if (!this.bech32Address) {
      throw new Error("bech32Address not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QueryAccountMsg.type();
  }
}
