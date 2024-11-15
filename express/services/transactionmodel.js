const assert = require("assert");
const moment = require("moment");
const {
  sequelize,
  Sequelize,
  TransactionModel,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const TransactionModelType = require("../constants/transactiontype");
const TransactionModelTypes = require("../constants/transactiontype");
const AccountTypes = require("../constants/accountstype");
const accountSrv = require("./account.js");
const {logger} = require("./logger.js");

const transactionSrv = {};

transactionSrv.get = id => {
  logger.info("Get transaction by id=[%s]", id);
  return TransactionModel.findOne({where: {id}});
};

transactionSrv.getAllByUser = userId => {
  logger.debug("Get all transaction for user=[%s]", userId);

  assert(userId, "User Id cannot be null");

  return TransactionModel.findAndCountAll({
    where: {userId},
    include: [{
      association: TransactionModel.Account,
      // where: {userId},
    }],
    order: [["transactionDate", OrderDirection.DESC]],
  });
};

transactionSrv.getAllByAccount = accountId => {
  logger.debug("Get all transactions by account=[%s]", accountId);
  return TransactionModel.findAndCountAll({
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
  return TransactionModel.findAndCountAll({
    where,
    order: [["transactionDate", OrderDirection.DESC]],
  });
};

transactionSrv.create = (userId, transactionData) => {
  logger.debug("Create transaction for user=[%s] with data=[%s]", userId, transactionData);
  return TransactionModel.create({
    userId,
    accountId: transactionData.account,
    name: transactionData.name,
    data: transactionData.data,
    to: transactionData.to,
    other: transactionData.notes,
    type: transactionData.type,
  });
};

transactionSrv.update = async (id, data) => {
  logger.debug("Edit transaction=[%s] with data=[%s]", id, data);

  return TransactionModel.update({
    name: data.name,
    data: data.data,
    to: data.to,
    other: data.notes,
  }, {where: {id}});
};

transactionSrv.delete = async id => {
  logger.debug("Delete transaction=[%s]", id);
  const transaction = await transactionSrv.get(id);
  return transaction.destroy({where: {id}});
};

transactionSrv.getAllByUserAndCategory = (userId, categoryId, query = {}) => {
  logger.debug("Get all transactions by user=[%s] and category=[%s]", userId, categoryId);

  const where = {[Op.and]: [{userId}]};
  const condition = where[Op.and][0];
  condition.data = {[Op.like]: `%${categoryId}%`};
  return TransactionModel.findAndCountAll({where});
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

  if (q.account) {
    where.accountId = parseInt(q.account, 10);
  }

  if (q.name) {
    where.name = q.name;
  }

  if (q.genre) {
    where.type = q.genre;
  }
  const dataConditions = [];
  if (q.category) {
    dataConditions.push({[Op.like]: `%{"category":{"id":${q.category},%`});
    if (q.subCategory) {
      dataConditions.push({[Op.like]: `%"subCategory":{"id":${q.subCategory},%`});
    }
  }
  if (dataConditions.length) where.data = {[Op.and]: dataConditions};

  const docs = await TransactionModel.findAndCountAll({
    where,
    include: [{association: TransactionModel.Account}],
    order: [["transactionDate", OrderDirection.DESC]],
    offset: (q.limit && q.page) ? q.limit * q.page : 0,
    limit: q.limit,
    subQuery: false,
  });
  return docs;
};

module.exports = transactionSrv;
