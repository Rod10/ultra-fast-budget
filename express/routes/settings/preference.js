const express = require("express");
// const loggerMid = require("../../middlewares/logger.js");
const authMid = require("../../middlewares/user.js");

// const accountSrv = require("../../services/account.js");
const renderSrv = require("../../services/render.js");
// const {SEE_OTHER} = require("../../utils/error.js");

const router = express.Router();

router.use(authMid.strict);
router.get("/", (req, res) => {
  const data = {};

  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.preference(res.locals);
  res.render("generic", {navbar, data, content, components: ["preference"]});
});

module.exports = router;
