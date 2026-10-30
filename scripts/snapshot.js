const assert = require("assert");
const Decimal = require("decimal.js");
const moment = require("moment");
const portfolioSrv = require("../express/services/portfolio.js");
const orderSrv = require("../express/services/order.js");
const {logger} = require("../express/services/logger.js");
const OrderType = require("../express/constants/ordertype.js");
const snapshotSrv = require("../express/services/snapshot.js");

const createSnapshot = async () => {
  const portfolios = await portfolioSrv.getAll();

  for (const portfolio of portfolios.rows) {
    const orders = await orderSrv.getAllByPortfolioForSnapshot(portfolio.account.userId, portfolio.id);
    const snapshot = {
      portfolioId: null,
      year: null,
      startBalance: 0,
      endBalance: 0,
      totalGain: 0,
      netGain: 0,
      interestGain: 0,
      dividendGain: 0,
    };
    let balance = snapshot.startBalance;
    let interestGain = 0;
    let dividendGain = 0;
    let totalGain = 0;
    let withdraw = 0;
    for (const order of orders.rows) {
      if (snapshot.portfolioId === null) snapshot.portfolioId = portfolio.id;
      if (snapshot.year === null) snapshot.year = new moment(order.receivedAt).year();
      if (order.type === OrderType.INTEREST
        || order.type === OrderType.DIVIDEND
        || order.type === OrderType.WITHDRAW
        || order.type === OrderType.DEPOSIT
        || (order.type === OrderType.ORDER && order.side === "SELL")) {
        balance = new Decimal(balance)
          .add(order.investedAmount);
      } else if (order.type === OrderType.ORDER && order.side === "BUY") {
        balance = new Decimal(balance)
          .sub(order.investedAmount);
      }
      if (order.type === OrderType.INTEREST) interestGain = new Decimal(interestGain).add(order.investedAmount);
      if (order.type === OrderType.DIVIDEND) dividendGain = new Decimal(dividendGain).add(order.investedAmount);
      if (order.type === OrderType.INTEREST
        || order.type === OrderType.DIVIDEND
        || (order.type === OrderType.ORDER && order.side === "SELL")) {
        totalGain = new Decimal(totalGain).add(order.investedAmount);
      }
      if (order.type === OrderType.WITHDRAW) withdraw = new Decimal(withdraw).add(order.investedAmount);
      if (new moment(order.receivedAt).year() !== snapshot.year) {
        snapshot.endBalance = balance;
        snapshot.totalGain = new Decimal(snapshot.endBalance).minus(snapshot.startBalance);
        snapshot.netGain = new Decimal(snapshot.totalGain).add(withdraw);
        snapshot.interestGain = interestGain;
        snapshot.dividendGain = dividendGain;
        await snapshotSrv.create(snapshot);
        snapshot.year = new moment(order.receivedAt).year();
        snapshot.startBalance = snapshot.endBalance;
        snapshot.totalGain = 0;
        snapshot.netGain = 0;
        snapshot.interestGain = 0;
        snapshot.dividendGain = 0;
      }
    }
  }
};

createSnapshot()
  .then(() => console.log("Done"))
  .catch(err => console.log(err));
