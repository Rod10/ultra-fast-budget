const express = require("express");
const moment = require("moment");
const authMid = require("../middlewares/user.js");

const renderSrv = require("../services/render.js");
const budgetSrv = require("../services/budget.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const categorySrv = require("../services/category.js");
const subCategorySrv = require("../services/subcategory.js");
const searchMid = require("../middlewares/search.js");
const transactionSrv = require("../services/transaction.js");

const router = express.Router();

router.use(authMid.strict);

const groupByDaysTransaction = data => {
  const days = Array.from({
    length: new moment()
      .daysInMonth(),
  }, () => []);
  if (data.length > 0) {
    for (const transaction of data) {
      days[new moment(transaction.transactionDate).date() - 1].push(transaction);
    }
  }
  return days.reverse();
  // return days.filter(day => day.length > 0);
};

router.get("/", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const query = req.parsedQuery || {};
    const budgets = await budgetSrv.getAllByUser(req.user.id);
    // find all transactions that don't have the category of a budget
    const categoriesInBudget = [];
    for (const budget of budgets.rows) {
      categoriesInBudget.push(budget.categoryId);
    }
    let transactionNotInBudget = await transactionSrv.getAllByUserAndNotInCategory(req.user.id, categoriesInBudget, {unit: "month"});
    transactionNotInBudget = groupByDaysTransaction(transactionNotInBudget.rows);
    const categories = await categorySrv.getAll(req.user.id);
    const data = {
      budgets,
      categories,
      query,
      transactionNotInBudget,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.budgetList(data);
    res.render("generic", {navbar, data, content, components: ["budgetlist"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    const {user} = req;
    const data = req.body;
    for (const row of req.body.data) {
      row.amount = 0;
      row.subCategory = await subCategorySrv.getById(row.subCategory);
    }

    await budgetSrv.create(user, data);
    res.redirect(SEE_OTHER, "/budget");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const oldBudget = await budgetSrv.get(req.params.id);
    const newBudget = req.body;
    for (const row of newBudget.data) {
      row.amount = 0;
      row.subCategory = await subCategorySrv.getById(row.subCategory);
    }
    await budgetSrv.update(oldBudget, newBudget);
    res.redirect(SEE_OTHER, "/budget");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/:id/delete", async (req, res, next) => {
  try {
    await budgetSrv.delete(req.params.id);
    res.redirect(SEE_OTHER, "/budget");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/rebalance-all", async (req, res, next) => {
  try {
    await budgetSrv.recalculate(req.user);
    res.redirect(SEE_OTHER, "/budget");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/search", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const query = req.parsedQuery || {};
    const budget = await budgetSrv.search(req.user, query);
    res.json({
      count: budget.count,
      rows: budget.rows,
    });
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

module.exports = router;
