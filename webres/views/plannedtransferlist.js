/* global React ReactDOM */

const PlannedTransferList = require("../../react/components/plannedtransferlist.js");

ReactDOM.hydrate(
  React.createElement(PlannedTransferList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
