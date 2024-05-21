const assert = require("assert");

const AccountsTypeFull = require("../constants/accountstypefull.js");

const {
  sequelize,
  Sequelize,
  Transaction,
  Op,
} = require("../models/index.js");
const {logger} = require("./logger.js");

const transactionSrv = {};

transactionSrv.getAllByUser = userId => {
  logger.debug("Get all transaction for user=[%s]", userId);

  assert(userId, "User Id cannot be null");

  return Transaction.findAndCountAll({where: {userId}});
};

module.exports = transactionSrv;
