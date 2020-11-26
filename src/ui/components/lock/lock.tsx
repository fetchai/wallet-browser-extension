import {KeyRingStatus} from "../../../background/keyring";
import { LOCK_PERIODS } from "../../popup/pages/settings";

export const LOCKUP_PERIOD  = "lockup-period";
export const LAST_ACTIVE = "last-active";

// dedault period after which inactivity will lock the wallet
export const DEFAULT_LOCKUP_PERIOD  = LOCK_PERIODS.ONE_HOUR
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

export const Lock: FunctionComponent<Props> = (props) => {
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


                       // this is really really hacky jusr if we are on lock page don't reload it as flickers on the page
                  // we cannot base this on the path variable since the path variable was set up so that some blank paths can show multiple different
                // page. a better way would have been to check the
             if(!document.getElementsByClassName("video").length){
                 console.log("reload")
                            history.push("/lock");
             }
         }
    }

    const { keyRingStore } = useStore();

    // The way that this works is that all clicks within the page that are not on
    // this small spaceless component (all clicks on the application since it occupies no space) tell the background to reset the count
    const activeNow = async (): Promise<void> => {
        await keyRingStore.setLastActive()
    }

    return (
        <>
            <OutsideClickHandler
                onOutsideClick={activeNow}></OutsideClickHandler>
            {props.children}
        </>
    )

}



