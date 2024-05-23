const express = require("express");

const config = require("../utils/config.js");

const {logger} = require("../services/logger.js");
const axios = require("axios");

const router = express.Router();

router.get("/currency-rate", (req, res, next) => {
  try {
    axios.get(`https://v6.exchangerate-api.com/v6/${config["exchangerate-api"].apiKey}/latest/${req.query.currency}`)
      .then(response => console.log(response))
      .catch(err => {
        logger.error(err);
        return next(err);
      });
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

module.exports = router;
