const express = require("express");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const accountSrv = require("../services/account");
const renderSrv = require("../services/render.js");
const categorySrv = require("../services/category.js");
const subCategorySrv = require("../services/subcategory.js");
const transactionSrv = require("../services/transaction.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");

const router = express.Router();

router.use(authMid.strict);

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
    for (const data of req.body.data) {
      data.category = await categorySrv.getById(data.category);
      data.subCategory = await subCategorySrv.getById(data.subCategory);
    }
    await transactionSrv.create(req.user.id, req.body);
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

module.exports = router;
