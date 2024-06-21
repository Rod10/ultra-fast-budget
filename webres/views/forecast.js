/* global React ReactDOM */

const Forecast = require("../../react/components/graphics/forecast.js");

ReactDOM.hydrate(
  React.createElement(Forecast, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
