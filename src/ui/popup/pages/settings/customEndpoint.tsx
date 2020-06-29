import { EndpointData } from "../../../../chain-info";
import React, {
  FunctionComponent,
  MouseEvent,
  useEffect,
  useState
} from "react";
import ActiveEndpoint from "../../../../common/utils/active-endpoint";
import style from "./style.module.scss";
import classnames from "classnames";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
import flushPromises from "flush-promises";
import { isURL } from "../../../../common/utils/is-url";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import OutsideClickHandler from "react-outside-click-handler";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import Expand from "react-expand-animated";
import { observer } from "mobx-react";

interface CustomEndpointProps {
  lightMode: boolean;
}

/**
 * The drop down was not implemented with a select since an <option> tag may only contain text by html rules and not clickables eg closable cross.
 *
 * It is therefore a button with a div that is displayed when the button is clicked on as per this tutorial: https://www.w3schools.com/howto/howto_js_dropdown.asp
 */
export const CustomEndpoint: FunctionComponent<CustomEndpointProps> = observer(
  ({ lightMode }) => {
    const [collapsible1aa, setcollapsible1aa] = useState(false);
    const [collapsible1a, setcollapsible1a] = useState(false);
    const [isLightMode, setIsLightMode] = useState(lightMode);

    // active network which the wallet curently displays data for of list.
    const [activeNetwork, setActiveNetwork] = useState("");

    // intrinsic endpoints are those predefined in configs
    const [intrinsicEndpoints, setIntrinsicEndpoints] = useState<
      Array<EndpointData>
    >([]);

    const [customEndpoints, setCustomEndpoints] = useState<Array<EndpointData>>(
      []
    );

    const [customRPC, setCustomRPC] = useState("");
    const [customREST, setCustomREST] = useState("");
    const [customName, setCustomName] = useState("");
    const [addingNewEndpoint, setAddingNewEndpoint] = useState(false);
    const [customEndpointOutput, setCustomEndpointOutput] = useState("");
    const [customEndpointHasError, setCustomEndpointHasError] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // from the dropdown which item is selected and defaults to the first.
    const [selectedNetworkInList, setSelectedNetworkInList] = useState("");

    const { chainStore, accountStore } = useStore();
    const intl = useIntl();
    const transitions = ["height", "opacity", "background"];

    useEffect(() => {
      setIsLightMode(lightMode);
    }, [lightMode]);

    //create your forceUpdate hook
    function useForceUpdate() {
      const [, setValue] = useState(0); // integer state
      return () => setValue(value => ++value); // update the state to force render
    }

    // call your hook here
    const forceUpdate = useForceUpdate();

    useEffect(() => {
      // on mount we get active endpoint so we can get dropdown initially have this one selected
      const findActiveEndpoint = async () => {
        const network = await ActiveEndpoint.getActiveEndpoint();
        setActiveNetwork(network.name);
      };

      const getCustomEndpointData = async () => {
        const customEndpointData = await ActiveEndpoint.getCustomEndpointData();
        setCustomEndpoints(customEndpointData);
      };

      findActiveEndpoint();
      getCustomEndpointData();
    }, []);

    useEffect(() => {
      const endpointData: Array<EndpointData> = [];
      // since chain store is a proxy/observer we cannot directly include it in dom
      // so we intead take its values and push them into a state variable.
      const getEndpoints = async () => {
        chainStore.chainInfo.endpoints.map(endpoint => {
          endpointData.push({
            name: endpoint.name,
            rest: endpoint.rest,
            rpc: endpoint.rpc,
            chainId: "tododeleteplaceholder"
          });
        });
        setIntrinsicEndpoints(endpointData);
      };
      getEndpoints();
    }, [chainStore]);

    const clearCustomUrlForm = async () => {
      return new Promise(async (resolve: any) => {
        setCustomRPC("");
        setCustomREST("");
        setCustomName("");
        setCustomEndpointOutput("");
        await flushPromises();
        resolve();
      });
    };

    /**
     * Custom endpoint should be refactored to  be a seperate module before completion, as can some other the others in settings page
     *
     * We look check that the custom rpc and rest are valid urls and if true we add them
     *
     * note: multiple exits (returns)
     */
    const handleCustomEndpointSubmission = async (event: MouseEvent) => {
      event.preventDefault();

      // check that nickname is set and not null
      if (customName === "") {
        setCustomEndpointHasError(true);
        setCustomEndpointOutput(
          intl.formatMessage({
            id: "register.custom.endpoint.name.empty"
          })
        );
        return;
      }
      // check that neither rest nor rpc urls are empty
      if (customREST === "" || customRPC === "") {
        setCustomEndpointHasError(true);
        setCustomEndpointOutput(
          intl.formatMessage({
            id: "register.custom.endpoint.url.empty"
          })
        );
        return;
      }

      // check the rest url is a valid URL
      if (!isURL(customREST)) {
        setCustomEndpointHasError(true);
        setCustomEndpointOutput(
          intl.formatMessage({
            id: "register.custom.endpoint.url.invalid.rest"
          })
        );
        return;
      }
      // check rpc url is a valid URL
      if (!isURL(customRPC)) {
        setCustomEndpointHasError(true);
        setCustomEndpointOutput(
          intl.formatMessage({
            id: "register.custom.endpoint.url.invalid.rest"
          })
        );
        return;
      }

      setCustomEndpointHasError(false);
      // success we then add the custom endpoint
      await ActiveEndpoint.addCustomEndpoint(customName, customRPC, customREST);

      const nextCustomEndpoints = customEndpoints.concat({
        name: customName,
        rest: customREST,
        rpc: customREST,
          chainid: "testing"
      });

      // update the state related to this around the page, and close the add endpoint form
      setCustomEndpoints(nextCustomEndpoints);
      setcollapsible1a(false);
      setcollapsible1aa(false);
      setActiveNetwork(customName);

      await ActiveEndpoint.setActiveEndpointName(customName);
      await clearCustomUrlForm();
      setCustomEndpointOutput(
        intl.formatMessage({
          id: "register.custom.endpoint.url.success"
        })
      );
      await accountStore.clearAssets(true);
      await accountStore.fetchAccount();
    };

    const deleteCustomNetwork = async (
      name: string,
      event: MouseEvent
    ): Promise<void> => {
      event.stopPropagation();
      // delete from our list of custom endpoints
      const list = customEndpoints;
      const index = list.findIndex((el: EndpointData) => el.name === name);
      list.splice(index, 1);
      setCustomEndpoints(list);

      // if it is the active endpoint switch to the first of the default endpoints.
      if (activeNetwork === name) {
        await handleSetActiveNetwork(intrinsicEndpoints[0].name);
      }

      // delete from storage
      await ActiveEndpoint.deleteCustomEndpoint(name);
    };

    const handleSetActiveNetwork = async (name: string): Promise<void> => {
      setActiveNetwork(name);
      await ActiveEndpoint.setActiveEndpointName(name);
      await accountStore.clearAssets(true);
      await accountStore.fetchAccount();
    };

    /**
     * get button text (which is where the first element on the drop down would be were it a select)
     */
    const getButtonText = (): string => {
      // if the active network is not custom then show it on button
      if (
        intrinsicEndpoints.some((el: EndpointData) => {
          return el.name === activeNetwork;
        })
      ) {
        return activeNetwork;
      }

      // if it is custom then show edit custom
      if (
        customEndpoints.some((el: EndpointData) => {
          return el.name === activeNetwork;
        })
      ) {
        return intl.formatMessage({
          id: "register.custom.endpoint.url.custom"
        });
      }
      // else we add custom
      return intl.formatMessage({
        id: "register.custom.endpoint.url.add-custom"
      });
    };

    /**
     * When you click on non custom element in dropdown this sets the data in the form below and also
     * sets the active network to the value of the clicked element.
     *
     * @param element
     */
    const selectIntrinsicEndpoint = async (element: EndpointData) => {
      setShowDropdown(false);
      setcollapsible1a(true);
      setcollapsible1aa(false);
      setSelectedNetworkInList(element.name);

      // prefill the form below that we show when clicked
      setCustomREST(element.rest);
      setCustomRPC(element.rpc);
      setCustomEndpointOutput("");

      await handleSetActiveNetwork(element.name);
      forceUpdate();
    };

    const selectCustomEndpoint = async (element: EndpointData) => {
      setShowDropdown(false);
      setcollapsible1a(true);
      setcollapsible1aa(true);
      setAddingNewEndpoint(false);
      setSelectedNetworkInList(element.name);

      // prefill the form below that we show when clicked
      setCustomREST(element.rest);
      setCustomRPC(element.rpc);
      setCustomName(element.name);
      setCustomEndpointOutput("");

      await handleSetActiveNetwork(element.name);
      forceUpdate();
    };

    /**
     *  clears the form and shows it when we click on add custom within the dropdown
     *
     */
    const handleClickOnAddCustomListElement = async () => {
      setcollapsible1a(true);
      setcollapsible1aa(true);
      setAddingNewEndpoint(true);
      setShowDropdown(false);
      setSelectedNetworkInList("");
      await clearCustomUrlForm();
    };

    const isIntrinsicSelected = (): boolean => {
      return intrinsicEndpoints.some((el: EndpointData) => {
        return selectedNetworkInList === el.name;
      });
    };

    return (
      <OutsideClickHandler
        onOutsideClick={async () => {
          await clearCustomUrlForm();
          setShowDropdown(false);
          setcollapsible1a(false);
          setcollapsible1aa(false);
        }}
      >
        <div className={classnames(style.dropdown, style.expandable)}>
          <div className={style.dropdown}>
            <button
              onClick={() => {
                const toggled = !showDropdown;
                setShowDropdown(toggled);
              }}
              className={classnames(
                style.dropButton,
                showDropdown ? style.showDropdown : ""
              )}
            >
              {getButtonText()}
              <svg
                className={style.svg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  fill="transparent"
                  strokeWidth={2}
                  stroke={isLightMode ? "hsl(0, 100%, 0%)" : "hsl(0, 0%, 100%)"}
                  strokeLinecap="round"
                  d="M 6.5 10 L 13.5 3.5 M 6.5 10 L 13.5 16.5"
                />
              </svg>
            </button>
            <div
              className={classnames(
                style.dropdownContent,
                showDropdown ? style.showDropdown : ""
              )}
            >
              {intrinsicEndpoints.map((el: EndpointData, index: number) => {
                return (
                  <div
                    key={index}
                    onClick={selectIntrinsicEndpoint.bind(null, el)}
                    className={classnames(
                      style.clickable,
                      activeNetwork === el.name ? style.active : ""
                    )}
                  >
                    {el.name}
                  </div>
                );
              })}
              <div
                className={classnames(style.clickable)}
                onClick={handleClickOnAddCustomListElement}
              >
                {intl.formatMessage({
                  id: "register.custom.endpoint.url.add-custom"
                })}
              </div>
              {customEndpoints.map((el: EndpointData, index: number) => {
                return (
                  <div
                    key={index}
                    onClick={selectCustomEndpoint.bind(null, el)}
                    className={classnames(
                      style.closableRow,
                      style.clickable,
                      activeNetwork === el.name ? style.active : ""
                    )}
                  >
                    {el.name}
                    <span
                      className={style.closeIcon}
                      onClick={deleteCustomNetwork.bind(null, el.name)}
                    >
                      <i className={classnames("fa", "fa-2x", "fa-close")}></i>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <Expand open={collapsible1a} duration={500} transitions={transitions}>
            <form className={style.customNetworkForm}>
              <input
                type="text"
                placeholder="RPC URL"
                value={customRPC}
                disabled={isIntrinsicSelected()}
                onChange={event => setCustomRPC(event.target.value)}
              ></input>
              <input
                type="text"
                disabled={isIntrinsicSelected()}
                placeholder="REST URL"
                value={customREST}
                onChange={event => setCustomREST(event.target.value)}
              ></input>
              <Expand
                open={collapsible1aa}
                duration={500}
                transitions={transitions}
              >
                <input
                  type="text"
                  placeholder="Nickname"
                  value={customName}
                  onChange={event => setCustomName(event.target.value)}
                ></input>
                <button
                  type="submit"
                  className={`green ${style.button}`}
                  onClick={handleCustomEndpointSubmission}
                >
                  {addingNewEndpoint ? "Submit" : "Update"}
                </button>
              </Expand>
            </form>
          </Expand>
          <div className={style.outputText}>
            <span className={customEndpointHasError ? "red" : ""}>
              {customEndpointOutput}
            </span>
          </div>
        </div>
      </OutsideClickHandler>
    );
  }
);
