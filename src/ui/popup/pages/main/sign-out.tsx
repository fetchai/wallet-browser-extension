import React, { FunctionComponent } from "react";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { useHistory } from "react-router";
import classnames from "classnames";
import signOutStyle from "./sign-out.module.scss";

export const SignOutButton: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const history = useHistory();

  return (
    <div className={signOutStyle.wrapper}>
      <i
        id="btn-sign-out"
        className={classnames("fas", "fa-sign-out-alt", signOutStyle.icon)}
        onClick={() => {
          keyRingStore.lock();
          history.goBack();
        }}
      />
    </div>
  );
});
