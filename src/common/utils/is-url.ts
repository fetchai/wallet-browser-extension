/**
 * is a url valid
 *
 * regex based ones kept failing.
 *
 * @param str
 */
const isURL = (str: string) => {
  const a = document.createElement("a");
  a.href = str;
  return a.host && a.host != window.location.host;
};

export { isURL };
