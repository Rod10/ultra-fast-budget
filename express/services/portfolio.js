const assert = require("assert");
const Decimal = require("decimal.js");
const {
  Portfolio,
  Op,
} = require("../models/index.js");
const {logger} = require("./logger.js");
const {Account} = require("../models");

const portfolioSrv = {};

const getNewStocksTotalValue = stocks => stocks.reduce(
  (total, stock) => total.add(stock.investedAmount),
  new Decimal(0),
);

portfolioSrv.create = account => {
  logger.debug("Creating portfolio for account=[%s]", account.id);
  return Portfolio.create({
    accountId: account.id,
    monthlyContribution: 0,
    needDecide: false,
  });
};

portfolioSrv.getAll = userId => {
  logger.debug("Get All portfolio for user=[%s]", userId);
  return Portfolio.findAndCountAll({
    include: [{
      association: Portfolio.Account,
      where: {userId},
      include: [{association: Account.AccountType}],
    }],
  });
};

portfolioSrv.getById = (userId, portfolioId) => {
  logger.debug("Get portofio by id=[%s] and for user=[%s]", portfolioId, userId);
  return Portfolio.findOne({
    where: {id: portfolioId},
    include: [{
      association: Portfolio.Account,
      where: {userId},
    }],
  });
};

portfolioSrv.updateBalance = async (userId, portfolioId, stocks) => {
  logger.debug("Update balance for portfolio=[%s] for user=[%s] with=[%s]", portfolioId, userId, stocks);
  const newStocksTotalValue = getNewStocksTotalValue(stocks);
  const portfolio = await portfolioSrv.getById(userId, portfolioId);
  portfolio.account.balance -= newStocksTotalValue;
  portfolio.account.save();
};

module.exports = portfolioSrv;
