import React, { Component, CSSProperties } from "react";
import style from "./style.module.scss";
import classnames from "classnames";

export interface BackButtonProps {
  onClick: () => void;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
}

export class BackButton extends Component<BackButtonProps> {
  render() {
    return (
      <div
        className={classnames(
          style["menu-img"],
          this.props.className ? this.props.className : false
        )}
        onClick={this.props.onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          style={this.props.style ? this.props.style : undefined}
        >
          <path
            fill="transparent"
            strokeWidth={this.props.stroke ? this.props.stroke : 2}
            stroke="hsl(0, 0%, 100%)"
            strokeLinecap="round"
            d="M 6.5 10 L 13.5 3.5 M 6.5 10 L 13.5 16.5"
          />
        </svg>
      </div>
    );
  }
}
