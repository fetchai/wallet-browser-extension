import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";

import { AppIntlProvider } from "./language";

import "./styles/global.scss";

import { HashRouter, Route, RouteComponentProps } from "react-router-dom";

import { RegisterPage } from "./pages/register";
import { MainPage } from "./pages/main";
import { LockPage } from "./pages/lock";
import { SendPage } from "./pages/send";

import { Banner } from "./components/banner";

import {
  NotificationProvider,
  NotificationStoreProvider
} from "../components/notification";

import { configure } from "mobx";
import { observer } from "mobx-react";

import { StoreProvider, useStore } from "./stores";
import { KeyRingStatus } from "./stores/keyring";
import { SignPage } from "./pages/sign";
import { FeePage } from "./pages/fee";
import Modal from "react-modal";

// Make sure that icon file will be included in bundle
require("./public/assets/fetch-logo.png");
require("./public/assets/favicon-16x16.png");
require("./public/assets/favicon-32x32.png");
require("./public/assets/favicon-96x96.png");

configure({
  enforceActions: "always" // Make mobx to strict mode.
});

Modal.setAppElement("#app");
Modal.defaultStyles = {
  content: {
    ...Modal.defaultStyles.content,
    minWidth: "300px",
    maxWidth: "600px",
    minHeight: "250px",
    maxHeight: "500px",
    left: "50%",
    right: "auto",
    top: "50%",
    bottom: "auto",
    transform: "translate(-50%, -50%)"
  },
  overlay: {
    zIndex: 1000,
    position: "fixed",
    top: "0px",
    left: "0px",
    right: "0px",
    bottom: "0px"
  }
};

const StateRenderer: FunctionComponent<RouteComponentProps> = observer(
  ({ location }) => {
    const { keyRingStore } = useStore();

    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      return <MainPage />;
    } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
      return <LockPage location={location} />;
    } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
      browser.tabs.create({
        url: "/popup.html#/register"
      });
      window.close();
      return (
        <div style={{ height: "100%" }}>
          <Banner
            icon={require("./public/assets/temp-icon.svg")}
            logo={require("./public/assets/fetch-logo.png")}
            subtitle="Wallet for the Interchain"
          />
        </div>
      );
    } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
      return (
        <div style={{ height: "100%" }}>
          <Banner
            icon={require("./public/assets/temp-icon.svg")}
            logo={require("./public/assets/fetch-logo.png")}
            subtitle="Wallet for the Interchain"
          />
        </div>
      );
    } else {
      return <div>Unknown status</div>;
    }
  }
);

ReactDOM.render(
  <AppIntlProvider>
    <StoreProvider>
      <NotificationStoreProvider>
        <NotificationProvider>
          <HashRouter>
            <Route exact path="/" component={StateRenderer} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/send" component={SendPage} />
            <Route exact path="/fee/:id" component={FeePage} />
            <Route path="/sign/:id" component={SignPage} />
          </HashRouter>
        </NotificationProvider>
      </NotificationStoreProvider>
    </StoreProvider>
  </AppIntlProvider>,
  document.getElementById("app")
);
