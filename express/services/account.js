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
 * @returns {object} user - User instance
 */
accountSrv.create = (userId, data) => {
  logger.debug("Create account with data=[%s] for user=[%s]", data, userId);
  // if (AccountsTypeFull[data.type].maxAmount !== 0) {
  //   assert(parseInt(data.initialBalance, 10) <= AccountsTypeFull[data.type].maxAmount, "Initial balance cannot be more than the maximum amount allowed");
  // }

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
  return Account.findAndCountAll({
    where: {userId},
    include: [{association: Account.AccountType}],
  });
};

/**
 * update the account with the data provided
 * @param {number} userId - The user Id
 * @param {int} accountId - The account that need to me modified
 * @param {object} data - The transaction data
 */
accountSrv.updateData = async (userId, accountId, data) => {
  logger.debug("Update user=[%s] account=[%s] with data=[%s]", userId, accountId, data);
  assert(userId, "UserId cannot be null");
  assert(accountId, "AccountId cannot be null");
  assert(data, "Data cannot be null");

  const account = await Account.findOne({where: {id: accountId, userId}});
  let newAccountAmount = 0;

  if (data.type === TransactionTypes.INCOME || data.type === TransactionTypes.EXPECTED_INCOME) {
    newAccountAmount = account.balance + data.data.map(row => parseFloat(row.amount)).reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
    assert(
      parseInt(newAccountAmount, 10) > AccountsTypeFull[account.type].maxAmount && account.type !== AccountTypes.WALLET,
      "Balance cannot be more than the maximum amount allowed for an manual transaction",
    );
  } else if (data.type === TransactionTypes.EXPECTED_EXPENSE || data.type === TransactionTypes.EXPENSE) {
    newAccountAmount = account.balance - data.data.map(row => parseFloat(row.amount)).reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
  }
  account.balance = newAccountAmount;
  return account.save();
};

accountSrv.rebalance = async (accountId, transactions) => {
  logger.debug("Rebalance account=[%s]", accountId);
  const account = await accountSrv.get(accountId);
  let newAccountBalance = account.initialBalance;
  for (const transaction of transactions.rows) {
    if (transaction.type === TransactionTypes.INCOME || transaction.type === TransactionTypes.EXPECTED_INCOME) {
      newAccountBalance += transaction.data.map(row => parseFloat(row.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
      assert(
        (parseInt(newAccountBalance, 10) > AccountsTypeFull[account.type].maxAmount) && account.type === AccountTypes.WALLET,
        "Balance cannot be more than the maximum amount allowed for an manual transaction",
      );
    } else if (transaction.type === TransactionTypes.EXPECTED_EXPENSE || transaction.type === TransactionTypes.EXPENSE) {
      newAccountBalance -= transaction.data.map(row => parseFloat(row.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    }
  }
  account.balance = newAccountBalance;
  account.save();
};

accountSrv.rebalanceTransfer = async (senderId, receiverId, transfers) => {
  logger.debug("Rebalance account=[%s] and [%s] for transfer", senderId, receiverId);
  const sender = await accountSrv.get(senderId);
  let newSenderAccountBalance = sender.initialBalance;
  for (const transfer of transfers.rows) {
    newSenderAccountBalance -= parseFloat(transfer.amount);
  }
  sender.balance = newSenderAccountBalance;
  sender.save();

  const receiver = await accountSrv.get(receiverId);
  let newReceiverAccountBalance = receiver.initialBalance;
  for (const transfer of transfers.rows) {
    newReceiverAccountBalance += parseFloat(transfer.amount);
  }
  receiver.balance = newReceiverAccountBalance;
  receiver.save();
};

module.exports = accountSrv;
