import { BrowserKVStore } from "../kvstore";
import { EndpointData, NativeChainInfos } from "../../chain-info";

/**
 * this is the active endpoint only exists if a user has changed the endpoint through the settings.
 * if it has not been set then the default endpoint is used.
 *
 * this is the key for saving this value in local storage
 */
const ACTIVE_ENDPOINT_NAME = "active-endpoint-name";

/**
 * we allow one custom endpoint only to be set through settings, which overwrites itself if another is set, but stays until then.
 *
 * this is the key for saving this value in local storage
 */
const CUSTOM_ENDPOINT_DATA = "custom-endpoint-data";

/**
 *  This class holds data on endpoints. In the settings we can select which endpoint is active, and even add our own.
 *
 */
export default class ActiveEndpoint {
  /**
   * This method gets the EndpointData by the endpoint's name
   *
   * first it looks to see if we have this name in our nativechaininfos, and if not it checks against custom endpoint data in localstorage
   *
   *
   */
  private static async getEndpointData(name: string): Promise<EndpointData> {
    if (!NativeChainInfos[0].endpoints.some(el => el.name === name)) {
      const endpointData = await ActiveEndpoint.getCustomEndpointData();
      const endPoint = endpointData.find(el => el.name === name);

      if (typeof endPoint === "undefined")
        throw new Error(`name (${name})not found for endpoint`);

      return endPoint;
    }
    return NativeChainInfos[0].endpoints.filter(el => el.name === name)[0];
  }

  /**
   * delete a custom endpoint by name
   *
   * returns true if was found and deleted and false if was not found.
   *
   * @param name of custom endpoint to delete
   */
  public static async deleteCustomEndpoint(name: string): Promise<boolean> {
    // get all custom endpoints
    const rawData = await ActiveEndpoint.getCustomEndpointData();
    if (!rawData.length) return false;

    // find index of our named endpoint
    const index = rawData.findIndex(el => el.name === name);
    if (index === -1) return false;
    // delete it
    rawData.splice(index, 1);
    const store = new BrowserKVStore("");
    // save endpoints minus the one we deleted.
    await store.set(CUSTOM_ENDPOINT_DATA, JSON.stringify(rawData));
    return true;
  }

  /**
   * Add custom endpoint
   *
   * @param name
   * @param rpc
   * @param rest
   */
  public static async addCustomEndpoint(
    name: string,
    rpc: string,
    rest: string,
    chainId: string
  ) {
    // this is rarely changed hence it just being saved and restored directly from local storage.
    // we retrieve the current end-point data
    let rawData = await ActiveEndpoint.getCustomEndpointData();

    rawData = rawData !== null ? rawData : [];

    // then add in our new end point data.
    const store = new BrowserKVStore("");
    const data: EndpointData = {
      name: name,
      rpc: rpc,
      rest: rest,
      chainId: chainId
    };
    rawData.push(data);
    await store.set(CUSTOM_ENDPOINT_DATA, JSON.stringify(rawData));
  }

  public static async getCustomEndpointData(): Promise<Array<EndpointData>> {
    const store = new BrowserKVStore("");
    return new Promise(resolve =>
      store.get(CUSTOM_ENDPOINT_DATA).then((result: any) => {
        if (typeof result === "undefined" || result === false) {
          resolve([]);
        } else {
          resolve(JSON.parse(result));
        }
      })
    );
  }

  public static async setActiveEndpointName(name: string) {
    const store = new BrowserKVStore("");
    await store.set(ACTIVE_ENDPOINT_NAME, name);
  }

  /**
   * This is written as a util here so that it can be imported in either a background or foreground thread.
   *
   * There can be several endpoints specified but this works out which is "active" (ie in use) as the wallet allows one to switch between
   * different endpoints.
   */
  public static async getActiveEndpoint(): Promise<EndpointData> {
    const store = new BrowserKVStore("");
    return new Promise(resolve =>
      store.get(ACTIVE_ENDPOINT_NAME).then((result: any) => {
        if (typeof result === "undefined" || result === false) {
          resolve(
            ActiveEndpoint.getEndpointData(NativeChainInfos[0].defaultEndpoint)
          );
        } else {
          resolve(ActiveEndpoint.getEndpointData(result));
        }
      })
    );
  }
}
