import { BrowserKVStore } from "../kvstore";
import {
  DEFAULT_LOCKUP_PERIOD,
  LOCKUP_PERIOD
} from "../../ui/components/lock/lock";

export function setLockTimeOutPeriod(periodMillisecond: string) {
    const store = new BrowserKVStore("");
    store.set(LOCKUP_PERIOD, periodMillisecond);
}

export async function getLockTimeOutPeriod() {
    const store = new BrowserKVStore("");
     const storageResult =  await store.get<any>(LOCKUP_PERIOD);
   return  typeof storageResult === "undefined" ? DEFAULT_LOCKUP_PERIOD : storageResult
  }
