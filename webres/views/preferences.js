/* global React ReactDOM */

const Preferences = require("../../react/components/preferences.js");

ReactDOM.hydrate(
  React.createElement(Preferences, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
