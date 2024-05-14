/* global React ReactDOM */

const CategoryList = require("../../react/components/categorylist.js");

ReactDOM.hydrate(
  React.createElement(CategoryList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
