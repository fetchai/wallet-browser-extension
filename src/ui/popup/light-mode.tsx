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
import {useStore} from "./stores";
import {useIntl} from "react-intl";
import {KeyRingStatus} from "../../background/keyring";

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

      let mode = (typeof result !== "undefined")? result as boolean : false;
      this.setState({
        lightMode: mode
      });

      // if they are not logged in then they are in the register flow, so we can use that to determine

     const { keyRingStore } = useStore();
    const loggedIn = Boolean(keyRingStore.status === KeyRingStatus.UNLOCKED)
      setBackgroundImage(mode, loggedIn);
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
    //
    //
    // const posElem = document.getElementsByTagName("HTML")[0];
    // posElem.style.cssText = "background: linear-gradient(to top, #0d0d0d, #1e2844);";
  }

    /**
     * The reason that the background color is effectively set on two seperate elements (html and body)
     * is because the html is the full width of the page on chrome and firefox BUT additionally firefox
     * takes the background color property and uses that as the color for  a small "hat like" triangle
     * above the extensions popup
     *
     * we only want such a configuration when the page is displayed in a popup, and not when as a full webpage as with registration
     */
    debugger;
if(inPopUp){
      document.body.style.backgroundColor = light
    ? "transparent"
    : "#1e2844";
}


};

const lightModeEnabled = async (): Promise<boolean> => {

   const store = new BrowserKVStore("")

  return new Promise(resolve =>
    store.get(STORAGE_KEY).then((result: any) => {

      if (typeof result === "undefined" || result === false) resolve(false);
      else resolve(true);
    })
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

       const store = new BrowserKVStore("")

      store.set(STORAGE_KEY, light);

    // browser.storage.sync.set({ [STORAGE_KEY]: light });
  }
}

export { setLightMode, lightModeEnabled, LightMode };
