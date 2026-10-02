const Decimal = require("decimal.js");
const config = require("../utils/config.js");
const {
  Order,
  Portfolio,
  Stock,
  Op,
} = require("../models/index.js");
const Constants = require("../constants/constants.js");
const {logger} = require("./logger.js");

const orderSrv = {};

orderSrv.create = (portfolioId, order, type) => {
  logger.debug("Create order for portfolio=[%s] with data=[%s]", portfolioId, order);
  // TODO: Add Fees
  return Order.create({
    portfolioId,
    type,
    quantity: order.quantity,
    isin: order.isin,
    price: new Decimal(order.price).toFixed(Constants.DECIMAL),
    fees: 0,
    investedAmount: new Decimal(order.total).toFixed(Constants.DECIMAL),
  });
};

module.exports = orderSrv;
