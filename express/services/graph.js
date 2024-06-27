const moment = require("moment");
const AccounstTypesFull = require("../constants/accountstypefull.js");
const {logger} = require("./logger.js");
const TransactionType = require("./../constants/transactiontype.js");
const transactionSrv = require("./transaction.js");
const accountSrv = require("./account.js");
const categorySrv = require("./category.js");
const plannedTransactionSrv = require("./plannedtransaction.js");
const plannedTransferSrv = require("./plannedtransfer.js");

const graphSrv = {};

const calculateTransactionTotal = transactionData => transactionData
  .map(d => parseFloat(d.amount)).reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );

const calculateMonthlyTotal = (account, plannedTransactions, plannedTransfers, query) => {
  if (plannedTransactions.count > 0) {
    let totalTransaction = 0;
    for (const transaction of plannedTransactions.rows) {
      if (transaction.type === TransactionType.EXPECTED_EXPENSE) {
        totalTransaction -= calculateTransactionTotal(transaction.data);
      } else if (transaction.type === TransactionType.EXPECTED_INCOME) {
        const newBalance = account.balance + calculateTransactionTotal(transaction.data);
        if (account.accountType.maxAmount !== 0 && newBalance > account.accountType.maxAmount) {
          transaction.data = [];
          totalTransaction += account.accountType.maxAmount - account.balance;
        } else {
          totalTransaction += calculateTransactionTotal(transaction.data);
        }
      }
    }
    account.balance += totalTransaction;
  }
  if (plannedTransfers.count > 0) {
    for (const transfer of plannedTransfers.rows) {
      if (transfer.senderId === account.id) {
        account.balance -= parseFloat(transfer.amount);
      } else if (transfer.receiverId === account.id) {
        const newBalance = account.balance + parseFloat(transfer.amount);
        console.log(account.accountType.type, newBalance);
        console.log(newBalance > account.accountType.maxAmount && account.accountType.maxAmount !== 0);
        if (newBalance > account.accountType.maxAmount && account.accountType.maxAmount !== 0) {
          
        } else {
          account.balance += parseFloat(transfer.amount);
        }
      }
    }
  }

  if (query.startingDate.month() === 0) {
    account.balance *= (1 + (account.accountType.interest / 100));
  }

  return Math.round(account.balance * 100) / 100;
};

