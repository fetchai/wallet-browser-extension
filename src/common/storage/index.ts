import { EXTENSION } from '../constants'
import {STORAGE_KEY} from "../../ui/popup/light-mode";

const isChrome = (): boolean => {
  return navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
}

export default class Storage {

  static async getItem (key: string, callback: (items: { [key: string]: any }) => void) {
    if(isChrome()) {
        chrome.storage.sync.get(STORAGE_KEY, callback)
    } else {
        browser.storage.sync.get(key).then(callback)
    }
  }

  static async setItem (key, v) {
     if(!isChrome()){
       browser.storage.
    } else {
       return new Promise((resolve, reject) => {
         chrome.storage.sync.set({ [key]: v }, () => {
           // chrome.runtime.lastError
           //  ? reject(Error(chrome.runtime.lastError.message))
           //  : resolve()})
           resolve()
         })
       })
     }
  }


}
export { Storage }
// const { data } = await getStorageData('data')
//await setStorageData({ data: [someData] })
// await setStorageData({ data: [someData] })