const OrderType = require("./ordertype.js");

const OrderTypesFull = {
  [OrderType.ORDER]: {
    name: "Ordre",
    type: "ORDER",
  },
  [OrderType.DEPOSIT]: {
    name: "Dépot",
    type: "DEPOSIT",
  },
  [OrderType.DIVIDEND]: {
    name: "Divivende",
    type: "DIVIDEND",
  },
  [OrderType.INTEREST]: {
    name: "Interêt",
    type: "INTEREST",
  },
  [OrderType.WITHDRAW]: {
    name: "Retrait",
    type: "WITHDRAW",
  },
};

module.exports = OrderTypesFull;
