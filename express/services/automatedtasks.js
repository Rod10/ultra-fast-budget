const moment = require("moment");

const {
  PlannedTransaction,
  Transaction,
  sequelize,
  Sequelize,
} = require("../models/index.js");

const Runner = require("../utils/runner.js");

const {Op} = Sequelize;
const tasks = [];

const automatedSrv = {};

automatedSrv.plannedTransactions = async () => {
  const todayDate = new moment("2024-05-31T10");
  console.log(todayDate.subtract("10", "hours"));
  console.log(todayDate.add("24", "hours"));
  const where = {
    [Op.and]: [
      {transactionDate: {[Op.gte]: todayDate.subtract("10", "hours")}},
      {transactionDate: {[Op.lt]: todayDate.add("24", "hours")}},
    ],
  };
  const plannedTransactions = await PlannedTransaction.findAndCountAll({where});
  console.log(plannedTransactions);
};

automatedSrv.run = (cronDefinition, fn, name) => {
  tasks.push(new Runner(cronDefinition, fn, name));
};

automatedSrv.stop = () => {
  let task;
  while ((task = tasks.pop())) {
    task.stop();
  }
};

module.exports = automatedSrv;
