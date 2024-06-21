/* global React ReactDOM */

const Categories = require("../../react/components/graphics/categories.js");

ReactDOM.hydrate(
  React.createElement(Categories, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
