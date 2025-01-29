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

accountTypeSrv.createForNewUser = async user => {
  logger.info("Creating accountTypeSrv for new user=[%s]", user.id);
  for (const accountType of Object.values(AccountTypes)) {
    await accountTypeSrv.create(user.id, accountType);
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
    tag: data.tag,
    interest: data.interest,
    maxAmount: data.maxAmount,
    unit: data.unit,
  });
};

accountTypeSrv.getAllByUser = userId => {
  logger.debug("Get all Account Type for user=[%s]", userId);
  return AccountType.findAndCountAll({
    where: {
      userId,
      deletedOn: {[Op.eq]: null},
    },
  });
};

accountTypeSrv.getByType = (userId, type) => {
  logger.debug("Get all Account Type for user=[%s]", userId);
  return AccountType.findOne({where: {userId, type}});
};

accountTypeSrv.getById = (userId, id) => {
  logger.debug("Get Account Type=[%s] for user=[%s]", id, userId);
  return AccountType.findOne({
    where: {userId, id},
    include: [{association: AccountType.Account}],
  });
};

accountTypeSrv.delete = (userId, id) => {
  logger.debug("Delete Account Type=[%s] for user=[%]", id, userId);
  return AccountType.update(
    {deletedOn: new Date()},
    {where: {userId, id}},
  );
};

module.exports = accountTypeSrv;
