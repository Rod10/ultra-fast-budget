/* global React ReactDOM */

const PlannedTransactionList = require("../../react/components/transaction/plannedtransactionlist.js");

ReactDOM.hydrate(
  React.createElement(PlannedTransactionList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
