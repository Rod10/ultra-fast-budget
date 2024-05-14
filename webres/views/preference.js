/* global React ReactDOM */

const Preference = require("../../react/components/preference.js");

ReactDOM.hydrate(
  React.createElement(Preference, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
