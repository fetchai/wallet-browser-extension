import { BrowserKVStore } from "../kvstore";
import { EndpointData, NativeChainInfos } from "../../chain-info";
import { STORAGE_KEY } from "../../ui/popup/light-mode";

const DEFAULT_ENDPOINT_KEY = "default-endpoint";

const getEndpointData = (name: string): EndpointData => {
  return NativeChainInfos[0].endpoints.filter(el => el.name === name)[0];
};

const setActiveEndpoint = async (name: string) => {
  const store = new BrowserKVStore("");
  await store.set(STORAGE_KEY, name);
};

/**
 * This is written as a util here so that it can be imported in either a background or foreground thread.
 *
 * There can be several endpoints specified but this works out which is "active" (ie in use) as the wallet allows one to switch between
 * different endpoints.
 */
const getActiveEndpoint = async (): Promise<EndpointData> => {
  const store = new BrowserKVStore("");

  return new Promise(resolve =>
    store.get(DEFAULT_ENDPOINT_KEY).then((result: any) => {
      if (typeof result === "undefined" || result === false)
        resolve(getEndpointData(NativeChainInfos[0].defaultEndpoint));
      else {
        resolve(getEndpointData(result));
      }
    })
  );
};

export { getActiveEndpoint, setActiveEndpoint };
