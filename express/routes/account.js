const express = require("express");
const moment = require("moment");
const authMid = require("../middlewares/user.js");

const accountSrv = require("../services/account.js");
const renderSrv = require("../services/render.js");
const transactionSrv = require("../services/transaction.js");
const transferSrv = require("../services/transfer.js");
const {logger} = require("../services/logger.js");
const {SEE_OTHER, OK} = require("../utils/error.js");
const TransactionTypes = require("../constants/transactiontype.js");
const accountTypeSrv = require("../services/accounttype.js");
const searchMid = require("../middlewares/search.js");

const router = express.Router();

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

const MONTHS_IN_YEAR = 12;

router.use(authMid.strict);

// Helper function to calculate total amount from data array
const calculateAmount = data => data
  .map(row => parseFloat(row.amount))
  .reduce((acc, val) => acc + val, 0);

// Helper function to initialize monthly arrays
const createMonthlyArray = (initialValue = 0) => Array(MONTHS_IN_YEAR).fill(initialValue);

// Helper function to check if transaction is income type
const isIncomeTransaction = type => type === TransactionTypes.INCOME
        || type === TransactionTypes.EXPECTED_INCOME
        || type === TransactionTypes.INTEREST;

// Helper function to check if transaction is expense type
const isExpenseTransaction = type => type === TransactionTypes.EXPENSE
        || type === TransactionTypes.EXPECTED_EXPENSE;

