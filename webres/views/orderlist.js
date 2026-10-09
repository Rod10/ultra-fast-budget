/* global React ReactDOM */

const OrderList = require("../../react/components/stock/orderlist.js");

ReactDOM.hydrate(
  React.createElement(OrderList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
