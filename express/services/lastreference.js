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

lastReferenceSrv.get = userId => {
  logger.debug("Get last References for user=[%s]", userId);
  return LastReference.findOne({where: {userId}});
};

lastReferenceSrv.update = (userId, data) => {
  logger.debug("Update last Reference for userId=[%s] with data=[%s]", userId, data);
  return LastReference.update(
    {
      dividend: data.lastDividendReference,
      order: data.lastOrderReference,
      transaction: data.lastTransactionReference,
    },
    {where: {userId}},
  );
};

module.exports = lastReferenceSrv;
