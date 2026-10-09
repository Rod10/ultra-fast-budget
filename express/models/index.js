const cls = require("cls-hooked");
const Sequelize = require("sequelize");

const {logger} = require("../services/logger.js");

const namespace = cls.createNamespace("sequelize-transaction");
Sequelize.useCLS(namespace);

const env = require("../utils/env.js");
const config = require("../utils/config.js").database[env];

const Account = require("./account.js");
const AccountType = require("./accounttype.js");
const Budget = require("./budget.js");
const Category = require("./category.js");
const LastReference = require("./lastreference.js");
const Order = require("./order.js");
const PlannedTransaction = require("./plannedtransaction.js");
const PlannedTransfer = require("./plannedtransfer.js");
const Portfolio = require("./portfolio.js");
const Stock = require("./stock.js");
const SubCategory = require("./subcategory.js");
const Transaction = require("./transaction.js");
const TransactionModel = require("./transactionmodel.js");
const Transfer = require("./transfer.js");
const User = require("./user.js");

if (config.logging) {
  config.logging = data => logger.debug(data);
}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    define: {underscored: true},
  },
);

const db = {};

[
  Account,
  AccountType,
  Budget,
  Category,
  LastReference,
  Order,
  PlannedTransaction,
  PlannedTransfer,
  Portfolio,
  Stock,
  SubCategory,
  Transaction,
  TransactionModel,
  Transfer,
  User,
].forEach(def => {
  const model = def(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Sequelize.Op;
db.testConnexion = async () => {
  if (!sequelize.close) return "ko";
  try {
    await sequelize.query("select 1 + 1;");
    return "ok";
  } catch {
    return "ko";
  }
};
db.isInTransaction = () => Boolean(namespace.get("transaction"));

module.exports = db;
