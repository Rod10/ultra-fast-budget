const express = require("express");
const authMid = require("../middlewares/user.js");

const renderSrv = require("../services/render.js");
const budgetSrv = require("../services/budget.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const categorySrv = require("../services/category.js");
const subCategorySrv = require("../services/subcategory.js");

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

router.post("/new", async (req, res, next) => {
  try {
    const {user} = req;
    const data = req.body;
    for (const row of req.body.data) {
      row.subCategory = await subCategorySrv.getById(row.subCategory);
    }

    await budgetSrv.create(user, data);
    res.redirect(SEE_OTHER, "/budget");
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

module.exports = router;
