const assert = require("assert");
const Decimal = require("decimal.js");
const {
  Portfolio,
  Op,
} = require("../models/index.js");
const {logger} = require("./logger.js");

const portfolioSrv = {};

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
    }],
  });
};

portfolioSrv.getById = (userId, portfolioId) => {
  logger.debug("Get portofio by id=[%s] and for user=[%s]", portfolioId, userId);
  return Portfolio.findAndCountAll({
    include: [{
      association: Portfolio.Account,
      where: {
        userId,
        id: portfolioId,
      },
    }],
  });
};

module.exports = portfolioSrv;
