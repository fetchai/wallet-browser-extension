import { KeyRingKeeper } from "./keeper";
import {getInactivePeriod, getLockTimeOutPeriod, setInactivePeriod} from "../../common/lock/lock";
import {KeyRingStatus} from "./keyring";
const INTERVAL_MS = 5000;

export class TimeoutLock {
  private keyRingKeeper: KeyRingKeeper;

  constructor(keyRingKeeper: KeyRingKeeper) {
    this.keyRingKeeper = keyRingKeeper;
    setInterval(this.run.bind(this), INTERVAL_MS);
  }

  private runTimeoutHandle: number | undefined;

  private async run() {
    const status = this.keyRingKeeper.getKeyRingStatus()
    if(status !== KeyRingStatus.UNLOCKED){
      return;
    }

   let inactivePeriod = await getInactivePeriod()

   inactivePeriod += INTERVAL_MS
    const lockTimeoutPeriod = await getLockTimeOutPeriod();

    if (inactivePeriod > lockTimeoutPeriod) {
      await setInactivePeriod(0);
      this.keyRingKeeper.lock();
      clearInterval(this.runTimeoutHandle);
    } else {
      await setInactivePeriod(inactivePeriod);
    }
  }

  public resestInactivePeriod() {
    setInactivePeriod(0)
  }
}
