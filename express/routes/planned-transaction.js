const express = require("express");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const accountSrv = require("../services/account.js");
const renderSrv = require("../services/render.js");
const categorySrv = require("../services/category.js");
const subCategorySrv = require("../services/subcategory.js");
const plannedTransactionSrv = require("../services/plannedtransaction.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const TransactionType = require("../constants/transactiontype");

const router = express.Router();

router.use(authMid.strict);

const prepareCategoryData = async transactionData => {
  for (const data of transactionData.data) {
    data.category = await categorySrv.getById(data.category);
    data.subCategory = await subCategorySrv.getById(data.subCategory);
  }
  return transactionData;
};

const calculateAmount = data => data.map(row => parseFloat(row.amount)).reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  0,
);

router.get("/", async (req, res, next) => {
  try {
    const transactions = await plannedTransactionSrv.getAllByUser(req.user.id);
    const categories = await categorySrv.getAll(req.user.id);
    const accounts = await accountSrv.getAllByUser(req.user.id);
    let income = 0;
    let outcome = 0;
    for (const transaction of transactions.rows) {
      if (transaction.type === TransactionType.EXPECTED_EXPENSE) {
        outcome += calculateAmount(transaction.data);
      } else if (transaction.type === TransactionType.EXPECTED_INCOME) {
        income += calculateAmount(transaction.data);
      }
    }
    const data = {
      transactions,
      categories,
      accounts,
      outcome,
      income,
      user: req.user,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.plannedTransactionList(data);
    res.render("generic", {navbar, data, content, components: ["plannedtransactionlist"]});
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    const data = await prepareCategoryData(req.body);
    await plannedTransactionSrv.create(req.user.id, data);
    res.redirect(SEE_OTHER, "/planned-transaction");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const data = await prepareCategoryData(req.body);
    await plannedTransactionSrv.update(req.params.id, data);
    res.redirect(SEE_OTHER, "/planned-transaction");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});
router.get(
  "/:id/delete",
  async (req, res, next) => {
    try {
      await plannedTransactionSrv.delete(req.params.id);
      res.redirect(SEE_OTHER, "/planned-transaction");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

module.exports = router;
