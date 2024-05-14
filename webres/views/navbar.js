/* global React ReactDOM */
const Navbar = require("../../react/components/navbar.js");

ReactDOM.hydrate(
  React.createElement(Navbar, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("navbar"),
);
