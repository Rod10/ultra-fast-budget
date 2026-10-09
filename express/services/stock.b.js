const axios = require("axios");
const Decimal = require("decimal.js");
const config = require("../utils/config.js");
const {
  Portfolio,
  Stock,
  Op,
} = require("../models/index.js");
const Constants = require("../constants/constants");
const {logger} = require("./logger.js");
const orderSrv = require("./order.js");
const OrderType = require("../constants/order");

const tickerList = [
  "BNp_EQ",
  "FPp_EQ",
  "CARMp_EQ",
  "CSp_EQ",
  "DGp_EQ",
  "PUBp_EQ",
  "BNPp_EQ",
  "VIEp_EQ",
  "RNOp_EQ",
  "SANp_EQ",
  "RUIp_EQ",
  "AIp_EQ",
  "ACAp_EQ",
  "ORAp_EQ",
  "ENGIp_EQ",
];

const stockSrv = {};

const Months = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const Years = 2027;

const currentMonth = 0;

const transactions = [];
/*
 * ----------------------------------------------------------
 * Calcule de la moyenne
 * ----------------------------------------------------------
 */

const calculateNewAverage = (
  oldAverage,
  oldQuantity,
  newPrice,
  newQuantity,
) => (
  new Decimal(oldAverage)
    .mul(oldQuantity)
    .add(
      new Decimal(newPrice).mul(newQuantity),
    )
    .div(
      new Decimal(oldQuantity).add(newQuantity),
    )
);

const getCurrentPortfolioValue = stocks => stocks.reduce(
  (total, stock) => total.add(stock.average),
  new Decimal(0),
);

stockSrv.createBatch = async (userId, portfolioId, ordersToCreate) => {
  logger.debug("Create orders for user=[%s] and porfolio=[%s] with stocks=[%s]", userId, portfolioId, ordersToCreate);
// On conserve volontairement l'ordre d'exécution.
  for (const order of ordersToCreate) {
    await orderSrv.create(
      portfolioId,
      order,
      OrderType.ORDER,
    );
    const stock = await stockSrv.getByIsin(userId, order.isin);
    stock.average = calculateNewAverage({
      oldAverage: stock.average,
      oldQuantity: stock.quantity,
      newPrice: order.price,
      newQuantity: order.quantity,
    });
    stock.quantity = new Decimal(stock.quantity).add(order.quantity);
    stock.investedAmount = new Decimal(stock.investedAmount).add(order.total);
    if (stock.currentPrice >= 100) stock.boughtThisYear = true;
    stock.save();
  }
  const stocks = await stockSrv.getAll(userId, portfolioId);
  const portfolioValue = getCurrentPortfolioValue(stocks.rows);
  for (const stock of stocks.rows) {
    stock.weight = portfolioValue.isZero()
      ? new Decimal(0)
      : new Decimal(stock.investedAmount)
        .div(portfolioValue)
        .mul(100);
  }
};

const getPriorityStocks = state => state.stocks
  .filter(stock => new Decimal(stock.currentPrice).gte(state.portfolio.monthlyContribution)
    && !stock.boughtThisYear)
  .sort((a, b) => b.currentPrice - a.currentPrice);

const getMaring = ({
  remainingCashNextMonth,
  priorityPrice,
}) => {
  const margin = remainingCashNextMonth - priorityPrice;
  const marginPercent = margin / priorityPrice;

  if (marginPercent < 0.05) {
    return "low";
  }

  if (marginPercent < 0.10) {
    return "medium";
  }

  return "high";
};

const getSecondaryCandidates = ({
  stocks,
  budget,
  priority,
  monthlyContribution,
}) => stocks
  .filter(stock => stock.ticker !== priority.ticker)
  .map(stock => {
    const quantity = Math.floor(
      new Decimal(budget)
        .add(new Decimal(monthlyContribution))
        .sub(new Decimal(priority.currentPrice))
        .div(new Decimal(stock.currentPrice)),
    );

    const remainingCashNextMonth
      = new Decimal(budget)
        .sub(quantity * stock.currentPrice)
        .add(monthlyContribution);

    const margin = getMaring({
      remainingCashNextMonth,
      priorityPrice: priority.currentPrice,
    });

    return {
      ticker: stock.ticker,
      name: stock.name,
      currentPrice: stock.currentPrice,
      quantity,
      remainingCashNextMonth,
      margin,
    };
  })
  .filter(stock => stock.quantity > 0)
  .sort((a, b) => a.currentPrice - b.currentPrice);

