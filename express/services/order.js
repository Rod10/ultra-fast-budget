const Decimal = require("decimal.js");
const {
  Order,
  Portfolio,
} = require("../models/index.js");
const Constants = require("../constants/constants.js");
const {logger} = require("./logger.js");
const {Account} = require("../models");
const OrderDirection = require("../constants/orderdirection");

const orderSrv = {};

orderSrv.create = (portfolioId, order, type) => {
  logger.debug("Create order for portfolio=[%s] with data=[%s]", portfolioId, order);

  return Order.create({
    portfolioId,
    type,
    quantity: order.quantity,
    isin: order.isin,
    price: order.price ? new Decimal(order.price).toFixed(Constants.DECIMAL) : null,
    fees: order.fees ? new Decimal(order.fees).toFixed(Constants.DECIMAL) : null,
    investedAmount: new Decimal(order.investedAmount).toFixed(Constants.DECIMAL),
    receivedAt: order.receivedAt,
  });
};

orderSrv.getAll = (userId, query) => {
  logger.debug("Get all order from user=[%s] with query=[%s]", userId, query);

  return Order.findAndCountAll({
    include: [
      {
        association: Order.Portfolio,
        include: [
          {
            association: Portfolio.Account,
            where: {userId},
          },
        ],
      },
    ],
    order: [["receivedAt", OrderDirection.DESC]],
    offset: (query.limit && query.page) ? query.limit * query.page : 0,
    limit: query.limit,
    subQuery: false,
  });
};

orderSrv.getAllByPortfolion = (userId, portfolioId, query) => {
  logger.debug("Get all order from user=[%s]", userId);

  return Order.findAndCountAll({
    were: {portfolioId},
    include: [
      {
        association: Portfolio.Account,
        where: {userId},
      },
    ],
    offset: (query.limit && query.page) ? query.limit * query.page : 0,
    limit: query.limit,
    subQuery: false,
  });
};

module.exports = orderSrv;
