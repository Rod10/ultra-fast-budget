const assert = require("assert");
const moment = require("moment");
const {
  sequelize,
  Sequelize,
  Transaction,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const TransactionType = require("../constants/transactiontype");
const TransactionTypes = require("../constants/transactiontype");
const AccountTypes = require("../constants/accountstype");
const accountSrv = require("./account.js");
const {logger} = require("./logger.js");

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

  const account = await accountSrv.get(userId, transactionData.account);
  if (transactionData.type === TransactionTypes.INCOME || transactionData.type === TransactionTypes.EXPECTED_INCOME) {
    account.balance += transactionData.data.map(row => parseFloat(row.amount)).reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
    assert(
      (parseInt(account.balance, 10) > account.accountType.maxAmount)
      && (account.accountType.type === AccountTypes.WALLET || account.accountType.type === AccountTypes.COURANT),
      "Balance cannot be more than the maximum amount allowed for an manual transaction",
    );
  } else if (transactionData.type === TransactionTypes.EXPECTED_EXPENSE || transactionData.type === TransactionTypes.EXPENSE) {
    account.balance -= transactionData.data.map(row => parseFloat(row.amount)).reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
  }
  account.save();
  return Transaction.create({
    userId,
    accountId: transactionData.account,
    data: transactionData.data,
    to: transactionData.to,
    other: transactionData.notes,
    transactionDate: new Date(transactionData.date),
    type: transactionData.type,
  });
};

transactionSrv.update = async (id, userId, data, transfers) => {
  logger.debug("Edit transaction=[%s] with data=[%s]", id, data);

  const transaction = await Transaction.update({
    data: data.data,
    to: data.to,
    other: data.notes,
    transactionDate: new Date(data.date),
  }, {where: {id, userId}});
  const transactions = await transactionSrv.getAllByAccount(data.account);
  await accountSrv.rebalance(userId, data.account, transactions, transfers);
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
  if ("isPlanned" in query) {
    condition.isPlanned = query.isPlanned;
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
    } else if (query.range === "month") {
      condition.transactionDate = {
        [Op.between]: [
          new moment().startOf("month"),
          new moment().endOf("month"),
        ],
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

  if ("type" in query) {
    condition.type = query.type;
  }

  if ("isPlanned" in query) {
    condition.isPlanned = query.isPlanned;
  }

  return Transaction.findAndCountAll({
    where,
    include: [{association: Transaction.Account}],
    order: [["transactionDate", OrderDirection.DESC]],
  });
};

transactionSrv.search = async (user, query) => {
  logger.debug(
    "Search transaction for user=[%s] and query=[%j]",
    user,
    query,
  );
  assert(user, "Missing user");
  const q = {
    limit: 15,
    page: 0,
    ...query,
  };
  const where = {
    userId: user.id,
    data: {[Op.ne]: null},
    deletedOn: {[Op.eq]: null},
  };
  if (q.startingDate) {
    const d = new Date(q.startingDate);
    const f = new Date(q.endingDate);
    where.transactionDate = {
      [Op.and]: {
        [Op.gte]: d,
        [Op.between]: [
          new moment(d).add(1, "day"),
          new moment(f).add(1, "day"),
        ],
      },
    };
  } else if (q.year) {
    console.log(new moment().year(q.year).startOf("year"));
    console.log(new moment().year(q.year).endOf("year"));
    where.transactionDate = {
      [Op.and]: {
        [Op.gte]: new moment().year(q.year).startOf("year"),
        [Op.between]: [
          new moment().year(q.year).startOf("year"),
          new moment().year(q.year).endOf("year"),
        ],
      },
    };
  }

  if (q.account) {
    where.accountId = parseInt(q.account, 10);
  }

  if ("genre" in query) {
    where.type = query.genre;
  }

  if ("type" in query) {
    where.type = query.type;
  }

  if ("isPlanned" in query) {
    where.isPlanned = query.isPlanned === "null" ? null : 1;
  }
  const dataConditions = [];
  if (q.category) {
    dataConditions.push({[Op.like]: `%{"category":{"id":${q.category},%`});
    if (q.subCategory) {
      dataConditions.push({[Op.like]: `%"subCategory":{"id":${q.subCategory},%`});
    }
  }
  if (dataConditions.length) where.data = {[Op.and]: dataConditions};

  const docs = await Transaction.findAndCountAll({
    where,
    include: [{association: Transaction.Account}],
    order: [["transactionDate", OrderDirection.DESC]],
    subQuery: false,
  });
  return docs;
};

module.exports = transactionSrv;
