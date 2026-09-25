const express = require("express");
const authMid = require("../../middlewares/user.js");

const portfolioSrv = require("../../services/portfolio.js");
const renderSrv = require("../../services/render.js");
const stockSrv = require("../../services/stock.js");
const searchMid = require("../../middlewares/search.js");

const router = express.Router();

router.use(authMid.strict);
router.get("/", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  const query = req.parsedQuery || {};
  // const data = stockSrv.getData();
  const portfolios = await portfolioSrv.getAll(req.user.id);
  const stocks = await stockSrv.get(req.user.id);
  const data = {
    query,
    portfolios,
    stocks,
    transactions: [],
  };
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.stockDashboard(data);
  res.render("generic", {navbar, data, content, components: ["dashboard"]});
});

router.get("/search", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  let portfolios;
  const data = {};
  if (req.parsedQuery.portfolio) {
    portfolios = await portfolioSrv.getById(req.user.id, req.parsedQuery.portfolio);
    if (portfolios.rows[0].needDecide) {
      const stocks = await stockSrv.get(req.user.id, portfolios.rows[0].id);
      data.decide = await stockSrv.getData(
        portfolios.rows[0],
        stocks.rows,
      );
    }
  } else {
    portfolios = await portfolioSrv.getAll(req.user.id);
  }
  data.portfolios = portfolios;
  data.stocks = await stockSrv.get(req.user.id, req.parsedQuery.portfolio);
  res.json(data);
});

router.get("/advance", async (req, res, next) => {
  const data = stockSrv.advance();
  res.json(data);
});

router.get("/reset", async (req, res, next) => {
  const data = stockSrv.reset();
  res.json(data);
});

router.get("/import-trading212", async (req, res, next) => {
  await stockSrv.importTrading212();
});

module.exports = router;
