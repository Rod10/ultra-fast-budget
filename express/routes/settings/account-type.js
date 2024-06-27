const express = require("express");
// const loggerMid = require("../../middlewares/logger.js");
const authMid = require("../../middlewares/user.js");

const accountTypeSrv = require("../../services/accounttype.js");
const renderSrv = require("../../services/render.js");
const {logger} = require("../../services/logger.js");
const {SEE_OTHER} = require("../../utils/error");
// const {SEE_OTHER} = require("../../utils/error.js");

const router = express.Router();

router.use(authMid.strict);
router.get("/", async (req, res) => {
  const {user} = req;
  const accountTypes = await accountTypeSrv.getAllByUser(user.id);

  const data = {
    accountTypes,
    user,
  };

  const navbar = renderSrv.navbar(res.locals);
  const content = renderSrv.accountTypeList(data);
  res.render("generic", {navbar, data, content, components: ["accounttypelist"]});
});

router.post("/new", async (req, res, next) => {
  try {
    const {user} = req;
    await accountTypeSrv.create(user.id, req.body);
    res.redirect(SEE_OTHER, "/account-type");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

module.exports = router;
