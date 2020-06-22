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

export const CustomEndpoint: FunctionComponent<CustomEndpointProps> = observer(
  ({ lightMode }) => {
    // const CustomEndpoint = (props: { lightMode: boolean }) => {
    const [collapsible1aa, setcollapsible1aa] = useState(false);
    const [collapsible1a, setcollapsible1a] = useState(false);
    const [isLightMode, setIsLightMode] = useState(lightMode);

    const [activeNetwork, setActiveNetwork] = useState("");

    const [nonCustomEndpoints, setNonCustomEndpoints] = useState<
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

    const { chainStore, accountStore } = useStore();
    const intl = useIntl();
    const transitions = ["height", "opacity", "background"];

    useEffect(() => {
      setIsLightMode(lightMode);
    }, [lightMode]);

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
            rpc: endpoint.rpc
          });
        });
        setNonCustomEndpoints(endpointData);
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
     *
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

      // success we then add the custom endpoint
      await ActiveEndpoint.addCustomEndpoint(customName, customRPC, customREST);

      const nextCustomEndpoints = customEndpoints.concat({
        name: customName,
        rest: customREST,
        rpc: customREST
      });
      setCustomEndpoints(nextCustomEndpoints);

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

    const deleteCustomNetwork = async (name: string): Promise<void> => {
      // delete from our list of custom endpoints
      const list = customEndpoints;
      const index = list.findIndex((el: EndpointData) => el.name === name);
      list.splice(index, 1);
      setCustomEndpoints(list);

      // if it is the active endpoint switch to the first of the default endpoints.
      if (activeNetwork === name) {
        await handleSetActiveNetwork(nonCustomEndpoints[0].name);
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

    return (
      <div className={style.dropdown}>
        <OutsideClickHandler
          onOutsideClick={() => {
            setShowDropdown(false);
          }}
        >
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
              {collapsible1a ? "Custom" : activeNetwork}
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
              {nonCustomEndpoints.map((el: EndpointData, index: number) => {
                return (
                  <div
                    key={index}
                    onClick={async () => {
                      setShowDropdown(false);
                      setCustomREST(el.rest);
                      setCustomRPC(el.rpc);
                      setCustomEndpointOutput("");
                      setcollapsible1a(true);
                      setcollapsible1aa(false);
                      await handleSetActiveNetwork(el.name);
                    }}
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
                onClick={async () => {
                  setcollapsible1a(true);
                  setcollapsible1aa(true);
                  setAddingNewEndpoint(true);
                  await setShowDropdown(false);
                  await clearCustomUrlForm();
                }}
              >
                Add Custom
              </div>
              {customEndpoints.map((el: EndpointData, index: number) => {
                return (
                  <div
                    key={index}
                    onClick={async () => {
                      setShowDropdown(false);
                      setcollapsible1a(true);
                      setcollapsible1aa(true);
                      setAddingNewEndpoint(false);
                      setCustomREST(el.rest);
                      setCustomRPC(el.rpc);
                      setCustomName(el.name);
                      setCustomEndpointOutput("");
                      await handleSetActiveNetwork(el.name);
                    }}
                    className={classnames(
                      style.closableRow,
                      style.clickable,
                      activeNetwork === el.name ? style.active : ""
                    )}
                  >
                    {el.name}
                    <span
                      className={style.closeIcon}
                      onClick={async (event: MouseEvent) => {
                        event.stopPropagation();
                        await deleteCustomNetwork(el.name);
                        setShowDropdown(false);
                      }}
                    >
                      <i className={classnames("fa", "fa-2x", "fa-close")}></i>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </OutsideClickHandler>
        <Expand open={collapsible1a} duration={500} transitions={transitions}>
          <form className={style.customNetworkForm}>
            <input
              type="text"
              placeholder="RPC URL"
              value={customRPC}
              onChange={event => setCustomRPC(event.target.value)}
            ></input>
            <input
              type="text"
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
        <span className={customEndpointHasError ? "red" : ""}>
          {customEndpointOutput}
        </span>
      </div>
    );
  }
);
