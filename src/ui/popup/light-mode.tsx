/**
 * Default styles are dark mode, we add toggle to light mode hence light mode
 *
 */
const CLASS_NAME = "light-mode";
const STORAGE_KEY = "light-mode";
import React from "react";
import classnames from "classnames";

type State = {
  lightMode: boolean;
};

type Props = {};

class LightMode extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
  }

  componentDidMount(): void {
    // set light mode status from local storage
    chrome.storage.sync.get(STORAGE_KEY, result => {
      let mode = result[STORAGE_KEY];
      mode = Boolean(JSON.parse(mode));
      this.setState({
        lightMode: mode
      });
      setBackgroundImage(mode);
    });
  }

  public readonly state: State = {
    lightMode: false
  };

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
  document.body.style.backgroundImage = light
    ? "none"
    : "linear-gradient(to top, #0d0d0d, #1e2844)";
};

const lightModeEnabled = async (): Promise<boolean> => {
  return new Promise(resolve =>
    chrome.storage.sync.get(STORAGE_KEY, result => {
      if (typeof result[STORAGE_KEY] === "undefined") resolve(false);
      else resolve(Boolean(JSON.parse(result[STORAGE_KEY])));
    })
  );
};

function setLightMode(light: boolean, save = true) {
  setBackgroundImage(light);
  const el: HTMLElement = document.getElementById("light") as HTMLElement;
  if (light && !el.classList.contains(CLASS_NAME)) {
    el.classList.add(CLASS_NAME);
  } else if (!light && el.classList.contains(CLASS_NAME)) {
    el.classList.remove(CLASS_NAME);
  }

  if(save){
    chrome.storage.sync.set({ [STORAGE_KEY]: light });
  }
}

export { setLightMode, lightModeEnabled, LightMode };
