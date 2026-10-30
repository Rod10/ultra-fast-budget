const Decimal = require("decimal.js");
const moment = require("moment");
const {
  Account,
  Order,
  Op,
  Portfolio,
} = require("../models/index.js");
const Constants = require("../constants/constants.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");

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
    side: order.side ?? null,
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
    where: {portfolioId},
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

orderSrv.getAllByPortfolioForSnapshot = (userId, portfolioId, year) => {
  logger.debug("Get all order from user=[%s] and portfolio=[%s]", userId, portfolioId);
  const where = {[Op.and]: [{portfolioId}]};
  const condition = where[Op.and][0];

  if (year) {
    condition.receivedAt = {
      [Op.between]: [
        new moment(year).startOf("year"),
        new moment(year).endOf("year"),
      ],
    };
  }

  return Order.findAndCountAll({
    where,
    include: [
      {
        association: Order.Portfolio,
        include: [
          {
            association: Portfolio.Account,
            where: {userId},
            required: true,
          },
        ],
        required: true,
      },
    ],
    order: [["receivedAt", OrderDirection.ASC]],
  });
};

module.exports = orderSrv;
