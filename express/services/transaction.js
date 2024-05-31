const assert = require("assert");
const df = require("dateformat");

const moment = require("moment");
const AccountsTypeFull = require("../constants/accountstypefull.js");

const {
  sequelize,
  Sequelize,
  Transaction,
  Op,
} = require("../models/index.js");
const {logger} = require("./logger.js");
const accountSrv = require("./account.js");

const transactionSrv = {};

transactionSrv.get = id => {
  logger.info("Get transaction by id=[%s]", id);
  return Transaction.findOne({where: {id}});
};

transactionSrv.getAllByUser = userId => {
  logger.debug("Get all transaction for user=[%s]", userId);

  assert(userId, "User Id cannot be null");

  return Transaction.findAndCountAll({
    where: {userId},
    include: [{
      association: Transaction.Account,
      // where: {userId},
    }],
  });
};

transactionSrv.getAllByAccount = accountId => {
  logger.debug("Get all transactions by account=[%s]", accountId);
  return Transaction.findAndCountAll({where: {accountId}});
};

transactionSrv.create = async (userId, transactionData) => {
  logger.debug("Create transaction for user=[%s] with data=[%s]", userId, transactionData);

  const transaction = await Transaction.create({
    userId,
    accountId: transactionData.account,
    data: transactionData.data,
    to: transactionData.to,
    other: transactionData.notes,
    transactionDate: new Date(transactionData.date),
    type: transactionData.type,
  });

  await accountSrv.updateData(userId, transaction.accountId, transaction);
};

transactionSrv.update = async (id, data) => {
  logger.debug("Edit transaction=[%s] with data=[%s]", id, data);

  await Transaction.update({
    data: data.data,
    to: data.to,
    other: data.notes,
    transactionDate: new Date(data.date),
  }, {where: {id}});

  const transactions = await transactionSrv.getAllByAccount(data.account);
  return accountSrv.rebalance(data.account, transactions);
};

transactionSrv.delete = async id => {
  logger.debug("Delete transaction=[%s]", id);
  const transaction = await transactionSrv.get(id);
  transaction.destroy({where: {id}});
  const transactions = await transactionSrv.getAllByAccount(transaction.accountId);
  return accountSrv.rebalance(transaction.accountId, transactions);
};

module.exports = transactionSrv;
