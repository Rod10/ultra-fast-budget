const express = require("express");
const authMid = require("../../middlewares/user.js");

const portfolioSrv = require("../../services/portfolio.js");
const renderSrv = require("../../services/render.js");
const stockSrv = require("../../services/stock.js");

const router = express.Router();

router.use(authMid.strict);
router.get("/", async (req, res, next) => {
  const portfolios = await portfolioSrv.getAll(req.user.id);
  const stocks = await stockSrv.get(req.user.id);
  const data = {
    portfolios,
    stocks,
  };
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.stockOrder(data);
  res.render("generic", {navbar, data, content, components: ["order"]});
});

router.get("/get-portfolio-data", async (req, res, next) => {
  const portfolio = await portfolioSrv.getById(req.user.id, req.query.id);
  const stocks = await stockSrv.get(req.user.id, portfolio.rows[0].id);
  const decide = portfolio.rows[0].needDecide ? await stockSrv.getData(portfolio.rows[0], stocks.rows) : {};
  console.log("decide", decide);
  res.json({decide});
});

router.get("/get-simulation", async (req, res, next) => {
  const portfolio = await portfolioSrv.getById(req.user.id, req.query.portfolioId);
  const stocksToBought = req.query.stocksToBought;
  res.json({simulation: {}});
});

module.exports = router;
