const express = require("express");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const {testConnexion} = require("../models/index.js");
const cookieOptions = require("../services/cookie.js");
const accountSrv = require("../services/account.js");
const graphSrv = require("../services/graph.js");
const renderSrv = require("../services/render.js");
const tokenSrv = require("../services/token.js");
const transactionSrv = require("../services/transaction.js");
const userSrv = require("../services/user.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const budgetSrv = require("../services/budget.js");
const TransactionType = require("../constants/transactiontype.js");
const moment = require("moment");

const router = express.Router();

router.use((req, res, next) => {
  res.locals = res.locals || {};
  res.locals.nonce = req.header("x-csp-nonce");
  next();
});

router.get("/login", (req, res, next) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const data = renderSrv.userLogin({
      passwordChanged: req.query.passwordChanged === "true",
      query: query ? `?${query}` : "",
    });

    res.render("login_society", {data});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/register", (req, res) => {
  const data = renderSrv.userRegister();

  res.render("login_society", {data});
});

router.post("/register", async (req, res, next) => {
  try {
    await userSrv.create(req.body);
    res.redirect(SEE_OTHER, "/");
  } catch (e) {
    return next(e);
  }
});

router.post("/login", loggerMid(["email"]), async (req, res, next) => {
  try {
    const user = await userSrv.login(req.body);
    const token = tokenSrv.user(user);
    res.cookie("token", token, cookieOptions);

    res.redirect(SEE_OTHER, "/");
  } catch (e) {
    return next(e);
  }
});

router.use(authMid.strict);
/* GET home page. */
router.get("/", async (req, res) => {
  const accounts = await accountSrv.getAllByUser(req.user.id);
  const transactions = await transactionSrv.getAllByUserAndRange(req.user.id, {unit: "month"});
  const budgets = await budgetSrv.getAllByUser(req.user.id);
  const graphs = {};
  graphs["summary"] = {};
  graphs["summary"]["thisMonth"] = await graphSrv.getSummary(req.user, "this");
  graphs["summary"]["lastMonth"] = await graphSrv.getSummary(req.user, "last");
  graphs["details"] = {};
  graphs["details"]["seventhDays"] = await graphSrv.lastSeventhDays(req.user);
  graphs["details"]["balance"] = await graphSrv.balance(req.user);

  const liquidity = {
    totalIncome: 0,
    totalOutcome: 0,
    incomeTransactionsNumber: 0,
    outcomeTransactionsNumber: 0,
    average: {
      daily: {
        income: 0,
        outcome: 0,
      },
      transactions: {
        income: 0,
        outcome: 0,
      },
    },
  };

  for (const transaction of transactions.rows) {
    if (transaction.type === TransactionType.EXPENSE) {
      liquidity.totalOutcome += transaction.data.map(data => parseFloat(data.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
      liquidity.outcomeTransactionsNumber++;
    } else {
      liquidity.totalIncome += transaction.data.map(data => parseFloat(data.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
      liquidity.incomeTransactionsNumber++;
    }
  }
  const daysInMonth = new moment().daysInMonth();
  liquidity.average.daily.income = Math.round(liquidity.totalIncome / daysInMonth * 100) / 100;
  liquidity.average.daily.outcome = Math.round(liquidity.totalOutcome / daysInMonth * 100) / 100;
  liquidity.average.transactions.income = Math.round(liquidity.totalIncome / liquidity.incomeTransactionsNumber * 100) / 100;
  liquidity.average.transactions.outcome = Math.round(liquidity.totalOutcome / liquidity.outcomeTransactionsNumber * 100) / 100;

  const data = {
    graphs,
    accounts,
    transactions,
    budgets,
    liquidity,
  };
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.homepage(data);
  res.render("generic", {navbar, data, content, components: ["homepage"]});
});

router.get("/logout", async (req, res, next) => {

});

router.get("/hello", async (req, res) => {
  const db = await testConnexion();
  res.json({app: "ok", db});
});

router.get("/status", async (req, res) => {
  const status = await testConnexion();
  res.json({status});
});

router.use(authMid.strict);
router.use("/account", require("./account.js"));
router.use("/budget", require("./budget.js"));
router.use("/transaction", require("./transaction.js"));
router.use("/transfer", require("./transfer.js"));
router.use("/planned-transaction", require("./planned-transaction.js"));
router.use("/planned-transfer", require("./planned-transfer.js"));
router.use("/settings", require("./settings/index.js"));
router.use("/api", require("./api.js"));
router.use("/graphics", require("./graphics.js"));

module.exports = router;
