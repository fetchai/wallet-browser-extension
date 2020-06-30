import React, { FunctionComponent } from "react";

import styleWelcome from "./welcome.module.scss";
import { Button } from "reactstrap";

import { useIntl } from "react-intl";

/**
 * This page is the smae as the welcome in page other than it is to signal success with addition of address to existing account just with different messages.
 *
 * @constructor
 */
export const SuccessPage: FunctionComponent = () => {
  const intl = useIntl();

  return (
    <div style={{ paddingTop: "60px" }}>
      <div className={styleWelcome.title}>
        {intl.formatMessage({
          id: "register.success.title"
        })}
      </div>
      <div className={styleWelcome.content}>
        {intl.formatMessage({
          id: "register.success.content"
        })}
      </div>
      <Button
        id="green"
        type="submit"
        onClick={() => {
          if (typeof browser !== "undefined") {
            browser.tabs.getCurrent().then(tab => {
              if (tab.id) {
                browser.tabs.remove(tab.id);
              } else {
                window.close();
              }
            });
          } else {
            window.close();
          }
        }}
        block
        style={{
          marginTop: "60px"
        }}
      >
        {intl.formatMessage({
          id: "register.success.button.done"
        })}
      </Button>
    </div>
  );
};
