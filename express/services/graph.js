const moment = require("moment");
const {logger} = require("./logger.js");
const TransactionType = require("./../constants/transactiontype.js");
const transactionSrv = require("./transaction.js");
const accountSrv = require("./account.js");
const categorySrv = require("./category.js");
const plannedTransactionSrv = require("./plannedtransaction.js");
const plannedTransferSrv = require("./plannedtransfer.js");
const transferSrv = require("./transfer.js");

const graphSrv = {};

// Constants
const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 5;
const DAYS_IN_YEAR = 365.25;
const MONTHS_IN_YEAR = 12;
const PRECISION_MULTIPLIER = 100;
const INTEREST_PRECISION = 100000000;
const MAX_DECIMAL = 16777215;
const BASE_16 = 16;

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Setpembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// ============================================================================
// HELPER FUNCTIONS - Shared utilities
// ============================================================================

// Helper: Calculate sum of transaction data amounts
const calculateTotalTransactionData = transactionData => transactionData
  .map(d => parseFloat(d.amount))
  .reduce((acc, val) => acc + val, 0);

// Helper: Round number to 2 decimal places
const roundToTwoDecimals = num => Math.round(
  (num + Number.EPSILON)
    * PRECISION_MULTIPLIER,
)
    / PRECISION_MULTIPLIER;

// Helper: Generate random color
const generateRandomColor = () => {
  const randomNum = Math.floor(Math.random() * MAX_DECIMAL);
  return `#${randomNum.toString(BASE_16)}`;
};

// Helper: Check if transaction is income type
const isIncomeTransaction = type => (
  type === TransactionType.INCOME
      || type === TransactionType.EXPECTED_INCOME
      || type === TransactionType.INTEREST
);

// Helper: Check if transaction is expense type
const isExpenseTransaction = type => (
  type === TransactionType.EXPENSE || type === TransactionType.EXPECTED_EXPENSE
);

// ============================================================================
// SUMMARY AND SIMPLE GRAPHS
// ============================================================================

// Helper: Calculate total transaction with account limits
const calculateTotalTransaction = (transaction, account) => {
  let totalTransaction = 0;

  if (transaction.type === TransactionType.EXPECTED_EXPENSE) {
    totalTransaction -= calculateTotalTransactionData(transaction.data);
  } else if (transaction.type === TransactionType.EXPECTED_INCOME) {
    const transactionTotal = calculateTotalTransactionData(transaction.data);
    const newBalance = account.balance + transactionTotal;
    const maxAmount = account.accountType.maxAmount;

    if (maxAmount !== 0 && newBalance > maxAmount) {
      transaction.data = [];
      totalTransaction += maxAmount - account.balance;
    } else {
      totalTransaction += transactionTotal;
    }
  }

  return totalTransaction;
};

// Helper: Process income/outcome from transactions
const processTransactionAmounts = transactions => {
  let income = 0;
  let outcome = 0;

  for (const transaction of transactions) {
    const amount = calculateTotalTransactionData(transaction.data);

    if (transaction.type === TransactionType.EXPENSE) {
      outcome += amount;
    } else {
      income += amount;
    }
  }

  return {income, outcome};
};

// Create pie chart configuration
const createPieChart = (label, income, outcome) => ({
  type: "pie",
  label,
  labels: ["Revenue", "Dépense"],
  column: 4,
  backgroundColor: ["#48c78e", "#f14668"],
  data: [roundToTwoDecimals(income), roundToTwoDecimals(outcome)],
});

// Get summary graph for current or previous month
graphSrv.getSummary = async (user, type) => {
  logger.debug("Create graph data for summary");

  const transactions = await transactionSrv.getAllByUserAndRange(user.id, {
    unit: "month",
    range: type,
  });

  const label = type === "this" ? "Ce mois" : "Mois précédent";
  const {income, outcome} = processTransactionAmounts(transactions.rows);

  return createPieChart(label, income, outcome);
};

// ============================================================================
// LAST 7 DAYS GRAPH
// ============================================================================

