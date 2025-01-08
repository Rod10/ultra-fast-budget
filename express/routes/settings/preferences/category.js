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
const searchMid = require("../../../middlewares/search.js");

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

const newFile = upload.fields([{name: "icon", maxCount: 1}]);

router.get("/list", searchMid.getPagination, searchMid.cookie, async (req, res) => {
  const query = req.parsedQuery;

  const cookie = req.parsedSearchCookie;
  if (!cookie.categories) cookie.categories = {};
  searchMid.setCookie(res, cookie);

  const categories = await categorySrv.search(req.user.id, req.parsedQuery);
  const data = {
    query,
    categories,
  };

  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.categoryList(data);

  res.render("generic", {navbar, data, content, components: ["categorylist"]});
});

router.post(
  "/new",
  loggerMid(["_"]),
  newFile,
  async (req, res, next) => {
    try {
      const {user} = req;

      await categorySrv.create(user, req.body, req.files.icon);

      res.redirect(SEE_OTHER, "list");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

router.post(
  "/:id/create-sub-category",
  loggerMid(["_"]),
  newFile,
  async (req, res, next) => {
    try {
      const {user} = req;
      const category = await categorySrv.getById(req.params.id);
      await subCategoriesSrv.create(user, category.id, req.body, req.files.icon);

      res.redirect(SEE_OTHER, "../list");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

router.post(
  "/:id/edit",
  loggerMid(["_"]),
  newFile,
  async (req, res, next) => {
    try {
      const {user} = req;
      const category = await categorySrv.getById(req.params.id);
      const data = req.body;
      await categorySrv.edit(category, user, data, req.files.icon);
      res.redirect(SEE_OTHER, "../list");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

router.get(
  "/:id/delete",
  newFile,
  async (req, res, next) => {
    try {
      await categorySrv.delete(req.params.id);
      res.redirect(SEE_OTHER, "../list");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

router.post(
  "/sub-category/:id/edit",
  loggerMid(["_"]),
  newFile,
  async (req, res, next) => {
    try {
      const {user} = req;
      const category = await subCategoriesSrv.getById(req.params.id);
      const data = req.body;
      await subCategoriesSrv.edit(category, user, data, req.files.icon);
      res.redirect(SEE_OTHER, "../../list");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

router.get(
  "/sub-category/:id/delete",
  newFile,
  async (req, res, next) => {
    try {
      await subCategoriesSrv.delete(req.params.id);
      res.redirect(SEE_OTHER, "../../list");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

router.get("/search", searchMid.getPagination, searchMid.cookie, async (req, res, next) => {
  try {
    const query = req.parsedQuery;

    const cookie = req.parsedSearchCookie;
    if (!cookie.categories) cookie.categories = {};
    searchMid.setCookie(res, cookie);

    const result = await categorySrv.search(req.user.id, query);
    return res.json({
      count: result.count,
      rows: result.rows,
    });
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

module.exports = router;
