const express = require("express");
const authMid = require("../middlewares/user.js");

const categorySrv = require("../services/category.js");
const graphSrv = require("../services/graph.js");
const renderSrv = require("../services/render.js");
const transactionSrv = require("../services/transaction.js");
const {logger} = require("../services/logger.js");

const {SEE_OTHER} = require("../utils/error.js");
const accountSrv = require("../services/account.js");
const searchMid = require("../middlewares/search");

const router = express.Router();

router.use(authMid.strict);

const calculateAmount = data => data.map(row => parseFloat(row.amount)).reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  0,
);

router.get("/category", async (req, res, next) => {
  try {
    const graphs = {};
    const categories = await categorySrv.getAll(req.user.id);
    graphs["allCategories"] = await graphSrv.categories(req.user);
    for (const category of categories.rows) {
      graphs[category.name] = await graphSrv.byCategory(req.user, category);
    }
    const data = {graphs};
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.categories(data);
    res.render("generic", {navbar, data, content, components: ["categories"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/forecasts", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const query = req.parsedQuery;

    const cookie = req.parsedSearchCookie;
    if (!cookie.forecasts) cookie.forecasts = {};
    cookie.forecasts = query;
    searchMid.setCookie(res, cookie);

    const user = req.user;
    const accounts = await accountSrv.getAllByUser(user.id);
    const graphs = {};
    graphs["allForecast"] = await graphSrv.allAccountsForecast(user, query);

    for (const account of accounts.rows) {
      graphs[account.type] = await graphSrv.accountForecast(user, account, query);
    }
    console.log(query);
    const data = {query, graphs};
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.forecast(data);
    res.render("generic", {navbar, data, content, components: ["forecast"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/search", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const {user} = req;
    let query = req.parsedQuery;

    const cookie = req.parsedSearchCookie;
    if (!cookie.forecasts) cookie.forecasts = {};
    cookie.forecasts = query;
    searchMid.setCookie(res, cookie);

    if (query.unit && query.number && query.type) {
      const accounts = await accountSrv.getAllByUser(user.id);
      const graphs = {};
      graphs["allForecast"] = await graphSrv.allAccountsForecast(user, query);

      for (const account of accounts.rows) {
        graphs[account.type] = await graphSrv.accountForecast(user, account, query);
      }
      const data = {query, graphs};
      const navbar = renderSrv.navbar(res.locals);
      const content = renderSrv.forecast(data);
      res.render("generic", {navbar, data, content, components: ["forecast"]});
    }
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

module.exports = router;
