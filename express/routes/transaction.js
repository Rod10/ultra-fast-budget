const express = require("express");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const TransactionTypes = require("../constants/transactiontype.js");

const accountSrv = require("../services/account.js");
const renderSrv = require("../services/render.js");
const categorySrv = require("../services/category.js");
const subCategorySrv = require("../services/subcategory.js");
const transactionSrv = require("../services/transaction.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const budgetSrv = require("../services/budget");

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
    const transaction = await transactionSrv.getAllByUser(req.user.id);
    const categories = await categorySrv.getAll(req.user.id);
    const accounts = await accountSrv.getAllByUser(req.user.id);
    const data = {
      transaction,
      categories,
      accounts,
      user: req.user,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.transactionList(data);
    res.render("generic", {navbar, data, content, components: ["transactionlist"]});
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    if (req.body.type === TransactionTypes.TRANSFER) {
      return res.redirect(SEE_OTHER, "/transaction");
    }
    const data = await prepareCategoryData(req.body);
    const transaction = await transactionSrv.create(req.user.id, data);
    await budgetSrv.updateAmount(req.user, transaction);
    res.redirect(SEE_OTHER, "/transaction");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const data = await prepareCategoryData(req.body);
    await transactionSrv.update(req.params.id, data);
    await budgetSrv.recalculate(req.user);
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
      await transactionSrv.delete(req.params.id);
      await budgetSrv.recalculate(req.user);
      res.redirect(SEE_OTHER, "/transaction");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

module.exports = router;
