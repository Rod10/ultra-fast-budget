/* global React ReactDOM */

const SettingsHomepage = require("../../react/components/settingshomepage.js");

ReactDOM.hydrate(
  React.createElement(SettingsHomepage, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
