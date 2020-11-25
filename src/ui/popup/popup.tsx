import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";

import { AppIntlProvider } from "./language";

import "./styles/global.scss";
import "../popup/pages/settings/style.module.scss";

import {HashRouter, Route, RouteComponentProps, useHistory} from "react-router-dom";
import { AddAddressWizard, RegisterState } from "./pages/register";
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
import { useIntl } from "react-intl";
import { StoreProvider, useStore } from "./stores";
import { KeyRingStatus } from "./stores/keyring";
import { SignPage } from "./pages/sign";
import { FeePage } from "./pages/fee";
import Modal from "react-modal";
import { SettingsPage } from "./pages/settings";
import { AddressBookManagerPage } from "./pages/address-book-manager";
import { DeleteAddress } from "./pages/delete-address";
import { LightMode } from "../components/light-mode/light-mode";


// Initialize Firebase
import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";

import { FIREBASECONFIG } from "../../config";
import {Lock} from "../components/lock/lock";



firebase.initializeApp(FIREBASECONFIG);
firebase.analytics();

// Make sure that icon file will be included in bundle
require("./public/assets/fetch-logo.svg");
require("./public/assets/fetch-circular-icon.svg");
require("./public/assets/favicon-16x16.png");
require("./public/assets/favicon-32x32.png");
require("./public/assets/favicon-96x96.png");

require("./public/assets/file-icon.svg");
require("./public/assets/nano-icon.svg");
require("./public/assets/seed-icon.svg");

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
    const intl = useIntl();
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
            logo={require("./public/assets/fetch-logo.svg")}
            subtitle={intl.formatMessage({
              id: "strap-line"
            })}
          />
        </div>
      );
    } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
      return (
        <div style={{ height: "100%" }}>
          <Banner
            logo={require("./public/assets/fetch-logo.svg")}
            subtitle={intl.formatMessage({
              id: "strap-line"
            })}
          />
        </div>
      );
    } else {
      return <div>Unknown status</div>;
    }
  }
);

ReactDOM.render(
  <LightMode>
    <AppIntlProvider>
      <StoreProvider>
        <NotificationStoreProvider>
          <NotificationProvider>
            <HashRouter>
                        <Lock></Lock>
              <Route exact path="/" component={StateRenderer} />
              <Route
                exact
                path="/register"
                render={() => <AddAddressWizard isRegistering={true} />}
              />
              <Route
                exact
                path="/add-account/create"
                render={() => (
                  <AddAddressWizard
                    isRegistering={false}
                    initialRegisterState={RegisterState.REGISTER}
                  />
                )}
              />
              <Route
                exact
                path="/add-account/import"
                render={() => (
                  <AddAddressWizard
                    isRegistering={false}
                    initialRegisterState={RegisterState.RECOVERY_CHOICE}
                  />
                )}
              />
              <Route exact path="/send" component={SendPage} />
              <Route exact path="/settings" component={SettingsPage} />
              <Route
                exact
                path="/address-book-manager"
                component={AddressBookManagerPage}
              />
              <Route
                exact
                path="/address-delete"
                render={() => {
                  const params = new URLSearchParams(
                    window.location.hash.split("?")[1]
                  );
                  const address = params.get("address");
                  const accountNumber = params.get("accountNumber");
                  return (
                    <DeleteAddress
                      addressToDelete={address as string}
                      accountNumberOfAddressToDelete={accountNumber as string}
                      history={history}
                    />
                  );
                }}
              />
              <Route
                exact
                path="/lock"
                render={() => {
                console.log("in the lock page")
                return <LockPage location={location} />;
                }}
              />
              <Route exact path="/fee/:id" component={FeePage} />
              <Route path="/sign/:id" component={SignPage} />
            </HashRouter>
          </NotificationProvider>
        </NotificationStoreProvider>
      </StoreProvider>
    </AppIntlProvider>
  </LightMode>,
  document.getElementById("app")
);
