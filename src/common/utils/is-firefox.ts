
 const isFirefox = (): boolean => {
const ret = navigator.userAgent.indexOf("Firefox") !=-1
    return ret;
}

export { isFirefox };