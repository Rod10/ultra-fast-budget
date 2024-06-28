const assert = require("assert");
const df = require("dateformat");

const moment = require("moment");
const AccountsTypeFull = require("../constants/accountstypefull.js");

const {
  sequelize,
  Sequelize,
  Account,
  PlannedTransaction,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");
const accountSrv = require("./account.js");

const plannedTransactionSrv = {};

plannedTransactionSrv.get = id => {
  logger.info("Get transaction by id=[%s]", id);
  return PlannedTransaction.findOne({where: {id}});
};

plannedTransactionSrv.getAllByUser = (userId, query) => {
  logger.debug("Get all transaction for user=[%s]", userId);

  assert(userId, "User Id cannot be null");

  const cond = {userId};

  if (query.accountId) {
    cond.accountId = query.accountId;
  }

  if (query.endingDate) {
    cond.transactionDate = {
      [Op.between]: [
        new Date(query.startDate),
        new Date(query.endingDate),
      ],
    };
  }

  return PlannedTransaction.findAndCountAll({
    where: cond,
    include: [{
      association: PlannedTransaction.Account,
      include: [{association: Account.AccountType}],
    }],
    order: [["transactionDate", OrderDirection.ASC]],
  });
};

plannedTransactionSrv.getAllByAccount = accountId => {
  logger.debug("Get all transactions by account=[%s]", accountId);
  return PlannedTransaction.findAndCountAll({where: {accountId}});
};

plannedTransactionSrv.create = async (userId, transactionData) => {
  logger.debug("Create transaction for user=[%s] with data=[%s]", userId, transactionData);

  return PlannedTransaction.create({
    userId,
    accountId: transactionData.account,
    data: transactionData.data,
    to: transactionData.to,
    other: transactionData.notes,
    transactionDate: new Date(transactionData.date),
    type: transactionData.type,
    occurence: transactionData.occurence,
    unit: transactionData.unit,
    number: transactionData.number,
  });
};

plannedTransactionSrv.update = async (id, data) => {
  logger.debug("Edit transaction=[%s] with data=[%s]", id, data);

  return PlannedTransaction.update({
    data: data.data,
    to: data.to,
    other: data.notes,
    transactionDate: new Date(data.date),
  }, {where: {id}});
};

plannedTransactionSrv.delete = async id => {
  logger.debug("Delete transaction=[%s]", id);
  const transaction = await plannedTransactionSrv.get(id);
  return transaction.destroy({where: {id}});
};

module.exports = plannedTransactionSrv;