// Helper: Create date labels for last N days
const createDayLabels = numberOfDays => {
  const labels = [];
  for (let i = 0; i < numberOfDays; i++) {
    labels.push(new moment().subtract(i, "day")
      .format("DD/MM"));
  }
  return labels;
};

// Helper: Initialize transactions by days object
const initTransactionsByDays = numberOfDays => {
  const byDays = {};
  for (let i = 0; i < numberOfDays; i++) {
    const dayKey = new moment().subtract(i, "day")
      .format("DD");
    byDays[dayKey] = [];
  }
  return byDays;
};

// Helper: Group transactions by day
const groupTransactionsByDay = (transactions, numberOfDays) => {
  const transactionsByDays = initTransactionsByDays(numberOfDays);

  for (const transaction of transactions) {
    const dayKey = new moment(transaction.transactionDate).format("DD");
    if (transactionsByDays[dayKey]) {
      transactionsByDays[dayKey].push(transaction);
    }
  }

  return transactionsByDays;
};

// Helper: Calculate daily amounts
const calculateDailyAmounts = (transactionsByDays, numberOfDays) => {
  const income = new Array(numberOfDays).fill(0);
  const outcome = new Array(numberOfDays).fill(0);

  for (let i = 0; i < numberOfDays; i++) {
    const dayKey = new moment().subtract(i, "day")
      .format("DD");
    const dayTransactions = transactionsByDays[dayKey] || [];

    for (const transaction of dayTransactions) {
      const amount = calculateTotalTransactionData(transaction.data);

      if (transaction.type === TransactionType.EXPENSE) {
        outcome[i] += amount;
      } else {
        income[i] += amount;
      }
    }
  }

  return {income, outcome};
};

// Helper: Create bar chart dataset
const createBarDataset = (label, data, backgroundColor, borderColor) => {
  const colors = new Array(DAYS_IN_WEEK).fill(backgroundColor);
  const borders = new Array(DAYS_IN_WEEK).fill(borderColor);

  return {
    label,
    data,
    backgroundColor: colors,
    borderColor: borders,
    borderWidth: 1,
  };
};

// Get last 7 days graph
graphSrv.lastSeventhDays = async user => {
  logger.debug("Get last seventh days graph");

  const transactions = await transactionSrv.getAllByUserAndRange(user.id, {
    unit: "day",
    range: "seventh",
  });

  const labels = createDayLabels(DAYS_IN_WEEK);
  const transactionsByDays = groupTransactionsByDay(transactions.rows, DAYS_IN_WEEK);
  const {income, outcome} = calculateDailyAmounts(transactionsByDays, DAYS_IN_WEEK);

  return {
    type: "bar",
    label: "7 derniers jours",
    labels: labels.reverse(),
    column: 1,
    datasets: [
      createBarDataset("Dépense", outcome.reverse(), "#fd8d8d", "#e53838"),
      createBarDataset("Revenu", income.reverse(), "#c5ffaa", "#4fe538"),
    ],
  };
};

// ============================================================================
// BALANCE GRAPH (5 weeks)
// ============================================================================

// Helper: Initialize weekly transaction buckets
const initWeeklyData = numberOfWeeks => {
  const byWeeks = {};
  byWeeks[new moment().startOf("week")
    .format("DD/MM")] = [];

  for (let i = 1; i < numberOfWeeks; i++) {
    const weekKey = new moment().subtract(i, "week")
      .startOf("week")
      .format("DD/MM");
    byWeeks[weekKey] = [];
  }

  return byWeeks;
};

// Helper: Create week labels
const createWeekLabels = numberOfWeeks => {
  const labels = [new moment().format("DD/MM")];

  for (let i = 1; i < numberOfWeeks; i++) {
    labels.push(new moment().subtract(i, "week")
      .startOf("isoWeek")
      .format("DD/MM"));
  }

  return labels;
};

// Helper: Group transactions by week
const groupTransactionsByWeek = transactions => {
  const byWeeks = initWeeklyData(WEEKS_TO_SHOW);

  for (const transaction of transactions) {
    const weekKey = new moment(transaction.transactionDate).startOf("week")
      .format("DD/MM");

    if (byWeeks[weekKey]) {
      byWeeks[weekKey].push(transaction);
    }
  }

  return byWeeks;
};

