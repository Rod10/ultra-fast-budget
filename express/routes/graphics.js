const express = require("express");
const authMid = require("../middlewares/user.js");

const categorySrv = require("../services/category.js");
const graphSrv = require("../services/graph.js");
const renderSrv = require("../services/render.js");
const {logger} = require("../services/logger.js");

const accountSrv = require("../services/account.js");
const searchMid = require("../middlewares/search.js");

const router = express.Router();

router.use(authMid.strict);

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
    let query = req.parsedQuery;
    if (!query?.unit || !query?.type || !query?.number) {
      query = {
        ...query,
        unit: "year",
        number: 2,
        type: "planned",
      };
    }
    const cookie = req.parsedSearchCookie;
    if (!cookie.forecasts) cookie.forecasts = {};
    cookie.forecasts = query;
    searchMid.setCookie(res, cookie);

    const user = req.user;
    const accounts = await accountSrv.getAllByUser(user.id);
    const graphs = {};
    const resultGraphs = await graphSrv.allAccountsForecast(user, query);
    graphs["allForecast"] = resultGraphs.allForecast;

    for (const account of accounts.rows) {
      graphs[account.accountType.name] = resultGraphs[account.accountType.name];
    }

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
    const query = req.parsedQuery;

    const cookie = req.parsedSearchCookie;
    if (!cookie.forecasts) cookie.forecasts = {};
    cookie.forecasts = query;
    searchMid.setCookie(res, cookie);

    if (query.unit && query.number && query.type) {
      const accounts = await accountSrv.getAllByUser(user.id);
      const graphs = {};
      const resultGraphs = await graphSrv.allAccountsForecast(user, query);
      graphs["allForecast"] = resultGraphs.allForecast;

      for (const account of accounts.rows) {
        graphs[account.accountType.name] = resultGraphs[account.accountType.name];
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