const decidePriorityMode = state => {
  const priorities = getPriorityStocks(state);

  // if (priorities.length === 0) {
  //   return decideTargetMode(state);
  // }

  const currentPriority = priorities[0];
  const nextPriority = priorities[1];

  // ------------------------------------------------
  // 1. Peut-on acheter la priorité maintenant ?
  // ------------------------------------------------

  if (state.portfolio.cash >= currentPriority.currentPrice) {
    const cashAfter
      = state.portfolio.cash - currentPriority.currentPrice;

    const nextMonthCash
      = cashAfter + state.portfolio.monthlyContribution;

    // On l'achète seulement si cela ne casse
    // la possibilité d'acheter la priorité suivante
    // le mois prochain.
    if (
      !nextPriority
      || nextMonthCash >= nextPriority.currentPrice
    ) {
      return {
        type: "BUY_PRIORITY",
        ticker: currentPriority.ticker,
        quantity: 1,
      };
    }
  }

  // ------------------------------------------------
  // 2. Impossible ou trop tôt pour acheter la priorité
  // ------------------------------------------------

  const secondaryCandidates
    = getSecondaryCandidates({
      stocks: state.stocks,
      budget: state.portfolio.account.balance,
      priority: currentPriority,
      monthlyContribution: state.portfolio.monthlyContribution,
    });
  if (secondaryCandidates.length > 0) {
    return {
      priorities,
      secondaryCandidates,
    };
  }

  // ------------------------------------------------
  // 3. Cas où aucune décision ne respecte les règles
  // ------------------------------------------------

  return {
    type: "INFEASIBLE",
    reason:
      "Aucun achat mensuel ne permet de conserver la capacité d'achat de la prochaine priorité.",
  };
};

const decide = state => {
  const priorityStocks = getPriorityStocks(state);
  if (priorityStocks.length > 0) {
    return decidePriorityMode(state, priorityStocks);
  }

  // return decideTargetMode(state);
};

stockSrv.getData = (portfolio, stocks) => {
  const actions = decide({
    portfolio,
    stocks,
    transactions,
    date: `${Months[currentMonth]} - ${Years}`,
  });
  return {
    priority: actions.priorities[0],
    secondaryCandidates: actions.secondaryCandidates,
    date: `${Months[currentMonth]} - ${Years}`,
  };
};

/* stockSrv.advance = () => {
  currentMonth++;
  if (currentMonth === 12) {
    currentMonth = 0;
    Years++;
  }
  portfolio.cash += portfolio.monthlyContribution;
};

stockSrv.reset = () => {
  currentMonth = 0;
  Years = 2027;
  portfolio.cash = 100;
  stocks.splice(0, stocks.length);
  for (const ticker of tickerList) {
    const stock = instruments.find(instrument => instrument.instrument.ticker === ticker);
    stocks.push({
      isin: stock.instrument.isin,
      ticker: stock.instrument.ticker,
      name: stock.instrument.name,
      average: 0,
      amount: 0,
      investedAmount: 0,
      gain: 0,
      dividendsReceived: 0,
      boughtThisYear: false,
      currentPrice: stock.currentPrice,
    });
  }
  transactions.splice(0, transactions.length);
  return stockSrv.getData();
}; */

stockSrv.get = (userId, portfolioId) => {
  logger.debug("Get stocks for portfolio=[%s] for user=[%s]", portfolioId, userId);
  const where = {};
  if (portfolioId) where.portfolioId = portfolioId;

  return Stock.findAndCountAll({
    where,
    include: [{
      association: Stock.Portfolio,
      include: [{
        association: Portfolio.Account,
        where: {userId},
      }],
    }],
  });
};

stockSrv.getByIsin = (userId, isin) => {
  logger.debug("Get stock=[%s] of user=[%s]", userId, isin);

  return Stock.findOne({
    where: {isin},
    include: [{
      association: Stock.Portfolio,
      include: [{
        association: Portfolio.Account,
        where: {userId},
      }],
    }],
  });
};

