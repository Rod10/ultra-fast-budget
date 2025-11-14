const express = require("express");
const authMid = require("../middlewares/user.js");

const transferSrv = require("../services/transfer.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");

const router = express.Router();

router.use(authMid.strict);

router.post("/new", async (req, res, next) => {
  try {
    const data = req.body;
    await transferSrv.create(req.user.id, data);
    res.redirect(SEE_OTHER, "/account");
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const data = req.body;
    await transferSrv.update(req.params.id, data);
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
      await transferSrv.delete(req.params.id);
      res.redirect(SEE_OTHER, "/account");
    } catch (e) {
      logger.error(e);
      return next(e);
    }
  },
);

module.exports = router;
