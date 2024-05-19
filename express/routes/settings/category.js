const express = require("express");
// const loggerMid = require("../../middlewares/logger.js");
const authMid = require("../../middlewares/user.js");

// const accountSrv = require("../../services/account.js");
const categorySrv = require("../../services/category.js");
const subCategoriesSrv = require("../../services/subcategories.js");
const renderSrv = require("../../services/render.js");
const multer = require("multer");
const moment = require("moment");
const {logger} = require("../../services/logger.js");
const {SEE_OTHER} = require("../../utils/error.js");

const router = express.Router();

router.use(authMid.strict);

const Storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, (`data/${file.fieldname}`));
  },
  filename(req, file, cb) {
    const timestamp = moment().unix();
    cb(null, `${timestamp}_${file.originalname}`);
  },
});
const upload = multer({storage: Storage});

router.get("/list", async (req, res) => {
  const categories = await categorySrv.getAll(req.user.id);
  const data = {categories};

  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.categoryList(data);

  res.render("generic", {navbar, data, content, components: ["categorylist"]});
});

router.post("/new", upload.fields([{name: "icon", maxCount: 1}]), async (req, res, next) => {
  try {
    const {user} = req;

    await categorySrv.create(user, req.body, req.files.icon);

    res.redirect(SEE_OTHER, "/list");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/create-sub-category", upload.fields([{name: "icon", maxCount: 1}]), async (req, res, next) => {
  try {
    const {user} = req;
    const category = await categorySrv.getById(req.params.id);
    await subCategoriesSrv.create(user, category.id, req.body, req.files.icon);

    res.redirect(SEE_OTHER, "/list");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const {user} = req;
    const data = req.body;
    await categorySrv.edit(req.params.id, data);
  } catch (e) {
    logger.error(e);
    return next(e);
  }
})

module.exports = router;
