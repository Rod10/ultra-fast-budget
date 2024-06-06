const express = require("express");
const authMid = require("../middlewares/user.js");

const renderSrv = require("../services/render.js");
const budgetSrv = require("../services/budget.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const categorySrv = require("../services/category.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/", async (req, res, next) => {
  try {
    const budget = await budgetSrv.getAllByUser(req.user.id);
    const categories = await categorySrv.getAll(req.user.id);
    const data = {
      budget,
      categories,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.budgetList(data);
    res.render("generic", {navbar, data, content, components: ["budgetlist"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

module.exports = router;
