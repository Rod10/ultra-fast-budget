const express = require("express");
// const loggerMid = require("../../middlewares/logger.js");
const multer = require("multer");
const moment = require("moment");
const authMid = require("../../../middlewares/user.js");
const loggerMid = require("../../../middlewares/logger.js");

// const accountSrv = require("../../services/account.js");
const categorySrv = require("../../../services/category.js");
const subCategoriesSrv = require("../../../services/subcategory.js");
const renderSrv = require("../../../services/render.js");
const {logger} = require("../../../services/logger.js");
const {SEE_OTHER} = require("../../../utils/error.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/list", async (req, res, next) => {
  try {
    const categories = await categorySrv.getAll(req.user.id);
    const data = {categories};

    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.categoryList(data);

    res.render("generic", {navbar, data, content, components: ["categorylist"]});
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});
