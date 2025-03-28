const assert = require("assert");
const moment = require("moment");
const {
  sequelize,
  Sequelize,
  Budget,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const TransactionType = require("../constants/transactiontype.js");
const {logger} = require("./logger.js");
const transactionSrv = require("./transaction.js");

const budgetSrv = {};

budgetSrv.get = id => {
  logger.info("Get budget by id=[%s]", id);
  return Budget.findOne({where: {id}});
};

budgetSrv.getAllByUser = userId => {
  logger.debug("Get all budget for user=[%s]", userId);

  assert(userId, "User Id cannot be null");

  return Budget.findAndCountAll({
    where: {
      userId,
      creationDate: {
        [Op.and]: {
          [Op.gte]: new moment().startOf("month"),
          [Op.lt]: new moment().endOf("month"),
        },
      },
    },
    include: [{association: Budget.User}, {association: Budget.Category}],
    order: [["creationDate", OrderDirection.DESC]],
  });
};

budgetSrv.getAllByCategory = (categoryId, transaction) => {
  logger.debug("Get all budget by category=[%s]", categoryId);
  return Budget.findAndCountAll({
    where: {
      categoryId,
      creationDate: {
        [Op.and]: {
          [Op.gte]: new moment(transaction.transactionDate).startOf("month"),
          [Op.lt]: new moment(transaction.transactionDate).endOf("month"),
        },
      },
    },
  });
};

budgetSrv.create = async (user, budgetData) => {
  logger.debug("Create budget for user=[%s] and data=[%s]", user.id, budgetData);

  const transactionsRaw = await transactionSrv.getAllByUserAndCategory(
    user.id,
    budgetData.category,
    {
      unit: budgetData.unit,
      isPlanned: null,
    },
  );
  let transactions = transactionsRaw.rows
    .map(transaction => transaction.data
      .map(data => parseInt(data.category.id, 10) === parseInt(budgetData.category, 10)
        && data)[0]);
  transactions = transactions.filter(transaction => transaction !== false);
  for (const data of budgetData.data) {
    const transactionsFiltered = transactions
      .filter(row => row.subCategory.id === data.subCategory.id);
    const amount = transactionsFiltered.map(row => parseFloat(row.amount))
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    data.amount += amount;
  }
  budgetData.totalAmount = budgetData.data.map(data => parseFloat(data.amount))
    .reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

  return Budget.create({
    userId: user.id,
    categoryId: budgetData.category,
    name: budgetData.name,
    totalAllocatedAmount: budgetData.totalAllocatedAmount,
    totalAmount: budgetData.totalAmount,
    duration: budgetData.duration,
    unit: budgetData.unit,
    data: budgetData.data,
  });
};

budgetSrv.update = (oldBudget, newBudget) => {
  logger.debug("Updating budget=[%s]", oldBudget.id);

  const newData = newBudget.data.map(data => ({
    amount: oldBudget.data.find(old => old.subCategory.id === data.subCategory.id)?.amount || 0,
    totalAmount: data.totalAmount,
    subCategory: oldBudget.data.find(old => old.subCategory.id === data.subCategory.id)?.subCategory || data.subCategory,
  }));

  return Budget.update({
    name: newBudget.name,
    categoryId: newBudget.category,
    totalAllocatedAmount: newBudget.totalAllocatedAmount,
    duration: newBudget.duration,
    unit: newBudget.unit,
    data: newData,
  }, {where: {id: oldBudget.id}});
};

budgetSrv.delete = id => {
  logger.debug("Deleting budget=[%s]", id);
  return Budget.destroy({where: {id}});
};

budgetSrv.updateAmount = async (user, transaction) => {
  logger.debug("Updating amount for budget");
  for (const row of transaction.data) {
    const budgets = await budgetSrv.getAllByCategory(row.category.id, transaction);
    for (const budget of budgets.rows) {
      const newData = [...budget.data];
      const index = budget.data.findIndex(data => data.subCategory.id === row.subCategory.id);
      newData[index].amount += parseFloat(row.amount);
      budget.data = newData;
      budget.totalAmount += parseFloat(row.amount);
      budget.save();
    }
  }
};

budgetSrv.recalculate = async user => {
  logger.debug("Recalutate all amount for all budget for user=[%s]", user.id);

  const budgets = await budgetSrv.getAllByUser(user.id);
  for (const budget of budgets.rows) {
    const newBudgetData = [...budget.data];
    for (const newBudget of newBudgetData) {
      newBudget.amount = 0;
    }
    const transactions = await transactionSrv.getAllByUserAndRange(user.id, {unit: budget.unit, type: TransactionType.EXPENSE, isPlanned: null});
    for (const transaction of transactions.rows) {
      for (const data of transaction.data) {
        if (data.category.id === budget.categoryId) {
          const index = newBudgetData.findIndex(budgetData => budgetData.subCategory.id === data.subCategory.id);
          newBudgetData[index].amount += parseFloat(data.amount);
        }
      }
    }
    budget.totalAmount = newBudgetData.reduce(
      (accumulator, currentValue) => accumulator + parseFloat(currentValue.amount),
      0,
    );
    newBudgetData.data = newBudgetData;
    budget.save();
  }
};

budgetSrv.search = (user, query) => {
  logger.debug("Search budget for user=[%s] with query=[%s]", user.id, query);
  const where = {[Op.and]: [{userId: user.id}]};
  const condition = where[Op.and][0];

  if ("period" in query) {
    if (query.period === "now") {
      condition.creationDate = {
        [Op.between]: [
          new moment().startOf("month"),
          new moment().endOf("month"),
        ],
      };
    } else if (query.period === "last") {
      condition.creationDate = {
        [Op.between]: [
          new moment().subtract(1, "month")
            .startOf("month"),
          new moment().subtract(1, "month")
            .endOf("month"),
        ],
      };
    } else if (query.period === "between") {
      condition.creationDate = {
        [Op.between]: [
          new moment(query.startingDate).startOf("month"),
          new moment(query.endingDate).endOf("month"),
        ],
      };
    } else if (query.period === "exact") {
      condition.creationDate = {
        [Op.between]: [
          new moment(query.date).startOf("month"),
          new moment(query.date).endOf("month"),
        ],
      };
    }
  }

  if ("date" in query) {
    condition.creationDate = {
      [Op.between]: [
        new moment(query.date).startOf("month"),
        new moment(query.date).endOf("month"),
      ],
    };
  }
  if ("category" in query) {
    condition.categoryId = query.category.id;
  }

  const dataConditions = [];
  if ("subCategory" in query) {
    dataConditions.push({[Op.like]: `%"subCategory":{"id":${query.subCategory.id},%`});
  }
  if (dataConditions.length) where.data = {[Op.and]: dataConditions};

  return Budget.findAndCountAll({
    where,
    include: [{association: Budget.User}, {association: Budget.Category}],
    order: [["creationDate", OrderDirection.DESC]],
  });
};

module.exports = budgetSrv;
