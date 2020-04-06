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
      password: ""
    }
  });

  const { keyRingStore } = useStore();
  const [loading, setLoading] = useState(false);

  return (
    <EmptyLayout style={{ height: "100%", padding: "0" }}>
      <video
        className={style.video}
        playsinline={true}
        autoPlay={true}
        muted={true}
        loop={true}
      >
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
          try {
            await keyRingStore.unlock(data.password);
            if (external) {
              window.close();
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "password",
              "invalid",
              intl.formatMessage({
                id: "lock.input.password.error.invalid"
              })
            );
            setLoading(false);
          }
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
