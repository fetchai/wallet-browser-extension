import React, { FunctionComponent } from "react";

import styleIntro from "./intro.module.scss";

import { FormattedMessage, useIntl } from "react-intl";

interface ButtonContent {
  title: string;
  content: string;
  onClick: () => void;
}

export const IntroInPage: FunctionComponent<{
  topButton: ButtonContent;
  bottomButton: ButtonContent;
}> = props => {

  return (
    <div>
      <BigButton
        top={true}
        icon="fa-plus"
        title={props.topButton.title}
        content={props.topButton.content}
        onClick={props.topButton.onClick}
      />
      <BigButton
        top={false}
        icon="fa-download"
        title={props.bottomButton.title}
        content={props.bottomButton.content}
        onClick={props.bottomButton.onClick}
      />
      <div className={styleIntro.subContent}>
        <FormattedMessage
          id="register.intro.sub-content"
          values={{
            br: <br />
          }}
        />
      </div>
    </div>
  );
};

const BigButton: FunctionComponent<{
  top: boolean;
  icon: string;
  title: string;
  content: string;
  onClick: () => void;
}> = ({ icon, title, content, onClick, top }) => {
  return (
    <div
      className={`${styleIntro.bigButton} ${top ? "green" : "blue"}`}
      onClick={onClick}
    >
      <span className={`icon is-medium ${styleIntro.icon}`}>
        <i className={`fas fa-2x ${icon}`} />
      </span>
      <div className={styleIntro.description}>
        <div className={styleIntro.title}>{title}</div>
        <div className={styleIntro.content}>{content}</div>
      </div>
      <span className={`icon is-small ${styleIntro.arrow}`}>
        <i className="fas fa-angle-right" />
      </span>
    </div>
  );
};
