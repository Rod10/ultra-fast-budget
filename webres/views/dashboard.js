/* global React ReactDOM */

const Dashboard = require("../../react/components/stock/dashboard.js");

ReactDOM.hydrate(
  React.createElement(Dashboard, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
