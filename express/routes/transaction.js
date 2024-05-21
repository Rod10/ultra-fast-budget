const express = require("express");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const renderSrv = require("../services/render.js");
const transactionSrv = require("../services/transaction.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/", async (req, res, next) => {
  try {
    const transaction = await transactionSrv.getAllByUser(req.user.id);
    const data = {
      transaction,
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
