import React from "react";

import { ToolTip } from "../tooltip";
import { shortenAddress } from "../../../common/address";

export interface AddressProps {
  maxCharacters: number;
  children: string;
  tooltipFontSize?: string;
  tooltipAddress?: string;
  lineBreakBeforePrefix?: boolean;
  bech32Address: string;
}

export interface AddressState {
  copied: boolean;
  // intl: IntlShape;
}

export class Address extends React.Component<AddressProps, AddressState> {
  // private intl: IntlShape;

  constructor(props: any) {
    super(props);
    this.copy = this.copy.bind(this);
    this.toolTipText = this.toolTipText.bind(this);

    this.state = {
      copied: false
    };
  }

  copyRef = React.createRef<HTMLDivElement>();

  componentDidMount(): void {
    if (this.copyRef.current) {
      this.copyRef.current.addEventListener("copy", this.onCopy);
    }
  }

  componentWillUnmount(): void {
    if (this.copyRef.current) {
      this.copyRef.current.removeEventListener("copy", this.onCopy);
    }
  }

  toolTipText(lineBreakBeforePrefix: any, tooltipAddress: any): JSX.Element {
    if (this.state.copied) {
      return <div key={1}>Copied!</div>;
    } else if (lineBreakBeforePrefix && tooltipAddress.length > 0) {
      return tooltipAddress.split("1").map((item, i) => {
        if (i === 0) {
          return <div key={i}>{item + "1"}</div>;
        }
        return <div key={i}>{item}</div>;
      });
    } else {
      return tooltipAddress;
    }
  }

  async copy(): Promise<void> {
    this.setState({ copied: true });
    await navigator.clipboard.writeText(this.props.bech32Address);
  }

  render() {
    const { tooltipFontSize, lineBreakBeforePrefix, children } = this.props;

    const tooltipAddress = this.props.tooltipAddress
      ? this.props.tooltipAddress
      : children;

    return (
      <div onClick={this.copy}>
        <ToolTip
          trigger="hover"
          options={{ placement: "bottom" }}
          tooltip={
            <div
              ref={this.copyRef}
              className="address-tooltip"
              style={{ fontSize: tooltipFontSize }}
            >
              {this.toolTipText(lineBreakBeforePrefix, tooltipAddress)}
            </div>
          }
        >
          {shortenAddress(children, this.props.maxCharacters)}
        </ToolTip>
      </div>
    );
  }

  onCopy = async (e: ClipboardEvent) => {
    if (e.clipboardData) {
      // Remove line breaks.
      const pre = await navigator.clipboard.readText();
      await navigator.clipboard.writeText(pre.replace(/(\r\n|\n|\r)/gm, ""));
      this.setState({ copied: true });
    }
  };
}
