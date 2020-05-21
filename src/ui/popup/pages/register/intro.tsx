import React, { FunctionComponent, useEffect, useState } from "react";

import styleIntro from "./intro.module.scss";
import { FormattedMessage } from "react-intl";
import { setLightMode } from "../../light-mode";
import classnames from "classnames";

interface ButtonContent {
  title: string;
  content: string;
  onClick: () => void;
  errorMessage?: string;
}

export const IntroInPage: FunctionComponent<{
  topButton: ButtonContent;
  bottomButton: ButtonContent;
  middleButton?: ButtonContent;
}> = props => {
  useEffect(() => {
    // no light-mode from signup.
    setLightMode(false, true);
  }, []);

  const [middleButtonErrorMessage, setMiddleButtonErrorMessage] = useState("");

  useEffect(() => {
    if (
      props.middleButton &&
      props.middleButton.errorMessage !== middleButtonErrorMessage
    ) {
      setMiddleButtonErrorMessage(props.middleButton.errorMessage as string);
    }
  }, [props.middleButton]);

  return (
    <div>
      <BigButton
        green={true}
        icon="seed-icon"
        title={props.topButton.title}
        content={props.topButton.content}
        onClick={props.topButton.onClick}
      />
      {props.middleButton ? (
        <BigButton
          green={false}
          icon="nano-icon"
          title={props.middleButton.title}
          content={props.middleButton.content}
          onClick={props.middleButton.onClick}
          error={middleButtonErrorMessage}
        />
      ) : (
        ""
      )}
      <BigButton
        green={props.middleButton ? true : false}
        icon="file-icon"
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
  green: boolean;
  icon: string;
  title: string;
  content: string;
  onClick: () => void;
  error?: string;
}> = ({ icon, title, content, onClick, green, error }) => {
  /**
   * if error message cannot fit on a single line, then we have to increase spacing between buttons
   */
  const isMultilineErrorMessage = (): boolean => {
    const SINGLE_LINE_LENGTH: number = 60;
    return Boolean(error && error.length > SINGLE_LINE_LENGTH);
  };

  return (
    <>
      <div
        className={`${styleIntro.bigButton} ${green ? "green" : "blue"}`}
        onClick={onClick}
      >
        <span className={`icon is-medium ${styleIntro.icon}`}>
          <img src={require(`../../public/assets/${icon}.svg`)} />
        </span>
        <div className={styleIntro.description}>
          <div className={styleIntro.title}>{title}</div>
          <div className={styleIntro.content}>{content}</div>
        </div>
        <span className={`icon is-small ${styleIntro.arrow}`}>
          <i className="fas fa-angle-right" />
        </span>
      </div>
      <span
        className={classnames(
          styleIntro.error,
          isMultilineErrorMessage() ? styleIntro.multilineError : ""
        )}
      >
        {error ? error : ""}
      </span>
    </>
  );
};
