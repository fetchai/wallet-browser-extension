import { BrowserKVStore } from "../kvstore";
import {
  DEFAULT_LOCKUP_PERIOD,
  LOCKUP_PERIOD
} from "../../ui/components/lock/lock";
import { LOCK_PERIODS } from "../../ui/popup/pages/settings";

export function setLockTimeOutPeriod(periodMillisecond: LOCK_PERIODS) {
    const store = new BrowserKVStore("");
    store.set(LOCKUP_PERIOD, periodMillisecond);
}

export async function getLockTimeOutPeriod() : Promise<LOCK_PERIODS> {
    const store = new BrowserKVStore("");
     const storageResult =  await store.get<any>(LOCKUP_PERIOD);
     console.log("storageResult ", storageResult)

     if(typeof storageResult === "undefined") {
         return DEFAULT_LOCKUP_PERIOD
     }

    let result;




     switch (parseInt(storageResult)) {
        case 60000:
          result = LOCK_PERIODS.ONE_MINUTE
          break;
        case 300000:
          result = LOCK_PERIODS.FIVE_MINUTES
          break;
        case 3600000:
          result = LOCK_PERIODS.ONE_HOUR
          break;
        case 86400000:
          result = LOCK_PERIODS.ONE_DAY
          break;
        case 18144000000:
          result = LOCK_PERIODS.ONE_MONTH
          break;
        case 9007199254740991:
          result = LOCK_PERIODS.NEVER
          break;
        default:
          throw new Error("Invalid storageResult" + storageResult);
      }

    if(typeof result === "undefined"){
        console.error("undefined result from enum")

    }
   return result;
  }
