import React, { FunctionComponent, useEffect, useState } from "react";
import { Input } from "../../../components/form";
import { Button, Form } from "reactstrap";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import useForm from "react-hook-form";
import { EmptyLayout } from "../../layouts/empty-layout";
import style from "./style.module.scss";
import queryString from "query-string";
import { RouteComponentProps } from "react-router";

require("../../public/assets/welcome.mp4");

import { FormattedMessage, useIntl } from "react-intl";
import {
  disableScroll,
  enableScroll,
  fitWindow
} from "../../../../common/window";
import classnames from "classnames";
import { lightModeEnabled, setLightMode } from "../../light-mode";
import { KeyRingStatus } from "../../stores/keyring";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent<Pick<
  RouteComponentProps,
  "location"
>> = observer(({ location }) => {
  const intl = useIntl();
  const query = queryString.parse(location.search);
  const external = query.external ?? false;

  // ignore light-mode when lock page mounted.
  useEffect(() => {
    setLightMode(false, false);
  }, []);

  // reset light mode from storage when lock page unmounted
  useEffect(
    () => () => {
      const revertLightMode = async () => {
        const enabled = await lightModeEnabled();
        await setLightMode(enabled, false);
      };
      revertLightMode();
    },
    []
  );

  useEffect(() => {
    if (external) {
      fitWindow();
      disableScroll();
    } else {
      enableScroll();
    }
  }, [external]);

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "Password!12345"
    }
  });

  const { keyRingStore } = useStore();
  const [loading, setLoading] = useState(false);

  return (
    <EmptyLayout style={{ height: "100%", padding: "0" }}>
      <video className={style.video} autoPlay={true} muted={true} loop={true}>
        <source
          src={chrome.runtime.getURL("/assets/" + "welcome.mp4")}
          type={"video/mp4"}
        ></source>
      </video>
      <div className={style.logo}>
        <img
          src={require("../../public/assets/fetch-logo.svg")}
          alt="Fetch.ai's Logo"
          className="logo"
        ></img>
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async data => {
          setLoading(true);
          let status;
          try {
            // status = await keyRingStore.unlock(data.password);
            const passwordForDevelopmentOnly = "Password!12345";
            status = await keyRingStore.unlock(passwordForDevelopmentOnly);
            if (external) {
              window.close();
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
          }

          if (status === KeyRingStatus.LOCKED) {
            setError(
              "password",
              "invalid",
              intl.formatMessage({
                id: "lock.input.password.error.invalid"
              })
            );
          }

          setLoading(false);
        })}
      >
        <Input
          className={classnames(style.formControlOverride, "lock-border")}
          type="password"
          label={intl.formatMessage({
            id: "lock.input.password"
          })}
          name="password"
          error={errors.password && errors.password.message}
          ref={register({
            required: intl.formatMessage({
              id: "lock.input.password.error.required"
            })
          })}
        />
        <Button
          type="submit"
          id="green-no-opacity"
          className={style.buttonUnderlay}
          data-loading={loading}
        >
          <FormattedMessage id="lock.button.unlock" />
        </Button>
      </Form>
    </EmptyLayout>
  );
});
