import { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react";

import ReactGA from "react-ga";
import { GOOGLE_ANALYTICS_ID } from "../../../config";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

interface AnalyticsProps extends RouteComponentProps {
  children: any;
}

/**
 * Google analytics
 */

const Analytics: FunctionComponent<AnalyticsProps> = observer(
  ({ history, children }) => {

    history.listen((location: { pathname: string }) => {
      debugger;
      ReactGA.set({ page: location.pathname });
      ReactGA.pageview(location.pathname);
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

    ReactGA.initialize(GOOGLE_ANALYTICS_ID);

    return React.Children.only(children);
  }
);

export default withRouter(Analytics);
