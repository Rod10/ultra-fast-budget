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

transactionSrv.create = (userId, transactionData) => {
  logger.debug("Create transaction for user=[%s] with data=[%s]", userId, transactionData);

  return Transaction.create({
    userId,
    data: transactionData.data,
    to: transactionData.to,
    other: transactionData.notes,
    // transactionDate: transactionData.date,
    type: transactionData.type,
  });
};

module.exports = transactionSrv;
