
export const isFirefox = (): boolean => {
const ret = navigator.userAgent.indexOf("Firefox") !=-1
    debugger;
    return ret;
}

export { isFirefox };