import { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react";
// import ReactGA from "react-ga";
import { FIREBASECONFIG } from "../../../config";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

// Initialize Firebase
import * as firebase from "firebase/app";
firebase.initializeApp(FIREBASECONFIG);
firebase.analytics();
const analytics = firebase.analytics();

interface AnalyticsProps extends RouteComponentProps {
  children: any;
}

/**
 *
 * Google analytics
 */
const Analytics: FunctionComponent<AnalyticsProps> = observer(
  ({ history, children }) => {

    history.listen((location: { pathname: string }) => {
      analytics.setCurrentScreen(location.pathname);
    });

    //on mount
    useEffect(() => {
      if (typeof window.initialLoad === "undefined") {
        window["initialLoad"] = true;
      }
    }, []);

    return <>{children}</>;
  }
);

function buttonClick(){
          analytics.logEvent("Button_Pressed", parameters: [
  "screenName": "Log-in Screen",
  "event": "Log-in Button Pressed",
  "category": "Interaction"
  ])
}

export default withRouter(Analytics);
