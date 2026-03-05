const assert = require("assert");
const Decimal = require("decimal.js");
const {
  Account,
  Op,
} = require("../models/index.js");
const TransactionTypes = require("./../constants/transactiontype.js");
const {logger} = require("./logger.js");

const accountSrv = {};

/**
 * Create a new account
 * @param {int} userId - ID of the user
 * @param {object} data - data of user
 * @param {string} data.name - name of the account
 * @param {string} data.currency - Currency of the account
 * @param {string} data.type - Type of the account
 * @param {string} data.initialBalance - Initial balance of the account
 * @param {object} accountType - Account Type instance
 * @returns {object} account - Account instance
 */
accountSrv.create = (userId, data, accountType) => {
  logger.debug("Create account with data=[%s] for user=[%s] and accountType=[%s]", data, userId, accountType.id);

  return Account.create({
    userId,
    name: data.name,
    currency: data.currency,
    accountTypeId: accountType.id,
    initialBalance: new Decimal(data.initialBalance).toFixed(2),
    balance: new Decimal(data.initialBalance).toFixed(2),
  });
};

accountSrv.get = (userId, id) => {
  logger.debug("Get account by id=[%s] for user=[%s]", id, userId);
  return Account.findOne({
    where: {id, userId},
    include: [{association: Account.AccountType}],
  });
};

accountSrv.getAllByUser = userId => {
  logger.debug("Get all accounts for userId=[%s]", userId);
  return Account.findAndCountAll({
    where: {
      userId,
      deletedOn: {[Op.eq]: null},
    },
    include: [{
      association: Account.AccountType,
      where: {deletedOn: {[Op.eq]: null}},
    }],
  });
};

/**
 * update the account with the data provided
 * @param {number} userId - The user Id
 * @param {number} accountId - The account that need to me modified
 * @param {object} data - The transaction data
 * @param {number} accountTypeId - The transaction data
 */
accountSrv.updateData = (userId, accountId, data, accountTypeId) => {
  logger.debug("Update user=[%s] account=[%s] with data=[%s]", userId, accountId, data);
  assert(userId, "UserId cannot be null");
  assert(accountId, "AccountId cannot be null");
  assert(data, "Data cannot be null");
  assert(accountTypeId, "accountTypeId cannot be null");
  return Account.update(
    {
      name: data.name,
      accountTypeId,
      currency: data.currency,
      initialBalance: new Decimal(data.initialBalance).toFixed(2),
    },
    {where: {id: accountId, userId}},
  );
};

accountSrv.update = (userId, accountId, data) => {
  logger.debug("Update user account=[%s]", accountId);
  return Account.update(
    {balance: data.balance},
    {
      where: {
        id: accountId,
        userId,
      },
    },
  );
};

accountSrv.rebalance = async (userId, accountId, transactions, transfers) => {
  logger.debug("Rebalance account=[%s]", accountId);
  const account = await accountSrv.get(userId, accountId);
  let newAccountBalance = new Decimal(account.initialBalance);

  for (const transaction of transactions.rows) {
    const total = transaction.data
      .map(row => new Decimal(row.amount))
      .reduce(
        (acc, val) => acc.plus(val),
        new Decimal(0),
      );

    if (
      transaction.type === TransactionTypes.INCOME
      || transaction.type === TransactionTypes.EXPECTED_INCOME
      || transaction.type === TransactionTypes.INTEREST
    ) {
      newAccountBalance = newAccountBalance.plus(total);
    } else if (
      transaction.type === TransactionTypes.EXPECTED_EXPENSE
      || transaction.type === TransactionTypes.EXPENSE
    ) {
      newAccountBalance = newAccountBalance.minus(total);
    }
  }

  if (transfers) {
    for (const transfer of transfers) {
      if (account.id === transfer.receiverId) {
        newAccountBalance += new Decimal(transfer.amount);
      } else if (account.id === transfer.senderId) {
        newAccountBalance -= new Decimal(transfer.amount);
      }
    }
  }

  account.balance = newAccountBalance.toFixed(2); // 👈 important
  await account.save();
};

accountSrv.rebalanceTransfer = async (userId, senderId, receiverId, transfers) => {
  logger.debug("Rebalance account=[%s] and [%s] for transfer", senderId, receiverId);
  const sender = await accountSrv.get(userId, senderId);
  let newSenderAccountBalance = new Decimal(sender.balance);
  for (const transfer of transfers.rows) {
    newSenderAccountBalance -= new Decimal(transfer.amount);
  }
  sender.balance = newSenderAccountBalance.toFixed(2);
  sender.save();

  const receiver = await accountSrv.get(userId, receiverId);
  let newReceiverAccountBalance = new Decimal(receiver.balance);
  for (const transfer of transfers.rows) {
    newReceiverAccountBalance += new Decimal(transfer.amount);
  }
  receiver.balance = newReceiverAccountBalance.toFixed(2);
  receiver.save();
};

accountSrv.delete = (userId, id) => {
  logger.debug("Delete account=[%s] of user=[%s]", id, userId);
  return Account.update(
    {deletedOn: new Date()},
    {where: {id, userId}},
  );
};

module.exports = accountSrv;
