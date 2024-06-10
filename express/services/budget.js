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
    include: [{association: Budget.User}, {association: Budget.Category}],
    order: [["creationDate", OrderDirection.DESC]],
  });
};

budgetSrv.getAllByCategory = category => {
  logger.debug("Get all budget by category=[%s]", category);
};

budgetSrv.create = (user, budgetData) => {
  logger.debug("Create budget for user=[%s] and data=[%s]", user.id, budgetData);

  return Budget.create({
    userId: user.id,
    categoryId: budgetData.category,
    name: budgetData.name,
    totalAllocatedAmount: budgetData.totalAllocatedAmount,
    totalAmount: 0,
    duration: budgetData.duration,
    unit: budgetData.unit,
    data: budgetData.data,
  });
};

module.exports = budgetSrv;