// Helper: Calculate weekly balance change
const calculateWeeklyBalance = weekTransactions => {
  let total = 0;

  for (const transaction of weekTransactions) {
    const amount = calculateTotalTransactionData(transaction.data);

    if (transaction.type === TransactionType.EXPENSE) {
      total += amount;
    } else {
      total -= amount;
    }
  }

  return total;
};

// Helper: Build account balance dataset
const buildAccountBalanceDataset = (account, transactionsByWeeks) => {
  const accountBalance = new Array(WEEKS_TO_SHOW).fill(0);
  accountBalance[0] = parseFloat(account.balance);

  for (let i = 1; i < WEEKS_TO_SHOW; i++) {
    const weekKey = new moment().subtract(i - 1, "week")
      .startOf("week")
      .format("DD/MM");
    const weekTransactions = transactionsByWeeks[weekKey] || [];
    const weekChange = calculateWeeklyBalance(weekTransactions);
    accountBalance[i] = accountBalance[i - 1] + weekChange;
  }

  return {
    label: account.name,
    data: accountBalance.reverse(),
    fill: false,
    borderColor: account.accountType.color,
    tension: 0.1,
  };
};

// Get balance graph for all accounts
graphSrv.balance = async user => {
  logger.debug("Get balance graph for all accounts");

  const accounts = await accountSrv.getAllByUser(user.id);
  const labels = createWeekLabels(WEEKS_TO_SHOW);
  const datasets = [];

  for (const account of accounts.rows) {
    const transactions = await transactionSrv.getAllByAccountAndRange(account.id, {
      unit: "week",
      number: WEEKS_TO_SHOW,
    });

    const transactionsByWeeks = groupTransactionsByWeek(transactions.rows);
    const dataset = buildAccountBalanceDataset(account, transactionsByWeeks);
    datasets.push(dataset);
  }

  return {
    type: "line",
    label: "Solde sur les 5 dernières semaines",
    data: {
      labels: labels.reverse(),
      datasets,
    },
  };
};

// ============================================================================
// CATEGORIES GRAPHS
// ============================================================================

// Helper: Initialize category totals
const initCategoryTotals = categories => {
  const totals = {};
  for (const category of categories) {
    totals[category.name] = 0;
  }
  return totals;
};

// Helper: Accumulate transaction amounts by category
const accumulateCategoryTotals = (transactions, totals) => {
  for (const transaction of transactions) {
    for (const data of transaction.data) {
      totals[data.category.name] += parseFloat(data.amount);
    }
  }
};

// Helper: Create category datasets
const createCategoryDatasets = totals => {
  const datasets = [];

  for (const [key, value] of Object.entries(totals)) {
    datasets.push({
      label: key,
      data: [value],
      backgroundColor: generateRandomColor(),
      borderWidth: 2,
      borderRadius: 5,
    });
  }

  return datasets;
};

// Get categories graph
graphSrv.categories = async user => {
  const categories = await categorySrv.getAll(user.id);
  const transactions = await transactionSrv.getAllByUser(user.id);

  const totalByCategory = initCategoryTotals(categories.rows);
  accumulateCategoryTotals(transactions.rows, totalByCategory);

  const datasets = createCategoryDatasets(totalByCategory);

  return {
    type: "bar",
    label: "Total de toute les catégories",
    labels: " ",
    column: 12,
    datasets,
    options: {maintainAspectRatio: false},
  };
};

// Helper: Initialize subcategory data
const initSubcategoryData = subCategories => {
  const labels = [];
  const backgroundColor = [];
  const dataObject = {};

  for (const subCategory of subCategories) {
    labels.push(subCategory.name);
    backgroundColor.push(generateRandomColor());
    dataObject[subCategory.name] = 0;
  }

  return {labels, backgroundColor, dataObject};
};

