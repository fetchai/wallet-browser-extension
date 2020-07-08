/**
 * Default styles are dark mode, we add toggle to light mode hence light mode
 *
 */
import { BrowserKVStore } from "../../../common/kvstore";

const CLASS_NAME = "light-mode";
export const STORAGE_KEY = "light-mode";
import React from "react";
import classnames from "classnames";

type State = {
  lightMode?: boolean;
  store: BrowserKVStore;
};

type Props = {};

class LightMode extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    const store = new BrowserKVStore("");

    this.state = {
      store: store
    };
  }

  /**
   * Are we in currently in the default popup or not
   */
  amIInPopUp() {
    // we look at the urls of theregister oor add account since they are currently the only things not done in the default popup
    return (
      !window.location.href.includes("add-account") &&
      !window.location.href.includes("register")
    );
  }

  async componentDidMount(): Promise<void> {
    // set light mode status from local storage
    const result = await this.state.store.get(STORAGE_KEY);

    // check the mode from storage
    let mode = typeof result !== "undefined" ? (result as boolean) : false;

    if (!this.amIInPopUp()) {
      // for signup flow we currently don't allow
      mode = false;
    }
    this.setState({
      lightMode: mode
    });
    setBackgroundImage(mode, this.amIInPopUp());
  }

  render() {
    return (
      <div
        className={classnames(this.state.lightMode ? "light-mode" : "")}
        id="light"
      >
        {this.props.children}
      </div>
    );
  }
}

const setBackgroundImage = (light: boolean, inPopUp: boolean) => {
  if (light) {
    document
      .getElementsByTagName("HTML")[0]
      .setAttribute("style", "background-image: none");
  } else {
    document
      .getElementsByTagName("HTML")[0]
      .setAttribute(
        "style",
        "background-image: linear-gradient(to top,  #0d0d0d, #1e2844)"
      );
  }

  /**
   * The reason that the background color is effectively set on two seperate elements (html and body)
   * is because the html is the full width of the page on chrome and firefox BUT additionally firefox
   * takes the background color property and uses that as the color for  a small "hat like" triangle
   * above the extensions popup
   *
   * we only want such a configuration when the page is displayed in a popup, and not when as a full webpage as with registration
   */
  if (inPopUp) {
    document.body.style.backgroundColor = light ? "transparent" : "#1e2844";
  }
};

const lightModeEnabled = async (): Promise<boolean> => {
  const store = new BrowserKVStore("");

  return new Promise(resolve =>
    store.get(STORAGE_KEY).then((result: any) => {
      if (typeof result === "undefined" || result === false) resolve(false);
      else resolve(true);
    })
  );
};

function setLightMode(light: boolean, inPopUp: boolean, save = true) {
  setBackgroundImage(light, inPopUp);
  const el: HTMLElement = document.getElementById("light") as HTMLElement;
  if (light && !el.classList.contains(CLASS_NAME)) {
    el.classList.add(CLASS_NAME);
  } else if (!light && el.classList.contains(CLASS_NAME)) {
    el.classList.remove(CLASS_NAME);
  }

  if (save) {
    const store = new BrowserKVStore("");
    store.set(STORAGE_KEY, light);
  }
}

export { setLightMode, lightModeEnabled, LightMode };
