const express = require("express");
const authMid = require("../../middlewares/user.js");
const searchMid = require("../../middlewares/search.js");

const portfolioSrv = require("../../services/portfolio.js");
const renderSrv = require("../../services/render.js");
const snapshotSrv = require("../../services/snapshot.js");
const moment = require("moment");

const router = express.Router();

router.use(authMid.strict);

router.get("/", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  const query = req.parsedQuery || {};
  query.year = new moment().year(2024).toString();
  const portfolios = await portfolioSrv.getAllByUser(req.user.id);
  const snapshot = await snapshotSrv.getByYear(query);
  const simulation = await snapshotSrv.simulate(req.user.id, snapshot, query);
  const data = {
    query,
    portfolios,
    simulation,
  };
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.simulation(data);
  res.render("generic", {navbar, data, content, components: ["simulation"]});
});

module.exports = router;
