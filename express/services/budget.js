const assert = require("assert");
const {
  sequelize,
  Sequelize,
  Budget,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");

const budgetSrv = {};

budgetSrv.get = id => {
  logger.info("Get budget by id=[%s]", id);
  return Budget.findOne({where: {id}});
};

budgetSrv.getAllByUser = userId => {
  logger.debug("Get all budget for user=[%s]", userId);

  assert(userId, "User Id cannot be null");

  return Budget.findAndCountAll({
    where: {userId},
    include: [{association: Budget.User}],
    order: [["creationDate", OrderDirection.DESC]],
  });
};

budgetSrv.getAllByCategory = category => {
  logger.debug("Get all budget by category=[%s]", category);
};

module.exports = budgetSrv;