// Helper: Accumulate subcategory amounts
const accumulateSubcategoryData = (transactions, dataObject) => {
  for (const transaction of transactions) {
    for (const rowData of transaction.data) {
      dataObject[rowData.subCategory.name] += parseFloat(rowData.amount);
    }
  }
};

// Get graph by category
graphSrv.byCategory = async (user, category) => {
  const {labels, backgroundColor, dataObject} = initSubcategoryData(category.subCategories);

  const transactions = await transactionSrv.getAllByUserAndCategory(user.id, category.id);

  accumulateSubcategoryData(transactions.rows, dataObject);

  return {
    label: category.name,
    type: "pie",
    labels,
    column: 1,
    backgroundColor,
    data: Object.values(dataObject),
  };
};

// ============================================================================
// ACCOUNT LIST GRAPH - Line graph for account overview
// ============================================================================

// Helper: Group transactions by month
const groupTransactionsByMonth = transactions => {
  const byMonth = Array.from({length: MONTHS_IN_YEAR}, () => []);

  for (const transaction of transactions) {
    const month = new moment(transaction.transactionDate).month();
    byMonth[month].push(transaction);
  }

  return byMonth;
};

// Helper: Group transfers by month
const groupTransfersByMonth = transfers => {
  const byMonth = Array.from({length: MONTHS_IN_YEAR}, () => []);

  for (const transfer of transfers) {
    const month = new moment(transfer.transferDate).month();
    byMonth[month].push(transfer);
  }

  return byMonth;
};

// Helper: Process month transactions for balance calculation
const processMonthTransactionsForBalance = (transactions, month, incomeArr, outcomeArr) => {
  let balance = 0;

  for (const transaction of transactions) {
    const amount = calculateTotalTransactionData(transaction.data);

    if (isIncomeTransaction(transaction.type)) {
      incomeArr[month] += amount;
      balance += amount;
    } else if (isExpenseTransaction(transaction.type)) {
      outcomeArr[month] += amount;
      balance -= amount;
    }
  }

  return balance;
};

// Helper: Process month transfers for balance calculation
const processMonthTransfersForBalance = (transfers, month, accountId, incomeArr, outcomeArr) => {
  let balance = 0;

  for (const transfer of transfers) {
    const amount = parseFloat(transfer.amount);

    if (accountId === transfer.senderId) {
      balance -= amount;
      outcomeArr[month] += amount;
    } else if (accountId === transfer.receiverId) {
      balance += amount;
      incomeArr[month] += amount;
    }
  }

  return balance;
};

// Helper: Calculate monthly balances for an account
const calculateAccountMonthlyBalances = params => {
  const {
    account,
    transactionsByMonth,
    transfersByMonth,
    totalBalance,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
  } = params;

  const creationMonth = new moment(account.creationDate).month();
  totalBalance[creationMonth] = account.initialBalance;

  for (let month = 0; month < MONTHS_IN_YEAR; month++) {
    let monthBalance = totalBalance[month];

    if (transactionsByMonth[month].length > 0) {
      monthBalance += processMonthTransactionsForBalance(
        transactionsByMonth[month],
        month,
        incomeTransactions,
        outcomeTransactions,
      );
    }

    if (transfersByMonth[month].length > 0) {
      monthBalance += processMonthTransfersForBalance(
        transfersByMonth[month],
        month,
        account.id,
        incomeTransfers,
        outcomeTransfers,
      );
    }

    if (month === 0) {
      totalBalance[month] = monthBalance;
    } else {
      totalBalance[month] = monthBalance + totalBalance[month - 1];
    }
  }
};

