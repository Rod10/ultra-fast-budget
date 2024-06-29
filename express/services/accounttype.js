const assert = require("assert");

const {
  sequelize,
  Sequelize,
  AccountType,
  Op,
} = require("../models/index.js");
const AccountTypes = require("../constants/accountstypefull.js");
const {logger} = require("./logger.js");

const accountTypeSrv = {};

accountTypeSrv.createForNewUser = async userId => {
  logger.info("Creating accountTypeSrv for new user=[%s]", userId);
  for (const accountType of Object.values(AccountTypes)) {
    await accountTypeSrv.create(1, accountType);
  }
};

accountTypeSrv.create = (userId, data) => {
  logger.debug("Create accountType with data=[%s] for user=[%s]", data, userId);
  // if (AccountsTypeFull[data.type].maxAmount !== 0) {
  //   assert(parseInt(data.initialBalance, 10) <= AccountsTypeFull[data.type].maxAmount, "Initial balance cannot be more than the maximum amount allowed");
  // }

  return AccountType.create({
    userId,
    name: data.name,
    type: data.type,
    color: data.color,
    className: data.className,
    interest: data.interest,
    maxAmount: data.maxAmount,
    unit: data.unit,
  });
};

accountTypeSrv.getAllByUser = userId => {
  logger.debug("Get all Account Type for user=[%s]", userId);
  return AccountType.findAndCountAll({where: {userId}});
};

module.exports = accountTypeSrv;