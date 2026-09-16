const express = require("express");
const authMid = require("../middlewares/user.js");

const transferSrv = require("../services/transfer.js");
const {SEE_OTHER} = require("../utils/error.js");
const {logger} = require("../services/logger.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/dashboard", async (req, res, next) => {
  console.log("test");
});

module.exports = router;
