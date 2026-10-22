const axios = require("axios");
const Decimal = require("decimal.js");

const moment = require("moment/moment");
const config = require("../utils/config.js");
const {
  Account,
  Portfolio,
  Stock,
} = require("../models/index.js");
const Constants = require("../constants/constants.js");
const OrderType = require("../constants/ordertype.js");

const {logger} = require("./logger.js");
const orderSrv = require("./order.js");
const portfolioSrv = require("./portfolio.js");
const lastReferenceSrv = require("./lastreference.js");

let simulation = {
  start:
}

const simulationSrv = {};

simulationSrv.simulate = () => {

};

module.exports = simulationSrv;
