const express = require("express");
const authMid = require("../../middlewares/user.js");

const transferSrv = require("../../services/transfer.js");
const {SEE_OTHER} = require("../../utils/error.js");
const {logger} = require("../../services/logger.js");
const renderSrv = require("../../services/render.js");
const stockSrv = require("../../services/stock.js");
const accountSrv = require("../../services/account.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/dashboard", async (req, res, next) => {
  // const data = stockSrv.getData();
  const portfolio = await accountSrv.getPortfolio(req.user.id);
  const data = {};
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.stockDashboard(data);
  res.render("generic", {navbar, data, content, components: ["dashboard"]});
});

router.get("/advance", async (req, res, next) => {
  const data = stockSrv.advance();
  res.json(data);
});

router.get("/reset", async (req, res, next) => {
  const data = stockSrv.reset();
  res.json(data);
});

module.exports = router;
