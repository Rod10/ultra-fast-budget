const express = require("express");
const authMid = require("../../middlewares/user.js");

const portfolioSrv = require("../../services/portfolio.js");
const renderSrv = require("../../services/render.js");
const stockSrv = require("../../services/stock.js");
const searchMid = require("../../middlewares/search.js");

const router = express.Router();

router.use(authMid.strict);
router.get("/", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  const data = {};
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.stockDashboard(data);
  res.render("generic", {navbar, data, content, components: ["dashboard"]});
});

module.exports = router;
