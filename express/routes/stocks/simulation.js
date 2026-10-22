const express = require("express");
const authMid = require("../../middlewares/user.js");

const router = express.Router();

router.use(authMid.strict);

router.get("/", async (req, res, next) => {
  
})

module.exports = router;
