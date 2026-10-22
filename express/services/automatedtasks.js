/* eslint-disable */
const moment = require("moment");

const {
  Account,
  PlannedTransaction,
  PlannedTransfer,
  SubCategory,
  Transaction,
  Transfer,
  Sequelize,
} = require("../models/index.js");

const Runner = require("../utils/runner.js");
const TransactionTypes = require("../constants/transactiontype.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");
const portfolioSrv = require("./portfolio");
const config = require("../utils/config");
const axios = require("axios");
const OrderType = require("../constants/ordertype");
const lastReferenceSrv = require("./lastreference");
const Decimal = require("decimal.js");
const orderSrv = require("./order");
const stockSrv = require("./stock");

const {Op} = Sequelize;
const test = {};
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
      isPlanned: true,
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
      accountSender.balance -= parseFloat(plannedTransfer.amount);
    }
    plannedTransfer.transferDate = new moment().add(1, plannedTransfer.unit);
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
      isPlanned: true,
    });
  }
};

const TRADING_212_TIMEOUT = 15_000;

const getTrading212AuthHeader = () => ({
  Authorization: `Basic ${Buffer.from(
    `${config.api.trading212.username}:${config.api.trading212.password}`,
  ).toString("base64")}`,
});

const fetchTrading212URL = async url => axios.get(url, {
  timeout: TRADING_212_TIMEOUT,
  headers: getTrading212AuthHeader(),
  validateStatus: () => true,
});

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const importTransactionData = async () => {
  const lastReferences = await lastReferenceSrv.get(1);
  const orders = [];
  let url = "https://live.trading212.com/api/v0/equity/history/transactions?limit=50";
  let response;
  let lastReferenceFound = false;
  do {
    response = await fetchTrading212URL(url);

    if (response.status !== 200) {
      break;
    }

    const tradingTransactions = response.data;

    for (const item of tradingTransactions.items) {
      // S'il n'y a pas de page suivante, on s'arrête
      console.log("/* ****** */")
      console.log(item.reference, lastReferences.transaction);
      console.log(typeof item.reference, typeof lastReferences.transaction);
      console.log(item.reference === lastReferences.transaction);
      console.log("/* ****** */")
      if (item.reference === lastReferences.transaction) {
        lastReferenceFound = true;
        break;
      }
      const type = {
        "INTEREST_ON_FREE_CASH": OrderType.INTEREST,
        "LENDING_INTEREST": OrderType.INTEREST,
        "DEPOSIT": OrderType.DEPOSIT,
        "WITHDRAW": OrderType.WITHDRAW,
      };
      orders.push({
        portfolioId: 2,
        type: type[item.type],
        investedAmount: item.amount,
        reference: item.reference,
        receivedAt: new moment(item.dateTime),
      });
    }
    url = `https://live.trading212.com/${tradingTransactions.nextPagePath}`;

    await timeout(5000);
  } while (response.status === 200 && lastReferenceFound === false);
  console.log("Transaction Finished");
  return {
    orders,
    lastTransactionReference: orders.length
      ? orders[0].reference
      : undefined,
  };
};

const importOrderData = async () => {
  const lastReferences = await lastReferenceSrv.get(1);
  const orders = [];
  let url = "https://live.trading212.com/api/v0/equity/history/orders?limit=50";

  let response;
  let lastReferenceFound = false;

  do {
    response = await fetchTrading212URL(url);

    if (response.status !== 200) {
      break;
    }

    const tradingOrder = response.data;

    for (const item of tradingOrder.items) {
      // S'il n'y a pas de page suivante, on s'arrête
      if (item.id === lastReferences.order) {
        lastReferenceFound = true;
        break;
      }
      if (item.order.status !== "CANCELLED" && item.fill) {
        orders.push({
          portfolioId: 2,
          type: OrderType.ORDER,
          quantity: item.fill.quantity,
          isin: item.order.instrument.isin,
          price: new Decimal(item.fill.walletImpact.netValue)
            .div(item.fill.quantity),
          fees: item.fill.walletImpact.taxes.reduce(
            (total, value) => total.add(value.quantity),
            new Decimal(0),
          ),
          investedAmount: new Decimal(item.fill.walletImpact.netValue),
          receivedAt: new moment(item.fill.filledAt),
          reference: item.fill.id,
          side: item.order.side,
        });
      }
    }



    url = `https://live.trading212.com/${tradingOrder.nextPagePath}`;

    await timeout(5000);
  } while (response.status === 200 && lastReferenceFound === false);
  console.log("Order Finished");
  return {
    orders,
    lastOrderReference: orders.length
      ? orders[0].reference
      : undefined,
  };
};

const importDividendData = async () => {
  const lastReferences = await lastReferenceSrv.get(1);
  const orders = [];
  let url = "https://live.trading212.com/api/v0/equity/history/dividends?limit=50";

  let response;
  let lastReferenceFound = false;

  do {
    response = await fetchTrading212URL(url);

    if (response.status !== 200) {
      break;
    }

    const tradingDividend = response.data;

    for (const item of tradingDividend.items) {
      // S'il n'y a pas de page suivante, on s'arrête
      if (item.reference === lastReferences.dividend) {
        lastReferenceFound = true;
        break;
      }
      orders.push({
        portfolioId: 2,
        type: OrderType.DIVIDEND,
        quantity: item.quantity,
        isin: item.instrument.isin,
        price: item.grossAmountPerShare,
        investedAmount: item.amount,
        receivedAt: item.paidOn,
        reference: item.reference,
      });
    }

    url = `https://live.trading212.com/${tradingDividend.nextPagePath}`;

    await timeout(5000);
  } while (response.status === 200 && lastReferenceFound === false);
  console.log("Dividend Finished");
  return {
    orders,
    lastDividendReference: orders.length
      ? orders[0].reference
      : undefined,
  };
};

automatedSrv.importTrading212 = async () => {
  // console.log("test");
  const portfolio = await portfolioSrv.getById(1, 2);
  // console.log(portfolio);

  const transactionData = await importTransactionData();
  const orderData = await importOrderData();
  const dividendData = await importDividendData();
  const orders = [].concat(transactionData.orders)
    .concat(orderData.orders)
    .concat(dividendData.orders)
    .sort((a, b) => new moment(a.receivedAt) - new moment(b.receivedAt));

  for (const order of orders) {
    await orderSrv.create(2, order, order.type);
    if (order.type === "DIVIDEND") {
      const stock = await stockSrv.getByIsin(1, 2, order.isin);
      if (stock) {
        stock.dividendsReceived = new Decimal(stock.dividendsReceived).add(order.investedAmount);
        stock.save();
      }
    }
    if (order.type === OrderType.INTEREST
      || order.type === OrderType.DIVIDEND
      || (order.type === OrderType.ORDER && order.side === "SELL")) {
      portfolio.account.balance = new Decimal(portfolio.account.balance)
        .add(order.investedAmount);
    } else if (order.type === OrderType.ORDER && order.side === "BUY") {
      portfolio.account.balance = new Decimal(portfolio.account.balance)
        .sub(order.investedAmount);
    }
    portfolio.account.save();
  }
  await lastReferenceSrv.update(1, {
    dividend: dividendData.lastDividendReference,
    order: orderData.lastOrderReference,
    transaction:  transactionData.lastTransactionReference,
  })

  console.log("done");
}

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
