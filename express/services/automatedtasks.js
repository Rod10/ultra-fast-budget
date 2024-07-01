const assert = require("assert");
const moment = require("moment");

const {
  Account,
  PlannedTransaction,
  PlannedTransfer,
  Transaction,
  Transfer,
  sequelize,
  Sequelize,
} = require("../models/index.js");

const Runner = require("../utils/runner.js");
const TransactionTypes = require("../constants/transactiontype.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");

const {Op} = Sequelize;
const tasks = [];

const automatedSrv = {};

const transactionTypeConvert = {
  [TransactionTypes.EXPECTED_INCOME]: TransactionTypes.INCOME,
  [TransactionTypes.EXPECTED_EXPENSE]: TransactionTypes.EXPENSE,
  [TransactionTypes.EXPECTED_TRANSFERT]: TransactionTypes.TRANSFER,
};

const calculateTotalTransactionData = data => data.map(row => parseFloat(row.amount)).reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  0,
);

automatedSrv.plannedTransactions = async () => {
  const where = {
    [Op.and]: [
      {transactionDate: {[Op.gte]: new moment().startOf("date")}},
      {transactionDate: {[Op.lt]: new moment().endOf("date")}},
    ],
  };
  const plannedTransactions = await PlannedTransaction.findAndCountAll({
    where,
    include: [{
      association: PlannedTransaction.Account,
      include: [{association: Account.AccountType}],
    }],
  });
  console.log(plannedTransactions.rows)
  for (const plannedTransaction of plannedTransactions.rows) {
    logger.debug("Create transaction for user=[%s] with data=[%s]", plannedTransaction.userId, plannedTransaction);

    const account = await Account.findOne({
      where: {
        id: plannedTransaction.accountId,
        userId: plannedTransaction.userId,
      },
      include: [{association: Account.AccountType}],
    });
    let newAccountAmount = 0;

    if (plannedTransaction.type === TransactionTypes.INCOME || plannedTransaction.type === TransactionTypes.EXPECTED_INCOME) {
      newAccountAmount = account.balance + calculateTotalTransactionData(plannedTransaction.data);
      if (account.accountType.maxAmount > 0 && newAccountAmount > account.accountType.maxAmount) {
        newAccountAmount -= account.accountType.maxAmount;
        plannedTransaction.data = [];
      }
    } else if (plannedTransaction.type === TransactionTypes.EXPECTED_EXPENSE || plannedTransaction.type === TransactionTypes.EXPENSE) {
      newAccountAmount = account.balance - calculateTotalTransactionData(plannedTransaction.data);
    }
    await Transaction.create({
      userId: plannedTransaction.userId,
      accountId: plannedTransaction.accountId,
      data: plannedTransaction.data,
      to: plannedTransaction.to,
      other: plannedTransaction.other,
      transactionDate: new Date(),
      type: transactionTypeConvert[plannedTransaction.type],
    });
    account.balance = newAccountAmount;
    account.save();
    plannedTransaction.transactionDate = new moment().add(1, "months");
    plannedTransaction.save();
  }
};

automatedSrv.plannedTransfers = async () => {
  const cond = {
    transferDate: {
      [Op.and]: {
        [Op.gte]: new moment().startOf("date"),
        [Op.lt]: new moment().endOf("date"),
      },
    },
    deletedOn: {[Op.eq]: null},
  };

  const plannedTransfers = await PlannedTransfer.findAndCountAll({
    where: cond,
    include: [
      {
        association: PlannedTransfer.Sender,
        include: [{association: Account.AccountType}],
      },
      {
        association: PlannedTransfer.Receiver,
        include: [{association: Account.AccountType}],
      },
    ],
    order: [["transferDate", OrderDirection.ASC]],
  });

  for (const plannedTransfer of plannedTransfers.rows) {
    const accountReceiver = plannedTransfer.receiver;
    const accountSender = plannedTransfer.sender;
    const newBalanceReceiver = accountReceiver + parseFloat(plannedTransfer.amount);
    if (accountReceiver.accountType.maxAmount !== 0
      && newBalanceReceiver > accountReceiver.accountType.maxAmount) {
      const diff = newBalanceReceiver - accountReceiver.accountType.maxAmount;
      accountReceiver.balance += diff;
      accountSender.balance -= diff;
      plannedTransfer.deletedOn = new Date();
    } else {
      accountReceiver.balance += parseFloat(plannedTransfer.amount);
      newBalanceReceiver.balance -= parseFloat(plannedTransfer.amount);
    }
    plannedTransfer.transferDate = new moment().add(1, "months");
    accountReceiver.save();
    accountSender.save();
    plannedTransfer.save();
    await Transfer.create({
      userId: plannedTransfer.userId,
      senderId: plannedTransfer.senderId,
      receiverId: plannedTransfer.receiverId,
      amount: plannedTransfer.amount,
      other: plannedTransfer.other,
      transferDate: new Date(),
      occurence: plannedTransfer.occurence,
      unit: plannedTransfer.unit,
      number: plannedTransfer.number,
    });
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
