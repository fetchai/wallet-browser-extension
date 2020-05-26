/**
 * Default styles are dark mode, we add toggle to light mode hence light mode
 *
 */
import { validJSONString } from "../../common/utils/valid-json-string";
const CLASS_NAME = "light-mode";
export const STORAGE_KEY = "light-mode";
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
    browser.storage.sync.get(STORAGE_KEY, result => {
      let mode = result[STORAGE_KEY];
      mode = validJSONString(mode) ? Boolean(JSON.parse(mode)) : false;
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

  if (light) {
    document
      .getElementsByTagName("HTML")[0]
      .setAttribute("style", "background-image: none");
  } else {
    const posElem = document.getElementsByTagName("HTML")[0];

    debugger;

    let newBack = "pink"

var newStyle = 'background: ' + newBack + ';'
     posElem.style.cssText = newStyle;


// if(typeof(posElem.style.cssText) != 'undefined') {
//     posElem.style.cssText = newStyle;
// } else {
//     posElem.setAttribute('style', newStyle);
// }
    //
    // document
    //   .getElementsByTagName("HTML")[0].
    //     .style.backgroundImage = "green";
      // .value(
      //   "style",
      //   "background-image: green"
      // );
  }

  // document.body.style.backgroundImage = light
  //   ? "none"
  //   : "linear-gradient(to top, red, #1e2844)";
};

const lightModeEnabled = async (): Promise<boolean> => {
  return new Promise(resolve =>
    browser.storage.sync.get(STORAGE_KEY, result => {
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

  if (save) {
    browser.storage.sync.set({ [STORAGE_KEY]: light });
  }
}

export { setLightMode, lightModeEnabled, LightMode };
