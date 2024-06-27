/* global React ReactDOM */

const AccountTypeList = require("../../react/components/accounttype/accounttypelist.js");

ReactDOM.hydrate(
  React.createElement(AccountTypeList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
