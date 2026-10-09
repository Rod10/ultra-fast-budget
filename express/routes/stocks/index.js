const express = require("express");
const authMid = require("../../middlewares/user.js");

const router = express.Router();

router.use(authMid.strict);
router.use("/dashboard", require("./dashboard.js"));
router.use("/order", require("./order.js"));
router.use("/history", require("./history.js"));

module.exports = router;
