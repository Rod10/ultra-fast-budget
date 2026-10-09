const {LastReference} = require("../models/index.js");
const {logger} = require("./logger.js");

const lastReferenceSrv = {};

lastReferenceSrv.create = (userId, lastReference) => {
  logger.debug("Create LastReference for user=[%s] with data=[%s]", userId, lastReference);
  return LastReference.create({
    userId,
    dividend: lastReference.lastDividendReference,
    order: lastReference.lastOrderReference,
    transaction: lastReference.lastTransactionReference,
  });
};

module.exports = lastReferenceSrv;
