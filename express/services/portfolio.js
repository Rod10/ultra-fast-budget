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
    monthlyContribution : 0,
    needDecide: false,
  });
};

module.exports = portfolioSrv;
