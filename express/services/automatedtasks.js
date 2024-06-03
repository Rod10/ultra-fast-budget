const assert = require("assert");
const moment = require("moment");

const {
  PlannedTransaction,
  Transaction,
  sequelize,
  Sequelize,
} = require("../models/index.js");

const Runner = require("../utils/runner.js");
const {Account} = require("../models");
const TransactionTypes = require("../constants/transactiontype");
const AccountsTypeFull = require("../constants/accountstypefull");
const {logger} = require("./logger");

const {Op} = Sequelize;
const tasks = [];

const automatedSrv = {};

const transactionTypeConvert = {
  [TransactionTypes.EXPECTED_INCOME]: TransactionTypes.INCOME,
  [TransactionTypes.EXPECTED_EXPENSE]: TransactionTypes.EXPENSE,
  [TransactionTypes.EXPECTED_TRANSFERT]: TransactionTypes.TRANSFER,
}

automatedSrv.plannedTransactions = async () => {
  const where = {
    [Op.and]: [
      {transactionDate: {[Op.gte]: new moment().startOf("date")}},
      {transactionDate: {[Op.lt]: new moment().endOf("date")}},
    ],
  };
  const plannedTransactions = await PlannedTransaction.findAndCountAll({where});

  for (const plannedTransaction of plannedTransactions.rows) {
    logger.debug("Create transaction for user=[%s] with data=[%s]", plannedTransaction.userId, plannedTransaction);
    const transaction = await Transaction.create({
      userId: plannedTransaction.userId,
      accountId: plannedTransaction.accountId,
      data: plannedTransaction.data,
      to: plannedTransaction.to,
      other: plannedTransaction.other,
      transactionDate: new Date(),
      type: transactionTypeConvert[plannedTransaction.type],
    });

    const account = await Account.findOne({where: {id: transaction.accountId, userId: transaction.userId}});
    let newAccountAmount = 0;

    if (transaction.data.type === TransactionTypes.INCOME || transaction.data.type === TransactionTypes.EXPECTED_INCOME) {
      newAccountAmount = account.balance + transaction.data.map(row => parseFloat(row.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
      assert(
        parseInt(newAccountAmount, 10) > AccountsTypeFull[account.type].maxAmount,
        "Balance cannot be more than the maximum amount allowed for an manual transaction",
      );
    } else if (transaction.data.type === TransactionTypes.EXPECTED_EXPENSE || transaction.data.type === TransactionTypes.EXPENSE) {
      newAccountAmount = account.balance - transaction.data.map(row => parseFloat(row.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    }
    account.balance = newAccountAmount;
    account.save();
    plannedTransaction.transactionDate = new moment().add(1, "months");
    plannedTransaction.save();
  }
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
