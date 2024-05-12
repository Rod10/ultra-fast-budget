const express = require("express");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const accountSrv = require("../services/account.js");
const renderSrv = require("../services/render.js");
const {SEE_OTHER} = require("../utils/error.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/", async (req, res, next) => {
  try {
    const userAccount = await accountSrv.getAllByUser(req.user.id);
    const data = {
      userAccount,
      user: req.user,
    };
    const navbar = renderSrv.navbar(res.locals);
    const content = renderSrv.accountList(data);
    res.render("generic", {navbar, data, content, components: ["accountlist"]});
  } catch (e) {
    return next(e);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    await accountSrv.create(req.user.id, req.body);
    res.redirect(SEE_OTHER, "/account");
  } catch (e) {
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const account = await accountSrv.get(req.params.id);
    await accountSrv.updateData(req.user.id, account, req.body);
    res.redirect(SEE_OTHER, "/account");
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
