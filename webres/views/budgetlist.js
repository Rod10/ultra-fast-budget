/* global React ReactDOM */

const BudgetList = require("../../react/components/budget/budgetlist.js");

ReactDOM.hydrate(
  React.createElement(BudgetList, {
    ...window.data,
    ...window.edwinData,
  }),
  document.getElementById("reactRoot"),
);