// Process transactions for a specific month
const processMonthTransactions = (transactions, month, incomeArr, outcomeArr) => {
  let balance = 0;

  for (const transaction of transactions) {
    const amount = calculateAmount(transaction.data);

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

// Process transfers for a specific month and account
const processMonthTransfers = (transfers, month, accountId, incomeArr, outcomeArr) => {
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

// Group transactions by month
const groupTransactionsByMonth = transactions => {
  const byMonth = Array.from({length: MONTHS_IN_YEAR}, () => []);

  for (const transaction of transactions) {
    const month = new moment(transaction.transactionDate).month();
    byMonth[month].push(transaction);
  }

  return byMonth;
};

// Group transfers by month
const groupTransfersByMonth = transfers => {
  const byMonth = Array.from({length: MONTHS_IN_YEAR}, () => []);

  for (const transfer of transfers) {
    const month = new moment(transfer.transferDate).month();
    byMonth[month].push(transfer);
  }

  return byMonth;
};

// Calculate balance for each month
const calculateMonthlyBalances = params => {
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
      monthBalance += processMonthTransactions(
        transactionsByMonth[month],
        month,
        incomeTransactions,
        outcomeTransactions,
      );
    }

    if (transfersByMonth[month].length > 0) {
      monthBalance += processMonthTransfers(
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

// Create graph data for an account
const createAccountGraph = params => {
  const {
    accountType,
    totalBalance,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
  } = params;

  return {
    [accountType]: {
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

// Process single account for graphs
const processAccountForGraph = async account => {
  const totalBalance = createMonthlyArray();
  const incomeTransactions = createMonthlyArray();
  const outcomeTransactions = createMonthlyArray();
  const incomeTransfers = createMonthlyArray();
  const outcomeTransfers = createMonthlyArray();

  const transactions = await transactionSrv.getAllByAccount(account.id);
  const transfers = await transferSrv.getAllByAccount(account.id);

  const transactionsByMonth = groupTransactionsByMonth(transactions.rows);
  const transfersByMonth = groupTransfersByMonth(transfers.rows);

  calculateMonthlyBalances({
    account,
    transactionsByMonth,
    transfersByMonth,
    totalBalance,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
  });

  return createAccountGraph({
    accountType: account.accountType.type,
    totalBalance,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
  });
};

// Main route: List all accounts
router.get("/", async (req, res, next) => {
  try {
    const userAccounts = await accountSrv.getAllByUser(req.user.id);
    const accountsType = await accountTypeSrv.getAllByUser(req.user.id);

    const graphs = {};
    for (const account of userAccounts.rows) {
      const accountGraph = await processAccountForGraph(account);
      Object.assign(graphs, accountGraph);
    }

    const data = {
      rows: userAccounts.rows,
      accountsType,
      user: req.user,
      graphs,
    };

    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.accountList(data);

    res.render("generic", {navbar, data, content, components: ["accountlist"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Create new account
router.post("/new", async (req, res, next) => {
  try {
    const accountType = await accountTypeSrv.getByType(req.user.id, req.body.type);
    await accountSrv.create(req.user.id, req.body, accountType);
    res.redirect(SEE_OTHER, "/account");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Edit account
router.post("/:id/edit", async (req, res, next) => {
  try {
    const accountType = await accountTypeSrv.getByType(req.user.id, req.body.type);
    await accountSrv.updateData(req.user.id, req.params.id, req.body, accountType.id);
    res.redirect(SEE_OTHER, "/account");
  } catch (e) {
    return next(e);
  }
});

// Group items by days in a month
const groupByDays = (month, data, dateField) => {
  const daysInMonth = new moment().month(month)
    .daysInMonth();
  const days = Array.from({length: daysInMonth}, () => []);

  if (data.length > 0) {
    for (const item of data) {
      const dayIndex = new moment(item[dateField]).date() - 1;
      days[dayIndex].push(item);
    }
  }

  return days.reverse();
};

const groupByDaysTransaction = (month, data) => groupByDays(month, data, "transactionDate");

const groupByDaysTransfert = (month, data) => groupByDays(month, data, "transferDate");

// Create pie chart for a month
const createMonthPieChart = params => {
  const {
    month,
    totalBalance,
    period,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
  } = params;

  const hasData = incomeTransactions > 0 || outcomeTransactions > 0;

  if (hasData) {
    return {
      type: "pie",
      label: [MONTHS[month], totalBalance, period],
      labels: ["Revenue", "Dépense", "Virement reçus", "Virement émis"],
      column: 4,
      backgroundColor: ["#48c78e", "#f14668", "#d5ffea", "#ffc6cf"],
      data: [incomeTransactions, outcomeTransactions, incomeTransfers, outcomeTransfers],
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

// Process month data for account details
const processMonthData = params => {
  const {
    month,
    account,
    transactionsByMonth,
    transfersByMonth,
    totalBalance,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
    period,
  } = params;

  let balanceAccount = totalBalance[month];
  let periodByMonth = 0;

    // Process transactions
  for (const transaction of transactionsByMonth[month]) {
    const amount = calculateAmount(transaction.data);

    if (isIncomeTransaction(transaction.type)) {
      incomeTransactions[month] += amount;
      balanceAccount += amount;
      periodByMonth += amount;
    } else if (isExpenseTransaction(transaction.type)) {
      outcomeTransactions[month] += amount;
      balanceAccount -= amount;
      periodByMonth -= amount;
    }
  }

    // Process transfers
  for (const transfer of transfersByMonth[month]) {
    const amount = parseFloat(transfer.amount);

    if (account.id === transfer.senderId) {
      outcomeTransfers[month] += amount;
      periodByMonth -= amount;
      balanceAccount -= amount;
    } else {
      incomeTransfers[month] += amount;
      periodByMonth += amount;
      balanceAccount += amount;
    }
  }

  period[month] = periodByMonth;

  if (month === 0) {
    totalBalance[month] = balanceAccount;
  } else {
    totalBalance[month] = balanceAccount + totalBalance[month - 1];
  }
};

// Combine daily data from transactions and transfers
const combineDailyData = (transactionsByDays, transfersByDays, month) => {
  const daysInMonth = new moment().month(month)
    .daysInMonth();
  const dataPerDay = Array.from({length: daysInMonth}, () => []);

  for (let day = 0; day < daysInMonth; day++) {
    dataPerDay[day].push(...transactionsByDays[day]);
    dataPerDay[day].push(...transfersByDays[day]);
  }

  return dataPerDay;
};

// Initialize account balance for current year
const initializeAccountBalance = (account, currentYear) => {
  const totalBalance = createMonthlyArray();

  if (new moment(account.creationDate).year() === currentYear) {
    const creationMonth = new moment(account.creationDate).month();
    totalBalance[creationMonth] = account.initialBalance;
  }

  return totalBalance;
};

// Group all data by month and days
const organizeMonthlyData = (transactions, transfers, currentMonth) => {
  const transactionsByMonth = groupTransactionsByMonth(transactions.rows);
  const transfersByMonth = groupTransfersByMonth(transfers.rows);
  const transactionsByMonthAndDays = createMonthlyArray([]);
  const transfersByMonthAndDays = createMonthlyArray([]);

  for (let month = 0; month <= currentMonth; month++) {
    transactionsByMonthAndDays[month] = groupByDaysTransaction(
      month,
      transactionsByMonth[month],
    );
    transfersByMonthAndDays[month] = groupByDaysTransfert(
      month,
      transfersByMonth[month],
    );
  }

  return {
    transactionsByMonth,
    transfersByMonth,
    transactionsByMonthAndDays,
    transfersByMonthAndDays,
  };
};

// Process all months and generate graphs
const processAllMonths = params => {
  const {
    account,
    currentMonth,
    transactionsByMonth,
    transfersByMonth,
  } = params;

  const totalBalance = createMonthlyArray();
  const incomeTransactions = createMonthlyArray();
  const outcomeTransactions = createMonthlyArray();
  const incomeTransfers = createMonthlyArray();
  const outcomeTransfers = createMonthlyArray();
  const period = createMonthlyArray();
  const graphs = [];

  // Copy initial balance
  totalBalance[0] = params.totalBalance[0];

  for (let month = 0; month <= currentMonth; month++) {
    if (month > 0) {
      totalBalance[month] = params.totalBalance[month];
    }

    processMonthData({
      month,
      account,
      transactionsByMonth,
      transfersByMonth,
      totalBalance,
      incomeTransactions,
      outcomeTransactions,
      incomeTransfers,
      outcomeTransfers,
      period,
    });

    graphs.push(createMonthPieChart({
      month,
      totalBalance: totalBalance[month],
      period: period[month],
      incomeTransactions: incomeTransactions[month],
      outcomeTransactions: outcomeTransactions[month],
      incomeTransfers: incomeTransfers[month],
      outcomeTransfers: outcomeTransfers[month],
    }));
  }

  return {
    totalBalance,
    incomeTransactions,
    outcomeTransactions,
    incomeTransfers,
    outcomeTransfers,
    period,
    graphs,
  };
};

// Combine all daily data
const prepareAllDailyData = (transactionsByDays, transfersByDays, currentMonth) => {
  const dataPerMonth = [];

  for (let month = 0; month <= currentMonth; month++) {
    dataPerMonth[month] = combineDailyData(
      transactionsByDays[month],
      transfersByDays[month],
      month,
    );
  }

  return dataPerMonth;
};

// Prepare and reverse data for display
const formatResponseData = (data, currentMonth) => {
  const {
    account,
    totalBalance,
    transactionsByMonth,
    transactionsByMonthAndDays,
    transfersByMonth,
    transfersByMonthAndDays,
    period,
    graphs,
    dataPerMonth,
  } = data;

  const trimLength = dataPerMonth.length - currentMonth - 1;

  return {
    account,
    totalBalance: totalBalance.slice(0, currentMonth + 1).reverse(),
    transactionsByMonth: transactionsByMonth.slice(0, currentMonth + 1).reverse(),
    transactionsByMonthAndDays: transactionsByMonthAndDays
      .slice(0, currentMonth + 1)
      .reverse(),
    transfersByMonth: transfersByMonth.slice(0, currentMonth + 1).reverse(),
    transfersByMonthAndDays: transfersByMonthAndDays.slice(0, currentMonth + 1).reverse(),
    period: period.slice(0, currentMonth + 1).reverse(),
    graphs: graphs.reverse(),
    dataPerMonth: dataPerMonth.reverse().splice(0, trimLength),
  };
};

// Render response
const renderAccountDetails = (req, res, data) => {
  if (req.query.year) {
    return res.json(data);
  }

  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.accountDetails(data);
  res.render("generic", {navbar, data, content, components: ["accountdetails"]});
};

// Main function to get account details
const getAccountDetails = (
  req,
  res,
  currentYear,
  currentMonth,
  account,
  transactions,
  transfers,
) => {
  const totalBalance = initializeAccountBalance(account, currentYear);

  const monthlyData = organizeMonthlyData(transactions, transfers, currentMonth);

  const processedData = processAllMonths({
    account,
    currentMonth,
    totalBalance,
    ...monthlyData,
  });

  const dataPerMonth = prepareAllDailyData(
    monthlyData.transactionsByMonthAndDays,
    monthlyData.transfersByMonthAndDays,
    currentMonth,
  );

  const formattedData = formatResponseData(
    {
      account,
      ...processedData,
      ...monthlyData,
      dataPerMonth,
    },
    currentMonth,
  );

  return renderAccountDetails(req, res, formattedData);
};

// Get account details
router.get("/details/:id", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const currentMonth = new moment().month();
    const currentYear = new moment().year();
    const account = await accountSrv.get(req.user.id, req.params.id);
    const transactions = await transactionSrv.search(
      req.user,
      {accountId: account.id, year: currentYear},
    );
    const transfers = await transferSrv.search(
      req.user,
      {senderId: account.id, receiverId: account.id, year: currentYear},
    );

    return getAccountDetails(req, res, currentYear, currentMonth, account, transactions, transfers);
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Process single transfer for account balance
const processTransferBalance = async (user, transfer) => {
  const accountReceiver = await accountSrv.get(user.id, transfer.receiverId);
  const accountSender = await accountSrv.get(user.id, transfer.senderId);
  const amount = parseFloat(transfer.amount);

  accountReceiver.balance += amount;
  accountSender.balance -= amount;

  await accountSrv.update(user.id, accountReceiver.id, accountReceiver);
  await accountSrv.update(user.id, accountSender.id, accountSender);
};

// Rebalance all accounts
router.get("/rebalance-all", async (req, res, next) => {
  try {
    const {user} = req;
    const accounts = await accountSrv.getAllByUser(user.id);

        // Rebalance each account with transactions
    for (const account of accounts.rows) {
      const transactions = await transactionSrv.getAllByAccount(account.id);
      await accountSrv.rebalance(user.id, account.id, transactions);
    }

        // Process all transfers
    const transfers = await transferSrv.getAllByUser(user.id);
    for (const transfer of transfers.rows) {
      await processTransferBalance(user, transfer);
    }

    res.redirect("/account");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Delete account
router.post("/:id/delete", async (req, res, next) => {
  try {
    const accountToDelete = await accountSrv.get(req.user.id, req.params.id);

    if (accountToDelete.balance >= 1) {
      return res.json({
        status: "ERROR",
        error: "Le solde du compte est supérieure à 0",
      });
    }

    await accountSrv.delete(req.user.id, accountToDelete.id);
    const userAccounts = await accountSrv.getAllByUser(req.user.id);

    return res.json({status: OK, rows: userAccounts});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

// Search account details
router.get("/details/:id/search", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const currentYear = new moment(req.query.year).year();
    const currentMonth = new moment().year() === currentYear
      ? new moment().month()
      : MONTHS_IN_YEAR - 1;

    const account = await accountSrv.get(req.user.id, req.params.id);
    const transactions = await transactionSrv.search(
      req.user,
      {accountId: account.id, year: currentYear},
    );
    const transfers = await transferSrv.search(
      req.user,
      {accountId: account.id, year: currentYear},
    );

    return getAccountDetails(req, res, currentYear, currentMonth, account, transactions, transfers);
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

module.exports = router;
