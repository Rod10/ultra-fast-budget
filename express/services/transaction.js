const assert = require("assert");
const moment = require("moment");
const {
  sequelize,
  Sequelize,
  Transaction,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");
const accountSrv = require("./account.js");
const TransactionType = require("../constants/transactiontype");

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
    order: [["transactionDate", OrderDirection.DESC]],
  });
};

transactionSrv.getAllByAccount = accountId => {
  logger.debug("Get all transactions by account=[%s]", accountId);
  return Transaction.findAndCountAll({
    where: {accountId},
    order: [["transactionDate", OrderDirection.DESC]],
  });
};

transactionSrv.getAllByAccountAndRange = (accountId, query) => {
  logger.debug("Get all transactions by account=[%s]", accountId);
  const where = {[Op.and]: [{accountId}]};
  const condition = where[Op.and][0];
  if (query.unit) {
    condition.transactionDate = {
      [Op.and]: {
        [Op.gte]: new moment().subtract(query.number, query.unit)
          .startOf(query.unit),
        [Op.lt]: new moment(),
      },
    };
  }
  return Transaction.findAndCountAll({
    where,
    order: [["transactionDate", OrderDirection.DESC]],
  });
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
  const transactions = await transactionSrv.getAllByAccount(transaction.accountId);
  await accountSrv.rebalance(transaction.accountId, transactions);
  return transaction;
};

transactionSrv.update = async (id, data) => {
  logger.debug("Edit transaction=[%s] with data=[%s]", id, data);

  const transaction = await Transaction.update({
    data: data.data,
    to: data.to,
    other: data.notes,
    transactionDate: new Date(data.date),
  }, {where: {id}});

  const transactions = await transactionSrv.getAllByAccount(data.account);
  await accountSrv.rebalance(data.account, transactions);
  return transaction;
};

transactionSrv.delete = async id => {
  logger.debug("Delete transaction=[%s]", id);
  const transaction = await transactionSrv.get(id);
  transaction.destroy({where: {id}});
  const transactions = await transactionSrv.getAllByAccount(transaction.accountId);
  return accountSrv.rebalance(transaction.accountId, transactions);
};

transactionSrv.getAllByUserAndCategory = (userId, categoryId, query = {}) => {
  logger.debug("Get all transactions by user=[%s] and category=[%s]", userId, categoryId);

  const where = {[Op.and]: [{userId}]};
  const condition = where[Op.and][0];
  condition.data = {[Op.like]: `%${categoryId}%`};
  if (query.unit) {
    condition.transactionDate = {
      [Op.and]: {
        [Op.gte]: new moment().startOf(query.unit),
        [Op.lt]: new moment().endOf(query.unit),
      },
    };
  }
  return Transaction.findAndCountAll({where});
};

transactionSrv.getAllByUserAndRange = (userId, query) => {
  logger.debug("Get all transactions by user=[%s] and category=[%s]", userId);

  const where = {[Op.and]: [{userId}]};
  const condition = where[Op.and][0];
  if (query.unit) {
    if (query.range === "last") {
      condition.transactionDate = {
        [Op.and]: {
          [Op.gte]: new moment().subtract(1, query.unit)
            .startOf(query.unit),
          [Op.lt]: new moment().subtract(1, query.unit)
            .endOf(query.unit),
        },
      };
    } else if (query.range === "seventh") {
      condition.transactionDate = {
        [Op.and]: {
          [Op.gte]: new moment().subtract(6, query.unit)
            .startOf(query.unit),
          [Op.lt]: new moment().endOf(query.unit),
        },
      };
    } else {
      condition.transactionDate = {
        [Op.and]: {
          [Op.gte]: new moment().startOf(query.unit),
          [Op.lt]: new moment().endOf(query.unit),
        },
      };
    }
  }

  return Transaction.findAndCountAll({
    where,
    include: [{association: Transaction.Account}],
    order: [["transactionDate", OrderDirection.DESC]],
  });
};

module.exports = transactionSrv;
