const express = require("express");
const authMid = require("../middlewares/user.js");

const plannedTransferSrv = require("../services/plannedtransfer.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");
const renderSrv = require("../services/render.js");
const accountSrv = require("../services/account.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/list", async (req, res, next) => {
  try {
    const transfers = await plannedTransferSrv.getAllByUser(req.user.id);
    const accounts = await accountSrv.getAllByUser(req.user.id);
    const data = {
      transfers,
      accounts,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.plannedTransferList(data);
    res.render("generic", {navbar, data, content, components: ["plannedtransferlist"]});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    const data = req.body;
    await plannedTransferSrv.create(req.user.id, data);
    res.redirect(SEE_OTHER, "./list");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const data = req.body;
    await plannedTransferSrv.update(req.params.id, data);
    res.redirect(SEE_OTHER, "/account");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.get(
  "/:id/delete",
  async (req, res, next) => {
    try {
      await plannedTransferSrv.delete(req.params.id);
      res.redirect(SEE_OTHER, "/account");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

module.exports = router;
