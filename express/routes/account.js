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
];

router.use(authMid.strict);

const calculateAmount = data => data.map(row => parseFloat(row.amount)).reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  0,
);

router.get("/", async (req, res, next) => {
  try {
    const userAccounts = await accountSrv.getAllByUser(req.user.id);
    const accountsType = await accountTypeSrv.getAllByUser(req.user.id);
    const data = {
      rows: userAccounts.rows,
      accountsType,
      user: req.user,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.accountList(data);
    const graphs = {};
    for (const account of userAccounts.rows) {
      const totalBalance = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const incomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const outcomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const incomeTransferts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const outcomeTransferts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      totalBalance[new moment(account.creationDate).month()] = account.initialBalance;
      const transactions = await transactionSrv.getAllByAccount(account.id);
      const transferts = await transferSrv.getAllByAccount(account.id);
      const transactionsByMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
      const transfertsByMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
      for (const transaction of transactions.rows) {
        transactionsByMonth[new moment(transaction.transactionDate).month()].push(transaction);
      }
      for (const transfert of transferts.rows) {
        transfertsByMonth[new moment(transfert.transferDate).month()].push(transfert);
      }
      // eslint-disable-next-line no-magic-numbers
      for (let month = 0; month <= 11; month++) {
        let balanceAccount = totalBalance[month];
        if (transactionsByMonth.length > 0) {
          for (const transaction of transactionsByMonth[month]) {
            if (transaction.type === TransactionTypes.INCOME
              || transaction.type === TransactionTypes.EXPECTED_INCOME) {
              incomeTransactions[month] += calculateAmount(transaction.data);
              balanceAccount += calculateAmount(transaction.data);
            } else if (transaction.type === TransactionTypes.INTEREST) {
              incomeTransactions[month] += calculateAmount(transaction.data);
              balanceAccount += calculateAmount(transaction.data);
            } else if (transaction.type === TransactionTypes.EXPECTED_EXPENSE
              || transaction.type === TransactionTypes.EXPENSE) {
              outcomeTransactions[month] += calculateAmount(transaction.data);
              balanceAccount -= calculateAmount(transaction.data);
            }
          }
          if (transfertsByMonth[month].length > 0) {
            for (const transfert of transfertsByMonth[month]) {
              if (account.id === transfert.senderId) {
                balanceAccount -= parseFloat(transfert.amount);
                outcomeTransferts[month] += parseFloat(transfert.amount);
              } else if (account.id === transfert.receiverId) {
                balanceAccount += parseFloat(transfert.amount);
                incomeTransferts[month] += parseFloat(transfert.amount);
              }
            }
            if (month === 0) {
              totalBalance[month] = balanceAccount;
            } else {
              totalBalance[month] = balanceAccount + totalBalance[month - 1];
            }
          }
        }
      }
      graphs[account.accountType.type] = {
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
            {
              label: "Virement Reçu",
              data: incomeTransferts,
              borderColor: "#7feaae",
            },
            {
              label: "Virement Emis",
              data: outcomeTransferts,
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
    const accountType = await accountTypeSrv.getByType(req.user.id, req.body.type);
    await accountSrv.create(req.user.id, req.body, accountType);
    res.redirect(SEE_OTHER, "/account");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const accountType = await accountTypeSrv.getByType(req.user.id, req.body.type);
    await accountSrv.updateData(req.user.id, req.params.id, req.body, accountType.id);
    res.redirect(SEE_OTHER, "/account");
  } catch (e) {
    return next(e);
  }
});

const groupByDays = (month, data) => {
  const days = Array.from({
    length: new moment().month(month)
      .daysInMonth(),
  }, () => []);
  if (data.length > 0) {
    for (const transaction of data) {
      days[new moment(transaction.transactionDate).date()].push(transaction);
    }
  }
  return days.reverse();
  // return days.filter(day => day.length > 0);
};
const groupByDaysTransfert = (month, data) => {
  const days = Array.from({
    length: new moment().month(month)
      .daysInMonth(),
  }, () => []);
  if (data.length > 0) {
    for (const transfer of data) {
      days[new moment(transfer.transferDate).date()].push(transfer);
    }
  }
  return days.reverse();
  // return days.filter(day => day.length > 0);
};
// transactionsByMonthAndDays[month] = groupByDays(month, transactionsByMonth[month]);

router.get("/:userId/details/:id", async (req, res, next) => {
  try {
    const account = await accountSrv.get(req.user.id, req.params.id);
    const transactions = await transactionSrv.getAllByAccount(account.id);
    const transfers = await transferSrv.getAllByAccount(account.id);
    const currentMonth = new moment().month();
    const currentYear = new moment().year();
    const graphs = [];
    const totalBalance = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const incomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const outcomeTransactions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const incomeTransfers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const outcomeTransfers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const period = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (new moment(account.creationDate).year() === currentYear) {
      totalBalance[new moment(account.creationDate).month()] = account.initialBalance;
    }
    const transactionsByMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
    const transactionsByMonthAndDays = [[], [], [], [], [], [], [], [], [], [], [], []];
    const transfersByMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
    const transfersByMonthAndDays = [[], [], [], [], [], [], [], [], [], [], [], []];
    for (const transaction of transactions.rows) {
      transactionsByMonth[new moment(transaction.transactionDate).month()].push(transaction);
    }
    for (const transfer of transfers.rows) {
      transfersByMonth[new moment(transfer.transferDate).month()].push(transfer);
    }
    // eslint-disable-next-line no-magic-numbers
    for (let month = 0; month <= currentMonth; month++) {
      let balanceAccount = totalBalance[month];
      let periodByMonth = 0;
      if (transactionsByMonth.length > 0) {
        transactionsByMonthAndDays[month] = groupByDays(month, transactionsByMonth[month]);
        for (const transaction of transactionsByMonth[month]) {
          if (transaction.type === TransactionTypes.INCOME
            || transaction.type === TransactionTypes.EXPECTED_INCOME) {
            incomeTransactions[month] += calculateAmount(transaction.data);
            balanceAccount += calculateAmount(transaction.data);
            periodByMonth += calculateAmount(transaction.data);
          } else if (transaction.type === TransactionTypes.EXPECTED_EXPENSE
            || transaction.type === TransactionTypes.EXPENSE) {
            outcomeTransactions[month] += calculateAmount(transaction.data);
            balanceAccount -= calculateAmount(transaction.data);
            periodByMonth -= calculateAmount(transaction.data);
          }
        }

        if (transfersByMonth.length > 0) {
          transfersByMonthAndDays[month]
            = groupByDaysTransfert(month, transfersByMonth[month]);
          for (const transfer of transfersByMonth[month]) {
            if (account.id === transfer.senderId) {
              outcomeTransfers[month] += parseFloat(transfer.amount);
              periodByMonth -= parseFloat(transfer.amount);
              balanceAccount -= parseFloat(transfer.amount);
            } else {
              incomeTransfers[month] += parseFloat(transfer.amount);
              periodByMonth += parseFloat(transfer.amount);
              balanceAccount += parseFloat(transfer.amount);
            }
          }
        }
        period[month] = periodByMonth;
        if (month === 0) {
          totalBalance[month] = balanceAccount;
        } else {
          totalBalance[month] = balanceAccount + totalBalance[month - 1];
        }
      }
      if (incomeTransactions[month] > 0 || outcomeTransactions[month] > 0) {
        graphs.push({
          type: "pie",
          label: [Months[month], totalBalance[month], period[month]],
          labels: [
            "Revenue",
            "Dépense",
            "Virement reçus",
            "Virement émis",
          ],
          column: 4,
          backgroundColor: [
            "#48c78e",
            "#f14668",
            "#d5ffea",
            "#ffc6cf",
          ],
          data: [
            incomeTransactions[month],
            outcomeTransactions[month],
            incomeTransfers[month],
            outcomeTransfers[month],
          ],
        });
      } else {
        graphs.push({
          type: "pie",
          label: [Months[month], totalBalance[month], period[month]],
          labels: [
            "Aucune Données",
          ],
          column: 4,
          backgroundColor: [
            "#c7c7c7",
          ],
          data: [1],
        });
      }
    }

    const dataPerMonth = [[], [], [], [], [], [], [], [], [], [], [], []];
    for (let month = 0; month <= currentMonth; month++) {
      for (let day = 0; day <= new moment().month(month).daysInMonth(); day++) {
        dataPerMonth[month].push(transactionsByMonthAndDays[month][day]);

        dataPerMonth[month].push(transfersByMonthAndDays[month][day]);
      }
    }
    const data = {
      account,
      totalBalance: totalBalance.splice(0, currentMonth + 1).reverse(),
      transactionsByMonth: transactionsByMonth.splice(0, currentMonth + 1).reverse(),
      transactionsByMonthAndDays: transactionsByMonthAndDays.splice(0, currentMonth + 1).reverse(),
      transfersByMonth: transfersByMonth.splice(0, currentMonth + 1).reverse(),
      transfersByMonthAndDays: transfersByMonthAndDays.splice(0, currentMonth + 1).reverse(),
      period: period.splice(0, currentMonth + 1).reverse(),
      graphs: graphs.reverse(),
      dataPerMonth,
    };

    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.accountDetails(data);
    res.render("generic", {navbar, data, content, components: ["accountdetails"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/rebalance-all", async (req, res, next) => {
  try {
    const {user} = req;
    const accounts = await accountSrv.getAllByUser(user.id);
    for (const account of accounts.rows) {
      const transactions = await transactionSrv.getAllByAccount(account.id);
      await accountSrv.rebalance(user.id, account.id, transactions);
    }
    const transfers = await transferSrv.getAllByUser(user.id);
    for (const transfer of transfers.rows) {
      const accountReceiver = await accountSrv.get(user.id, transfer.receiverId);
      const accountSender = await accountSrv.get(user.id, transfer.senderId);
      accountReceiver.balance += parseFloat(transfer.amount);
      accountSender.balance -= parseFloat(transfer.amount);
      await accountSrv.update(user.id, accountReceiver.id, accountReceiver);
      await accountSrv.update(user.id, accountSender.id, accountSender);
    }
    res.redirect("/account");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/:id/delete", async (req, res, next) => {
  try {
    const accountToDelete = await accountSrv.get(req.user.id, req.params.id);
    if (accountToDelete.balance >= 1) {
      return res.json({status: "ERROR", error: "Le solde du compte est supérieure à 0"});
    }
    await accountSrv.delete(req.user.id, accountToDelete.id);
    const userAccounts = await accountSrv.getAllByUser(req.user.id);
    return res.json({status: OK, rows: userAccounts});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

module.exports = router;
