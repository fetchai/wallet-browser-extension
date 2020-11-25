import { KeyRingKeeper } from "./keeper";
import { getLockTimeOutPeriod } from "../../common/lock/lock";
import {KeyRingStatus} from "./keyring";
const INTERVAL_MS = 5000;

export class TimeoutLock {
  private keyRingKeeper: KeyRingKeeper;
  private inactivePeriod: number;

  constructor(keyRingKeeper: KeyRingKeeper) {
    this.keyRingKeeper = keyRingKeeper;
    this.inactivePeriod = 0;
    console.log(" this.inactivePeriod", this.inactivePeriod);

    setInterval(this.run.bind(this), INTERVAL_MS);
  }

  private runTimeoutHandle: number | undefined;

  private async run() {

    const status = this.keyRingKeeper.getKeyRingStatus()

    if(status !== KeyRingStatus.UNLOCKED){
      return;
    }

    this.inactivePeriod += INTERVAL_MS

    const lockTimeoutPeriod = await getLockTimeOutPeriod();
            console.log(" lockTimeoutPeriod",  lockTimeoutPeriod);
            console.log(" this.inactivePeriod", this.inactivePeriod);

    if (this.inactivePeriod > lockTimeoutPeriod) {
      console.log("AM LOCKING : lockTimeoutPeriod", lockTimeoutPeriod)
      console.log("AM LOCKING : this.inactivePeriod", this.inactivePeriod)
      this.keyRingKeeper.lock();
      clearInterval(this.runTimeoutHandle)
    }

  }

  public resestInactivePeriod() {
          console.log("resestInactivePeriod")
    console.log(" this.inactivePeriod", this.inactivePeriod);
          this.inactivePeriod = 0
  }
}
