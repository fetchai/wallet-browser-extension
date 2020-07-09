import { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react";

// import ReactGA from "react-ga";
import { FIREBASECONFIG } from "../../../config";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

import * as firebase from "firebase/app";
interface AnalyticsProps extends RouteComponentProps {
  children: any;
}

/**
 * Google analytics
 */

const Analytics: FunctionComponent<AnalyticsProps> = observer(
  ({ history, children }) => {
    firebase.initializeApp(FIREBASECONFIG);
    const analytics = firebase.analytics();

    const logCurrentPage = (pathname: string) => {
      analytics().setCurrentScreen(pathname);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      analytics().logEvent("screen_view");
    };

    history.listen((location: { pathname: string }) => {
      logCurrentPage(location.pathname);
    });

    //on mount
    useEffect(() => {
      // record the first page load
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      if (typeof window.initialLoad === "undefined") {
        ReactGA.pageview(location.pathname);
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        window["initialLoad"] = true;
      }
    }, []);

    return React.Children.only(children);
  }
);

export default withRouter(Analytics);
