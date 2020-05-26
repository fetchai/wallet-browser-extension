/**
 * Default styles are dark mode, we add toggle to light mode hence light mode
 *
 */
import { validJSONString } from "../../common/utils/valid-json-string";
const CLASS_NAME = "light-mode";
export const STORAGE_KEY = "light-mode";
import React from "react";
import classnames from "classnames";
import { BrowserKVStore } from "../../common/kvstore";

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

 async componentDidMount(): void {
    // set light mode status from local storage
   const result = await this.state.store.get(STORAGE_KEY)

      let mode = (typeof result !== "undefined")? result[STORAGE_KEY] : false;
      mode = validJSONString(mode) ? Boolean(JSON.parse(mode)) : false;
      this.setState({
        lightMode: mode
      });
      setBackgroundImage(mode);
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

const setBackgroundImage = (light: boolean) => {
  if (light) {
    document
      .getElementsByTagName("HTML")[0]
      .setAttribute("style", "background-image: none");
  } else {
    const posElem = document.getElementsByTagName("HTML")[0];
    posElem.style.cssText = "background: linear-gradient(to top, #0d0d0d, #1e2844);";
  }
};

const lightModeEnabled = async (): Promise<boolean> => {

   const store = new BrowserKVStore("")

  return new Promise(resolve =>
    store.get(STORAGE_KEY).then((result: any) => {
      if (typeof result === "undefined" || typeof result[STORAGE_KEY] === "undefined") resolve(false);
      else resolve(Boolean(JSON.parse(result[STORAGE_KEY])));
    })
};

function setLightMode(light: boolean, save = true) {
  setBackgroundImage(light);
  const el: HTMLElement = document.getElementById("light") as HTMLElement;
  if (light && !el.classList.contains(CLASS_NAME)) {
    el.classList.add(CLASS_NAME);
  } else if (!light && el.classList.contains(CLASS_NAME)) {
    el.classList.remove(CLASS_NAME);
  }

  if (save) {
    browser.storage.sync.set({ [STORAGE_KEY]: light });
  }
}

export { setLightMode, lightModeEnabled, LightMode };