graphSrv.getSummary = async (user, type) => {
  logger.debug("Create graph data for summary");
  const transactions = await transactionSrv.getAllByUserAndRange(user.id, {
    unit: "month",
    range: type,
  });

  const label = type === "this" ? "Ce mois" : "Mois précédent";

  let incomeTransactions = 0;
  let outcomeTransactions = 0;

  for (const transaction of transactions.rows) {
    if (transaction.type === TransactionType.EXPENSE) {
      outcomeTransactions += transaction.data.map(data => parseFloat(data.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    } else {
      incomeTransactions += transaction.data.map(data => parseFloat(data.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
    }
  }

  return {
    type: "pie",
    label,
    labels: [
      "Revenue",
      "Dépense",
    ],
    column: 4,
    backgroundColor: [
      "#48c78e",
      "#f14668",
    ],
    data: [
      incomeTransactions,
      outcomeTransactions,
    ],
  };
};

graphSrv.lastSeventhDays = async user => {
  logger.debug("Get last seventh days graph");

  const transactions = await transactionSrv.getAllByUserAndRange(user.id, {
    unit: "day",
    range: "seventh",
  });

  const transactionsByDays = {};
  const incomeTransactions = new Array(7).fill(0);
  const outcomeTransactions = new Array(7).fill(0);

  const labels = [];
  for (let i = 0; i < 7; i++) {
    labels.push(new moment().subtract(i, "day")
      .format("DD/MM"));
    transactionsByDays[new moment().subtract(i, "day")
      .format("DD")] = [];
  }

  for (const transaction of transactions.rows) {
    transactionsByDays[new moment(transaction.transactionDate).format("DD")].push(transaction);
  }

  for (let i = 0; i < 7; i++) {
    if (transactionsByDays[new moment().subtract(i, "day")
      .format("DD")].length > 0) {
      for (const transaction of transactionsByDays[new moment().subtract(i, "day")
        .format("DD")]) {
        if (transaction.type === TransactionType.EXPENSE) {
          outcomeTransactions[i] += transaction.data.map(data => parseFloat(data.amount)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          );
        } else {
          incomeTransactions[i] += transaction.data.map(data => parseFloat(data.amount)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          );
        }
      }
    }
  }

  return {
    type: "bar",
    label: "7 derniers jours",
    labels: labels.reverse(),
    datasets: [
      {
        label: "Dépense",
        data: outcomeTransactions.reverse(),
        backgroundColor: [
          "#fd8d8d",
          "#fd8d8d",
          "#fd8d8d",
          "#fd8d8d",
          "#fd8d8d",
          "#fd8d8d",
          "#fd8d8d",
        ],
        borderColor: [
          "#e53838",
          "#e53838",
          "#e53838",
          "#e53838",
          "#e53838",
          "#e53838",
          "#e53838",
        ],
        borderWidth: 1,
      },
      {
        label: "Revenu",
        data: incomeTransactions.reverse(),
        backgroundColor: [
          "#c5ffaa",
          "#c5ffaa",
          "#c5ffaa",
          "#c5ffaa",
          "#c5ffaa",
          "#c5ffaa",
          "#c5ffaa",
        ],
        borderColor: [
          "#4fe538",
          "#4fe538",
          "#4fe538",
          "#4fe538",
          "#4fe538",
          "#4fe538",
          "#4fe538",
        ],
        borderWidth: 1,
      },
    ],
  };
};

const initData = () => {
  const transactionsByWeeks = {};
  transactionsByWeeks[new moment()
    .startOf("week")
    .format("DD/MM")] = [];

  for (let i = 1; i < 10; i++) {
    transactionsByWeeks[new moment().subtract(i, "week")
      .startOf("week")
      .format("DD/MM")] = [];
  }
  return transactionsByWeeks;
};

graphSrv.balance = async user => {
  logger.debug("Get balance graph for all accounts");

  const accounts = await accountSrv.getAllByUser(user.id);

  const datasets = [];

  const labels = [];
  labels.push(new moment()
    .format("DD/MM"));

  for (let i = 1; i < 5; i++) {
    labels.push(new moment().subtract(i, "week")
      .startOf("isoWeek")
      .format("DD/MM"));
  }
  for (const account of accounts.rows) {
    const transactions = await transactionSrv.getAllByAccountAndRange(account.id, {unit: "week", number: 5});
    const transactionsByWeeks = initData();
    for (const transaction of transactions.rows) {
      transactionsByWeeks[
        new moment(transaction.transactionDate)
          .startOf("week")
          .format("DD/MM")].push(transaction);
    }

    const accountBalance = new Array(5).fill(0);
    accountBalance[0] = parseFloat(account.balance);
    for (let i = 1; i < 5; i++) {
      const transactionsOfWeek = transactionsByWeeks[new moment()
        .subtract(i - 1, "week")
        .startOf("week")
        .format("DD/MM")];
      let totalTransaction = 0;
      for (const transaction of transactionsOfWeek) {
        if (transaction.type === TransactionType.EXPENSE) {
          totalTransaction += transaction.data.map(data => parseFloat(data.amount)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          );
        } else {
          totalTransaction -= transaction.data.map(data => parseFloat(data.amount)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          );
        }
      }
      accountBalance[i] += accountBalance[i - 1] + totalTransaction;
    }
    datasets.push({
      label: account.name,
      data: accountBalance.reverse(),
      fill: false,
      borderColor: account.accountType.color,
      tension: 0.1,
    });
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

graphSrv.categories = async user => {
  const categories = await categorySrv.getAll(user.id);
  const transactions = await transactionSrv.getAllByUser(user.id);
  const totalByCategory = {};

  for (const category of categories.rows) {
    totalByCategory[category.name] = 0;
  }

  for (const transaction of transactions.rows) {
    for (const data of transaction.data) {
      totalByCategory[data.category.name] += parseFloat(data.amount);
    }
  }

  const datasets = [];
  for (const [key, value] of Object.entries(totalByCategory)) {
    datasets.push({
      label: key,
      data: [value],
      backgroundColor:
        `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      borderWidth: 2,
      borderRadius: 5,
    });
  }
  return {
    type: "bar",
    label: "Total de toute les catégories",
    labels: " ",
    column: 12,
    datasets,
    options: {maintainAspectRatio: false},
  };
};

graphSrv.byCategory = async (user, category) => {
  const labels = [];
  const backgroundColor = [];
  const dataObject = {};
  for (const subCategory of category.subCategories) {
    labels.push(subCategory.name);
    backgroundColor.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    dataObject[subCategory.name] = 0;
  }
  const transactions = await transactionSrv.getAllByUserAndCategory(user.id, category.id);
  for (const transaction of transactions.rows) {
    for (const rowData of transaction.data) {
      dataObject[rowData.subCategory.name] += parseFloat(rowData.amount);
    }
  }
  return {
    label: category.name,
    type: "pie",
    labels,
    column: 1,
    backgroundColor,
    data: Object.values(dataObject),
  };
};

const reduceDataByIndex = (accountType, query) => {
  // Initialize an array to hold the reduced data
  const dataKeys = Object.keys(accountType);
  const numberOfMonths = query.number;
  const reducedData = Array.from({length: numberOfMonths}, () => 0);

  // Iterate through each account type
  for (const key of dataKeys) {
    // Get the data array for the current account type
    const dataArray = accountType[key].data;
    if (query.unit === "year") {
      // console.log(dataArray);
    } else {
      // Sum the values at each index
      for (let i = 0; i < numberOfMonths; i++) {
        const amount = parseFloat(dataArray[i]);
        if (amount !== undefined && !isNaN(amount)) {
          reducedData[i] += amount;
        }
      }
    }
  }
  return reducedData;
};

graphSrv.allAccountsForecast = async (user, query) => {
  const accounts = await accountSrv.getAllByUser(user.id);
  const labels = Array.from({length: query.number}, (element, index) => {
    let text;
    const date = moment().add(index, query.unit);
    if (query.unit === "month") {
      text = `${date.month() + 1}/${date.year()}`;
    } else if (query.unit === "year") {
      text = date.year().toString();
    }
    return text;
  });
  let data = [];

  const accountsBalance = {};

  for (const account of accounts.rows) {
    accountsBalance[account.accountType.type] = {
      data: Array.from({length: query.number}, () => {
        if (query.unit === "year") return Array.from({length: 12}, () => 0);
        return 0;
      }),
      interest: Array.from({length: query.number}, () => 0),
    };
  }

  if (query.type === "planned") {
    for (const account of accounts.rows) {
      for (let i = 0; i < query.number; i++) {
        query.startingDate = new moment()
          .add(i, query.unit)
          .startOf(query.unit);
        query.endingDate = new moment()
          .add(i, query.unit)
          .endOf(query.unit);
        query.accountId = account.id;
        const plannedTransactions = await plannedTransactionSrv.getAllByUser(user.id, query);
        const plannedTransfers = await plannedTransferSrv.getAllByUser(user.id, query);
        if (query.unit === "year") {
          for (let m = 0; m < 12; m++) {
            accountsBalance[account.accountType.type].data[i][m] = calculateMonthlyTotal(account, plannedTransactions, plannedTransfers, query);
          }
        } else {
          /* if (plannedTransactions.count > 0) {
            let totalTransaction = 0;
            for (const transaction of plannedTransactions.rows) {
              if (transaction.type === TransactionType.EXPECTED_EXPENSE) {
                totalTransaction -= calculateTransactionTotal(transaction.data);
              } else if (transaction.type === TransactionType.EXPECTED_INCOME) {
                const newBalance = account.balance + calculateTransactionTotal(transaction.data);
                if (account.accountType.maxAmount !== 0 && newBalance > account.accountType.maxAmount) {
                  transaction.data = [];
                  totalTransaction += account.accountType.maxAmount - account.balance;
                } else {
                  totalTransaction += calculateTransactionTotal(transaction.data);
                }
              }
            }
            account.balance += totalTransaction;
          }
          if (plannedTransfers.count > 0) {
            for (const transfer of plannedTransfers.rows) {
              if (transfer.senderId === account.id) {
                account.balance -= parseFloat(transfer.amount);
              } else if (transfer.receiverId === account.id) {
                const newBalance = account.balance + parseFloat(transfer.amount);
                if (account.accountType.maxAmount !== 0 && newBalance > account.accountType.maxAmount) {
                  if (transfer.amount !== 0) {
                    account.balance += account.accountType.maxAmount - account.balance;
                    transfer.amount = 0;
                  }
                } else {
                  account.balance += parseFloat(transfer.amount);
                }
              }
            }
          }

          if (query.startingDate.month() === 0) {
            account.balance *= (1 + (account.accountType.interest / 100));
          }*/

          accountsBalance[account.accountType.type].data[i] = calculateMonthlyTotal(account, plannedTransactions, plannedTransfers, query);
        }
      }
    }
  }
  data = reduceDataByIndex(accountsBalance, query);

  return {
    type: "line",
    label: "Total du solde de tout les comptes",
    column: 12,
    data: {
      labels,
      datasets: [{
        label: "Solde de tous les comptes",
        data,
        fill: false,
        borderColor: "#3979ff",
        tension: 0.1,
      }],
    },
    options: {maintainAspectRatio: false},
  };
};

/* graphSrv.allAccountsForecast = async (user, query) => {
  const accounts = await accountSrv.getAllByUser(user.id);

  const labels = [];
  let year = new moment().year();
  labels.push(`${new moment().month() + 1}/${year}`);

  const data = Array.from({length: query.number}, () => 0);
  for (const account of accounts.rows) {
    data[0] += parseFloat(account.balance);
  }

  const plannedTransactions = await plannedTransactionSrv.getAllByUser(user.id);

  for (let i = 1; i < query.number; i++) {
    const month = (new moment().add(i, "month")
      .month()) + 1;

    for (const account of accounts.rows) {
      let accountTransaction = plannedTransactions.rows
        .filter(transaction => transaction.accountId === account.id);
      if (accountTransaction !== undefined) {
        for (const transaction of accountTransaction) {
          if (transaction.type === TransactionType.EXPECTED_EXPENSE) {
            account.balance -= transaction.data.map(d => parseFloat(d.amount)).reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0,
            );
          } else if (transaction.type === TransactionType.EXPECTED_INCOME) {
            const newBalance = account.balance + transaction.data.map(d => parseFloat(d.amount)).reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0,
            );
            if (account.accountType.maxAmount !== 0 && newBalance > account.accountType.maxAmount) {
              transaction.data = [];
              account.balance += account.accountType.maxAmount - account.balance;
            } else {
              account.balance += transaction.data.map(d => parseFloat(d.amount)).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
              );
            }
          }
        }
      }
      if (month === 1) {
        account.balance *= (1 + (account.accountType.interest / 100));
      }
      if (i !== 0) {
        data[i] += account.balance;
      }
    }
    if (month === 1) {
      year++;
    }
    labels.push(`${month}/${year}`);
  }

  return {
    type: "line",
    label: "Total du solde de tout les comptes",
    column: 12,
    data: {
      labels,
      datasets: [{
        label: "Solde de tous les comptes",
        data,
        fill: false,
        borderColor: "#3979ff",
        tension: 0.1,
      }],
    },
    options: {maintainAspectRatio: false},
  };
};*/

graphSrv.accountForecast = async (user, account, query) => {
  const transactions = await plannedTransactionSrv.getAllByAccount(account.id);
  const transfers = await plannedTransferSrv.getAllByAccount(account.id);
  const labels = [];
  let year = new moment().year();
  labels.push(`${new moment().month() + 1}/${year}`);

  const data = Array.from({length: query.number}, () => 0);
  data[0] = parseFloat(account.balance);
  for (let i = 1; i < query.number; i++) {
    const month = (new moment().add(i, "month")
      .month()) + 1;
    if (transactions.count > 0) {
      for (const transaction of transactions.rows) {
        if (transaction.type === TransactionType.EXPECTED_EXPENSE) {
          account.balance -= transaction.data.map(d => parseFloat(d.amount)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          );
        } else if (transaction.type === TransactionType.EXPECTED_INCOME) {
          const newBalance = account.balance + transaction.data.map(d => parseFloat(d.amount)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
          );
          if (account.accountType.maxAmount !== 0 && newBalance > account.accountType.maxAmount) {
            transaction.data = [];
            account.balance += account.accountType.maxAmount - account.balance;
          } else {
            account.balance += transaction.data.map(d => parseFloat(d.amount)).reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0,
            );
          }
        }
      }
    }
    if (transfers.count > 0) {
      for (const transfer of transfers.rows) {
        if (transfer.senderId === account.id) {
          account.balance -= parseFloat(transfer.amount);
        } else if (transfer.receiverId === account.id) {
          const newBalance = account.balance + parseFloat(transfer.amount);
          if (account.accountType.maxAmount !== 0 && newBalance > account.accountType.maxAmount) {
            if (transfer.amount !== 0) {
              account.balance += account.accountType.maxAmount - account.balance;
              transfer.amount = 0;
            }
          } else {
            account.balance += parseFloat(transfer.amount);
          }
        }
      }
    }
    if (month === 1) {
      year++;
      if (account.accountType.interest !== 0) {
        account.balance *= (1 + (account.accountType.interest / 100));
      }
    }
    data[i] = account.balance;
    labels.push(`${month}/${year}`);
  }
  return {
    type: "line",
    label: `Total du solde du ${account.accountType.name}`,
    column: 12,
    data: {
      labels,
      datasets: [{
        label: `Total du solde du ${account.accountType.name}`,
        data,
        fill: false,
        borderColor: "#3979ff",
        tension: 0.1,
      }],
    },
    options: {maintainAspectRatio: false},
  };
};

module.exports = graphSrv;
