const {
  sequelize,
  Sequelize,
  Account,
  Op,
} = require("../models/index.js");
const {logger} = require("./logger.js");

const accountSrv = {};

accountSrv.create = (userId, data) => {
  logger.debug("Create account with data=[%s] for user=[%s]", data, userId);

  return Account.create({
    userId,
    name: data.name,
    currency: data.currency,
    type: data.type,
    initialBalance: data.initialBalance,
    balance: data.initialBalance,
  });
};

accountSrv.get = id => {
  logger.debug("Get account by id=[%s]", id);
  return Account.findOne({where: {id}});
};

accountSrv.getAllByUser = userId => {
  logger.debug("Get all accounts for userId=[%s]", userId);
  return Account.findAndCountAll({where: {userId}});
};

/**
 * update the account with the data provided
 * @param {number} userId - The user Id
 * @param {object} account - The account that need to me modified
 * @param {object} data - The new data
 */
accountSrv.updateData = (userId, account, data) => {
  logger.debug("Update user=[%s] account with data=[%s]", userId, data);
  // TODO: recalculate balance with all the transactions
  account.set(data);
  return account.save();
};

module.exports = accountSrv;
