import React, { FunctionComponent, useEffect, useState } from "react";

import styleIntro from "./intro.module.scss";
import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import { setLightMode } from "../../light-mode";

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
        icon="fa-plus"
        title={props.topButton.title}
        content={props.topButton.content}
        onClick={props.topButton.onClick}
      />
      {props.middleButton ? (
        <BigButton
          green={true}
          icon="fa-plus"
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
  green: boolean;
  icon: string;
  title: string;
  content: string;
  onClick: () => void;
  error?: string;
}> = ({ icon, title, content, onClick, green, error }) => {
  const intl = useIntl();

  return (
    <>
      <div
        className={`${styleIntro.bigButton} ${green ? "green" : "blue"}`}
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
      <span className={styleIntro.error}>
        {error
          ? intl.formatMessage({
              id: "register.intro.button.import-hardware.error.no-cosmos-app"
            })
          : ""}
      </span>
    </>
  );
};