const getImplicitFxRate = (
  quantity,
  price,
  valueInPortfolioCurrency,
) => valueInPortfolioCurrency / (quantity * price);

stockSrv.importTrading212 = async () => {
  logger.debug("Import data from Trading 212");
  const tradingInstruments = await axios.get(
    "https://live.trading212.com/api/v0/equity/positions",
    {
      timeout: 15000, // Timeout in milliseconds
      headers: {Authorization: `Basic ${Buffer.from(`${config.api.trading212.username}:${config.api.trading212.password}`).toString("base64")}`},
    },
  );
  for (const data of tradingInstruments.data) {
    const stockData = {
      ticker: data.instrument.ticker,
      isin: data.instrument.isin,
      name: data.instrument.name,
      currentPrice: 0,
      average: 0,
      quantity: 0,
      investedAmount: 0.00,
      dividendsReceived: 0.00,
      boughtThisYear: false,
    };
    if (tickerList.includes(data.instrument.ticker)) {
      stockData.portfolioId = 1;
    } else {
      stockData.portfolioId = 2;
      stockData.quantity = data.quantity;
      stockData.investedAmount = data.walletImpact.totalCost;
      stockData.average = data.walletImpact.totalCost / data.quantity;
    }
    if (data.instrument.currency !== "EUR") stockData.currentPrice = data.currentPrice * getImplicitFxRate(data.quantity, data.currentPrice, data.walletImpact.currentValue);
    else stockData.currentPrice = data.currentPrice;
    Stock.create(stockData);
  }
};

stockSrv.refreshPrice = async userId => {
  logger.debug("Refresh price from Trading 212");
  const tradingInstruments = await axios.get(
    "https://live.trading212.com/api/v0/equity/positions",
    {
      timeout: 15000, // Timeout in milliseconds
      headers: {Authorization: `Basic ${Buffer.from(`${config.api.trading212.username}:${config.api.trading212.password}`).toString("base64")}`},
    },
  );
  for (const data of tradingInstruments.data) {
    const stock = await stockSrv.getByIsin(userId, data.instrument.isin);
    if (data.instrument.currency !== "EUR") stock.currentPrice = data.currentPrice * getImplicitFxRate(data.quantity, data.currentPrice, data.walletImpact.currentValue);
    else stock.currentPrice = data.currentPrice;
    stock.save();
  }
};

