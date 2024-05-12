/* global React ReactDOM */

const AccountList = require("../../react/components/accountlist.js");

ReactDOM.hydrate(
  React.createElement(AccountList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
