import React, { FunctionComponent } from "react";

import classmames from "classnames";
import style from "./style.module.scss";

interface Props {
  logo: string;
  subtitle: string;
}

export const Banner: FunctionComponent<Props> = ({ logo, subtitle }) => {
  return (
    <div className={classmames(style.container, style.flexVertical)}>
      <video
        className={style.video}
        autoPlay={true}
        muted={true}
        loop={true}
      >
        <source
          src={chrome.runtime.getURL("/assets/" + "welcome.mp4")}
          type={"video/mp4"}
        ></source>
      </video>
      <div className={style.empty} />
      <div className={style.flexHorizontal}>
        <div className={style.empty} />
        <div className={style.flexVertical}>
          <img className={style.logo} src={logo} />
          <div className={style.subtitle}>{subtitle}</div>
        </div>
        <div className={style.empty} />
      </div>
      <div className={style.empty} />
    </div>
  );
};
