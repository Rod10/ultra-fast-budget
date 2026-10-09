const axios = require("axios");
const Decimal = require("decimal.js");

const moment = require("moment/moment");
const config = require("../utils/config.js");
const {
  Account,
  Portfolio,
  Stock,
} = require("../models/index.js");
const Constants = require("../constants/constants.js");
const OrderType = require("../constants/ordertype.js");

const {logger} = require("./logger.js");
const orderSrv = require("./order.js");
const portfolioSrv = require("./portfolio.js");
const lastReferenceSrv = require("./lastreference.js");

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const TRADING_212_POSITIONS_URL
  = "https://live.trading212.com/api/v0/equity/positions";

const TRADING_212_TIMEOUT = 15_000;

const MONTHS = [
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

let CURRENT_MONTH = 0;
let CURRENT_YEAR = 2027;

const PRIORITY_TICKERS = new Set([
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
]);

// Conservé pour compatibilité avec la logique existante.
const transactions = [];

const stockSrv = {};

// -----------------------------------------------------------------------------
// Generic helpers
// -----------------------------------------------------------------------------

const toDecimal = value => new Decimal(value ?? 0);

const getCurrentDateLabel = () => `${MONTHS[CURRENT_MONTH]} - ${CURRENT_YEAR}`;

const getStockValue = stock => toDecimal(stock.quantity).mul(toDecimal(stock.currentPrice));

const getPurchaseValue = purchase => toDecimal(purchase.quantity).mul(toDecimal(purchase.price));

const getTotalPurchaseValue = purchases => purchases.reduce(
  (total, purchase) => total.add(getPurchaseValue(purchase)),
  new Decimal(0),
);

const getAffordableQuantity = (budget, price) => {
  const decimalPrice = toDecimal(price);

  if (decimalPrice.isZero() || decimalPrice.isNegative()) {
    return 0;
  }

  return toDecimal(budget)
    .div(decimalPrice)
    .floor()
    .toNumber();
};

// -----------------------------------------------------------------------------
// Priority / recommendation helpers
// -----------------------------------------------------------------------------

const getPriorityStocks = state => state.stocks
  .filter(stock => toDecimal(stock.currentPrice).gte(
    toDecimal(state.portfolio.monthlyContribution),
  )
    && !stock.boughtThisYear)
  .sort(
    (a, b) => toDecimal(b.currentPrice).cmp(toDecimal(a.currentPrice)),
  );

const getMargin = ({
  remainingCashNextMonth,
  priorityPrice,
}) => {
  const margin = toDecimal(remainingCashNextMonth)
    .sub(toDecimal(priorityPrice));

  const marginPercent = margin.div(toDecimal(priorityPrice));

  if (marginPercent.lt(0.05)) {
    return "low";
  }

  if (marginPercent.lt(0.10)) {
    return "medium";
  }

  return "high";
};

const getSecondaryCandidates = ({
  stocks,
  budget,
  priority,
  monthlyContribution,
}) => {
  const availableBudget = toDecimal(budget)
    .add(toDecimal(monthlyContribution))
    .sub(toDecimal(priority.currentPrice));

  return stocks
    .filter(stock => stock.ticker !== priority.ticker)
    .map(stock => {
      const quantity = getAffordableQuantity(
        availableBudget,
        stock.currentPrice,
      );

      const remainingCashNextMonth
        = new Decimal(budget)
          .sub(quantity * stock.currentPrice)
          .add(monthlyContribution);

      return {
        ticker: stock.ticker,
        name: stock.name,
        currentPrice: stock.currentPrice,
        quantity,
        remainingCashNextMonth,
        margin: getMargin({
          remainingCashNextMonth,
          priorityPrice: priority.currentPrice,
        }),
      };
    })
    .filter(stock => stock.quantity > 0)
    .sort(
      (a, b) => toDecimal(a.currentPrice).cmp(toDecimal(b.currentPrice)),
    );
};

// -----------------------------------------------------------------------------
// Decision engine
// -----------------------------------------------------------------------------

const decidePriorityMode = state => {
  const priorities = getPriorityStocks(state);
  const [currentPriority, nextPriority] = priorities;

  if (!currentPriority) {
    return {
      type: "NO_PRIORITY",
      priorities: [],
      secondaryCandidates: [],
    };
  }

  // ---------------------------------------------------------------------------
  // 1. Peut-on acheter la priorité maintenant ?
  // ---------------------------------------------------------------------------

  const currentCash = toDecimal(state.portfolio.cash);
  const priorityPrice = toDecimal(currentPriority.currentPrice);

  if (currentCash.gte(priorityPrice)) {
    const cashAfterPurchase = currentCash.sub(priorityPrice);

    const nextMonthCash = cashAfterPurchase.add(
      toDecimal(state.portfolio.monthlyContribution),
    );

    const canBuyNextPriority
      = !nextPriority
      || nextMonthCash.gte(toDecimal(nextPriority.currentPrice));

    if (canBuyNextPriority) {
      return {
        type: "BUY_PRIORITY",
        ticker: currentPriority.ticker,
        quantity: 1,
        priorities,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 2. La priorité ne peut pas encore être achetée.
  //    On cherche donc les achats secondaires possibles.
  // ---------------------------------------------------------------------------

  const secondaryCandidates = getSecondaryCandidates({
    stocks: state.stocks,
    budget: state.portfolio.account.balance,
    priority: currentPriority,
    monthlyContribution: state.portfolio.monthlyContribution,
  });

  if (secondaryCandidates.length > 0) {
    return {
      type: "BUY_SECONDARY",
      priorities,
      secondaryCandidates,
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Aucune décision possible.
  // ---------------------------------------------------------------------------

  return {
    type: "INFEASIBLE",
    priorities,
    secondaryCandidates: [],
    reason:
      "Aucun achat mensuel ne permet de conserver la capacité d'achat de la prochaine priorité.",
  };
};

const decide = state => {
  const priorityStocks = getPriorityStocks(state);
  if (priorityStocks.length === 0) {
    return {
      type: "NO_PRIORITY",
      priorities: [],
      secondaryCandidates: [],
    };
  }
  return decidePriorityMode(state);
};

// -----------------------------------------------------------------------------
// Portfolio data
// -----------------------------------------------------------------------------

stockSrv.getData = (portfolio, stocks) => {
  const actions = decide({
    portfolio,
    stocks,
    transactions,
    date: getCurrentDateLabel(),
  });

  return {
    priority: actions.priorities?.[0] ?? null,
    secondaryCandidates: actions.secondaryCandidates ?? [],
    date: getCurrentDateLabel(),
  };
};

// -----------------------------------------------------------------------------
// Database
// -----------------------------------------------------------------------------

stockSrv.getAll = (userId, portfolioId) => {
  logger.debug(
    "Get stocks for portfolio=[%s] for user=[%s]",
    portfolioId,
    userId,
  );

  const where = {};

  if (portfolioId) {
    where.portfolioId = portfolioId;
  }

  return Stock.findAndCountAll({
    where,
    include: [
      {
        association: Stock.Portfolio,
        include: [
          {
            association: Portfolio.Account,
            where: {userId},
            include: [{association: Account.AccountType}],
          },
        ],
      },
    ],
  });
};

stockSrv.getByIsin = (userId, portfolioId, isin) => {
  logger.debug(
    "Get stock=[%s] of user=[%s]",
    isin,
    userId,
  );

  return Stock.findOne({
    where: {
      isin,
      portfolioId,
    },
    include: [
      {
        association: Stock.Portfolio,
        include: [
          {
            association: Portfolio.Account,
            where: {userId},
          },
        ],
      },
    ],
  });
};

// -----------------------------------------------------------------------------
// Trading 212
// -----------------------------------------------------------------------------

const getTrading212AuthHeader = () => ({
  Authorization: `Basic ${Buffer.from(
    `${config.api.trading212.username}:${config.api.trading212.password}`,
  ).toString("base64")}`,
});

const fetchTrading212Positions = async () => {
  const response = await axios.get(
    TRADING_212_POSITIONS_URL,
    {
      timeout: TRADING_212_TIMEOUT,
      headers: getTrading212AuthHeader(),
    },
  );

  return response.data;
};

const fetchTrading212Transaction = async url => axios.get(url, {
  timeout: TRADING_212_TIMEOUT,
  headers: getTrading212AuthHeader(),
  validateStatus: () => true,
});

const getImplicitFxRate = (
  quantity,
  price,
  valueInPortfolioCurrency,
) => {
  const positionValue = toDecimal(quantity).mul(toDecimal(price));

  if (positionValue.isZero()) {
    return new Decimal(1);
  }

  return toDecimal(valueInPortfolioCurrency).div(positionValue);
};

const getPriceInPortfolioCurrency = data => {
  if (data.instrument.currency === "EUR") {
    return toDecimal(data.currentPrice);
  }

  return toDecimal(data.currentPrice).mul(
    getImplicitFxRate(
      data.quantity,
      data.currentPrice,
      data.walletImpact.currentValue,
    ),
  );
};

const buildImportedStock = data => {
  const isPriorityStock = PRIORITY_TICKERS.has(
    data.instrument.ticker,
  );

  const stock = {
    ticker: data.instrument.ticker,
    isin: data.instrument.isin,
    name: data.instrument.name,
    currentPrice: getPriceInPortfolioCurrency(data),
    average: 0,
    quantity: 0,
    investedAmount: 0,
    dividendsReceived: 0,
    boughtThisYear: false,
    portfolioId: 2,
  };

  // if (!isPriorityStock) {
  stock.quantity = data.quantity;
  stock.investedAmount = data.walletImpact.totalCost;
  stock.average
      = data.quantity === 0
      ? 0
      : data.walletImpact.totalCost / data.quantity;
  // }

  return stock;
};

/*
  Transaction: "items": [
    {
      "type": "INTEREST_ON_FREE_CASH",
      "amount": 0.09,
      "currency": "EUR",
      "reference": "01a0bc59-9834-7df7-a4c8-6e11408a1f51",
      "dateTime": "2026-09-20T01:06:23.398Z"
    },
    {
      "type": "INTEREST_ON_FREE_CASH",
      "amount": 0.08,
      "currency": "EUR",
      "reference": "01a0b733-4c40-79f1-8bea-3bd89042cdd6",
      "dateTime": "2026-09-19T01:06:27.507Z"
    },
  ]

  Order:
  "items": [
    {
      "order": {
        "id": 58303428456,
        "strategy": "VALUE",
        "type": "MARKET",
        "ticker": "LGENl_EQ",
        "status": "FILLED",
        "value": 6.77,
        "filledValue": 6.77,
        "currency": "EUR",
        "extendedHours": false,
        "initiatedFrom": "AUTOINVEST",
        "side": "BUY",
        "createdAt": "2026-10-05T06:01:05.000Z",
        "instrument": {
          "ticker": "LGENl_EQ",
          "name": "Legal & General",
          "isin": "GB0005603997",
          "currency": "GBX"
        }
      },
      "fill": {
        "id": 58304175617,
        "quantity": 1.97163384,
        "price": 289,
        "type": "TRADE",
        "tradingMethod": "OTC",
        "filledAt": "2026-10-05T07:00:32.000Z",
        "walletImpact": {
          "currency": "EUR",
          "netValue": 6.77,
          "fxRate": 84.66599996,
          "taxes": [
            {
              "name": "STAMP_DUTY_RESERVE_TAX",
              "quantity": -0.03,
              "currency": "EUR",
              "chargedAt": "2026-10-05T07:02:16.092Z"
            },
            {
              "name": "CURRENCY_CONVERSION_FEE",
              "quantity": -0.01,
              "currency": "EUR",
              "chargedAt": "2026-10-05T07:02:16.065Z"
            }
          ]
        }
      }
    },

    dividend: "items": [
    {
      "ticker": "CNQ_US_EQ",
      "instrument": {
        "ticker": "CNQ_US_EQ",
        "name": "Canadian Natural Resources",
        "isin": "CA1363851017",
        "currency": "USD"
      },
      "reference": "da90cdf6-de06-4d27-8182-ad1c9a1782f5",
      "quantity": 8.54570173,
      "amount": 2.84,
      "currency": "EUR",
      "grossAmountPerShare": 0.4395650767,
      "amountInEuro": 2.84,
      "paidOn": "2026-10-02T14:09:16.000+03:00",
      "type": "DIVIDEND"
    },
 */

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const importTransactionData = async () => {
  const orders = [];
  let url = "https://live.trading212.com/api/v0/equity/history/transactions?limit=50";
  let response;
  do {
    response = await fetchTrading212Transaction(url);

    if (response.status !== 200) {
      break;
    }

    const tradingTransactions = response.data;

    for (const item of tradingTransactions.items) {
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

    // S'il n'y a pas de page suivante, on s'arrête
    if (!tradingTransactions.nextPagePath) {
      break;
    }

    url = `https://live.trading212.com/${tradingTransactions.nextPagePath}`;

    await timeout(5000);
  } while (response.status === 200);
  console.log("Transaction Finished");
  return {
    orders,
    lastTransactionReference: orders.length
      ? orders[0].reference
      : undefined,
  };
};

const importOrderData = async () => {
  const orders = [];
  let url = "https://live.trading212.com/api/v0/equity/history/orders?limit=50";

  let response;

  do {
    response = await fetchTrading212Transaction(url);

    if (response.status !== 200) {
      break;
    }

    const tradingOrder = response.data;

    for (const item of tradingOrder.items) {
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
        });
      }
    }

    // S'il n'y a pas de page suivante, on s'arrête
    if (!tradingOrder.nextPagePath) {
      break;
    }

    url = `https://live.trading212.com/${tradingOrder.nextPagePath}`;

    await timeout(5000);
  } while (response.status === 200);
  console.log("Order Finished");
  return {
    orders,
    lastOrderReference: orders.length
      ? orders[0].reference
      : undefined,
  };
};

const importDividendData = async () => {
  const orders = [];
  let url = "https://live.trading212.com/api/v0/equity/history/dividends?limit=50";

  let response;

  do {
    response = await fetchTrading212Transaction(url);

    if (response.status !== 200) {
      break;
    }

    const tradingDividend = response.data;

    for (const item of tradingDividend.items) {
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
    // S'il n'y a pas de page suivante, on s'arrête
    if (!tradingDividend.nextPagePath) {
      break;
    }

    url = `https://live.trading212.com/${tradingDividend.nextPagePath}`;

    await timeout(5000);
  } while (response.status === 200);
  console.log("Dividend Finished");
  return {
    orders,
    lastDividendReference: orders.length
      ? orders[0].reference
      : undefined,
  };
};

stockSrv.importTrading212 = async userId => {
  logger.debug("Import data from Trading 212");

  const tradingInstruments
    = await fetchTrading212Positions(TRADING_212_POSITIONS_URL);

  await Promise.all(
    tradingInstruments.map(data => Stock.create(buildImportedStock(data))),
  );

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
      const stock = await stockSrv.getByIsin(userId, 2, order.isin);
      if (stock) {
        stock.dividendsReceived = new Decimal(stock.dividendsReceived).add(order.investedAmount);
        stock.save();
      }
    }
  }

  await lastReferenceSrv.create(userId, {
    lastDividendReference: dividendData.lastDividendReference,
    lastOrderReference: orderData.lastOrderReference,
    lastTransactionReference: transactionData.lastTransactionReference,
  });
  console.log("DONE");
};

/* TODO: Refresh with looping from stocks and find */
stockSrv.refreshPrice = async userId => {
  logger.debug("Refresh price from Trading 212");

  const tradingInstruments
    = await fetchTrading212Positions();

  const stocks = await Promise.all(
    tradingInstruments.map(data => stockSrv.getByIsin(
      userId,
      data.instrument.isin,
    )),
  );

  await Promise.all(
    tradingInstruments.map(async (data, index) => {
      const stock = stocks[index];

      if (!stock) {
        logger.warn(
          "Unable to refresh stock=[%s]: stock not found",
          data.instrument.isin,
        );
        return;
      }

      stock.currentPrice
        = getPriceInPortfolioCurrency(data).toNumber();

      await stock.save();
    }),
  );
};

// -----------------------------------------------------------------------------
// Simulation helpers
// -----------------------------------------------------------------------------

const calculateNewAverage = ({
  oldAverage,
  oldQuantity,
  newPrice,
  newQuantity,
}) => {
  const totalQuantity = toDecimal(oldQuantity)
    .add(toDecimal(newQuantity));

  if (totalQuantity.isZero()) {
    return new Decimal(0);
  }

  return toDecimal(oldAverage)
    .mul(toDecimal(oldQuantity))
    .add(
      toDecimal(newPrice).mul(toDecimal(newQuantity)),
    )
    .div(totalQuantity);
};

const calculateRecommendedQuantity = ({
  portfolio,
  monthlyContribution,
  priority,
  price,
}) => {
  if (!priority) {
    return 0;
  }

  const availableNextMonth = toDecimal(
    portfolio.account.balance,
  ).add(monthlyContribution);

  return Decimal.max(
    0,
    availableNextMonth
      .sub(toDecimal(priority.currentPrice))
      .div(toDecimal(price))
      .floor(),
  ).toNumber();
};

const getCurrentPortfolioValue = stocks => stocks.reduce(
  (total, stock) => total.add(stock.investedAmount),
  new Decimal(0),
);

const getSimulatedPortfolioValue = ({
  currentPortfolioValue,
  purchases,
}) => currentPortfolioValue.add(
  getTotalPurchaseValue(purchases),
);

const buildSimulationRecommendation = ({
  stock,
  stockToBuy,
  portfolio,
  monthlyContribution,
  priority,
  simulatedPortfolioValue,
}) => {
  const price = toDecimal(stockToBuy.price);
  const quantity = toDecimal(stockToBuy.quantity);

  const recommended = calculateRecommendedQuantity({
    portfolio,
    monthlyContribution,
    priority,
    price,
  });

  /*
   * NOTE:
   * Le code original utilisait `stock.weight` ici.
   *
   * On le conserve pour ne pas modifier la logique métier existante.
   * Si `weight` représente réellement un pourcentage et non une
   * valeur monétaire, ce calcul devra être corrigé.
   */
  const simulatedStockValue = toDecimal(stock.investedAmount)
    .add(quantity.mul(price));

  const newWeight = simulatedPortfolioValue.isZero()
    ? new Decimal(0)
    : simulatedStockValue
      .div(simulatedPortfolioValue)
      .mul(100);

  const newAverage = calculateNewAverage({
    oldAverage: stock.average,
    oldQuantity: stock.quantity,
    newPrice: stockToBuy.price,
    newQuantity: stockToBuy.quantity,
  });

  return {
    isin: stockToBuy.isin,
    recommended,
    newWeight: newWeight.toFixed(Constants.DECIMAL),
    quantity: toDecimal(stock.quantity).add(quantity),
    investedAmount: simulatedStockValue,
    newInvestedAmount: simulatedStockValue,
    newAverage,
  };
};

const buildMissingStockRecommendation = isin => ({
  isin,
  recommended: 0,
  currentWeight: "0.00",
  newWeight: "0.00",
  quantity: "0.00",
  investedAmount: "0.00",
  newAverage: "0.00",
});

const buildSecondaryCandidates = ({
  stocks,
  budget,
}) => stocks
  .map(stock => {
    const price = toDecimal(stock.currentPrice);

    if (price.isZero() || price.isNegative()) {
      return null;
    }

    const quantity = getAffordableQuantity(
      budget,
      price,
    );

    const remainingCash = toDecimal(budget).sub(
      toDecimal(quantity).mul(price),
    );

    return {
      isin: stock.isin,
      ticker: stock.ticker,
      name: stock.name,
      currentPrice: stock.currentPrice,
      quantity,
      remainingCashNextMonth: remainingCash.toFixed(2),
    };
  })
  .filter(stock => stock && stock.quantity > 0)
  .sort(
    (a, b) => toDecimal(a.currentPrice).cmp(
      toDecimal(b.currentPrice),
    ),
  );

// -----------------------------------------------------------------------------
// Simulation
// -----------------------------------------------------------------------------

stockSrv.simulate = (
  portfolio,
  stocks,
  stocksToBuy,
) => {
  logger.debug(
    "Simulate now and after for portfolio=[%s] with stocksToBuy=[%s]",
    portfolio.id,
    stocksToBuy,
  );

  const monthlyContribution
    = toDecimal(portfolio.monthlyContribution);

  // ---------------------------------------------------------------------------
  // 1. Valeur actuelle du portefeuille
  // ---------------------------------------------------------------------------

  const currentPortfolioValue
    = getCurrentPortfolioValue(stocks);

  // ---------------------------------------------------------------------------
  // 2. Recherche de l'action prioritaire
  // ---------------------------------------------------------------------------

  const priorityStocks = getPriorityStocks({
    portfolio,
    stocks,
  });

  const priority = priorityStocks[0];

  // ---------------------------------------------------------------------------
  // 3. Valeur du portefeuille après simulation
  // ---------------------------------------------------------------------------

  const simulatedPortfolioValue
    = getSimulatedPortfolioValue({
      currentPortfolioValue,
      purchases: stocksToBuy,
    });

  // ---------------------------------------------------------------------------
  // 4. Recommandations
  // ---------------------------------------------------------------------------

  const recommendations = stocksToBuy.map(stockToBuy => {
    const stock = stocks.find(
      item => item.isin === stockToBuy.isin,
    );

    if (!stock) {
      return buildMissingStockRecommendation(
        stockToBuy.isin,
      );
    }

    return buildSimulationRecommendation({
      stock,
      stockToBuy,
      portfolio,
      monthlyContribution,
      priority,
      simulatedPortfolioValue,
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Budget disponible le mois prochain
  // ---------------------------------------------------------------------------

  const nextMonthBudget = toDecimal(
    portfolio.account.balance,
  )
    .add(monthlyContribution)
    .sub(getTotalPurchaseValue(stocksToBuy));

  // ---------------------------------------------------------------------------
  // 6. Actions achetables le mois prochain
  // ---------------------------------------------------------------------------

  const secondaryCandidates
    = buildSecondaryCandidates({
      stocks,
      budget: nextMonthBudget,
    });
  return {
    recommendations,
    secondaryCandidates,
  };
};

stockSrv.advance = async () => {
  CURRENT_MONTH++;
  if (CURRENT_MONTH === 12) {
    CURRENT_MONTH = 0;
    CURRENT_YEAR++;
  }
  const portfolio = await portfolioSrv.getById(1, 1);
  portfolio.account.balance = new Decimal(portfolio.account.balance)
    .add(portfolio.monthlyContribution);
  portfolio.account.save();
  portfolio.save();
  return portfolio;
};

stockSrv.reset = async () => {
  const stocks = await stockSrv.getAll(1, 1);
  for (const stock of stocks.rows) {
    stock.average = 0;
    stock.quantity = 0;
    stock.investedAmount = 0;
    stock.dividendsReceived = 0;
    stock.boughtThisYear = false;
    stock.save();
  }
  const portfolios = await portfolioSrv.getById(1, 1);
  portfolios.account.balance = portfolios.account.initialBalance;
  portfolios.account.save();
  portfolios.save();
  CURRENT_MONTH = 0;
  CURRENT_YEAR = 2027;
  return {
    stocks,
    portfolios,
  };
};

// -----------------------------------------------------------------------------
// Orders
// -----------------------------------------------------------------------------

stockSrv.createBatch = async (
  userId,
  portfolioId,
  ordersToCreate,
) => {
  logger.debug(
    "Create orders for user=[%s] and portfolio=[%s] with stocks=[%s]",
    userId,
    portfolioId,
    ordersToCreate,
  );

  const portfolio = await portfolioSrv.getById(userId, portfolioId);
  // On conserve volontairement l'ordre d'exécution.
  for (const order of ordersToCreate) {
    order.receivedAt = new moment();
    await orderSrv.create(
      portfolio.id,
      order,
      OrderType.ORDER,
    );
    const stock = await stockSrv.getByIsin(userId, portfolio.id, order.isin);
    stock.average = calculateNewAverage({
      oldAverage: stock.average,
      oldQuantity: stock.quantity,
      newPrice: order.price,
      newQuantity: order.quantity,
    });
    stock.quantity = new Decimal(stock.quantity).add(order.quantity);
    stock.investedAmount = new Decimal(stock.investedAmount).add(order.investedAmount);
    if (stock.currentPrice >= portfolio.monthlyContribution) stock.boughtThisYear = true;
    await stock.save();
  }
  const stocks = await stockSrv.getAll(userId, portfolio.id);
  const portfolioValue = getCurrentPortfolioValue(stocks.rows);
  for (const stock of stocks.rows) {
    stock.weight = portfolioValue.isZero()
      ? new Decimal(0)
      : new Decimal(stock.investedAmount)
        .div(portfolioValue)
        .mul(100);
    await stock.save();
  }
};

module.exports = stockSrv;
