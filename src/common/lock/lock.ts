import {BrowserKVStore} from "../kvstore";
import {LOCKUP_PERIOD} from "../../ui/components/lock/lock";

function setLockTimeOutPeriod(periodMillisecond: string) {
    const store = new BrowserKVStore("");
    store.set(LOCKUP_PERIOD, periodMillisecond);
}

async function getLockTimeOutPeriod(periodMillisecond: string) {
    const store = new BrowserKVStore("");
     return await store.get<any>(LOCKUP_PERIOD);
  }
}
