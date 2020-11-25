import {KeyRingStatus} from "../../../background/keyring";

export const LOCKUP_PERIOD  = "lockup-period";
export const DEFAULT_LOCKUP_PERIOD  = 18000;
import React, { FunctionComponent, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import OutsideClickHandler from "react-outside-click-handler";
import { useStore } from "../../popup/stores";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { useHistory } from "react-router";


type Props = {};

const POLL_INTERVAL = 5000

export const Lock: FunctionComponent<Props> = () => {
    const history = useHistory();


useEffect(() => {
  console.log('mount it 99!');
    setInterval(redirectIfLocked, POLL_INTERVAL);
}, []);


/**
 * Redirect to locked if they get locked by polling the backend.
 */
     const redirectIfLocked = async () => {

        const keyRingStatus =  await keyRingStore.GetKeyRingStatus()

         if(keyRingStatus === KeyRingStatus.LOCKED && history.location.pathname !== "/lock" ){
             history.push("/lock");
         }
    }

    const { keyRingStore } = useStore();

    // The way that this works is that all clicks within the page that are not on
    // this small spaceless component (all clicks on the application) tell the background that the
    const activeNow = async (): Promise<void> => {
        await keyRingStore.setLastActive()
    }

    return (
        <>
            <OutsideClickHandler
                onOutsideClick={activeNow}></OutsideClickHandler>
        </>
    )

}



