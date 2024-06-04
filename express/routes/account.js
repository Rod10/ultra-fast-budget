const assert = require("assert");
const express = require("express");
const moment = require("moment");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const accountSrv = require("../services/account.js");
const renderSrv = require("../services/render.js");
const transactionSrv = require("../services/transaction.js");
const transferSrv = require("../services/transfer.js");
const {logger} = require("../services/logger.js");
const {SEE_OTHER} = require("../utils/error.js");
const TransactionTypes = require("../constants/transactiontype.js");

const router = express.Router();

const Months = [
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
]

router.use(authMid.strict);

const calculateAmount = data => data.map(row => parseFloat(row.amount)).reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  0,
);

router.get("/", async (req, res, next) => {
  try {
    const userAccounts = await accountSrv.getAllByUser(req.user.id);
    const data = {
      userAccounts,
      user: req.user,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.accountList(data);
    const graphs = {};
    for (const account of userAccounts.rows) {
      const totalBalance = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const incomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const outcomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      totalBalance[new moment(account.creationDate).month() - 1] = account.initialBalance;
      const transactions = await transactionSrv.getAllByAccount(account.id);
      const transactionsByMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
      for (const transaction of transactions.rows) {
        transactionsByMonth[new moment(transaction.transactionDate).month()].push(transaction);
      }
      // eslint-disable-next-line no-magic-numbers
      for (let month = 0; month <= 11; month++) {
        let balanceAccount = totalBalance[month];
        if (transactionsByMonth.length > 0) {
          for (const transaction of transactionsByMonth[month]) {
            if (transaction.type === TransactionTypes.INCOME
              || transaction.type === TransactionTypes.EXPECTED_INCOME) {
              incomeTransactions[month] = calculateAmount(transaction.data);
              balanceAccount += calculateAmount(transaction.data);
            } else if (transaction.type === TransactionTypes.EXPECTED_EXPENSE
              || transaction.type === TransactionTypes.EXPENSE) {
              outcomeTransactions[month] = calculateAmount(transaction.data);
              balanceAccount -= calculateAmount(transaction.data);
            }
          }
          if (month === 0) {
            totalBalance[month] = balanceAccount;
          } else {
            totalBalance[month] = balanceAccount + totalBalance[month - 1];
          }
        }
      }
      graphs[account.type] = {
        type: "line",
        label: "Récapitulatif de la balance et des transactions",
        column: 2,
        data: {
          labels: Months,
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
          elements: {line: {tension: 0.5}},
        },
      };
    }
    data.graphs = graphs;
    res.render("generic", {navbar, data, content, components: ["accountlist"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    await accountSrv.create(req.user.id, req.body);
    res.redirect(SEE_OTHER, "/account");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const account = await accountSrv.get(req.params.id);
    await accountSrv.updateData(req.user.id, account, req.body);
    res.redirect(SEE_OTHER, "/account");
  } catch (e) {
    return next(e);
  }
});

router.get("/:userId/detail/:id", async (req, res, next) => {
  try {
    const account = await accountSrv.get(req.params.id);
    const transactions = await transactionSrv.getAllByAccount(account.id);
    const transfers = await transferSrv.getAllByAccount(account.id);
    const currentMonth = new moment().month();
    console.log(currentMonth);
    const currentYear = new moment().year();
    const graphs = [];
    const totalBalance = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const incomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const outcomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (new moment(account.creationDate).year() === currentYear) {
      totalBalance[new moment(account.creationDate).month() - 1] = account.initialBalance;
    }
    const transactionsByMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
    const transfersByMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
    for (const transaction of transactions.rows) {
      transactionsByMonth[new moment(transaction.transactionDate).month()].push(transaction);
    }
    for (const transfer of transfers.rows) {
      transfersByMonth[new moment(transfer.transactionDate).month()].push(transfer);
    }
    // eslint-disable-next-line no-magic-numbers
    for (let month = 0; month <= currentMonth; month++) {
      let balanceAccount = totalBalance[month];
      if (transactionsByMonth.length > 0) {
        for (const transaction of transactionsByMonth[month]) {
          if (transaction.type === TransactionTypes.INCOME
            || transaction.type === TransactionTypes.EXPECTED_INCOME) {
            incomeTransactions[month] = calculateAmount(transaction.data);
            balanceAccount += calculateAmount(transaction.data);
          } else if (transaction.type === TransactionTypes.EXPECTED_EXPENSE
            || transaction.type === TransactionTypes.EXPENSE) {
            outcomeTransactions[month] = calculateAmount(transaction.data);
            balanceAccount -= calculateAmount(transaction.data);
          }
        }
        if (month === 0) {
          totalBalance[month] = balanceAccount;
        } else {
          totalBalance[month] = balanceAccount + totalBalance[month - 1];
        }
      }
      graphs.push({
        type: "pie",
        label: Months[month],
        labels: [
          "Revenue",
          "Dépense",
        ],
        column: 4,
        backgroundColor: [
          "#48c78e",
          "#f14668",
        ],
        data: [incomeTransactions[month], outcomeTransactions[month]],
      });
    }
    const data = {
      account,
      totalBalance: totalBalance.splice(0, currentMonth + 1).reverse(),
      transactionsByMonth: transactionsByMonth.reverse(),
      transfersByMonth: transfersByMonth.reverse(),
      graphs: graphs.reverse(),
    };

    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.accountDetails(data);
    res.render("generic", {navbar, data, content, components: ["accountdetails"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

module.exports = router;