// Create account overview line graph
graphSrv.createAccountOverviewGraph = async account => {
  logger.debug("Create overview graph for account=[%s]", account.id);

  const totalBalance = Array(MONTHS_IN_YEAR).fill(0);
  const incomeTransactions = Array(MONTHS_IN_YEAR).fill(0);
  const outcomeTransactions = Array(MONTHS_IN_YEAR).fill(0);
  const incomeTransfers = Array(MONTHS_IN_YEAR).fill(0);
  const outcomeTransfers = Array(MONTHS_IN_YEAR).fill(0);

  const transactions = await transactionSrv.getAllByAccount(account.id);
  const transfers = await transferSrv.getAllByAccount(account.id);

  const transactionsByMonth = groupTransactionsByMonth(transactions.rows);
  const transfersByMonth = groupTransfersByMonth(transfers.rows);

  calculateAccountMonthlyBalances({
    account,
    transactionsByMonth,
    transfersByMonth,
    totalBalance,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
  });

  return {
    [account.accountType.type]: {
      type: "line",
      label: "Récapitulatif de la balance et des transactions",
      column: 2,
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: "Balance du compte",
            data: totalBalance,
            borderColor: "#0063cc",
          },
          {
            label: "Revenue",
            data: incomeTransactions,
            borderColor: "#32c832",
          },
          {
            label: "Dépense",
            data: outcomeTransactions,
            borderColor: "#e53838",
          },
          {
            label: "Virement Reçu",
            data: incomeTransfers,
            borderColor: "#7feaae",
          },
          {
            label: "Virement Emis",
            data: outcomeTransfers,
            borderColor: "#ea7c7c",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {position: "top"},
          title: {
            display: true,
            text: "Type de filtre",
          },
        },
        elements: {line: {tension: 0.1}},
      },
    },
  };
};

// ============================================================================
// ACCOUNT DETAILS GRAPHS - Pie charts per month
// ============================================================================

// Create pie chart for a specific month
graphSrv.createMonthPieChart = params => {
  const {month, totalBalance, period, income, outcome, incomeTransfers, outcomeTransfers}
      = params;

  const hasData = income > 0 || outcome > 0;

  if (hasData) {
    return {
      type: "pie",
      label: [MONTHS[month], totalBalance, period],
      labels: ["Revenue", "Dépense", "Virement reçus", "Virement émis"],
      column: 4,
      backgroundColor: ["#48c78e", "#f14668", "#d5ffea", "#ffc6cf"],
      data: [income, outcome, incomeTransfers, outcomeTransfers],
    };
  }

  return {
    type: "pie",
    label: [MONTHS[month], totalBalance, period],
    labels: ["Aucune Données"],
    column: 4,
    backgroundColor: ["#c7c7c7"],
    data: [1],
  };
};

// Create multiple pie charts for account details view
graphSrv.createAccountDetailsPieCharts = financialData => {
  logger.debug("Create pie charts for account details");

  const graphs = [];
  const {
    currentMonth,
    totalBalance,
    period,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
  } = financialData;

  for (let month = 0; month <= currentMonth; month++) {
    graphs.push(
      graphSrv.createMonthPieChart({
        month,
        totalBalance: totalBalance[month],
        period: period[month],
        income: incomeTransactions[month],
        outcome: outcomeTransactions[month],
        incomeTransfers: incomeTransfers[month],
        outcomeTransfers: outcomeTransfers[month],
      }),
    );
  }

  return graphs;
};

// ============================================================================
// FORECAST GRAPHS - Helper functions
// ============================================================================

// Helper: Reduce data array based on query unit
const reduceData = (dataArray, query) => {
  const {number: numberOfMonths, unit} = query;
  const reducedData = Array.from({length: numberOfMonths}, () => 0);

  if (unit === "year") {
    for (let i = 0; i < dataArray.length; i++) {
      reducedData[i] += dataArray[i][dataArray[i].length - 1];
    }
  } else {
    for (let i = 0; i < numberOfMonths; i++) {
      const amount = parseFloat(dataArray[i]);
      if (!isNaN(amount)) {
        reducedData[i] += amount;
      }
    }
  }

  return reducedData;
};

// Helper: Reduce data by index across account types
const reduceDataByIndex = (accountType, dataKey, query) => {
  const dataKeys = Object.keys(accountType);
  const {number: numberOfMonths, unit} = query;
  const reducedData = Array.from({length: numberOfMonths}, () => 0);

  for (const key of dataKeys) {
    const dataArray = accountType[key][dataKey];

    if (unit === "year") {
      for (let i = 0; i < dataArray.length; i++) {
        reducedData[i] += dataArray[i][dataArray[i].length - 1];
      }
    } else {
      for (let i = 0; i < numberOfMonths; i++) {
        const amount = parseFloat(dataArray[i]);
        if (!isNaN(amount)) {
          reducedData[i] += amount;
        }
      }
    }
  }

  return reducedData;
};

