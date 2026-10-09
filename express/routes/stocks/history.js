const express = require("express");
const authMid = require("../../middlewares/user.js");
const searchMid = require("../../middlewares/search.js");

const portfolioSrv = require("../../services/portfolio.js");
const renderSrv = require("../../services/render.js");
const orderSrv = require("../../services/order.js");
const stockSrv = require("../../services/stock.js");

const router = express.Router();

router.use(authMid.strict);
router.get("/", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  const query = req.parsedQuery || {};
  const portfolios = await portfolioSrv.getAll(req.user.id);
  const stocks = await stockSrv.getAll(req.user.id);
  const orders = await orderSrv.getAll(req.user.id, query);
  const data = {
    query,
    portfolios,
    orders,
    stocks,
  };
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.orderList(data);
  res.render("generic", {navbar, data, content, components: ["orderlist"]});
});

module.exports = router;
