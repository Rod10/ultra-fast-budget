const express = require("express");
const authMid = require("../middlewares/user.js");

const renderSrv = require("../services/render.js");
const budgetSrv = require("../services/budget.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const categorySrv = require("../services/category.js");
const subCategorySrv = require("../services/subcategory.js");
const searchMid = require("../middlewares/search.js");
const transactionSrv = require("../services/transaction");

const router = express.Router();

router.use(authMid.strict);

router.get("/", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const query = req.parsedQuery || {};
    const budget = await budgetSrv.getAllByUser(req.user.id);
    const categories = await categorySrv.getAll(req.user.id);
    const data = {
      budget,
      categories,
      query,
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
    console.log(req.query);
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

module.exports = router;
