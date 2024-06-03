const express = require("express");
const loggerMid = require("../middlewares/logger.js");
const authMid = require("../middlewares/user.js");

const {testConnexion} = require("../models/index.js");
const cookieOptions = require("../services/cookie.js");
const renderSrv = require("../services/render.js");
const shortLinkSrv = require("../services/shortlink.js");
const tokenSrv = require("../services/token.js");
const userSrv = require("../services/user.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");

const router = express.Router();

router.use((req, res, next) => {
  res.locals = res.locals || {};
  res.locals.nonce = req.header("x-csp-nonce");
  next();
});

router.get("/login", (req, res, next) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const data = renderSrv.userLogin({
      passwordChanged: req.query.passwordChanged === "true",
      query: query ? `?${query}` : "",
    });

    res.render("login_society", {data});
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.get("/register", (req, res) => {
  const data = renderSrv.userRegister();

  res.render("login_society", {data});
});

router.post("/register", async (req, res, next) => {
  try {
    await userSrv.create(req.body);
    res.redirect(SEE_OTHER, "/");
  } catch (e) {
    return next(e);
  }
});

router.post("/login", loggerMid(["email"]), async (req, res, next) => {
  try {
    const user = await userSrv.login(req.body);
    const token = tokenSrv.user(user);
    res.cookie("token", token, cookieOptions);

    res.redirect(SEE_OTHER, "/");
  } catch (e) {
    return next(e);
  }
});

router.use(authMid.strict);
/* GET home page. */
router.get("/", (req, res) => {
  const data = {};

  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.homepage(data);
  res.render("generic", {navbar, data, content, components: ["homepage"]});
});

router.get("/logout", async (req, res, next) => {

});

router.get("/hello", async (req, res) => {
  const db = await testConnexion();
  res.json({app: "ok", db});
});

router.get("/status", async (req, res) => {
  const status = await testConnexion();
  res.json({status});
});

router.use(authMid.strict);
router.use("/account", require("./account.js"));
router.use("/transaction", require("./transaction.js"));
router.use("/transfer", require("./transfer.js"));
router.use("/planned-transaction", require("./planned-transaction.js"));
router.use("/settings", require("./settings/index.js"));
router.use("/api", require("./api.js"));

module.exports = router;
