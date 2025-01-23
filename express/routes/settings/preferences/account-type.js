const express = require("express");
// const loggerMid = require("../../middlewares/logger.js");
const authMid = require("../../../middlewares/user.js");

const accountTypeSrv = require("../../../services/accounttype.js");
const renderSrv = require("../../../services/render.js");
const {logger} = require("../../../services/logger.js");
const {SEE_OTHER, OK} = require("../../../utils/error.js");

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
    res.redirect(SEE_OTHER, "/settings/preferences/account-type");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/delete", async (req, res, next) => {
  try {
    const accountType = await accountTypeSrv.getById(req.user.id, req.params.id);
    const accountBalanceIsZero = accountType.account.filter(account => account.balance !== 0).length === 0;
    console.log(accountBalanceIsZero);
    if (accountBalanceIsZero) {
      await accountTypeSrv.delete(req.user.id, accountType.id);
      const {user} = req;
      const accountTypes = await accountTypeSrv.getAllByUser(user.id);
      return res.json({accountTypes});
    } else {
      const accountList = accountType.account.filter(account => account.balance !== 0);
      let error = "";
      for (const account of accountList) {
        error += `- ${account.name}\r\n`;
      }
      return res.json({status: "ERROR", error: `Le/Les compte(s) suivant(s) ont un solde supérieur à zéro:\r\n ${error}`});
    }
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

module.exports = router;
