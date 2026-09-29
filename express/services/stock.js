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
  return stockSrv.getData();
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

    const currentValue = new Decimal(stock.quantity)
      .mul(new Decimal(stock.currentPrice));

    const currentWeight = currentPortfolioValue.isZero()
      ? new Decimal(0)
      : currentValue
        .div(currentPortfolioValue)
        .mul(100);

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

    const simulatedStockValue = currentValue.add(
      new Decimal(stockToBuy.quantity).mul(price),
    );

    const newWeight = simulatedPortfolioValue.isZero()
      ? new Decimal(0)
      : simulatedStockValue
        .div(simulatedPortfolioValue)
        .mul(100);

    return {
      isin: stockToBuy.isin,
      recommended,
      currentWeight: currentWeight.toFixed(2),
      newWeight: newWeight.toFixed(2),
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

stockSrv.simulateBack = (portfolio, stocks, stockToBough) => {
  logger.debug(
    "Simulate now and after for portfolio=[%s] with stocksToBough=[%s]",
    portfolio.id,
    stockToBough,
  );

  /*
   * ------------------------------------------------------------
   * 1. Données de base
   * ------------------------------------------------------------
   */

  const monthlyContribution = new Decimal(
    portfolio.monthlyContribution || 0,
  );

  /*
   * IMPORTANT :
   *
   * Ici je considère que portfolio.account.balance
   * correspond au cash actuellement disponible.
   *
   * Si ton vrai champ est différent, adapte cette ligne.
   */
  const currentCash = new Decimal(
    portfolio.account?.balance || portfolio.balance || 0,
  );

  /*
   * ------------------------------------------------------------
   * 2. Trouver l'action prioritaire
   * ------------------------------------------------------------
   *
   * On reprend la même logique que getPriorityStocks().
   */

  const priorityStocks = getPriorityStocks({
    stocks,
    portfolio,
  });

  const priority = priorityStocks[0] || null;

  if (!priority) {
    return {
      priority: null,
      stockToBough: [],
      stocks: [],
      currentCash: currentCash.toFixed(Constants.DECIMAL),
      simulatedCash: currentCash.toFixed(Constants.DECIMAL),
      monthlyContribution: monthlyContribution.toFixed(Constants.DECIMAL),
    };
  }

  const priorityPrice = new Decimal(priority.currentPrice);

  /*
   * ------------------------------------------------------------
   * 3. Quantité maximale achetable maintenant
   * ------------------------------------------------------------
   *
   * Sans tenir compte de la priorité :
   *
   * maxQuantityNow =
   *   floor(cash actuel / prix)
   */

  const maxQuantityNow = stock => {
    const price = new Decimal(stock.price);

    if (price.lte(0)) {
      return 0;
    }

    return currentCash
      .div(price)
      .floor()
      .toNumber();
  };

  /*
   * ------------------------------------------------------------
   * 4. Quantité recommandée
   * ------------------------------------------------------------
   *
   * On cherche le nombre maximum d'actions secondaires
   * que l'on peut acheter maintenant tout en pouvant
   * acheter la priorité le mois prochain.
   *
   * cash après achat :
   *
   * currentCash - quantity * price
   *
   * cash disponible mois prochain :
   *
   * currentCash
   * - quantity * price
   * + monthlyContribution
   *
   * Il faut :
   *
   * cash disponible mois prochain >= priorityPrice
   */

  const recommendedQuantity = stock => {
    const price = new Decimal(stock.price);

    if (price.lte(0)) {
      return 0;
    }

    /*
     * Budget maximal pouvant être dépensé maintenant
     * tout en conservant la capacité d'achat de la priorité
     * le mois prochain.
     */
    const maxSpend = currentCash
      .add(monthlyContribution)
      .sub(priorityPrice);

    if (maxSpend.lte(0)) {
      return 0;
    }

    const quantity = maxSpend
      .div(price)
      .floor();

    /*
     * On ne peut évidemment pas acheter plus que
     * ce que le cash actuel permet.
     */
    const maximumAvailable = currentCash
      .div(price)
      .floor();

    return Decimal.min(
      quantity,
      maximumAvailable,
    ).toNumber();
  };

  /*
   * ------------------------------------------------------------
   * 5. Simulation des actions de stockToBough
   * ------------------------------------------------------------
   */

  const simulatedStockToBough = stockToBough.map(stock => {
    const price = new Decimal(stock.price || 0);
    const quantity = new Decimal(stock.quantity || 0);

    const maxNow = maxQuantityNow(stock);
    const recommended = recommendedQuantity(stock);

    /*
     * Quantité réellement utilisée pour la simulation.
     *
     * Ici on utilise la quantité passée dans stockToBough.
     *
     * Exemple :
     *
     * stockToBough = {
     *   quantity: 2
     * }
     *
     * => simulation avec 2 actions.
     */
    const simulatedQuantity = quantity;

    const simulatedPurchaseValue = price.mul(simulatedQuantity);

    /*
     * --------------------------------------------------------
     * 6. Valeur de la position après simulation
     * --------------------------------------------------------
     */

    const existingStock = stocks.find(
      item => item.isin === stock.isin,
    );

    const existingQuantity = existingStock
      ? new Decimal(existingStock.quantity || 0)
      : new Decimal(0);

    const simulatedTotalQuantity = existingQuantity
      .add(simulatedQuantity);

    const simulatedValue = price.mul(simulatedTotalQuantity);

    return {
      ...stock,

      maxQuantityNow: maxNow,

      recommended,

      simulatedQuantity: simulatedQuantity.toFixed(Constants.DECIMAL),

      simulatedPurchaseValue:
        simulatedPurchaseValue.toFixed(Constants.DECIMAL),

      simulatedValue:
        simulatedValue.toFixed(Constants.DECIMAL),
    };
  });

  /*
   * ------------------------------------------------------------
   * 7. Calcul de la valeur actuelle du portefeuille
   * ------------------------------------------------------------
   *
   * Pour chaque position :
   *
   * quantity * currentPrice
   */

  const currentPositionsValue = stocks.reduce(
    (total, stock) => {
      const quantity = new Decimal(stock.quantity || 0);
      const price = new Decimal(stock.currentPrice || 0);

      return total.add(
        quantity.mul(price),
      );
    },
    new Decimal(0),
  );

  /*
   * Valeur actuelle totale du portefeuille
   *
   * = positions + cash
   */

  const currentPortfolioValue = currentPositionsValue
    .add(currentCash);

  /*
   * ------------------------------------------------------------
   * 8. Valeur du portefeuille après simulation
   * ------------------------------------------------------------
   *
   * On commence par la valeur actuelle des positions.
   */

  let simulatedPositionsValue = currentPositionsValue;

  /*
   * On calcule également le cash après les achats
   * demandés dans stockToBough.
   */

  let simulatedCash = currentCash;

  for (const stock of stockToBough) {
    const price = new Decimal(stock.price || 0);
    const quantity = new Decimal(stock.quantity || 0);

    const purchaseValue = price.mul(quantity);

    simulatedCash = simulatedCash.sub(purchaseValue);

    /*
     * Si le titre existe déjà dans stocks,
     * on ajoute uniquement la nouvelle valeur achetée.
     *
     * S'il n'existe pas, on ajoute toute la position.
     */
    simulatedPositionsValue = simulatedPositionsValue
      .add(purchaseValue);
  }

  const simulatedPortfolioValue = simulatedPositionsValue
    .add(simulatedCash);

  /*
   * ------------------------------------------------------------
   * 9. Pondération des stocks
   * ------------------------------------------------------------
   */

  const simulatedStocks = stocks.map(stock => {
    const quantity = new Decimal(stock.quantity || 0);
    const price = new Decimal(stock.currentPrice || 0);

    const currentValue = quantity.mul(price);

    /*
     * Achat supplémentaire correspondant à stockToBough
     */

    const additionalPurchase = stockToBough
      .filter(item => item.isin === stock.isin)
      .reduce(
        (total, item) => {
          const itemPrice = new Decimal(item.price || 0);
          const itemQuantity = new Decimal(item.quantity || 0);

          return total.add(
            itemPrice.mul(itemQuantity),
          );
        },
        new Decimal(0),
      );

    /*
     * Nouvelle quantité après simulation
     *
     * On utilise la quantité existante + les achats.
     */
    const additionalQuantity = stockToBough
      .filter(item => item.isin === stock.isin)
      .reduce(
        (total, item) => total.add(
          new Decimal(item.quantity || 0),
        ),
        new Decimal(0),
      );

    const simulatedQuantity = quantity
      .add(additionalQuantity);

    /*
     * Pour la valorisation de la position simulée,
     * on utilise le currentPrice du stock.
     *
     * Attention :
     * si stockToBough.price est différent de currentPrice,
     * le prix d'achat et la valorisation peuvent différer.
     */
    const simulatedValue = price
      .mul(simulatedQuantity);

    const currentWeight = currentPortfolioValue.gt(0)
      ? currentValue
        .div(currentPortfolioValue)
        .mul(100)
      : new Decimal(0);

    const simulatedWeight = simulatedPortfolioValue.gt(0)
      ? simulatedValue
        .div(simulatedPortfolioValue)
        .mul(100)
      : new Decimal(0);

    return {
      // ...stock,

      currentValue: currentValue.toFixed(Constants.DECIMAL),

      currentWeight: currentWeight.toFixed(Constants.DECIMAL),

      simulatedQuantity:
        simulatedQuantity.toFixed(Constants.DECIMAL),

      simulatedValue:
        simulatedValue.toFixed(Constants.DECIMAL),

      simulatedWeight:
        simulatedWeight.toFixed(Constants.DECIMAL),
    };
  });

  /*
   * ------------------------------------------------------------
   * 10. Retour final
   * ------------------------------------------------------------
   */

  return {
    priority: {
      isin: priority.isin,
      ticker: priority.ticker,
      name: priority.name,
      price: new Decimal(priority.currentPrice).toFixed(Constants.DECIMAL),
    },

    currentCash:
      currentCash.toFixed(Constants.DECIMAL),

    simulatedCash:
      simulatedCash.toFixed(Constants.DECIMAL),

    monthlyContribution:
      monthlyContribution.toFixed(Constants.DECIMAL),

    currentPositionsValue:
      currentPositionsValue.toFixed(Constants.DECIMAL),

    currentPortfolioValue:
      currentPortfolioValue.toFixed(Constants.DECIMAL),

    simulatedPositionsValue:
      simulatedPositionsValue.toFixed(Constants.DECIMAL),

    simulatedPortfolioValue:
      simulatedPortfolioValue.toFixed(Constants.DECIMAL),

    stockToBough:
    simulatedStockToBough,

    stocks:
    simulatedStocks,
  };
};

module.exports = stockSrv;
