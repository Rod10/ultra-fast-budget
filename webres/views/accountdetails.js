/* global React ReactDOM */

const AccountDetails = require("../../react/components/accountdetails.js");

ReactDOM.hydrate(
  React.createElement(AccountDetails, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