stockSrv.simulate = (portfolio, stocks, stockToBough) => {
  logger.debug(
    "Simulate now and after for portfolio=[%s] with stocksToBough=[%s]",
    portfolio.id,
    stockToBough,
  );

  const monthlyContribution = new Decimal(portfolio.monthlyContribution);

  /*
   * ------------------------------------------------------------
   * 1. Valeur actuelle du portefeuille
   * ------------------------------------------------------------
   */

  const currentPortfolioValue = stocks.reduce(
    (total, stock) => total.add(
      new Decimal(stock.quantity).mul(new Decimal(stock.currentPrice)),
    ),
    new Decimal(0),
  );

  /*
   * ------------------------------------------------------------
   * 2. Recherche de l'action prioritaire
   * ------------------------------------------------------------
   *
   * Même logique que getPriorityStocks().
   */

  const priorityStocks = stocks
    .filter(stock => new Decimal(stock.currentPrice).gte(monthlyContribution)
      && !stock.boughtThisYear)
    .sort(
      (a, b) => new Decimal(b.currentPrice).cmp(new Decimal(a.currentPrice)),
    );

  const priority = priorityStocks[0];

  /*
 * ------------------------------------------------------------
 * 3. Calcul des pondérations après simulation
 * ------------------------------------------------------------
 *
 * On simule TOUS les achats présents dans stockToBough.
 * Le nombre d'actions utilisé est stockToBuy.quantity,
 * et surtout pas recommended.
 * ------------------------------------------------------------
 */

  const simulatedPurchasesValue = stockToBough.reduce(
    (total, stockToBuy) => total.add(
      new Decimal(stockToBuy.quantity).mul(
        new Decimal(stockToBuy.price),
      ),
    ),
    new Decimal(0),
  );

  const simulatedPortfolioValue = currentPortfolioValue
    .add(simulatedPurchasesValue);

  const recommendations = stockToBough.map(stockToBuy => {
    const stock = stocks.find(
      item => item.isin === stockToBuy.isin,
    );

    if (!stock) {
      return {
        isin: stockToBuy.isin,
        recommended: 0,
        currentWeight: "0.00",
        newWeight: "0.00",
        quantity: "0.00",
        investedAmount: "0.00",
        newAverage: "0.00",
      };
    }

    const price = new Decimal(stockToBuy.price);

    /*
     * ----------------------------------------------------------
     * Calcul du recommended
     * ----------------------------------------------------------
     *
     * On ne change pas cette logique.
     */

    const availableNextMonth = new Decimal(
      portfolio.account.balance,
    ).add(monthlyContribution);

    let recommended = 0;

    if (priority) {
      const priorityPrice = new Decimal(priority.currentPrice);

      recommended = Decimal.max(
        0,
        availableNextMonth
          .sub(priorityPrice)
          .div(price)
          .floor(),
      ).toNumber();
    }

    /*
     * ----------------------------------------------------------
     * Pondération actuelle
     * ----------------------------------------------------------
     */

    /* const currentValue = new Decimal(stock.quantity)
      .mul(new Decimal(stock.currentPrice));

    const currentWeight = currentPortfolioValue.isZero()
      ? new Decimal(0)
      : currentValue
        .div(currentPortfolioValue)
        .mul(100); */

    /*
     * ----------------------------------------------------------
     * Pondération après simulation
     * ----------------------------------------------------------
     *
     * IMPORTANT :
     * On utilise stockToBuy.quantity, pas recommended.
     *
     * simulatedPortfolioValue contient déjà TOUS les achats
     * de stockToBough.
     */

    const simulatedStockValue = new Decimal(stock.weight).add(
      new Decimal(stockToBuy.quantity).mul(price),
    );

    const newWeight = simulatedPortfolioValue.isZero()
      ? new Decimal(0)
      : simulatedStockValue
        .div(simulatedPortfolioValue)
        .mul(100);

    const newAverage = calculateNewAverage(
      stock.average,
      stock.quantity,
      stockToBuy.price,
      stockToBuy.quantity,
    );

    return {
      isin: stockToBuy.isin,
      recommended,
      // currentWeight: currentWeight.toFixed(2),
      newWeight: newWeight.toFixed(Constants.DECIMAL),
      quantity: new Decimal(stock.quantity).add(stockToBuy.quantity),
      investedAmount: simulatedStockValue,
      newAverage,
    };
  });

  /*
   * ------------------------------------------------------------
   * 4. Actions achetables le mois prochain
   * ------------------------------------------------------------
   *
   * Même principe que secondaryCandidates :
   * on calcule combien d'actions de chaque titre pourraient être
   * achetées avec le budget disponible le mois prochain.
   * ------------------------------------------------------------
   */

  const nextMonthBudget = new Decimal(portfolio.account.balance)
    .add(monthlyContribution)
    .sub(stockToBough.reduce(
      (acc, val) => acc.plus(new Decimal(val.quantity).mul(val.price)),
      new Decimal(0),
    ));

  const secondaryCandidates = stocks
    .map(stock => {
      const price = new Decimal(stock.currentPrice);

      if (price.isZero()) {
        return null;
      }

      const quantity = nextMonthBudget
        .div(price)
        .floor();

      const remainingCash = nextMonthBudget
        .sub(quantity.mul(price));

      return {
        isin: stock.isin,
        ticker: stock.ticker,
        name: stock.name,
        currentPrice: stock.currentPrice,
        quantity: quantity.toNumber(),
        remainingCashNextMonth: remainingCash.toFixed(2),
      };
    })
    .filter(stock => stock && stock.quantity > 0)
    .sort(
      (a, b) => new Decimal(a.currentPrice).cmp(new Decimal(b.currentPrice)),
    );

  return {
    recommendations,
    secondaryCandidates,
  };
};

module.exports = stockSrv;
