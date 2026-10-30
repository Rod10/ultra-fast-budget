const Decimal = require("decimal.js");
const {
  Snapshot,
  Order,
  Op,
  Portfolio,
} = require("../models/index.js");
const Constants = require("../constants/constants.js");
const OrderDirection = require("../constants/orderdirection.js");
const OrderType = require("../constants/ordertype.js");
const {logger} = require("./logger.js");
const orderSrv = require("./order.js");

const snapshotSrv = {};

snapshotSrv.create = data => {
  logger.debug("Create snapshot for year=[%s] and portfolio==[%s] with data==[%s]", data.year, data.portfolioId, data);
  return Snapshot.create({
    portfolioId: data.portfolioId,
    year: data.year,
    startBalance: data.startBalance,
    endBalance: data.endBalance,
    totalGain: data.totalGain,
    netGain: data.netGain,
    interestGain: data.interestGain,
    dividendGain: data.dividendGain,
  });
};

snapshotSrv.getOneByPortfolio = (portfolioId, year) => {
  logger.debug("Get one snapshot for portfolio=[%s] and year=[%s]", portfolioId, year);
  return Snapshot.findAndCountAll({
    where: {
      portfolioId,
      year,
    },
  });
};

snapshotSrv.getByYear = query => {
  logger.debug("Get one snapshot for portfolio=[%s] and year=[%s]", query.portfolioId, query.year);
  let year = new Date(query.year).getFullYear();
  if (year === new Date().getFullYear()) year = new Decimal(year).minus(1);
  const where = {[Op.and]: [{year}]};
  const condition = where[Op.and][0];
  if ("portfolioId" in query) condition.portfolioId = query.portfolioId;
  return Snapshot.findAndCountAll({where});
};

snapshotSrv.simulate = async (userId, data, query) => {
  logger.debug("Snapshot simulate with data=[%s]", data);

  const header = {
    startBalance: 0,
    endBalance: 0,
    totalGain: 0,
    netGain: 0,
    interestGain: 0,
    dividendGain: 0,
  };

  const year = new Date(query.year).getFullYear();
  const currentYear = new Date().getFullYear();

  // On conserve les 12 mois, même lorsqu'ils sont vides.
  const monthsData = Array.from({length: 12}, () => []);

  // Le snapshot historique ne concerne que les années passées.
  if (year < currentYear) {
    let balance = new Decimal(header.startBalance);
    for (const row of data.rows) {
      const orders = await orderSrv.getAllByPortfolioForSnapshot(
        userId,
        row.portfolioId,
        new Date(year, 0, 1),
      );

      // Trier les commandes par date croissante.
      const sortedOrders = [...orders.rows].sort(
        (a, b) => new Date(a.receivedAt).getTime()
          - new Date(b.receivedAt).getTime(),
      );

      for (const order of sortedOrders) {
        const date = new Date(order.receivedAt);

        // Ignorer les commandes qui ne concernent pas l'année demandée.
        if (date.getFullYear() !== year) {
          continue;
        }

        const monthIndex = date.getMonth(); // 0 = janvier
        const day = date.getDate(); // 1 à 31

        const monthData = monthsData[monthIndex];

        // Une seule entrée par jour et par mois.
        let dayData = monthData.find(
          item => item.day === day,
        );

        if (!dayData) {
          dayData = {
            day,
            liquidity: 0,
            gains: 0,
            events: [],
          };

          monthData.push(dayData);
        }

        if (order.type === OrderType.INTEREST
          || order.type === OrderType.DIVIDEND
          || order.type === OrderType.WITHDRAW
          || order.type === OrderType.DEPOSIT
          || (order.type === OrderType.ORDER && order.side === "SELL")) {
          balance = new Decimal(balance)
            .add(order.investedAmount);
          dayData.gains = new Decimal(dayData.gains).add(order.investedAmount);
        } else if (order.type === OrderType.ORDER && order.side === "BUY") {
          balance = new Decimal(balance)
            .sub(order.investedAmount);
          dayData.gains = new Decimal(dayData.gains).sub(order.investedAmount);
        }
        dayData.liquidity = new Decimal(balance)
          .toFixed(Constants.DECIMAL);
        dayData.events.push({
          type: order.type,
          data: order.isin,
          side: order.side,
          amount: order.investedAmount,
        });
        // Ajouter ici le traitement réel de la commande.
        // Exemple :
        // dayData.events.push(order);
      }
    }

    // Garantir l'ordre chronologique des jours dans chaque mois.
    for (const monthData of monthsData) {
      monthData.sort((a, b) => a.day - b.day);
    }
  }

  logger.debug("Snapshot monthsData=[%s]", JSON.stringify(monthsData));
  console.log(monthsData);
  return {
    header,
    monthsData,
  };
};

module.exports = snapshotSrv;
