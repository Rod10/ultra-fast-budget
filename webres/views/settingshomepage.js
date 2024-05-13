/* global React ReactDOM */

const Homepage = require("../../react/components/homepage.js");

ReactDOM.hydrate(
  React.createElement(Homepage, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
