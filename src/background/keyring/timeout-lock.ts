// import {KeyRingKeeper} from "./keeper";
//
// const INTERVAL_MS = 5000
// const DEFAULT_LOCK_PERIOD_MS = 5 * 60 * 100
//
// export class TimeoutLock {
//
//
//     constructor(keyRingKeeper: KeyRingKeeper){
//
//     }
//     private inactivePeriod = 0
//     private runTimeoutHandle: NodeJS.Timeout;
//
//
//     public run(){
//          this.inactivePeriod += INTERVAL_MS
//
//         if(this.inactivePeriod > this.getLockPeriod()){
//
//         }
//
//
//          this.runTimeoutHandle = setTimeout(this.run, INTERVAL_MS)
//     }
//
//
//
//
// private resestInactivePeriod() {
//         inactivePeriod = 0
// }
//
//
//
//     public setLockPeriod(){
//
//     }
//
//     public getLockPeriod(): number {
//
//     }
//
//
//
//
// }