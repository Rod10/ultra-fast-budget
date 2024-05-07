/* global React ReactDOM */

const Navbar = require("../../react/components/navbar.js");

ReactDOM.hydrate(
  React.createElement(Navbar, window.edwinData || window.data),
  document.getElementById("navbar"),
);
