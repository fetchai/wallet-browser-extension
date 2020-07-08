// /**
//  * Adapted from https://developer.chrome.com/extensions/tut_analytics#toc-debugging
//  *
//  */
//
// const _gaq = [];
// _gaq.push(["_setAccount", "G-YWPW90K60D"]);
// _gaq.push(["_trackPageview"]);
//
// export function AddGoogleAnalytics() {
//   debugger;
//
//   const ga = document.createElement("script");
//   ga.type = "text/javascript";
//   ga.async = true;
//   ga.src = "https://ssl.google-analytics.com/ga.js";
//   const s = document.getElementsByTagName("script")[0];
//   (s.parentNode as Node & ParentNode).insertBefore(ga, s);
// }
//
// function trackButton(e: any) {
//   debugger;
//   _gaq.push(["_trackEvent", e.target.id, "clicked"]);
// }
//
// export function monitorButtons() {
//   // And use it as an event handler for each button's click:
//   const buttons = document.querySelectorAll("div");
//   debugger;
//   for (let i = 0; i < buttons.length; i++) {
//
//     buttons[i].addEventListener("click", trackButton);
//   }
// }
