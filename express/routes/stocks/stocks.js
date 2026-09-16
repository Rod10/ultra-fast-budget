const express = require("express");
const authMid = require("../../middlewares/user.js");

const transferSrv = require("../../services/transfer.js");
const {SEE_OTHER} = require("../../utils/error.js");
const {logger} = require("../../services/logger.js");
const renderSrv = require("../../services/render");

const router = express.Router();

router.use(authMid.strict);

router.get("/dashboard", async (req, res, next) => {
  const data = {};
  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.stockDashboard(data);
  res.render("generic", {navbar, data, content, components: ["dashboard"]});
});

module.exports = router;
