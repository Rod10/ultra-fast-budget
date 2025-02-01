const assert = require("assert");

const AccountsTypeFull = require("../constants/accountstypefull.js");

const {
  sequelize,
  Sequelize,
  Account,
  Op,
} = require("../models/index.js");
const AccountTypes = require("../constants/accountstype.js");
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
  // if (AccountsTypeFull[data.type].maxAmount !== 0) {
  //   assert(parseInt(data.initialBalance, 10) <= AccountsTypeFull[data.type].maxAmount, "Initial balance cannot be more than the maximum amount allowed");
  // }

  return Account.create({
    userId,
    name: data.name,
    currency: data.currency,
    accountTypeId: accountType.id,
    initialBalance: data.initialBalance,
    balance: data.initialBalance,
  });
};

accountSrv.get = id => {
  logger.debug("Get account by id=[%s]", id);
  return Account.findOne({
    where: {id},
    include: [{association: Account.AccountType}],
  });
};

accountSrv.getAllByUser = userId => {
  logger.debug("Get all accounts for userId=[%s]", userId);
  return Account.findAndCountAll({
    where: {userId},
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
accountSrv.updateData = async (userId, accountId, data, accountTypeId) => {
  logger.debug("Update user=[%s] account=[%s] with data=[%s]", userId, accountId, data);
  assert(userId, "UserId cannot be null");
  assert(accountId, "AccountId cannot be null");
  assert(data, "Data cannot be null");
  assert(accountTypeId, "accountTypeId cannot be null");
  console.log(accountId);
  return Account.update(
    {
      name: data.name,
      accountTypeId,
      currency: data.currency,
      initialBalance: parseFloat(data.initialBalance),
    },
    {where: {id: accountId, userId}},
  );
};

accountSrv.update = async (userId, accountId, data) => {
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

accountSrv.rebalance = async (accountId, transactions, transfers) => {
  logger.debug("Rebalance account=[%s]", accountId);
  const account = await accountSrv.get(accountId);
  let newAccountBalance = account.initialBalance;
  for (const transaction of transactions.rows) {
    if (transaction.type === TransactionTypes.INCOME || transaction.type === TransactionTypes.EXPECTED_INCOME) {
      newAccountBalance += transaction.data.map(row => parseFloat(row.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    } else if (transaction.type === TransactionTypes.EXPECTED_EXPENSE || transaction.type === TransactionTypes.EXPENSE) {
      newAccountBalance -= transaction.data.map(row => parseFloat(row.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    } else if (transaction.type === TransactionTypes.INTEREST) {
      newAccountBalance += transaction.data.map(row => parseFloat(row.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    }
  }

  if (transfers) {
    for (const transfer of transfers) {
      if (account.id === transfer.receiverId) {
        newAccountBalance += parseFloat(transfer.amount);
      } else if (account.id === transfer.senderId) {
        newAccountBalance -= parseFloat(transfer.amount);
      }
    }
  }

  account.balance = newAccountBalance;
  account.save();
};

accountSrv.rebalanceTransfer = async (senderId, receiverId, transfers) => {
  logger.debug("Rebalance account=[%s] and [%s] for transfer", senderId, receiverId);
  const sender = await accountSrv.get(senderId);
  let newSenderAccountBalance = sender.balance;
  for (const transfer of transfers.rows) {
    newSenderAccountBalance -= parseFloat(transfer.amount);
  }
  sender.balance = newSenderAccountBalance;
  sender.save();

  const receiver = await accountSrv.get(receiverId);
  let newReceiverAccountBalance = receiver.balance;
  for (const transfer of transfers.rows) {
    newReceiverAccountBalance += parseFloat(transfer.amount);
  }
  receiver.balance = newReceiverAccountBalance;
  receiver.save();
};

module.exports = accountSrv;
