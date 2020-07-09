/**
 * Are we in currently in the default popup or not
 */
const amIInPopUp = () => {
  // we look at the urls of theregister oor add account since they are currently the only things not done in the default popup
  return (
    !window.location.href.includes("add-account") &&
    !window.location.href.includes("register")
  );
};

export { amIInPopUp };
