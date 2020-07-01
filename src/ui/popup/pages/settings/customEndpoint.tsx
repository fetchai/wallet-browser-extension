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
import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { GetChainIdAndCheckEndPointsAreOnlineMsg } from "../../../../background/api";
import { sendMessage } from "../../../../common/message/send";
import { DEFAULT_TRANSITIONS } from "../../../../global-constants";
import { ChainIdCheckResponse } from "../../../../background/api/handler";

interface CustomEndpointProps {
  lightMode: boolean;
  showAddingNewEndpointForm: boolean;
  setShowAddingNewEndpointForm: any;
}

/**
 * The drop down was not implemented with a select since an <option> tag may only contain text by html rules and not clickables eg closable cross.
 *
 * It is therefore a button with a div that is displayed when the button is clicked on as per this tutorial: https://www.w3schools.com/howto/howto_js_dropdown.asp
 */
export const CustomEndpoint: FunctionComponent<CustomEndpointProps> = observer(
  ({ lightMode, showAddingNewEndpointForm, setShowAddingNewEndpointForm }) => {
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

    const [RPC, setRPC] = useState("");
    const [REST, setREST] = useState("");
    const [Name, setName] = useState("");
    const [chainID, setChainID] = useState("");
    const [endpointOutput, setEndpointOutput] = useState("");
    const [customEndpointHasError, setCustomEndpointHasError] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // from the dropdown which item is selected and defaults to the first.
    const [selectedNetworkInList, setSelectedNetworkInList] = useState("");

    const { chainStore, accountStore } = useStore();
    const intl = useIntl();

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
            chainId: endpoint.chainId
          });
        });
        setIntrinsicEndpoints(endpointData);
      };
      getEndpoints();
    }, [chainStore]);

    const clearCustomUrlForm = async () => {
      return new Promise(async (resolve: any) => {
        setRPC("");
        setChainID("");
        setREST("");
        setName("");
        setEndpointOutput("");
        await flushPromises();
        resolve();
      });
    };

    /**
     * All logic from clicking submit on adding custom ednpoint staring with validation, then moving to
     * adding the ednpoint incl to storage, and then of updating the state variables in the UI.
     *
     * We look check that the custom rpc and rest are valid urls and if true we add them
     *
     * note: multiple exits (returns)
     */
    const handleCustomEndpointSubmission = async (event: MouseEvent) => {
      event.preventDefault();

      // check that nickname is set and not null
      if (Name === "") {
        setCustomEndpointHasError(true);
        setEndpointOutput(
          intl.formatMessage({
            id: "settings.custom.endpoint.name.empty"
          })
        );
        return;
      }

      // if both rest and rpc urls are empty
      if (REST === "" && RPC === "") {
        setCustomEndpointHasError(true);
        setEndpointOutput(
          intl.formatMessage({
            id: "settings.custom.endpoint.url.empty.both"
          })
        );
        return;
      }

      if (REST === "") {
        setCustomEndpointHasError(true);
        setEndpointOutput(
          intl.formatMessage({
            id: "settings.custom.endpoint.url.empty.rest"
          })
        );
        return;
      }

      if (RPC === "") {
        setCustomEndpointHasError(true);
        setEndpointOutput(
          intl.formatMessage({
            id: "settings.custom.endpoint.url.empty.rpc"
          })
        );
        return;
      }

      // check the rest url is a valid URL
      if (!isURL(REST)) {
        setCustomEndpointHasError(true);
        setEndpointOutput(
          intl.formatMessage({
            id: "settings.custom.endpoint.url.invalid.rest"
          })
        );
        return;
      }
      // check rpc url is a valid URL
      if (!isURL(RPC)) {
        setCustomEndpointHasError(true);
        setEndpointOutput(
          intl.formatMessage({
            id: "settings.custom.endpoint.url.invalid.rpc"
          })
        );
        return;
      }

      setCustomEndpointHasError(false);

      const chainIdResult = await fetchChainIdAndCheckRestURLIsOnline();

      // check if the custom rpc and rest respond to http requests and return a chainId.
      if (typeof chainIdResult.errorId !== "undefined") {
        setCustomEndpointHasError(true);
        setEndpointOutput(
          intl.formatMessage({
            id: chainIdResult.errorId
          })
        );
        return;
      }

      // success we then add the custom endpoint to storage
      await ActiveEndpoint.addCustomEndpoint(
        Name,
        RPC,
        REST,
        chainIdResult.chainId as string
      );

      // and to state
      const nextCustomEndpoints = customEndpoints.concat({
        name: Name,
        rest: REST,
        rpc: RPC,
        chainId: chainIdResult.chainId as string
      });

      // update the page state related to this around the page, and close the add endpoint form
      setCustomEndpoints(nextCustomEndpoints);
      setcollapsible1a(false);
      setActiveNetwork(Name);
      setShowAddingNewEndpointForm();

      await ActiveEndpoint.setActiveEndpointName(Name);
      await clearCustomUrlForm();
      setEndpointOutput(
        intl.formatMessage({
          id: "settings.custom.endpoint.url.success"
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

    /**
     * returns chain id if found from rpc endpoint via status query.
     *
     */
    const fetchChainIdAndCheckRestURLIsOnline = async (): Promise<ChainIdCheckResponse> => {
      const msg = GetChainIdAndCheckEndPointsAreOnlineMsg.create(RPC, REST);
      return await sendMessage(BACKGROUND_PORT, msg);
    };

    /**
     * This is what sets the active network on this page, but also in storage and refetchs account data
     *
     * @param name
     */
    const handleSetActiveNetwork = async (name: string): Promise<void> => {
      setActiveNetwork(name);
      await ActiveEndpoint.setActiveEndpointName(name);
      await accountStore.clearAssets(true);
      await accountStore.fetchAccount();
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
      setSelectedNetworkInList(element.name);

      // prefill the form below that we show when clicked
      setREST(element.rest);
      setRPC(element.rpc);
      setChainID(element.chainId);
      setName(element.name);
      setEndpointOutput("");
      setShowAddingNewEndpointForm(false);
      await handleSetActiveNetwork(element.name);
      forceUpdate();
    };

    const selectCustomEndpoint = async (element: EndpointData) => {
      setShowDropdown(false);
      setcollapsible1a(true);
      setShowAddingNewEndpointForm(false);
      setSelectedNetworkInList(element.name);

      // prefill the form below that we show when clicked
      setREST(element.rest);
      setRPC(element.rpc);
      setName(element.name);
      setChainID(element.chainId);
      setEndpointOutput("");

      await handleSetActiveNetwork(element.name);
      forceUpdate();
    };

    /**
     *  clears the form and shows it when we click on add custom within the dropdown
     *
     */
    const handleClickOnAddCustomListElement = async () => {
      setcollapsible1a(true);
      setShowAddingNewEndpointForm(true);
      setShowDropdown(false);
      setSelectedNetworkInList("");
      await clearCustomUrlForm();
    };

    const isIntrinsicSelected = (): boolean => {
      return intrinsicEndpoints.some((el: EndpointData) => {
        return selectedNetworkInList === el.name;
      });
    };

    const getDropdownButtonText = () => {
      return showAddingNewEndpointForm
        ? intl.formatMessage({
            id: "settings.custom.endpoint.url.add-custom"
          })
        : activeNetwork;
    };

    return (
      <OutsideClickHandler
        onOutsideClick={async () => {
          await clearCustomUrlForm();
          setShowDropdown(false);
          setcollapsible1a(false);
          setShowAddingNewEndpointForm(false);
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
              {getDropdownButtonText()}
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
                  id: "settings.custom.endpoint.url.add-custom"
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
          <Expand
            open={collapsible1a}
            duration={500}
            transitions={DEFAULT_TRANSITIONS}
          >
            <form className={style.customNetworkForm}>
              <label>
                {" "}
                {intl.formatMessage({
                  id: "settings.custom.endpoint.url.name"
                })}
              </label>
              <input
                type="text"
                placeholder={intl.formatMessage({
                  id: "settings.custom.endpoint.url.assign-nickname"
                })}
                value={Name}
                disabled={isIntrinsicSelected()}
                onChange={event => setName(event.target.value)}
              ></input>
              <label>
                {" "}
                {intl.formatMessage({
                  id: "settings.custom.endpoint.url.rest-url"
                })}
              </label>
              <input
                type="text"
                disabled={isIntrinsicSelected()}
                value={REST}
                onChange={event => setREST(event.target.value)}
              ></input>
              <label>
                {" "}
                {intl.formatMessage({
                  id: "settings.custom.endpoint.url.rpc-url"
                })}
              </label>
              <input
                type="text"
                value={RPC}
                disabled={isIntrinsicSelected()}
                onChange={event => setRPC(event.target.value)}
              ></input>
              <label>
                {" "}
                {intl.formatMessage({
                  id: "settings.custom.endpoint.url.chain-id"
                })}
              </label>
              {chainID ? <output>{chainID}</output> : ""}
              {!isIntrinsicSelected() ? (
                <button
                  type="submit"
                  className={`green ${style.button}`}
                  onClick={handleCustomEndpointSubmission}
                >
                  {showAddingNewEndpointForm
                    ? intl.formatMessage({
                        id: "settings.custom.endpoint.url.submit"
                      })
                    : intl.formatMessage({
                        id: "settings.custom.endpoint.url.update"
                      })}
                </button>
              ) : (
                ""
              )}
            </form>
          </Expand>
          <div className={style.outputText}>
            <span className={customEndpointHasError ? "red" : ""}>
              {endpointOutput}
            </span>
          </div>
        </div>
      </OutsideClickHandler>
    );
  }
);
