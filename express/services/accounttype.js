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
  logger.debug("Get all Account Type for user=[%s] and type=[%s]", userId, type);
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

accountTypeSrv.update = (userId, accountTypeId, accountType) => {
  logger.debug("Update Account Type=[%s] for user=[%s]", accountTypeId, userId);
  return AccountType.update(
    {
      name: accountType.name,
      type: accountType.type,
      color: accountType.color,
      tag: accountType.tag,
      interest: accountType.interest,
      maxAmount: accountType.maxAmount,
      unit: accountType.unit,
    },
    {where: {id: accountTypeId, userId}},
  );
};

module.exports = accountTypeSrv;
