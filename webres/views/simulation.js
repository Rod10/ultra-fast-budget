/* global React ReactDOM */

const Simulation = require("../../react/components/stock/simulation.js");

ReactDOM.hydrate(
  React.createElement(Simulation, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