// Helper: Create time period labels
const createPeriodLabels = query => Array.from({length: query.number}, (element, index) => {
  const date = moment().add(index, query.unit);

  if (query.unit === "month") {
    return `${date.month() + 1}/${date.year()}`;
  }
  return date.year().toString();
});

// Helper: Initialize account balance structure
const initAccountBalance = query => {
  const createArray = i => {
    if (query.unit === "year") {
      if (i === 0) {
        return Array.from({length: MONTHS_IN_YEAR - new moment().month()}, () => 0);
      }
      return Array.from({length: MONTHS_IN_YEAR}, () => 0);
    }
    return 0;
  };

  return {
    data: Array.from({length: query.number}, (e, i) => createArray(i)),
    interest: Array.from({length: query.number}, (e, i) => createArray(i)),
    transactionsNumber: Array.from({length: query.number}, (e, i) => createArray(i)),
    averageExpensePerDay: Array.from({length: query.number}, () => 0),
    averageTransactionsPerDay: Array.from({length: query.number}, () => 0),
  };
};

// Helper: Set initial account balance
const setInitialBalance = (accountsBalance, account, query) => {
  const accountType = account.accountType.type;

  if (query.unit === "month") {
    accountsBalance[accountType].data[0] = account.balance;
  } else {
    accountsBalance[accountType].data[0][0] = account.balance;
  }
};

// Helper: Initialize accounts balance structure
const initAccountsBalance = (accounts, query) => {
  const accountsBalance = {};

  for (const account of accounts.rows) {
    accountsBalance[account.accountType.type] = initAccountBalance(query);
    setInitialBalance(accountsBalance, account, query);
  }

  return accountsBalance;
};

// Helper: Check if transfer exceeds max amount
const exceedsMaxAmount = (receiverBalance, transferAmount, maxAmount) => {
  const newBalance = receiverBalance + transferAmount;
  return maxAmount !== 0 && newBalance > maxAmount;
};

// Helper: Process monthly transfer
const processMonthlyTransfer = (transfer, accountsBalance, i, indexHolder) => {
  const {receiver, sender} = transfer;
  const amount = parseFloat(transfer.amount);
  const receiverType = receiver.accountType.type;
  const senderType = sender.accountType.type;

  const receiverBalance = accountsBalance[receiverType].data[i];

  if (exceedsMaxAmount(receiverBalance, amount, receiver.accountType.maxAmount)) {
    const newBalanceReceiver = receiverBalance + amount;
    const excess = newBalanceReceiver - receiver.accountType.maxAmount;
    accountsBalance[receiverType].data[i] += excess;
    accountsBalance[senderType].data[i] -= excess;
    indexHolder.value = transfer.id;
  } else {
    accountsBalance[receiverType].data[i] += amount;
    accountsBalance[senderType].data[i] -= amount;
  }
};

// Helper: Process weekly transfer for a month
const processWeeklyTransfer = (transfer, accountsBalance, i, weekCounter, indexHolder) => {
  const {receiver, sender} = transfer;
  const receiverType = receiver.accountType.type;
  const senderType = sender.accountType.type;

  const numberOfDays = new moment().add(i, "month")
    .daysInMonth();

  for (let d = 1; d <= numberOfDays; d++) {
    if (weekCounter.value === DAYS_IN_WEEK) {
      const totalWeeks = parseFloat(transfer.amount);
      const receiverBalance = accountsBalance[receiverType].data[i];

      if (exceedsMaxAmount(receiverBalance, totalWeeks, receiver.accountType.maxAmount)) {
        if (transfer.amount !== 0) {
          accountsBalance[receiverType].data[i] = receiverBalance;
          const excess = receiverBalance - receiver.accountType.maxAmount;
          accountsBalance[senderType].data[i] -= excess;
        }
        transfer.amount = 0;
        indexHolder.value = transfer.id;
      } else {
        accountsBalance[receiverType].data[i] += totalWeeks;
        accountsBalance[senderType].data[i] -= totalWeeks;
      }
      weekCounter.value = 1;
    } else {
      weekCounter.value++;
    }
  }
};

