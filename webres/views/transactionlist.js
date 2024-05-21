/* global React ReactDOM */

const TransactionList = require("../../react/components/transaction/transactionlist.js");

ReactDOM.hydrate(
  React.createElement(TransactionList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
