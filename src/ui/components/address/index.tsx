import React from "react";

import { ToolTip } from "../tooltip";
import { shortenAddress } from "../../../common/address";

export interface AddressProps {
  maxCharacters: number;
  children: string;
  dotNumber?: number;
  tooltipFontSize?: string;
  tooltipAddress?: string;
  bech32Address: string;
}

export interface AddressState {
  copied: boolean;
}

export class Address extends React.Component<AddressProps, AddressState> {
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

  toolTipText(tooltipAddress: string): JSX.Element | string {
    if (this.state.copied) {
      return <div key={1}>Copied!</div>;
    }

    return tooltipAddress;
  }

  async copy(): Promise<void> {
    this.setState({ copied: true });
    await navigator.clipboard.writeText(this.props.bech32Address);
  }

  render() {
    const { tooltipFontSize, children } = this.props;

    const tooltipAddress = this.props.tooltipAddress
      ? this.props.tooltipAddress
      : children;

    const dotNumber = this.props.dotNumber ? this.props.dotNumber : null;
    return (
      <div onClick={this.copy}>
        <ToolTip
          trigger="hover"
          options={{ placement: "bottom" }}
          tooltip={
            <div
              ref={this.copyRef}
              className={"tool-tip"}
              style={{ fontSize: tooltipFontSize }}
            >
              {this.toolTipText(tooltipAddress)}
            </div>
          }
        >
          {shortenAddress(children, this.props.maxCharacters, dotNumber)}
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