// Helper: Process all planned transfers for a month
const processPlannedTransfers = (transfers, accountsBalance, i, weekCounter) => {
  const indexHolder = {value: null};
  let t = transfers.rows.length;

  while (t--) {
    const transfer = transfers.rows[t];

    if (transfer.unit === "MONTH") {
      processMonthlyTransfer(transfer, accountsBalance, i, indexHolder);
    } else if (transfer.unit === "WEEK") {
      processWeeklyTransfer(transfer, accountsBalance, i, weekCounter, indexHolder);
    }
  }

  return indexHolder.value;
};

// Helper: Calculate yearly interest
const calculateYearlyInterest = (account, accountsBalance, i) => {
  const accountType = account.accountType.type;
  const oldAmount = accountsBalance[accountType].data[i];
  const interestRate = account.accountType.interest / PRECISION_MULTIPLIER;
  const newAmount = oldAmount * (1 + interestRate);
  const interest = newAmount - oldAmount;

  accountsBalance[accountType].data[i] += interest;
  accountsBalance[accountType].interest[i] = interest;
};

// Helper: Calculate daily interest for a month
const calculateDailyInterest = (account, accountsBalance, i) => {
  const daysInMonth = new moment().add(i, "month")
    .daysInMonth();
  const totalDataMonth = Array.from({length: daysInMonth}, () => 0);
  const totalInterestMonth = Array.from({length: daysInMonth}, () => 0);

  totalDataMonth[0] = accountsBalance[account.accountType.type].data[i];

  const interestRate = account.accountType.interest / PRECISION_MULTIPLIER;
  const dailyRate = (1 + interestRate) ** (1 / DAYS_IN_YEAR);

  for (let d = 1; d < totalDataMonth.length; d++) {
    const oldAmount = totalDataMonth[d - 1];
    const newAmount = oldAmount * dailyRate;
    const interest
        = Math.round((newAmount - oldAmount) * INTEREST_PRECISION) / INTEREST_PRECISION;

    totalInterestMonth[d] = interest;
    totalDataMonth[d] = newAmount;
  }

  const totalInterest = totalInterestMonth.reduce((acc, val) => acc + val, 0);
  accountsBalance[account.accountType.type].data[i] += totalInterest;
  accountsBalance[account.accountType.type].interest[i] += totalInterest;
};

// Helper: Apply interest to accounts
const applyAccountInterest = (accounts, accountsBalance, i, query) => {
  for (const account of accounts.rows) {
    if (account.accountType.unit === "YEAR") {
      if (query.startingDate.month() === 0) {
        calculateYearlyInterest(account, accountsBalance, i);
      }
    } else if (account.accountType.unit === "DAY") {
      calculateDailyInterest(account, accountsBalance, i);
    }
  }
};

// Helper: Process transactions for forecast month
const processPlannedTransactions = (transactions, accountsBalance, i) => {
  for (const transaction of transactions.rows) {
    const account = transaction.account;
    const accountType = account.accountType.type;

    accountsBalance[accountType].data[i] += calculateTotalTransaction(transaction, account);
    accountsBalance[accountType].transactionsNumber[i]++;
  }
};

// Helper: Carry forward previous month balance
const carryForwardBalance = (accounts, accountsBalance, i, query) => {
  if (query.unit === "month" && i !== 0) {
    for (const account of accounts.rows) {
      const accountType = account.accountType.type;
      accountsBalance[accountType].data[i] = accountsBalance[accountType].data[i - 1];
    }
  }
};

// Helper: Create line graph configuration
const createLineGraph = (label, labels, data, color) => ({
  type: "line",
  label,
  column: 12,
  data: {
    labels,
    datasets: [
      {
        label,
        data,
        fill: false,
        borderColor: color,
        tension: 0.1,
      },
    ],
  },
  options: {maintainAspectRatio: false},
});

