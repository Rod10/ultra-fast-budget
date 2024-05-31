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

const router = express.Router();

router.use(authMid.strict);

const prepareCategoryData = async transactionData => {
  for (const data of transactionData.data) {
    data.category = await categorySrv.getById(data.category);
    data.subCategory = await subCategorySrv.getById(data.subCategory);
  }
  return transactionData;
};

router.get("/", async (req, res, next) => {
  try {
    const transaction = await plannedTransactionSrv.getAllByUser(req.user.id);
    const categories = await categorySrv.getAll(req.user.id);
    const accounts = await accountSrv.getAllByUser(req.user.id);
    const data = {
      transaction,
      categories,
      accounts,
      user: req.user,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.PlannedTransactionList(data);
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
    res.redirect(SEE_OTHER, "/transaction");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const data = await prepareCategoryData(req.body);
    await plannedTransactionSrv.update(req.params.id, data);
    res.redirect(SEE_OTHER, "/transaction");
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
      res.redirect(SEE_OTHER, "../list");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

module.exports = router;
