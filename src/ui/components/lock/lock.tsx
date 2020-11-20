/**
 * Looks for all clicks
 *
 */
export const LOCKUP_PERIOD  = "lockup-period";
import React from "react";
import classnames from "classnames";


type State = {
  lightMode?: boolean;
  store: BrowserKVStore;
};

type Props = {};

class Lock extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      store: store
    };
  }

  componentWillUnmount(){

  }


  render() {
    return (

      <div
        className={classnames(this.state.lightMode ? "light-mode" : "")}
        id="light"
      ></div>
        {this.props.children}

    );
  }
}

export { setLockTimeOutPeriod  };