// Helper: Aggregate forecast data
const aggregateForecastData = (accounts, accountsBalance, query) => {
  accountsBalance.allForecast = {
    data: reduceDataByIndex(accountsBalance, "data", query),
    interest: Array.from({length: query.number}, () => 0),
    transactionsNumber: Array.from({length: query.number}, () => 0),
    averageExpensePerDay: Array.from({length: query.number}, () => 0),
    averageTransactionsPerDay: Array.from({length: query.number}, () => 0),
  };

  for (const account of accounts.rows) {
    const accountType = account.accountType.type;

    for (let i = 0; i < query.number; i++) {
      accountsBalance.allForecast.interest[i] += parseFloat(
        accountsBalance[accountType].interest[i],
      );
      accountsBalance.allForecast.transactionsNumber[i] += parseFloat(
        accountsBalance[accountType].transactionsNumber[i],
      );

      const daysInPeriod = new moment().add(i, query.unit)
        .days();
      accountsBalance.allForecast.averageExpensePerDay[i]
          += parseFloat(accountsBalance[accountType].averageExpensePerDay[i]) / daysInPeriod;

      accountsBalance.allForecast.averageTransactionsPerDay[i] += parseFloat(
        accountsBalance[accountType].averageTransactionsPerDay[i],
      );
    }
  }
};

// Helper: Create account graphs
const createAccountGraphs = (accounts, accountsBalance, labels, query) => {
  const graphs = {};

  graphs.allForecast = createLineGraph(
    "Total du solde de tout les comptes",
    labels,
    accountsBalance.allForecast.data,
    "#39eeff",
  );

  for (const account of accounts.rows) {
    const accountType = account.accountType;
    graphs[accountType.name] = createLineGraph(
      `Total du solde du ${accountType.name}`,
      labels,
      reduceData(accountsBalance[accountType.type].data, query),
      "#3979ff",
    );
  }

  return graphs;
};

// ============================================================================
// FORECAST GRAPHS - Main functions
// ============================================================================

// Get all accounts forecast for month view
graphSrv.allAccountsForecastMonth = async (user, query) => {
  const accounts = await accountSrv.getAllByUser(user.id);
  const labels = createPeriodLabels(query);
  const accountsBalance = initAccountsBalance(accounts, query);
  const weekCounter = {value: 1};

  query.notTransactionsId = [];
  query.notTransfersId = [];

  if (query.type === "planned") {
    for (let i = 0; i < query.number; i++) {
      carryForwardBalance(accounts, accountsBalance, i, query);

      query.startingDate = new moment().add(i, query.unit)
        .startOf(query.unit);
      query.endingDate = new moment().add(i, query.unit)
        .endOf(query.unit);

      const plannedTransactions = await plannedTransactionSrv.getAllByUser(user.id, query);
      const plannedTransfers = await plannedTransferSrv.getAllByUser(user.id, query);

      processPlannedTransactions(plannedTransactions, accountsBalance, i);

      const indexToRemove = processPlannedTransfers(
        plannedTransfers,
        accountsBalance,
        i,
        weekCounter,
      );

      if (indexToRemove && !query.notTransfersId.includes(indexToRemove)) {
        query.notTransfersId.push(indexToRemove);
      }

      applyAccountInterest(accounts, accountsBalance, i, query);
    }
  }

  aggregateForecastData(accounts, accountsBalance, query);
  const graphs = createAccountGraphs(accounts, accountsBalance, labels, query);

  return {
    accountsBalance,
    graphs,
  };
};

// Get all accounts forecast for year view
graphSrv.allAccountsForecastYear = async (user, query) => {
  const accounts = await accountSrv.getAllByUser(user.id);
  const labels = createPeriodLabels(query);
  const accountsBalance = initAccountsBalance(accounts, query);

  // Placeholder - requires more complex yearly logic
  // Consider implementing if needed, following similar patterns to Month forecast

  return {
    accountsBalance,
    graphs: {},
  };
};

module.exports = graphSrv;
