/* global React ReactDOM */

const Order = require("../../react/components/stock/order.js");

ReactDOM.hydrate(
  React.createElement(Order, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
